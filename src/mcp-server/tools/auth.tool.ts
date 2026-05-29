/**
 * @fileoverview 认证相关 MCP Tools
 * - show_login_form: 展示登录 UI (MCP App)
 * - wait_for_login: 展示登录 UI 后轮询等待用户完成登录（推荐，替代 show_login_form + check_login_status 手动流程）
 * - verify_credentials: 验证登录凭据 (前端登录接口)
 * - check_login_status: 检查当前登录状态
 * - get_rate_limit_status: 查看 QPS 限速状态
 *
 * @note 推荐登录流程:
 *   wait_for_login(timeout=30) → 阻塞等待用户在 UI 完成登录 → 自动返回成功 → 继续后续任务
 *   无需用户手动发"继续"消息触发 check_login_status
 *
 * @note 纠正(46次):
 *   - show_login_form 去除 _meta.ui.resourceUri（原因：与 wait_for_login 同时被调用时会打开两个登录窗口）
 *   - wait_for_login 添加 in-progress 防重入（原因：AI 并发调用会打开多个登录窗口）
 *   - Codex/CLI 场景：两个工具均无法渲染 UI，AI 应直接使用 verify_credentials
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { createHash } from 'crypto';
import { getEnvConfig } from '../../config/env.js';
import {
  createSession,
  getSession,
  isSessionValid,
  clearSession,
  ensureAccessToken,
  setSessionDirect,
} from '../../auth/session.js';
import { getContextApiKey, getDirectTokenContext } from '../../auth/api-key-context.js';
import { rateLimiter } from '../../api-client/rate-limiter.js';

/**
 * @description MD5 哈希
 * @note 参考 cj-web-egg mycj/src/provider/commonjs/login.js 的密码加密规则
 * 加密流程: md5(md5(password) + timestamp)
 */
function md5(str: string): string {
  return createHash('md5').update(str).digest('hex');
}

/**
 * @note 纠正(46次): 防止 wait_for_login 被并发重复调用时打开多个登录窗口。
 * 当 waitForLoginInProgress=true 时，后续调用立即返回"进行中"提示，避免多个窗口同时弹出。
 */
let waitForLoginInProgress = false;

/**
 * @note 纠正(72次): 单调递增序列号，配合时间戳共同生成唯一的登录 UI resourceUri。
 * 使用 Date.now() 提供可读时间戳，使用序列号防止同毫秒内重复。
 */
let loginUriSeq = 0;

