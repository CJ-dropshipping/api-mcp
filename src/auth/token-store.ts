/**
 * @fileoverview Token 加密存储
 * 使用文件系统存储 token
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { getEnvConfig } from '../config/env';

const TOKEN_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE || '.',
  '.cj-mcp-token',
);

/**
 * @note 纠正(78次): 测试环境下额外写入明文 token 到 .cj-mcp-token2，便于调试查看。
 * 仅在 CJ_ENV=test 时写入，生产环境不写入，避免敏感 token 明文暴露。
 */
const TOKEN_FILE2 = path.join(
  process.env.HOME || process.env.USERPROFILE || '.',
  '.cj-mcp-token2',
);

let tokenStoreInstance: TokenStore | null = null;

export class TokenStore {
  private encryptKey: string;
  private env: string;

  constructor() {
    const config = getEnvConfig();
    this.encryptKey = config.tokenEncryptKey || 'cj-mcp-default-key-2026';
    this.env = config.env;
  }

  static getInstance(): TokenStore {
    if (!tokenStoreInstance) {
      tokenStoreInstance = new TokenStore();
    }
    return tokenStoreInstance;
  }

  private getKey(): Buffer {
    return crypto.createHash('sha256').update(this.encryptKey).digest();
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length < 2) return '';
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts.slice(1).join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.getKey(), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  setToken(token: string): void {
    const encrypted = this.encrypt(token);
    fs.writeFileSync(TOKEN_FILE, encrypted, 'utf8');
    /**
     * @note 纠正(78次): 测试环境额外写一份明文到 .cj-mcp-token2 供调试使用。
     * 生产环境跳过，防止 token 明文落盘泄露。
     */
    if (this.env === 'test') {
      fs.writeFileSync(TOKEN_FILE2, token, 'utf8');
    }
  }

  getToken(): string {
    try {
      if (!fs.existsSync(TOKEN_FILE)) return '';
      const encrypted = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
      if (!encrypted) return '';
      return this.decrypt(encrypted);
    } catch {
      return '';
    }
  }

  clearToken(): void {
    try {
      if (fs.existsSync(TOKEN_FILE)) {
        fs.unlinkSync(TOKEN_FILE);
      }
      /**
       * @note 纠正(78次): 清除 token 时同步删除明文备份文件，避免残留明文 token。
       */
      if (fs.existsSync(TOKEN_FILE2)) {
        fs.unlinkSync(TOKEN_FILE2);
      }
    } catch {
      // ignore
    }
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