export const authTools: Tool[] = [
  {
    name: 'show_login_form',
    description: [
      '展示CJ Dropshipping登录引导信息（仅返回文字，不弹出UI窗口）。',
      '⚡ 若通过 /mcp/{apiKey} URL 配置接入，会直接返回"已自动认证"状态，无需登录。',
      '如需弹出登录界面（VS Code Copilot），请直接使用 wait_for_login。',
      '⚠️ Codex / 命令行 / ChatGPT / 无UI环境：请改用 verify_credentials 直接传入邮箱和密码登录。',
      'Show login guidance text only (no UI popup).',
      '⚡ If connected via /mcp/{apiKey} URL, returns auto-authenticated status immediately.',
      'For VS Code Copilot with UI, use wait_for_login.',
      '⚠️ Codex/CLI/ChatGPT: use verify_credentials with email+password instead.',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'verify_credentials',
    description: '验证用户登录凭据并建立会话。支持两种方式：1) email/loginName+password 前端登录 2) apiKey 直接获取OpenAPI token / Verify user credentials. Supports: 1) email/loginName+password frontend login 2) apiKey direct OpenAPI token exchange',
    inputSchema: {
      type: 'object' as const,
      properties: {
        loginName: { type: 'string', description: '登录邮箱或用户名（推荐）/ Login email or username (recommended)' },
        email: { type: 'string', description: '登录邮箱（兼容旧版）/ Login email (legacy, use loginName instead)' },
        password: { type: 'string', description: '登录密码 / Login password' },
        apiKey: { type: 'string', description: '(可选) CJ OpenAPI Key，提供后直接走 getAccessToken，跳过前端登录 / (Optional) CJ OpenAPI Key, skips frontend login' },
      },
      required: [],
    },
  },
  {
    name: 'check_login_status',
    description: [
      '检查当前登录状态和token有效期。',
      '⚡ 通过 /mcp/{apiKey} URL 配置接入时，会显示"已通过URL apiKey自动认证"。',
      'Check current login status and token validity.',
      '⚡ When connected via /mcp/{apiKey} URL, shows auto-authenticated status.',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_rate_limit_status',
    description: '查看API调用QPS限速状态 / View API call QPS rate limit status',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'logout',
    description: '登出当前账号，清除会话信息，方便切换其他账号重新登录 / Logout current account, clear session, switch to another account',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'wait_for_login',
    description: [
      '展示登录 UI 并轮询等待用户在 MCP Apps 界面完成登录。',
      '推荐登录流程（支持 MCP Apps 的客户端如 VS Code Copilot）：调用此工具，用户在弹出界面登录后自动继续。',
      '默认等待 30 秒；若超时，AI 应询问"是否已完成登录"，若是则调用 check_login_status 确认，否则再次调用 wait_for_login。',
      '⚠️ ChatGPT Web 场景：HTTP 连接超时限制较短，请使用默认 30 秒，超时后让用户告知已登录再调用 check_login_status。',
      '⚠️ Codex/CLI 无 UI 场景：请改用 verify_credentials 直接提供 loginName + password。',
      'Display login UI and poll until user logs in. Default timeout: 30s.',
      'On timeout: ask user if they completed login; if yes call check_login_status, otherwise call wait_for_login again.',
      'For Codex/CLI (no UI support): use verify_credentials with loginName + password instead.',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {
        timeout: {
          type: 'number',
          description: '等待超时时间（秒），默认 30 秒，HTTP 传输模式建议不超过 30 秒 / Timeout in seconds, default 30. Keep ≤30s for HTTP transport (ChatGPT Web)',
        },
      },
      required: [],
    },
    // _meta: {
    //   ui: {
    //     resourceUri: 'ui://cj-mcp/login',
    //   },
    // },
  },
];

/**
 * @note 新增(64次): 动态工具列表，当 waitForLoginInProgress=true 时移除 wait_for_login 的
 * _meta.ui.resourceUri，防止 MCP 客户端重新初始化时再次打开登录弹窗。
 * tools/index.ts 的 getToolsList() 每次请求都调用此函数，而不是使用缓存的静态列表。
 *
 * @note 纠正(72次): 每次调用都为 wait_for_login 注入唯一时间戳 resourceUri。
 * 问题根因：固定的 'ui://cj-mcp/login' URI 导致 VS Code Copilot 在同一对话中
 * 复用/更新已有的登录 UI 元素，而不是在当前回答位置创建新的登录 UI。
 * 修复方案：动态生成 'ui://cj-mcp/login?t=<timestamp>'，每次调用产生不同 URI，
 * Copilot 将其视为全新资源，在当前消息位置嵌入新的登录表单。
 * 对应 resources/index.ts 已更新为前缀匹配，支持带时间戳参数的 URI 读取。
 *
 * @note 纠正(Claude Desktop): 所有工具都注入 _meta.ui.resourceUri，确保 Claude Desktop
 * 识别为 MCP Apps UI 工具（即使只读工具也注入）。wait_for_login 始终有 _meta.ui，
 * 其他工具（show_login_form, verify_credentials, check_login_status）同样注入 _meta.ui。
 */
/**
 * @note 纠正(73次): getAuthTools() 现在只在未登录时为 wait_for_login / show_login_form
 * 注入 _meta.ui.resourceUri；check_login_status / logout / get_rate_limit_status / verify_credentials
 * 永远不注入 _meta.ui，避免 Cursor 在 tools/list 时误渲染登录 UI（即使已登录也会弹出）。
 * 登录状态由 handleAuthTool() 内部判断，返回相应的文字提示。
 */
const AUTH_LOGIN_UI_BASE = 'ui://cj-mcp/login';

export function getAuthTools(): Tool[] {
  const valid = isSessionValid();

  return authTools.map(tool => {
    // 只有 wait_for_login / show_login_form 需要 _meta.ui（展示登录 UI）
    // check_login_status / logout / get_rate_limit_status / verify_credentials 永远不注入
    // 否则 Cursor 在 tools/list 时就会渲染登录 UI，即使已登录也会弹出
    if (!valid && (tool.name === 'show_login_form')) {
      const uniqueUri = `${AUTH_LOGIN_UI_BASE}?t=${Date.now()}_${++loginUriSeq}`;
      return {
        ...tool,
        _meta: {
          ui: {
            resourceUri: uniqueUri,
          },
        },
      };
    }
    return tool;
  });
}

type AuthToolResult = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
  _meta?: Record<string, unknown>;
};

function buildLoginUiMeta(): Record<string, unknown> {
  // 使用唯一 URI，与 getAuthTools() 中的逻辑保持一致
  const uniqueUri = `${AUTH_LOGIN_UI_BASE}?t=${Date.now()}_${++loginUriSeq}`;
  return { ui: { resourceUri: uniqueUri } };
}

export async function handleAuthTool(
  name: string,
  args: Record<string, unknown>
): Promise<AuthToolResult> {
  switch (name) {
    case 'show_login_form':
      /**
       * @note 基础登录 UI 展示工具。推荐使用 wait_for_login 代替：
       * wait_for_login 会展示 UI 并自动轮询等待用户完成登录，无需用户手动发消息触发后续流程。
       *
       * @note 纠正(apiKey-URL): 当通过 /mcp/{apiKey} URL 接入时，ensureApiKeySession 已在
       * 请求到达前完成认证。此时直接返回认证成功状态，告知 AI 无需登录，可直接执行任务。
       */
      {
        const ctxApiKey = getContextApiKey();
        const directCtx = getDirectTokenContext();
        if (directCtx) {
          return {
            content: [{
              type: 'text',
              text: [
                `✅ 已通过 URL 直接 Token 认证，无需手动登录 / Auto-authenticated via URL token, no login required.`,
                ``,
                `👤 用户 / User: ${directCtx.userId}`,
                ``,
                `🚀 可直接执行任务，例如：查询订单、搜索商品等。`,
                `You can directly execute tasks such as: query orders, search products, etc.`,
                ``,
                `⚠️ 注意：Token 过期后需更新 ChatGPT 应用 URL 中的 token 内容。`,
                `Note: When token expires, update the token in your ChatGPT app URL.`,
              ].join('\n'),
            }],
          };
        }
        if (ctxApiKey && getSession()) {
          const session = getSession()!;
          const maskedKey = ctxApiKey.length > 12 ? `${ctxApiKey.slice(0, 12)}…` : ctxApiKey;
          return {
            content: [{
              type: 'text',
              text: [
                `✅ 已通过 URL ApiKey 自动完成认证，无需手动登录 / Auto-authenticated via URL apiKey, no login required.`,
                ``,
                `🔑 ApiKey: ${maskedKey}`,
                `👤 用户 / User: ${session.email}`,
                ``,
                `🚀 可直接执行任务，例如：查询订单、搜索商品等。`,
                `You can directly execute tasks such as: query orders, search products, etc.`,
              ].join('\n'),
            }],
          };
        }
      }
      return {
        content: [{
          type: 'text',
          text: [
            '🔐 登录表单已展示 / Login form displayed',
            '',
            '💡 推荐：调用 wait_for_login 可自动等待用户完成登录后继续任务，无需手动确认。',
            'Tip: Call wait_for_login to automatically wait for user login before proceeding.',
            '',
            '若已手动登录，请继续发消息，我将调用 check_login_status 确认后继续。',
            'If already logged in, send any message and I will verify via check_login_status.',
          ].join('\n'),
        }],
      };

    case 'verify_credentials':
      return await handleVerifyCredentials(args);

    case 'check_login_status':
      return handleCheckLoginStatus();

    case 'get_rate_limit_status':
      return handleRateLimitStatus();

    case 'logout':
      return handleLogout();

    case 'wait_for_login': {
      /**
       * @note 纠正(41次): 原默认 300s，HTTP transport 模式下（ChatGPT Web via ngrok）
       * 长连接容易触发 ngrok/ChatGPT 的 HTTP 超时（通常 30-60s），导致对话中断、AI 不继续执行。
       * 修复：默认改为 30s，超时后返回引导消息（不标记 isError），AI 可询问用户是否已登录再调用 check_login_status。
       *
       * @note 纠正(46次): 添加 in-progress 防重入。
       * 若 AI 并发调用 wait_for_login（例如重试或并发请求），多个调用会同时打开多个登录窗口。
       * 通过 waitForLoginInProgress 标志位限制同时只有一个轮询在运行。
       *
       * @note 纠正(Cursor MCP Apps): VS Code Copilot 从 tools/list 的 _meta.ui 渲染登录 UI；
       * Cursor 需要从 tools/call 返回结果的 _meta.ui 才能渲染 UI。
       * CJ_UI_IMMEDIATE=true 时立即返回 _meta，不阻塞轮询，避免 Cursor 等待超时后才显示界面。
       */

      if (isSessionValid()) {
        const session = getSession();
        const user = session?.loginName || session?.email || '已登录';
        return {
          content: [{
            type: 'text',
            text: [
              `✅ 已登录，无需重复登录 / Already logged in`,
              `用户 / User: ${user}`,
            ].join('\n'),
          }],
        };
      }

      const immediateUi = process.env.CJ_UI_IMMEDIATE === 'true' || (args as { wait?: boolean }).wait === false;
      if (immediateUi) {
        return {
          content: [{
            type: 'text',
            text: [
              '🔐 请在下方登录界面输入 CJ 账号密码完成登录。',
              '登录完成后告诉我，我会调用 check_login_status 确认并继续。',
              '',
              'Please log in using the form below.',
              'After login, let me know and I will call check_login_status to confirm.',
            ].join('\n'),
          }],
        };
      }

      if (waitForLoginInProgress) {
        return {
          content: [{
            type: 'text',
            text: [
              '🔄 登录等待已在进行中，请在已弹出的窗口中完成登录，完成后告知我即可。',
              'Login wait is already in progress. Please complete login in the existing window, then let me know.',
            ].join('\n'),
          }],
        };
      }

      waitForLoginInProgress = true;
      try {
        const timeoutSec = (args as { timeout?: number }).timeout ?? 30;
        const timeoutMs = timeoutSec * 1000;
        const pollIntervalMs = 2000;
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
          if (isSessionValid()) {
            const session = getSession();
            const user = session?.loginName || session?.email || '已登录';
            return {
              content: [{
                type: 'text',
                text: [
                  `✅ 登录成功，继续执行后续任务 / Login successful, proceeding`,
                  `用户 / User: ${user}`,
                ].join('\n'),
              }],
            };
          }
          await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        }

        return {
          content: [{
            type: 'text',
            text: [
              `⏰ 等待登录超时（${timeoutSec}秒）/ Login wait timed out (${timeoutSec}s)`,
              '',
              '📋 后续处理方式 / Next steps:',
              '1. 如果您已在弹出窗口完成登录，请告诉我，我会调用 check_login_status 确认后继续。',
              '   If you already logged in the popup, let me know and I will call check_login_status to confirm.',
              '2. 如果弹出窗口未出现（Codex/CLI 环境），请使用 verify_credentials 工具直接输入邮箱和密码。',
              '   If no popup appeared (Codex/CLI), use verify_credentials with loginName + password instead.',
              '3. 如需重新等待，可再次调用 wait_for_login。',
              '   To wait again, call wait_for_login again.',
            ].join('\n'),
          }],
          isError: false,
        };
      } finally {
        waitForLoginInProgress = false;
      }
    }

    default:
      return { content: [{ type: 'text', text: `Unknown auth tool: ${name}` }], isError: true };
  }
}

/**
 * @description 从 login 页面尝试获取 csrfToken cookie（最佳努力，非强制）
 * @note 纠正: 登录 API 需要 egg.js csrfToken 防 CSRF，需先 GET 页面获取
 * 参考用户验证 curl: cookie 中含 csrfToken=xxx
 * @note 纠正(40次): 原使用 redirect: 'manual'，导致生产环境 HTTPS 跳转时
 * Set-Cookie 头丢失（opaque redirect 响应无法读取 headers），csrfToken 始终为空。
 * 改为 redirect: 'follow' 跟随跳转，从最终页面响应中提取 csrfToken。
 * @note 纠正(补充登录方式): /userCenterForeignWeb/foreign/webLogin 是 foreign API，
 * 不受 egg.js CSRF 中间件保护，csrfToken 是可选的。
 * 若无法获取（本地 macOS 开发时域名可能不返回 cookie），直接返回空 cookies 继续登录。
 * 不再 throw，避免「无法获取 csrfToken」阻塞 VS Code Copilot UI 登录流程。
 */
async function fetchCsrfToken(loginApiBase: string): Promise<{ csrfToken: string; cookies: string }> {
  try {
    const resp = await fetch(`${loginApiBase}/login.html`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    const setCookies = resp.headers.getSetCookie?.() || [];
    const allCookies: string[] = [];
    let csrfToken = '';

    for (const sc of setCookies) {
      const nameVal = sc.split(';')[0];
      allCookies.push(nameVal);
      if (nameVal.startsWith('csrfToken=')) {
        csrfToken = nameVal.split('=')[1];
      }
    }

    // /foreign/webLogin 不需要 csrfToken，获取到则携带，获取不到也继续
    return { csrfToken, cookies: allCookies.join('; ') };
  } catch {
    // 网络不可达（如内网域名在本地开发环境）：跳过 csrfToken，继续登录
    return { csrfToken: '', cookies: '' };
  }
}

async function handleVerifyCredentials(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  /**
   * @note 纠正: 新增 loginName 参数支持用户名登录
   * loginName 优先级高于 email（email 保留作兼容旧调用）
   */
  const { loginName, email, password, apiKey } = args as { loginName?: string; email?: string; password?: string; apiKey?: string };
  // loginName 优先，email 作为备选（向后兼容）
  const effectiveLoginName = loginName || email;

  /**
   * @description apiKey 直登模式
   * @note 当提供 apiKey 时，直接调用 OpenAPI authentication/getAccessToken
   * 跳过前端 webLogin 流程，适用于已有 apiKey 的用户
   * 这是当前推荐的认证方式，后续前端登录也会逐步迁移到此方式
   */
  if (apiKey) {
    try {
      const session = await createSession(effectiveLoginName || 'apikey-user', apiKey);
      return {
        content: [{
          type: 'text',
          text: `✅ API Key 认证成功 / API Key authentication successful!\n` +
            `OpenID: ${session.openId}\n` +
            `Token有效期 / Token expires: ${session.accessTokenExpiry}\n` +
            `RefreshToken有效期 / RefreshToken expires: ${session.refreshTokenExpiry}`,
        }],
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: `API Key 认证失败 / API Key authentication failed: ${msg}` }],
        isError: true,
      };
    }
  }

  // 传统 email/loginName + password 前端登录模式
  if (!effectiveLoginName || !password) {
    return {
      content: [{ type: 'text', text: '请提供 email/loginName+password 或 apiKey / Please provide email/loginName+password or apiKey' }],
      isError: true,
    };
  }

  const config = getEnvConfig();

  try {
    /**
     * @description Step 0: 获取 csrfToken
     * @note 纠正: cj-web-egg 使用 egg.js CSRF 保护，登录请求必须携带 csrfToken cookie
     * 先 GET /login.html 获取 set-cookie 中的 csrfToken
     */
    const { csrfToken, cookies } = await fetchCsrfToken(config.loginApiBase);

    // Step 1: 调用前端登录接口
    // 参考 cj-web-egg mycj/src/provider/commonjs/login.js
    const loginUrl = `${config.loginApiBase}/userCenterForeignWeb/foreign/webLogin`;
    const timestamp = Date.now();
    const fingerToken = md5(String(timestamp) + effectiveLoginName);
    /**
     * @description 密码加密规则 (参考 cj-web-egg/mycj/src/provider/commonjs/login.js)
     * @note 纠正: 当传了 fingerToken 时，完整公式为:
     * md5(md5(password) + cloudflareToken + fingerToken + timestamp)
     * MCP 场景: cloudflareToken='' (非浏览器无 Turnstile)
     * 所以实际为: md5(md5(password) + '' + fingerToken + timestamp)
     */
    const encryptedPassword = md5(md5(password) + '' + fingerToken + String(timestamp));

    /**
     * @description 登录请求 Headers
     * @note 纠正: 必须包含以下字段才能通过后端校验:
     * - Cookie: csrfToken (egg.js CSRF)
     * - platform: 2 (CJ平台标识, 参考 login.js getLoginParams())
     * - cj-area: 000000 (区域码)
     * - Content-Type: application/json;charset=UTF-8
     * - User-Agent: 模拟浏览器
     * - Origin + Referer: 匹配域名
     */
    /**
     * @description 登录请求参数
     * @note 纠正: 请求参数需增加 mcpLogin: true 标识 MCP App 登录场景
     * fingerToken 使用固定值模拟（MCP环境无真实浏览器指纹）
     */
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        'Origin': config.loginApiBase,
        'Referer': `${config.loginApiBase}/login.html?type=quickly`,
        'Cookie': cookies || `csrfToken=${csrfToken}`,
        'platform': '2',
        'cj-area': '000000',
        'token': '',
      },
      body: JSON.stringify({
        loginName: effectiveLoginName,
        password: encryptedPassword,
        timestamp,
        newEncryptVersion: true,
        toUser: false,
        facebookId: '',
        googleId: '',
        appleId: '',
        fingerToken,
        mcpLogin: true,
      }),
    });

    /**
     * @note 纠正(40次): 在解析 JSON 前检查 Content-Type。
     * 若服务器返回 HTML（如 CSRF 校验失败、内网域名返回错误页），
     * 直接 .json() 会抛出 SyntaxError: Unexpected token '<'...
     * 增加检查后可给出更明确的错误原因，引导用户使用正确环境。
     */
    const contentType = loginResponse.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const rawText = await loginResponse.text();
      throw new Error(
        `登录API返回非JSON响应 (HTTP ${loginResponse.status}, Content-Type: ${contentType})。\n` +
        `响应片段: ${rawText.substring(0, 200)}\n\n` +
        `根因: CJ_ENV=${config.env}，loginApiBase=${config.loginApiBase}\n` +
        `解决方案: 使用 CJ_ENV=production 启动服务器（生产域名 https://www.cjdropshipping.com）`
      );
    }

    /**
     * @note 纠正(支持多种登录方式): 补充完整的 webLogin 响应类型定义
     * 参考 26年05月15日 10:56:55 第23次提交 curl 和实际返回字段:
     * - accessToken: 完整 JWT (USR@CJxxx@L0@CJ:eyJ...)，供后续接口使用的主 token
     * - id: 用户 UUID 字符串（如 "a0ab5c31ec2d4ea4981ddd8a0d2f994c"）
     * - num: CJ 号字符串（如 "CJ620569"）
     * - expireTime: token 过期时间（毫秒时间戳，可为数字或字符串）
     * - extra.email: 实际登录邮箱（优先级高于顶层 email 字段）
     * @note 纠正(补充登录方式): accessToken 是实际生产接口返回的主 token 字段
     * token/cjLoginToken 是兼容字段，优先级低于 accessToken
     */
    const loginData = await loginResponse.json() as {
      code: number;
      success: boolean;
      message: string;
      data?: {
        /** 完整 JWT token，供后续 OpenAPI 接口使用（优先级最高） */
        accessToken?: string;
        /** CJ 前端 token（兼容字段，优先级低于 accessToken） */
        token?: string;
        /** MCP 登录 token（兼容字段） */
        cjLoginToken?: string;
        apiKey?: string;
        /** 用户 UUID 字符串（如 "a0ab5c31ec2d4ea4981ddd8a0d2f994c"） */
        id?: string | number;
        /** CJ 号（如 "CJ620569"，字符串格式） */
        num?: string | number;
        /** token 过期时间（毫秒时间戳，可为字符串或数字） */
        expireTime?: string | number;
        /** 用户账号信息（嵌套对象，extra.email 为真实邮箱） */
        extra?: {
          email?: string;
          nickName?: string;
          headImg?: string;
          [key: string]: unknown;
        };
        userId?: string;
        email?: string;
        nickName?: string;
      };
    };

    if (!loginData.success || loginData.code !== 200) {
      /**
       * @description 登录错误码映射
       * @note 纠正: 后端对某些错误码返回通用 message("The server is dozing")
       * 前端需自行映射为用户友好提示 (参考 CjProductDetail 中 case 300006)
       * @note 纠正(62次): 登录失败时明确告知 AI 不要重新调用 wait_for_login/show_login_form，
       * 否则 _meta.ui.resourceUri 会触发第二个登录弹窗。
       * 应直接让用户在已打开的登录窗口中重试，或再次调用 verify_credentials 提供正确密码。
       */
      /**
       * @note 纠正(支持多种登录方式): 补充 code:803（mcpLogin 未开通）错误码映射
       * code:803 表示该账号未开通 mcpLogin 权限，需联系 CJ 客服开通
       */
      const errorMessages: Record<number, string> = {
        300006: '账号或密码错误 / Incorrect account or password',
        300003: '该邮箱未注册 / This email has not been registered',
        300001: '账号已被锁定 / Account has been locked',
        803: 'mcpLogin 权限未开通，请联系 CJ 客服开通 MCP 登录权限 / mcpLogin not authorized, please contact CJ support to enable MCP login',
      };
      const friendlyMsg = errorMessages[loginData.code] || loginData.message;
      return {
        content: [{ type: 'text', text: [
          `登录失败 / Login failed: ${friendlyMsg} (code: ${loginData.code})`,
          '',
          '⚠️ 请勿再次调用 wait_for_login 或 show_login_form（会打开额外的登录窗口）。',
          '请直接向用户询问正确的账号密码，然后再次调用 verify_credentials 重试。',
          'Do NOT call wait_for_login or show_login_form again (would open another login window).',
          'Ask the user for correct credentials and call verify_credentials again.',
        ].join('\n') }],
        isError: true,
      };
    }

    /**
     * @description 登录响应处理
     * @note 重要区分: 登录接口返回的 accessToken/token 是 CJ 前端 JWT (格式: USR@CJxxx@L5@CJ:...)
     * 这个 token 不能用于 OpenAPI 调用！
     * OpenAPI 需要单独的 apiKey (用户在后台生成) → 再通过 getAccessToken 接口换取 OpenAPI accessToken
     * 后续会有新接口开发来替代当前的 apiKey 获取方式
     * 返回字段: data.token (CJ前端JWT), data.accessToken (同token), data.expireTime,
     *           data.extra.email, data.num, data.id
     */
    const apiKey = loginData.data?.apiKey;
    /**
     * @note 纠正(补充登录方式): accessToken 是实际生产 webLogin 响应的主 token 字段
     * 优先使用 accessToken（完整 JWT），兼容旧字段 cjLoginToken/token
     * 参考用户实际响应: data.accessToken = "USR@CJ620569@L0@CJ:eyJ..."
     */
    const loginToken = loginData.data?.accessToken || loginData.data?.cjLoginToken || loginData.data?.token;
    /**
     * @note 纠正(支持多种登录方式): 优先从 data.extra.email 提取真实邮箱（类型安全）
     * 原代码使用 Record<string, unknown> 强转，类型不安全且可读性差
     */
    const userEmail = loginData.data?.extra?.email || loginData.data?.email;
    const displayEmail = userEmail || effectiveLoginName;
    /**
     * @note 纠正(支持多种登录方式): 使用实际 expireTime（毫秒时间戳），fallback 为 7 天
     * 原代码硬编码 14 天，导致 isAccessTokenExpired() 无法正确判断 token 实际有效期
     * @note 纠正(补充登录方式): expireTime 在实际响应中是字符串（如 "1780033156457"）
     * 必须用 Number() 转换再传给 new Date()，否则 new Date("1780033156457") 返回 Invalid Date
     */
    const tokenExpiry = loginData.data?.expireTime
      ? new Date(Number(loginData.data.expireTime)).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    /**
     * @note 纠正(支持多种登录方式): 使用完整类型后直接访问 data.id，不再需要 type casting
     */
    const openId = String(loginData.data?.id || '');

    if (!apiKey) {
      /**
       * @description 无 apiKey 时使用登录返回的 token 作为 OpenAPI accessToken
       * @note 纠正: email+password 登录返回的 token 字段可直接用于 OpenAPI 接口调用
       * 不需要额外的 apiKey → getAccessToken 流程
       */
      if (loginToken) {
        const session = setSessionDirect({
          email: displayEmail,
          accessToken: loginToken,
          accessTokenExpiry: tokenExpiry,
          refreshToken: '',
          refreshTokenExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          openId,
          loginToken,
        });
        return {
          content: [{
            type: 'text',
            text: `✅ 登录成功 / Login successful!\n` +
              `用户 / User: ${displayEmail}\n` +
              `CJ号 / CJ Number: ${loginData.data?.num || 'N/A'}\n` +
              `Token 已保存，可用于后续 OpenAPI 接口调用。\n` +
              `Token saved, ready for OpenAPI calls.`,
          }],
        };
      }

      const config2 = getEnvConfig();
      const apiKeyUrl = config2.env === 'production'
        ? 'https://www.cjdropshipping.com/myCJ.html#/apikey'
        : 'http://www.cjdropshipping.offline.pre.com/myCJ.html#/apikey';

      return {
        content: [{
          type: 'text',
          text: `⚠️ 登录成功，但未获取到 token 或 API Key / Login succeeded, but no token or API Key found.\n` +
            `用户 / User: ${displayEmail}\n` +
            `CJ号 / CJ Number: ${(loginData.data as Record<string, unknown>)?.num || 'N/A'}\n\n` +
            `要使用 OpenAPI 功能（查询订单、搜索商品等），请先到 CJ 后台生成 API Key:\n` +
            `To use OpenAPI features (query orders, search products, etc.), please generate an API Key at:\n` +
            `${apiKeyUrl}\n\n` +
            `生成后重新调用 show_login_form 登录即可 / After generating, call show_login_form to login again.`,
        }],
        isError: true,
      };
    }

    // Step 2: 用 apiKey 换取 OpenAPI accessToken
    const session = await createSession(effectiveLoginName!, apiKey, loginToken || undefined);

    return {
      content: [{
        type: 'text',
        text: `✅ 登录成功 / Login successful!\n` +
          `用户 / User: ${displayEmail}\n` +
          `OpenID: ${session.openId}\n` +
          `Token有效期 / Token expires: ${session.accessTokenExpiry}`,
      }],
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `登录异常 / Login error: ${msg}` }],
      isError: true,
    };
  }
}

function handleCheckLoginStatus(): {
  content: Array<{ type: string; text: string }>;
} {
  const directCtx = getDirectTokenContext();
  if (directCtx) {
    return {
      content: [{
        type: 'text',
        text: [
          `✅ 已登录（URL 直接 Token 模式）/ Logged in (URL direct token mode)`,
          `用户 / User: ${directCtx.userId}`,
          `🔑 认证方式 / Auth via: URL 直接 Token / URL direct token (stateless, no server storage)`,
          `⚠️ 注意：Token 过期后需更新 ChatGPT 应用 URL / Note: Update URL when token expires`,
        ].join('\n'),
      }],
    };
  }

  const session = getSession();
  const ctxApiKey = getContextApiKey();

  if (!session) {
    return {
      content: [{
        type: 'text',
        text: '❌ 未登录，请使用 show_login_form 进行登录 / Not logged in. Please use show_login_form to login.',
      }],
    };
  }

  const valid = isSessionValid();
  const accessExpiry = new Date(session.accessTokenExpiry);
  const now = new Date();

  // 认证方式标注
  const authMethod = ctxApiKey
    ? `🔑 认证方式 / Auth via: URL apiKey (${ctxApiKey.length > 12 ? ctxApiKey.slice(0, 12) + '…' : ctxApiKey})`
    : `🔑 认证方式 / Auth via: 手动登录 / Manual login`;

  return {
    content: [{
      type: 'text',
      text: valid
        ? `✅ 已登录 / Logged in\n` +
          `用户 / User: ${session.email}\n` +
          `${authMethod}\n` +
          `AccessToken ${accessExpiry > now ? '有效' : '已过期(可自动续期)'} / ${accessExpiry > now ? 'valid' : 'expired (auto-refresh)'}\n` +
          `RefreshToken 过期时间 / expires: ${session.refreshTokenExpiry}`
        : `⚠️ 会话已过期，请重新登录 / Session expired. Please re-login.`,
    }],
  };
}

function handleRateLimitStatus(): {
  content: Array<{ type: string; text: string }>;
} {
  const status = rateLimiter.getStatus();
  const lines = [
    '📊 QPS 限速状态 / Rate Limit Status:',
    `  查询/Read: ${status.tiers.read.available}/${status.tiers.read.max} (${status.tiers.read.refillRate}/s)`,
    `  写入/Write: ${status.tiers.write.available}/${status.tiers.write.max} (${status.tiers.write.refillRate}/s)`,
    `  认证/Auth: ${status.tiers.auth.available}/${status.tiers.auth.max} (${status.tiers.auth.refillRate}/s)`,
    `  全局/Global: ${status.global.available}/${status.global.max} (${status.global.refillRate}/s)`,
    '',
    '📅 日配额 / Daily Quota:',
    `  已用/Used: ${status.dailyQuota.used}/${status.dailyQuota.max} (剩余/remaining: ${status.dailyQuota.remaining})`,
    '',
    '🔄 并发 / Concurrency:',
    `  活跃/Active: ${status.concurrency.active}/${status.concurrency.max} (队列/queued: ${status.concurrency.queued})`,
    '',
    '💾 缓存 / Cache:',
    `  条目/Entries: ${status.cache.size} (TTL: ${status.cache.ttlMs / 1000}s)`,
  ];
  return { content: [{ type: 'text', text: lines.join('\n') }] };
}

/**
 * @description 登出处理
 * @note 清除本地会话和持久化 token，方便用户切换账号
 */
function handleLogout(): {
  content: Array<{ type: string; text: string }>;
} {
  const session = getSession();
  const email = session?.email || '未知用户';
  clearSession();
  return {
    content: [{
      type: 'text',
      text: `✅ 已登出账号: ${email} / Logged out: ${email}\n` +
        `可使用 show_login_form 或 verify_credentials 重新登录其他账号。\n` +
        `You can use show_login_form or verify_credentials to login with another account.`,
    }],
  };
}
