"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ajv/dist/compile/codegen/code.js
var require_code = __commonJS({
  "node_modules/ajv/dist/compile/codegen/code.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.regexpCode = exports2.getEsmExportName = exports2.getProperty = exports2.safeStringify = exports2.stringify = exports2.strConcat = exports2.addCodeArg = exports2.str = exports2._ = exports2.nil = exports2._Code = exports2.Name = exports2.IDENTIFIER = exports2._CodeOrName = void 0;
    var _CodeOrName = class {
    };
    exports2._CodeOrName = _CodeOrName;
    exports2.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    var Name = class extends _CodeOrName {
      constructor(s) {
        super();
        if (!exports2.IDENTIFIER.test(s))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = s;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return false;
      }
      get names() {
        return { [this.str]: 1 };
      }
    };
    exports2.Name = Name;
    var _Code = class extends _CodeOrName {
      constructor(code) {
        super();
        this._items = typeof code === "string" ? [code] : code;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return false;
        const item = this._items[0];
        return item === "" || item === '""';
      }
      get str() {
        var _a3;
        return (_a3 = this._str) !== null && _a3 !== void 0 ? _a3 : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
      }
      get names() {
        var _a3;
        return (_a3 = this._names) !== null && _a3 !== void 0 ? _a3 : this._names = this._items.reduce((names, c) => {
          if (c instanceof Name)
            names[c.str] = (names[c.str] || 0) + 1;
          return names;
        }, {});
      }
    };
    exports2._Code = _Code;
    exports2.nil = new _Code("");
    function _(strs, ...args) {
      const code = [strs[0]];
      let i = 0;
      while (i < args.length) {
        addCodeArg(code, args[i]);
        code.push(strs[++i]);
      }
      return new _Code(code);
    }
    exports2._ = _;
    var plus = new _Code("+");
    function str(strs, ...args) {
      const expr = [safeStringify(strs[0])];
      let i = 0;
      while (i < args.length) {
        expr.push(plus);
        addCodeArg(expr, args[i]);
        expr.push(plus, safeStringify(strs[++i]));
      }
      optimize(expr);
      return new _Code(expr);
    }
    exports2.str = str;
    function addCodeArg(code, arg) {
      if (arg instanceof _Code)
        code.push(...arg._items);
      else if (arg instanceof Name)
        code.push(arg);
      else
        code.push(interpolate(arg));
    }
    exports2.addCodeArg = addCodeArg;
    function optimize(expr) {
      let i = 1;
      while (i < expr.length - 1) {
        if (expr[i] === plus) {
          const res = mergeExprItems(expr[i - 1], expr[i + 1]);
          if (res !== void 0) {
            expr.splice(i - 1, 3, res);
            continue;
          }
          expr[i++] = "+";
        }
        i++;
      }
    }
    function mergeExprItems(a, b) {
      if (b === '""')
        return a;
      if (a === '""')
        return b;
      if (typeof a == "string") {
        if (b instanceof Name || a[a.length - 1] !== '"')
          return;
        if (typeof b != "string")
          return `${a.slice(0, -1)}${b}"`;
        if (b[0] === '"')
          return a.slice(0, -1) + b.slice(1);
        return;
      }
      if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
        return `"${a}${b.slice(1)}`;
      return;
    }
    function strConcat(c1, c2) {
      return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
    }
    exports2.strConcat = strConcat;
    function interpolate(x) {
      return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
    }
    function stringify(x) {
      return new _Code(safeStringify(x));
    }
    exports2.stringify = stringify;
    function safeStringify(x) {
      return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    exports2.safeStringify = safeStringify;
    function getProperty(key) {
      return typeof key == "string" && exports2.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
    }
    exports2.getProperty = getProperty;
    function getEsmExportName(key) {
      if (typeof key == "string" && exports2.IDENTIFIER.test(key)) {
        return new _Code(`${key}`);
      }
      throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
    }
    exports2.getEsmExportName = getEsmExportName;
    function regexpCode(rx) {
      return new _Code(rx.toString());
    }
    exports2.regexpCode = regexpCode;
  }
});

// node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS({
  "node_modules/ajv/dist/compile/codegen/scope.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ValueScope = exports2.ValueScopeName = exports2.Scope = exports2.varKinds = exports2.UsedValueState = void 0;
    var code_1 = require_code();
    var ValueError = class extends Error {
      constructor(name) {
        super(`CodeGen: "code" for ${name} not defined`);
        this.value = name.value;
      }
    };
    var UsedValueState;
    (function(UsedValueState2) {
      UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
      UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
    })(UsedValueState || (exports2.UsedValueState = UsedValueState = {}));
    exports2.varKinds = {
      const: new code_1.Name("const"),
      let: new code_1.Name("let"),
      var: new code_1.Name("var")
    };
    var Scope = class {
      constructor({ prefixes, parent } = {}) {
        this._names = {};
        this._prefixes = prefixes;
        this._parent = parent;
      }
      toName(nameOrPrefix) {
        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
      }
      name(prefix) {
        return new code_1.Name(this._newName(prefix));
      }
      _newName(prefix) {
        const ng = this._names[prefix] || this._nameGroup(prefix);
        return `${prefix}${ng.index++}`;
      }
      _nameGroup(prefix) {
        var _a3, _b;
        if (((_b = (_a3 = this._parent) === null || _a3 === void 0 ? void 0 : _a3._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
          throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
        }
        return this._names[prefix] = { prefix, index: 0 };
      }
    };
    exports2.Scope = Scope;
    var ValueScopeName = class extends code_1.Name {
      constructor(prefix, nameStr) {
        super(nameStr);
        this.prefix = prefix;
      }
      setValue(value, { property, itemIndex }) {
        this.value = value;
        this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
      }
    };
    exports2.ValueScopeName = ValueScopeName;
    var line = (0, code_1._)`\n`;
    var ValueScope = class extends Scope {
      constructor(opts) {
        super(opts);
        this._values = {};
        this._scope = opts.scope;
        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
      }
      get() {
        return this._scope;
      }
      name(prefix) {
        return new ValueScopeName(prefix, this._newName(prefix));
      }
      value(nameOrPrefix, value) {
        var _a3;
        if (value.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const name = this.toName(nameOrPrefix);
        const { prefix } = name;
        const valueKey = (_a3 = value.key) !== null && _a3 !== void 0 ? _a3 : value.ref;
        let vs = this._values[prefix];
        if (vs) {
          const _name = vs.get(valueKey);
          if (_name)
            return _name;
        } else {
          vs = this._values[prefix] = /* @__PURE__ */ new Map();
        }
        vs.set(valueKey, name);
        const s = this._scope[prefix] || (this._scope[prefix] = []);
        const itemIndex = s.length;
        s[itemIndex] = value.ref;
        name.setValue(value, { property: prefix, itemIndex });
        return name;
      }
      getValue(prefix, keyOrRef) {
        const vs = this._values[prefix];
        if (!vs)
          return;
        return vs.get(keyOrRef);
      }
      scopeRefs(scopeName, values = this._values) {
        return this._reduceValues(values, (name) => {
          if (name.scopePath === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return (0, code_1._)`${scopeName}${name.scopePath}`;
        });
      }
      scopeCode(values = this._values, usedValues, getCode) {
        return this._reduceValues(values, (name) => {
          if (name.value === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return name.value.code;
        }, usedValues, getCode);
      }
      _reduceValues(values, valueCode, usedValues = {}, getCode) {
        let code = code_1.nil;
        for (const prefix in values) {
          const vs = values[prefix];
          if (!vs)
            continue;
          const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
          vs.forEach((name) => {
            if (nameSet.has(name))
              return;
            nameSet.set(name, UsedValueState.Started);
            let c = valueCode(name);
            if (c) {
              const def = this.opts.es5 ? exports2.varKinds.var : exports2.varKinds.const;
              code = (0, code_1._)`${code}${def} ${name} = ${c};${this.opts._n}`;
            } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
              code = (0, code_1._)`${code}${c}${this.opts._n}`;
            } else {
              throw new ValueError(name);
            }
            nameSet.set(name, UsedValueState.Completed);
          });
        }
        return code;
      }
    };
    exports2.ValueScope = ValueScope;
  }
});

// node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS({
  "node_modules/ajv/dist/compile/codegen/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.or = exports2.and = exports2.not = exports2.CodeGen = exports2.operators = exports2.varKinds = exports2.ValueScopeName = exports2.ValueScope = exports2.Scope = exports2.Name = exports2.regexpCode = exports2.stringify = exports2.getProperty = exports2.nil = exports2.strConcat = exports2.str = exports2._ = void 0;
    var code_1 = require_code();
    var scope_1 = require_scope();
    var code_2 = require_code();
    Object.defineProperty(exports2, "_", { enumerable: true, get: function() {
      return code_2._;
    } });
    Object.defineProperty(exports2, "str", { enumerable: true, get: function() {
      return code_2.str;
    } });
    Object.defineProperty(exports2, "strConcat", { enumerable: true, get: function() {
      return code_2.strConcat;
    } });
    Object.defineProperty(exports2, "nil", { enumerable: true, get: function() {
      return code_2.nil;
    } });
    Object.defineProperty(exports2, "getProperty", { enumerable: true, get: function() {
      return code_2.getProperty;
    } });
    Object.defineProperty(exports2, "stringify", { enumerable: true, get: function() {
      return code_2.stringify;
    } });
    Object.defineProperty(exports2, "regexpCode", { enumerable: true, get: function() {
      return code_2.regexpCode;
    } });
    Object.defineProperty(exports2, "Name", { enumerable: true, get: function() {
      return code_2.Name;
    } });
    var scope_2 = require_scope();
    Object.defineProperty(exports2, "Scope", { enumerable: true, get: function() {
      return scope_2.Scope;
    } });
    Object.defineProperty(exports2, "ValueScope", { enumerable: true, get: function() {
      return scope_2.ValueScope;
    } });
    Object.defineProperty(exports2, "ValueScopeName", { enumerable: true, get: function() {
      return scope_2.ValueScopeName;
    } });
    Object.defineProperty(exports2, "varKinds", { enumerable: true, get: function() {
      return scope_2.varKinds;
    } });
    exports2.operators = {
      GT: new code_1._Code(">"),
      GTE: new code_1._Code(">="),
      LT: new code_1._Code("<"),
      LTE: new code_1._Code("<="),
      EQ: new code_1._Code("==="),
      NEQ: new code_1._Code("!=="),
      NOT: new code_1._Code("!"),
      OR: new code_1._Code("||"),
      AND: new code_1._Code("&&"),
      ADD: new code_1._Code("+")
    };
    var Node = class {
      optimizeNodes() {
        return this;
      }
      optimizeNames(_names, _constants) {
        return this;
      }
    };
    var Def = class extends Node {
      constructor(varKind, name, rhs) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.rhs = rhs;
      }
      render({ es5, _n }) {
        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
        const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${varKind} ${this.name}${rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (!names[this.name.str])
          return;
        if (this.rhs)
          this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
      }
    };
    var Assign = class extends Node {
      constructor(lhs, rhs, sideEffects) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.sideEffects = sideEffects;
      }
      render({ _n }) {
        return `${this.lhs} = ${this.rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
          return;
        this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
        return addExprNames(names, this.rhs);
      }
    };
    var AssignOp = class extends Assign {
      constructor(lhs, op, rhs, sideEffects) {
        super(lhs, rhs, sideEffects);
        this.op = op;
      }
      render({ _n }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
      }
    };
    var Label = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        return `${this.label}:` + _n;
      }
    };
    var Break = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        const label = this.label ? ` ${this.label}` : "";
        return `break${label};` + _n;
      }
    };
    var Throw = class extends Node {
      constructor(error2) {
        super();
        this.error = error2;
      }
      render({ _n }) {
        return `throw ${this.error};` + _n;
      }
      get names() {
        return this.error.names;
      }
    };
    var AnyCode = class extends Node {
      constructor(code) {
        super();
        this.code = code;
      }
      render({ _n }) {
        return `${this.code};` + _n;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(names, constants) {
        this.code = optimizeExpr(this.code, names, constants);
        return this;
      }
      get names() {
        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
      }
    };
    var ParentNode = class extends Node {
      constructor(nodes = []) {
        super();
        this.nodes = nodes;
      }
      render(opts) {
        return this.nodes.reduce((code, n) => code + n.render(opts), "");
      }
      optimizeNodes() {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i].optimizeNodes();
          if (Array.isArray(n))
            nodes.splice(i, 1, ...n);
          else if (n)
            nodes[i] = n;
          else
            nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      optimizeNames(names, constants) {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i];
          if (n.optimizeNames(names, constants))
            continue;
          subtractNames(names, n.names);
          nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
      }
    };
    var BlockNode = class extends ParentNode {
      render(opts) {
        return "{" + opts._n + super.render(opts) + "}" + opts._n;
      }
    };
    var Root = class extends ParentNode {
    };
    var Else = class extends BlockNode {
    };
    Else.kind = "else";
    var If = class _If extends BlockNode {
      constructor(condition, nodes) {
        super(nodes);
        this.condition = condition;
      }
      render(opts) {
        let code = `if(${this.condition})` + super.render(opts);
        if (this.else)
          code += "else " + this.else.render(opts);
        return code;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const cond = this.condition;
        if (cond === true)
          return this.nodes;
        let e = this.else;
        if (e) {
          const ns = e.optimizeNodes();
          e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
        }
        if (e) {
          if (cond === false)
            return e instanceof _If ? e : e.nodes;
          if (this.nodes.length)
            return this;
          return new _If(not(cond), e instanceof _If ? [e] : e.nodes);
        }
        if (cond === false || !this.nodes.length)
          return void 0;
        return this;
      }
      optimizeNames(names, constants) {
        var _a3;
        this.else = (_a3 = this.else) === null || _a3 === void 0 ? void 0 : _a3.optimizeNames(names, constants);
        if (!(super.optimizeNames(names, constants) || this.else))
          return;
        this.condition = optimizeExpr(this.condition, names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        addExprNames(names, this.condition);
        if (this.else)
          addNames(names, this.else.names);
        return names;
      }
    };
    If.kind = "if";
    var For = class extends BlockNode {
    };
    For.kind = "for";
    var ForLoop = class extends For {
      constructor(iteration) {
        super();
        this.iteration = iteration;
      }
      render(opts) {
        return `for(${this.iteration})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iteration = optimizeExpr(this.iteration, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iteration.names);
      }
    };
    var ForRange = class extends For {
      constructor(varKind, name, from, to) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.from = from;
        this.to = to;
      }
      render(opts) {
        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
        const { name, from, to } = this;
        return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
      }
      get names() {
        const names = addExprNames(super.names, this.from);
        return addExprNames(names, this.to);
      }
    };
    var ForIter = class extends For {
      constructor(loop, varKind, name, iterable) {
        super();
        this.loop = loop;
        this.varKind = varKind;
        this.name = name;
        this.iterable = iterable;
      }
      render(opts) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iterable = optimizeExpr(this.iterable, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iterable.names);
      }
    };
    var Func = class extends BlockNode {
      constructor(name, args, async) {
        super();
        this.name = name;
        this.args = args;
        this.async = async;
      }
      render(opts) {
        const _async = this.async ? "async " : "";
        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
      }
    };
    Func.kind = "func";
    var Return = class extends ParentNode {
      render(opts) {
        return "return " + super.render(opts);
      }
    };
    Return.kind = "return";
    var Try = class extends BlockNode {
      render(opts) {
        let code = "try" + super.render(opts);
        if (this.catch)
          code += this.catch.render(opts);
        if (this.finally)
          code += this.finally.render(opts);
        return code;
      }
      optimizeNodes() {
        var _a3, _b;
        super.optimizeNodes();
        (_a3 = this.catch) === null || _a3 === void 0 ? void 0 : _a3.optimizeNodes();
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
        return this;
      }
      optimizeNames(names, constants) {
        var _a3, _b;
        super.optimizeNames(names, constants);
        (_a3 = this.catch) === null || _a3 === void 0 ? void 0 : _a3.optimizeNames(names, constants);
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        if (this.catch)
          addNames(names, this.catch.names);
        if (this.finally)
          addNames(names, this.finally.names);
        return names;
      }
    };
    var Catch = class extends BlockNode {
      constructor(error2) {
        super();
        this.error = error2;
      }
      render(opts) {
        return `catch(${this.error})` + super.render(opts);
      }
    };
    Catch.kind = "catch";
    var Finally = class extends BlockNode {
      render(opts) {
        return "finally" + super.render(opts);
      }
    };
    Finally.kind = "finally";
    var CodeGen = class {
      constructor(extScope, opts = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
        this._extScope = extScope;
        this._scope = new scope_1.Scope({ parent: extScope });
        this._nodes = [new Root()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(prefix) {
        return this._scope.name(prefix);
      }
      // reserves unique name in the external scope
      scopeName(prefix) {
        return this._extScope.name(prefix);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(prefixOrName, value) {
        const name = this._extScope.value(prefixOrName, value);
        const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
        vs.add(name);
        return name;
      }
      getScopeValue(prefix, keyOrRef) {
        return this._extScope.getValue(prefix, keyOrRef);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(scopeName) {
        return this._extScope.scopeRefs(scopeName, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(varKind, nameOrPrefix, rhs, constant) {
        const name = this._scope.toName(nameOrPrefix);
        if (rhs !== void 0 && constant)
          this._constants[name.str] = rhs;
        this._leafNode(new Def(varKind, name, rhs));
        return name;
      }
      // `const` declaration (`var` in es5 mode)
      const(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
      }
      // `var` declaration with optional assignment
      var(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
      }
      // assignment code
      assign(lhs, rhs, sideEffects) {
        return this._leafNode(new Assign(lhs, rhs, sideEffects));
      }
      // `+=` code
      add(lhs, rhs) {
        return this._leafNode(new AssignOp(lhs, exports2.operators.ADD, rhs));
      }
      // appends passed SafeExpr to code or executes Block
      code(c) {
        if (typeof c == "function")
          c();
        else if (c !== code_1.nil)
          this._leafNode(new AnyCode(c));
        return this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...keyValues) {
        const code = ["{"];
        for (const [key, value] of keyValues) {
          if (code.length > 1)
            code.push(",");
          code.push(key);
          if (key !== value || this.opts.es5) {
            code.push(":");
            (0, code_1.addCodeArg)(code, value);
          }
        }
        code.push("}");
        return new code_1._Code(code);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(condition, thenBody, elseBody) {
        this._blockNode(new If(condition));
        if (thenBody && elseBody) {
          this.code(thenBody).else().code(elseBody).endIf();
        } else if (thenBody) {
          this.code(thenBody).endIf();
        } else if (elseBody) {
          throw new Error('CodeGen: "else" body without "then" body');
        }
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(condition) {
        return this._elseNode(new If(condition));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new Else());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(If, Else);
      }
      _for(node, forBody) {
        this._blockNode(node);
        if (forBody)
          this.code(forBody).endFor();
        return this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(iteration, forBody) {
        return this._for(new ForLoop(iteration), forBody);
      }
      // `for` statement for a range of values
      forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
        const name = this._scope.toName(nameOrPrefix);
        if (this.opts.es5) {
          const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
          return this.forRange("_i", 0, (0, code_1._)`${arr}.length`, (i) => {
            this.var(name, (0, code_1._)`${arr}[${i}]`);
            forBody(name);
          });
        }
        return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
        if (this.opts.ownProperties) {
          return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
        }
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(For);
      }
      // `label` statement
      label(label) {
        return this._leafNode(new Label(label));
      }
      // `break` statement
      break(label) {
        return this._leafNode(new Break(label));
      }
      // `return` statement
      return(value) {
        const node = new Return();
        this._blockNode(node);
        this.code(value);
        if (node.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(Return);
      }
      // `try` statement
      try(tryBody, catchCode, finallyCode) {
        if (!catchCode && !finallyCode)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const node = new Try();
        this._blockNode(node);
        this.code(tryBody);
        if (catchCode) {
          const error2 = this.name("e");
          this._currNode = node.catch = new Catch(error2);
          catchCode(error2);
        }
        if (finallyCode) {
          this._currNode = node.finally = new Finally();
          this.code(finallyCode);
        }
        return this._endBlockNode(Catch, Finally);
      }
      // `throw` statement
      throw(error2) {
        return this._leafNode(new Throw(error2));
      }
      // start self-balancing block
      block(body, nodeCount) {
        this._blockStarts.push(this._nodes.length);
        if (body)
          this.code(body).endBlock(nodeCount);
        return this;
      }
      // end the current self-balancing block
      endBlock(nodeCount) {
        const len = this._blockStarts.pop();
        if (len === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const toClose = this._nodes.length - len;
        if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
          throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
        }
        this._nodes.length = len;
        return this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(name, args = code_1.nil, async, funcBody) {
        this._blockNode(new Func(name, args, async));
        if (funcBody)
          this.code(funcBody).endFunc();
        return this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(Func);
      }
      optimize(n = 1) {
        while (n-- > 0) {
          this._root.optimizeNodes();
          this._root.optimizeNames(this._root.names, this._constants);
        }
      }
      _leafNode(node) {
        this._currNode.nodes.push(node);
        return this;
      }
      _blockNode(node) {
        this._currNode.nodes.push(node);
        this._nodes.push(node);
      }
      _endBlockNode(N1, N2) {
        const n = this._currNode;
        if (n instanceof N1 || N2 && n instanceof N2) {
          this._nodes.pop();
          return this;
        }
        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
      }
      _elseNode(node) {
        const n = this._currNode;
        if (!(n instanceof If)) {
          throw new Error('CodeGen: "else" without "if"');
        }
        this._currNode = n.else = node;
        return this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const ns = this._nodes;
        return ns[ns.length - 1];
      }
      set _currNode(node) {
        const ns = this._nodes;
        ns[ns.length - 1] = node;
      }
    };
    exports2.CodeGen = CodeGen;
    function addNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) + (from[n] || 0);
      return names;
    }
    function addExprNames(names, from) {
      return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
    }
    function optimizeExpr(expr, names, constants) {
      if (expr instanceof code_1.Name)
        return replaceName(expr);
      if (!canOptimize(expr))
        return expr;
      return new code_1._Code(expr._items.reduce((items, c) => {
        if (c instanceof code_1.Name)
          c = replaceName(c);
        if (c instanceof code_1._Code)
          items.push(...c._items);
        else
          items.push(c);
        return items;
      }, []));
      function replaceName(n) {
        const c = constants[n.str];
        if (c === void 0 || names[n.str] !== 1)
          return n;
        delete names[n.str];
        return c;
      }
      function canOptimize(e) {
        return e instanceof code_1._Code && e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== void 0);
      }
    }
    function subtractNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) - (from[n] || 0);
    }
    function not(x) {
      return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._)`!${par(x)}`;
    }
    exports2.not = not;
    var andCode = mappend(exports2.operators.AND);
    function and(...args) {
      return args.reduce(andCode);
    }
    exports2.and = and;
    var orCode = mappend(exports2.operators.OR);
    function or(...args) {
      return args.reduce(orCode);
    }
    exports2.or = or;
    function mappend(op) {
      return (x, y) => x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._)`${par(x)} ${op} ${par(y)}`;
    }
    function par(x) {
      return x instanceof code_1.Name ? x : (0, code_1._)`(${x})`;
    }
  }
});

// node_modules/ajv/dist/compile/util.js
var require_util = __commonJS({
  "node_modules/ajv/dist/compile/util.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.checkStrictMode = exports2.getErrorPath = exports2.Type = exports2.useFunc = exports2.setEvaluated = exports2.evaluatedPropsToName = exports2.mergeEvaluated = exports2.eachItem = exports2.unescapeJsonPointer = exports2.escapeJsonPointer = exports2.escapeFragment = exports2.unescapeFragment = exports2.schemaRefOrVal = exports2.schemaHasRulesButRef = exports2.schemaHasRules = exports2.checkUnknownRules = exports2.alwaysValidSchema = exports2.toHash = void 0;
    var codegen_1 = require_codegen();
    var code_1 = require_code();
    function toHash(arr) {
      const hash = {};
      for (const item of arr)
        hash[item] = true;
      return hash;
    }
    exports2.toHash = toHash;
    function alwaysValidSchema(it, schema) {
      if (typeof schema == "boolean")
        return schema;
      if (Object.keys(schema).length === 0)
        return true;
      checkUnknownRules(it, schema);
      return !schemaHasRules(schema, it.self.RULES.all);
    }
    exports2.alwaysValidSchema = alwaysValidSchema;
    function checkUnknownRules(it, schema = it.schema) {
      const { opts, self } = it;
      if (!opts.strictSchema)
        return;
      if (typeof schema === "boolean")
        return;
      const rules = self.RULES.keywords;
      for (const key in schema) {
        if (!rules[key])
          checkStrictMode(it, `unknown keyword: "${key}"`);
      }
    }
    exports2.checkUnknownRules = checkUnknownRules;
    function schemaHasRules(schema, rules) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (rules[key])
          return true;
      return false;
    }
    exports2.schemaHasRules = schemaHasRules;
    function schemaHasRulesButRef(schema, RULES) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (key !== "$ref" && RULES.all[key])
          return true;
      return false;
    }
    exports2.schemaHasRulesButRef = schemaHasRulesButRef;
    function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
      if (!$data) {
        if (typeof schema == "number" || typeof schema == "boolean")
          return schema;
        if (typeof schema == "string")
          return (0, codegen_1._)`${schema}`;
      }
      return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
    }
    exports2.schemaRefOrVal = schemaRefOrVal;
    function unescapeFragment(str) {
      return unescapeJsonPointer(decodeURIComponent(str));
    }
    exports2.unescapeFragment = unescapeFragment;
    function escapeFragment(str) {
      return encodeURIComponent(escapeJsonPointer(str));
    }
    exports2.escapeFragment = escapeFragment;
    function escapeJsonPointer(str) {
      if (typeof str == "number")
        return `${str}`;
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    exports2.escapeJsonPointer = escapeJsonPointer;
    function unescapeJsonPointer(str) {
      return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    exports2.unescapeJsonPointer = unescapeJsonPointer;
    function eachItem(xs, f) {
      if (Array.isArray(xs)) {
        for (const x of xs)
          f(x);
      } else {
        f(xs);
      }
    }
    exports2.eachItem = eachItem;
    function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues: mergeValues2, resultToName }) {
      return (gen, from, to, toName) => {
        const res = to === void 0 ? from : to instanceof codegen_1.Name ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1.Name ? (mergeToName(gen, to, from), from) : mergeValues2(from, to);
        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
      };
    }
    exports2.mergeEvaluated = {
      props: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => {
          gen.if((0, codegen_1._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._)`${to} || {}`).code((0, codegen_1._)`Object.assign(${to}, ${from})`));
        }),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => {
          if (from === true) {
            gen.assign(to, true);
          } else {
            gen.assign(to, (0, codegen_1._)`${to} || {}`);
            setEvaluated(gen, to, from);
          }
        }),
        mergeValues: (from, to) => from === true ? true : { ...from, ...to },
        resultToName: evaluatedPropsToName
      }),
      items: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._)`${to} > ${from} ? ${to} : ${from}`)),
        mergeValues: (from, to) => from === true ? true : Math.max(from, to),
        resultToName: (gen, items) => gen.var("items", items)
      })
    };
    function evaluatedPropsToName(gen, ps) {
      if (ps === true)
        return gen.var("props", true);
      const props = gen.var("props", (0, codegen_1._)`{}`);
      if (ps !== void 0)
        setEvaluated(gen, props, ps);
      return props;
    }
    exports2.evaluatedPropsToName = evaluatedPropsToName;
    function setEvaluated(gen, props, ps) {
      Object.keys(ps).forEach((p) => gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p)}`, true));
    }
    exports2.setEvaluated = setEvaluated;
    var snippets = {};
    function useFunc(gen, f) {
      return gen.scopeValue("func", {
        ref: f,
        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
      });
    }
    exports2.useFunc = useFunc;
    var Type;
    (function(Type2) {
      Type2[Type2["Num"] = 0] = "Num";
      Type2[Type2["Str"] = 1] = "Str";
    })(Type || (exports2.Type = Type = {}));
    function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
      if (dataProp instanceof codegen_1.Name) {
        const isNumber = dataPropType === Type.Num;
        return jsPropertySyntax ? isNumber ? (0, codegen_1._)`"[" + ${dataProp} + "]"` : (0, codegen_1._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1._)`"/" + ${dataProp}` : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
    }
    exports2.getErrorPath = getErrorPath;
    function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
      if (!mode)
        return;
      msg = `strict mode: ${msg}`;
      if (mode === true)
        throw new Error(msg);
      it.self.logger.warn(msg);
    }
    exports2.checkStrictMode = checkStrictMode;
  }
});

// node_modules/ajv/dist/compile/names.js
var require_names = __commonJS({
  "node_modules/ajv/dist/compile/names.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var names = {
      // validation function arguments
      data: new codegen_1.Name("data"),
      // data passed to validation function
      // args passed from referencing schema
      valCxt: new codegen_1.Name("valCxt"),
      // validation/data context - should not be used directly, it is destructured to the names below
      instancePath: new codegen_1.Name("instancePath"),
      parentData: new codegen_1.Name("parentData"),
      parentDataProperty: new codegen_1.Name("parentDataProperty"),
      rootData: new codegen_1.Name("rootData"),
      // root data - same as the data passed to the first/top validation function
      dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
      // used to support recursiveRef and dynamicRef
      // function scoped variables
      vErrors: new codegen_1.Name("vErrors"),
      // null or array of validation errors
      errors: new codegen_1.Name("errors"),
      // counter of validation errors
      this: new codegen_1.Name("this"),
      // "globals"
      self: new codegen_1.Name("self"),
      scope: new codegen_1.Name("scope"),
      // JTD serialize/parse name for JSON string and position
      json: new codegen_1.Name("json"),
      jsonPos: new codegen_1.Name("jsonPos"),
      jsonLen: new codegen_1.Name("jsonLen"),
      jsonPart: new codegen_1.Name("jsonPart")
    };
    exports2.default = names;
  }
});

// node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS({
  "node_modules/ajv/dist/compile/errors.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.extendErrors = exports2.resetErrorsCount = exports2.reportExtraError = exports2.reportError = exports2.keyword$DataError = exports2.keywordError = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    exports2.keywordError = {
      message: ({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`
    };
    exports2.keyword$DataError = {
      message: ({ keyword, schemaType }) => schemaType ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)` : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`
    };
    function reportError(cxt, error2 = exports2.keywordError, errorPaths, overrideAllErrors) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error2, errorPaths);
      if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
        addError(gen, errObj);
      } else {
        returnErrors(it, (0, codegen_1._)`[${errObj}]`);
      }
    }
    exports2.reportError = reportError;
    function reportExtraError(cxt, error2 = exports2.keywordError, errorPaths) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error2, errorPaths);
      addError(gen, errObj);
      if (!(compositeRule || allErrors)) {
        returnErrors(it, names_1.default.vErrors);
      }
    }
    exports2.reportExtraError = reportExtraError;
    function resetErrorsCount(gen, errsCount) {
      gen.assign(names_1.default.errors, errsCount);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
    }
    exports2.resetErrorsCount = resetErrorsCount;
    function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
      if (errsCount === void 0)
        throw new Error("ajv implementation error");
      const err = gen.name("err");
      gen.forRange("i", errsCount, names_1.default.errors, (i) => {
        gen.const(err, (0, codegen_1._)`${names_1.default.vErrors}[${i}]`);
        gen.if((0, codegen_1._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._)`${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
        gen.assign((0, codegen_1._)`${err}.schemaPath`, (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`);
        if (it.opts.verbose) {
          gen.assign((0, codegen_1._)`${err}.schema`, schemaValue);
          gen.assign((0, codegen_1._)`${err}.data`, data);
        }
      });
    }
    exports2.extendErrors = extendErrors;
    function addError(gen, errObj) {
      const err = gen.const("err", errObj);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err}]`), (0, codegen_1._)`${names_1.default.vErrors}.push(${err})`);
      gen.code((0, codegen_1._)`${names_1.default.errors}++`);
    }
    function returnErrors(it, errs) {
      const { gen, validateName, schemaEnv } = it;
      if (schemaEnv.$async) {
        gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
        gen.return(false);
      }
    }
    var E = {
      keyword: new codegen_1.Name("keyword"),
      schemaPath: new codegen_1.Name("schemaPath"),
      // also used in JTD errors
      params: new codegen_1.Name("params"),
      propertyName: new codegen_1.Name("propertyName"),
      message: new codegen_1.Name("message"),
      schema: new codegen_1.Name("schema"),
      parentSchema: new codegen_1.Name("parentSchema")
    };
    function errorObjectCode(cxt, error2, errorPaths) {
      const { createErrors } = cxt.it;
      if (createErrors === false)
        return (0, codegen_1._)`{}`;
      return errorObject(cxt, error2, errorPaths);
    }
    function errorObject(cxt, error2, errorPaths = {}) {
      const { gen, it } = cxt;
      const keyValues = [
        errorInstancePath(it, errorPaths),
        errorSchemaPath(cxt, errorPaths)
      ];
      extraErrorProps(cxt, error2, keyValues);
      return gen.object(...keyValues);
    }
    function errorInstancePath({ errorPath }, { instancePath }) {
      const instPath = instancePath ? (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
      return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
    }
    function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
      let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
      if (schemaPath) {
        schPath = (0, codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
      }
      return [E.schemaPath, schPath];
    }
    function extraErrorProps(cxt, { params, message }, keyValues) {
      const { keyword, data, schemaValue, it } = cxt;
      const { opts, propertyName, topSchemaRef, schemaPath } = it;
      keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._)`{}`]);
      if (opts.messages) {
        keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
      }
      if (opts.verbose) {
        keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
      }
      if (propertyName)
        keyValues.push([E.propertyName, propertyName]);
    }
  }
});

// node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS({
  "node_modules/ajv/dist/compile/validate/boolSchema.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.boolOrEmptySchema = exports2.topBoolOrEmptySchema = void 0;
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var boolError = {
      message: "boolean schema is false"
    };
    function topBoolOrEmptySchema(it) {
      const { gen, schema, validateName } = it;
      if (schema === false) {
        falseSchemaError(it, false);
      } else if (typeof schema == "object" && schema.$async === true) {
        gen.return(names_1.default.data);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, null);
        gen.return(true);
      }
    }
    exports2.topBoolOrEmptySchema = topBoolOrEmptySchema;
    function boolOrEmptySchema(it, valid) {
      const { gen, schema } = it;
      if (schema === false) {
        gen.var(valid, false);
        falseSchemaError(it);
      } else {
        gen.var(valid, true);
      }
    }
    exports2.boolOrEmptySchema = boolOrEmptySchema;
    function falseSchemaError(it, overrideAllErrors) {
      const { gen, data } = it;
      const cxt = {
        gen,
        keyword: "false schema",
        data,
        schema: false,
        schemaCode: false,
        schemaValue: false,
        params: {},
        it
      };
      (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
    }
  }
});

// node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS({
  "node_modules/ajv/dist/compile/rules.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getRules = exports2.isJSONType = void 0;
    var _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
    var jsonTypes = new Set(_jsonTypes);
    function isJSONType(x) {
      return typeof x == "string" && jsonTypes.has(x);
    }
    exports2.isJSONType = isJSONType;
    function getRules() {
      const groups = {
        number: { type: "number", rules: [] },
        string: { type: "string", rules: [] },
        array: { type: "array", rules: [] },
        object: { type: "object", rules: [] }
      };
      return {
        types: { ...groups, integer: true, boolean: true, null: true },
        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
        post: { rules: [] },
        all: {},
        keywords: {}
      };
    }
    exports2.getRules = getRules;
  }
});

// node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS({
  "node_modules/ajv/dist/compile/validate/applicability.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.shouldUseRule = exports2.shouldUseGroup = exports2.schemaHasRulesForType = void 0;
    function schemaHasRulesForType({ schema, self }, type) {
      const group = self.RULES.types[type];
      return group && group !== true && shouldUseGroup(schema, group);
    }
    exports2.schemaHasRulesForType = schemaHasRulesForType;
    function shouldUseGroup(schema, group) {
      return group.rules.some((rule) => shouldUseRule(schema, rule));
    }
    exports2.shouldUseGroup = shouldUseGroup;
    function shouldUseRule(schema, rule) {
      var _a3;
      return schema[rule.keyword] !== void 0 || ((_a3 = rule.definition.implements) === null || _a3 === void 0 ? void 0 : _a3.some((kwd) => schema[kwd] !== void 0));
    }
    exports2.shouldUseRule = shouldUseRule;
  }
});

// node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS({
  "node_modules/ajv/dist/compile/validate/dataType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.reportTypeError = exports2.checkDataTypes = exports2.checkDataType = exports2.coerceAndCheckDataType = exports2.getJSONTypes = exports2.getSchemaTypes = exports2.DataType = void 0;
    var rules_1 = require_rules();
    var applicability_1 = require_applicability();
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var DataType;
    (function(DataType2) {
      DataType2[DataType2["Correct"] = 0] = "Correct";
      DataType2[DataType2["Wrong"] = 1] = "Wrong";
    })(DataType || (exports2.DataType = DataType = {}));
    function getSchemaTypes(schema) {
      const types = getJSONTypes(schema.type);
      const hasNull = types.includes("null");
      if (hasNull) {
        if (schema.nullable === false)
          throw new Error("type: null contradicts nullable: false");
      } else {
        if (!types.length && schema.nullable !== void 0) {
          throw new Error('"nullable" cannot be used without "type"');
        }
        if (schema.nullable === true)
          types.push("null");
      }
      return types;
    }
    exports2.getSchemaTypes = getSchemaTypes;
    function getJSONTypes(ts) {
      const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
      if (types.every(rules_1.isJSONType))
        return types;
      throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
    }
    exports2.getJSONTypes = getJSONTypes;
    function coerceAndCheckDataType(it, types) {
      const { gen, data, opts } = it;
      const coerceTo = coerceToTypes(types, opts.coerceTypes);
      const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
      if (checkTypes) {
        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
        gen.if(wrongType, () => {
          if (coerceTo.length)
            coerceData(it, types, coerceTo);
          else
            reportTypeError(it);
        });
      }
      return checkTypes;
    }
    exports2.coerceAndCheckDataType = coerceAndCheckDataType;
    var COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
    function coerceToTypes(types, coerceTypes) {
      return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
    }
    function coerceData(it, types, coerceTo) {
      const { gen, data, opts } = it;
      const dataType = gen.let("dataType", (0, codegen_1._)`typeof ${data}`);
      const coerced = gen.let("coerced", (0, codegen_1._)`undefined`);
      if (opts.coerceTypes === "array") {
        gen.if((0, codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1._)`${data}[0]`).assign(dataType, (0, codegen_1._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
      }
      gen.if((0, codegen_1._)`${coerced} !== undefined`);
      for (const t of coerceTo) {
        if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") {
          coerceSpecificType(t);
        }
      }
      gen.else();
      reportTypeError(it);
      gen.endIf();
      gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
        gen.assign(data, coerced);
        assignParentData(it, coerced);
      });
      function coerceSpecificType(t) {
        switch (t) {
          case "string":
            gen.elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1._)`"" + ${data}`).elseIf((0, codegen_1._)`${data} === null`).assign(coerced, (0, codegen_1._)`""`);
            return;
          case "number":
            gen.elseIf((0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "integer":
            gen.elseIf((0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "boolean":
            gen.elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
            return;
          case "null":
            gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
            gen.assign(coerced, null);
            return;
          case "array":
            gen.elseIf((0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1._)`[${data}]`);
        }
      }
    }
    function assignParentData({ gen, parentData, parentDataProperty }, expr) {
      gen.if((0, codegen_1._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr));
    }
    function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
      const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
      let cond;
      switch (dataType) {
        case "null":
          return (0, codegen_1._)`${data} ${EQ} null`;
        case "array":
          cond = (0, codegen_1._)`Array.isArray(${data})`;
          break;
        case "object":
          cond = (0, codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
          break;
        case "integer":
          cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
          break;
        case "number":
          cond = numCond();
          break;
        default:
          return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
      }
      return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
      function numCond(_cond = codegen_1.nil) {
        return (0, codegen_1.and)((0, codegen_1._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil);
      }
    }
    exports2.checkDataType = checkDataType;
    function checkDataTypes(dataTypes, data, strictNums, correct) {
      if (dataTypes.length === 1) {
        return checkDataType(dataTypes[0], data, strictNums, correct);
      }
      let cond;
      const types = (0, util_1.toHash)(dataTypes);
      if (types.array && types.object) {
        const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
        cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
        delete types.null;
        delete types.array;
        delete types.object;
      } else {
        cond = codegen_1.nil;
      }
      if (types.number)
        delete types.integer;
      for (const t in types)
        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
      return cond;
    }
    exports2.checkDataTypes = checkDataTypes;
    var typeError = {
      message: ({ schema }) => `must be ${schema}`,
      params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._)`{type: ${schema}}` : (0, codegen_1._)`{type: ${schemaValue}}`
    };
    function reportTypeError(it) {
      const cxt = getTypeErrorContext(it);
      (0, errors_1.reportError)(cxt, typeError);
    }
    exports2.reportTypeError = reportTypeError;
    function getTypeErrorContext(it) {
      const { gen, data, schema } = it;
      const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
      return {
        gen,
        keyword: "type",
        data,
        schema: schema.type,
        schemaCode,
        schemaValue: schemaCode,
        parentSchema: schema,
        params: {},
        it
      };
    }
  }
});

// node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS({
  "node_modules/ajv/dist/compile/validate/defaults.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.assignDefaults = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function assignDefaults(it, ty) {
      const { properties, items } = it.schema;
      if (ty === "object" && properties) {
        for (const key in properties) {
          assignDefault(it, key, properties[key].default);
        }
      } else if (ty === "array" && Array.isArray(items)) {
        items.forEach((sch, i) => assignDefault(it, i, sch.default));
      }
    }
    exports2.assignDefaults = assignDefaults;
    function assignDefault(it, prop, defaultValue) {
      const { gen, compositeRule, data, opts } = it;
      if (defaultValue === void 0)
        return;
      const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
      if (compositeRule) {
        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
        return;
      }
      let condition = (0, codegen_1._)`${childData} === undefined`;
      if (opts.useDefaults === "empty") {
        condition = (0, codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
      }
      gen.if(condition, (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
    }
  }
});

// node_modules/ajv/dist/vocabularies/code.js
var require_code2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/code.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateUnion = exports2.validateArray = exports2.usePattern = exports2.callValidateCode = exports2.schemaProperties = exports2.allSchemaProperties = exports2.noPropertyInData = exports2.propertyInData = exports2.isOwnProperty = exports2.hasPropFunc = exports2.reportMissingProp = exports2.checkMissingProp = exports2.checkReportMissingProp = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var util_2 = require_util();
    function checkReportMissingProp(cxt, prop) {
      const { gen, data, it } = cxt;
      gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
        cxt.error();
      });
    }
    exports2.checkReportMissingProp = checkReportMissingProp;
    function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
      return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._)`${missing} = ${prop}`)));
    }
    exports2.checkMissingProp = checkMissingProp;
    function reportMissingProp(cxt, missing) {
      cxt.setParams({ missingProperty: missing }, true);
      cxt.error();
    }
    exports2.reportMissingProp = reportMissingProp;
    function hasPropFunc(gen) {
      return gen.scopeValue("func", {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._)`Object.prototype.hasOwnProperty`
      });
    }
    exports2.hasPropFunc = hasPropFunc;
    function isOwnProperty(gen, data, property) {
      return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
    }
    exports2.isOwnProperty = isOwnProperty;
    function propertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
      return ownProperties ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
    }
    exports2.propertyInData = propertyInData;
    function noPropertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
      return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
    }
    exports2.noPropertyInData = noPropertyInData;
    function allSchemaProperties(schemaMap) {
      return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
    }
    exports2.allSchemaProperties = allSchemaProperties;
    function schemaProperties(it, schemaMap) {
      return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
    }
    exports2.schemaProperties = schemaProperties;
    function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
      const dataAndSchema = passSchema ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
      const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData]
      ];
      if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
      const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
      return context !== codegen_1.nil ? (0, codegen_1._)`${func}.call(${context}, ${args})` : (0, codegen_1._)`${func}(${args})`;
    }
    exports2.callValidateCode = callValidateCode;
    var newRegExp = (0, codegen_1._)`new RegExp`;
    function usePattern({ gen, it: { opts } }, pattern) {
      const u = opts.unicodeRegExp ? "u" : "";
      const { regExp } = opts.code;
      const rx = regExp(pattern, u);
      return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
      });
    }
    exports2.usePattern = usePattern;
    function validateArray(cxt) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
      }
      gen.var(valid, true);
      validateItems(() => gen.break());
      return valid;
      function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        gen.forRange("i", 0, len, (i) => {
          cxt.subschema({
            keyword,
            dataProp: i,
            dataPropType: util_1.Type.Num
          }, valid);
          gen.if((0, codegen_1.not)(valid), notValid);
        });
      }
    }
    exports2.validateArray = validateArray;
    function validateUnion(cxt) {
      const { gen, schema, keyword, it } = cxt;
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
      if (alwaysValid && !it.opts.unevaluated)
        return;
      const valid = gen.let("valid", false);
      const schValid = gen.name("_valid");
      gen.block(() => schema.forEach((_sch, i) => {
        const schCxt = cxt.subschema({
          keyword,
          schemaProp: i,
          compositeRule: true
        }, schValid);
        gen.assign(valid, (0, codegen_1._)`${valid} || ${schValid}`);
        const merged = cxt.mergeValidEvaluated(schCxt, schValid);
        if (!merged)
          gen.if((0, codegen_1.not)(valid));
      }));
      cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
    }
    exports2.validateUnion = validateUnion;
  }
});

// node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS({
  "node_modules/ajv/dist/compile/validate/keyword.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateKeywordUsage = exports2.validSchemaType = exports2.funcKeywordCode = exports2.macroKeywordCode = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var code_1 = require_code2();
    var errors_1 = require_errors();
    function macroKeywordCode(cxt, def) {
      const { gen, keyword, schema, parentSchema, it } = cxt;
      const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
      const schemaRef = useKeyword(gen, keyword, macroSchema);
      if (it.opts.validateSchema !== false)
        it.self.validateSchema(macroSchema, true);
      const valid = gen.name("valid");
      cxt.subschema({
        schema: macroSchema,
        schemaPath: codegen_1.nil,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
        topSchemaRef: schemaRef,
        compositeRule: true
      }, valid);
      cxt.pass(valid, () => cxt.error(true));
    }
    exports2.macroKeywordCode = macroKeywordCode;
    function funcKeywordCode(cxt, def) {
      var _a3;
      const { gen, keyword, schema, parentSchema, $data, it } = cxt;
      checkAsyncKeyword(it, def);
      const validate = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
      const validateRef = useKeyword(gen, keyword, validate);
      const valid = gen.let("valid");
      cxt.block$data(valid, validateKeyword);
      cxt.ok((_a3 = def.valid) !== null && _a3 !== void 0 ? _a3 : valid);
      function validateKeyword() {
        if (def.errors === false) {
          assignValid();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => cxt.error());
        } else {
          const ruleErrs = def.async ? validateAsync() : validateSync();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => addErrs(cxt, ruleErrs));
        }
      }
      function validateAsync() {
        const ruleErrs = gen.let("ruleErrs", null);
        gen.try(() => assignValid((0, codegen_1._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`), () => gen.throw(e)));
        return ruleErrs;
      }
      function validateSync() {
        const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
        gen.assign(validateErrs, null);
        assignValid(codegen_1.nil);
        return validateErrs;
      }
      function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
        const passSchema = !("compile" in def && !$data || def.schema === false);
        gen.assign(valid, (0, codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
      }
      function reportErrs(errors) {
        var _a4;
        gen.if((0, codegen_1.not)((_a4 = def.valid) !== null && _a4 !== void 0 ? _a4 : valid), errors);
      }
    }
    exports2.funcKeywordCode = funcKeywordCode;
    function modifyData(cxt) {
      const { gen, data, it } = cxt;
      gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`));
    }
    function addErrs(cxt, errs) {
      const { gen } = cxt;
      gen.if((0, codegen_1._)`Array.isArray(${errs})`, () => {
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
        (0, errors_1.extendErrors)(cxt);
      }, () => cxt.error());
    }
    function checkAsyncKeyword({ schemaEnv }, def) {
      if (def.async && !schemaEnv.$async)
        throw new Error("async keyword in sync schema");
    }
    function useKeyword(gen, keyword, result) {
      if (result === void 0)
        throw new Error(`keyword "${keyword}" failed to compile`);
      return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
    }
    function validSchemaType(schema, schemaType, allowUndefined = false) {
      return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
    }
    exports2.validSchemaType = validSchemaType;
    function validateKeywordUsage({ schema, opts, self, errSchemaPath }, def, keyword) {
      if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
        throw new Error("ajv implementation error");
      }
      const deps = def.dependencies;
      if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
      }
      if (def.validateSchema) {
        const valid = def.validateSchema(schema[keyword]);
        if (!valid) {
          const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def.validateSchema.errors);
          if (opts.validateSchema === "log")
            self.logger.error(msg);
          else
            throw new Error(msg);
        }
      }
    }
    exports2.validateKeywordUsage = validateKeywordUsage;
  }
});

// node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS({
  "node_modules/ajv/dist/compile/validate/subschema.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.extendSubschemaMode = exports2.extendSubschemaData = exports2.getSubschema = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
      if (keyword !== void 0 && schema !== void 0) {
        throw new Error('both "keyword" and "schema" passed, only one allowed');
      }
      if (keyword !== void 0) {
        const sch = it.schema[keyword];
        return schemaProp === void 0 ? {
          schema: sch,
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}`
        } : {
          schema: sch[schemaProp],
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
        };
      }
      if (schema !== void 0) {
        if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
          throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
        }
        return {
          schema,
          schemaPath,
          topSchemaRef,
          errSchemaPath
        };
      }
      throw new Error('either "keyword" or "schema" must be passed');
    }
    exports2.getSubschema = getSubschema;
    function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
      if (data !== void 0 && dataProp !== void 0) {
        throw new Error('both "data" and "dataProp" passed, only one allowed');
      }
      const { gen } = it;
      if (dataProp !== void 0) {
        const { errorPath, dataPathArr, opts } = it;
        const nextData = gen.let("data", (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
        dataContextProps(nextData);
        subschema.errorPath = (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
        subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
      }
      if (data !== void 0) {
        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true);
        dataContextProps(nextData);
        if (propertyName !== void 0)
          subschema.propertyName = propertyName;
      }
      if (dataTypes)
        subschema.dataTypes = dataTypes;
      function dataContextProps(_nextData) {
        subschema.data = _nextData;
        subschema.dataLevel = it.dataLevel + 1;
        subschema.dataTypes = [];
        it.definedProperties = /* @__PURE__ */ new Set();
        subschema.parentData = it.data;
        subschema.dataNames = [...it.dataNames, _nextData];
      }
    }
    exports2.extendSubschemaData = extendSubschemaData;
    function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
      if (compositeRule !== void 0)
        subschema.compositeRule = compositeRule;
      if (createErrors !== void 0)
        subschema.createErrors = createErrors;
      if (allErrors !== void 0)
        subschema.allErrors = allErrors;
      subschema.jtdDiscriminator = jtdDiscriminator;
      subschema.jtdMetadata = jtdMetadata;
    }
    exports2.extendSubschemaMode = extendSubschemaMode;
  }
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "node_modules/fast-deep-equal/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS({
  "node_modules/json-schema-traverse/index.js"(exports2, module2) {
    "use strict";
    var traverse = module2.exports = function(schema, opts, cb) {
      if (typeof opts == "function") {
        cb = opts;
        opts = {};
      }
      cb = opts.cb || cb;
      var pre = typeof cb == "function" ? cb : cb.pre || function() {
      };
      var post = cb.post || function() {
      };
      _traverse(opts, pre, post, schema, "", schema);
    };
    traverse.keywords = {
      additionalItems: true,
      items: true,
      contains: true,
      additionalProperties: true,
      propertyNames: true,
      not: true,
      if: true,
      then: true,
      else: true
    };
    traverse.arrayKeywords = {
      items: true,
      allOf: true,
      anyOf: true,
      oneOf: true
    };
    traverse.propsKeywords = {
      $defs: true,
      definitions: true,
      properties: true,
      patternProperties: true,
      dependencies: true
    };
    traverse.skipKeywords = {
      default: true,
      enum: true,
      const: true,
      required: true,
      maximum: true,
      minimum: true,
      exclusiveMaximum: true,
      exclusiveMinimum: true,
      multipleOf: true,
      maxLength: true,
      minLength: true,
      pattern: true,
      format: true,
      maxItems: true,
      minItems: true,
      uniqueItems: true,
      maxProperties: true,
      minProperties: true
    };
    function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
      if (schema && typeof schema == "object" && !Array.isArray(schema)) {
        pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        for (var key in schema) {
          var sch = schema[key];
          if (Array.isArray(sch)) {
            if (key in traverse.arrayKeywords) {
              for (var i = 0; i < sch.length; i++)
                _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
            }
          } else if (key in traverse.propsKeywords) {
            if (sch && typeof sch == "object") {
              for (var prop in sch)
                _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
            }
          } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
            _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
          }
        }
        post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }
    }
    function escapeJsonPtr(str) {
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
  }
});

// node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS({
  "node_modules/ajv/dist/compile/resolve.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getSchemaRefs = exports2.resolveUrl = exports2.normalizeId = exports2._getFullPath = exports2.getFullPath = exports2.inlineRef = void 0;
    var util_1 = require_util();
    var equal = require_fast_deep_equal();
    var traverse = require_json_schema_traverse();
    var SIMPLE_INLINED = /* @__PURE__ */ new Set([
      "type",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "maxProperties",
      "minProperties",
      "maxItems",
      "minItems",
      "maximum",
      "minimum",
      "uniqueItems",
      "multipleOf",
      "required",
      "enum",
      "const"
    ]);
    function inlineRef(schema, limit = true) {
      if (typeof schema == "boolean")
        return true;
      if (limit === true)
        return !hasRef(schema);
      if (!limit)
        return false;
      return countKeys(schema) <= limit;
    }
    exports2.inlineRef = inlineRef;
    var REF_KEYWORDS = /* @__PURE__ */ new Set([
      "$ref",
      "$recursiveRef",
      "$recursiveAnchor",
      "$dynamicRef",
      "$dynamicAnchor"
    ]);
    function hasRef(schema) {
      for (const key in schema) {
        if (REF_KEYWORDS.has(key))
          return true;
        const sch = schema[key];
        if (Array.isArray(sch) && sch.some(hasRef))
          return true;
        if (typeof sch == "object" && hasRef(sch))
          return true;
      }
      return false;
    }
    function countKeys(schema) {
      let count = 0;
      for (const key in schema) {
        if (key === "$ref")
          return Infinity;
        count++;
        if (SIMPLE_INLINED.has(key))
          continue;
        if (typeof schema[key] == "object") {
          (0, util_1.eachItem)(schema[key], (sch) => count += countKeys(sch));
        }
        if (count === Infinity)
          return Infinity;
      }
      return count;
    }
    function getFullPath(resolver, id = "", normalize) {
      if (normalize !== false)
        id = normalizeId(id);
      const p = resolver.parse(id);
      return _getFullPath(resolver, p);
    }
    exports2.getFullPath = getFullPath;
    function _getFullPath(resolver, p) {
      const serialized = resolver.serialize(p);
      return serialized.split("#")[0] + "#";
    }
    exports2._getFullPath = _getFullPath;
    var TRAILING_SLASH_HASH = /#\/?$/;
    function normalizeId(id) {
      return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
    }
    exports2.normalizeId = normalizeId;
    function resolveUrl(resolver, baseId, id) {
      id = normalizeId(id);
      return resolver.resolve(baseId, id);
    }
    exports2.resolveUrl = resolveUrl;
    var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
    function getSchemaRefs(schema, baseId) {
      if (typeof schema == "boolean")
        return {};
      const { schemaId, uriResolver } = this.opts;
      const schId = normalizeId(schema[schemaId] || baseId);
      const baseIds = { "": schId };
      const pathPrefix = getFullPath(uriResolver, schId, false);
      const localRefs = {};
      const schemaRefs = /* @__PURE__ */ new Set();
      traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
        if (parentJsonPtr === void 0)
          return;
        const fullPath = pathPrefix + jsonPtr;
        let innerBaseId = baseIds[parentJsonPtr];
        if (typeof sch[schemaId] == "string")
          innerBaseId = addRef.call(this, sch[schemaId]);
        addAnchor.call(this, sch.$anchor);
        addAnchor.call(this, sch.$dynamicAnchor);
        baseIds[jsonPtr] = innerBaseId;
        function addRef(ref) {
          const _resolve = this.opts.uriResolver.resolve;
          ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
          if (schemaRefs.has(ref))
            throw ambiguos(ref);
          schemaRefs.add(ref);
          let schOrRef = this.refs[ref];
          if (typeof schOrRef == "string")
            schOrRef = this.refs[schOrRef];
          if (typeof schOrRef == "object") {
            checkAmbiguosRef(sch, schOrRef.schema, ref);
          } else if (ref !== normalizeId(fullPath)) {
            if (ref[0] === "#") {
              checkAmbiguosRef(sch, localRefs[ref], ref);
              localRefs[ref] = sch;
            } else {
              this.refs[ref] = fullPath;
            }
          }
          return ref;
        }
        function addAnchor(anchor) {
          if (typeof anchor == "string") {
            if (!ANCHOR.test(anchor))
              throw new Error(`invalid anchor "${anchor}"`);
            addRef.call(this, `#${anchor}`);
          }
        }
      });
      return localRefs;
      function checkAmbiguosRef(sch1, sch2, ref) {
        if (sch2 !== void 0 && !equal(sch1, sch2))
          throw ambiguos(ref);
      }
      function ambiguos(ref) {
        return new Error(`reference "${ref}" resolves to more than one schema`);
      }
    }
    exports2.getSchemaRefs = getSchemaRefs;
  }
});

// node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS({
  "node_modules/ajv/dist/compile/validate/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getData = exports2.KeywordCxt = exports2.validateFunctionCode = void 0;
    var boolSchema_1 = require_boolSchema();
    var dataType_1 = require_dataType();
    var applicability_1 = require_applicability();
    var dataType_2 = require_dataType();
    var defaults_1 = require_defaults();
    var keyword_1 = require_keyword();
    var subschema_1 = require_subschema();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var errors_1 = require_errors();
    function validateFunctionCode(it) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          topSchemaObjCode(it);
          return;
        }
      }
      validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
    }
    exports2.validateFunctionCode = validateFunctionCode;
    function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
      if (opts.code.es5) {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
          gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
          destructureValCxtES5(gen, opts);
          gen.code(body);
        });
      } else {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
      }
    }
    function destructureValCxt(opts) {
      return (0, codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
    }
    function destructureValCxtES5(gen, opts) {
      gen.if(names_1.default.valCxt, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
        gen.var(names_1.default.rootData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
      }, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.rootData, names_1.default.data);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
      });
    }
    function topSchemaObjCode(it) {
      const { schema, opts, gen } = it;
      validateFunction(it, () => {
        if (opts.$comment && schema.$comment)
          commentKeyword(it);
        checkNoDefault(it);
        gen.let(names_1.default.vErrors, null);
        gen.let(names_1.default.errors, 0);
        if (opts.unevaluated)
          resetEvaluated(it);
        typeAndKeywords(it);
        returnResults(it);
      });
      return;
    }
    function resetEvaluated(it) {
      const { gen, validateName } = it;
      it.evaluated = gen.const("evaluated", (0, codegen_1._)`${validateName}.evaluated`);
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`));
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`));
    }
    function funcSourceUrl(schema, opts) {
      const schId = typeof schema == "object" && schema[opts.schemaId];
      return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._)`/*# sourceURL=${schId} */` : codegen_1.nil;
    }
    function subschemaCode(it, valid) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          subSchemaObjCode(it, valid);
          return;
        }
      }
      (0, boolSchema_1.boolOrEmptySchema)(it, valid);
    }
    function schemaCxtHasRules({ schema, self }) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (self.RULES.all[key])
          return true;
      return false;
    }
    function isSchemaObj(it) {
      return typeof it.schema != "boolean";
    }
    function subSchemaObjCode(it, valid) {
      const { schema, gen, opts } = it;
      if (opts.$comment && schema.$comment)
        commentKeyword(it);
      updateContext(it);
      checkAsyncSchema(it);
      const errsCount = gen.const("_errs", names_1.default.errors);
      typeAndKeywords(it, errsCount);
      gen.var(valid, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
    }
    function checkKeywords(it) {
      (0, util_1.checkUnknownRules)(it);
      checkRefsAndKeywords(it);
    }
    function typeAndKeywords(it, errsCount) {
      if (it.opts.jtd)
        return schemaKeywords(it, [], false, errsCount);
      const types = (0, dataType_1.getSchemaTypes)(it.schema);
      const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
      schemaKeywords(it, types, !checkedTypes, errsCount);
    }
    function checkRefsAndKeywords(it) {
      const { schema, errSchemaPath, opts, self } = it;
      if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self.RULES)) {
        self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
      }
    }
    function checkNoDefault(it) {
      const { schema, opts } = it;
      if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
      }
    }
    function updateContext(it) {
      const schId = it.schema[it.opts.schemaId];
      if (schId)
        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
    }
    function checkAsyncSchema(it) {
      if (it.schema.$async && !it.schemaEnv.$async)
        throw new Error("async schema in sync schema");
    }
    function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
      const msg = schema.$comment;
      if (opts.$comment === true) {
        gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
      } else if (typeof opts.$comment == "function") {
        const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
        gen.code((0, codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
      }
    }
    function returnResults(it) {
      const { gen, schemaEnv, validateName, ValidationError, opts } = it;
      if (schemaEnv.$async) {
        gen.if((0, codegen_1._)`${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`));
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
        if (opts.unevaluated)
          assignEvaluated(it);
        gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
      }
    }
    function assignEvaluated({ gen, evaluated, props, items }) {
      if (props instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.props`, props);
      if (items instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.items`, items);
    }
    function schemaKeywords(it, types, typeErrors, errsCount) {
      const { gen, schema, data, allErrors, opts, self } = it;
      const { RULES } = self;
      if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
        return;
      }
      if (!opts.jtd)
        checkStrictTypes(it, types);
      gen.block(() => {
        for (const group of RULES.rules)
          groupKeywords(group);
        groupKeywords(RULES.post);
      });
      function groupKeywords(group) {
        if (!(0, applicability_1.shouldUseGroup)(schema, group))
          return;
        if (group.type) {
          gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
          iterateKeywords(it, group);
          if (types.length === 1 && types[0] === group.type && typeErrors) {
            gen.else();
            (0, dataType_2.reportTypeError)(it);
          }
          gen.endIf();
        } else {
          iterateKeywords(it, group);
        }
        if (!allErrors)
          gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
      }
    }
    function iterateKeywords(it, group) {
      const { gen, schema, opts: { useDefaults } } = it;
      if (useDefaults)
        (0, defaults_1.assignDefaults)(it, group.type);
      gen.block(() => {
        for (const rule of group.rules) {
          if ((0, applicability_1.shouldUseRule)(schema, rule)) {
            keywordCode(it, rule.keyword, rule.definition, group.type);
          }
        }
      });
    }
    function checkStrictTypes(it, types) {
      if (it.schemaEnv.meta || !it.opts.strictTypes)
        return;
      checkContextTypes(it, types);
      if (!it.opts.allowUnionTypes)
        checkMultipleTypes(it, types);
      checkKeywordTypes(it, it.dataTypes);
    }
    function checkContextTypes(it, types) {
      if (!types.length)
        return;
      if (!it.dataTypes.length) {
        it.dataTypes = types;
        return;
      }
      types.forEach((t) => {
        if (!includesType(it.dataTypes, t)) {
          strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
        }
      });
      narrowSchemaTypes(it, types);
    }
    function checkMultipleTypes(it, ts) {
      if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
      }
    }
    function checkKeywordTypes(it, ts) {
      const rules = it.self.RULES.all;
      for (const keyword in rules) {
        const rule = rules[keyword];
        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
          const { type } = rule.definition;
          if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
            strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
          }
        }
      }
    }
    function hasApplicableType(schTs, kwdT) {
      return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
    }
    function includesType(ts, t) {
      return ts.includes(t) || t === "integer" && ts.includes("number");
    }
    function narrowSchemaTypes(it, withTypes) {
      const ts = [];
      for (const t of it.dataTypes) {
        if (includesType(withTypes, t))
          ts.push(t);
        else if (withTypes.includes("integer") && t === "number")
          ts.push("integer");
      }
      it.dataTypes = ts;
    }
    function strictTypesError(it, msg) {
      const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
      msg += ` at "${schemaPath}" (strictTypes)`;
      (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
    }
    var KeywordCxt = class {
      constructor(it, def, keyword) {
        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
        this.gen = it.gen;
        this.allErrors = it.allErrors;
        this.keyword = keyword;
        this.data = it.data;
        this.schema = it.schema[keyword];
        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
        this.schemaType = def.schemaType;
        this.parentSchema = it.schema;
        this.params = {};
        this.it = it;
        this.def = def;
        if (this.$data) {
          this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
        } else {
          this.schemaCode = this.schemaValue;
          if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
            throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
          }
        }
        if ("code" in def ? def.trackErrors : def.errors !== false) {
          this.errsCount = it.gen.const("_errs", names_1.default.errors);
        }
      }
      result(condition, successAction, failAction) {
        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
      }
      failResult(condition, successAction, failAction) {
        this.gen.if(condition);
        if (failAction)
          failAction();
        else
          this.error();
        if (successAction) {
          this.gen.else();
          successAction();
          if (this.allErrors)
            this.gen.endIf();
        } else {
          if (this.allErrors)
            this.gen.endIf();
          else
            this.gen.else();
        }
      }
      pass(condition, failAction) {
        this.failResult((0, codegen_1.not)(condition), void 0, failAction);
      }
      fail(condition) {
        if (condition === void 0) {
          this.error();
          if (!this.allErrors)
            this.gen.if(false);
          return;
        }
        this.gen.if(condition);
        this.error();
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
      fail$data(condition) {
        if (!this.$data)
          return this.fail(condition);
        const { schemaCode } = this;
        this.fail((0, codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
      }
      error(append, errorParams, errorPaths) {
        if (errorParams) {
          this.setParams(errorParams);
          this._error(append, errorPaths);
          this.setParams({});
          return;
        }
        this._error(append, errorPaths);
      }
      _error(append, errorPaths) {
        ;
        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
      }
      $dataError() {
        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
      }
      reset() {
        if (this.errsCount === void 0)
          throw new Error('add "trackErrors" to keyword definition');
        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
      }
      ok(cond) {
        if (!this.allErrors)
          this.gen.if(cond);
      }
      setParams(obj, assign) {
        if (assign)
          Object.assign(this.params, obj);
        else
          this.params = obj;
      }
      block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
        this.gen.block(() => {
          this.check$data(valid, $dataValid);
          codeBlock();
        });
      }
      check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
        if (!this.$data)
          return;
        const { gen, schemaCode, schemaType, def } = this;
        gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
        if (valid !== codegen_1.nil)
          gen.assign(valid, true);
        if (schemaType.length || def.validateSchema) {
          gen.elseIf(this.invalid$data());
          this.$dataError();
          if (valid !== codegen_1.nil)
            gen.assign(valid, false);
        }
        gen.else();
      }
      invalid$data() {
        const { gen, schemaCode, schemaType, def, it } = this;
        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
        function wrong$DataType() {
          if (schemaType.length) {
            if (!(schemaCode instanceof codegen_1.Name))
              throw new Error("ajv implementation error");
            const st = Array.isArray(schemaType) ? schemaType : [schemaType];
            return (0, codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
          }
          return codegen_1.nil;
        }
        function invalid$DataSchema() {
          if (def.validateSchema) {
            const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema });
            return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
          }
          return codegen_1.nil;
        }
      }
      subschema(appl, valid) {
        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
        (0, subschema_1.extendSubschemaMode)(subschema, appl);
        const nextContext = { ...this.it, ...subschema, items: void 0, props: void 0 };
        subschemaCode(nextContext, valid);
        return nextContext;
      }
      mergeEvaluated(schemaCxt, toName) {
        const { it, gen } = this;
        if (!it.opts.unevaluated)
          return;
        if (it.props !== true && schemaCxt.props !== void 0) {
          it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
        }
        if (it.items !== true && schemaCxt.items !== void 0) {
          it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
        }
      }
      mergeValidEvaluated(schemaCxt, valid) {
        const { it, gen } = this;
        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
          gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
          return true;
        }
      }
    };
    exports2.KeywordCxt = KeywordCxt;
    function keywordCode(it, keyword, def, ruleType) {
      const cxt = new KeywordCxt(it, def, keyword);
      if ("code" in def) {
        def.code(cxt, ruleType);
      } else if (cxt.$data && def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      } else if ("macro" in def) {
        (0, keyword_1.macroKeywordCode)(cxt, def);
      } else if (def.compile || def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      }
    }
    var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
    var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function getData($data, { dataLevel, dataNames, dataPathArr }) {
      let jsonPointer;
      let data;
      if ($data === "")
        return names_1.default.rootData;
      if ($data[0] === "/") {
        if (!JSON_POINTER.test($data))
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        jsonPointer = $data;
        data = names_1.default.rootData;
      } else {
        const matches = RELATIVE_JSON_POINTER.exec($data);
        if (!matches)
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        const up = +matches[1];
        jsonPointer = matches[2];
        if (jsonPointer === "#") {
          if (up >= dataLevel)
            throw new Error(errorMsg("property/index", up));
          return dataPathArr[dataLevel - up];
        }
        if (up > dataLevel)
          throw new Error(errorMsg("data", up));
        data = dataNames[dataLevel - up];
        if (!jsonPointer)
          return data;
      }
      let expr = data;
      const segments = jsonPointer.split("/");
      for (const segment of segments) {
        if (segment) {
          data = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
          expr = (0, codegen_1._)`${expr} && ${data}`;
        }
      }
      return expr;
      function errorMsg(pointerType, up) {
        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
      }
    }
    exports2.getData = getData;
  }
});

// node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS({
  "node_modules/ajv/dist/runtime/validation_error.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var ValidationError = class extends Error {
      constructor(errors) {
        super("validation failed");
        this.errors = errors;
        this.ajv = this.validation = true;
      }
    };
    exports2.default = ValidationError;
  }
});

// node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS({
  "node_modules/ajv/dist/compile/ref_error.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var resolve_1 = require_resolve();
    var MissingRefError = class extends Error {
      constructor(resolver, baseId, ref, msg) {
        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
      }
    };
    exports2.default = MissingRefError;
  }
});

// node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS({
  "node_modules/ajv/dist/compile/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resolveSchema = exports2.getCompilingSchema = exports2.resolveRef = exports2.compileSchema = exports2.SchemaEnv = void 0;
    var codegen_1 = require_codegen();
    var validation_error_1 = require_validation_error();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var validate_1 = require_validate();
    var SchemaEnv = class {
      constructor(env) {
        var _a3;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
          schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a3 = env.baseId) !== null && _a3 !== void 0 ? _a3 : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
      }
    };
    exports2.SchemaEnv = SchemaEnv;
    function compileSchema(sch) {
      const _sch = getCompilingSchema.call(this, sch);
      if (_sch)
        return _sch;
      const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
      const { es5, lines } = this.opts.code;
      const { ownProperties } = this.opts;
      const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
      let _ValidationError;
      if (sch.$async) {
        _ValidationError = gen.scopeValue("Error", {
          ref: validation_error_1.default,
          code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`
        });
      }
      const validateName = gen.scopeName("validate");
      sch.validateName = validateName;
      const schemaCxt = {
        gen,
        allErrors: this.opts.allErrors,
        data: names_1.default.data,
        parentData: names_1.default.parentData,
        parentDataProperty: names_1.default.parentDataProperty,
        dataNames: [names_1.default.data],
        dataPathArr: [codegen_1.nil],
        // TODO can its length be used as dataLevel if nil is removed?
        dataLevel: 0,
        dataTypes: [],
        definedProperties: /* @__PURE__ */ new Set(),
        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) } : { ref: sch.schema }),
        validateName,
        ValidationError: _ValidationError,
        schema: sch.schema,
        schemaEnv: sch,
        rootId,
        baseId: sch.baseId || rootId,
        schemaPath: codegen_1.nil,
        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
        errorPath: (0, codegen_1._)`""`,
        opts: this.opts,
        self: this
      };
      let sourceCode;
      try {
        this._compilations.add(sch);
        (0, validate_1.validateFunctionCode)(schemaCxt);
        gen.optimize(this.opts.code.optimize);
        const validateCode = gen.toString();
        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        if (this.opts.code.process)
          sourceCode = this.opts.code.process(sourceCode, sch);
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
        const validate = makeValidate(this, this.scope.get());
        this.scope.value(validateName, { ref: validate });
        validate.errors = null;
        validate.schema = sch.schema;
        validate.schemaEnv = sch;
        if (sch.$async)
          validate.$async = true;
        if (this.opts.code.source === true) {
          validate.source = { validateName, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
          const { props, items } = schemaCxt;
          validate.evaluated = {
            props: props instanceof codegen_1.Name ? void 0 : props,
            items: items instanceof codegen_1.Name ? void 0 : items,
            dynamicProps: props instanceof codegen_1.Name,
            dynamicItems: items instanceof codegen_1.Name
          };
          if (validate.source)
            validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated);
        }
        sch.validate = validate;
        return sch;
      } catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (sourceCode)
          this.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
      } finally {
        this._compilations.delete(sch);
      }
    }
    exports2.compileSchema = compileSchema;
    function resolveRef(root, baseId, ref) {
      var _a3;
      ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
      const schOrFunc = root.refs[ref];
      if (schOrFunc)
        return schOrFunc;
      let _sch = resolve3.call(this, root, ref);
      if (_sch === void 0) {
        const schema = (_a3 = root.localRefs) === null || _a3 === void 0 ? void 0 : _a3[ref];
        const { schemaId } = this.opts;
        if (schema)
          _sch = new SchemaEnv({ schema, schemaId, root, baseId });
      }
      if (_sch === void 0)
        return;
      return root.refs[ref] = inlineOrCompile.call(this, _sch);
    }
    exports2.resolveRef = resolveRef;
    function inlineOrCompile(sch) {
      if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
        return sch.schema;
      return sch.validate ? sch : compileSchema.call(this, sch);
    }
    function getCompilingSchema(schEnv) {
      for (const sch of this._compilations) {
        if (sameSchemaEnv(sch, schEnv))
          return sch;
      }
    }
    exports2.getCompilingSchema = getCompilingSchema;
    function sameSchemaEnv(s1, s2) {
      return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
    }
    function resolve3(root, ref) {
      let sch;
      while (typeof (sch = this.refs[ref]) == "string")
        ref = sch;
      return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
    }
    function resolveSchema(root, ref) {
      const p = this.opts.uriResolver.parse(ref);
      const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
      let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
      if (Object.keys(root.schema).length > 0 && refPath === baseId) {
        return getJsonPointer.call(this, p, root);
      }
      const id = (0, resolve_1.normalizeId)(refPath);
      const schOrRef = this.refs[id] || this.schemas[id];
      if (typeof schOrRef == "string") {
        const sch = resolveSchema.call(this, root, schOrRef);
        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
          return;
        return getJsonPointer.call(this, p, sch);
      }
      if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
        return;
      if (!schOrRef.validate)
        compileSchema.call(this, schOrRef);
      if (id === (0, resolve_1.normalizeId)(ref)) {
        const { schema } = schOrRef;
        const { schemaId } = this.opts;
        const schId = schema[schemaId];
        if (schId)
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        return new SchemaEnv({ schema, schemaId, root, baseId });
      }
      return getJsonPointer.call(this, p, schOrRef);
    }
    exports2.resolveSchema = resolveSchema;
    var PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
      "properties",
      "patternProperties",
      "enum",
      "dependencies",
      "definitions"
    ]);
    function getJsonPointer(parsedRef, { baseId, schema, root }) {
      var _a3;
      if (((_a3 = parsedRef.fragment) === null || _a3 === void 0 ? void 0 : _a3[0]) !== "/")
        return;
      for (const part of parsedRef.fragment.slice(1).split("/")) {
        if (typeof schema === "boolean")
          return;
        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
        if (partSchema === void 0)
          return;
        schema = partSchema;
        const schId = typeof schema === "object" && schema[this.opts.schemaId];
        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        }
      }
      let env;
      if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
        env = resolveSchema.call(this, root, $ref);
      }
      const { schemaId } = this.opts;
      env = env || new SchemaEnv({ schema, schemaId, root, baseId });
      if (env.schema !== env.root.schema)
        return env;
      return void 0;
    }
  }
});

// node_modules/ajv/dist/refs/data.json
var require_data = __commonJS({
  "node_modules/ajv/dist/refs/data.json"(exports2, module2) {
    module2.exports = {
      $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
      description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
      type: "object",
      required: ["$data"],
      properties: {
        $data: {
          type: "string",
          anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
        }
      },
      additionalProperties: false
    };
  }
});

// node_modules/fast-uri/lib/utils.js
var require_utils = __commonJS({
  "node_modules/fast-uri/lib/utils.js"(exports2, module2) {
    "use strict";
    var isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
    var isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
    var isHexPair = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu);
    var isUnreserved = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu);
    var isPathCharacter = RegExp.prototype.test.bind(/^[\da-z\-._~!$&'()*+,;=:@/]$/iu);
    function stringArrayToHexStripped(input) {
      let acc = "";
      let code = 0;
      let i = 0;
      for (i = 0; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (code === 48) {
          continue;
        }
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
        break;
      }
      for (i += 1; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
      }
      return acc;
    }
    var nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
    function consumeIsZone(buffer) {
      buffer.length = 0;
      return true;
    }
    function consumeHextets(buffer, address, output) {
      if (buffer.length) {
        const hex = stringArrayToHexStripped(buffer);
        if (hex !== "") {
          address.push(hex);
        } else {
          output.error = true;
          return false;
        }
        buffer.length = 0;
      }
      return true;
    }
    function getIPV6(input) {
      let tokenCount = 0;
      const output = { error: false, address: "", zone: "" };
      const address = [];
      const buffer = [];
      let endipv6Encountered = false;
      let endIpv6 = false;
      let consume = consumeHextets;
      for (let i = 0; i < input.length; i++) {
        const cursor = input[i];
        if (cursor === "[" || cursor === "]") {
          continue;
        }
        if (cursor === ":") {
          if (endipv6Encountered === true) {
            endIpv6 = true;
          }
          if (!consume(buffer, address, output)) {
            break;
          }
          if (++tokenCount > 7) {
            output.error = true;
            break;
          }
          if (i > 0 && input[i - 1] === ":") {
            endipv6Encountered = true;
          }
          address.push(":");
          continue;
        } else if (cursor === "%") {
          if (!consume(buffer, address, output)) {
            break;
          }
          consume = consumeIsZone;
        } else {
          buffer.push(cursor);
          continue;
        }
      }
      if (buffer.length) {
        if (consume === consumeIsZone) {
          output.zone = buffer.join("");
        } else if (endIpv6) {
          address.push(buffer.join(""));
        } else {
          address.push(stringArrayToHexStripped(buffer));
        }
      }
      output.address = address.join("");
      return output;
    }
    function normalizeIPv6(host) {
      if (findToken(host, ":") < 2) {
        return { host, isIPV6: false };
      }
      const ipv62 = getIPV6(host);
      if (!ipv62.error) {
        let newHost = ipv62.address;
        let escapedHost = ipv62.address;
        if (ipv62.zone) {
          newHost += "%" + ipv62.zone;
          escapedHost += "%25" + ipv62.zone;
        }
        return { host: newHost, isIPV6: true, escapedHost };
      } else {
        return { host, isIPV6: false };
      }
    }
    function findToken(str, token) {
      let ind = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === token) ind++;
      }
      return ind;
    }
    function removeDotSegments(path2) {
      let input = path2;
      const output = [];
      let nextSlash = -1;
      let len = 0;
      while (len = input.length) {
        if (len === 1) {
          if (input === ".") {
            break;
          } else if (input === "/") {
            output.push("/");
            break;
          } else {
            output.push(input);
            break;
          }
        } else if (len === 2) {
          if (input[0] === ".") {
            if (input[1] === ".") {
              break;
            } else if (input[1] === "/") {
              input = input.slice(2);
              continue;
            }
          } else if (input[0] === "/") {
            if (input[1] === "." || input[1] === "/") {
              output.push("/");
              break;
            }
          }
        } else if (len === 3) {
          if (input === "/..") {
            if (output.length !== 0) {
              output.pop();
            }
            output.push("/");
            break;
          }
        }
        if (input[0] === ".") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(3);
              continue;
            }
          } else if (input[1] === "/") {
            input = input.slice(2);
            continue;
          }
        } else if (input[0] === "/") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(2);
              continue;
            } else if (input[2] === ".") {
              if (input[3] === "/") {
                input = input.slice(3);
                if (output.length !== 0) {
                  output.pop();
                }
                continue;
              }
            }
          }
        }
        if ((nextSlash = input.indexOf("/", 1)) === -1) {
          output.push(input);
          break;
        } else {
          output.push(input.slice(0, nextSlash));
          input = input.slice(nextSlash);
        }
      }
      return output.join("");
    }
    var HOST_DELIMS = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" };
    var HOST_DELIM_RE = /[@/?#:]/g;
    var HOST_DELIM_NO_COLON_RE = /[@/?#]/g;
    function reescapeHostDelimiters(host, isIP) {
      const re = isIP ? HOST_DELIM_NO_COLON_RE : HOST_DELIM_RE;
      re.lastIndex = 0;
      return host.replace(re, (ch) => HOST_DELIMS[ch]);
    }
    function normalizePercentEncoding(input, decodeUnreserved = false) {
      if (input.indexOf("%") === -1) {
        return input;
      }
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decodeUnreserved && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        output += input[i];
      }
      return output;
    }
    function normalizePathEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decoded !== "." && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isPathCharacter(input[i])) {
          output += input[i];
        } else {
          output += escape(input[i]);
        }
      }
      return output;
    }
    function escapePreservingEscapes(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        output += escape(input[i]);
      }
      return output;
    }
    function recomposeAuthority(component) {
      const uriTokens = [];
      if (component.userinfo !== void 0) {
        uriTokens.push(component.userinfo);
        uriTokens.push("@");
      }
      if (component.host !== void 0) {
        let host = unescape(component.host);
        if (!isIPv4(host)) {
          const ipV6res = normalizeIPv6(host);
          if (ipV6res.isIPV6 === true) {
            host = `[${ipV6res.escapedHost}]`;
          } else {
            host = reescapeHostDelimiters(host, false);
          }
        }
        uriTokens.push(host);
      }
      if (typeof component.port === "number" || typeof component.port === "string") {
        uriTokens.push(":");
        uriTokens.push(String(component.port));
      }
      return uriTokens.length ? uriTokens.join("") : void 0;
    }
    module2.exports = {
      nonSimpleDomain,
      recomposeAuthority,
      reescapeHostDelimiters,
      normalizePercentEncoding,
      normalizePathEncoding,
      escapePreservingEscapes,
      removeDotSegments,
      isIPv4,
      isUUID,
      normalizeIPv6,
      stringArrayToHexStripped
    };
  }
});

// node_modules/fast-uri/lib/schemes.js
var require_schemes = __commonJS({
  "node_modules/fast-uri/lib/schemes.js"(exports2, module2) {
    "use strict";
    var { isUUID } = require_utils();
    var URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
    var supportedSchemeNames = (
      /** @type {const} */
      [
        "http",
        "https",
        "ws",
        "wss",
        "urn",
        "urn:uuid"
      ]
    );
    function isValidSchemeName(name) {
      return supportedSchemeNames.indexOf(
        /** @type {*} */
        name
      ) !== -1;
    }
    function wsIsSecure(wsComponent) {
      if (wsComponent.secure === true) {
        return true;
      } else if (wsComponent.secure === false) {
        return false;
      } else if (wsComponent.scheme) {
        return wsComponent.scheme.length === 3 && (wsComponent.scheme[0] === "w" || wsComponent.scheme[0] === "W") && (wsComponent.scheme[1] === "s" || wsComponent.scheme[1] === "S") && (wsComponent.scheme[2] === "s" || wsComponent.scheme[2] === "S");
      } else {
        return false;
      }
    }
    function httpParse(component) {
      if (!component.host) {
        component.error = component.error || "HTTP URIs must have a host.";
      }
      return component;
    }
    function httpSerialize(component) {
      const secure = String(component.scheme).toLowerCase() === "https";
      if (component.port === (secure ? 443 : 80) || component.port === "") {
        component.port = void 0;
      }
      if (!component.path) {
        component.path = "/";
      }
      return component;
    }
    function wsParse(wsComponent) {
      wsComponent.secure = wsIsSecure(wsComponent);
      wsComponent.resourceName = (wsComponent.path || "/") + (wsComponent.query ? "?" + wsComponent.query : "");
      wsComponent.path = void 0;
      wsComponent.query = void 0;
      return wsComponent;
    }
    function wsSerialize(wsComponent) {
      if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === "") {
        wsComponent.port = void 0;
      }
      if (typeof wsComponent.secure === "boolean") {
        wsComponent.scheme = wsComponent.secure ? "wss" : "ws";
        wsComponent.secure = void 0;
      }
      if (wsComponent.resourceName) {
        const [path2, query] = wsComponent.resourceName.split("?");
        wsComponent.path = path2 && path2 !== "/" ? path2 : void 0;
        wsComponent.query = query;
        wsComponent.resourceName = void 0;
      }
      wsComponent.fragment = void 0;
      return wsComponent;
    }
    function urnParse(urnComponent, options) {
      if (!urnComponent.path) {
        urnComponent.error = "URN can not be parsed";
        return urnComponent;
      }
      const matches = urnComponent.path.match(URN_REG);
      if (matches) {
        const scheme = options.scheme || urnComponent.scheme || "urn";
        urnComponent.nid = matches[1].toLowerCase();
        urnComponent.nss = matches[2];
        const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
        const schemeHandler = getSchemeHandler(urnScheme);
        urnComponent.path = void 0;
        if (schemeHandler) {
          urnComponent = schemeHandler.parse(urnComponent, options);
        }
      } else {
        urnComponent.error = urnComponent.error || "URN can not be parsed.";
      }
      return urnComponent;
    }
    function urnSerialize(urnComponent, options) {
      if (urnComponent.nid === void 0) {
        throw new Error("URN without nid cannot be serialized");
      }
      const scheme = options.scheme || urnComponent.scheme || "urn";
      const nid = urnComponent.nid.toLowerCase();
      const urnScheme = `${scheme}:${options.nid || nid}`;
      const schemeHandler = getSchemeHandler(urnScheme);
      if (schemeHandler) {
        urnComponent = schemeHandler.serialize(urnComponent, options);
      }
      const uriComponent = urnComponent;
      const nss = urnComponent.nss;
      uriComponent.path = `${nid || options.nid}:${nss}`;
      options.skipEscape = true;
      return uriComponent;
    }
    function urnuuidParse(urnComponent, options) {
      const uuidComponent = urnComponent;
      uuidComponent.uuid = uuidComponent.nss;
      uuidComponent.nss = void 0;
      if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
        uuidComponent.error = uuidComponent.error || "UUID is not valid.";
      }
      return uuidComponent;
    }
    function urnuuidSerialize(uuidComponent) {
      const urnComponent = uuidComponent;
      urnComponent.nss = (uuidComponent.uuid || "").toLowerCase();
      return urnComponent;
    }
    var http = (
      /** @type {SchemeHandler} */
      {
        scheme: "http",
        domainHost: true,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var https = (
      /** @type {SchemeHandler} */
      {
        scheme: "https",
        domainHost: http.domainHost,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var ws = (
      /** @type {SchemeHandler} */
      {
        scheme: "ws",
        domainHost: true,
        parse: wsParse,
        serialize: wsSerialize
      }
    );
    var wss = (
      /** @type {SchemeHandler} */
      {
        scheme: "wss",
        domainHost: ws.domainHost,
        parse: ws.parse,
        serialize: ws.serialize
      }
    );
    var urn = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn",
        parse: urnParse,
        serialize: urnSerialize,
        skipNormalize: true
      }
    );
    var urnuuid = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn:uuid",
        parse: urnuuidParse,
        serialize: urnuuidSerialize,
        skipNormalize: true
      }
    );
    var SCHEMES = (
      /** @type {Record<SchemeName, SchemeHandler>} */
      {
        http,
        https,
        ws,
        wss,
        urn,
        "urn:uuid": urnuuid
      }
    );
    Object.setPrototypeOf(SCHEMES, null);
    function getSchemeHandler(scheme) {
      return scheme && (SCHEMES[
        /** @type {SchemeName} */
        scheme
      ] || SCHEMES[
        /** @type {SchemeName} */
        scheme.toLowerCase()
      ]) || void 0;
    }
    module2.exports = {
      wsIsSecure,
      SCHEMES,
      isValidSchemeName,
      getSchemeHandler
    };
  }
});

// node_modules/fast-uri/index.js
var require_fast_uri = __commonJS({
  "node_modules/fast-uri/index.js"(exports2, module2) {
    "use strict";
    var { normalizeIPv6, removeDotSegments, recomposeAuthority, normalizePercentEncoding, normalizePathEncoding, escapePreservingEscapes, reescapeHostDelimiters, isIPv4, nonSimpleDomain } = require_utils();
    var { SCHEMES, getSchemeHandler } = require_schemes();
    function normalize(uri, options) {
      if (typeof uri === "string") {
        uri = /** @type {T} */
        normalizeString(uri, options);
      } else if (typeof uri === "object") {
        uri = /** @type {T} */
        parse3(serialize(uri, options), options);
      }
      return uri;
    }
    function resolve3(baseURI, relativeURI, options) {
      const schemelessOptions = options ? Object.assign({ scheme: "null" }, options) : { scheme: "null" };
      const resolved = resolveComponent(parse3(baseURI, schemelessOptions), parse3(relativeURI, schemelessOptions), schemelessOptions, true);
      schemelessOptions.skipEscape = true;
      return serialize(resolved, schemelessOptions);
    }
    function resolveComponent(base, relative, options, skipNormalization) {
      const target = {};
      if (!skipNormalization) {
        base = parse3(serialize(base, options), options);
        relative = parse3(serialize(relative, options), options);
      }
      options = options || {};
      if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
      } else {
        if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || "");
          target.query = relative.query;
        } else {
          if (!relative.path) {
            target.path = base.path;
            if (relative.query !== void 0) {
              target.query = relative.query;
            } else {
              target.query = base.query;
            }
          } else {
            if (relative.path[0] === "/") {
              target.path = removeDotSegments(relative.path);
            } else {
              if ((base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0) && !base.path) {
                target.path = "/" + relative.path;
              } else if (!base.path) {
                target.path = relative.path;
              } else {
                target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
              }
              target.path = removeDotSegments(target.path);
            }
            target.query = relative.query;
          }
          target.userinfo = base.userinfo;
          target.host = base.host;
          target.port = base.port;
        }
        target.scheme = base.scheme;
      }
      target.fragment = relative.fragment;
      return target;
    }
    function equal(uriA, uriB, options) {
      const normalizedA = normalizeComparableURI(uriA, options);
      const normalizedB = normalizeComparableURI(uriB, options);
      return normalizedA !== void 0 && normalizedB !== void 0 && normalizedA.toLowerCase() === normalizedB.toLowerCase();
    }
    function serialize(cmpts, opts) {
      const component = {
        host: cmpts.host,
        scheme: cmpts.scheme,
        userinfo: cmpts.userinfo,
        port: cmpts.port,
        path: cmpts.path,
        query: cmpts.query,
        nid: cmpts.nid,
        nss: cmpts.nss,
        uuid: cmpts.uuid,
        fragment: cmpts.fragment,
        reference: cmpts.reference,
        resourceName: cmpts.resourceName,
        secure: cmpts.secure,
        error: ""
      };
      const options = Object.assign({}, opts);
      const uriTokens = [];
      const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
      if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);
      if (component.path !== void 0) {
        if (!options.skipEscape) {
          component.path = escapePreservingEscapes(component.path);
          if (component.scheme !== void 0) {
            component.path = component.path.split("%3A").join(":");
          }
        } else {
          component.path = normalizePercentEncoding(component.path);
        }
      }
      if (options.reference !== "suffix" && component.scheme) {
        uriTokens.push(component.scheme, ":");
      }
      const authority = recomposeAuthority(component);
      if (authority !== void 0) {
        if (options.reference !== "suffix") {
          uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (component.path && component.path[0] !== "/") {
          uriTokens.push("/");
        }
      }
      if (component.path !== void 0) {
        let s = component.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
          s = removeDotSegments(s);
        }
        if (authority === void 0 && s[0] === "/" && s[1] === "/") {
          s = "/%2F" + s.slice(2);
        }
        uriTokens.push(s);
      }
      if (component.query !== void 0) {
        uriTokens.push("?", component.query);
      }
      if (component.fragment !== void 0) {
        uriTokens.push("#", component.fragment);
      }
      return uriTokens.join("");
    }
    var URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
    function getParseError(parsed, matches) {
      if (matches[2] !== void 0 && parsed.path && parsed.path[0] !== "/") {
        return 'URI path must start with "/" when authority is present.';
      }
      if (typeof parsed.port === "number" && (parsed.port < 0 || parsed.port > 65535)) {
        return "URI port is malformed.";
      }
      return void 0;
    }
    function parseWithStatus(uri, opts) {
      const options = Object.assign({}, opts);
      const parsed = {
        scheme: void 0,
        userinfo: void 0,
        host: "",
        port: void 0,
        path: "",
        query: void 0,
        fragment: void 0
      };
      let malformedAuthorityOrPort = false;
      let isIP = false;
      if (options.reference === "suffix") {
        if (options.scheme) {
          uri = options.scheme + ":" + uri;
        } else {
          uri = "//" + uri;
        }
      }
      const matches = uri.match(URI_PARSE);
      if (matches) {
        parsed.scheme = matches[1];
        parsed.userinfo = matches[3];
        parsed.host = matches[4];
        parsed.port = parseInt(matches[5], 10);
        parsed.path = matches[6] || "";
        parsed.query = matches[7];
        parsed.fragment = matches[8];
        if (isNaN(parsed.port)) {
          parsed.port = matches[5];
        }
        const parseError = getParseError(parsed, matches);
        if (parseError !== void 0) {
          parsed.error = parsed.error || parseError;
          malformedAuthorityOrPort = true;
        }
        if (parsed.host) {
          const ipv4result = isIPv4(parsed.host);
          if (ipv4result === false) {
            const ipv6result = normalizeIPv6(parsed.host);
            parsed.host = ipv6result.host.toLowerCase();
            isIP = ipv6result.isIPV6;
          } else {
            isIP = true;
          }
        }
        if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && parsed.query === void 0 && !parsed.path) {
          parsed.reference = "same-document";
        } else if (parsed.scheme === void 0) {
          parsed.reference = "relative";
        } else if (parsed.fragment === void 0) {
          parsed.reference = "absolute";
        } else {
          parsed.reference = "uri";
        }
        if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
          parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
        }
        const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
        if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
          if (parsed.host && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
            try {
              parsed.host = URL.domainToASCII(parsed.host.toLowerCase());
            } catch (e) {
              parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
            }
          }
        }
        if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
          if (uri.indexOf("%") !== -1) {
            if (parsed.scheme !== void 0) {
              parsed.scheme = unescape(parsed.scheme);
            }
            if (parsed.host !== void 0) {
              parsed.host = reescapeHostDelimiters(unescape(parsed.host), isIP);
            }
          }
          if (parsed.path) {
            parsed.path = normalizePathEncoding(parsed.path);
          }
          if (parsed.fragment) {
            try {
              parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
            } catch {
              parsed.error = parsed.error || "URI malformed";
            }
          }
        }
        if (schemeHandler && schemeHandler.parse) {
          schemeHandler.parse(parsed, options);
        }
      } else {
        parsed.error = parsed.error || "URI can not be parsed.";
      }
      return { parsed, malformedAuthorityOrPort };
    }
    function parse3(uri, opts) {
      return parseWithStatus(uri, opts).parsed;
    }
    function normalizeString(uri, opts) {
      return normalizeStringWithStatus(uri, opts).normalized;
    }
    function normalizeStringWithStatus(uri, opts) {
      const { parsed, malformedAuthorityOrPort } = parseWithStatus(uri, opts);
      return {
        normalized: malformedAuthorityOrPort ? uri : serialize(parsed, opts),
        malformedAuthorityOrPort
      };
    }
    function normalizeComparableURI(uri, opts) {
      if (typeof uri === "string") {
        const { normalized, malformedAuthorityOrPort } = normalizeStringWithStatus(uri, opts);
        return malformedAuthorityOrPort ? void 0 : normalized;
      }
      if (typeof uri === "object") {
        return serialize(uri, opts);
      }
    }
    var fastUri = {
      SCHEMES,
      normalize,
      resolve: resolve3,
      resolveComponent,
      equal,
      serialize,
      parse: parse3
    };
    module2.exports = fastUri;
    module2.exports.default = fastUri;
    module2.exports.fastUri = fastUri;
  }
});

// node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS({
  "node_modules/ajv/dist/runtime/uri.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var uri = require_fast_uri();
    uri.code = 'require("ajv/dist/runtime/uri").default';
    exports2.default = uri;
  }
});

// node_modules/ajv/dist/core.js
var require_core = __commonJS({
  "node_modules/ajv/dist/core.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CodeGen = exports2.Name = exports2.nil = exports2.stringify = exports2.str = exports2._ = exports2.KeywordCxt = void 0;
    var validate_1 = require_validate();
    Object.defineProperty(exports2, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports2, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports2, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports2, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports2, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports2, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports2, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    var ref_error_1 = require_ref_error();
    var rules_1 = require_rules();
    var compile_1 = require_compile();
    var codegen_2 = require_codegen();
    var resolve_1 = require_resolve();
    var dataType_1 = require_dataType();
    var util_1 = require_util();
    var $dataRefSchema = require_data();
    var uri_1 = require_uri();
    var defaultRegExp = (str, flags) => new RegExp(str, flags);
    defaultRegExp.code = "new RegExp";
    var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
    var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]);
    var removedOptions = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    var deprecatedOptions = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    };
    var MAX_EXPRESSION = 200;
    function requiredOptions(o) {
      var _a3, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
      const s = o.strict;
      const _optz = (_a3 = o.code) === null || _a3 === void 0 ? void 0 : _a3.optimize;
      const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
      const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
      const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
      return {
        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver
      };
    }
    var Ajv2 = class {
      constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = /* @__PURE__ */ Object.create(null);
        this._compilations = /* @__PURE__ */ new Set();
        this._loading = {};
        this._cache = /* @__PURE__ */ new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
          addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
          addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data, meta: meta2, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
          _dataRefSchema = { ...$dataRefSchema };
          _dataRefSchema.id = _dataRefSchema.$id;
          delete _dataRefSchema.$id;
        }
        if (meta2 && $data)
          this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
      }
      defaultMeta() {
        const { meta: meta2, schemaId } = this.opts;
        return this.opts.defaultMeta = typeof meta2 == "object" ? meta2[schemaId] || meta2 : void 0;
      }
      validate(schemaKeyRef, data) {
        let v;
        if (typeof schemaKeyRef == "string") {
          v = this.getSchema(schemaKeyRef);
          if (!v)
            throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
        } else {
          v = this.compile(schemaKeyRef);
        }
        const valid = v(data);
        if (!("$async" in v))
          this.errors = v.errors;
        return valid;
      }
      compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return sch.validate || this._compileSchemaEnv(sch);
      }
      compileAsync(schema, meta2) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta2);
        async function runCompileAsync(_schema, _meta) {
          await loadMetaSchema.call(this, _schema.$schema);
          const sch = this._addSchema(_schema, _meta);
          return sch.validate || _compileAsync.call(this, sch);
        }
        async function loadMetaSchema($ref) {
          if ($ref && !this.getSchema($ref)) {
            await runCompileAsync.call(this, { $ref }, true);
          }
        }
        async function _compileAsync(sch) {
          try {
            return this._compileSchemaEnv(sch);
          } catch (e) {
            if (!(e instanceof ref_error_1.default))
              throw e;
            checkLoaded.call(this, e);
            await loadMissingSchema.call(this, e.missingSchema);
            return _compileAsync.call(this, sch);
          }
        }
        function checkLoaded({ missingSchema: ref, missingRef }) {
          if (this.refs[ref]) {
            throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
          }
        }
        async function loadMissingSchema(ref) {
          const _schema = await _loadSchema.call(this, ref);
          if (!this.refs[ref])
            await loadMetaSchema.call(this, _schema.$schema);
          if (!this.refs[ref])
            this.addSchema(_schema, ref, meta2);
        }
        async function _loadSchema(ref) {
          const p = this._loading[ref];
          if (p)
            return p;
          try {
            return await (this._loading[ref] = loadSchema(ref));
          } finally {
            delete this._loading[ref];
          }
        }
      }
      // Adds schema to the instance
      addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
        if (Array.isArray(schema)) {
          for (const sch of schema)
            this.addSchema(sch, void 0, _meta, _validateSchema);
          return this;
        }
        let id;
        if (typeof schema === "object") {
          const { schemaId } = this.opts;
          id = schema[schemaId];
          if (id !== void 0 && typeof id != "string") {
            throw new Error(`schema ${schemaId} must be string`);
          }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
      }
      //  Validate schema against its meta-schema
      validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
          return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string") {
          throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
          const message = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(message);
          else
            throw new Error(message);
        }
        return valid;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
          keyRef = sch;
        if (sch === void 0) {
          const { schemaId } = this.opts;
          const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
          sch = compile_1.resolveSchema.call(this, root, keyRef);
          if (!sch)
            return;
          this.refs[keyRef] = sch;
        }
        return sch.validate || this._compileSchemaEnv(sch);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          this._removeAllSchemas(this.schemas, schemaKeyRef);
          this._removeAllSchemas(this.refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string": {
            const sch = getSchEnv.call(this, schemaKeyRef);
            if (typeof sch == "object")
              this._cache.delete(sch.schema);
            delete this.schemas[schemaKeyRef];
            delete this.refs[schemaKeyRef];
            return this;
          }
          case "object": {
            const cacheKey2 = schemaKeyRef;
            this._cache.delete(cacheKey2);
            let id = schemaKeyRef[this.opts.schemaId];
            if (id) {
              id = (0, resolve_1.normalizeId)(id);
              delete this.schemas[id];
              delete this.refs[id];
            }
            return this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(definitions) {
        for (const def of definitions)
          this.addKeyword(def);
        return this;
      }
      addKeyword(kwdOrDef, def) {
        let keyword;
        if (typeof kwdOrDef == "string") {
          keyword = kwdOrDef;
          if (typeof def == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            def.keyword = keyword;
          }
        } else if (typeof kwdOrDef == "object" && def === void 0) {
          def = kwdOrDef;
          keyword = def.keyword;
          if (Array.isArray(keyword) && !keyword.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
          (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
          return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
          ...def,
          type: (0, dataType_1.getJSONTypes)(def.type),
          schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
        return this;
      }
      getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
      }
      // Remove keyword
      removeKeyword(keyword) {
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
          const i = group.rules.findIndex((rule) => rule.keyword === keyword);
          if (i >= 0)
            group.rules.splice(i, 1);
        }
        return this;
      }
      // Add format
      addFormat(name, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this.formats[name] = format;
        return this;
      }
      errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
        if (!errors || errors.length === 0)
          return "No errors";
        return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
      }
      $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
          const segments = jsonPointer.split("/").slice(1);
          let keywords = metaSchema;
          for (const seg of segments)
            keywords = keywords[seg];
          for (const key in rules) {
            const rule = rules[key];
            if (typeof rule != "object")
              continue;
            const { $data } = rule.definition;
            const schema = keywords[key];
            if ($data && schema)
              keywords[key] = schemaOrData(schema);
          }
        }
        return metaSchema;
      }
      _removeAllSchemas(schemas, regex) {
        for (const keyRef in schemas) {
          const sch = schemas[keyRef];
          if (!regex || regex.test(keyRef)) {
            if (typeof sch == "string") {
              delete schemas[keyRef];
            } else if (sch && !sch.meta) {
              this._cache.delete(sch.schema);
              delete schemas[keyRef];
            }
          }
        }
      }
      _addSchema(schema, meta2, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
          id = schema[schemaId];
        } else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          else if (typeof schema != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== void 0)
          return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta: meta2, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
          if (baseId)
            this._checkUnique(baseId);
          this.refs[baseId] = sch;
        }
        if (validateSchema)
          this.validateSchema(schema, true);
        return sch;
      }
      _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
          throw new Error(`schema with key or id "${id}" already exists`);
        }
      }
      _compileSchemaEnv(sch) {
        if (sch.meta)
          this._compileMetaSchema(sch);
        else
          compile_1.compileSchema.call(this, sch);
        if (!sch.validate)
          throw new Error("ajv implementation error");
        return sch.validate;
      }
      _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
          compile_1.compileSchema.call(this, sch);
        } finally {
          this.opts = currentOpts;
        }
      }
    };
    Ajv2.ValidationError = validation_error_1.default;
    Ajv2.MissingRefError = ref_error_1.default;
    exports2.default = Ajv2;
    function checkOptions(checkOpts, options, msg, log = "error") {
      for (const key in checkOpts) {
        const opt = key;
        if (opt in options)
          this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
      }
    }
    function getSchEnv(keyRef) {
      keyRef = (0, resolve_1.normalizeId)(keyRef);
      return this.schemas[keyRef] || this.refs[keyRef];
    }
    function addInitialSchemas() {
      const optsSchemas = this.opts.schemas;
      if (!optsSchemas)
        return;
      if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
      else
        for (const key in optsSchemas)
          this.addSchema(optsSchemas[key], key);
    }
    function addInitialFormats() {
      for (const name in this.opts.formats) {
        const format = this.opts.formats[name];
        if (format)
          this.addFormat(name, format);
      }
    }
    function addInitialKeywords(defs) {
      if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
          def.keyword = keyword;
        this.addKeyword(def);
      }
    }
    function getMetaSchemaOptions() {
      const metaOpts = { ...this.opts };
      for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
      return metaOpts;
    }
    var noLogs = { log() {
    }, warn() {
    }, error() {
    } };
    function getLogger(logger2) {
      if (logger2 === false)
        return noLogs;
      if (logger2 === void 0)
        return console;
      if (logger2.log && logger2.warn && logger2.error)
        return logger2;
      throw new Error("logger must implement log, warn and error methods");
    }
    var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
    function checkKeyword(keyword, def) {
      const { RULES } = this;
      (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
          throw new Error(`Keyword ${kwd} is already defined`);
        if (!KEYWORD_NAME.test(kwd))
          throw new Error(`Keyword ${kwd} has invalid name`);
      });
      if (!def)
        return;
      if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
      }
    }
    function addRule(keyword, definition, dataType) {
      var _a3;
      const post = definition === null || definition === void 0 ? void 0 : definition.post;
      if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES } = this;
      let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
      if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
      }
      RULES.keywords[keyword] = true;
      if (!definition)
        return;
      const rule = {
        keyword,
        definition: {
          ...definition,
          type: (0, dataType_1.getJSONTypes)(definition.type),
          schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
        }
      };
      if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
      else
        ruleGroup.rules.push(rule);
      RULES.all[keyword] = rule;
      (_a3 = definition.implements) === null || _a3 === void 0 ? void 0 : _a3.forEach((kwd) => this.addKeyword(kwd));
    }
    function addBeforeRule(ruleGroup, rule, before) {
      const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
      if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
      } else {
        ruleGroup.rules.push(rule);
        this.logger.warn(`rule ${before} is not defined`);
      }
    }
    function keywordMetaschema(def) {
      let { metaSchema } = def;
      if (metaSchema === void 0)
        return;
      if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
      def.validateSchema = this.compile(metaSchema, true);
    }
    var $dataRef = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function schemaOrData(schema) {
      return { anyOf: [schema, $dataRef] };
    }
  }
});

// node_modules/ajv/dist/vocabularies/core/id.js
var require_id = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/id.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var def = {
      keyword: "id",
      code() {
        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/ref.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.callRef = exports2.getValidate = void 0;
    var ref_error_1 = require_ref_error();
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var util_1 = require_util();
    var def = {
      keyword: "$ref",
      schemaType: "string",
      code(cxt) {
        const { gen, schema: $ref, it } = cxt;
        const { baseId, schemaEnv: env, validateName, opts, self } = it;
        const { root } = env;
        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
          return callRootRef();
        const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
        if (schOrEnv === void 0)
          throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
        if (schOrEnv instanceof compile_1.SchemaEnv)
          return callValidate(schOrEnv);
        return inlineRefSchema(schOrEnv);
        function callRootRef() {
          if (env === root)
            return callRef(cxt, validateName, env, env.$async);
          const rootName = gen.scopeValue("root", { ref: root });
          return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
        }
        function callValidate(sch) {
          const v = getValidate(cxt, sch);
          callRef(cxt, v, sch, sch.$async);
        }
        function inlineRefSchema(sch) {
          const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
          const valid = gen.name("valid");
          const schCxt = cxt.subschema({
            schema: sch,
            dataTypes: [],
            schemaPath: codegen_1.nil,
            topSchemaRef: schName,
            errSchemaPath: $ref
          }, valid);
          cxt.mergeEvaluated(schCxt);
          cxt.ok(valid);
        }
      }
    };
    function getValidate(cxt, sch) {
      const { gen } = cxt;
      return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
    }
    exports2.getValidate = getValidate;
    function callRef(cxt, v, sch, $async) {
      const { gen, it } = cxt;
      const { allErrors, schemaEnv: env, opts } = it;
      const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
      if ($async)
        callAsyncRef();
      else
        callSyncRef();
      function callAsyncRef() {
        if (!env.$async)
          throw new Error("async schema referenced by sync schema");
        const valid = gen.let("valid");
        gen.try(() => {
          gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
          addEvaluatedFrom(v);
          if (!allErrors)
            gen.assign(valid, true);
        }, (e) => {
          gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
          addErrorsFrom(e);
          if (!allErrors)
            gen.assign(valid, false);
        });
        cxt.ok(valid);
      }
      function callSyncRef() {
        cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
      }
      function addErrorsFrom(source) {
        const errs = (0, codegen_1._)`${source}.errors`;
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`);
        gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
      }
      function addEvaluatedFrom(source) {
        var _a3;
        if (!it.opts.unevaluated)
          return;
        const schEvaluated = (_a3 = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a3 === void 0 ? void 0 : _a3.evaluated;
        if (it.props !== true) {
          if (schEvaluated && !schEvaluated.dynamicProps) {
            if (schEvaluated.props !== void 0) {
              it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
            }
          } else {
            const props = gen.var("props", (0, codegen_1._)`${source}.evaluated.props`);
            it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
          }
        }
        if (it.items !== true) {
          if (schEvaluated && !schEvaluated.dynamicItems) {
            if (schEvaluated.items !== void 0) {
              it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
            }
          } else {
            const items = gen.var("items", (0, codegen_1._)`${source}.evaluated.items`);
            it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
          }
        }
      }
    }
    exports2.callRef = callRef;
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/index.js
var require_core2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var id_1 = require_id();
    var ref_1 = require_ref();
    var core = [
      "$schema",
      "$id",
      "$defs",
      "$vocabulary",
      { keyword: "$comment" },
      "definitions",
      id_1.default,
      ref_1.default
    ];
    exports2.default = core;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error2 = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    var def = {
      keyword: Object.keys(KWDs),
      type: "number",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        cxt.fail$data((0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`,
      params: ({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`
    };
    var def = {
      keyword: "multipleOf",
      type: "number",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, schemaCode, it } = cxt;
        const prec = it.opts.multipleOfPrecision;
        const res = gen.let("res");
        const invalid = prec ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1._)`${res} !== parseInt(${res})`;
        cxt.fail$data((0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports2.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var ucs2length_1 = require_ucs2length();
    var error2 = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxLength" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxLength", "minLength"],
      type: "string",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode, it } = cxt;
        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
        const len = it.opts.unicode === false ? (0, codegen_1._)`${data}.length` : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
        cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var util_1 = require_util();
    var codegen_1 = require_codegen();
    var error2 = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`
    };
    var def = {
      keyword: "pattern",
      type: "string",
      schemaType: "string",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const u = it.opts.unicodeRegExp ? "u" : "";
        if ($data) {
          const { regExp } = it.opts.code;
          const regExpCode = regExp.code === "new RegExp" ? (0, codegen_1._)`new RegExp` : (0, util_1.useFunc)(gen, regExp);
          const valid = gen.let("valid");
          gen.try(() => gen.assign(valid, (0, codegen_1._)`${regExpCode}(${schemaCode}, ${u}).test(${data})`), () => gen.assign(valid, false));
          cxt.fail$data((0, codegen_1._)`!${valid}`);
        } else {
          const regExp = (0, code_1.usePattern)(cxt, schema);
          cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxProperties" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxProperties", "minProperties"],
      type: "object",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/required.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: ({ params: { missingProperty } }) => (0, codegen_1.str)`must have required property '${missingProperty}'`,
      params: ({ params: { missingProperty } }) => (0, codegen_1._)`{missingProperty: ${missingProperty}}`
    };
    var def = {
      keyword: "required",
      type: "object",
      schemaType: "array",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, schema, schemaCode, data, $data, it } = cxt;
        const { opts } = it;
        if (!$data && schema.length === 0)
          return;
        const useLoop = schema.length >= opts.loopRequired;
        if (it.allErrors)
          allErrorsMode();
        else
          exitOnErrorMode();
        if (opts.strictRequired) {
          const props = cxt.parentSchema.properties;
          const { definedProperties } = cxt.it;
          for (const requiredKey of schema) {
            if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
              const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
              const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
              (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
            }
          }
        }
        function allErrorsMode() {
          if (useLoop || $data) {
            cxt.block$data(codegen_1.nil, loopAllRequired);
          } else {
            for (const prop of schema) {
              (0, code_1.checkReportMissingProp)(cxt, prop);
            }
          }
        }
        function exitOnErrorMode() {
          const missing = gen.let("missing");
          if (useLoop || $data) {
            const valid = gen.let("valid", true);
            cxt.block$data(valid, () => loopUntilMissing(missing, valid));
            cxt.ok(valid);
          } else {
            gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
          }
        }
        function loopAllRequired() {
          gen.forOf("prop", schemaCode, (prop) => {
            cxt.setParams({ missingProperty: prop });
            gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
          });
        }
        function loopUntilMissing(missing, valid) {
          cxt.setParams({ missingProperty: missing });
          gen.forOf(missing, schemaCode, () => {
            gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
            gen.if((0, codegen_1.not)(valid), () => {
              cxt.error();
              gen.break();
            });
          }, codegen_1.nil);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxItems" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxItems", "minItems"],
      type: "array",
      schemaType: "number",
      $data: true,
      error: error2,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({
  "node_modules/ajv/dist/runtime/equal.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var equal = require_fast_deep_equal();
    equal.code = 'require("ajv/dist/runtime/equal").default';
    exports2.default = equal;
  }
});

// node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var dataType_1 = require_dataType();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error2 = {
      message: ({ params: { i, j } }) => (0, codegen_1.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
      params: ({ params: { i, j } }) => (0, codegen_1._)`{i: ${i}, j: ${j}}`
    };
    var def = {
      keyword: "uniqueItems",
      type: "array",
      schemaType: "boolean",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
        if (!$data && !schema)
          return;
        const valid = gen.let("valid");
        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
        cxt.block$data(valid, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
        cxt.ok(valid);
        function validateUniqueItems() {
          const i = gen.let("i", (0, codegen_1._)`${data}.length`);
          const j = gen.let("j");
          cxt.setParams({ i, j });
          gen.assign(valid, true);
          gen.if((0, codegen_1._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
        }
        function canOptimize() {
          return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
        }
        function loopN(i, j) {
          const item = gen.name("item");
          const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
          const indices = gen.const("indices", (0, codegen_1._)`{}`);
          gen.for((0, codegen_1._)`;${i}--;`, () => {
            gen.let(item, (0, codegen_1._)`${data}[${i}]`);
            gen.if(wrongType, (0, codegen_1._)`continue`);
            if (itemTypes.length > 1)
              gen.if((0, codegen_1._)`typeof ${item} == "string"`, (0, codegen_1._)`${item} += "_"`);
            gen.if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
              gen.assign(j, (0, codegen_1._)`${indices}[${item}]`);
              cxt.error();
              gen.assign(valid, false).break();
            }).code((0, codegen_1._)`${indices}[${item}] = ${i}`);
          });
        }
        function loopN2(i, j) {
          const eql = (0, util_1.useFunc)(gen, equal_1.default);
          const outer = gen.name("outer");
          gen.label(outer).for((0, codegen_1._)`;${i}--;`, () => gen.for((0, codegen_1._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
            cxt.error();
            gen.assign(valid, false).break(outer);
          })));
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/const.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error2 = {
      message: "must be equal to constant",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`
    };
    var def = {
      keyword: "const",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schemaCode, schema } = cxt;
        if ($data || schema && typeof schema == "object") {
          cxt.fail$data((0, codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
        } else {
          cxt.fail((0, codegen_1._)`${schema} !== ${data}`);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/enum.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error2 = {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`
    };
    var def = {
      keyword: "enum",
      schemaType: "array",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        if (!$data && schema.length === 0)
          throw new Error("enum must have non-empty array");
        const useLoop = schema.length >= it.opts.loopEnum;
        let eql;
        const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default);
        let valid;
        if (useLoop || $data) {
          valid = gen.let("valid");
          cxt.block$data(valid, loopEnum);
        } else {
          if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
          const vSchema = gen.const("vSchema", schemaCode);
          valid = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
        }
        cxt.pass(valid);
        function loopEnum() {
          gen.assign(valid, false);
          gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
        }
        function equalCode(vSchema, i) {
          const sch = schema[i];
          return typeof sch === "object" && sch !== null ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1._)`${data} === ${sch}`;
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var limitNumber_1 = require_limitNumber();
    var multipleOf_1 = require_multipleOf();
    var limitLength_1 = require_limitLength();
    var pattern_1 = require_pattern();
    var limitProperties_1 = require_limitProperties();
    var required_1 = require_required();
    var limitItems_1 = require_limitItems();
    var uniqueItems_1 = require_uniqueItems();
    var const_1 = require_const();
    var enum_1 = require_enum();
    var validation = [
      // number
      limitNumber_1.default,
      multipleOf_1.default,
      // string
      limitLength_1.default,
      pattern_1.default,
      // object
      limitProperties_1.default,
      required_1.default,
      // array
      limitItems_1.default,
      uniqueItems_1.default,
      // any
      { keyword: "type", schemaType: ["string", "array"] },
      { keyword: "nullable", schemaType: "boolean" },
      const_1.default,
      enum_1.default
    ];
    exports2.default = validation;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateAdditionalItems = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "additionalItems",
      type: "array",
      schemaType: ["boolean", "object"],
      before: "uniqueItems",
      error: error2,
      code(cxt) {
        const { parentSchema, it } = cxt;
        const { items } = parentSchema;
        if (!Array.isArray(items)) {
          (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
          return;
        }
        validateAdditionalItems(cxt, items);
      }
    };
    function validateAdditionalItems(cxt, items) {
      const { gen, schema, data, keyword, it } = cxt;
      it.items = true;
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      if (schema === false) {
        cxt.setParams({ len: items.length });
        cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
      } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
        const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items.length}`);
        gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
        cxt.ok(valid);
      }
      function validateItems(valid) {
        gen.forRange("i", items.length, len, (i) => {
          cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid);
          if (!it.allErrors)
            gen.if((0, codegen_1.not)(valid), () => gen.break());
        });
      }
    }
    exports2.validateAdditionalItems = validateAdditionalItems;
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateTuple = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "array", "boolean"],
      before: "uniqueItems",
      code(cxt) {
        const { schema, it } = cxt;
        if (Array.isArray(schema))
          return validateTuple(cxt, "additionalItems", schema);
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    function validateTuple(cxt, extraItems, schArr = cxt.schema) {
      const { gen, parentSchema, data, keyword, it } = cxt;
      checkStrictTuple(parentSchema);
      if (it.opts.unevaluated && schArr.length && it.items !== true) {
        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
      }
      const valid = gen.name("valid");
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      schArr.forEach((sch, i) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
          return;
        gen.if((0, codegen_1._)`${len} > ${i}`, () => cxt.subschema({
          keyword,
          schemaProp: i,
          dataProp: i
        }, valid));
        cxt.ok(valid);
      });
      function checkStrictTuple(sch) {
        const { opts, errSchemaPath } = it;
        const l = schArr.length;
        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
        if (opts.strictTuples && !fullTuple) {
          const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
          (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
        }
      }
    }
    exports2.validateTuple = validateTuple;
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var items_1 = require_items();
    var def = {
      keyword: "prefixItems",
      type: "array",
      schemaType: ["array"],
      before: "uniqueItems",
      code: (cxt) => (0, items_1.validateTuple)(cxt, "items")
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var additionalItems_1 = require_additionalItems();
    var error2 = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      error: error2,
      code(cxt) {
        const { schema, parentSchema, it } = cxt;
        const { prefixItems } = parentSchema;
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        if (prefixItems)
          (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
        else
          cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1.str)`must contain at least ${min} valid item(s)` : (0, codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
      params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1._)`{minContains: ${min}}` : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`
    };
    var def = {
      keyword: "contains",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        let min;
        let max;
        const { minContains, maxContains } = parentSchema;
        if (it.opts.next) {
          min = minContains === void 0 ? 1 : minContains;
          max = maxContains;
        } else {
          min = 1;
        }
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        cxt.setParams({ min, max });
        if (max === void 0 && min === 0) {
          (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
          return;
        }
        if (max !== void 0 && min > max) {
          (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
          cxt.fail();
          return;
        }
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          let cond = (0, codegen_1._)`${len} >= ${min}`;
          if (max !== void 0)
            cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
          cxt.pass(cond);
          return;
        }
        it.items = true;
        const valid = gen.name("valid");
        if (max === void 0 && min === 1) {
          validateItems(valid, () => gen.if(valid, () => gen.break()));
        } else if (min === 0) {
          gen.let(valid, true);
          if (max !== void 0)
            gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
        } else {
          gen.let(valid, false);
          validateItemsWithCount();
        }
        cxt.result(valid, () => cxt.reset());
        function validateItemsWithCount() {
          const schValid = gen.name("_valid");
          const count = gen.let("count", 0);
          validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
        }
        function validateItems(_valid, block) {
          gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
              keyword: "contains",
              dataProp: i,
              dataPropType: util_1.Type.Num,
              compositeRule: true
            }, _valid);
            block();
          });
        }
        function checkLimits(count) {
          gen.code((0, codegen_1._)`${count}++`);
          if (max === void 0) {
            gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
          } else {
            gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid, false).break());
            if (min === 1)
              gen.assign(valid, true);
            else
              gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true));
          }
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateSchemaDeps = exports2.validatePropertyDeps = exports2.error = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    exports2.error = {
      message: ({ params: { property, depsCount, deps } }) => {
        const property_ies = depsCount === 1 ? "property" : "properties";
        return (0, codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
      },
      params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
      // TODO change to reference
    };
    var def = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: exports2.error,
      code(cxt) {
        const [propDeps, schDeps] = splitDependencies(cxt);
        validatePropertyDeps(cxt, propDeps);
        validateSchemaDeps(cxt, schDeps);
      }
    };
    function splitDependencies({ schema }) {
      const propertyDeps = {};
      const schemaDeps = {};
      for (const key in schema) {
        if (key === "__proto__")
          continue;
        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
        deps[key] = schema[key];
      }
      return [propertyDeps, schemaDeps];
    }
    function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
      const { gen, data, it } = cxt;
      if (Object.keys(propertyDeps).length === 0)
        return;
      const missing = gen.let("missing");
      for (const prop in propertyDeps) {
        const deps = propertyDeps[prop];
        if (deps.length === 0)
          continue;
        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
        cxt.setParams({
          property: prop,
          depsCount: deps.length,
          deps: deps.join(", ")
        });
        if (it.allErrors) {
          gen.if(hasProperty, () => {
            for (const depProp of deps) {
              (0, code_1.checkReportMissingProp)(cxt, depProp);
            }
          });
        } else {
          gen.if((0, codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
          (0, code_1.reportMissingProp)(cxt, missing);
          gen.else();
        }
      }
    }
    exports2.validatePropertyDeps = validatePropertyDeps;
    function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      for (const prop in schemaDeps) {
        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
          continue;
        gen.if(
          (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties),
          () => {
            const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
            cxt.mergeValidEvaluated(schCxt, valid);
          },
          () => gen.var(valid, true)
          // TODO var
        );
        cxt.ok(valid);
      }
    }
    exports2.validateSchemaDeps = validateSchemaDeps;
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: "property name must be valid",
      params: ({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`
    };
    var def = {
      keyword: "propertyNames",
      type: "object",
      schemaType: ["object", "boolean"],
      error: error2,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        const valid = gen.name("valid");
        gen.forIn("key", data, (key) => {
          cxt.setParams({ propertyName: key });
          cxt.subschema({
            keyword: "propertyNames",
            data: key,
            dataTypes: ["string"],
            propertyName: key,
            compositeRule: true
          }, valid);
          gen.if((0, codegen_1.not)(valid), () => {
            cxt.error(true);
            if (!it.allErrors)
              gen.break();
          });
        });
        cxt.ok(valid);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var util_1 = require_util();
    var error2 = {
      message: "must NOT have additional properties",
      params: ({ params }) => (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`
    };
    var def = {
      keyword: "additionalProperties",
      type: ["object"],
      schemaType: ["boolean", "object"],
      allowUndefined: true,
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, opts } = it;
        it.props = true;
        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
          return;
        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
        checkAdditionalProperties();
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function checkAdditionalProperties() {
          gen.forIn("key", data, (key) => {
            if (!props.length && !patProps.length)
              additionalPropertyCode(key);
            else
              gen.if(isAdditional(key), () => additionalPropertyCode(key));
          });
        }
        function isAdditional(key) {
          let definedProp;
          if (props.length > 8) {
            const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
            definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
          } else if (props.length) {
            definedProp = (0, codegen_1.or)(...props.map((p) => (0, codegen_1._)`${key} === ${p}`));
          } else {
            definedProp = codegen_1.nil;
          }
          if (patProps.length) {
            definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p) => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p)}.test(${key})`));
          }
          return (0, codegen_1.not)(definedProp);
        }
        function deleteAdditional(key) {
          gen.code((0, codegen_1._)`delete ${data}[${key}]`);
        }
        function additionalPropertyCode(key) {
          if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
            deleteAdditional(key);
            return;
          }
          if (schema === false) {
            cxt.setParams({ additionalProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            if (opts.removeAdditional === "failing") {
              applyAdditionalSchema(key, valid, false);
              gen.if((0, codegen_1.not)(valid), () => {
                cxt.reset();
                deleteAdditional(key);
              });
            } else {
              applyAdditionalSchema(key, valid);
              if (!allErrors)
                gen.if((0, codegen_1.not)(valid), () => gen.break());
            }
          }
        }
        function applyAdditionalSchema(key, valid, errors) {
          const subschema = {
            keyword: "additionalProperties",
            dataProp: key,
            dataPropType: util_1.Type.Str
          };
          if (errors === false) {
            Object.assign(subschema, {
              compositeRule: true,
              createErrors: false,
              allErrors: false
            });
          }
          cxt.subschema(subschema, valid);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var validate_1 = require_validate();
    var code_1 = require_code2();
    var util_1 = require_util();
    var additionalProperties_1 = require_additionalProperties();
    var def = {
      keyword: "properties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
          additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
        }
        const allProps = (0, code_1.allSchemaProperties)(schema);
        for (const prop of allProps) {
          it.definedProperties.add(prop);
        }
        if (it.opts.unevaluated && allProps.length && it.props !== true) {
          it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
        }
        const properties = allProps.filter((p) => !(0, util_1.alwaysValidSchema)(it, schema[p]));
        if (properties.length === 0)
          return;
        const valid = gen.name("valid");
        for (const prop of properties) {
          if (hasDefault(prop)) {
            applyPropertySchema(prop);
          } else {
            gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
            applyPropertySchema(prop);
            if (!it.allErrors)
              gen.else().var(valid, true);
            gen.endIf();
          }
          cxt.it.definedProperties.add(prop);
          cxt.ok(valid);
        }
        function hasDefault(prop) {
          return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
        }
        function applyPropertySchema(prop) {
          cxt.subschema({
            keyword: "properties",
            schemaProp: prop,
            dataProp: prop
          }, valid);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var util_2 = require_util();
    var def = {
      keyword: "patternProperties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, data, parentSchema, it } = cxt;
        const { opts } = it;
        const patterns = (0, code_1.allSchemaProperties)(schema);
        const alwaysValidPatterns = patterns.filter((p) => (0, util_1.alwaysValidSchema)(it, schema[p]));
        if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
          return;
        }
        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
        const valid = gen.name("valid");
        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
          it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
        }
        const { props } = it;
        validatePatternProperties();
        function validatePatternProperties() {
          for (const pat of patterns) {
            if (checkProperties)
              checkMatchingProperties(pat);
            if (it.allErrors) {
              validateProperties(pat);
            } else {
              gen.var(valid, true);
              validateProperties(pat);
              gen.if(valid);
            }
          }
        }
        function checkMatchingProperties(pat) {
          for (const prop in checkProperties) {
            if (new RegExp(pat).test(prop)) {
              (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
            }
          }
        }
        function validateProperties(pat) {
          gen.forIn("key", data, (key) => {
            gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
              const alwaysValid = alwaysValidPatterns.includes(pat);
              if (!alwaysValid) {
                cxt.subschema({
                  keyword: "patternProperties",
                  schemaProp: pat,
                  dataProp: key,
                  dataPropType: util_2.Type.Str
                }, valid);
              }
              if (it.opts.unevaluated && props !== true) {
                gen.assign((0, codegen_1._)`${props}[${key}]`, true);
              } else if (!alwaysValid && !it.allErrors) {
                gen.if((0, codegen_1.not)(valid), () => gen.break());
              }
            });
          });
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/not.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "not",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      code(cxt) {
        const { gen, schema, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          cxt.fail();
          return;
        }
        const valid = gen.name("valid");
        cxt.subschema({
          keyword: "not",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, valid);
        cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
      },
      error: { message: "must NOT be valid" }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var def = {
      keyword: "anyOf",
      schemaType: "array",
      trackErrors: true,
      code: code_1.validateUnion,
      error: { message: "must match a schema in anyOf" }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: "must match exactly one schema in oneOf",
      params: ({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`
    };
    var def = {
      keyword: "oneOf",
      schemaType: "array",
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, schema, parentSchema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        if (it.opts.discriminator && parentSchema.discriminator)
          return;
        const schArr = schema;
        const valid = gen.let("valid", false);
        const passing = gen.let("passing", null);
        const schValid = gen.name("_valid");
        cxt.setParams({ passing });
        gen.block(validateOneOf);
        cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
        function validateOneOf() {
          schArr.forEach((sch, i) => {
            let schCxt;
            if ((0, util_1.alwaysValidSchema)(it, sch)) {
              gen.var(schValid, true);
            } else {
              schCxt = cxt.subschema({
                keyword: "oneOf",
                schemaProp: i,
                compositeRule: true
              }, schValid);
            }
            if (i > 0) {
              gen.if((0, codegen_1._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1._)`[${passing}, ${i}]`).else();
            }
            gen.if(schValid, () => {
              gen.assign(valid, true);
              gen.assign(passing, i);
              if (schCxt)
                cxt.mergeEvaluated(schCxt, codegen_1.Name);
            });
          });
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "allOf",
      schemaType: "array",
      code(cxt) {
        const { gen, schema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        const valid = gen.name("valid");
        schema.forEach((sch, i) => {
          if ((0, util_1.alwaysValidSchema)(it, sch))
            return;
          const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid);
          cxt.ok(valid);
          cxt.mergeEvaluated(schCxt);
        });
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/if.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error2 = {
      message: ({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`,
      params: ({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`
    };
    var def = {
      keyword: "if",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      error: error2,
      code(cxt) {
        const { gen, parentSchema, it } = cxt;
        if (parentSchema.then === void 0 && parentSchema.else === void 0) {
          (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
        }
        const hasThen = hasSchema(it, "then");
        const hasElse = hasSchema(it, "else");
        if (!hasThen && !hasElse)
          return;
        const valid = gen.let("valid", true);
        const schValid = gen.name("_valid");
        validateIf();
        cxt.reset();
        if (hasThen && hasElse) {
          const ifClause = gen.let("ifClause");
          cxt.setParams({ ifClause });
          gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
        } else if (hasThen) {
          gen.if(schValid, validateClause("then"));
        } else {
          gen.if((0, codegen_1.not)(schValid), validateClause("else"));
        }
        cxt.pass(valid, () => cxt.error(true));
        function validateIf() {
          const schCxt = cxt.subschema({
            keyword: "if",
            compositeRule: true,
            createErrors: false,
            allErrors: false
          }, schValid);
          cxt.mergeEvaluated(schCxt);
        }
        function validateClause(keyword, ifClause) {
          return () => {
            const schCxt = cxt.subschema({ keyword }, schValid);
            gen.assign(valid, schValid);
            cxt.mergeValidEvaluated(schCxt, valid);
            if (ifClause)
              gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
            else
              cxt.setParams({ ifClause: keyword });
          };
        }
      }
    };
    function hasSchema(it, keyword) {
      const schema = it.schema[keyword];
      return schema !== void 0 && !(0, util_1.alwaysValidSchema)(it, schema);
    }
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["then", "else"],
      schemaType: ["object", "boolean"],
      code({ keyword, parentSchema, it }) {
        if (parentSchema.if === void 0)
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var additionalItems_1 = require_additionalItems();
    var prefixItems_1 = require_prefixItems();
    var items_1 = require_items();
    var items2020_1 = require_items2020();
    var contains_1 = require_contains();
    var dependencies_1 = require_dependencies();
    var propertyNames_1 = require_propertyNames();
    var additionalProperties_1 = require_additionalProperties();
    var properties_1 = require_properties();
    var patternProperties_1 = require_patternProperties();
    var not_1 = require_not();
    var anyOf_1 = require_anyOf();
    var oneOf_1 = require_oneOf();
    var allOf_1 = require_allOf();
    var if_1 = require_if();
    var thenElse_1 = require_thenElse();
    function getApplicator(draft2020 = false) {
      const applicator = [
        // any
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        // object
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default
      ];
      if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
      else
        applicator.push(additionalItems_1.default, items_1.default);
      applicator.push(contains_1.default);
      return applicator;
    }
    exports2.default = getApplicator;
  }
});

// node_modules/ajv/dist/vocabularies/format/format.js
var require_format = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/format.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error2 = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`
    };
    var def = {
      keyword: "format",
      type: ["number", "string"],
      schemaType: "string",
      $data: true,
      error: error2,
      code(cxt, ruleType) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const { opts, errSchemaPath, schemaEnv, self } = it;
        if (!opts.validateFormats)
          return;
        if ($data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fDef = gen.const("fDef", (0, codegen_1._)`${fmts}[${schemaCode}]`);
          const fType = gen.let("fType");
          const format = gen.let("format");
          gen.if((0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._)`${fDef}.type || "string"`).assign(format, (0, codegen_1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef));
          cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
          function unknownFmt() {
            if (opts.strictSchema === false)
              return codegen_1.nil;
            return (0, codegen_1._)`${schemaCode} && !${format}`;
          }
          function invalidFmt() {
            const callFormat = schemaEnv.$async ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : (0, codegen_1._)`${format}(${data})`;
            const validData = (0, codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
            return (0, codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
          }
        }
        function validateFormat() {
          const formatDef = self.formats[schema];
          if (!formatDef) {
            unknownFormat();
            return;
          }
          if (formatDef === true)
            return;
          const [fmtType, format, fmtRef] = getFormat(formatDef);
          if (fmtType === ruleType)
            cxt.pass(validCondition());
          function unknownFormat() {
            if (opts.strictSchema === false) {
              self.logger.warn(unknownMsg());
              return;
            }
            throw new Error(unknownMsg());
            function unknownMsg() {
              return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
            }
          }
          function getFormat(fmtDef) {
            const code = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema)}` : void 0;
            const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code });
            if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
              return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._)`${fmt}.validate`];
            }
            return ["string", fmtDef, fmt];
          }
          function validCondition() {
            if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
              if (!schemaEnv.$async)
                throw new Error("async format in sync schema");
              return (0, codegen_1._)`await ${fmtRef}(${data})`;
            }
            return typeof format == "function" ? (0, codegen_1._)`${fmtRef}(${data})` : (0, codegen_1._)`${fmtRef}.test(${data})`;
          }
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/format/index.js
var require_format2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var format_1 = require_format();
    var format = [format_1.default];
    exports2.default = format;
  }
});

// node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS({
  "node_modules/ajv/dist/vocabularies/metadata.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.contentVocabulary = exports2.metadataVocabulary = void 0;
    exports2.metadataVocabulary = [
      "title",
      "description",
      "default",
      "deprecated",
      "readOnly",
      "writeOnly",
      "examples"
    ];
    exports2.contentVocabulary = [
      "contentMediaType",
      "contentEncoding",
      "contentSchema"
    ];
  }
});

// node_modules/ajv/dist/vocabularies/draft7.js
var require_draft7 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft7.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft7Vocabularies = [
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary
    ];
    exports2.default = draft7Vocabularies;
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiscrError = void 0;
    var DiscrError;
    (function(DiscrError2) {
      DiscrError2["Tag"] = "tag";
      DiscrError2["Mapping"] = "mapping";
    })(DiscrError || (exports2.DiscrError = DiscrError = {}));
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var types_1 = require_types();
    var compile_1 = require_compile();
    var ref_error_1 = require_ref_error();
    var util_1 = require_util();
    var error2 = {
      message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
      params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
    };
    var def = {
      keyword: "discriminator",
      type: "object",
      schemaType: "object",
      error: error2,
      code(cxt) {
        const { gen, data, schema, parentSchema, it } = cxt;
        const { oneOf } = parentSchema;
        if (!it.opts.discriminator) {
          throw new Error("discriminator: requires discriminator option");
        }
        const tagName = schema.propertyName;
        if (typeof tagName != "string")
          throw new Error("discriminator: requires propertyName");
        if (schema.mapping)
          throw new Error("discriminator: mapping is not supported");
        if (!oneOf)
          throw new Error("discriminator: requires oneOf keyword");
        const valid = gen.let("valid", false);
        const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
        gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
        cxt.ok(valid);
        function validateMapping() {
          const mapping = getMapping();
          gen.if(false);
          for (const tagValue in mapping) {
            gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
            gen.assign(valid, applyTagSchema(mapping[tagValue]));
          }
          gen.else();
          cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
          gen.endIf();
        }
        function applyTagSchema(schemaProp) {
          const _valid = gen.name("valid");
          const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
          cxt.mergeEvaluated(schCxt, codegen_1.Name);
          return _valid;
        }
        function getMapping() {
          var _a3;
          const oneOfMapping = {};
          const topRequired = hasRequired(parentSchema);
          let tagRequired = true;
          for (let i = 0; i < oneOf.length; i++) {
            let sch = oneOf[i];
            if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
              const ref = sch.$ref;
              sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
              if (sch instanceof compile_1.SchemaEnv)
                sch = sch.schema;
              if (sch === void 0)
                throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
            }
            const propSch = (_a3 = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a3 === void 0 ? void 0 : _a3[tagName];
            if (typeof propSch != "object") {
              throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
            }
            tagRequired = tagRequired && (topRequired || hasRequired(sch));
            addMappings(propSch, i);
          }
          if (!tagRequired)
            throw new Error(`discriminator: "${tagName}" must be required`);
          return oneOfMapping;
          function hasRequired({ required: required2 }) {
            return Array.isArray(required2) && required2.includes(tagName);
          }
          function addMappings(sch, i) {
            if (sch.const) {
              addMapping(sch.const, i);
            } else if (sch.enum) {
              for (const tagValue of sch.enum) {
                addMapping(tagValue, i);
              }
            } else {
              throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
            }
          }
          function addMapping(tagValue, i) {
            if (typeof tagValue != "string" || tagValue in oneOfMapping) {
              throw new Error(`discriminator: "${tagName}" values must be unique strings`);
            }
            oneOfMapping[tagValue] = i;
          }
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/refs/json-schema-draft-07.json
var require_json_schema_draft_07 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-draft-07.json"(exports2, module2) {
    module2.exports = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "http://json-schema.org/draft-07/schema#",
      title: "Core schema meta-schema",
      definitions: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $ref: "#" }
        },
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }]
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      },
      type: ["object", "boolean"],
      properties: {
        $id: {
          type: "string",
          format: "uri-reference"
        },
        $schema: {
          type: "string",
          format: "uri"
        },
        $ref: {
          type: "string",
          format: "uri-reference"
        },
        $comment: {
          type: "string"
        },
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        readOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/definitions/nonNegativeInteger" },
        minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        additionalItems: { $ref: "#" },
        items: {
          anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
          default: true
        },
        maxItems: { $ref: "#/definitions/nonNegativeInteger" },
        minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        contains: { $ref: "#" },
        maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
        minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        required: { $ref: "#/definitions/stringArray" },
        additionalProperties: { $ref: "#" },
        definitions: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependencies: {
          type: "object",
          additionalProperties: {
            anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }]
          }
        },
        propertyNames: { $ref: "#" },
        const: true,
        enum: {
          type: "array",
          items: true,
          minItems: 1,
          uniqueItems: true
        },
        type: {
          anyOf: [
            { $ref: "#/definitions/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/definitions/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        format: { type: "string" },
        contentMediaType: { type: "string" },
        contentEncoding: { type: "string" },
        if: { $ref: "#" },
        then: { $ref: "#" },
        else: { $ref: "#" },
        allOf: { $ref: "#/definitions/schemaArray" },
        anyOf: { $ref: "#/definitions/schemaArray" },
        oneOf: { $ref: "#/definitions/schemaArray" },
        not: { $ref: "#" }
      },
      default: true
    };
  }
});

// node_modules/ajv/dist/ajv.js
var require_ajv = __commonJS({
  "node_modules/ajv/dist/ajv.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MissingRefError = exports2.ValidationError = exports2.CodeGen = exports2.Name = exports2.nil = exports2.stringify = exports2.str = exports2._ = exports2.KeywordCxt = exports2.Ajv = void 0;
    var core_1 = require_core();
    var draft7_1 = require_draft7();
    var discriminator_1 = require_discriminator();
    var draft7MetaSchema = require_json_schema_draft_07();
    var META_SUPPORT_DATA = ["/properties"];
    var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
    var Ajv2 = class extends core_1.default {
      _addVocabularies() {
        super._addVocabularies();
        draft7_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta)
          return;
        const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports2.Ajv = Ajv2;
    module2.exports = exports2 = Ajv2;
    module2.exports.Ajv = Ajv2;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = Ajv2;
    var validate_1 = require_validate();
    Object.defineProperty(exports2, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports2, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports2, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports2, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports2, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports2, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports2, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports2, "ValidationError", { enumerable: true, get: function() {
      return validation_error_1.default;
    } });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports2, "MissingRefError", { enumerable: true, get: function() {
      return ref_error_1.default;
    } });
  }
});

// node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS({
  "node_modules/ajv-formats/dist/formats.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.formatNames = exports2.fastFormats = exports2.fullFormats = void 0;
    function fmtDef(validate, compare) {
      return { validate, compare };
    }
    exports2.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: fmtDef(date3, compareDate),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: fmtDef(getTime(true), compareTime),
      "date-time": fmtDef(getDateTime(true), compareDateTime),
      "iso-time": fmtDef(getTime(), compareIsoTime),
      "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte,
      // signed 32 bit integer
      int32: { type: "number", validate: validateInt32 },
      // signed 64 bit integer
      int64: { type: "number", validate: validateInt64 },
      // C-type float
      float: { type: "number", validate: validateNumber },
      // C-type double
      double: { type: "number", validate: validateNumber },
      // hint to the UI to hide input strings
      password: true,
      // unchecked string payload
      binary: true
    };
    exports2.fastFormats = {
      ...exports2.fullFormats,
      date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
      time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
      "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
      "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
      "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    };
    exports2.formatNames = Object.keys(exports2.fullFormats);
    function isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function date3(str) {
      const matches = DATE.exec(str);
      if (!matches)
        return false;
      const year = +matches[1];
      const month = +matches[2];
      const day = +matches[3];
      return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
    }
    function compareDate(d1, d2) {
      if (!(d1 && d2))
        return void 0;
      if (d1 > d2)
        return 1;
      if (d1 < d2)
        return -1;
      return 0;
    }
    var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function getTime(strictTimeZone) {
      return function time3(str) {
        const matches = TIME.exec(str);
        if (!matches)
          return false;
        const hr = +matches[1];
        const min = +matches[2];
        const sec = +matches[3];
        const tz = matches[4];
        const tzSign = matches[5] === "-" ? -1 : 1;
        const tzH = +(matches[6] || 0);
        const tzM = +(matches[7] || 0);
        if (tzH > 23 || tzM > 59 || strictTimeZone && !tz)
          return false;
        if (hr <= 23 && min <= 59 && sec < 60)
          return true;
        const utcMin = min - tzM * tzSign;
        const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
        return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
      };
    }
    function compareTime(s1, s2) {
      if (!(s1 && s2))
        return void 0;
      const t1 = (/* @__PURE__ */ new Date("2020-01-01T" + s1)).valueOf();
      const t2 = (/* @__PURE__ */ new Date("2020-01-01T" + s2)).valueOf();
      if (!(t1 && t2))
        return void 0;
      return t1 - t2;
    }
    function compareIsoTime(t1, t2) {
      if (!(t1 && t2))
        return void 0;
      const a1 = TIME.exec(t1);
      const a2 = TIME.exec(t2);
      if (!(a1 && a2))
        return void 0;
      t1 = a1[1] + a1[2] + a1[3];
      t2 = a2[1] + a2[2] + a2[3];
      if (t1 > t2)
        return 1;
      if (t1 < t2)
        return -1;
      return 0;
    }
    var DATE_TIME_SEPARATOR = /t|\s/i;
    function getDateTime(strictTimeZone) {
      const time3 = getTime(strictTimeZone);
      return function date_time(str) {
        const dateTime = str.split(DATE_TIME_SEPARATOR);
        return dateTime.length === 2 && date3(dateTime[0]) && time3(dateTime[1]);
      };
    }
    function compareDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const d1 = new Date(dt1).valueOf();
      const d2 = new Date(dt2).valueOf();
      if (!(d1 && d2))
        return void 0;
      return d1 - d2;
    }
    function compareIsoDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
      const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
      const res = compareDate(d1, d2);
      if (res === void 0)
        return void 0;
      return res || compareTime(t1, t2);
    }
    var NOT_URI_FRAGMENT = /\/|:/;
    var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function uri(str) {
      return NOT_URI_FRAGMENT.test(str) && URI.test(str);
    }
    var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function byte(str) {
      BYTE.lastIndex = 0;
      return BYTE.test(str);
    }
    var MIN_INT32 = -(2 ** 31);
    var MAX_INT32 = 2 ** 31 - 1;
    function validateInt32(value) {
      return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
    }
    function validateInt64(value) {
      return Number.isInteger(value);
    }
    function validateNumber() {
      return true;
    }
    var Z_ANCHOR = /[^\\]\\Z/;
    function regex(str) {
      if (Z_ANCHOR.test(str))
        return false;
      try {
        new RegExp(str);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
});

// node_modules/ajv-formats/dist/limit.js
var require_limit = __commonJS({
  "node_modules/ajv-formats/dist/limit.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.formatLimitDefinition = void 0;
    var ajv_1 = require_ajv();
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      formatMaximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      formatMinimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      formatExclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error2 = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`should be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    exports2.formatLimitDefinition = {
      keyword: Object.keys(KWDs),
      type: "string",
      schemaType: "string",
      $data: true,
      error: error2,
      code(cxt) {
        const { gen, data, schemaCode, keyword, it } = cxt;
        const { opts, self } = it;
        if (!opts.validateFormats)
          return;
        const fCxt = new ajv_1.KeywordCxt(it, self.RULES.all.format.definition, "format");
        if (fCxt.$data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fmt = gen.const("fmt", (0, codegen_1._)`${fmts}[${fCxt.schemaCode}]`);
          cxt.fail$data((0, codegen_1.or)((0, codegen_1._)`typeof ${fmt} != "object"`, (0, codegen_1._)`${fmt} instanceof RegExp`, (0, codegen_1._)`typeof ${fmt}.compare != "function"`, compareCode(fmt)));
        }
        function validateFormat() {
          const format = fCxt.schema;
          const fmtDef = self.formats[format];
          if (!fmtDef || fmtDef === true)
            return;
          if (typeof fmtDef != "object" || fmtDef instanceof RegExp || typeof fmtDef.compare != "function") {
            throw new Error(`"${keyword}": format "${format}" does not define "compare" function`);
          }
          const fmt = gen.scopeValue("formats", {
            key: format,
            ref: fmtDef,
            code: opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(format)}` : void 0
          });
          cxt.fail$data(compareCode(fmt));
        }
        function compareCode(fmt) {
          return (0, codegen_1._)`${fmt}.compare(${data}, ${schemaCode}) ${KWDs[keyword].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    var formatLimitPlugin = (ajv) => {
      ajv.addKeyword(exports2.formatLimitDefinition);
      return ajv;
    };
    exports2.default = formatLimitPlugin;
  }
});

// node_modules/ajv-formats/dist/index.js
var require_dist = __commonJS({
  "node_modules/ajv-formats/dist/index.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var formats_1 = require_formats();
    var limit_1 = require_limit();
    var codegen_1 = require_codegen();
    var fullName = new codegen_1.Name("fullFormats");
    var fastName = new codegen_1.Name("fastFormats");
    var formatsPlugin = (ajv, opts = { keywords: true }) => {
      if (Array.isArray(opts)) {
        addFormats(ajv, opts, formats_1.fullFormats, fullName);
        return ajv;
      }
      const [formats, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
      const list = opts.formats || formats_1.formatNames;
      addFormats(ajv, list, formats, exportName);
      if (opts.keywords)
        (0, limit_1.default)(ajv);
      return ajv;
    };
    formatsPlugin.get = (name, mode = "full") => {
      const formats = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
      const f = formats[name];
      if (!f)
        throw new Error(`Unknown format "${name}"`);
      return f;
    };
    function addFormats(ajv, list, fs2, exportName) {
      var _a3;
      var _b;
      (_a3 = (_b = ajv.opts.code).formats) !== null && _a3 !== void 0 ? _a3 : _b.formats = (0, codegen_1._)`require("ajv-formats/dist/formats").${exportName}`;
      for (const f of list)
        ajv.addFormat(f, fs2[f]);
    }
    module2.exports = exports2 = formatsPlugin;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = formatsPlugin;
  }
});

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/core.js
var _a;
// @__NO_SIDE_EFFECTS__
function $constructor(name, initializer3, params) {
  function init(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: /* @__PURE__ */ new Set()
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer3(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a3;
    const inst = params?.Parent ? new Definition() : this;
    init(inst, def);
    (_a3 = inst._zod).deferred ?? (_a3.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
var $brand = Symbol("zod_brand");
var $ZodAsyncError = class extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
};
var $ZodEncodeError = class extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
};
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
var globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/util.js
var util_exports = {};
__export(util_exports, {
  BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
  Class: () => Class,
  NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
  aborted: () => aborted,
  allowsEval: () => allowsEval,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => captureStackTrace,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  explicitlyAborted: () => explicitlyAborted,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => getParsedType,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  parsedType: () => parsedType,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => primitiveTypes,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => propertyKeyTypes,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage
});
function assertEqual(val) {
  return val;
}
function assertNotEqual(val) {
  return val;
}
function assertIs(_arg) {
}
function assertNever(_x) {
  throw new Error("Unexpected value in exhaustive check");
}
function assert(_) {
}
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array2, separator = "|") {
  return array2.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set = false;
  return {
    get value() {
      if (!set) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === void 0;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance)
    return 0;
  return ratio - roundedRatio;
}
var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object3, key, getter) {
  let value = void 0;
  Object.defineProperty(object3, key, {
    get() {
      if (value === EVALUATING) {
        return void 0;
      }
      if (value === void 0) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object3, key, {
        value: v
        // configurable: true,
      });
    },
    configurable: true
  });
}
function objectClone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
  return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path2) {
  if (!path2)
    return obj;
  return path2.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
  const keys = Object.keys(promisesObj);
  const promises = keys.map((key) => promisesObj[key]);
  return Promise.all(promises).then((results) => {
    const resolvedObj = {};
    for (let i = 0; i < keys.length; i++) {
      resolvedObj[keys[i]] = results[i];
    }
    return resolvedObj;
  });
}
function randomString(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = /* @__PURE__ */ cached(() => {
  if (globalConfig.jitless) {
    return false;
  }
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === void 0)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  if (o instanceof Map)
    return new Map(o);
  if (o instanceof Set)
    return new Set(o);
  return o;
}
function numKeys(data) {
  let keyCount = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keyCount++;
    }
  }
  return keyCount;
}
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return "undefined";
    case "string":
      return "string";
    case "number":
      return Number.isNaN(data) ? "nan" : "number";
    case "boolean":
      return "boolean";
    case "function":
      return "function";
    case "bigint":
      return "bigint";
    case "symbol":
      return "symbol";
    case "object":
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return "promise";
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return "map";
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return "set";
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return "date";
      }
      if (typeof File !== "undefined" && data instanceof File) {
        return "file";
      }
      return "object";
    default:
      throw new Error(`Unknown data type: ${t}`);
  }
};
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
var primitiveTypes = /* @__PURE__ */ new Set([
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "undefined"
]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== void 0) {
    if (params?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function createTransparentProxy(getter) {
  let target;
  return new Proxy({}, {
    get(_, prop, receiver) {
      target ?? (target = getter());
      return Reflect.get(target, prop, receiver);
    },
    set(_, prop, value, receiver) {
      target ?? (target = getter());
      return Reflect.set(target, prop, value, receiver);
    },
    has(_, prop) {
      target ?? (target = getter());
      return Reflect.has(target, prop);
    },
    deleteProperty(_, prop) {
      target ?? (target = getter());
      return Reflect.deleteProperty(target, prop);
    },
    ownKeys(_) {
      target ?? (target = getter());
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_, prop) {
      target ?? (target = getter());
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty(_, prop, descriptor) {
      target ?? (target = getter());
      return Reflect.defineProperty(target, prop, descriptor);
    }
  });
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return `"${value}"`;
  return `${value}`;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
var BIGINT_FORMAT_RANGES = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key in shape) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? []
  });
  return clone(a, def);
}
function partial(Class2, schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class2, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path2, issues) {
  return issues.map((iss) => {
    var _a3;
    (_a3 = iss).path ?? (_a3.path = []);
    iss.path.unshift(path2);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config2) {
  const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
  const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
  rest.path ?? (rest.path = []);
  rest.message = message;
  if (ctx?.reportInput) {
    rest.input = _input;
  }
  return rest;
}
function getSizableOrigin(input) {
  if (input instanceof Set)
    return "set";
  if (input instanceof Map)
    return "map";
  if (input instanceof File)
    return "file";
  return "unknown";
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function parsedType(data) {
  const t = typeof data;
  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "nan" : "number";
    }
    case "object": {
      if (data === null) {
        return "null";
      }
      if (Array.isArray(data)) {
        return "array";
      }
      const obj = data;
      if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
        return obj.constructor.name;
      }
    }
  }
  return t;
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function cleanEnum(obj) {
  return Object.entries(obj).filter(([k, _]) => {
    return Number.isNaN(Number.parseInt(k, 10));
  }).map((el) => el[1]);
}
function base64ToUint8Array(base642) {
  const binaryString = atob(base642);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function uint8ArrayToBase64(bytes) {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}
function base64urlToUint8Array(base64url2) {
  const base642 = base64url2.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base642.length % 4) % 4);
  return base64ToUint8Array(base642 + padding);
}
function uint8ArrayToBase64url(bytes) {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex) {
  const cleanHex = hex.replace(/^0x/, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}
function uint8ArrayToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var Class = class {
  constructor(..._args) {
  }
};

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/errors.js
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false
  });
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
function flattenError(error2, mapper = (issue2) => issue2.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error2.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error2, mapper = (issue2) => issue2.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error3, path2 = []) => {
    for (const issue2 of error3.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }, [...path2, ...issue2.path]));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues }, [...path2, ...issue2.path]);
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues }, [...path2, ...issue2.path]);
      } else {
        const fullpath = [...path2, ...issue2.path];
        if (fullpath.length === 0) {
          fieldErrors._errors.push(mapper(issue2));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue2));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }
  };
  processError(error2);
  return fieldErrors;
}

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value;
};
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  return result.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? {
    success: false,
    error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
var _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][0-9a-z]{6,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version2) => {
  if (!version2)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version2}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var httpProtocol = /^https?$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const time3 = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time3}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string = (params) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var boolean = /^(?:true|false)$/i;
var _null = /^null$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a3;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a3 = inst._zod).onattach ?? (_a3.onattach = []);
});
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (def.value < curr) {
      if (def.inclusive)
        bag.maximum = def.value;
      else
        bag.exclusiveMaximum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (def.value > curr) {
      if (def.inclusive)
        bag.minimum = def.value;
      else
        bag.exclusiveMinimum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    var _a3;
    (_a3 = inst2._zod.bag).multipleOf ?? (_a3.multipleOf = def.value);
  });
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
    if (isInt)
      bag.pattern = integer;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a3;
  $ZodCheck.init(inst, def);
  (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst2._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a3;
  $ZodCheck.init(inst, def);
  (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst2._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a3;
  $ZodCheck.init(inst, def);
  (_a3 = inst._zod.def).when ?? (_a3.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a3, _b;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a3 = inst._zod).check ?? (_a3.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {
    });
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/doc.js
var Doc = class {
  constructor(args = []) {
    this.content = [];
    this.indent = 0;
    if (this)
      this.args = args;
  }
  indented(fn) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split("\n").filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const args = this?.args;
    const content = this?.content ?? [``];
    const lines = [...content.map((x) => `  ${x}`)];
    return new F(...args, lines.join("\n"));
  }
};

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 4,
  patch: 3
};

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a3;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...inst._zod.def.checks ?? []];
  if (inst._zod.traits.has("$ZodCheck")) {
    checks.unshift(inst);
  }
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a3 = inst._zod).deferred ?? (_a3.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks2, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks2) {
        if (ch._zod.def.when) {
          if (explicitlyAborted(payload))
            continue;
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError();
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary2) => {
            return handleCanaryResult(canary2, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return result.then((result2) => runChecks(result2, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
  defineLazy(inst, "~standard", () => ({
    validate: (value) => {
      try {
        const r = safeParse(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_2) {
      }
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === void 0)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      if (!def.normalize && def.protocol?.source === httpProtocol.source) {
        if (!/^https?:\/\//i.test(trimmed)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid URL format",
            input: payload.value,
            inst,
            continue: !def.abort
          });
          return;
        }
      }
      const url = new URL(trimmed);
      if (def.hostname) {
        def.hostname.lastIndex = 0;
        if (!def.hostname.test(url.hostname)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: def.hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0;
        if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.normalize) {
        payload.value = url.href;
      } else {
        payload.value = trimmed;
      }
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  def.pattern ?? (def.pattern = nanoid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv4`;
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv6`;
  inst._zod.check = (payload) => {
    try {
      new URL(`http://[${payload.value}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    const parts = payload.value.split("/");
    try {
      if (parts.length !== 2)
        throw new Error();
      const [address, prefix] = parts;
      if (!prefix)
        throw new Error();
      const prefixNum = Number(prefix);
      if (`${prefixNum}` !== prefix)
        throw new Error();
      if (prefixNum < 0 || prefixNum > 128)
        throw new Error();
      new URL(`http://[${address}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (/\s/.test(data))
    return false;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base642 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base642.padEnd(Math.ceil(base642.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.bag.pattern ?? number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodNull = /* @__PURE__ */ $constructor("$ZodNull", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = _null;
  inst._zod.values = /* @__PURE__ */ new Set([null]);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (input === null)
      return payload;
    payload.issues.push({
      expected: "null",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
  const isPresent = key in input;
  if (result.issues.length) {
    if (isOptionalIn && isOptionalOut && !isPresent) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (!isPresent && !isOptionalIn) {
    if (!result.issues.length) {
      final.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: void 0,
        path: [key]
      });
    }
    return;
  }
  if (result.value === void 0) {
    if (isPresent) {
      final.value[key] = void 0;
    }
  } else {
    final.value[key] = result.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const isOptionalIn = _catchall.optin === "optional";
  const isOptionalOut = _catchall.optout === "optional";
  for (const key in input) {
    if (key === "__proto__")
      continue;
    if (keySet.has(key))
      continue;
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalIn, isOptionalOut)));
    } else {
      handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  if (!desc?.get) {
    const sh = def.shape;
    Object.defineProperty(def, "shape", {
      get: () => {
        const newSh = { ...sh };
        Object.defineProperty(def, "shape", {
          value: newSh
        });
        return newSh;
      }
    });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazy(inst._zod, "propValues", () => {
    const shape = def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
        for (const v of field.values)
          propValues[key].add(v);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = {};
    const proms = [];
    const shape = value.shape;
    for (const key of value.keys) {
      const el = shape[key];
      const isOptionalIn = el._zod.optin === "optional";
      const isOptionalOut = el._zod.optout === "optional";
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalIn, isOptionalOut)));
      } else {
        handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const generateFastpass = (shape) => {
    const doc = new Doc(["shape", "payload", "ctx"]);
    const normalized = _normalized.value;
    const parseStr = (key) => {
      const k = esc(key);
      return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    };
    doc.write(`const input = payload.value;`);
    const ids = /* @__PURE__ */ Object.create(null);
    let counter = 0;
    for (const key of normalized.keys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(`const newResult = {};`);
    for (const key of normalized.keys) {
      const id = ids[key];
      const k = esc(key);
      const schema = shape[key];
      const isOptionalIn = schema?._zod?.optin === "optional";
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write(`const ${id} = ${parseStr(key)};`);
      if (isOptionalIn && isOptionalOut) {
        doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      } else if (!isOptionalIn) {
        doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
      } else {
        doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      }
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    const fn = doc.compile();
    return (payload, ctx) => fn(shape, payload, ctx);
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return void 0;
  });
  const first = def.options.length === 1 ? def.options[0]._zod.run : null;
  inst._zod.parse = (payload, ctx) => {
    if (first) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results2) => {
      return handleUnionResults(results2, payload, inst, ctx);
    });
  };
});
var $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
  def.inclusive = false;
  $ZodUnion.init(inst, def);
  const _super = inst._zod.parse;
  defineLazy(inst._zod, "propValues", () => {
    const propValues = {};
    for (const option of def.options) {
      const pv = option._zod.propValues;
      if (!pv || Object.keys(pv).length === 0)
        throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
      for (const [k, v] of Object.entries(pv)) {
        if (!propValues[k])
          propValues[k] = /* @__PURE__ */ new Set();
        for (const val of v) {
          propValues[k].add(val);
        }
      }
    }
    return propValues;
  });
  const disc = cached(() => {
    const opts = def.options;
    const map = /* @__PURE__ */ new Map();
    for (const o of opts) {
      const values = o._zod.propValues?.[def.discriminator];
      if (!values || values.size === 0)
        throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
      for (const v of values) {
        if (map.has(v)) {
          throw new Error(`Duplicate discriminator value "${String(v)}"`);
        }
        map.set(v, o);
      }
    }
    return map;
  });
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isObject(input)) {
      payload.issues.push({
        code: "invalid_type",
        expected: "object",
        input,
        inst
      });
      return payload;
    }
    const opt = disc.value.get(input?.[def.discriminator]);
    if (opt) {
      return opt._zod.run(payload, ctx);
    }
    if (def.unionFallback || ctx.direction === "backward") {
      return _super(payload, ctx);
    }
    payload.issues.push({
      code: "invalid_union",
      errors: [],
      note: "No matching discriminator",
      discriminator: def.discriminator,
      options: Array.from(disc.value.keys()),
      input,
      path: [def.discriminator],
      inst
    });
    return payload;
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left2, right2]) => {
        return handleIntersectionResults(payload, left2, right2);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = /* @__PURE__ */ new Map();
  let unrecIssue;
  for (const iss of left.issues) {
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  for (const iss of right.issues) {
    if (iss.code === "unrecognized_keys") {
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue) {
    result.issues.push({ ...unrecIssue, keys: bothKeys });
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    const values = def.keyType._zod.values;
    if (values) {
      payload.value = {};
      const recordKeys = /* @__PURE__ */ new Set();
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          recordKeys.add(typeof key === "number" ? key.toString() : key);
          const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
          if (keyResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (keyResult.issues.length) {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
            continue;
          }
          const outKey = keyResult.value;
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => {
              if (result2.issues.length) {
                payload.issues.push(...prefixIssues(key, result2.issues));
              }
              payload.value[outKey] = result2.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[outKey] = result.value;
          }
        }
      }
      let unrecognized;
      for (const key in input) {
        if (!recordKeys.has(key)) {
          unrecognized = unrecognized ?? [];
          unrecognized.push(key);
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized
        });
      }
    } else {
      payload.value = {};
      for (const key of Reflect.ownKeys(input)) {
        if (key === "__proto__")
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(input, key))
          continue;
        let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }
        const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length;
        if (checkNumericKey) {
          const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
          if (retryResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (retryResult.issues.length === 0) {
            keyResult = retryResult;
          }
        }
        if (keyResult.issues.length) {
          if (def.mode === "loose") {
            payload.value[key] = input[key];
          } else {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
          }
          continue;
        }
        const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => {
            if (result2.issues.length) {
              payload.issues.push(...prefixIssues(key, result2.issues));
            }
            payload.value[keyResult.value] = result2.value;
          }));
        } else {
          if (result.issues.length) {
            payload.issues.push(...prefixIssues(key, result.issues));
          }
          payload.value[keyResult.value] = result.value;
        }
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  if (def.values.length === 0) {
    throw new Error("Cannot create literal schema with no valid values");
  }
  const values = new Set(def.values);
  inst._zod.values = values;
  inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (values.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values: def.values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output2) => {
        payload.value = output2;
        payload.fallback = true;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError();
    }
    payload.value = _out;
    payload.fallback = true;
    return payload;
  };
});
function handleOptionalResult(result, input) {
  if (input === void 0 && (result.issues.length || result.fallback)) {
    return { issues: [], value: void 0 };
  }
  return result;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const input = payload.value;
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise)
        return result.then((r) => handleOptionalResult(r, input));
      return handleOptionalResult(result, input);
    }
    if (payload.value === void 0) {
      return payload;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleDefaultResult(result2, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === void 0) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleNonOptionalResult(result2, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === void 0) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => {
        payload.value = result2.value;
        if (result2.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
          payload.fallback = true;
        }
        return payload;
      });
    }
    payload.value = result.value;
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        },
        input: payload.value
      });
      payload.issues = [];
      payload.fallback = true;
    }
    return payload;
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right2) => handlePipeResult(right2, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left2) => handlePipeResult(left2, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues, fallback: left.fallback }, ctx);
}
var $ZodPreprocess = /* @__PURE__ */ $constructor("$ZodPreprocess", (inst, def) => {
  $ZodPipe.init(inst, def);
});
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r2) => handleRefineResult(r2, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      // incorporates params.error into issue reporting
      path: [...inst._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort
      // params: inst._zod.def.params,
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/locales/en.js
var error = () => {
  const Sizable = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    // Compatibility: "nan" -> "NaN" for display
    nan: "NaN"
    // All other type names omitted - they fall back to raw values via ?? operator
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        return `Invalid input: expected ${expected}, received ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
        return `Invalid option: expected one of ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Too big: expected ${issue2.origin ?? "value"} to have ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
        return `Too big: expected ${issue2.origin ?? "value"} to be ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Too small: expected ${issue2.origin} to have ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Too small: expected ${issue2.origin} to be ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Invalid string: must start with "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Invalid string: must end with "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Invalid string: must include "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Invalid string: must match pattern ${_issue.pattern}`;
        return `Invalid ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${issue2.origin}`;
      case "invalid_union":
        if (issue2.options && Array.isArray(issue2.options) && issue2.options.length > 0) {
          const opts = issue2.options.map((o) => `'${o}'`).join(" | ");
          return `Invalid discriminator value. Expected ${opts}`;
        }
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${issue2.origin}`;
      default:
        return `Invalid input`;
    }
  };
};
function en_default() {
  return {
    localeError: error()
  };
}

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/registries.js
var _a2;
var $output = Symbol("ZodOutput");
var $input = Symbol("ZodInput");
var $ZodRegistry = class {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
  }
  add(schema, ..._meta) {
    const meta2 = _meta[0];
    this._map.set(schema, meta2);
    if (meta2 && typeof meta2 === "object" && "id" in meta2) {
      this._idmap.set(meta2.id, schema);
    }
    return this;
  }
  clear() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
    return this;
  }
  remove(schema) {
    const meta2 = this._map.get(schema);
    if (meta2 && typeof meta2 === "object" && "id" in meta2) {
      this._idmap.delete(meta2.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : void 0;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
};
function registry() {
  return new $ZodRegistry();
}
(_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/api.js
// @__NO_SIDE_EFFECTS__
function _string(Class2, params) {
  return new Class2({
    type: "string",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _email(Class2, params) {
  return new Class2({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _guid(Class2, params) {
  return new Class2({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _url(Class2, params) {
  return new Class2({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _emoji2(Class2, params) {
  return new Class2({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class2, params) {
  return new Class2({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _xid(Class2, params) {
  return new Class2({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _e164(Class2, params) {
  return new Class2({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class2, params) {
  return new Class2({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class2, params) {
  return new Class2({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class2, params) {
  return new Class2({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _number(Class2, params) {
  return new Class2({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class2, params) {
  return new Class2({
    type: "boolean",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _null2(Class2, params) {
  return new Class2({
    type: "null",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class2) {
  return new Class2({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function _never(Class2, params) {
  return new Class2({
    type: "never",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
  return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
  return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
  return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class2, element, params) {
  return new Class2({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _custom(Class2, fn, _params) {
  const norm = normalizeParams(_params);
  norm.abort ?? (norm.abort = true);
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...norm
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _refine(Class2, fn, _params) {
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn, params) {
  const ch = /* @__PURE__ */ _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  }, params);
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {
    }),
    io: params?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? void 0
  };
}
function process2(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a3;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: void 0, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      process2(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta2 = ctx.metadataRegistry.get(schema);
  if (meta2)
    Object.assign(result.schema, meta2);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && "_prefault" in result.schema)
    (_a3 = result.schema).default ?? (_a3.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = /* @__PURE__ */ new Map();
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id2) => id2);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema2 = seen.schema;
    for (const key in schema2) {
      delete schema2[key];
    }
    schema2.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema2 = seen.def ?? seen.schema;
    const _cached = { ...schema2 };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema2.allOf = schema2.allOf ?? [];
        schema2.allOf.push(refSchema);
      } else {
        Object.assign(schema2, refSchema);
      }
      Object.assign(schema2, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema2[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema2[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema2.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema2) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema2[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema2,
      path: seen.path ?? []
    });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {
  } else {
  }
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
  if (rootMetaId !== void 0 && result.id === rootMetaId)
    delete result.id;
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      if (seen.def.id === seen.defId)
        delete seen.def.id;
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) {
  } else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    if (_schema._zod.traits.has("$ZodCodec"))
      return true;
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
};
var stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
    if (format === "time") {
      delete json.format;
    }
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1)
      json.pattern = regexes[0].source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int"))
    json.type = "integer";
  else
    json.type = "number";
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }
  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }
  if (typeof multipleOf === "number")
    json.multipleOf = multipleOf;
};
var booleanProcessor = (_schema, _ctx, json, _params) => {
  json.type = "boolean";
};
var nullProcessor = (_schema, ctx, json, _params) => {
  if (ctx.target === "openapi-3.0") {
    json.type = "string";
    json.nullable = true;
    json.enum = [null];
  } else {
    json.type = "null";
  }
};
var neverProcessor = (_schema, _ctx, json, _params) => {
  json.not = {};
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {
};
var enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.every((v) => typeof v === "number"))
    json.type = "number";
  if (values.every((v) => typeof v === "string"))
    json.type = "string";
  json.enum = values;
};
var literalProcessor = (schema, ctx, json, _params) => {
  const def = schema._zod.def;
  const vals = [];
  for (const val of def.values) {
    if (val === void 0) {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      } else {
      }
    } else if (typeof val === "bigint") {
      if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt literals cannot be represented in JSON Schema");
      } else {
        vals.push(Number(val));
      }
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) {
  } else if (vals.length === 1) {
    const val = vals[0];
    json.type = val === null ? "null" : typeof val;
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.enum = [val];
    } else {
      json.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number"))
      json.type = "number";
    if (vals.every((v) => typeof v === "string"))
      json.type = "string";
    if (vals.every((v) => typeof v === "boolean"))
      json.type = "boolean";
    if (vals.every((v) => v === null))
      json.type = "null";
    json.enum = vals;
  }
};
var customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
var transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = process2(def.element, ctx, {
    ...params,
    path: [...params.path, "items"]
  });
};
var objectProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  json.properties = {};
  const shape = def.shape;
  for (const key in shape) {
    json.properties[key] = process2(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    });
  }
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set([...allKeys].filter((key) => {
    const v = def.shape[key]._zod;
    if (ctx.io === "input") {
      return v.optin === void 0;
    } else {
      return v.optout === void 0;
    }
  }));
  if (requiredKeys.size > 0) {
    json.required = Array.from(requiredKeys);
  }
  if (def.catchall?._zod.def.type === "never") {
    json.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = process2(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process2(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = process2(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process2(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
};
var recordProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  const keyType = def.keyType;
  const keyBag = keyType._zod.bag;
  const patterns = keyBag?.patterns;
  if (def.mode === "loose" && patterns && patterns.size > 0) {
    const valueSchema = process2(def.valueType, ctx, {
      ...params,
      path: [...params.path, "patternProperties", "*"]
    });
    json.patternProperties = {};
    for (const pattern of patterns) {
      json.patternProperties[pattern.source] = valueSchema;
    }
  } else {
    if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
      json.propertyNames = process2(def.keyType, ctx, {
        ...params,
        path: [...params.path, "propertyNames"]
      });
    }
    json.additionalProperties = process2(def.valueType, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
  const keyValues = keyType._zod.values;
  if (keyValues) {
    const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
    if (validKeyValues.length > 0) {
      json.required = validKeyValues;
    }
  }
};
var nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input")
    json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const inIsTransform = def.in._zod.traits.has("$ZodTransform");
  const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
  process2(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-compat.js
function isZ4Schema(s) {
  const schema = s;
  return !!schema._zod;
}
function safeParse2(schema, data) {
  if (isZ4Schema(schema)) {
    const result2 = safeParse(schema, data);
    return result2;
  }
  const v3Schema = schema;
  const result = v3Schema.safeParse(data);
  return result;
}
function getObjectShape(schema) {
  if (!schema)
    return void 0;
  let rawShape;
  if (isZ4Schema(schema)) {
    const v4Schema = schema;
    rawShape = v4Schema._zod?.def?.shape;
  } else {
    const v3Schema = schema;
    rawShape = v3Schema.shape;
  }
  if (!rawShape)
    return void 0;
  if (typeof rawShape === "function") {
    try {
      return rawShape();
    } catch {
      return void 0;
    }
  }
  return rawShape;
}
function getLiteralValue(schema) {
  if (isZ4Schema(schema)) {
    const v4Schema = schema;
    const def2 = v4Schema._zod?.def;
    if (def2) {
      if (def2.value !== void 0)
        return def2.value;
      if (Array.isArray(def2.values) && def2.values.length > 0) {
        return def2.values[0];
      }
    }
  }
  const v3Schema = schema;
  const def = v3Schema._def;
  if (def) {
    if (def.value !== void 0)
      return def.value;
    if (Array.isArray(def.values) && def.values.length > 0) {
      return def.values[0];
    }
  }
  const directValue = schema.value;
  if (directValue !== void 0)
    return directValue;
  return void 0;
}

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/classic/iso.js
var iso_exports = {};
__export(iso_exports, {
  ZodISODate: () => ZodISODate,
  ZodISODateTime: () => ZodISODateTime,
  ZodISODuration: () => ZodISODuration,
  ZodISOTime: () => ZodISOTime,
  date: () => date2,
  datetime: () => datetime2,
  duration: () => duration2,
  time: () => time2
});
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function date2(params) {
  return _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/classic/errors.js
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper)
      // enumerable: false,
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper)
      // enumerable: false,
    },
    addIssue: {
      value: (issue2) => {
        inst.issues.push(issue2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (issues2) => {
        inst.issues.push(...issues2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
      // enumerable: false,
    }
  });
};
var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, {
  Parent: Error
});

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/classic/parse.js
var parse2 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse3 = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode2 = /* @__PURE__ */ _encode(ZodRealError);
var decode2 = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync2 = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync2 = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode2 = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode2 = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync2 = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync2 = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/classic/schemas.js
var _installedGroups = /* @__PURE__ */ new WeakMap();
function _installLazyMethods(inst, group, methods) {
  const proto = Object.getPrototypeOf(inst);
  let installed = _installedGroups.get(proto);
  if (!installed) {
    installed = /* @__PURE__ */ new Set();
    _installedGroups.set(proto, installed);
  }
  if (installed.has(group))
    return;
  installed.add(group);
  for (const key in methods) {
    const fn = methods[key];
    Object.defineProperty(proto, key, {
      configurable: true,
      enumerable: false,
      get() {
        const bound = fn.bind(this);
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: bound
        });
        return bound;
      },
      set(v) {
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v
        });
      }
    });
  }
}
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output")
    }
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.parse = (data, params) => parse2(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse3(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode2(inst, data, params);
  inst.decode = (data, params) => decode2(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync2(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync2(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode2(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode2(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync2(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync2(inst, data, params);
  _installLazyMethods(inst, "ZodType", {
    check(...chks) {
      const def2 = this.def;
      return this.clone(util_exports.mergeDefs(def2, {
        checks: [
          ...def2.checks ?? [],
          ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
        ]
      }), { parent: true });
    },
    with(...chks) {
      return this.check(...chks);
    },
    clone(def2, params) {
      return clone(this, def2, params);
    },
    brand() {
      return this;
    },
    register(reg, meta2) {
      reg.add(this, meta2);
      return this;
    },
    refine(check, params) {
      return this.check(refine(check, params));
    },
    superRefine(refinement, params) {
      return this.check(superRefine(refinement, params));
    },
    overwrite(fn) {
      return this.check(_overwrite(fn));
    },
    optional() {
      return optional(this);
    },
    exactOptional() {
      return exactOptional(this);
    },
    nullable() {
      return nullable(this);
    },
    nullish() {
      return optional(nullable(this));
    },
    nonoptional(params) {
      return nonoptional(this, params);
    },
    array() {
      return array(this);
    },
    or(arg) {
      return union([this, arg]);
    },
    and(arg) {
      return intersection(this, arg);
    },
    transform(tx) {
      return pipe(this, transform(tx));
    },
    default(d) {
      return _default(this, d);
    },
    prefault(d) {
      return prefault(this, d);
    },
    catch(params) {
      return _catch(this, params);
    },
    pipe(target) {
      return pipe(this, target);
    },
    readonly() {
      return readonly(this);
    },
    describe(description) {
      const cl = this.clone();
      globalRegistry.add(cl, { description });
      return cl;
    },
    meta(...args) {
      if (args.length === 0)
        return globalRegistry.get(this);
      const cl = this.clone();
      globalRegistry.add(cl, args[0]);
      return cl;
    },
    isOptional() {
      return this.safeParse(void 0).success;
    },
    isNullable() {
      return this.safeParse(null).success;
    },
    apply(fn) {
      return fn(this);
    }
  });
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true
  });
  return inst;
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
  _installLazyMethods(inst, "_ZodString", {
    regex(...args) {
      return this.check(_regex(...args));
    },
    includes(...args) {
      return this.check(_includes(...args));
    },
    startsWith(...args) {
      return this.check(_startsWith(...args));
    },
    endsWith(...args) {
      return this.check(_endsWith(...args));
    },
    min(...args) {
      return this.check(_minLength(...args));
    },
    max(...args) {
      return this.check(_maxLength(...args));
    },
    length(...args) {
      return this.check(_length(...args));
    },
    nonempty(...args) {
      return this.check(_minLength(1, ...args));
    },
    lowercase(params) {
      return this.check(_lowercase(params));
    },
    uppercase(params) {
      return this.check(_uppercase(params));
    },
    trim() {
      return this.check(_trim());
    },
    normalize(...args) {
      return this.check(_normalize(...args));
    },
    toLowerCase() {
      return this.check(_toLowerCase());
    },
    toUpperCase() {
      return this.check(_toUpperCase());
    },
    slugify() {
      return this.check(_slugify());
    }
  });
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
  inst.email = (params) => inst.check(_email(ZodEmail, params));
  inst.url = (params) => inst.check(_url(ZodURL, params));
  inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
  inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
  inst.xid = (params) => inst.check(_xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
  inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
  inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
  inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
  inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
  inst.e164 = (params) => inst.check(_e164(ZodE164, params));
  inst.datetime = (params) => inst.check(datetime2(params));
  inst.date = (params) => inst.check(date2(params));
  inst.time = (params) => inst.check(time2(params));
  inst.duration = (params) => inst.check(duration2(params));
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
  _installLazyMethods(inst, "ZodNumber", {
    gt(value, params) {
      return this.check(_gt(value, params));
    },
    gte(value, params) {
      return this.check(_gte(value, params));
    },
    min(value, params) {
      return this.check(_gte(value, params));
    },
    lt(value, params) {
      return this.check(_lt(value, params));
    },
    lte(value, params) {
      return this.check(_lte(value, params));
    },
    max(value, params) {
      return this.check(_lte(value, params));
    },
    int(params) {
      return this.check(int(params));
    },
    safe(params) {
      return this.check(int(params));
    },
    positive(params) {
      return this.check(_gt(0, params));
    },
    nonnegative(params) {
      return this.check(_gte(0, params));
    },
    negative(params) {
      return this.check(_lt(0, params));
    },
    nonpositive(params) {
      return this.check(_lte(0, params));
    },
    multipleOf(value, params) {
      return this.check(_multipleOf(value, params));
    },
    step(value, params) {
      return this.check(_multipleOf(value, params));
    },
    finite() {
      return this;
    }
  });
  const bag = inst._zod.bag;
  inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = bag.format ?? null;
});
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return _int(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
var ZodNull = /* @__PURE__ */ $constructor("ZodNull", (inst, def) => {
  $ZodNull.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullProcessor(inst, ctx, json, params);
});
function _null3(params) {
  return _null2(ZodNull, params);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
  _installLazyMethods(inst, "ZodArray", {
    min(n, params) {
      return this.check(_minLength(n, params));
    },
    nonempty(params) {
      return this.check(_minLength(1, params));
    },
    max(n, params) {
      return this.check(_maxLength(n, params));
    },
    length(n, params) {
      return this.check(_length(n, params));
    },
    unwrap() {
      return this.element;
    }
  });
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
  util_exports.defineLazy(inst, "shape", () => {
    return def.shape;
  });
  _installLazyMethods(inst, "ZodObject", {
    keyof() {
      return _enum(Object.keys(this._zod.def.shape));
    },
    catchall(catchall) {
      return this.clone({ ...this._zod.def, catchall });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    strict() {
      return this.clone({ ...this._zod.def, catchall: never() });
    },
    strip() {
      return this.clone({ ...this._zod.def, catchall: void 0 });
    },
    extend(incoming) {
      return util_exports.extend(this, incoming);
    },
    safeExtend(incoming) {
      return util_exports.safeExtend(this, incoming);
    },
    merge(other) {
      return util_exports.merge(this, other);
    },
    pick(mask) {
      return util_exports.pick(this, mask);
    },
    omit(mask) {
      return util_exports.omit(this, mask);
    },
    partial(...args) {
      return util_exports.partial(ZodOptional, this, args[0]);
    },
    required(...args) {
      return util_exports.required(ZodNonOptional, this, args[0]);
    }
  });
});
function object2(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...util_exports.normalizeParams(params)
  };
  return new ZodObject(def);
}
function looseObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: unknown(),
    ...util_exports.normalizeParams(params)
  });
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...util_exports.normalizeParams(params)
  });
}
var ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodDiscriminatedUnion", (inst, def) => {
  ZodUnion.init(inst, def);
  $ZodDiscriminatedUnion.init(inst, def);
});
function discriminatedUnion(discriminator, options, params) {
  return new ZodDiscriminatedUnion({
    type: "union",
    options,
    discriminator,
    ...util_exports.normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
  $ZodRecord.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
  if (!valueType || !valueType._zod) {
    return new ZodRecord({
      type: "record",
      keyType: string2(),
      valueType: keyType,
      ...util_exports.normalizeParams(valueType)
    });
  }
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util_exports.normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util_exports.normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...util_exports.normalizeParams(params)
  });
}
var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
  $ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
  inst.values = new Set(def.values);
  Object.defineProperty(inst, "value", {
    get() {
      if (def.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return def.values[0];
    }
  });
});
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util_exports.normalizeParams(params)
  });
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(util_exports.issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(util_exports.issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output2) => {
        payload.value = output2;
        payload.fallback = true;
        return payload;
      });
    }
    payload.value = output;
    payload.fallback = true;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
    // ...util.normalizeParams(params),
  });
}
var ZodPreprocess = /* @__PURE__ */ $constructor("ZodPreprocess", (inst, def) => {
  ZodPipe.init(inst, def);
  $ZodPreprocess.init(inst, def);
});
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function custom(fn, _params) {
  return _custom(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
  return _superRefine(fn, params);
}
function preprocess(fn, schema) {
  return new ZodPreprocess({
    type: "pipe",
    in: transform(fn),
    out: schema
  });
}

// node_modules/@modelcontextprotocol/sdk/node_modules/zod/v4/classic/external.js
config(en_default());

// node_modules/@modelcontextprotocol/sdk/dist/esm/types.js
var LATEST_PROTOCOL_VERSION = "2025-11-25";
var DEFAULT_NEGOTIATED_PROTOCOL_VERSION = "2025-03-26";
var SUPPORTED_PROTOCOL_VERSIONS = [LATEST_PROTOCOL_VERSION, "2025-06-18", "2025-03-26", "2024-11-05", "2024-10-07"];
var RELATED_TASK_META_KEY = "io.modelcontextprotocol/related-task";
var JSONRPC_VERSION = "2.0";
var AssertObjectSchema = custom((v) => v !== null && (typeof v === "object" || typeof v === "function"));
var ProgressTokenSchema = union([string2(), number2().int()]);
var CursorSchema = string2();
var TaskCreationParamsSchema = looseObject({
  /**
   * Requested duration in milliseconds to retain task from creation.
   */
  ttl: number2().optional(),
  /**
   * Time in milliseconds to wait between task status requests.
   */
  pollInterval: number2().optional()
});
var TaskMetadataSchema = object2({
  ttl: number2().optional()
});
var RelatedTaskMetadataSchema = object2({
  taskId: string2()
});
var RequestMetaSchema = looseObject({
  /**
   * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
   */
  progressToken: ProgressTokenSchema.optional(),
  /**
   * If specified, this request is related to the provided task.
   */
  [RELATED_TASK_META_KEY]: RelatedTaskMetadataSchema.optional()
});
var BaseRequestParamsSchema = object2({
  /**
   * See [General fields: `_meta`](/specification/draft/basic/index#meta) for notes on `_meta` usage.
   */
  _meta: RequestMetaSchema.optional()
});
var TaskAugmentedRequestParamsSchema = BaseRequestParamsSchema.extend({
  /**
   * If specified, the caller is requesting task-augmented execution for this request.
   * The request will return a CreateTaskResult immediately, and the actual result can be
   * retrieved later via tasks/result.
   *
   * Task augmentation is subject to capability negotiation - receivers MUST declare support
   * for task augmentation of specific request types in their capabilities.
   */
  task: TaskMetadataSchema.optional()
});
var isTaskAugmentedRequestParams = (value) => TaskAugmentedRequestParamsSchema.safeParse(value).success;
var RequestSchema = object2({
  method: string2(),
  params: BaseRequestParamsSchema.loose().optional()
});
var NotificationsParamsSchema = object2({
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: RequestMetaSchema.optional()
});
var NotificationSchema = object2({
  method: string2(),
  params: NotificationsParamsSchema.loose().optional()
});
var ResultSchema = looseObject({
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: RequestMetaSchema.optional()
});
var RequestIdSchema = union([string2(), number2().int()]);
var JSONRPCRequestSchema = object2({
  jsonrpc: literal(JSONRPC_VERSION),
  id: RequestIdSchema,
  ...RequestSchema.shape
}).strict();
var isJSONRPCRequest = (value) => JSONRPCRequestSchema.safeParse(value).success;
var JSONRPCNotificationSchema = object2({
  jsonrpc: literal(JSONRPC_VERSION),
  ...NotificationSchema.shape
}).strict();
var isJSONRPCNotification = (value) => JSONRPCNotificationSchema.safeParse(value).success;
var JSONRPCResultResponseSchema = object2({
  jsonrpc: literal(JSONRPC_VERSION),
  id: RequestIdSchema,
  result: ResultSchema
}).strict();
var isJSONRPCResultResponse = (value) => JSONRPCResultResponseSchema.safeParse(value).success;
var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2[ErrorCode2["ConnectionClosed"] = -32e3] = "ConnectionClosed";
  ErrorCode2[ErrorCode2["RequestTimeout"] = -32001] = "RequestTimeout";
  ErrorCode2[ErrorCode2["ParseError"] = -32700] = "ParseError";
  ErrorCode2[ErrorCode2["InvalidRequest"] = -32600] = "InvalidRequest";
  ErrorCode2[ErrorCode2["MethodNotFound"] = -32601] = "MethodNotFound";
  ErrorCode2[ErrorCode2["InvalidParams"] = -32602] = "InvalidParams";
  ErrorCode2[ErrorCode2["InternalError"] = -32603] = "InternalError";
  ErrorCode2[ErrorCode2["UrlElicitationRequired"] = -32042] = "UrlElicitationRequired";
})(ErrorCode || (ErrorCode = {}));
var JSONRPCErrorResponseSchema = object2({
  jsonrpc: literal(JSONRPC_VERSION),
  id: RequestIdSchema.optional(),
  error: object2({
    /**
     * The error type that occurred.
     */
    code: number2().int(),
    /**
     * A short description of the error. The message SHOULD be limited to a concise single sentence.
     */
    message: string2(),
    /**
     * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    data: unknown().optional()
  })
}).strict();
var isJSONRPCErrorResponse = (value) => JSONRPCErrorResponseSchema.safeParse(value).success;
var JSONRPCMessageSchema = union([
  JSONRPCRequestSchema,
  JSONRPCNotificationSchema,
  JSONRPCResultResponseSchema,
  JSONRPCErrorResponseSchema
]);
var JSONRPCResponseSchema = union([JSONRPCResultResponseSchema, JSONRPCErrorResponseSchema]);
var EmptyResultSchema = ResultSchema.strict();
var CancelledNotificationParamsSchema = NotificationsParamsSchema.extend({
  /**
   * The ID of the request to cancel.
   *
   * This MUST correspond to the ID of a request previously issued in the same direction.
   */
  requestId: RequestIdSchema.optional(),
  /**
   * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
   */
  reason: string2().optional()
});
var CancelledNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/cancelled"),
  params: CancelledNotificationParamsSchema
});
var IconSchema = object2({
  /**
   * URL or data URI for the icon.
   */
  src: string2(),
  /**
   * Optional MIME type for the icon.
   */
  mimeType: string2().optional(),
  /**
   * Optional array of strings that specify sizes at which the icon can be used.
   * Each string should be in WxH format (e.g., `"48x48"`, `"96x96"`) or `"any"` for scalable formats like SVG.
   *
   * If not provided, the client should assume that the icon can be used at any size.
   */
  sizes: array(string2()).optional(),
  /**
   * Optional specifier for the theme this icon is designed for. `light` indicates
   * the icon is designed to be used with a light background, and `dark` indicates
   * the icon is designed to be used with a dark background.
   *
   * If not provided, the client should assume the icon can be used with any theme.
   */
  theme: _enum(["light", "dark"]).optional()
});
var IconsSchema = object2({
  /**
   * Optional set of sized icons that the client can display in a user interface.
   *
   * Clients that support rendering icons MUST support at least the following MIME types:
   * - `image/png` - PNG images (safe, universal compatibility)
   * - `image/jpeg` (and `image/jpg`) - JPEG images (safe, universal compatibility)
   *
   * Clients that support rendering icons SHOULD also support:
   * - `image/svg+xml` - SVG images (scalable but requires security precautions)
   * - `image/webp` - WebP images (modern, efficient format)
   */
  icons: array(IconSchema).optional()
});
var BaseMetadataSchema = object2({
  /** Intended for programmatic or logical use, but used as a display name in past specs or fallback */
  name: string2(),
  /**
   * Intended for UI and end-user contexts — optimized to be human-readable and easily understood,
   * even by those unfamiliar with domain-specific terminology.
   *
   * If not provided, the name should be used for display (except for Tool,
   * where `annotations.title` should be given precedence over using `name`,
   * if present).
   */
  title: string2().optional()
});
var ImplementationSchema = BaseMetadataSchema.extend({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  version: string2(),
  /**
   * An optional URL of the website for this implementation.
   */
  websiteUrl: string2().optional(),
  /**
   * An optional human-readable description of what this implementation does.
   *
   * This can be used by clients or servers to provide context about their purpose
   * and capabilities. For example, a server might describe the types of resources
   * or tools it provides, while a client might describe its intended use case.
   */
  description: string2().optional()
});
var FormElicitationCapabilitySchema = intersection(object2({
  applyDefaults: boolean2().optional()
}), record(string2(), unknown()));
var ElicitationCapabilitySchema = preprocess((value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (Object.keys(value).length === 0) {
      return { form: {} };
    }
  }
  return value;
}, intersection(object2({
  form: FormElicitationCapabilitySchema.optional(),
  url: AssertObjectSchema.optional()
}), record(string2(), unknown()).optional()));
var ClientTasksCapabilitySchema = looseObject({
  /**
   * Present if the client supports listing tasks.
   */
  list: AssertObjectSchema.optional(),
  /**
   * Present if the client supports cancelling tasks.
   */
  cancel: AssertObjectSchema.optional(),
  /**
   * Capabilities for task creation on specific request types.
   */
  requests: looseObject({
    /**
     * Task support for sampling requests.
     */
    sampling: looseObject({
      createMessage: AssertObjectSchema.optional()
    }).optional(),
    /**
     * Task support for elicitation requests.
     */
    elicitation: looseObject({
      create: AssertObjectSchema.optional()
    }).optional()
  }).optional()
});
var ServerTasksCapabilitySchema = looseObject({
  /**
   * Present if the server supports listing tasks.
   */
  list: AssertObjectSchema.optional(),
  /**
   * Present if the server supports cancelling tasks.
   */
  cancel: AssertObjectSchema.optional(),
  /**
   * Capabilities for task creation on specific request types.
   */
  requests: looseObject({
    /**
     * Task support for tool requests.
     */
    tools: looseObject({
      call: AssertObjectSchema.optional()
    }).optional()
  }).optional()
});
var ClientCapabilitiesSchema = object2({
  /**
   * Experimental, non-standard capabilities that the client supports.
   */
  experimental: record(string2(), AssertObjectSchema).optional(),
  /**
   * Present if the client supports sampling from an LLM.
   */
  sampling: object2({
    /**
     * Present if the client supports context inclusion via includeContext parameter.
     * If not declared, servers SHOULD only use `includeContext: "none"` (or omit it).
     */
    context: AssertObjectSchema.optional(),
    /**
     * Present if the client supports tool use via tools and toolChoice parameters.
     */
    tools: AssertObjectSchema.optional()
  }).optional(),
  /**
   * Present if the client supports eliciting user input.
   */
  elicitation: ElicitationCapabilitySchema.optional(),
  /**
   * Present if the client supports listing roots.
   */
  roots: object2({
    /**
     * Whether the client supports issuing notifications for changes to the roots list.
     */
    listChanged: boolean2().optional()
  }).optional(),
  /**
   * Present if the client supports task creation.
   */
  tasks: ClientTasksCapabilitySchema.optional(),
  /**
   * Extensions that the client supports. Keys are extension identifiers (vendor-prefix/extension-name).
   */
  extensions: record(string2(), AssertObjectSchema).optional()
});
var InitializeRequestParamsSchema = BaseRequestParamsSchema.extend({
  /**
   * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
   */
  protocolVersion: string2(),
  capabilities: ClientCapabilitiesSchema,
  clientInfo: ImplementationSchema
});
var InitializeRequestSchema = RequestSchema.extend({
  method: literal("initialize"),
  params: InitializeRequestParamsSchema
});
var isInitializeRequest = (value) => InitializeRequestSchema.safeParse(value).success;
var ServerCapabilitiesSchema = object2({
  /**
   * Experimental, non-standard capabilities that the server supports.
   */
  experimental: record(string2(), AssertObjectSchema).optional(),
  /**
   * Present if the server supports sending log messages to the client.
   */
  logging: AssertObjectSchema.optional(),
  /**
   * Present if the server supports sending completions to the client.
   */
  completions: AssertObjectSchema.optional(),
  /**
   * Present if the server offers any prompt templates.
   */
  prompts: object2({
    /**
     * Whether this server supports issuing notifications for changes to the prompt list.
     */
    listChanged: boolean2().optional()
  }).optional(),
  /**
   * Present if the server offers any resources to read.
   */
  resources: object2({
    /**
     * Whether this server supports clients subscribing to resource updates.
     */
    subscribe: boolean2().optional(),
    /**
     * Whether this server supports issuing notifications for changes to the resource list.
     */
    listChanged: boolean2().optional()
  }).optional(),
  /**
   * Present if the server offers any tools to call.
   */
  tools: object2({
    /**
     * Whether this server supports issuing notifications for changes to the tool list.
     */
    listChanged: boolean2().optional()
  }).optional(),
  /**
   * Present if the server supports task creation.
   */
  tasks: ServerTasksCapabilitySchema.optional(),
  /**
   * Extensions that the server supports. Keys are extension identifiers (vendor-prefix/extension-name).
   */
  extensions: record(string2(), AssertObjectSchema).optional()
});
var InitializeResultSchema = ResultSchema.extend({
  /**
   * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
   */
  protocolVersion: string2(),
  capabilities: ServerCapabilitiesSchema,
  serverInfo: ImplementationSchema,
  /**
   * Instructions describing how to use the server and its features.
   *
   * This can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a "hint" to the model. For example, this information MAY be added to the system prompt.
   */
  instructions: string2().optional()
});
var InitializedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/initialized"),
  params: NotificationsParamsSchema.optional()
});
var PingRequestSchema = RequestSchema.extend({
  method: literal("ping"),
  params: BaseRequestParamsSchema.optional()
});
var ProgressSchema = object2({
  /**
   * The progress thus far. This should increase every time progress is made, even if the total is unknown.
   */
  progress: number2(),
  /**
   * Total number of items to process (or total progress required), if known.
   */
  total: optional(number2()),
  /**
   * An optional message describing the current progress.
   */
  message: optional(string2())
});
var ProgressNotificationParamsSchema = object2({
  ...NotificationsParamsSchema.shape,
  ...ProgressSchema.shape,
  /**
   * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
   */
  progressToken: ProgressTokenSchema
});
var ProgressNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/progress"),
  params: ProgressNotificationParamsSchema
});
var PaginatedRequestParamsSchema = BaseRequestParamsSchema.extend({
  /**
   * An opaque token representing the current pagination position.
   * If provided, the server should return results starting after this cursor.
   */
  cursor: CursorSchema.optional()
});
var PaginatedRequestSchema = RequestSchema.extend({
  params: PaginatedRequestParamsSchema.optional()
});
var PaginatedResultSchema = ResultSchema.extend({
  /**
   * An opaque token representing the pagination position after the last returned result.
   * If present, there may be more results available.
   */
  nextCursor: CursorSchema.optional()
});
var TaskStatusSchema = _enum(["working", "input_required", "completed", "failed", "cancelled"]);
var TaskSchema = object2({
  taskId: string2(),
  status: TaskStatusSchema,
  /**
   * Time in milliseconds to keep task results available after completion.
   * If null, the task has unlimited lifetime until manually cleaned up.
   */
  ttl: union([number2(), _null3()]),
  /**
   * ISO 8601 timestamp when the task was created.
   */
  createdAt: string2(),
  /**
   * ISO 8601 timestamp when the task was last updated.
   */
  lastUpdatedAt: string2(),
  pollInterval: optional(number2()),
  /**
   * Optional diagnostic message for failed tasks or other status information.
   */
  statusMessage: optional(string2())
});
var CreateTaskResultSchema = ResultSchema.extend({
  task: TaskSchema
});
var TaskStatusNotificationParamsSchema = NotificationsParamsSchema.merge(TaskSchema);
var TaskStatusNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/tasks/status"),
  params: TaskStatusNotificationParamsSchema
});
var GetTaskRequestSchema = RequestSchema.extend({
  method: literal("tasks/get"),
  params: BaseRequestParamsSchema.extend({
    taskId: string2()
  })
});
var GetTaskResultSchema = ResultSchema.merge(TaskSchema);
var GetTaskPayloadRequestSchema = RequestSchema.extend({
  method: literal("tasks/result"),
  params: BaseRequestParamsSchema.extend({
    taskId: string2()
  })
});
var GetTaskPayloadResultSchema = ResultSchema.loose();
var ListTasksRequestSchema = PaginatedRequestSchema.extend({
  method: literal("tasks/list")
});
var ListTasksResultSchema = PaginatedResultSchema.extend({
  tasks: array(TaskSchema)
});
var CancelTaskRequestSchema = RequestSchema.extend({
  method: literal("tasks/cancel"),
  params: BaseRequestParamsSchema.extend({
    taskId: string2()
  })
});
var CancelTaskResultSchema = ResultSchema.merge(TaskSchema);
var ResourceContentsSchema = object2({
  /**
   * The URI of this resource.
   */
  uri: string2(),
  /**
   * The MIME type of this resource, if known.
   */
  mimeType: optional(string2()),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var TextResourceContentsSchema = ResourceContentsSchema.extend({
  /**
   * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
   */
  text: string2()
});
var Base64Schema = string2().refine((val) => {
  try {
    atob(val);
    return true;
  } catch {
    return false;
  }
}, { message: "Invalid Base64 string" });
var BlobResourceContentsSchema = ResourceContentsSchema.extend({
  /**
   * A base64-encoded string representing the binary data of the item.
   */
  blob: Base64Schema
});
var RoleSchema = _enum(["user", "assistant"]);
var AnnotationsSchema = object2({
  /**
   * Intended audience(s) for the resource.
   */
  audience: array(RoleSchema).optional(),
  /**
   * Importance hint for the resource, from 0 (least) to 1 (most).
   */
  priority: number2().min(0).max(1).optional(),
  /**
   * ISO 8601 timestamp for the most recent modification.
   */
  lastModified: iso_exports.datetime({ offset: true }).optional()
});
var ResourceSchema = object2({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  /**
   * The URI of this resource.
   */
  uri: string2(),
  /**
   * A description of what this resource represents.
   *
   * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
   */
  description: optional(string2()),
  /**
   * The MIME type of this resource, if known.
   */
  mimeType: optional(string2()),
  /**
   * The size of the raw resource content, in bytes (i.e., before base64 encoding or any tokenization), if known.
   *
   * This can be used by Hosts to display file sizes and estimate context window usage.
   */
  size: optional(number2()),
  /**
   * Optional annotations for the client.
   */
  annotations: AnnotationsSchema.optional(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: optional(looseObject({}))
});
var ResourceTemplateSchema = object2({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  /**
   * A URI template (according to RFC 6570) that can be used to construct resource URIs.
   */
  uriTemplate: string2(),
  /**
   * A description of what this template is for.
   *
   * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
   */
  description: optional(string2()),
  /**
   * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
   */
  mimeType: optional(string2()),
  /**
   * Optional annotations for the client.
   */
  annotations: AnnotationsSchema.optional(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: optional(looseObject({}))
});
var ListResourcesRequestSchema = PaginatedRequestSchema.extend({
  method: literal("resources/list")
});
var ListResourcesResultSchema = PaginatedResultSchema.extend({
  resources: array(ResourceSchema)
});
var ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
  method: literal("resources/templates/list")
});
var ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
  resourceTemplates: array(ResourceTemplateSchema)
});
var ResourceRequestParamsSchema = BaseRequestParamsSchema.extend({
  /**
   * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
   *
   * @format uri
   */
  uri: string2()
});
var ReadResourceRequestParamsSchema = ResourceRequestParamsSchema;
var ReadResourceRequestSchema = RequestSchema.extend({
  method: literal("resources/read"),
  params: ReadResourceRequestParamsSchema
});
var ReadResourceResultSchema = ResultSchema.extend({
  contents: array(union([TextResourceContentsSchema, BlobResourceContentsSchema]))
});
var ResourceListChangedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/resources/list_changed"),
  params: NotificationsParamsSchema.optional()
});
var SubscribeRequestParamsSchema = ResourceRequestParamsSchema;
var SubscribeRequestSchema = RequestSchema.extend({
  method: literal("resources/subscribe"),
  params: SubscribeRequestParamsSchema
});
var UnsubscribeRequestParamsSchema = ResourceRequestParamsSchema;
var UnsubscribeRequestSchema = RequestSchema.extend({
  method: literal("resources/unsubscribe"),
  params: UnsubscribeRequestParamsSchema
});
var ResourceUpdatedNotificationParamsSchema = NotificationsParamsSchema.extend({
  /**
   * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
   */
  uri: string2()
});
var ResourceUpdatedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/resources/updated"),
  params: ResourceUpdatedNotificationParamsSchema
});
var PromptArgumentSchema = object2({
  /**
   * The name of the argument.
   */
  name: string2(),
  /**
   * A human-readable description of the argument.
   */
  description: optional(string2()),
  /**
   * Whether this argument must be provided.
   */
  required: optional(boolean2())
});
var PromptSchema = object2({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  /**
   * An optional description of what this prompt provides
   */
  description: optional(string2()),
  /**
   * A list of arguments to use for templating the prompt.
   */
  arguments: optional(array(PromptArgumentSchema)),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: optional(looseObject({}))
});
var ListPromptsRequestSchema = PaginatedRequestSchema.extend({
  method: literal("prompts/list")
});
var ListPromptsResultSchema = PaginatedResultSchema.extend({
  prompts: array(PromptSchema)
});
var GetPromptRequestParamsSchema = BaseRequestParamsSchema.extend({
  /**
   * The name of the prompt or prompt template.
   */
  name: string2(),
  /**
   * Arguments to use for templating the prompt.
   */
  arguments: record(string2(), string2()).optional()
});
var GetPromptRequestSchema = RequestSchema.extend({
  method: literal("prompts/get"),
  params: GetPromptRequestParamsSchema
});
var TextContentSchema = object2({
  type: literal("text"),
  /**
   * The text content of the message.
   */
  text: string2(),
  /**
   * Optional annotations for the client.
   */
  annotations: AnnotationsSchema.optional(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var ImageContentSchema = object2({
  type: literal("image"),
  /**
   * The base64-encoded image data.
   */
  data: Base64Schema,
  /**
   * The MIME type of the image. Different providers may support different image types.
   */
  mimeType: string2(),
  /**
   * Optional annotations for the client.
   */
  annotations: AnnotationsSchema.optional(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var AudioContentSchema = object2({
  type: literal("audio"),
  /**
   * The base64-encoded audio data.
   */
  data: Base64Schema,
  /**
   * The MIME type of the audio. Different providers may support different audio types.
   */
  mimeType: string2(),
  /**
   * Optional annotations for the client.
   */
  annotations: AnnotationsSchema.optional(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var ToolUseContentSchema = object2({
  type: literal("tool_use"),
  /**
   * The name of the tool to invoke.
   * Must match a tool name from the request's tools array.
   */
  name: string2(),
  /**
   * Unique identifier for this tool call.
   * Used to correlate with ToolResultContent in subsequent messages.
   */
  id: string2(),
  /**
   * Arguments to pass to the tool.
   * Must conform to the tool's inputSchema.
   */
  input: record(string2(), unknown()),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var EmbeddedResourceSchema = object2({
  type: literal("resource"),
  resource: union([TextResourceContentsSchema, BlobResourceContentsSchema]),
  /**
   * Optional annotations for the client.
   */
  annotations: AnnotationsSchema.optional(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var ResourceLinkSchema = ResourceSchema.extend({
  type: literal("resource_link")
});
var ContentBlockSchema = union([
  TextContentSchema,
  ImageContentSchema,
  AudioContentSchema,
  ResourceLinkSchema,
  EmbeddedResourceSchema
]);
var PromptMessageSchema = object2({
  role: RoleSchema,
  content: ContentBlockSchema
});
var GetPromptResultSchema = ResultSchema.extend({
  /**
   * An optional description for the prompt.
   */
  description: string2().optional(),
  messages: array(PromptMessageSchema)
});
var PromptListChangedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/prompts/list_changed"),
  params: NotificationsParamsSchema.optional()
});
var ToolAnnotationsSchema = object2({
  /**
   * A human-readable title for the tool.
   */
  title: string2().optional(),
  /**
   * If true, the tool does not modify its environment.
   *
   * Default: false
   */
  readOnlyHint: boolean2().optional(),
  /**
   * If true, the tool may perform destructive updates to its environment.
   * If false, the tool performs only additive updates.
   *
   * (This property is meaningful only when `readOnlyHint == false`)
   *
   * Default: true
   */
  destructiveHint: boolean2().optional(),
  /**
   * If true, calling the tool repeatedly with the same arguments
   * will have no additional effect on the its environment.
   *
   * (This property is meaningful only when `readOnlyHint == false`)
   *
   * Default: false
   */
  idempotentHint: boolean2().optional(),
  /**
   * If true, this tool may interact with an "open world" of external
   * entities. If false, the tool's domain of interaction is closed.
   * For example, the world of a web search tool is open, whereas that
   * of a memory tool is not.
   *
   * Default: true
   */
  openWorldHint: boolean2().optional()
});
var ToolExecutionSchema = object2({
  /**
   * Indicates the tool's preference for task-augmented execution.
   * - "required": Clients MUST invoke the tool as a task
   * - "optional": Clients MAY invoke the tool as a task or normal request
   * - "forbidden": Clients MUST NOT attempt to invoke the tool as a task
   *
   * If not present, defaults to "forbidden".
   */
  taskSupport: _enum(["required", "optional", "forbidden"]).optional()
});
var ToolSchema = object2({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  /**
   * A human-readable description of the tool.
   */
  description: string2().optional(),
  /**
   * A JSON Schema 2020-12 object defining the expected parameters for the tool.
   * Must have type: 'object' at the root level per MCP spec.
   */
  inputSchema: object2({
    type: literal("object"),
    properties: record(string2(), AssertObjectSchema).optional(),
    required: array(string2()).optional()
  }).catchall(unknown()),
  /**
   * An optional JSON Schema 2020-12 object defining the structure of the tool's output
   * returned in the structuredContent field of a CallToolResult.
   * Must have type: 'object' at the root level per MCP spec.
   */
  outputSchema: object2({
    type: literal("object"),
    properties: record(string2(), AssertObjectSchema).optional(),
    required: array(string2()).optional()
  }).catchall(unknown()).optional(),
  /**
   * Optional additional tool information.
   */
  annotations: ToolAnnotationsSchema.optional(),
  /**
   * Execution-related properties for this tool.
   */
  execution: ToolExecutionSchema.optional(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var ListToolsRequestSchema = PaginatedRequestSchema.extend({
  method: literal("tools/list")
});
var ListToolsResultSchema = PaginatedResultSchema.extend({
  tools: array(ToolSchema)
});
var CallToolResultSchema = ResultSchema.extend({
  /**
   * A list of content objects that represent the result of the tool call.
   *
   * If the Tool does not define an outputSchema, this field MUST be present in the result.
   * For backwards compatibility, this field is always present, but it may be empty.
   */
  content: array(ContentBlockSchema).default([]),
  /**
   * An object containing structured tool output.
   *
   * If the Tool defines an outputSchema, this field MUST be present in the result, and contain a JSON object that matches the schema.
   */
  structuredContent: record(string2(), unknown()).optional(),
  /**
   * Whether the tool call ended in an error.
   *
   * If not set, this is assumed to be false (the call was successful).
   *
   * Any errors that originate from the tool SHOULD be reported inside the result
   * object, with `isError` set to true, _not_ as an MCP protocol-level error
   * response. Otherwise, the LLM would not be able to see that an error occurred
   * and self-correct.
   *
   * However, any errors in _finding_ the tool, an error indicating that the
   * server does not support tool calls, or any other exceptional conditions,
   * should be reported as an MCP error response.
   */
  isError: boolean2().optional()
});
var CompatibilityCallToolResultSchema = CallToolResultSchema.or(ResultSchema.extend({
  toolResult: unknown()
}));
var CallToolRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
  /**
   * The name of the tool to call.
   */
  name: string2(),
  /**
   * Arguments to pass to the tool.
   */
  arguments: record(string2(), unknown()).optional()
});
var CallToolRequestSchema = RequestSchema.extend({
  method: literal("tools/call"),
  params: CallToolRequestParamsSchema
});
var ToolListChangedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/tools/list_changed"),
  params: NotificationsParamsSchema.optional()
});
var ListChangedOptionsBaseSchema = object2({
  /**
   * If true, the list will be refreshed automatically when a list changed notification is received.
   * The callback will be called with the updated list.
   *
   * If false, the callback will be called with null items, allowing manual refresh.
   *
   * @default true
   */
  autoRefresh: boolean2().default(true),
  /**
   * Debounce time in milliseconds for list changed notification processing.
   *
   * Multiple notifications received within this timeframe will only trigger one refresh.
   * Set to 0 to disable debouncing.
   *
   * @default 300
   */
  debounceMs: number2().int().nonnegative().default(300)
});
var LoggingLevelSchema = _enum(["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]);
var SetLevelRequestParamsSchema = BaseRequestParamsSchema.extend({
  /**
   * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
   */
  level: LoggingLevelSchema
});
var SetLevelRequestSchema = RequestSchema.extend({
  method: literal("logging/setLevel"),
  params: SetLevelRequestParamsSchema
});
var LoggingMessageNotificationParamsSchema = NotificationsParamsSchema.extend({
  /**
   * The severity of this log message.
   */
  level: LoggingLevelSchema,
  /**
   * An optional name of the logger issuing this message.
   */
  logger: string2().optional(),
  /**
   * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
   */
  data: unknown()
});
var LoggingMessageNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/message"),
  params: LoggingMessageNotificationParamsSchema
});
var ModelHintSchema = object2({
  /**
   * A hint for a model name.
   */
  name: string2().optional()
});
var ModelPreferencesSchema = object2({
  /**
   * Optional hints to use for model selection.
   */
  hints: array(ModelHintSchema).optional(),
  /**
   * How much to prioritize cost when selecting a model.
   */
  costPriority: number2().min(0).max(1).optional(),
  /**
   * How much to prioritize sampling speed (latency) when selecting a model.
   */
  speedPriority: number2().min(0).max(1).optional(),
  /**
   * How much to prioritize intelligence and capabilities when selecting a model.
   */
  intelligencePriority: number2().min(0).max(1).optional()
});
var ToolChoiceSchema = object2({
  /**
   * Controls when tools are used:
   * - "auto": Model decides whether to use tools (default)
   * - "required": Model MUST use at least one tool before completing
   * - "none": Model MUST NOT use any tools
   */
  mode: _enum(["auto", "required", "none"]).optional()
});
var ToolResultContentSchema = object2({
  type: literal("tool_result"),
  toolUseId: string2().describe("The unique identifier for the corresponding tool call."),
  content: array(ContentBlockSchema).default([]),
  structuredContent: object2({}).loose().optional(),
  isError: boolean2().optional(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var SamplingContentSchema = discriminatedUnion("type", [TextContentSchema, ImageContentSchema, AudioContentSchema]);
var SamplingMessageContentBlockSchema = discriminatedUnion("type", [
  TextContentSchema,
  ImageContentSchema,
  AudioContentSchema,
  ToolUseContentSchema,
  ToolResultContentSchema
]);
var SamplingMessageSchema = object2({
  role: RoleSchema,
  content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)]),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var CreateMessageRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
  messages: array(SamplingMessageSchema),
  /**
   * The server's preferences for which model to select. The client MAY modify or omit this request.
   */
  modelPreferences: ModelPreferencesSchema.optional(),
  /**
   * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
   */
  systemPrompt: string2().optional(),
  /**
   * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt.
   * The client MAY ignore this request.
   *
   * Default is "none". Values "thisServer" and "allServers" are soft-deprecated. Servers SHOULD only use these values if the client
   * declares ClientCapabilities.sampling.context. These values may be removed in future spec releases.
   */
  includeContext: _enum(["none", "thisServer", "allServers"]).optional(),
  temperature: number2().optional(),
  /**
   * The requested maximum number of tokens to sample (to prevent runaway completions).
   *
   * The client MAY choose to sample fewer tokens than the requested maximum.
   */
  maxTokens: number2().int(),
  stopSequences: array(string2()).optional(),
  /**
   * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
   */
  metadata: AssertObjectSchema.optional(),
  /**
   * Tools that the model may use during generation.
   * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
   */
  tools: array(ToolSchema).optional(),
  /**
   * Controls how the model uses tools.
   * The client MUST return an error if this field is provided but ClientCapabilities.sampling.tools is not declared.
   * Default is `{ mode: "auto" }`.
   */
  toolChoice: ToolChoiceSchema.optional()
});
var CreateMessageRequestSchema = RequestSchema.extend({
  method: literal("sampling/createMessage"),
  params: CreateMessageRequestParamsSchema
});
var CreateMessageResultSchema = ResultSchema.extend({
  /**
   * The name of the model that generated the message.
   */
  model: string2(),
  /**
   * The reason why sampling stopped, if known.
   *
   * Standard values:
   * - "endTurn": Natural end of the assistant's turn
   * - "stopSequence": A stop sequence was encountered
   * - "maxTokens": Maximum token limit was reached
   *
   * This field is an open string to allow for provider-specific stop reasons.
   */
  stopReason: optional(_enum(["endTurn", "stopSequence", "maxTokens"]).or(string2())),
  role: RoleSchema,
  /**
   * Response content. Single content block (text, image, or audio).
   */
  content: SamplingContentSchema
});
var CreateMessageResultWithToolsSchema = ResultSchema.extend({
  /**
   * The name of the model that generated the message.
   */
  model: string2(),
  /**
   * The reason why sampling stopped, if known.
   *
   * Standard values:
   * - "endTurn": Natural end of the assistant's turn
   * - "stopSequence": A stop sequence was encountered
   * - "maxTokens": Maximum token limit was reached
   * - "toolUse": The model wants to use one or more tools
   *
   * This field is an open string to allow for provider-specific stop reasons.
   */
  stopReason: optional(_enum(["endTurn", "stopSequence", "maxTokens", "toolUse"]).or(string2())),
  role: RoleSchema,
  /**
   * Response content. May be a single block or array. May include ToolUseContent if stopReason is "toolUse".
   */
  content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)])
});
var BooleanSchemaSchema = object2({
  type: literal("boolean"),
  title: string2().optional(),
  description: string2().optional(),
  default: boolean2().optional()
});
var StringSchemaSchema = object2({
  type: literal("string"),
  title: string2().optional(),
  description: string2().optional(),
  minLength: number2().optional(),
  maxLength: number2().optional(),
  format: _enum(["email", "uri", "date", "date-time"]).optional(),
  default: string2().optional()
});
var NumberSchemaSchema = object2({
  type: _enum(["number", "integer"]),
  title: string2().optional(),
  description: string2().optional(),
  minimum: number2().optional(),
  maximum: number2().optional(),
  default: number2().optional()
});
var UntitledSingleSelectEnumSchemaSchema = object2({
  type: literal("string"),
  title: string2().optional(),
  description: string2().optional(),
  enum: array(string2()),
  default: string2().optional()
});
var TitledSingleSelectEnumSchemaSchema = object2({
  type: literal("string"),
  title: string2().optional(),
  description: string2().optional(),
  oneOf: array(object2({
    const: string2(),
    title: string2()
  })),
  default: string2().optional()
});
var LegacyTitledEnumSchemaSchema = object2({
  type: literal("string"),
  title: string2().optional(),
  description: string2().optional(),
  enum: array(string2()),
  enumNames: array(string2()).optional(),
  default: string2().optional()
});
var SingleSelectEnumSchemaSchema = union([UntitledSingleSelectEnumSchemaSchema, TitledSingleSelectEnumSchemaSchema]);
var UntitledMultiSelectEnumSchemaSchema = object2({
  type: literal("array"),
  title: string2().optional(),
  description: string2().optional(),
  minItems: number2().optional(),
  maxItems: number2().optional(),
  items: object2({
    type: literal("string"),
    enum: array(string2())
  }),
  default: array(string2()).optional()
});
var TitledMultiSelectEnumSchemaSchema = object2({
  type: literal("array"),
  title: string2().optional(),
  description: string2().optional(),
  minItems: number2().optional(),
  maxItems: number2().optional(),
  items: object2({
    anyOf: array(object2({
      const: string2(),
      title: string2()
    }))
  }),
  default: array(string2()).optional()
});
var MultiSelectEnumSchemaSchema = union([UntitledMultiSelectEnumSchemaSchema, TitledMultiSelectEnumSchemaSchema]);
var EnumSchemaSchema = union([LegacyTitledEnumSchemaSchema, SingleSelectEnumSchemaSchema, MultiSelectEnumSchemaSchema]);
var PrimitiveSchemaDefinitionSchema = union([EnumSchemaSchema, BooleanSchemaSchema, StringSchemaSchema, NumberSchemaSchema]);
var ElicitRequestFormParamsSchema = TaskAugmentedRequestParamsSchema.extend({
  /**
   * The elicitation mode.
   *
   * Optional for backward compatibility. Clients MUST treat missing mode as "form".
   */
  mode: literal("form").optional(),
  /**
   * The message to present to the user describing what information is being requested.
   */
  message: string2(),
  /**
   * A restricted subset of JSON Schema.
   * Only top-level properties are allowed, without nesting.
   */
  requestedSchema: object2({
    type: literal("object"),
    properties: record(string2(), PrimitiveSchemaDefinitionSchema),
    required: array(string2()).optional()
  })
});
var ElicitRequestURLParamsSchema = TaskAugmentedRequestParamsSchema.extend({
  /**
   * The elicitation mode.
   */
  mode: literal("url"),
  /**
   * The message to present to the user explaining why the interaction is needed.
   */
  message: string2(),
  /**
   * The ID of the elicitation, which must be unique within the context of the server.
   * The client MUST treat this ID as an opaque value.
   */
  elicitationId: string2(),
  /**
   * The URL that the user should navigate to.
   */
  url: string2().url()
});
var ElicitRequestParamsSchema = union([ElicitRequestFormParamsSchema, ElicitRequestURLParamsSchema]);
var ElicitRequestSchema = RequestSchema.extend({
  method: literal("elicitation/create"),
  params: ElicitRequestParamsSchema
});
var ElicitationCompleteNotificationParamsSchema = NotificationsParamsSchema.extend({
  /**
   * The ID of the elicitation that completed.
   */
  elicitationId: string2()
});
var ElicitationCompleteNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/elicitation/complete"),
  params: ElicitationCompleteNotificationParamsSchema
});
var ElicitResultSchema = ResultSchema.extend({
  /**
   * The user action in response to the elicitation.
   * - "accept": User submitted the form/confirmed the action
   * - "decline": User explicitly decline the action
   * - "cancel": User dismissed without making an explicit choice
   */
  action: _enum(["accept", "decline", "cancel"]),
  /**
   * The submitted form data, only present when action is "accept".
   * Contains values matching the requested schema.
   * Per MCP spec, content is "typically omitted" for decline/cancel actions.
   * We normalize null to undefined for leniency while maintaining type compatibility.
   */
  content: preprocess((val) => val === null ? void 0 : val, record(string2(), union([string2(), number2(), boolean2(), array(string2())])).optional())
});
var ResourceTemplateReferenceSchema = object2({
  type: literal("ref/resource"),
  /**
   * The URI or URI template of the resource.
   */
  uri: string2()
});
var PromptReferenceSchema = object2({
  type: literal("ref/prompt"),
  /**
   * The name of the prompt or prompt template
   */
  name: string2()
});
var CompleteRequestParamsSchema = BaseRequestParamsSchema.extend({
  ref: union([PromptReferenceSchema, ResourceTemplateReferenceSchema]),
  /**
   * The argument's information
   */
  argument: object2({
    /**
     * The name of the argument
     */
    name: string2(),
    /**
     * The value of the argument to use for completion matching.
     */
    value: string2()
  }),
  context: object2({
    /**
     * Previously-resolved variables in a URI template or prompt.
     */
    arguments: record(string2(), string2()).optional()
  }).optional()
});
var CompleteRequestSchema = RequestSchema.extend({
  method: literal("completion/complete"),
  params: CompleteRequestParamsSchema
});
var CompleteResultSchema = ResultSchema.extend({
  completion: looseObject({
    /**
     * An array of completion values. Must not exceed 100 items.
     */
    values: array(string2()).max(100),
    /**
     * The total number of completion options available. This can exceed the number of values actually sent in the response.
     */
    total: optional(number2().int()),
    /**
     * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
     */
    hasMore: optional(boolean2())
  })
});
var RootSchema = object2({
  /**
   * The URI identifying the root. This *must* start with file:// for now.
   */
  uri: string2().startsWith("file://"),
  /**
   * An optional name for the root.
   */
  name: string2().optional(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: record(string2(), unknown()).optional()
});
var ListRootsRequestSchema = RequestSchema.extend({
  method: literal("roots/list"),
  params: BaseRequestParamsSchema.optional()
});
var ListRootsResultSchema = ResultSchema.extend({
  roots: array(RootSchema)
});
var RootsListChangedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/roots/list_changed"),
  params: NotificationsParamsSchema.optional()
});
var ClientRequestSchema = union([
  PingRequestSchema,
  InitializeRequestSchema,
  CompleteRequestSchema,
  SetLevelRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  GetTaskRequestSchema,
  GetTaskPayloadRequestSchema,
  ListTasksRequestSchema,
  CancelTaskRequestSchema
]);
var ClientNotificationSchema = union([
  CancelledNotificationSchema,
  ProgressNotificationSchema,
  InitializedNotificationSchema,
  RootsListChangedNotificationSchema,
  TaskStatusNotificationSchema
]);
var ClientResultSchema = union([
  EmptyResultSchema,
  CreateMessageResultSchema,
  CreateMessageResultWithToolsSchema,
  ElicitResultSchema,
  ListRootsResultSchema,
  GetTaskResultSchema,
  ListTasksResultSchema,
  CreateTaskResultSchema
]);
var ServerRequestSchema = union([
  PingRequestSchema,
  CreateMessageRequestSchema,
  ElicitRequestSchema,
  ListRootsRequestSchema,
  GetTaskRequestSchema,
  GetTaskPayloadRequestSchema,
  ListTasksRequestSchema,
  CancelTaskRequestSchema
]);
var ServerNotificationSchema = union([
  CancelledNotificationSchema,
  ProgressNotificationSchema,
  LoggingMessageNotificationSchema,
  ResourceUpdatedNotificationSchema,
  ResourceListChangedNotificationSchema,
  ToolListChangedNotificationSchema,
  PromptListChangedNotificationSchema,
  TaskStatusNotificationSchema,
  ElicitationCompleteNotificationSchema
]);
var ServerResultSchema = union([
  EmptyResultSchema,
  InitializeResultSchema,
  CompleteResultSchema,
  GetPromptResultSchema,
  ListPromptsResultSchema,
  ListResourcesResultSchema,
  ListResourceTemplatesResultSchema,
  ReadResourceResultSchema,
  CallToolResultSchema,
  ListToolsResultSchema,
  GetTaskResultSchema,
  ListTasksResultSchema,
  CreateTaskResultSchema
]);
var McpError = class _McpError extends Error {
  constructor(code, message, data) {
    super(`MCP error ${code}: ${message}`);
    this.code = code;
    this.data = data;
    this.name = "McpError";
  }
  /**
   * Factory method to create the appropriate error type based on the error code and data
   */
  static fromError(code, message, data) {
    if (code === ErrorCode.UrlElicitationRequired && data) {
      const errorData = data;
      if (errorData.elicitations) {
        return new UrlElicitationRequiredError(errorData.elicitations, message);
      }
    }
    return new _McpError(code, message, data);
  }
};
var UrlElicitationRequiredError = class extends McpError {
  constructor(elicitations, message = `URL elicitation${elicitations.length > 1 ? "s" : ""} required`) {
    super(ErrorCode.UrlElicitationRequired, message, {
      elicitations
    });
  }
  get elicitations() {
    return this.data?.elicitations ?? [];
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/interfaces.js
function isTerminal(status) {
  return status === "completed" || status === "failed" || status === "cancelled";
}

// node_modules/@modelcontextprotocol/sdk/node_modules/zod-to-json-schema/dist/esm/Options.js
var ignoreOverride = Symbol("Let zodToJsonSchema decide on which parser to use");

// node_modules/@modelcontextprotocol/sdk/node_modules/zod-to-json-schema/dist/esm/parsers/string.js
var ALPHA_NUMERIC = new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/zod-json-schema-compat.js
function getMethodLiteral(schema) {
  const shape = getObjectShape(schema);
  const methodSchema = shape?.method;
  if (!methodSchema) {
    throw new Error("Schema is missing a method literal");
  }
  const value = getLiteralValue(methodSchema);
  if (typeof value !== "string") {
    throw new Error("Schema method literal must be a string");
  }
  return value;
}
function parseWithCompat(schema, data) {
  const result = safeParse2(schema, data);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js
var DEFAULT_REQUEST_TIMEOUT_MSEC = 6e4;
var Protocol = class {
  constructor(_options) {
    this._options = _options;
    this._requestMessageId = 0;
    this._requestHandlers = /* @__PURE__ */ new Map();
    this._requestHandlerAbortControllers = /* @__PURE__ */ new Map();
    this._notificationHandlers = /* @__PURE__ */ new Map();
    this._responseHandlers = /* @__PURE__ */ new Map();
    this._progressHandlers = /* @__PURE__ */ new Map();
    this._timeoutInfo = /* @__PURE__ */ new Map();
    this._pendingDebouncedNotifications = /* @__PURE__ */ new Set();
    this._taskProgressTokens = /* @__PURE__ */ new Map();
    this._requestResolvers = /* @__PURE__ */ new Map();
    this.setNotificationHandler(CancelledNotificationSchema, (notification) => {
      this._oncancel(notification);
    });
    this.setNotificationHandler(ProgressNotificationSchema, (notification) => {
      this._onprogress(notification);
    });
    this.setRequestHandler(
      PingRequestSchema,
      // Automatic pong by default.
      (_request) => ({})
    );
    this._taskStore = _options?.taskStore;
    this._taskMessageQueue = _options?.taskMessageQueue;
    if (this._taskStore) {
      this.setRequestHandler(GetTaskRequestSchema, async (request, extra) => {
        const task = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
        if (!task) {
          throw new McpError(ErrorCode.InvalidParams, "Failed to retrieve task: Task not found");
        }
        return {
          ...task
        };
      });
      this.setRequestHandler(GetTaskPayloadRequestSchema, async (request, extra) => {
        const handleTaskResult = async () => {
          const taskId = request.params.taskId;
          if (this._taskMessageQueue) {
            let queuedMessage;
            while (queuedMessage = await this._taskMessageQueue.dequeue(taskId, extra.sessionId)) {
              if (queuedMessage.type === "response" || queuedMessage.type === "error") {
                const message = queuedMessage.message;
                const requestId = message.id;
                const resolver = this._requestResolvers.get(requestId);
                if (resolver) {
                  this._requestResolvers.delete(requestId);
                  if (queuedMessage.type === "response") {
                    resolver(message);
                  } else {
                    const errorMessage = message;
                    const error2 = new McpError(errorMessage.error.code, errorMessage.error.message, errorMessage.error.data);
                    resolver(error2);
                  }
                } else {
                  const messageType = queuedMessage.type === "response" ? "Response" : "Error";
                  this._onerror(new Error(`${messageType} handler missing for request ${requestId}`));
                }
                continue;
              }
              await this._transport?.send(queuedMessage.message, { relatedRequestId: extra.requestId });
            }
          }
          const task = await this._taskStore.getTask(taskId, extra.sessionId);
          if (!task) {
            throw new McpError(ErrorCode.InvalidParams, `Task not found: ${taskId}`);
          }
          if (!isTerminal(task.status)) {
            await this._waitForTaskUpdate(taskId, extra.signal);
            return await handleTaskResult();
          }
          if (isTerminal(task.status)) {
            const result = await this._taskStore.getTaskResult(taskId, extra.sessionId);
            this._clearTaskQueue(taskId);
            return {
              ...result,
              _meta: {
                ...result._meta,
                [RELATED_TASK_META_KEY]: {
                  taskId
                }
              }
            };
          }
          return await handleTaskResult();
        };
        return await handleTaskResult();
      });
      this.setRequestHandler(ListTasksRequestSchema, async (request, extra) => {
        try {
          const { tasks, nextCursor } = await this._taskStore.listTasks(request.params?.cursor, extra.sessionId);
          return {
            tasks,
            nextCursor,
            _meta: {}
          };
        } catch (error2) {
          throw new McpError(ErrorCode.InvalidParams, `Failed to list tasks: ${error2 instanceof Error ? error2.message : String(error2)}`);
        }
      });
      this.setRequestHandler(CancelTaskRequestSchema, async (request, extra) => {
        try {
          const task = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
          if (!task) {
            throw new McpError(ErrorCode.InvalidParams, `Task not found: ${request.params.taskId}`);
          }
          if (isTerminal(task.status)) {
            throw new McpError(ErrorCode.InvalidParams, `Cannot cancel task in terminal status: ${task.status}`);
          }
          await this._taskStore.updateTaskStatus(request.params.taskId, "cancelled", "Client cancelled task execution.", extra.sessionId);
          this._clearTaskQueue(request.params.taskId);
          const cancelledTask = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
          if (!cancelledTask) {
            throw new McpError(ErrorCode.InvalidParams, `Task not found after cancellation: ${request.params.taskId}`);
          }
          return {
            _meta: {},
            ...cancelledTask
          };
        } catch (error2) {
          if (error2 instanceof McpError) {
            throw error2;
          }
          throw new McpError(ErrorCode.InvalidRequest, `Failed to cancel task: ${error2 instanceof Error ? error2.message : String(error2)}`);
        }
      });
    }
  }
  async _oncancel(notification) {
    if (!notification.params.requestId) {
      return;
    }
    const controller = this._requestHandlerAbortControllers.get(notification.params.requestId);
    controller?.abort(notification.params.reason);
  }
  _setupTimeout(messageId, timeout, maxTotalTimeout, onTimeout, resetTimeoutOnProgress = false) {
    this._timeoutInfo.set(messageId, {
      timeoutId: setTimeout(onTimeout, timeout),
      startTime: Date.now(),
      timeout,
      maxTotalTimeout,
      resetTimeoutOnProgress,
      onTimeout
    });
  }
  _resetTimeout(messageId) {
    const info = this._timeoutInfo.get(messageId);
    if (!info)
      return false;
    const totalElapsed = Date.now() - info.startTime;
    if (info.maxTotalTimeout && totalElapsed >= info.maxTotalTimeout) {
      this._timeoutInfo.delete(messageId);
      throw McpError.fromError(ErrorCode.RequestTimeout, "Maximum total timeout exceeded", {
        maxTotalTimeout: info.maxTotalTimeout,
        totalElapsed
      });
    }
    clearTimeout(info.timeoutId);
    info.timeoutId = setTimeout(info.onTimeout, info.timeout);
    return true;
  }
  _cleanupTimeout(messageId) {
    const info = this._timeoutInfo.get(messageId);
    if (info) {
      clearTimeout(info.timeoutId);
      this._timeoutInfo.delete(messageId);
    }
  }
  /**
   * Attaches to the given transport, starts it, and starts listening for messages.
   *
   * The Protocol object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
   */
  async connect(transport) {
    if (this._transport) {
      throw new Error("Already connected to a transport. Call close() before connecting to a new transport, or use a separate Protocol instance per connection.");
    }
    this._transport = transport;
    const _onclose = this.transport?.onclose;
    this._transport.onclose = () => {
      _onclose?.();
      this._onclose();
    };
    const _onerror = this.transport?.onerror;
    this._transport.onerror = (error2) => {
      _onerror?.(error2);
      this._onerror(error2);
    };
    const _onmessage = this._transport?.onmessage;
    this._transport.onmessage = (message, extra) => {
      _onmessage?.(message, extra);
      if (isJSONRPCResultResponse(message) || isJSONRPCErrorResponse(message)) {
        this._onresponse(message);
      } else if (isJSONRPCRequest(message)) {
        this._onrequest(message, extra);
      } else if (isJSONRPCNotification(message)) {
        this._onnotification(message);
      } else {
        this._onerror(new Error(`Unknown message type: ${JSON.stringify(message)}`));
      }
    };
    await this._transport.start();
  }
  _onclose() {
    const responseHandlers = this._responseHandlers;
    this._responseHandlers = /* @__PURE__ */ new Map();
    this._progressHandlers.clear();
    this._taskProgressTokens.clear();
    this._pendingDebouncedNotifications.clear();
    for (const info of this._timeoutInfo.values()) {
      clearTimeout(info.timeoutId);
    }
    this._timeoutInfo.clear();
    for (const controller of this._requestHandlerAbortControllers.values()) {
      controller.abort();
    }
    this._requestHandlerAbortControllers.clear();
    const error2 = McpError.fromError(ErrorCode.ConnectionClosed, "Connection closed");
    this._transport = void 0;
    this.onclose?.();
    for (const handler of responseHandlers.values()) {
      handler(error2);
    }
  }
  _onerror(error2) {
    this.onerror?.(error2);
  }
  _onnotification(notification) {
    const handler = this._notificationHandlers.get(notification.method) ?? this.fallbackNotificationHandler;
    if (handler === void 0) {
      return;
    }
    Promise.resolve().then(() => handler(notification)).catch((error2) => this._onerror(new Error(`Uncaught error in notification handler: ${error2}`)));
  }
  _onrequest(request, extra) {
    const handler = this._requestHandlers.get(request.method) ?? this.fallbackRequestHandler;
    const capturedTransport = this._transport;
    const relatedTaskId = request.params?._meta?.[RELATED_TASK_META_KEY]?.taskId;
    if (handler === void 0) {
      const errorResponse = {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: ErrorCode.MethodNotFound,
          message: "Method not found"
        }
      };
      if (relatedTaskId && this._taskMessageQueue) {
        this._enqueueTaskMessage(relatedTaskId, {
          type: "error",
          message: errorResponse,
          timestamp: Date.now()
        }, capturedTransport?.sessionId).catch((error2) => this._onerror(new Error(`Failed to enqueue error response: ${error2}`)));
      } else {
        capturedTransport?.send(errorResponse).catch((error2) => this._onerror(new Error(`Failed to send an error response: ${error2}`)));
      }
      return;
    }
    const abortController = new AbortController();
    this._requestHandlerAbortControllers.set(request.id, abortController);
    const taskCreationParams = isTaskAugmentedRequestParams(request.params) ? request.params.task : void 0;
    const taskStore = this._taskStore ? this.requestTaskStore(request, capturedTransport?.sessionId) : void 0;
    const fullExtra = {
      signal: abortController.signal,
      sessionId: capturedTransport?.sessionId,
      _meta: request.params?._meta,
      sendNotification: async (notification) => {
        if (abortController.signal.aborted)
          return;
        const notificationOptions = { relatedRequestId: request.id };
        if (relatedTaskId) {
          notificationOptions.relatedTask = { taskId: relatedTaskId };
        }
        await this.notification(notification, notificationOptions);
      },
      sendRequest: async (r, resultSchema, options) => {
        if (abortController.signal.aborted) {
          throw new McpError(ErrorCode.ConnectionClosed, "Request was cancelled");
        }
        const requestOptions = { ...options, relatedRequestId: request.id };
        if (relatedTaskId && !requestOptions.relatedTask) {
          requestOptions.relatedTask = { taskId: relatedTaskId };
        }
        const effectiveTaskId = requestOptions.relatedTask?.taskId ?? relatedTaskId;
        if (effectiveTaskId && taskStore) {
          await taskStore.updateTaskStatus(effectiveTaskId, "input_required");
        }
        return await this.request(r, resultSchema, requestOptions);
      },
      authInfo: extra?.authInfo,
      requestId: request.id,
      requestInfo: extra?.requestInfo,
      taskId: relatedTaskId,
      taskStore,
      taskRequestedTtl: taskCreationParams?.ttl,
      closeSSEStream: extra?.closeSSEStream,
      closeStandaloneSSEStream: extra?.closeStandaloneSSEStream
    };
    Promise.resolve().then(() => {
      if (taskCreationParams) {
        this.assertTaskHandlerCapability(request.method);
      }
    }).then(() => handler(request, fullExtra)).then(async (result) => {
      if (abortController.signal.aborted) {
        return;
      }
      const response = {
        result,
        jsonrpc: "2.0",
        id: request.id
      };
      if (relatedTaskId && this._taskMessageQueue) {
        await this._enqueueTaskMessage(relatedTaskId, {
          type: "response",
          message: response,
          timestamp: Date.now()
        }, capturedTransport?.sessionId);
      } else {
        await capturedTransport?.send(response);
      }
    }, async (error2) => {
      if (abortController.signal.aborted) {
        return;
      }
      const errorResponse = {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: Number.isSafeInteger(error2["code"]) ? error2["code"] : ErrorCode.InternalError,
          message: error2.message ?? "Internal error",
          ...error2["data"] !== void 0 && { data: error2["data"] }
        }
      };
      if (relatedTaskId && this._taskMessageQueue) {
        await this._enqueueTaskMessage(relatedTaskId, {
          type: "error",
          message: errorResponse,
          timestamp: Date.now()
        }, capturedTransport?.sessionId);
      } else {
        await capturedTransport?.send(errorResponse);
      }
    }).catch((error2) => this._onerror(new Error(`Failed to send response: ${error2}`))).finally(() => {
      if (this._requestHandlerAbortControllers.get(request.id) === abortController) {
        this._requestHandlerAbortControllers.delete(request.id);
      }
    });
  }
  _onprogress(notification) {
    const { progressToken, ...params } = notification.params;
    const messageId = Number(progressToken);
    const handler = this._progressHandlers.get(messageId);
    if (!handler) {
      this._onerror(new Error(`Received a progress notification for an unknown token: ${JSON.stringify(notification)}`));
      return;
    }
    const responseHandler = this._responseHandlers.get(messageId);
    const timeoutInfo = this._timeoutInfo.get(messageId);
    if (timeoutInfo && responseHandler && timeoutInfo.resetTimeoutOnProgress) {
      try {
        this._resetTimeout(messageId);
      } catch (error2) {
        this._responseHandlers.delete(messageId);
        this._progressHandlers.delete(messageId);
        this._cleanupTimeout(messageId);
        responseHandler(error2);
        return;
      }
    }
    handler(params);
  }
  _onresponse(response) {
    const messageId = Number(response.id);
    const resolver = this._requestResolvers.get(messageId);
    if (resolver) {
      this._requestResolvers.delete(messageId);
      if (isJSONRPCResultResponse(response)) {
        resolver(response);
      } else {
        const error2 = new McpError(response.error.code, response.error.message, response.error.data);
        resolver(error2);
      }
      return;
    }
    const handler = this._responseHandlers.get(messageId);
    if (handler === void 0) {
      this._onerror(new Error(`Received a response for an unknown message ID: ${JSON.stringify(response)}`));
      return;
    }
    this._responseHandlers.delete(messageId);
    this._cleanupTimeout(messageId);
    let isTaskResponse = false;
    if (isJSONRPCResultResponse(response) && response.result && typeof response.result === "object") {
      const result = response.result;
      if (result.task && typeof result.task === "object") {
        const task = result.task;
        if (typeof task.taskId === "string") {
          isTaskResponse = true;
          this._taskProgressTokens.set(task.taskId, messageId);
        }
      }
    }
    if (!isTaskResponse) {
      this._progressHandlers.delete(messageId);
    }
    if (isJSONRPCResultResponse(response)) {
      handler(response);
    } else {
      const error2 = McpError.fromError(response.error.code, response.error.message, response.error.data);
      handler(error2);
    }
  }
  get transport() {
    return this._transport;
  }
  /**
   * Closes the connection.
   */
  async close() {
    await this._transport?.close();
  }
  /**
   * Sends a request and returns an AsyncGenerator that yields response messages.
   * The generator is guaranteed to end with either a 'result' or 'error' message.
   *
   * @example
   * ```typescript
   * const stream = protocol.requestStream(request, resultSchema, options);
   * for await (const message of stream) {
   *   switch (message.type) {
   *     case 'taskCreated':
   *       console.log('Task created:', message.task.taskId);
   *       break;
   *     case 'taskStatus':
   *       console.log('Task status:', message.task.status);
   *       break;
   *     case 'result':
   *       console.log('Final result:', message.result);
   *       break;
   *     case 'error':
   *       console.error('Error:', message.error);
   *       break;
   *   }
   * }
   * ```
   *
   * @experimental Use `client.experimental.tasks.requestStream()` to access this method.
   */
  async *requestStream(request, resultSchema, options) {
    const { task } = options ?? {};
    if (!task) {
      try {
        const result = await this.request(request, resultSchema, options);
        yield { type: "result", result };
      } catch (error2) {
        yield {
          type: "error",
          error: error2 instanceof McpError ? error2 : new McpError(ErrorCode.InternalError, String(error2))
        };
      }
      return;
    }
    let taskId;
    try {
      const createResult = await this.request(request, CreateTaskResultSchema, options);
      if (createResult.task) {
        taskId = createResult.task.taskId;
        yield { type: "taskCreated", task: createResult.task };
      } else {
        throw new McpError(ErrorCode.InternalError, "Task creation did not return a task");
      }
      while (true) {
        const task2 = await this.getTask({ taskId }, options);
        yield { type: "taskStatus", task: task2 };
        if (isTerminal(task2.status)) {
          if (task2.status === "completed") {
            const result = await this.getTaskResult({ taskId }, resultSchema, options);
            yield { type: "result", result };
          } else if (task2.status === "failed") {
            yield {
              type: "error",
              error: new McpError(ErrorCode.InternalError, `Task ${taskId} failed`)
            };
          } else if (task2.status === "cancelled") {
            yield {
              type: "error",
              error: new McpError(ErrorCode.InternalError, `Task ${taskId} was cancelled`)
            };
          }
          return;
        }
        if (task2.status === "input_required") {
          const result = await this.getTaskResult({ taskId }, resultSchema, options);
          yield { type: "result", result };
          return;
        }
        const pollInterval = task2.pollInterval ?? this._options?.defaultTaskPollInterval ?? 1e3;
        await new Promise((resolve3) => setTimeout(resolve3, pollInterval));
        options?.signal?.throwIfAborted();
      }
    } catch (error2) {
      yield {
        type: "error",
        error: error2 instanceof McpError ? error2 : new McpError(ErrorCode.InternalError, String(error2))
      };
    }
  }
  /**
   * Sends a request and waits for a response.
   *
   * Do not use this method to emit notifications! Use notification() instead.
   */
  request(request, resultSchema, options) {
    const { relatedRequestId, resumptionToken, onresumptiontoken, task, relatedTask } = options ?? {};
    return new Promise((resolve3, reject) => {
      const earlyReject = (error2) => {
        reject(error2);
      };
      if (!this._transport) {
        earlyReject(new Error("Not connected"));
        return;
      }
      if (this._options?.enforceStrictCapabilities === true) {
        try {
          this.assertCapabilityForMethod(request.method);
          if (task) {
            this.assertTaskCapability(request.method);
          }
        } catch (e) {
          earlyReject(e);
          return;
        }
      }
      options?.signal?.throwIfAborted();
      const messageId = this._requestMessageId++;
      const jsonrpcRequest = {
        ...request,
        jsonrpc: "2.0",
        id: messageId
      };
      if (options?.onprogress) {
        this._progressHandlers.set(messageId, options.onprogress);
        jsonrpcRequest.params = {
          ...request.params,
          _meta: {
            ...request.params?._meta || {},
            progressToken: messageId
          }
        };
      }
      if (task) {
        jsonrpcRequest.params = {
          ...jsonrpcRequest.params,
          task
        };
      }
      if (relatedTask) {
        jsonrpcRequest.params = {
          ...jsonrpcRequest.params,
          _meta: {
            ...jsonrpcRequest.params?._meta || {},
            [RELATED_TASK_META_KEY]: relatedTask
          }
        };
      }
      const cancel = (reason) => {
        this._responseHandlers.delete(messageId);
        this._progressHandlers.delete(messageId);
        this._cleanupTimeout(messageId);
        this._transport?.send({
          jsonrpc: "2.0",
          method: "notifications/cancelled",
          params: {
            requestId: messageId,
            reason: String(reason)
          }
        }, { relatedRequestId, resumptionToken, onresumptiontoken }).catch((error3) => this._onerror(new Error(`Failed to send cancellation: ${error3}`)));
        const error2 = reason instanceof McpError ? reason : new McpError(ErrorCode.RequestTimeout, String(reason));
        reject(error2);
      };
      this._responseHandlers.set(messageId, (response) => {
        if (options?.signal?.aborted) {
          return;
        }
        if (response instanceof Error) {
          return reject(response);
        }
        try {
          const parseResult = safeParse2(resultSchema, response.result);
          if (!parseResult.success) {
            reject(parseResult.error);
          } else {
            resolve3(parseResult.data);
          }
        } catch (error2) {
          reject(error2);
        }
      });
      options?.signal?.addEventListener("abort", () => {
        cancel(options?.signal?.reason);
      });
      const timeout = options?.timeout ?? DEFAULT_REQUEST_TIMEOUT_MSEC;
      const timeoutHandler = () => cancel(McpError.fromError(ErrorCode.RequestTimeout, "Request timed out", { timeout }));
      this._setupTimeout(messageId, timeout, options?.maxTotalTimeout, timeoutHandler, options?.resetTimeoutOnProgress ?? false);
      const relatedTaskId = relatedTask?.taskId;
      if (relatedTaskId) {
        const responseResolver = (response) => {
          const handler = this._responseHandlers.get(messageId);
          if (handler) {
            handler(response);
          } else {
            this._onerror(new Error(`Response handler missing for side-channeled request ${messageId}`));
          }
        };
        this._requestResolvers.set(messageId, responseResolver);
        this._enqueueTaskMessage(relatedTaskId, {
          type: "request",
          message: jsonrpcRequest,
          timestamp: Date.now()
        }).catch((error2) => {
          this._cleanupTimeout(messageId);
          reject(error2);
        });
      } else {
        this._transport.send(jsonrpcRequest, { relatedRequestId, resumptionToken, onresumptiontoken }).catch((error2) => {
          this._cleanupTimeout(messageId);
          reject(error2);
        });
      }
    });
  }
  /**
   * Gets the current status of a task.
   *
   * @experimental Use `client.experimental.tasks.getTask()` to access this method.
   */
  async getTask(params, options) {
    return this.request({ method: "tasks/get", params }, GetTaskResultSchema, options);
  }
  /**
   * Retrieves the result of a completed task.
   *
   * @experimental Use `client.experimental.tasks.getTaskResult()` to access this method.
   */
  async getTaskResult(params, resultSchema, options) {
    return this.request({ method: "tasks/result", params }, resultSchema, options);
  }
  /**
   * Lists tasks, optionally starting from a pagination cursor.
   *
   * @experimental Use `client.experimental.tasks.listTasks()` to access this method.
   */
  async listTasks(params, options) {
    return this.request({ method: "tasks/list", params }, ListTasksResultSchema, options);
  }
  /**
   * Cancels a specific task.
   *
   * @experimental Use `client.experimental.tasks.cancelTask()` to access this method.
   */
  async cancelTask(params, options) {
    return this.request({ method: "tasks/cancel", params }, CancelTaskResultSchema, options);
  }
  /**
   * Emits a notification, which is a one-way message that does not expect a response.
   */
  async notification(notification, options) {
    if (!this._transport) {
      throw new Error("Not connected");
    }
    this.assertNotificationCapability(notification.method);
    const relatedTaskId = options?.relatedTask?.taskId;
    if (relatedTaskId) {
      const jsonrpcNotification2 = {
        ...notification,
        jsonrpc: "2.0",
        params: {
          ...notification.params,
          _meta: {
            ...notification.params?._meta || {},
            [RELATED_TASK_META_KEY]: options.relatedTask
          }
        }
      };
      await this._enqueueTaskMessage(relatedTaskId, {
        type: "notification",
        message: jsonrpcNotification2,
        timestamp: Date.now()
      });
      return;
    }
    const debouncedMethods = this._options?.debouncedNotificationMethods ?? [];
    const canDebounce = debouncedMethods.includes(notification.method) && !notification.params && !options?.relatedRequestId && !options?.relatedTask;
    if (canDebounce) {
      if (this._pendingDebouncedNotifications.has(notification.method)) {
        return;
      }
      this._pendingDebouncedNotifications.add(notification.method);
      Promise.resolve().then(() => {
        this._pendingDebouncedNotifications.delete(notification.method);
        if (!this._transport) {
          return;
        }
        let jsonrpcNotification2 = {
          ...notification,
          jsonrpc: "2.0"
        };
        if (options?.relatedTask) {
          jsonrpcNotification2 = {
            ...jsonrpcNotification2,
            params: {
              ...jsonrpcNotification2.params,
              _meta: {
                ...jsonrpcNotification2.params?._meta || {},
                [RELATED_TASK_META_KEY]: options.relatedTask
              }
            }
          };
        }
        this._transport?.send(jsonrpcNotification2, options).catch((error2) => this._onerror(error2));
      });
      return;
    }
    let jsonrpcNotification = {
      ...notification,
      jsonrpc: "2.0"
    };
    if (options?.relatedTask) {
      jsonrpcNotification = {
        ...jsonrpcNotification,
        params: {
          ...jsonrpcNotification.params,
          _meta: {
            ...jsonrpcNotification.params?._meta || {},
            [RELATED_TASK_META_KEY]: options.relatedTask
          }
        }
      };
    }
    await this._transport.send(jsonrpcNotification, options);
  }
  /**
   * Registers a handler to invoke when this protocol object receives a request with the given method.
   *
   * Note that this will replace any previous request handler for the same method.
   */
  setRequestHandler(requestSchema, handler) {
    const method = getMethodLiteral(requestSchema);
    this.assertRequestHandlerCapability(method);
    this._requestHandlers.set(method, (request, extra) => {
      const parsed = parseWithCompat(requestSchema, request);
      return Promise.resolve(handler(parsed, extra));
    });
  }
  /**
   * Removes the request handler for the given method.
   */
  removeRequestHandler(method) {
    this._requestHandlers.delete(method);
  }
  /**
   * Asserts that a request handler has not already been set for the given method, in preparation for a new one being automatically installed.
   */
  assertCanSetRequestHandler(method) {
    if (this._requestHandlers.has(method)) {
      throw new Error(`A request handler for ${method} already exists, which would be overridden`);
    }
  }
  /**
   * Registers a handler to invoke when this protocol object receives a notification with the given method.
   *
   * Note that this will replace any previous notification handler for the same method.
   */
  setNotificationHandler(notificationSchema, handler) {
    const method = getMethodLiteral(notificationSchema);
    this._notificationHandlers.set(method, (notification) => {
      const parsed = parseWithCompat(notificationSchema, notification);
      return Promise.resolve(handler(parsed));
    });
  }
  /**
   * Removes the notification handler for the given method.
   */
  removeNotificationHandler(method) {
    this._notificationHandlers.delete(method);
  }
  /**
   * Cleans up the progress handler associated with a task.
   * This should be called when a task reaches a terminal status.
   */
  _cleanupTaskProgressHandler(taskId) {
    const progressToken = this._taskProgressTokens.get(taskId);
    if (progressToken !== void 0) {
      this._progressHandlers.delete(progressToken);
      this._taskProgressTokens.delete(taskId);
    }
  }
  /**
   * Enqueues a task-related message for side-channel delivery via tasks/result.
   * @param taskId The task ID to associate the message with
   * @param message The message to enqueue
   * @param sessionId Optional session ID for binding the operation to a specific session
   * @throws Error if taskStore is not configured or if enqueue fails (e.g., queue overflow)
   *
   * Note: If enqueue fails, it's the TaskMessageQueue implementation's responsibility to handle
   * the error appropriately (e.g., by failing the task, logging, etc.). The Protocol layer
   * simply propagates the error.
   */
  async _enqueueTaskMessage(taskId, message, sessionId) {
    if (!this._taskStore || !this._taskMessageQueue) {
      throw new Error("Cannot enqueue task message: taskStore and taskMessageQueue are not configured");
    }
    const maxQueueSize = this._options?.maxTaskQueueSize;
    await this._taskMessageQueue.enqueue(taskId, message, sessionId, maxQueueSize);
  }
  /**
   * Clears the message queue for a task and rejects any pending request resolvers.
   * @param taskId The task ID whose queue should be cleared
   * @param sessionId Optional session ID for binding the operation to a specific session
   */
  async _clearTaskQueue(taskId, sessionId) {
    if (this._taskMessageQueue) {
      const messages = await this._taskMessageQueue.dequeueAll(taskId, sessionId);
      for (const message of messages) {
        if (message.type === "request" && isJSONRPCRequest(message.message)) {
          const requestId = message.message.id;
          const resolver = this._requestResolvers.get(requestId);
          if (resolver) {
            resolver(new McpError(ErrorCode.InternalError, "Task cancelled or completed"));
            this._requestResolvers.delete(requestId);
          } else {
            this._onerror(new Error(`Resolver missing for request ${requestId} during task ${taskId} cleanup`));
          }
        }
      }
    }
  }
  /**
   * Waits for a task update (new messages or status change) with abort signal support.
   * Uses polling to check for updates at the task's configured poll interval.
   * @param taskId The task ID to wait for
   * @param signal Abort signal to cancel the wait
   * @returns Promise that resolves when an update occurs or rejects if aborted
   */
  async _waitForTaskUpdate(taskId, signal) {
    let interval = this._options?.defaultTaskPollInterval ?? 1e3;
    try {
      const task = await this._taskStore?.getTask(taskId);
      if (task?.pollInterval) {
        interval = task.pollInterval;
      }
    } catch {
    }
    return new Promise((resolve3, reject) => {
      if (signal.aborted) {
        reject(new McpError(ErrorCode.InvalidRequest, "Request cancelled"));
        return;
      }
      const timeoutId = setTimeout(resolve3, interval);
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        reject(new McpError(ErrorCode.InvalidRequest, "Request cancelled"));
      }, { once: true });
    });
  }
  requestTaskStore(request, sessionId) {
    const taskStore = this._taskStore;
    if (!taskStore) {
      throw new Error("No task store configured");
    }
    return {
      createTask: async (taskParams) => {
        if (!request) {
          throw new Error("No request provided");
        }
        return await taskStore.createTask(taskParams, request.id, {
          method: request.method,
          params: request.params
        }, sessionId);
      },
      getTask: async (taskId) => {
        const task = await taskStore.getTask(taskId, sessionId);
        if (!task) {
          throw new McpError(ErrorCode.InvalidParams, "Failed to retrieve task: Task not found");
        }
        return task;
      },
      storeTaskResult: async (taskId, status, result) => {
        await taskStore.storeTaskResult(taskId, status, result, sessionId);
        const task = await taskStore.getTask(taskId, sessionId);
        if (task) {
          const notification = TaskStatusNotificationSchema.parse({
            method: "notifications/tasks/status",
            params: task
          });
          await this.notification(notification);
          if (isTerminal(task.status)) {
            this._cleanupTaskProgressHandler(taskId);
          }
        }
      },
      getTaskResult: (taskId) => {
        return taskStore.getTaskResult(taskId, sessionId);
      },
      updateTaskStatus: async (taskId, status, statusMessage) => {
        const task = await taskStore.getTask(taskId, sessionId);
        if (!task) {
          throw new McpError(ErrorCode.InvalidParams, `Task "${taskId}" not found - it may have been cleaned up`);
        }
        if (isTerminal(task.status)) {
          throw new McpError(ErrorCode.InvalidParams, `Cannot update task "${taskId}" from terminal status "${task.status}" to "${status}". Terminal states (completed, failed, cancelled) cannot transition to other states.`);
        }
        await taskStore.updateTaskStatus(taskId, status, statusMessage, sessionId);
        const updatedTask = await taskStore.getTask(taskId, sessionId);
        if (updatedTask) {
          const notification = TaskStatusNotificationSchema.parse({
            method: "notifications/tasks/status",
            params: updatedTask
          });
          await this.notification(notification);
          if (isTerminal(updatedTask.status)) {
            this._cleanupTaskProgressHandler(taskId);
          }
        }
      },
      listTasks: (cursor) => {
        return taskStore.listTasks(cursor, sessionId);
      }
    };
  }
};
function isPlainObject2(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function mergeCapabilities(base, additional) {
  const result = { ...base };
  for (const key in additional) {
    const k = key;
    const addValue = additional[k];
    if (addValue === void 0)
      continue;
    const baseValue = result[k];
    if (isPlainObject2(baseValue) && isPlainObject2(addValue)) {
      result[k] = { ...baseValue, ...addValue };
    } else {
      result[k] = addValue;
    }
  }
  return result;
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/validation/ajv-provider.js
var import_ajv = __toESM(require_ajv(), 1);
var import_ajv_formats = __toESM(require_dist(), 1);
function createDefaultAjvInstance() {
  const ajv = new import_ajv.default({
    strict: false,
    validateFormats: true,
    validateSchema: false,
    allErrors: true
  });
  const addFormats = import_ajv_formats.default;
  addFormats(ajv);
  return ajv;
}
var AjvJsonSchemaValidator = class {
  /**
   * Create an AJV validator
   *
   * @param ajv - Optional pre-configured AJV instance. If not provided, a default instance will be created.
   *
   * @example
   * ```typescript
   * // Use default configuration (recommended for most cases)
   * import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv';
   * const validator = new AjvJsonSchemaValidator();
   *
   * // Or provide custom AJV instance for advanced configuration
   * import { Ajv } from 'ajv';
   * import addFormats from 'ajv-formats';
   *
   * const ajv = new Ajv({ validateFormats: true });
   * addFormats(ajv);
   * const validator = new AjvJsonSchemaValidator(ajv);
   * ```
   */
  constructor(ajv) {
    this._ajv = ajv ?? createDefaultAjvInstance();
  }
  /**
   * Create a validator for the given JSON Schema
   *
   * The validator is compiled once and can be reused multiple times.
   * If the schema has an $id, it will be cached by AJV automatically.
   *
   * @param schema - Standard JSON Schema object
   * @returns A validator function that validates input data
   */
  getValidator(schema) {
    const ajvValidator = "$id" in schema && typeof schema.$id === "string" ? this._ajv.getSchema(schema.$id) ?? this._ajv.compile(schema) : this._ajv.compile(schema);
    return (input) => {
      const valid = ajvValidator(input);
      if (valid) {
        return {
          valid: true,
          data: input,
          errorMessage: void 0
        };
      } else {
        return {
          valid: false,
          data: void 0,
          errorMessage: this._ajv.errorsText(ajvValidator.errors)
        };
      }
    };
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/server.js
var ExperimentalServerTasks = class {
  constructor(_server) {
    this._server = _server;
  }
  /**
   * Sends a request and returns an AsyncGenerator that yields response messages.
   * The generator is guaranteed to end with either a 'result' or 'error' message.
   *
   * This method provides streaming access to request processing, allowing you to
   * observe intermediate task status updates for task-augmented requests.
   *
   * @param request - The request to send
   * @param resultSchema - Zod schema for validating the result
   * @param options - Optional request options (timeout, signal, task creation params, etc.)
   * @returns AsyncGenerator that yields ResponseMessage objects
   *
   * @experimental
   */
  requestStream(request, resultSchema, options) {
    return this._server.requestStream(request, resultSchema, options);
  }
  /**
   * Sends a sampling request and returns an AsyncGenerator that yields response messages.
   * The generator is guaranteed to end with either a 'result' or 'error' message.
   *
   * For task-augmented requests, yields 'taskCreated' and 'taskStatus' messages
   * before the final result.
   *
   * @example
   * ```typescript
   * const stream = server.experimental.tasks.createMessageStream({
   *     messages: [{ role: 'user', content: { type: 'text', text: 'Hello' } }],
   *     maxTokens: 100
   * }, {
   *     onprogress: (progress) => {
   *         // Handle streaming tokens via progress notifications
   *         console.log('Progress:', progress.message);
   *     }
   * });
   *
   * for await (const message of stream) {
   *     switch (message.type) {
   *         case 'taskCreated':
   *             console.log('Task created:', message.task.taskId);
   *             break;
   *         case 'taskStatus':
   *             console.log('Task status:', message.task.status);
   *             break;
   *         case 'result':
   *             console.log('Final result:', message.result);
   *             break;
   *         case 'error':
   *             console.error('Error:', message.error);
   *             break;
   *     }
   * }
   * ```
   *
   * @param params - The sampling request parameters
   * @param options - Optional request options (timeout, signal, task creation params, onprogress, etc.)
   * @returns AsyncGenerator that yields ResponseMessage objects
   *
   * @experimental
   */
  createMessageStream(params, options) {
    const clientCapabilities = this._server.getClientCapabilities();
    if ((params.tools || params.toolChoice) && !clientCapabilities?.sampling?.tools) {
      throw new Error("Client does not support sampling tools capability.");
    }
    if (params.messages.length > 0) {
      const lastMessage = params.messages[params.messages.length - 1];
      const lastContent = Array.isArray(lastMessage.content) ? lastMessage.content : [lastMessage.content];
      const hasToolResults = lastContent.some((c) => c.type === "tool_result");
      const previousMessage = params.messages.length > 1 ? params.messages[params.messages.length - 2] : void 0;
      const previousContent = previousMessage ? Array.isArray(previousMessage.content) ? previousMessage.content : [previousMessage.content] : [];
      const hasPreviousToolUse = previousContent.some((c) => c.type === "tool_use");
      if (hasToolResults) {
        if (lastContent.some((c) => c.type !== "tool_result")) {
          throw new Error("The last message must contain only tool_result content if any is present");
        }
        if (!hasPreviousToolUse) {
          throw new Error("tool_result blocks are not matching any tool_use from the previous message");
        }
      }
      if (hasPreviousToolUse) {
        const toolUseIds = new Set(previousContent.filter((c) => c.type === "tool_use").map((c) => c.id));
        const toolResultIds = new Set(lastContent.filter((c) => c.type === "tool_result").map((c) => c.toolUseId));
        if (toolUseIds.size !== toolResultIds.size || ![...toolUseIds].every((id) => toolResultIds.has(id))) {
          throw new Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
        }
      }
    }
    return this.requestStream({
      method: "sampling/createMessage",
      params
    }, CreateMessageResultSchema, options);
  }
  /**
   * Sends an elicitation request and returns an AsyncGenerator that yields response messages.
   * The generator is guaranteed to end with either a 'result' or 'error' message.
   *
   * For task-augmented requests (especially URL-based elicitation), yields 'taskCreated'
   * and 'taskStatus' messages before the final result.
   *
   * @example
   * ```typescript
   * const stream = server.experimental.tasks.elicitInputStream({
   *     mode: 'url',
   *     message: 'Please authenticate',
   *     elicitationId: 'auth-123',
   *     url: 'https://example.com/auth'
   * }, {
   *     task: { ttl: 300000 } // Task-augmented for long-running auth flow
   * });
   *
   * for await (const message of stream) {
   *     switch (message.type) {
   *         case 'taskCreated':
   *             console.log('Task created:', message.task.taskId);
   *             break;
   *         case 'taskStatus':
   *             console.log('Task status:', message.task.status);
   *             break;
   *         case 'result':
   *             console.log('User action:', message.result.action);
   *             break;
   *         case 'error':
   *             console.error('Error:', message.error);
   *             break;
   *     }
   * }
   * ```
   *
   * @param params - The elicitation request parameters
   * @param options - Optional request options (timeout, signal, task creation params, etc.)
   * @returns AsyncGenerator that yields ResponseMessage objects
   *
   * @experimental
   */
  elicitInputStream(params, options) {
    const clientCapabilities = this._server.getClientCapabilities();
    const mode = params.mode ?? "form";
    switch (mode) {
      case "url": {
        if (!clientCapabilities?.elicitation?.url) {
          throw new Error("Client does not support url elicitation.");
        }
        break;
      }
      case "form": {
        if (!clientCapabilities?.elicitation?.form) {
          throw new Error("Client does not support form elicitation.");
        }
        break;
      }
    }
    const normalizedParams = mode === "form" && params.mode === void 0 ? { ...params, mode: "form" } : params;
    return this.requestStream({
      method: "elicitation/create",
      params: normalizedParams
    }, ElicitResultSchema, options);
  }
  /**
   * Gets the current status of a task.
   *
   * @param taskId - The task identifier
   * @param options - Optional request options
   * @returns The task status
   *
   * @experimental
   */
  async getTask(taskId, options) {
    return this._server.getTask({ taskId }, options);
  }
  /**
   * Retrieves the result of a completed task.
   *
   * @param taskId - The task identifier
   * @param resultSchema - Zod schema for validating the result
   * @param options - Optional request options
   * @returns The task result
   *
   * @experimental
   */
  async getTaskResult(taskId, resultSchema, options) {
    return this._server.getTaskResult({ taskId }, resultSchema, options);
  }
  /**
   * Lists tasks with optional pagination.
   *
   * @param cursor - Optional pagination cursor
   * @param options - Optional request options
   * @returns List of tasks with optional next cursor
   *
   * @experimental
   */
  async listTasks(cursor, options) {
    return this._server.listTasks(cursor ? { cursor } : void 0, options);
  }
  /**
   * Cancels a running task.
   *
   * @param taskId - The task identifier
   * @param options - Optional request options
   *
   * @experimental
   */
  async cancelTask(taskId, options) {
    return this._server.cancelTask({ taskId }, options);
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/helpers.js
function assertToolsCallTaskCapability(requests, method, entityName) {
  if (!requests) {
    throw new Error(`${entityName} does not support task creation (required for ${method})`);
  }
  switch (method) {
    case "tools/call":
      if (!requests.tools?.call) {
        throw new Error(`${entityName} does not support task creation for tools/call (required for ${method})`);
      }
      break;
    default:
      break;
  }
}
function assertClientRequestTaskCapability(requests, method, entityName) {
  if (!requests) {
    throw new Error(`${entityName} does not support task creation (required for ${method})`);
  }
  switch (method) {
    case "sampling/createMessage":
      if (!requests.sampling?.createMessage) {
        throw new Error(`${entityName} does not support task creation for sampling/createMessage (required for ${method})`);
      }
      break;
    case "elicitation/create":
      if (!requests.elicitation?.create) {
        throw new Error(`${entityName} does not support task creation for elicitation/create (required for ${method})`);
      }
      break;
    default:
      break;
  }
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js
var Server = class extends Protocol {
  /**
   * Initializes this server with the given name and version information.
   */
  constructor(_serverInfo, options) {
    super(options);
    this._serverInfo = _serverInfo;
    this._loggingLevels = /* @__PURE__ */ new Map();
    this.LOG_LEVEL_SEVERITY = new Map(LoggingLevelSchema.options.map((level, index) => [level, index]));
    this.isMessageIgnored = (level, sessionId) => {
      const currentLevel2 = this._loggingLevels.get(sessionId);
      return currentLevel2 ? this.LOG_LEVEL_SEVERITY.get(level) < this.LOG_LEVEL_SEVERITY.get(currentLevel2) : false;
    };
    this._capabilities = options?.capabilities ?? {};
    this._instructions = options?.instructions;
    this._jsonSchemaValidator = options?.jsonSchemaValidator ?? new AjvJsonSchemaValidator();
    this.setRequestHandler(InitializeRequestSchema, (request) => this._oninitialize(request));
    this.setNotificationHandler(InitializedNotificationSchema, () => this.oninitialized?.());
    if (this._capabilities.logging) {
      this.setRequestHandler(SetLevelRequestSchema, async (request, extra) => {
        const transportSessionId = extra.sessionId || extra.requestInfo?.headers["mcp-session-id"] || void 0;
        const { level } = request.params;
        const parseResult = LoggingLevelSchema.safeParse(level);
        if (parseResult.success) {
          this._loggingLevels.set(transportSessionId, parseResult.data);
        }
        return {};
      });
    }
  }
  /**
   * Access experimental features.
   *
   * WARNING: These APIs are experimental and may change without notice.
   *
   * @experimental
   */
  get experimental() {
    if (!this._experimental) {
      this._experimental = {
        tasks: new ExperimentalServerTasks(this)
      };
    }
    return this._experimental;
  }
  /**
   * Registers new capabilities. This can only be called before connecting to a transport.
   *
   * The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
   */
  registerCapabilities(capabilities) {
    if (this.transport) {
      throw new Error("Cannot register capabilities after connecting to transport");
    }
    this._capabilities = mergeCapabilities(this._capabilities, capabilities);
  }
  /**
   * Override request handler registration to enforce server-side validation for tools/call.
   */
  setRequestHandler(requestSchema, handler) {
    const shape = getObjectShape(requestSchema);
    const methodSchema = shape?.method;
    if (!methodSchema) {
      throw new Error("Schema is missing a method literal");
    }
    let methodValue;
    if (isZ4Schema(methodSchema)) {
      const v4Schema = methodSchema;
      const v4Def = v4Schema._zod?.def;
      methodValue = v4Def?.value ?? v4Schema.value;
    } else {
      const v3Schema = methodSchema;
      const legacyDef = v3Schema._def;
      methodValue = legacyDef?.value ?? v3Schema.value;
    }
    if (typeof methodValue !== "string") {
      throw new Error("Schema method literal must be a string");
    }
    const method = methodValue;
    if (method === "tools/call") {
      const wrappedHandler = async (request, extra) => {
        const validatedRequest = safeParse2(CallToolRequestSchema, request);
        if (!validatedRequest.success) {
          const errorMessage = validatedRequest.error instanceof Error ? validatedRequest.error.message : String(validatedRequest.error);
          throw new McpError(ErrorCode.InvalidParams, `Invalid tools/call request: ${errorMessage}`);
        }
        const { params } = validatedRequest.data;
        const result = await Promise.resolve(handler(request, extra));
        if (params.task) {
          const taskValidationResult = safeParse2(CreateTaskResultSchema, result);
          if (!taskValidationResult.success) {
            const errorMessage = taskValidationResult.error instanceof Error ? taskValidationResult.error.message : String(taskValidationResult.error);
            throw new McpError(ErrorCode.InvalidParams, `Invalid task creation result: ${errorMessage}`);
          }
          return taskValidationResult.data;
        }
        const validationResult = safeParse2(CallToolResultSchema, result);
        if (!validationResult.success) {
          const errorMessage = validationResult.error instanceof Error ? validationResult.error.message : String(validationResult.error);
          throw new McpError(ErrorCode.InvalidParams, `Invalid tools/call result: ${errorMessage}`);
        }
        return validationResult.data;
      };
      return super.setRequestHandler(requestSchema, wrappedHandler);
    }
    return super.setRequestHandler(requestSchema, handler);
  }
  assertCapabilityForMethod(method) {
    switch (method) {
      case "sampling/createMessage":
        if (!this._clientCapabilities?.sampling) {
          throw new Error(`Client does not support sampling (required for ${method})`);
        }
        break;
      case "elicitation/create":
        if (!this._clientCapabilities?.elicitation) {
          throw new Error(`Client does not support elicitation (required for ${method})`);
        }
        break;
      case "roots/list":
        if (!this._clientCapabilities?.roots) {
          throw new Error(`Client does not support listing roots (required for ${method})`);
        }
        break;
      case "ping":
        break;
    }
  }
  assertNotificationCapability(method) {
    switch (method) {
      case "notifications/message":
        if (!this._capabilities.logging) {
          throw new Error(`Server does not support logging (required for ${method})`);
        }
        break;
      case "notifications/resources/updated":
      case "notifications/resources/list_changed":
        if (!this._capabilities.resources) {
          throw new Error(`Server does not support notifying about resources (required for ${method})`);
        }
        break;
      case "notifications/tools/list_changed":
        if (!this._capabilities.tools) {
          throw new Error(`Server does not support notifying of tool list changes (required for ${method})`);
        }
        break;
      case "notifications/prompts/list_changed":
        if (!this._capabilities.prompts) {
          throw new Error(`Server does not support notifying of prompt list changes (required for ${method})`);
        }
        break;
      case "notifications/elicitation/complete":
        if (!this._clientCapabilities?.elicitation?.url) {
          throw new Error(`Client does not support URL elicitation (required for ${method})`);
        }
        break;
      case "notifications/cancelled":
        break;
      case "notifications/progress":
        break;
    }
  }
  assertRequestHandlerCapability(method) {
    if (!this._capabilities) {
      return;
    }
    switch (method) {
      case "completion/complete":
        if (!this._capabilities.completions) {
          throw new Error(`Server does not support completions (required for ${method})`);
        }
        break;
      case "logging/setLevel":
        if (!this._capabilities.logging) {
          throw new Error(`Server does not support logging (required for ${method})`);
        }
        break;
      case "prompts/get":
      case "prompts/list":
        if (!this._capabilities.prompts) {
          throw new Error(`Server does not support prompts (required for ${method})`);
        }
        break;
      case "resources/list":
      case "resources/templates/list":
      case "resources/read":
        if (!this._capabilities.resources) {
          throw new Error(`Server does not support resources (required for ${method})`);
        }
        break;
      case "tools/call":
      case "tools/list":
        if (!this._capabilities.tools) {
          throw new Error(`Server does not support tools (required for ${method})`);
        }
        break;
      case "tasks/get":
      case "tasks/list":
      case "tasks/result":
      case "tasks/cancel":
        if (!this._capabilities.tasks) {
          throw new Error(`Server does not support tasks capability (required for ${method})`);
        }
        break;
      case "ping":
      case "initialize":
        break;
    }
  }
  assertTaskCapability(method) {
    assertClientRequestTaskCapability(this._clientCapabilities?.tasks?.requests, method, "Client");
  }
  assertTaskHandlerCapability(method) {
    if (!this._capabilities) {
      return;
    }
    assertToolsCallTaskCapability(this._capabilities.tasks?.requests, method, "Server");
  }
  async _oninitialize(request) {
    const requestedVersion = request.params.protocolVersion;
    this._clientCapabilities = request.params.capabilities;
    this._clientVersion = request.params.clientInfo;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion) ? requestedVersion : LATEST_PROTOCOL_VERSION;
    return {
      protocolVersion,
      capabilities: this.getCapabilities(),
      serverInfo: this._serverInfo,
      ...this._instructions && { instructions: this._instructions }
    };
  }
  /**
   * After initialization has completed, this will be populated with the client's reported capabilities.
   */
  getClientCapabilities() {
    return this._clientCapabilities;
  }
  /**
   * After initialization has completed, this will be populated with information about the client's name and version.
   */
  getClientVersion() {
    return this._clientVersion;
  }
  getCapabilities() {
    return this._capabilities;
  }
  async ping() {
    return this.request({ method: "ping" }, EmptyResultSchema);
  }
  // Implementation
  async createMessage(params, options) {
    if (params.tools || params.toolChoice) {
      if (!this._clientCapabilities?.sampling?.tools) {
        throw new Error("Client does not support sampling tools capability.");
      }
    }
    if (params.messages.length > 0) {
      const lastMessage = params.messages[params.messages.length - 1];
      const lastContent = Array.isArray(lastMessage.content) ? lastMessage.content : [lastMessage.content];
      const hasToolResults = lastContent.some((c) => c.type === "tool_result");
      const previousMessage = params.messages.length > 1 ? params.messages[params.messages.length - 2] : void 0;
      const previousContent = previousMessage ? Array.isArray(previousMessage.content) ? previousMessage.content : [previousMessage.content] : [];
      const hasPreviousToolUse = previousContent.some((c) => c.type === "tool_use");
      if (hasToolResults) {
        if (lastContent.some((c) => c.type !== "tool_result")) {
          throw new Error("The last message must contain only tool_result content if any is present");
        }
        if (!hasPreviousToolUse) {
          throw new Error("tool_result blocks are not matching any tool_use from the previous message");
        }
      }
      if (hasPreviousToolUse) {
        const toolUseIds = new Set(previousContent.filter((c) => c.type === "tool_use").map((c) => c.id));
        const toolResultIds = new Set(lastContent.filter((c) => c.type === "tool_result").map((c) => c.toolUseId));
        if (toolUseIds.size !== toolResultIds.size || ![...toolUseIds].every((id) => toolResultIds.has(id))) {
          throw new Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
        }
      }
    }
    if (params.tools) {
      return this.request({ method: "sampling/createMessage", params }, CreateMessageResultWithToolsSchema, options);
    }
    return this.request({ method: "sampling/createMessage", params }, CreateMessageResultSchema, options);
  }
  /**
   * Creates an elicitation request for the given parameters.
   * For backwards compatibility, `mode` may be omitted for form requests and will default to `'form'`.
   * @param params The parameters for the elicitation request.
   * @param options Optional request options.
   * @returns The result of the elicitation request.
   */
  async elicitInput(params, options) {
    const mode = params.mode ?? "form";
    switch (mode) {
      case "url": {
        if (!this._clientCapabilities?.elicitation?.url) {
          throw new Error("Client does not support url elicitation.");
        }
        const urlParams = params;
        return this.request({ method: "elicitation/create", params: urlParams }, ElicitResultSchema, options);
      }
      case "form": {
        if (!this._clientCapabilities?.elicitation?.form) {
          throw new Error("Client does not support form elicitation.");
        }
        const formParams = params.mode === "form" ? params : { ...params, mode: "form" };
        const result = await this.request({ method: "elicitation/create", params: formParams }, ElicitResultSchema, options);
        if (result.action === "accept" && result.content && formParams.requestedSchema) {
          try {
            const validator = this._jsonSchemaValidator.getValidator(formParams.requestedSchema);
            const validationResult = validator(result.content);
            if (!validationResult.valid) {
              throw new McpError(ErrorCode.InvalidParams, `Elicitation response content does not match requested schema: ${validationResult.errorMessage}`);
            }
          } catch (error2) {
            if (error2 instanceof McpError) {
              throw error2;
            }
            throw new McpError(ErrorCode.InternalError, `Error validating elicitation response: ${error2 instanceof Error ? error2.message : String(error2)}`);
          }
        }
        return result;
      }
    }
  }
  /**
   * Creates a reusable callback that, when invoked, will send a `notifications/elicitation/complete`
   * notification for the specified elicitation ID.
   *
   * @param elicitationId The ID of the elicitation to mark as complete.
   * @param options Optional notification options. Useful when the completion notification should be related to a prior request.
   * @returns A function that emits the completion notification when awaited.
   */
  createElicitationCompletionNotifier(elicitationId, options) {
    if (!this._clientCapabilities?.elicitation?.url) {
      throw new Error("Client does not support URL elicitation (required for notifications/elicitation/complete)");
    }
    return () => this.notification({
      method: "notifications/elicitation/complete",
      params: {
        elicitationId
      }
    }, options);
  }
  async listRoots(params, options) {
    return this.request({ method: "roots/list", params }, ListRootsResultSchema, options);
  }
  /**
   * Sends a logging message to the client, if connected.
   * Note: You only need to send the parameters object, not the entire JSON RPC message
   * @see LoggingMessageNotification
   * @param params
   * @param sessionId optional for stateless and backward compatibility
   */
  async sendLoggingMessage(params, sessionId) {
    if (this._capabilities.logging) {
      if (!this.isMessageIgnored(params.level, sessionId)) {
        return this.notification({ method: "notifications/message", params });
      }
    }
  }
  async sendResourceUpdated(params) {
    return this.notification({
      method: "notifications/resources/updated",
      params
    });
  }
  async sendResourceListChanged() {
    return this.notification({
      method: "notifications/resources/list_changed"
    });
  }
  async sendToolListChanged() {
    return this.notification({ method: "notifications/tools/list_changed" });
  }
  async sendPromptListChanged() {
    return this.notification({ method: "notifications/prompts/list_changed" });
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
var import_node_process = __toESM(require("node:process"), 1);

// node_modules/@modelcontextprotocol/sdk/dist/esm/shared/stdio.js
var ReadBuffer = class {
  append(chunk) {
    this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
  }
  readMessage() {
    if (!this._buffer) {
      return null;
    }
    const index = this._buffer.indexOf("\n");
    if (index === -1) {
      return null;
    }
    const line = this._buffer.toString("utf8", 0, index).replace(/\r$/, "");
    this._buffer = this._buffer.subarray(index + 1);
    return deserializeMessage(line);
  }
  clear() {
    this._buffer = void 0;
  }
};
function deserializeMessage(line) {
  return JSONRPCMessageSchema.parse(JSON.parse(line));
}
function serializeMessage(message) {
  return JSON.stringify(message) + "\n";
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
var StdioServerTransport = class {
  constructor(_stdin = import_node_process.default.stdin, _stdout = import_node_process.default.stdout) {
    this._stdin = _stdin;
    this._stdout = _stdout;
    this._readBuffer = new ReadBuffer();
    this._started = false;
    this._ondata = (chunk) => {
      this._readBuffer.append(chunk);
      this.processReadBuffer();
    };
    this._onerror = (error2) => {
      this.onerror?.(error2);
    };
  }
  /**
   * Starts listening for messages on stdin.
   */
  async start() {
    if (this._started) {
      throw new Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");
    }
    this._started = true;
    this._stdin.on("data", this._ondata);
    this._stdin.on("error", this._onerror);
  }
  processReadBuffer() {
    while (true) {
      try {
        const message = this._readBuffer.readMessage();
        if (message === null) {
          break;
        }
        this.onmessage?.(message);
      } catch (error2) {
        this.onerror?.(error2);
      }
    }
  }
  async close() {
    this._stdin.off("data", this._ondata);
    this._stdin.off("error", this._onerror);
    const remainingDataListeners = this._stdin.listenerCount("data");
    if (remainingDataListeners === 0) {
      this._stdin.pause();
    }
    this._readBuffer.clear();
    this.onclose?.();
  }
  send(message) {
    return new Promise((resolve3) => {
      const json = serializeMessage(message);
      if (this._stdout.write(json)) {
        resolve3();
      } else {
        this._stdout.once("drain", resolve3);
      }
    });
  }
};

// node_modules/@hono/node-server/dist/index.mjs
var import_http2 = require("http2");
var import_http22 = require("http2");
var import_stream = require("stream");
var import_crypto = __toESM(require("crypto"), 1);
var RequestError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "RequestError";
  }
};
var toRequestError = (e) => {
  if (e instanceof RequestError) {
    return e;
  }
  return new RequestError(e.message, { cause: e });
};
var GlobalRequest = global.Request;
var Request = class extends GlobalRequest {
  constructor(input, options) {
    if (typeof input === "object" && getRequestCache in input) {
      input = input[getRequestCache]();
    }
    if (typeof options?.body?.getReader !== "undefined") {
      ;
      options.duplex ??= "half";
    }
    super(input, options);
  }
};
var newHeadersFromIncoming = (incoming) => {
  const headerRecord = [];
  const rawHeaders = incoming.rawHeaders;
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const { [i]: key, [i + 1]: value } = rawHeaders;
    if (key.charCodeAt(0) !== /*:*/
    58) {
      headerRecord.push([key, value]);
    }
  }
  return new Headers(headerRecord);
};
var wrapBodyStream = Symbol("wrapBodyStream");
var newRequestFromIncoming = (method, url, headers, incoming, abortController) => {
  const init = {
    method,
    headers,
    signal: abortController.signal
  };
  if (method === "TRACE") {
    init.method = "GET";
    const req = new Request(url, init);
    Object.defineProperty(req, "method", {
      get() {
        return "TRACE";
      }
    });
    return req;
  }
  if (!(method === "GET" || method === "HEAD")) {
    if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) {
      init.body = new ReadableStream({
        start(controller) {
          controller.enqueue(incoming.rawBody);
          controller.close();
        }
      });
    } else if (incoming[wrapBodyStream]) {
      let reader;
      init.body = new ReadableStream({
        async pull(controller) {
          try {
            reader ||= import_stream.Readable.toWeb(incoming).getReader();
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
            } else {
              controller.enqueue(value);
            }
          } catch (error2) {
            controller.error(error2);
          }
        }
      });
    } else {
      init.body = import_stream.Readable.toWeb(incoming);
    }
  }
  return new Request(url, init);
};
var getRequestCache = Symbol("getRequestCache");
var requestCache = Symbol("requestCache");
var incomingKey = Symbol("incomingKey");
var urlKey = Symbol("urlKey");
var headersKey = Symbol("headersKey");
var abortControllerKey = Symbol("abortControllerKey");
var getAbortController = Symbol("getAbortController");
var requestPrototype = {
  get method() {
    return this[incomingKey].method || "GET";
  },
  get url() {
    return this[urlKey];
  },
  get headers() {
    return this[headersKey] ||= newHeadersFromIncoming(this[incomingKey]);
  },
  [getAbortController]() {
    this[getRequestCache]();
    return this[abortControllerKey];
  },
  [getRequestCache]() {
    this[abortControllerKey] ||= new AbortController();
    return this[requestCache] ||= newRequestFromIncoming(
      this.method,
      this[urlKey],
      this.headers,
      this[incomingKey],
      this[abortControllerKey]
    );
  }
};
[
  "body",
  "bodyUsed",
  "cache",
  "credentials",
  "destination",
  "integrity",
  "mode",
  "redirect",
  "referrer",
  "referrerPolicy",
  "signal",
  "keepalive"
].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    get() {
      return this[getRequestCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    value: function() {
      return this[getRequestCache]()[k]();
    }
  });
});
Object.defineProperty(requestPrototype, Symbol.for("nodejs.util.inspect.custom"), {
  value: function(depth, options, inspectFn) {
    const props = {
      method: this.method,
      url: this.url,
      headers: this.headers,
      nativeRequest: this[requestCache]
    };
    return `Request (lightweight) ${inspectFn(props, { ...options, depth: depth == null ? null : depth - 1 })}`;
  }
});
Object.setPrototypeOf(requestPrototype, Request.prototype);
var newRequest = (incoming, defaultHostname) => {
  const req = Object.create(requestPrototype);
  req[incomingKey] = incoming;
  const incomingUrl = incoming.url || "";
  if (incomingUrl[0] !== "/" && // short-circuit for performance. most requests are relative URL.
  (incomingUrl.startsWith("http://") || incomingUrl.startsWith("https://"))) {
    if (incoming instanceof import_http22.Http2ServerRequest) {
      throw new RequestError("Absolute URL for :path is not allowed in HTTP/2");
    }
    try {
      const url2 = new URL(incomingUrl);
      req[urlKey] = url2.href;
    } catch (e) {
      throw new RequestError("Invalid absolute URL", { cause: e });
    }
    return req;
  }
  const host = (incoming instanceof import_http22.Http2ServerRequest ? incoming.authority : incoming.headers.host) || defaultHostname;
  if (!host) {
    throw new RequestError("Missing host header");
  }
  let scheme;
  if (incoming instanceof import_http22.Http2ServerRequest) {
    scheme = incoming.scheme;
    if (!(scheme === "http" || scheme === "https")) {
      throw new RequestError("Unsupported scheme");
    }
  } else {
    scheme = incoming.socket && incoming.socket.encrypted ? "https" : "http";
  }
  const url = new URL(`${scheme}://${host}${incomingUrl}`);
  if (url.hostname.length !== host.length && url.hostname !== host.replace(/:\d+$/, "")) {
    throw new RequestError("Invalid host header");
  }
  req[urlKey] = url.href;
  return req;
};
var responseCache = Symbol("responseCache");
var getResponseCache = Symbol("getResponseCache");
var cacheKey = Symbol("cache");
var GlobalResponse = global.Response;
var Response2 = class _Response {
  #body;
  #init;
  [getResponseCache]() {
    delete this[cacheKey];
    return this[responseCache] ||= new GlobalResponse(this.#body, this.#init);
  }
  constructor(body, init) {
    let headers;
    this.#body = body;
    if (init instanceof _Response) {
      const cachedGlobalResponse = init[responseCache];
      if (cachedGlobalResponse) {
        this.#init = cachedGlobalResponse;
        this[getResponseCache]();
        return;
      } else {
        this.#init = init.#init;
        headers = new Headers(init.#init.headers);
      }
    } else {
      this.#init = init;
    }
    if (typeof body === "string" || typeof body?.getReader !== "undefined" || body instanceof Blob || body instanceof Uint8Array) {
      ;
      this[cacheKey] = [init?.status || 200, body, headers || init?.headers];
    }
  }
  get headers() {
    const cache = this[cacheKey];
    if (cache) {
      if (!(cache[2] instanceof Headers)) {
        cache[2] = new Headers(
          cache[2] || { "content-type": "text/plain; charset=UTF-8" }
        );
      }
      return cache[2];
    }
    return this[getResponseCache]().headers;
  }
  get status() {
    return this[cacheKey]?.[0] ?? this[getResponseCache]().status;
  }
  get ok() {
    const status = this.status;
    return status >= 200 && status < 300;
  }
};
["body", "bodyUsed", "redirected", "statusText", "trailers", "type", "url"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    get() {
      return this[getResponseCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    value: function() {
      return this[getResponseCache]()[k]();
    }
  });
});
Object.defineProperty(Response2.prototype, Symbol.for("nodejs.util.inspect.custom"), {
  value: function(depth, options, inspectFn) {
    const props = {
      status: this.status,
      headers: this.headers,
      ok: this.ok,
      nativeResponse: this[responseCache]
    };
    return `Response (lightweight) ${inspectFn(props, { ...options, depth: depth == null ? null : depth - 1 })}`;
  }
});
Object.setPrototypeOf(Response2, GlobalResponse);
Object.setPrototypeOf(Response2.prototype, GlobalResponse.prototype);
async function readWithoutBlocking(readPromise) {
  return Promise.race([readPromise, Promise.resolve().then(() => Promise.resolve(void 0))]);
}
function writeFromReadableStreamDefaultReader(reader, writable, currentReadPromise) {
  const cancel = (error2) => {
    reader.cancel(error2).catch(() => {
    });
  };
  writable.on("close", cancel);
  writable.on("error", cancel);
  (currentReadPromise ?? reader.read()).then(flow, handleStreamError);
  return reader.closed.finally(() => {
    writable.off("close", cancel);
    writable.off("error", cancel);
  });
  function handleStreamError(error2) {
    if (error2) {
      writable.destroy(error2);
    }
  }
  function onDrain() {
    reader.read().then(flow, handleStreamError);
  }
  function flow({ done, value }) {
    try {
      if (done) {
        writable.end();
      } else if (!writable.write(value)) {
        writable.once("drain", onDrain);
      } else {
        return reader.read().then(flow, handleStreamError);
      }
    } catch (e) {
      handleStreamError(e);
    }
  }
}
function writeFromReadableStream(stream, writable) {
  if (stream.locked) {
    throw new TypeError("ReadableStream is locked.");
  } else if (writable.destroyed) {
    return;
  }
  return writeFromReadableStreamDefaultReader(stream.getReader(), writable);
}
var buildOutgoingHttpHeaders = (headers) => {
  const res = {};
  if (!(headers instanceof Headers)) {
    headers = new Headers(headers ?? void 0);
  }
  const cookies = [];
  for (const [k, v] of headers) {
    if (k === "set-cookie") {
      cookies.push(v);
    } else {
      res[k] = v;
    }
  }
  if (cookies.length > 0) {
    res["set-cookie"] = cookies;
  }
  res["content-type"] ??= "text/plain; charset=UTF-8";
  return res;
};
var X_ALREADY_SENT = "x-hono-already-sent";
if (typeof global.crypto === "undefined") {
  global.crypto = import_crypto.default;
}
var outgoingEnded = Symbol("outgoingEnded");
var incomingDraining = Symbol("incomingDraining");
var DRAIN_TIMEOUT_MS = 500;
var MAX_DRAIN_BYTES = 64 * 1024 * 1024;
var drainIncoming = (incoming) => {
  const incomingWithDrainState = incoming;
  if (incoming.destroyed || incomingWithDrainState[incomingDraining]) {
    return;
  }
  incomingWithDrainState[incomingDraining] = true;
  if (incoming instanceof import_http2.Http2ServerRequest) {
    try {
      ;
      incoming.stream?.close?.(import_http2.constants.NGHTTP2_NO_ERROR);
    } catch {
    }
    return;
  }
  let bytesRead = 0;
  const cleanup = () => {
    clearTimeout(timer);
    incoming.off("data", onData);
    incoming.off("end", cleanup);
    incoming.off("error", cleanup);
  };
  const forceClose = () => {
    cleanup();
    const socket = incoming.socket;
    if (socket && !socket.destroyed) {
      socket.destroySoon();
    }
  };
  const timer = setTimeout(forceClose, DRAIN_TIMEOUT_MS);
  timer.unref?.();
  const onData = (chunk) => {
    bytesRead += chunk.length;
    if (bytesRead > MAX_DRAIN_BYTES) {
      forceClose();
    }
  };
  incoming.on("data", onData);
  incoming.on("end", cleanup);
  incoming.on("error", cleanup);
  incoming.resume();
};
var handleRequestError = () => new Response(null, {
  status: 400
});
var handleFetchError = (e) => new Response(null, {
  status: e instanceof Error && (e.name === "TimeoutError" || e.constructor.name === "TimeoutError") ? 504 : 500
});
var handleResponseError = (e, outgoing) => {
  const err = e instanceof Error ? e : new Error("unknown error", { cause: e });
  if (err.code === "ERR_STREAM_PREMATURE_CLOSE") {
    console.info("The user aborted a request.");
  } else {
    console.error(e);
    if (!outgoing.headersSent) {
      outgoing.writeHead(500, { "Content-Type": "text/plain" });
    }
    outgoing.end(`Error: ${err.message}`);
    outgoing.destroy(err);
  }
};
var flushHeaders = (outgoing) => {
  if ("flushHeaders" in outgoing && outgoing.writable) {
    outgoing.flushHeaders();
  }
};
var responseViaCache = async (res, outgoing) => {
  let [status, body, header] = res[cacheKey];
  let hasContentLength = false;
  if (!header) {
    header = { "content-type": "text/plain; charset=UTF-8" };
  } else if (header instanceof Headers) {
    hasContentLength = header.has("content-length");
    header = buildOutgoingHttpHeaders(header);
  } else if (Array.isArray(header)) {
    const headerObj = new Headers(header);
    hasContentLength = headerObj.has("content-length");
    header = buildOutgoingHttpHeaders(headerObj);
  } else {
    for (const key in header) {
      if (key.length === 14 && key.toLowerCase() === "content-length") {
        hasContentLength = true;
        break;
      }
    }
  }
  if (!hasContentLength) {
    if (typeof body === "string") {
      header["Content-Length"] = Buffer.byteLength(body);
    } else if (body instanceof Uint8Array) {
      header["Content-Length"] = body.byteLength;
    } else if (body instanceof Blob) {
      header["Content-Length"] = body.size;
    }
  }
  outgoing.writeHead(status, header);
  if (typeof body === "string" || body instanceof Uint8Array) {
    outgoing.end(body);
  } else if (body instanceof Blob) {
    outgoing.end(new Uint8Array(await body.arrayBuffer()));
  } else {
    flushHeaders(outgoing);
    await writeFromReadableStream(body, outgoing)?.catch(
      (e) => handleResponseError(e, outgoing)
    );
  }
  ;
  outgoing[outgoingEnded]?.();
};
var isPromise = (res) => typeof res.then === "function";
var responseViaResponseObject = async (res, outgoing, options = {}) => {
  if (isPromise(res)) {
    if (options.errorHandler) {
      try {
        res = await res;
      } catch (err) {
        const errRes = await options.errorHandler(err);
        if (!errRes) {
          return;
        }
        res = errRes;
      }
    } else {
      res = await res.catch(handleFetchError);
    }
  }
  if (cacheKey in res) {
    return responseViaCache(res, outgoing);
  }
  const resHeaderRecord = buildOutgoingHttpHeaders(res.headers);
  if (res.body) {
    const reader = res.body.getReader();
    const values = [];
    let done = false;
    let currentReadPromise = void 0;
    if (resHeaderRecord["transfer-encoding"] !== "chunked") {
      let maxReadCount = 2;
      for (let i = 0; i < maxReadCount; i++) {
        currentReadPromise ||= reader.read();
        const chunk = await readWithoutBlocking(currentReadPromise).catch((e) => {
          console.error(e);
          done = true;
        });
        if (!chunk) {
          if (i === 1) {
            await new Promise((resolve3) => setTimeout(resolve3));
            maxReadCount = 3;
            continue;
          }
          break;
        }
        currentReadPromise = void 0;
        if (chunk.value) {
          values.push(chunk.value);
        }
        if (chunk.done) {
          done = true;
          break;
        }
      }
      if (done && !("content-length" in resHeaderRecord)) {
        resHeaderRecord["content-length"] = values.reduce((acc, value) => acc + value.length, 0);
      }
    }
    outgoing.writeHead(res.status, resHeaderRecord);
    values.forEach((value) => {
      ;
      outgoing.write(value);
    });
    if (done) {
      outgoing.end();
    } else {
      if (values.length === 0) {
        flushHeaders(outgoing);
      }
      await writeFromReadableStreamDefaultReader(reader, outgoing, currentReadPromise);
    }
  } else if (resHeaderRecord[X_ALREADY_SENT]) {
  } else {
    outgoing.writeHead(res.status, resHeaderRecord);
    outgoing.end();
  }
  ;
  outgoing[outgoingEnded]?.();
};
var getRequestListener = (fetchCallback, options = {}) => {
  const autoCleanupIncoming = options.autoCleanupIncoming ?? true;
  if (options.overrideGlobalObjects !== false && global.Request !== Request) {
    Object.defineProperty(global, "Request", {
      value: Request
    });
    Object.defineProperty(global, "Response", {
      value: Response2
    });
  }
  return async (incoming, outgoing) => {
    let res, req;
    try {
      req = newRequest(incoming, options.hostname);
      let incomingEnded = !autoCleanupIncoming || incoming.method === "GET" || incoming.method === "HEAD";
      if (!incomingEnded) {
        ;
        incoming[wrapBodyStream] = true;
        incoming.on("end", () => {
          incomingEnded = true;
        });
        if (incoming instanceof import_http2.Http2ServerRequest) {
          ;
          outgoing[outgoingEnded] = () => {
            if (!incomingEnded) {
              setTimeout(() => {
                if (!incomingEnded) {
                  setTimeout(() => {
                    drainIncoming(incoming);
                  });
                }
              });
            }
          };
        }
        outgoing.on("finish", () => {
          if (!incomingEnded) {
            drainIncoming(incoming);
          }
        });
      }
      outgoing.on("close", () => {
        const abortController = req[abortControllerKey];
        if (abortController) {
          if (incoming.errored) {
            req[abortControllerKey].abort(incoming.errored.toString());
          } else if (!outgoing.writableFinished) {
            req[abortControllerKey].abort("Client connection prematurely closed.");
          }
        }
        if (!incomingEnded) {
          setTimeout(() => {
            if (!incomingEnded) {
              setTimeout(() => {
                drainIncoming(incoming);
              });
            }
          });
        }
      });
      res = fetchCallback(req, { incoming, outgoing });
      if (cacheKey in res) {
        return responseViaCache(res, outgoing);
      }
    } catch (e) {
      if (!res) {
        if (options.errorHandler) {
          res = await options.errorHandler(req ? e : toRequestError(e));
          if (!res) {
            return;
          }
        } else if (!req) {
          res = handleRequestError();
        } else {
          res = handleFetchError(e);
        }
      } else {
        return handleResponseError(e, outgoing);
      }
    }
    try {
      return await responseViaResponseObject(res, outgoing, options);
    } catch (e) {
      return handleResponseError(e, outgoing);
    }
  };
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/webStandardStreamableHttp.js
var WebStandardStreamableHTTPServerTransport = class {
  constructor(options = {}) {
    this._started = false;
    this._hasHandledRequest = false;
    this._streamMapping = /* @__PURE__ */ new Map();
    this._requestToStreamMapping = /* @__PURE__ */ new Map();
    this._requestResponseMap = /* @__PURE__ */ new Map();
    this._initialized = false;
    this._enableJsonResponse = false;
    this._standaloneSseStreamId = "_GET_stream";
    this.sessionIdGenerator = options.sessionIdGenerator;
    this._enableJsonResponse = options.enableJsonResponse ?? false;
    this._eventStore = options.eventStore;
    this._onsessioninitialized = options.onsessioninitialized;
    this._onsessionclosed = options.onsessionclosed;
    this._allowedHosts = options.allowedHosts;
    this._allowedOrigins = options.allowedOrigins;
    this._enableDnsRebindingProtection = options.enableDnsRebindingProtection ?? false;
    this._retryInterval = options.retryInterval;
  }
  /**
   * Starts the transport. This is required by the Transport interface but is a no-op
   * for the Streamable HTTP transport as connections are managed per-request.
   */
  async start() {
    if (this._started) {
      throw new Error("Transport already started");
    }
    this._started = true;
  }
  /**
   * Helper to create a JSON error response
   */
  createJsonErrorResponse(status, code, message, options) {
    const error2 = { code, message };
    if (options?.data !== void 0) {
      error2.data = options.data;
    }
    return new Response(JSON.stringify({
      jsonrpc: "2.0",
      error: error2,
      id: null
    }), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  /**
   * Validates request headers for DNS rebinding protection.
   * @returns Error response if validation fails, undefined if validation passes.
   */
  validateRequestHeaders(req) {
    if (!this._enableDnsRebindingProtection) {
      return void 0;
    }
    if (this._allowedHosts && this._allowedHosts.length > 0) {
      const hostHeader = req.headers.get("host");
      if (!hostHeader || !this._allowedHosts.includes(hostHeader)) {
        const error2 = `Invalid Host header: ${hostHeader}`;
        this.onerror?.(new Error(error2));
        return this.createJsonErrorResponse(403, -32e3, error2);
      }
    }
    if (this._allowedOrigins && this._allowedOrigins.length > 0) {
      const originHeader = req.headers.get("origin");
      if (originHeader && !this._allowedOrigins.includes(originHeader)) {
        const error2 = `Invalid Origin header: ${originHeader}`;
        this.onerror?.(new Error(error2));
        return this.createJsonErrorResponse(403, -32e3, error2);
      }
    }
    return void 0;
  }
  /**
   * Handles an incoming HTTP request, whether GET, POST, or DELETE
   * Returns a Response object (Web Standard)
   */
  async handleRequest(req, options) {
    if (!this.sessionIdGenerator && this._hasHandledRequest) {
      throw new Error("Stateless transport cannot be reused across requests. Create a new transport per request.");
    }
    this._hasHandledRequest = true;
    const validationError = this.validateRequestHeaders(req);
    if (validationError) {
      return validationError;
    }
    switch (req.method) {
      case "POST":
        return this.handlePostRequest(req, options);
      case "GET":
        return this.handleGetRequest(req);
      case "DELETE":
        return this.handleDeleteRequest(req);
      default:
        return this.handleUnsupportedRequest();
    }
  }
  /**
   * Writes a priming event to establish resumption capability.
   * Only sends if eventStore is configured (opt-in for resumability) and
   * the client's protocol version supports empty SSE data (>= 2025-11-25).
   */
  async writePrimingEvent(controller, encoder, streamId, protocolVersion) {
    if (!this._eventStore) {
      return;
    }
    if (protocolVersion < "2025-11-25") {
      return;
    }
    const primingEventId = await this._eventStore.storeEvent(streamId, {});
    let primingEvent = `id: ${primingEventId}
data: 

`;
    if (this._retryInterval !== void 0) {
      primingEvent = `id: ${primingEventId}
retry: ${this._retryInterval}
data: 

`;
    }
    controller.enqueue(encoder.encode(primingEvent));
  }
  /**
   * Handles GET requests for SSE stream
   */
  async handleGetRequest(req) {
    const acceptHeader = req.headers.get("accept");
    if (!acceptHeader?.includes("text/event-stream")) {
      this.onerror?.(new Error("Not Acceptable: Client must accept text/event-stream"));
      return this.createJsonErrorResponse(406, -32e3, "Not Acceptable: Client must accept text/event-stream");
    }
    const sessionError = this.validateSession(req);
    if (sessionError) {
      return sessionError;
    }
    const protocolError = this.validateProtocolVersion(req);
    if (protocolError) {
      return protocolError;
    }
    if (this._eventStore) {
      const lastEventId = req.headers.get("last-event-id");
      if (lastEventId) {
        return this.replayEvents(lastEventId);
      }
    }
    if (this._streamMapping.get(this._standaloneSseStreamId) !== void 0) {
      this.onerror?.(new Error("Conflict: Only one SSE stream is allowed per session"));
      return this.createJsonErrorResponse(409, -32e3, "Conflict: Only one SSE stream is allowed per session");
    }
    const encoder = new TextEncoder();
    let streamController;
    const readable = new ReadableStream({
      start: (controller) => {
        streamController = controller;
      },
      cancel: () => {
        this._streamMapping.delete(this._standaloneSseStreamId);
      }
    });
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    };
    if (this.sessionId !== void 0) {
      headers["mcp-session-id"] = this.sessionId;
    }
    this._streamMapping.set(this._standaloneSseStreamId, {
      controller: streamController,
      encoder,
      cleanup: () => {
        this._streamMapping.delete(this._standaloneSseStreamId);
        try {
          streamController.close();
        } catch {
        }
      }
    });
    return new Response(readable, { headers });
  }
  /**
   * Replays events that would have been sent after the specified event ID
   * Only used when resumability is enabled
   */
  async replayEvents(lastEventId) {
    if (!this._eventStore) {
      this.onerror?.(new Error("Event store not configured"));
      return this.createJsonErrorResponse(400, -32e3, "Event store not configured");
    }
    try {
      let streamId;
      if (this._eventStore.getStreamIdForEventId) {
        streamId = await this._eventStore.getStreamIdForEventId(lastEventId);
        if (!streamId) {
          this.onerror?.(new Error("Invalid event ID format"));
          return this.createJsonErrorResponse(400, -32e3, "Invalid event ID format");
        }
        if (this._streamMapping.get(streamId) !== void 0) {
          this.onerror?.(new Error("Conflict: Stream already has an active connection"));
          return this.createJsonErrorResponse(409, -32e3, "Conflict: Stream already has an active connection");
        }
      }
      const headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      };
      if (this.sessionId !== void 0) {
        headers["mcp-session-id"] = this.sessionId;
      }
      const encoder = new TextEncoder();
      let streamController;
      const readable = new ReadableStream({
        start: (controller) => {
          streamController = controller;
        },
        cancel: () => {
        }
      });
      const replayedStreamId = await this._eventStore.replayEventsAfter(lastEventId, {
        send: async (eventId, message) => {
          const success = this.writeSSEEvent(streamController, encoder, message, eventId);
          if (!success) {
            this.onerror?.(new Error("Failed replay events"));
            try {
              streamController.close();
            } catch {
            }
          }
        }
      });
      this._streamMapping.set(replayedStreamId, {
        controller: streamController,
        encoder,
        cleanup: () => {
          this._streamMapping.delete(replayedStreamId);
          try {
            streamController.close();
          } catch {
          }
        }
      });
      return new Response(readable, { headers });
    } catch (error2) {
      this.onerror?.(error2);
      return this.createJsonErrorResponse(500, -32e3, "Error replaying events");
    }
  }
  /**
   * Writes an event to an SSE stream via controller with proper formatting
   */
  writeSSEEvent(controller, encoder, message, eventId) {
    try {
      let eventData = `event: message
`;
      if (eventId) {
        eventData += `id: ${eventId}
`;
      }
      eventData += `data: ${JSON.stringify(message)}

`;
      controller.enqueue(encoder.encode(eventData));
      return true;
    } catch (error2) {
      this.onerror?.(error2);
      return false;
    }
  }
  /**
   * Handles unsupported requests (PUT, PATCH, etc.)
   */
  handleUnsupportedRequest() {
    this.onerror?.(new Error("Method not allowed."));
    return new Response(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32e3,
        message: "Method not allowed."
      },
      id: null
    }), {
      status: 405,
      headers: {
        Allow: "GET, POST, DELETE",
        "Content-Type": "application/json"
      }
    });
  }
  /**
   * Handles POST requests containing JSON-RPC messages
   */
  async handlePostRequest(req, options) {
    try {
      const acceptHeader = req.headers.get("accept");
      if (!acceptHeader?.includes("application/json") || !acceptHeader.includes("text/event-stream")) {
        this.onerror?.(new Error("Not Acceptable: Client must accept both application/json and text/event-stream"));
        return this.createJsonErrorResponse(406, -32e3, "Not Acceptable: Client must accept both application/json and text/event-stream");
      }
      const ct = req.headers.get("content-type");
      if (!ct || !ct.includes("application/json")) {
        this.onerror?.(new Error("Unsupported Media Type: Content-Type must be application/json"));
        return this.createJsonErrorResponse(415, -32e3, "Unsupported Media Type: Content-Type must be application/json");
      }
      const requestInfo = {
        headers: Object.fromEntries(req.headers.entries()),
        url: new URL(req.url)
      };
      let rawMessage;
      if (options?.parsedBody !== void 0) {
        rawMessage = options.parsedBody;
      } else {
        try {
          rawMessage = await req.json();
        } catch {
          this.onerror?.(new Error("Parse error: Invalid JSON"));
          return this.createJsonErrorResponse(400, -32700, "Parse error: Invalid JSON");
        }
      }
      let messages;
      try {
        if (Array.isArray(rawMessage)) {
          messages = rawMessage.map((msg) => JSONRPCMessageSchema.parse(msg));
        } else {
          messages = [JSONRPCMessageSchema.parse(rawMessage)];
        }
      } catch {
        this.onerror?.(new Error("Parse error: Invalid JSON-RPC message"));
        return this.createJsonErrorResponse(400, -32700, "Parse error: Invalid JSON-RPC message");
      }
      const isInitializationRequest = messages.some(isInitializeRequest);
      if (isInitializationRequest) {
        if (this._initialized && this.sessionId !== void 0) {
          this.onerror?.(new Error("Invalid Request: Server already initialized"));
          return this.createJsonErrorResponse(400, -32600, "Invalid Request: Server already initialized");
        }
        if (messages.length > 1) {
          this.onerror?.(new Error("Invalid Request: Only one initialization request is allowed"));
          return this.createJsonErrorResponse(400, -32600, "Invalid Request: Only one initialization request is allowed");
        }
        this.sessionId = this.sessionIdGenerator?.();
        this._initialized = true;
        if (this.sessionId && this._onsessioninitialized) {
          await Promise.resolve(this._onsessioninitialized(this.sessionId));
        }
      }
      if (!isInitializationRequest) {
        const sessionError = this.validateSession(req);
        if (sessionError) {
          return sessionError;
        }
        const protocolError = this.validateProtocolVersion(req);
        if (protocolError) {
          return protocolError;
        }
      }
      const hasRequests = messages.some(isJSONRPCRequest);
      if (!hasRequests) {
        for (const message of messages) {
          this.onmessage?.(message, { authInfo: options?.authInfo, requestInfo });
        }
        return new Response(null, { status: 202 });
      }
      const streamId = crypto.randomUUID();
      const initRequest = messages.find((m) => isInitializeRequest(m));
      const clientProtocolVersion = initRequest ? initRequest.params.protocolVersion : req.headers.get("mcp-protocol-version") ?? DEFAULT_NEGOTIATED_PROTOCOL_VERSION;
      if (this._enableJsonResponse) {
        return new Promise((resolve3) => {
          this._streamMapping.set(streamId, {
            resolveJson: resolve3,
            cleanup: () => {
              this._streamMapping.delete(streamId);
            }
          });
          for (const message of messages) {
            if (isJSONRPCRequest(message)) {
              this._requestToStreamMapping.set(message.id, streamId);
            }
          }
          for (const message of messages) {
            this.onmessage?.(message, { authInfo: options?.authInfo, requestInfo });
          }
        });
      }
      const encoder = new TextEncoder();
      let streamController;
      const readable = new ReadableStream({
        start: (controller) => {
          streamController = controller;
        },
        cancel: () => {
          this._streamMapping.delete(streamId);
        }
      });
      const headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      };
      if (this.sessionId !== void 0) {
        headers["mcp-session-id"] = this.sessionId;
      }
      for (const message of messages) {
        if (isJSONRPCRequest(message)) {
          this._streamMapping.set(streamId, {
            controller: streamController,
            encoder,
            cleanup: () => {
              this._streamMapping.delete(streamId);
              try {
                streamController.close();
              } catch {
              }
            }
          });
          this._requestToStreamMapping.set(message.id, streamId);
        }
      }
      await this.writePrimingEvent(streamController, encoder, streamId, clientProtocolVersion);
      for (const message of messages) {
        let closeSSEStream;
        let closeStandaloneSSEStream;
        if (isJSONRPCRequest(message) && this._eventStore && clientProtocolVersion >= "2025-11-25") {
          closeSSEStream = () => {
            this.closeSSEStream(message.id);
          };
          closeStandaloneSSEStream = () => {
            this.closeStandaloneSSEStream();
          };
        }
        this.onmessage?.(message, { authInfo: options?.authInfo, requestInfo, closeSSEStream, closeStandaloneSSEStream });
      }
      return new Response(readable, { status: 200, headers });
    } catch (error2) {
      this.onerror?.(error2);
      return this.createJsonErrorResponse(400, -32700, "Parse error", { data: String(error2) });
    }
  }
  /**
   * Handles DELETE requests to terminate sessions
   */
  async handleDeleteRequest(req) {
    const sessionError = this.validateSession(req);
    if (sessionError) {
      return sessionError;
    }
    const protocolError = this.validateProtocolVersion(req);
    if (protocolError) {
      return protocolError;
    }
    await Promise.resolve(this._onsessionclosed?.(this.sessionId));
    await this.close();
    return new Response(null, { status: 200 });
  }
  /**
   * Validates session ID for non-initialization requests.
   * Returns Response error if invalid, undefined otherwise
   */
  validateSession(req) {
    if (this.sessionIdGenerator === void 0) {
      return void 0;
    }
    if (!this._initialized) {
      this.onerror?.(new Error("Bad Request: Server not initialized"));
      return this.createJsonErrorResponse(400, -32e3, "Bad Request: Server not initialized");
    }
    const sessionId = req.headers.get("mcp-session-id");
    if (!sessionId) {
      this.onerror?.(new Error("Bad Request: Mcp-Session-Id header is required"));
      return this.createJsonErrorResponse(400, -32e3, "Bad Request: Mcp-Session-Id header is required");
    }
    if (sessionId !== this.sessionId) {
      this.onerror?.(new Error("Session not found"));
      return this.createJsonErrorResponse(404, -32001, "Session not found");
    }
    return void 0;
  }
  /**
   * Validates the MCP-Protocol-Version header on incoming requests.
   *
   * For initialization: Version negotiation handles unknown versions gracefully
   * (server responds with its supported version).
   *
   * For subsequent requests with MCP-Protocol-Version header:
   * - Accept if in supported list
   * - 400 if unsupported
   *
   * For HTTP requests without the MCP-Protocol-Version header:
   * - Accept and default to the version negotiated at initialization
   */
  validateProtocolVersion(req) {
    const protocolVersion = req.headers.get("mcp-protocol-version");
    if (protocolVersion !== null && !SUPPORTED_PROTOCOL_VERSIONS.includes(protocolVersion)) {
      this.onerror?.(new Error(`Bad Request: Unsupported protocol version: ${protocolVersion} (supported versions: ${SUPPORTED_PROTOCOL_VERSIONS.join(", ")})`));
      return this.createJsonErrorResponse(400, -32e3, `Bad Request: Unsupported protocol version: ${protocolVersion} (supported versions: ${SUPPORTED_PROTOCOL_VERSIONS.join(", ")})`);
    }
    return void 0;
  }
  async close() {
    this._streamMapping.forEach(({ cleanup }) => {
      cleanup();
    });
    this._streamMapping.clear();
    this._requestResponseMap.clear();
    this.onclose?.();
  }
  /**
   * Close an SSE stream for a specific request, triggering client reconnection.
   * Use this to implement polling behavior during long-running operations -
   * client will reconnect after the retry interval specified in the priming event.
   */
  closeSSEStream(requestId) {
    const streamId = this._requestToStreamMapping.get(requestId);
    if (!streamId)
      return;
    const stream = this._streamMapping.get(streamId);
    if (stream) {
      stream.cleanup();
    }
  }
  /**
   * Close the standalone GET SSE stream, triggering client reconnection.
   * Use this to implement polling behavior for server-initiated notifications.
   */
  closeStandaloneSSEStream() {
    const stream = this._streamMapping.get(this._standaloneSseStreamId);
    if (stream) {
      stream.cleanup();
    }
  }
  async send(message, options) {
    let requestId = options?.relatedRequestId;
    if (isJSONRPCResultResponse(message) || isJSONRPCErrorResponse(message)) {
      requestId = message.id;
    }
    if (requestId === void 0) {
      if (isJSONRPCResultResponse(message) || isJSONRPCErrorResponse(message)) {
        throw new Error("Cannot send a response on a standalone SSE stream unless resuming a previous client request");
      }
      let eventId;
      if (this._eventStore) {
        eventId = await this._eventStore.storeEvent(this._standaloneSseStreamId, message);
      }
      const standaloneSse = this._streamMapping.get(this._standaloneSseStreamId);
      if (standaloneSse === void 0) {
        return;
      }
      if (standaloneSse.controller && standaloneSse.encoder) {
        this.writeSSEEvent(standaloneSse.controller, standaloneSse.encoder, message, eventId);
      }
      return;
    }
    const streamId = this._requestToStreamMapping.get(requestId);
    if (!streamId) {
      throw new Error(`No connection established for request ID: ${String(requestId)}`);
    }
    const stream = this._streamMapping.get(streamId);
    if (!this._enableJsonResponse && stream?.controller && stream?.encoder) {
      let eventId;
      if (this._eventStore) {
        eventId = await this._eventStore.storeEvent(streamId, message);
      }
      this.writeSSEEvent(stream.controller, stream.encoder, message, eventId);
    }
    if (isJSONRPCResultResponse(message) || isJSONRPCErrorResponse(message)) {
      this._requestResponseMap.set(requestId, message);
      const relatedIds = Array.from(this._requestToStreamMapping.entries()).filter(([_, sid]) => sid === streamId).map(([id]) => id);
      const allResponsesReady = relatedIds.every((id) => this._requestResponseMap.has(id));
      if (allResponsesReady) {
        if (!stream) {
          throw new Error(`No connection established for request ID: ${String(requestId)}`);
        }
        if (this._enableJsonResponse && stream.resolveJson) {
          const headers = {
            "Content-Type": "application/json"
          };
          if (this.sessionId !== void 0) {
            headers["mcp-session-id"] = this.sessionId;
          }
          const responses = relatedIds.map((id) => this._requestResponseMap.get(id));
          if (responses.length === 1) {
            stream.resolveJson(new Response(JSON.stringify(responses[0]), { status: 200, headers }));
          } else {
            stream.resolveJson(new Response(JSON.stringify(responses), { status: 200, headers }));
          }
        } else {
          stream.cleanup();
        }
        for (const id of relatedIds) {
          this._requestResponseMap.delete(id);
          this._requestToStreamMapping.delete(id);
        }
      }
    }
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/streamableHttp.js
var StreamableHTTPServerTransport = class {
  constructor(options = {}) {
    this._requestContext = /* @__PURE__ */ new WeakMap();
    this._webStandardTransport = new WebStandardStreamableHTTPServerTransport(options);
    this._requestListener = getRequestListener(async (webRequest) => {
      const context = this._requestContext.get(webRequest);
      return this._webStandardTransport.handleRequest(webRequest, {
        authInfo: context?.authInfo,
        parsedBody: context?.parsedBody
      });
    }, { overrideGlobalObjects: false });
  }
  /**
   * Gets the session ID for this transport instance.
   */
  get sessionId() {
    return this._webStandardTransport.sessionId;
  }
  /**
   * Sets callback for when the transport is closed.
   */
  set onclose(handler) {
    this._webStandardTransport.onclose = handler;
  }
  get onclose() {
    return this._webStandardTransport.onclose;
  }
  /**
   * Sets callback for transport errors.
   */
  set onerror(handler) {
    this._webStandardTransport.onerror = handler;
  }
  get onerror() {
    return this._webStandardTransport.onerror;
  }
  /**
   * Sets callback for incoming messages.
   */
  set onmessage(handler) {
    this._webStandardTransport.onmessage = handler;
  }
  get onmessage() {
    return this._webStandardTransport.onmessage;
  }
  /**
   * Starts the transport. This is required by the Transport interface but is a no-op
   * for the Streamable HTTP transport as connections are managed per-request.
   */
  async start() {
    return this._webStandardTransport.start();
  }
  /**
   * Closes the transport and all active connections.
   */
  async close() {
    return this._webStandardTransport.close();
  }
  /**
   * Sends a JSON-RPC message through the transport.
   */
  async send(message, options) {
    return this._webStandardTransport.send(message, options);
  }
  /**
   * Handles an incoming HTTP request, whether GET or POST.
   *
   * This method converts Node.js HTTP objects to Web Standard Request/Response
   * and delegates to the underlying WebStandardStreamableHTTPServerTransport.
   *
   * @param req - Node.js IncomingMessage, optionally with auth property from middleware
   * @param res - Node.js ServerResponse
   * @param parsedBody - Optional pre-parsed body from body-parser middleware
   */
  async handleRequest(req, res, parsedBody) {
    const authInfo = req.auth;
    const handler = getRequestListener(async (webRequest) => {
      return this._webStandardTransport.handleRequest(webRequest, {
        authInfo,
        parsedBody
      });
    }, { overrideGlobalObjects: false });
    await handler(req, res);
  }
  /**
   * Close an SSE stream for a specific request, triggering client reconnection.
   * Use this to implement polling behavior during long-running operations -
   * client will reconnect after the retry interval specified in the priming event.
   */
  closeSSEStream(requestId) {
    this._webStandardTransport.closeSSEStream(requestId);
  }
  /**
   * Close the standalone GET SSE stream, triggering client reconnection.
   * Use this to implement polling behavior for server-initiated notifications.
   */
  closeStandaloneSSEStream() {
    this._webStandardTransport.closeStandaloneSSEStream();
  }
};

// src/mcp-server/index.ts
var import_node_http = require("node:http");
var import_node_https = require("node:https");
var import_node_fs = require("node:fs");
var import_node_path = require("node:path");

// src/mcp-server/tools/auth.tool.ts
var import_crypto2 = require("crypto");

// src/config/env.ts
function getEnvConfig() {
  const env = process.env.CJ_ENV || "production";
  const isProduction = env === "production";
  return {
    env,
    /**
     * @note 纠正: 测试环境 OpenAPI 域名是 developers.cjdropshipping.offline.pre.com
     * 而非 test002 (test002 是静态文件服务, POST 返回 405)
     */
    openApiBase: isProduction ? "https://developers.cjdropshipping.com" : "http://developers.cjdropshipping.offline.pre.com",
    webBase: isProduction ? "https://www.cjdropshipping.com" : "http://www.cjdropshipping.offline.pre.com",
    loginApiBase: isProduction ? "https://www.cjdropshipping.com" : "http://www.cjdropshipping.offline.pre.com",
    platform: Number(process.env.CJ_PLATFORM) || 1,
    language: process.env.CJ_LANGUAGE || "en",
    currency: process.env.CJ_CURRENCY || "USD",
    tokenEncryptKey: process.env.TOKEN_ENCRYPT_KEY || ""
  };
}

// src/auth/token-store.ts
var fs = __toESM(require("fs"), 1);
var path = __toESM(require("path"), 1);
var crypto3 = __toESM(require("crypto"), 1);
var TOKEN_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE || ".",
  ".cj-mcp-token"
);
var TOKEN_FILE2 = path.join(
  process.env.HOME || process.env.USERPROFILE || ".",
  ".cj-mcp-token2"
);
var tokenStoreInstance = null;
var TokenStore = class _TokenStore {
  encryptKey;
  env;
  constructor() {
    const config2 = getEnvConfig();
    this.encryptKey = config2.tokenEncryptKey || "cj-mcp-default-key-2026";
    this.env = config2.env;
  }
  static getInstance() {
    if (!tokenStoreInstance) {
      tokenStoreInstance = new _TokenStore();
    }
    return tokenStoreInstance;
  }
  getKey() {
    return crypto3.createHash("sha256").update(this.encryptKey).digest();
  }
  encrypt(text) {
    const iv = crypto3.randomBytes(16);
    const cipher = crypto3.createCipheriv("aes-256-cbc", this.getKey(), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }
  decrypt(encryptedText) {
    const parts = encryptedText.split(":");
    if (parts.length < 2) return "";
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts.slice(1).join(":");
    const decipher = crypto3.createDecipheriv("aes-256-cbc", this.getKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
  setToken(token) {
    const encrypted = this.encrypt(token);
    fs.writeFileSync(TOKEN_FILE, encrypted, "utf8");
    if (this.env === "test") {
      fs.writeFileSync(TOKEN_FILE2, token, "utf8");
    }
  }
  getToken() {
    try {
      if (!fs.existsSync(TOKEN_FILE)) return "";
      const encrypted = fs.readFileSync(TOKEN_FILE, "utf8").trim();
      if (!encrypted) return "";
      return this.decrypt(encrypted);
    } catch {
      return "";
    }
  }
  clearToken() {
    try {
      if (fs.existsSync(TOKEN_FILE)) {
        fs.unlinkSync(TOKEN_FILE);
      }
      if (fs.existsSync(TOKEN_FILE2)) {
        fs.unlinkSync(TOKEN_FILE2);
      }
    } catch {
    }
  }
  hasToken() {
    return !!this.getToken();
  }
};

// src/api-client/rate-limiter.ts
var TIER_CONFIG = {
  read: { maxTokens: 10, refillRate: 10 },
  write: { maxTokens: 2, refillRate: 2 },
  auth: { maxTokens: 1, refillRate: 1 }
};
var GLOBAL_CONFIG = { maxTokens: 20, refillRate: 20 };
var DAILY_QUOTA = Number(process.env.CJ_DAILY_QUOTA) || 1e4;
var MAX_CONCURRENCY = Number(process.env.CJ_MAX_CONCURRENCY) || 5;
var MAX_RETRIES = 3;
var BASE_RETRY_DELAY_MS = 500;
var TokenBucket = class {
  tokens;
  lastRefill;
  maxTokens;
  refillRate;
  constructor(config2) {
    this.maxTokens = config2.maxTokens;
    this.refillRate = config2.refillRate;
    this.tokens = config2.maxTokens;
    this.lastRefill = Date.now();
  }
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1e3;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
  tryConsume() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
  getWaitTime() {
    this.refill();
    if (this.tokens >= 1) return 0;
    return Math.ceil((1 - this.tokens) / this.refillRate * 1e3);
  }
  getStatus() {
    this.refill();
    return {
      available: Math.floor(this.tokens),
      max: this.maxTokens,
      refillRate: this.refillRate
    };
  }
};
var DailyQuota = class {
  count = 0;
  dateKey = "";
  max;
  constructor(max) {
    this.max = max;
    this.resetIfNewDay();
  }
  resetIfNewDay() {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    if (today !== this.dateKey) {
      this.dateKey = today;
      this.count = 0;
    }
  }
  tryConsume() {
    this.resetIfNewDay();
    if (this.count >= this.max) return false;
    this.count++;
    return true;
  }
  getStatus() {
    this.resetIfNewDay();
    return { used: this.count, max: this.max, remaining: this.max - this.count };
  }
};
var ConcurrencySemaphore = class {
  current = 0;
  max;
  queue = [];
  constructor(max) {
    this.max = max;
  }
  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    return new Promise((resolve3) => {
      this.queue.push(() => {
        this.current++;
        resolve3();
      });
    });
  }
  release() {
    this.current--;
    const next = this.queue.shift();
    if (next) next();
  }
  getStatus() {
    return { active: this.current, max: this.max, queued: this.queue.length };
  }
};
var ResponseCache = class {
  cache = /* @__PURE__ */ new Map();
  defaultTtlMs;
  constructor(defaultTtlMs = 5 * 60 * 1e3) {
    this.defaultTtlMs = defaultTtlMs;
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return void 0;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return void 0;
    }
    return entry.data;
  }
  set(key, data, ttlMs) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlMs ?? this.defaultTtlMs)
    });
  }
  invalidate(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }
  getStatus() {
    let validCount = 0;
    const now = Date.now();
    for (const entry of this.cache.values()) {
      if (entry.expiry > now) validCount++;
    }
    return { size: validCount, ttlMs: this.defaultTtlMs };
  }
};
var RateLimiter = class {
  tierBuckets = /* @__PURE__ */ new Map();
  globalBucket;
  dailyQuota;
  concurrency;
  cache;
  constructor() {
    for (const [tier, config2] of Object.entries(TIER_CONFIG)) {
      this.tierBuckets.set(tier, new TokenBucket(config2));
    }
    this.globalBucket = new TokenBucket(GLOBAL_CONFIG);
    this.dailyQuota = new DailyQuota(DAILY_QUOTA);
    this.concurrency = new ConcurrencySemaphore(MAX_CONCURRENCY);
    this.cache = new ResponseCache();
  }
  /**
   * @description 获取限速许可 (含队列等待)
   * 失败时抛出错误
   */
  async acquire(tier) {
    if (!this.dailyQuota.tryConsume()) {
      throw new QuotaExceededError(
        `\u65E5\u8C03\u7528\u914D\u989D\u5DF2\u8FBE\u4E0A\u9650 (${DAILY_QUOTA}\u6B21)\uFF0C\u8BF7\u660E\u65E5\u518D\u8BD5 / Daily quota exceeded (${DAILY_QUOTA} calls). Try again tomorrow.`
      );
    }
    const tierBucket = this.tierBuckets.get(tier);
    while (!tierBucket.tryConsume() || !this.globalBucket.tryConsume()) {
      const tierWait = tierBucket.getWaitTime();
      const globalWait = this.globalBucket.getWaitTime();
      const waitTime = Math.max(tierWait, globalWait, 50);
      await new Promise((resolve3) => setTimeout(resolve3, waitTime));
    }
  }
  /**
   * @description 获取并发许可
   */
  async acquireConcurrency() {
    await this.concurrency.acquire();
  }
  /**
   * @description 释放并发许可
   */
  releaseConcurrency() {
    this.concurrency.release();
  }
  /**
   * @description 计算重试延迟 (指数退避)
   */
  getRetryDelay(attempt) {
    return BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
  }
  getMaxRetries() {
    return MAX_RETRIES;
  }
  getStatus() {
    const tiers = {};
    for (const [tier, bucket] of this.tierBuckets) {
      tiers[tier] = bucket.getStatus();
    }
    return {
      tiers,
      global: this.globalBucket.getStatus(),
      dailyQuota: this.dailyQuota.getStatus(),
      concurrency: this.concurrency.getStatus(),
      cache: this.cache.getStatus()
    };
  }
};
var QuotaExceededError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "QuotaExceededError";
  }
};
var rateLimiter = new RateLimiter();

// src/api-client/endpoints.ts
var API_VERSION_PREFIX = "/api2.0/v1";
var ENDPOINTS = {
  // === Authentication ===
  auth: {
    getAccessToken: "/authentication/getAccessToken",
    refreshAccessToken: "/authentication/refreshAccessToken",
    getAuthorizeUrl: "/authentication/getAuthorizeUrl"
  },
  // === Product ===
  product: {
    query: "/product/query",
    listV2: "/product/listV2",
    getCategory: "/product/getCategory",
    globalWarehouseList: "/product/globalWarehouseList",
    variantQuery: "/product/variant/query",
    myProductQuery: "/product/myProduct/query",
    stockQueryByVid: "/product/stock/queryByVid",
    stockQueryBySku: "/product/stock/queryBySku",
    stockGetInventoryByPid: "/product/stock/getInventoryByPid",
    sourcingCreate: "/product/sourcing/create",
    sourcingQuery: "/product/sourcing/query",
    connList: "/product/conn/connection",
    productComments: "/product/productComments",
    imageSearch: "/product/queryProductsByImage"
  },
  // === Logistic ===
  logistic: {
    freightCalculate: "/logistic/freightCalculate",
    trackInfo: "/logistic/trackInfo",
    freightCalculateTip: "/logistic/freightCalculateTip"
  },
  // === Shopping / Order ===
  shopping: {
    addCart: "/shopping/order/addCart",
    addCartConfirm: "/shopping/order/addCartConfirm",
    saveGenerateParentOrder: "/shopping/order/saveGenerateParentOrder",
    createOrder: "/shopping/order/createOrder",
    createOrderV2: "/shopping/order/createOrderV2",
    mergeOrderAutoMatch: "/shopping/mergeOrder/autoMatchMergeOrderListV3",
    mergeOrderAutoResult: "/shopping/mergeOrder/autoMergeQueryResult",
    mergeOrderAutoProgress: "/shopping/mergeOrder/autoMergeQueryProgress",
    mergeOrderSubmit: "/shopping/mergeOrder/submitMergeOrderBatchV3",
    mergeOrderSubmitProgress: "/shopping/mergeOrder/submitProgress",
    mergeOrderSubmitResult: "/shopping/mergeOrder/submitResult",
    listOrder: "/shopping/order/list",
    getOrderDetail: "/shopping/order/getOrderDetail",
    getBalance: "/shopping/pay/getBalance",
    payBalance: "/shopping/pay/payBalance",
    payBalanceV2: "/shopping/pay/payBalanceV2",
    deleteOrder: "/shopping/order/deleteOrder",
    confirmOrder: "/shopping/order/confirmOrder",
    queryCogs: "/shopping/order/queryCogsBasicDataOrderInfoList"
  },
  // === Disputes ===
  disputes: {
    create: "/disputes/create",
    cancel: "/disputes/cancel",
    getDisputeList: "/disputes/getDisputeList",
    getDisputeDetail: "/disputes/getDisputeDetail",
    disputeConfirmInfo: "/disputes/disputeConfirmInfo",
    disputeProducts: "/disputes/disputeProducts"
  },
  // === Shop ===
  shop: {
    getShops: "/shop/getShops"
  },
  // === Setting ===
  setting: {
    get: "/setting/get"
  },
  // === Warehouse ===
  warehouse: {
    detail: "/warehouse/detail",
    orderPictures: "/storehouseCenterWeb/syncStorehouseVideoRequests"
  },
  // === Store ===
  store: {
    saveProduct: "/store/product/saveProduct"
  },
  // === Webhook ===
  webhook: {
    set: "/webhook/set"
  },
  // === Stock / Warehouse ===
  stock: {
    querySpuPage: "/product/stock/privateInventory/querySpuPage",
    querySkuDetailPage: "/product/stock/privateInventory/querySkuDetailPage",
    querySkuDetailListBySku: "/product/stock/privateInventory/querySkuDetailListBySku",
    querySkuListByProductId: "/product/stock/privateInventory/querySkuListByProductId"
  }
};

// src/utils/logger.ts
var import_fs2 = require("fs");
var import_path2 = require("path");

// src/utils/module-path.ts
var import_fs = require("fs");
var import_path = require("path");
var import_url = require("url");
function getRuntimeDir() {
  if (typeof __dirname !== "undefined") {
    return __dirname;
  }
  const entry = process.argv[1];
  if (entry) {
    return (0, import_path.dirname)((0, import_url.fileURLToPath)((0, import_url.pathToFileURL)((0, import_path.resolve)(entry))));
  }
  throw new Error(
    "Cannot resolve MCP runtime directory: __dirname unavailable and process.argv[1] is empty"
  );
}
function getProjectRoot() {
  const runtimeDir = getRuntimeDir();
  const candidates = [
    (0, import_path.join)(runtimeDir, "..", ".."),
    (0, import_path.join)(runtimeDir, ".."),
    process.cwd()
  ];
  for (const dir of candidates) {
    if ((0, import_fs.existsSync)((0, import_path.join)(dir, "package.json"))) {
      return dir;
    }
  }
  return process.cwd();
}
function resolveUiHtmlPath(filename) {
  const candidates = [
    (0, import_path.join)(getProjectRoot(), "src", "ui", filename),
    (0, import_path.join)(process.cwd(), "src", "ui", filename)
  ];
  for (const path2 of candidates) {
    if ((0, import_fs.existsSync)(path2)) {
      return path2;
    }
  }
  throw new Error(
    `UI HTML not found: ${filename}. Tried: ${candidates.join(", ")}`
  );
}
function readUiHtmlFile(filename) {
  return (0, import_fs.readFileSync)(resolveUiHtmlPath(filename), "utf-8");
}
function getLogsDir() {
  return (0, import_path.join)(getProjectRoot(), "logs");
}

// src/utils/logger.ts
var LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};
var currentLevel = process.env.CJ_LOG_LEVEL || "info";
var SENSITIVE_KEYS = ["password", "token", "apiKey", "accessToken", "refreshToken", "cjLoginToken", "fingerToken", "csrfToken", "cookie", "Cookie"];
function maskValue(value) {
  if (!value || value.length <= 8) return "****";
  return value.slice(0, 4) + "***" + value.slice(-4);
}
function sanitize(obj, depth = 0) {
  if (depth > 5) return "[\u6DF1\u5C42\u5D4C\u5957\u5DF2\u7701\u7565]";
  if (obj === null || obj === void 0) return obj;
  if (typeof obj === "string") return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, depth + 1));
  }
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = typeof value === "string" ? maskValue(value) : "****";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
function formatMessage(level, category, message, data) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
  let line = `${prefix} ${message}`;
  if (data !== void 0) {
    const sanitized = sanitize(data);
    line += ` ${JSON.stringify(sanitized)}`;
  }
  return line;
}
function shouldLog(level) {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}
function isDebugMode() {
  return shouldLog("debug");
}
var LOG_TO_FILE = process.env.CJ_LOG_FILE === "true";
var logDir = null;
function writeToFile(line) {
  if (!LOG_TO_FILE) return;
  try {
    if (!logDir) {
      logDir = getLogsDir();
      (0, import_fs2.mkdirSync)(logDir, { recursive: true });
    }
    const date3 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const logFile = (0, import_path2.join)(logDir, `mcp-${date3}.log`);
    (0, import_fs2.appendFileSync)(logFile, line + "\n", "utf-8");
  } catch {
  }
}
function emit(line) {
  process.stderr.write(line + "\n");
  writeToFile(line);
}
var logger = {
  debug(category, message, data) {
    if (shouldLog("debug")) {
      emit(formatMessage("debug", category, message, data));
    }
  },
  info(category, message, data) {
    if (shouldLog("info")) {
      emit(formatMessage("info", category, message, data));
    }
  },
  warn(category, message, data) {
    if (shouldLog("warn")) {
      emit(formatMessage("warn", category, message, data));
    }
  },
  error(category, message, data) {
    if (shouldLog("error")) {
      emit(formatMessage("error", category, message, data));
    }
  },
  /** 限流事件专用日志 */
  rateLimit(tier, action, detail) {
    const message = `[RateLimit] tier=${tier} action=${action}${detail ? " " + detail : ""}`;
    if (action === "exceeded") {
      this.warn("RATE_LIMIT", message);
    } else {
      this.info("RATE_LIMIT", message);
    }
  },
  /** 请求日志 (脱敏) */
  request(method, url, statusCode, durationMs) {
    const safeUrl = url.replace(/([?&])(token|apiKey|accessToken)=[^&]*/gi, "$1$2=***");
    this.info("HTTP", `${method} ${safeUrl} \u2192 ${statusCode ?? "?"} (${durationMs ?? "?"}ms)`);
  },
  /**
   * @note 新增(62次): 原始行输出，同时写入终端和文件
   * 用于 [MCP-REQ] 这类格式不走标准 category 的日志
   */
  raw(line) {
    emit(line);
  }
};
var startTime = Date.now();

// src/api-client/http-client.ts
function isApiSuccess(response) {
  return response.result === true || response.success === true || response.code === 200 || response.code === 0;
}
var tokenGetter = null;
function setTokenGetter(fn) {
  tokenGetter = fn;
}
var HttpClient = class {
  baseUrl;
  constructor() {
    const config2 = getEnvConfig();
    this.baseUrl = config2.openApiBase;
  }
  /**
   * 发送 OpenAPI 请求 (含重试逻辑)
   * @param endpoint - API 路径 (不含版本前缀)
   * @param options - 请求选项
   */
  async request(endpoint, options = {}) {
    const { method = "POST", body, params, tier = "read", skipAuth = false } = options;
    const maxRetries = rateLimiter.getMaxRetries();
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await rateLimiter.acquire(tier);
        const url = new URL(`${API_VERSION_PREFIX}${endpoint}`, this.baseUrl);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
          });
        }
        const headers = {
          "Content-Type": "application/json"
        };
        if (!skipAuth && tokenGetter) {
          const token = tokenGetter();
          if (token) {
            headers["CJ-Access-Token"] = token;
          }
        }
        const fetchOptions = {
          method,
          headers
        };
        if (body && method !== "GET") {
          fetchOptions.body = JSON.stringify(body);
        }
        if (isDebugMode() && body) {
          logger.debug("HTTP", `\u8BF7\u6C42\u53C2\u6570 / Request body: ${method} ${endpoint}`, body);
        }
        const startTime2 = Date.now();
        const response = await fetch(url.toString(), fetchOptions);
        const data = await response.json();
        const duration3 = Date.now() - startTime2;
        logger.request(method, url.toString(), data.code, duration3);
        if (isDebugMode()) {
          logger.debug("HTTP", `\u539F\u59CB\u54CD\u5E94 / Response data: ${endpoint}`, data);
        }
        if (data.code === 1600100 || data.code === 401) {
          throw new AuthExpiredError("Token expired. Please re-login via the login tool. / Token\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u8C03\u7528\u767B\u5F55\u5DE5\u5177\u3002");
        }
        return data;
      } catch (error2) {
        if (error2 instanceof AuthExpiredError) throw error2;
        if (attempt >= maxRetries) {
          logger.error("HTTP", `\u8BF7\u6C42\u5931\u8D25(\u5DF2\u91CD\u8BD5${maxRetries}\u6B21) / Request failed after ${maxRetries} retries: ${endpoint}`, {
            error: error2 instanceof Error ? error2.message : String(error2)
          });
          throw error2;
        }
        const delay = rateLimiter.getRetryDelay(attempt);
        logger.rateLimit(tier, "retrying", `attempt=${attempt + 1} delay=${delay}ms endpoint=${endpoint}`);
        await new Promise((resolve3) => setTimeout(resolve3, delay));
      }
    }
    throw new Error(`Request failed: ${endpoint}`);
  }
};
var AuthExpiredError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthExpiredError";
  }
};
var httpClient = new HttpClient();

// src/auth/api-key-context.ts
var import_node_async_hooks = require("node:async_hooks");
var apiKeyStorage = new import_node_async_hooks.AsyncLocalStorage();
function getContextApiKey() {
  return apiKeyStorage.getStore();
}
var directTokenStorage = new import_node_async_hooks.AsyncLocalStorage();
function getDirectTokenContext() {
  return directTokenStorage.getStore();
}

// src/auth/session.ts
var apiKeySessions = /* @__PURE__ */ new Map();
function cleanupExpiredApiKeySessions() {
  const now = /* @__PURE__ */ new Date();
  let count = 0;
  for (const [key, session] of apiKeySessions) {
    if (new Date(session.refreshTokenExpiry) < now) {
      apiKeySessions.delete(key);
      count++;
    }
  }
  return count;
}
var _cleanupTimer = setInterval(() => {
  const removed = cleanupExpiredApiKeySessions();
  if (removed > 0) {
    console.info(`[session] \u81EA\u52A8\u6E05\u7406\u8FC7\u671F apiKey session: \u79FB\u9664 ${removed} \u6761 / Auto-cleanup: removed ${removed} expired apiKey sessions`);
  }
}, 30 * 60 * 1e3).unref();
var tokenStore = TokenStore.getInstance();
var currentSession = null;
function getSession() {
  const directCtx = getDirectTokenContext();
  if (directCtx) {
    return {
      email: directCtx.userId,
      accessToken: directCtx.accessToken,
      accessTokenExpiry: new Date(Date.now() + 864e5).toISOString(),
      // 虚拟过期时间，实际由 API 响应决定
      refreshToken: "",
      refreshTokenExpiry: new Date(Date.now() + 864e5).toISOString(),
      openId: directCtx.userId
    };
  }
  const ctxApiKey = getContextApiKey();
  if (ctxApiKey !== void 0) {
    return apiKeySessions.get(ctxApiKey) ?? null;
  }
  if (currentSession) return currentSession;
  const stored = tokenStore.getToken();
  if (stored) {
    try {
      currentSession = JSON.parse(stored);
      return currentSession;
    } catch {
      return null;
    }
  }
  return null;
}
function getAccessToken() {
  const session = getSession();
  if (!session) return null;
  if (new Date(session.accessTokenExpiry) < /* @__PURE__ */ new Date()) {
    return null;
  }
  return session.accessToken;
}
function isSessionValid() {
  if (getDirectTokenContext()) return true;
  const session = getSession();
  if (!session) return false;
  return new Date(session.refreshTokenExpiry) > /* @__PURE__ */ new Date();
}
function setSessionDirect(data) {
  const session = { ...data };
  const ctxApiKey = getContextApiKey();
  if (ctxApiKey !== void 0) {
    apiKeySessions.set(ctxApiKey, session);
  } else {
    currentSession = session;
    tokenStore.setToken(JSON.stringify(session));
  }
  return session;
}
async function createSession(email2, apiKey, loginToken) {
  const response = await httpClient.request(ENDPOINTS.auth.getAccessToken, {
    body: { apiKey },
    tier: "auth",
    skipAuth: true
  });
  if (!response.result || !response.data) {
    throw new Error(`Failed to get access token: ${response.message}`);
  }
  const session = {
    email: email2,
    accessToken: response.data.accessToken,
    accessTokenExpiry: response.data.accessTokenExpiryDate,
    refreshToken: response.data.refreshToken,
    refreshTokenExpiry: response.data.refreshTokenExpiryDate,
    openId: String(response.data.openId),
    loginToken,
    apiKey
  };
  const ctxApiKey = getContextApiKey();
  if (ctxApiKey !== void 0) {
    apiKeySessions.set(ctxApiKey, session);
  } else {
    currentSession = session;
    tokenStore.setToken(JSON.stringify(session));
  }
  return session;
}
async function refreshSession() {
  const session = getSession();
  if (!session?.refreshToken) return false;
  if (new Date(session.refreshTokenExpiry) < /* @__PURE__ */ new Date()) {
    clearSession();
    return false;
  }
  try {
    const response = await httpClient.request(ENDPOINTS.auth.refreshAccessToken, {
      body: { refreshToken: session.refreshToken },
      tier: "auth",
      skipAuth: true
    });
    if (!response.result || !response.data) {
      clearSession();
      return false;
    }
    session.accessToken = response.data.accessToken;
    session.accessTokenExpiry = response.data.accessTokenExpiryDate;
    session.refreshToken = response.data.refreshToken;
    session.refreshTokenExpiry = response.data.refreshTokenExpiryDate;
    const ctxApiKey = getContextApiKey();
    if (ctxApiKey !== void 0) {
      apiKeySessions.set(ctxApiKey, session);
    } else {
      currentSession = session;
      tokenStore.setToken(JSON.stringify(session));
    }
    return true;
  } catch {
    clearSession();
    return false;
  }
}
function clearSession() {
  const ctxApiKey = getContextApiKey();
  if (ctxApiKey !== void 0) {
    apiKeySessions.delete(ctxApiKey);
  } else {
    currentSession = null;
    tokenStore.clearToken();
  }
}
async function ensureAccessToken() {
  const directCtx = getDirectTokenContext();
  if (directCtx) return directCtx.accessToken;
  const token = getAccessToken();
  if (token) return token;
  const refreshed = await refreshSession();
  if (refreshed) {
    return getAccessToken();
  }
  return null;
}

// src/mcp-server/tools/auth.tool.ts
function md5(str) {
  return (0, import_crypto2.createHash)("md5").update(str).digest("hex");
}
var waitForLoginInProgress = false;
var loginUriSeq = 0;
var authTools = [
  {
    name: "show_login_form",
    description: [
      "\u5C55\u793ACJ Dropshipping\u767B\u5F55\u5F15\u5BFC\u4FE1\u606F\uFF08\u4EC5\u8FD4\u56DE\u6587\u5B57\uFF0C\u4E0D\u5F39\u51FAUI\u7A97\u53E3\uFF09\u3002",
      '\u26A1 \u82E5\u901A\u8FC7 /mcp/{apiKey} URL \u914D\u7F6E\u63A5\u5165\uFF0C\u4F1A\u76F4\u63A5\u8FD4\u56DE"\u5DF2\u81EA\u52A8\u8BA4\u8BC1"\u72B6\u6001\uFF0C\u65E0\u9700\u767B\u5F55\u3002',
      "\u5982\u9700\u5F39\u51FA\u767B\u5F55\u754C\u9762\uFF08VS Code Copilot\uFF09\uFF0C\u8BF7\u76F4\u63A5\u4F7F\u7528 wait_for_login\u3002",
      "\u26A0\uFE0F Codex / \u547D\u4EE4\u884C / ChatGPT / \u65E0UI\u73AF\u5883\uFF1A\u8BF7\u6539\u7528 verify_credentials \u76F4\u63A5\u4F20\u5165\u90AE\u7BB1\u548C\u5BC6\u7801\u767B\u5F55\u3002",
      "Show login guidance text only (no UI popup).",
      "\u26A1 If connected via /mcp/{apiKey} URL, returns auto-authenticated status immediately.",
      "For VS Code Copilot with UI, use wait_for_login.",
      "\u26A0\uFE0F Codex/CLI/ChatGPT: use verify_credentials with email+password instead."
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "verify_credentials",
    description: "\u9A8C\u8BC1\u7528\u6237\u767B\u5F55\u51ED\u636E\u5E76\u5EFA\u7ACB\u4F1A\u8BDD\u3002\u652F\u6301\u4E24\u79CD\u65B9\u5F0F\uFF1A1) email/loginName+password \u524D\u7AEF\u767B\u5F55 2) apiKey \u76F4\u63A5\u83B7\u53D6OpenAPI token / Verify user credentials. Supports: 1) email/loginName+password frontend login 2) apiKey direct OpenAPI token exchange",
    inputSchema: {
      type: "object",
      properties: {
        loginName: { type: "string", description: "\u767B\u5F55\u90AE\u7BB1\u6216\u7528\u6237\u540D\uFF08\u63A8\u8350\uFF09/ Login email or username (recommended)" },
        email: { type: "string", description: "\u767B\u5F55\u90AE\u7BB1\uFF08\u517C\u5BB9\u65E7\u7248\uFF09/ Login email (legacy, use loginName instead)" },
        password: { type: "string", description: "\u767B\u5F55\u5BC6\u7801 / Login password" },
        apiKey: { type: "string", description: "(\u53EF\u9009) CJ OpenAPI Key\uFF0C\u63D0\u4F9B\u540E\u76F4\u63A5\u8D70 getAccessToken\uFF0C\u8DF3\u8FC7\u524D\u7AEF\u767B\u5F55 / (Optional) CJ OpenAPI Key, skips frontend login" }
      },
      required: []
    }
  },
  {
    name: "check_login_status",
    description: [
      "\u68C0\u67E5\u5F53\u524D\u767B\u5F55\u72B6\u6001\u548Ctoken\u6709\u6548\u671F\u3002",
      '\u26A1 \u901A\u8FC7 /mcp/{apiKey} URL \u914D\u7F6E\u63A5\u5165\u65F6\uFF0C\u4F1A\u663E\u793A"\u5DF2\u901A\u8FC7URL apiKey\u81EA\u52A8\u8BA4\u8BC1"\u3002',
      "Check current login status and token validity.",
      "\u26A1 When connected via /mcp/{apiKey} URL, shows auto-authenticated status."
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_rate_limit_status",
    description: "\u67E5\u770BAPI\u8C03\u7528QPS\u9650\u901F\u72B6\u6001 / View API call QPS rate limit status",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "logout",
    description: "\u767B\u51FA\u5F53\u524D\u8D26\u53F7\uFF0C\u6E05\u9664\u4F1A\u8BDD\u4FE1\u606F\uFF0C\u65B9\u4FBF\u5207\u6362\u5176\u4ED6\u8D26\u53F7\u91CD\u65B0\u767B\u5F55 / Logout current account, clear session, switch to another account",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "wait_for_login",
    description: [
      "\u5C55\u793A\u767B\u5F55 UI \u5E76\u8F6E\u8BE2\u7B49\u5F85\u7528\u6237\u5728 MCP Apps \u754C\u9762\u5B8C\u6210\u767B\u5F55\u3002",
      "\u63A8\u8350\u767B\u5F55\u6D41\u7A0B\uFF08\u652F\u6301 MCP Apps \u7684\u5BA2\u6237\u7AEF\u5982 VS Code Copilot\uFF09\uFF1A\u8C03\u7528\u6B64\u5DE5\u5177\uFF0C\u7528\u6237\u5728\u5F39\u51FA\u754C\u9762\u767B\u5F55\u540E\u81EA\u52A8\u7EE7\u7EED\u3002",
      '\u9ED8\u8BA4\u7B49\u5F85 30 \u79D2\uFF1B\u82E5\u8D85\u65F6\uFF0CAI \u5E94\u8BE2\u95EE"\u662F\u5426\u5DF2\u5B8C\u6210\u767B\u5F55"\uFF0C\u82E5\u662F\u5219\u8C03\u7528 check_login_status \u786E\u8BA4\uFF0C\u5426\u5219\u518D\u6B21\u8C03\u7528 wait_for_login\u3002',
      "\u26A0\uFE0F ChatGPT Web \u573A\u666F\uFF1AHTTP \u8FDE\u63A5\u8D85\u65F6\u9650\u5236\u8F83\u77ED\uFF0C\u8BF7\u4F7F\u7528\u9ED8\u8BA4 30 \u79D2\uFF0C\u8D85\u65F6\u540E\u8BA9\u7528\u6237\u544A\u77E5\u5DF2\u767B\u5F55\u518D\u8C03\u7528 check_login_status\u3002",
      "\u26A0\uFE0F Codex/CLI \u65E0 UI \u573A\u666F\uFF1A\u8BF7\u6539\u7528 verify_credentials \u76F4\u63A5\u63D0\u4F9B loginName + password\u3002",
      "Display login UI and poll until user logs in. Default timeout: 30s.",
      "On timeout: ask user if they completed login; if yes call check_login_status, otherwise call wait_for_login again.",
      "For Codex/CLI (no UI support): use verify_credentials with loginName + password instead."
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        timeout: {
          type: "number",
          description: "\u7B49\u5F85\u8D85\u65F6\u65F6\u95F4\uFF08\u79D2\uFF09\uFF0C\u9ED8\u8BA4 30 \u79D2\uFF0CHTTP \u4F20\u8F93\u6A21\u5F0F\u5EFA\u8BAE\u4E0D\u8D85\u8FC7 30 \u79D2 / Timeout in seconds, default 30. Keep \u226430s for HTTP transport (ChatGPT Web)"
        }
      },
      required: []
    }
    // _meta: {
    //   ui: {
    //     resourceUri: 'ui://cj-mcp/login',
    //   },
    // },
  }
];
var AUTH_LOGIN_UI_BASE = "ui://cj-mcp/login";
function getAuthTools() {
  const valid = isSessionValid();
  return authTools.map((tool) => {
    if (!valid && tool.name === "show_login_form") {
      const uniqueUri = `${AUTH_LOGIN_UI_BASE}?t=${Date.now()}_${++loginUriSeq}`;
      return {
        ...tool,
        _meta: {
          ui: {
            resourceUri: uniqueUri
          }
        }
      };
    }
    return tool;
  });
}
async function handleAuthTool(name, args) {
  switch (name) {
    case "show_login_form":
      {
        const ctxApiKey = getContextApiKey();
        const directCtx = getDirectTokenContext();
        if (directCtx) {
          return {
            content: [{
              type: "text",
              text: [
                `\u2705 \u5DF2\u901A\u8FC7 URL \u76F4\u63A5 Token \u8BA4\u8BC1\uFF0C\u65E0\u9700\u624B\u52A8\u767B\u5F55 / Auto-authenticated via URL token, no login required.`,
                ``,
                `\u{1F464} \u7528\u6237 / User: ${directCtx.userId}`,
                ``,
                `\u{1F680} \u53EF\u76F4\u63A5\u6267\u884C\u4EFB\u52A1\uFF0C\u4F8B\u5982\uFF1A\u67E5\u8BE2\u8BA2\u5355\u3001\u641C\u7D22\u5546\u54C1\u7B49\u3002`,
                `You can directly execute tasks such as: query orders, search products, etc.`,
                ``,
                `\u26A0\uFE0F \u6CE8\u610F\uFF1AToken \u8FC7\u671F\u540E\u9700\u66F4\u65B0 ChatGPT \u5E94\u7528 URL \u4E2D\u7684 token \u5185\u5BB9\u3002`,
                `Note: When token expires, update the token in your ChatGPT app URL.`
              ].join("\n")
            }]
          };
        }
        if (ctxApiKey && getSession()) {
          const session = getSession();
          const maskedKey = ctxApiKey.length > 12 ? `${ctxApiKey.slice(0, 12)}\u2026` : ctxApiKey;
          return {
            content: [{
              type: "text",
              text: [
                `\u2705 \u5DF2\u901A\u8FC7 URL ApiKey \u81EA\u52A8\u5B8C\u6210\u8BA4\u8BC1\uFF0C\u65E0\u9700\u624B\u52A8\u767B\u5F55 / Auto-authenticated via URL apiKey, no login required.`,
                ``,
                `\u{1F511} ApiKey: ${maskedKey}`,
                `\u{1F464} \u7528\u6237 / User: ${session.email}`,
                ``,
                `\u{1F680} \u53EF\u76F4\u63A5\u6267\u884C\u4EFB\u52A1\uFF0C\u4F8B\u5982\uFF1A\u67E5\u8BE2\u8BA2\u5355\u3001\u641C\u7D22\u5546\u54C1\u7B49\u3002`,
                `You can directly execute tasks such as: query orders, search products, etc.`
              ].join("\n")
            }]
          };
        }
      }
      return {
        content: [{
          type: "text",
          text: [
            "\u{1F510} \u767B\u5F55\u8868\u5355\u5DF2\u5C55\u793A / Login form displayed",
            "",
            "\u{1F4A1} \u63A8\u8350\uFF1A\u8C03\u7528 wait_for_login \u53EF\u81EA\u52A8\u7B49\u5F85\u7528\u6237\u5B8C\u6210\u767B\u5F55\u540E\u7EE7\u7EED\u4EFB\u52A1\uFF0C\u65E0\u9700\u624B\u52A8\u786E\u8BA4\u3002",
            "Tip: Call wait_for_login to automatically wait for user login before proceeding.",
            "",
            "\u82E5\u5DF2\u624B\u52A8\u767B\u5F55\uFF0C\u8BF7\u7EE7\u7EED\u53D1\u6D88\u606F\uFF0C\u6211\u5C06\u8C03\u7528 check_login_status \u786E\u8BA4\u540E\u7EE7\u7EED\u3002",
            "If already logged in, send any message and I will verify via check_login_status."
          ].join("\n")
        }]
      };
    case "verify_credentials":
      return await handleVerifyCredentials(args);
    case "check_login_status":
      return handleCheckLoginStatus();
    case "get_rate_limit_status":
      return handleRateLimitStatus();
    case "logout":
      return handleLogout();
    case "wait_for_login": {
      if (isSessionValid()) {
        const session = getSession();
        const user = session?.loginName || session?.email || "\u5DF2\u767B\u5F55";
        return {
          content: [{
            type: "text",
            text: [
              `\u2705 \u5DF2\u767B\u5F55\uFF0C\u65E0\u9700\u91CD\u590D\u767B\u5F55 / Already logged in`,
              `\u7528\u6237 / User: ${user}`
            ].join("\n")
          }]
        };
      }
      const immediateUi = process.env.CJ_UI_IMMEDIATE === "true" || args.wait === false;
      if (immediateUi) {
        return {
          content: [{
            type: "text",
            text: [
              "\u{1F510} \u8BF7\u5728\u4E0B\u65B9\u767B\u5F55\u754C\u9762\u8F93\u5165 CJ \u8D26\u53F7\u5BC6\u7801\u5B8C\u6210\u767B\u5F55\u3002",
              "\u767B\u5F55\u5B8C\u6210\u540E\u544A\u8BC9\u6211\uFF0C\u6211\u4F1A\u8C03\u7528 check_login_status \u786E\u8BA4\u5E76\u7EE7\u7EED\u3002",
              "",
              "Please log in using the form below.",
              "After login, let me know and I will call check_login_status to confirm."
            ].join("\n")
          }]
        };
      }
      if (waitForLoginInProgress) {
        return {
          content: [{
            type: "text",
            text: [
              "\u{1F504} \u767B\u5F55\u7B49\u5F85\u5DF2\u5728\u8FDB\u884C\u4E2D\uFF0C\u8BF7\u5728\u5DF2\u5F39\u51FA\u7684\u7A97\u53E3\u4E2D\u5B8C\u6210\u767B\u5F55\uFF0C\u5B8C\u6210\u540E\u544A\u77E5\u6211\u5373\u53EF\u3002",
              "Login wait is already in progress. Please complete login in the existing window, then let me know."
            ].join("\n")
          }]
        };
      }
      waitForLoginInProgress = true;
      try {
        const timeoutSec = args.timeout ?? 30;
        const timeoutMs = timeoutSec * 1e3;
        const pollIntervalMs = 2e3;
        const startTime2 = Date.now();
        while (Date.now() - startTime2 < timeoutMs) {
          if (isSessionValid()) {
            const session = getSession();
            const user = session?.loginName || session?.email || "\u5DF2\u767B\u5F55";
            return {
              content: [{
                type: "text",
                text: [
                  `\u2705 \u767B\u5F55\u6210\u529F\uFF0C\u7EE7\u7EED\u6267\u884C\u540E\u7EED\u4EFB\u52A1 / Login successful, proceeding`,
                  `\u7528\u6237 / User: ${user}`
                ].join("\n")
              }]
            };
          }
          await new Promise((resolve3) => setTimeout(resolve3, pollIntervalMs));
        }
        return {
          content: [{
            type: "text",
            text: [
              `\u23F0 \u7B49\u5F85\u767B\u5F55\u8D85\u65F6\uFF08${timeoutSec}\u79D2\uFF09/ Login wait timed out (${timeoutSec}s)`,
              "",
              "\u{1F4CB} \u540E\u7EED\u5904\u7406\u65B9\u5F0F / Next steps:",
              "1. \u5982\u679C\u60A8\u5DF2\u5728\u5F39\u51FA\u7A97\u53E3\u5B8C\u6210\u767B\u5F55\uFF0C\u8BF7\u544A\u8BC9\u6211\uFF0C\u6211\u4F1A\u8C03\u7528 check_login_status \u786E\u8BA4\u540E\u7EE7\u7EED\u3002",
              "   If you already logged in the popup, let me know and I will call check_login_status to confirm.",
              "2. \u5982\u679C\u5F39\u51FA\u7A97\u53E3\u672A\u51FA\u73B0\uFF08Codex/CLI \u73AF\u5883\uFF09\uFF0C\u8BF7\u4F7F\u7528 verify_credentials \u5DE5\u5177\u76F4\u63A5\u8F93\u5165\u90AE\u7BB1\u548C\u5BC6\u7801\u3002",
              "   If no popup appeared (Codex/CLI), use verify_credentials with loginName + password instead.",
              "3. \u5982\u9700\u91CD\u65B0\u7B49\u5F85\uFF0C\u53EF\u518D\u6B21\u8C03\u7528 wait_for_login\u3002",
              "   To wait again, call wait_for_login again."
            ].join("\n")
          }],
          isError: false
        };
      } finally {
        waitForLoginInProgress = false;
      }
    }
    default:
      return { content: [{ type: "text", text: `Unknown auth tool: ${name}` }], isError: true };
  }
}
async function fetchCsrfToken(loginApiBase) {
  try {
    const resp = await fetch(`${loginApiBase}/login.html`, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "follow"
    });
    const setCookies = resp.headers.getSetCookie?.() || [];
    const allCookies = [];
    let csrfToken = "";
    for (const sc of setCookies) {
      const nameVal = sc.split(";")[0];
      allCookies.push(nameVal);
      if (nameVal.startsWith("csrfToken=")) {
        csrfToken = nameVal.split("=")[1];
      }
    }
    return { csrfToken, cookies: allCookies.join("; ") };
  } catch {
    return { csrfToken: "", cookies: "" };
  }
}
async function handleVerifyCredentials(args) {
  const { loginName, email: email2, password, apiKey } = args;
  const effectiveLoginName = loginName || email2;
  if (apiKey) {
    try {
      const session = await createSession(effectiveLoginName || "apikey-user", apiKey);
      return {
        content: [{
          type: "text",
          text: `\u2705 API Key \u8BA4\u8BC1\u6210\u529F / API Key authentication successful!
OpenID: ${session.openId}
Token\u6709\u6548\u671F / Token expires: ${session.accessTokenExpiry}
RefreshToken\u6709\u6548\u671F / RefreshToken expires: ${session.refreshTokenExpiry}`
        }]
      };
    } catch (error2) {
      const msg = error2 instanceof Error ? error2.message : String(error2);
      return {
        content: [{ type: "text", text: `API Key \u8BA4\u8BC1\u5931\u8D25 / API Key authentication failed: ${msg}` }],
        isError: true
      };
    }
  }
  if (!effectiveLoginName || !password) {
    return {
      content: [{ type: "text", text: "\u8BF7\u63D0\u4F9B email/loginName+password \u6216 apiKey / Please provide email/loginName+password or apiKey" }],
      isError: true
    };
  }
  const config2 = getEnvConfig();
  try {
    const { csrfToken, cookies } = await fetchCsrfToken(config2.loginApiBase);
    const loginUrl = `${config2.loginApiBase}/userCenterForeignWeb/foreign/webLogin`;
    const timestamp = Date.now();
    const fingerToken = md5(String(timestamp) + effectiveLoginName);
    const encryptedPassword = md5(md5(password) + "" + fingerToken + String(timestamp));
    const loginResponse = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Connection": "keep-alive",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
        "Origin": config2.loginApiBase,
        "Referer": `${config2.loginApiBase}/login.html?type=quickly`,
        "Cookie": cookies || `csrfToken=${csrfToken}`,
        "platform": "2",
        "cj-area": "000000",
        "token": ""
      },
      body: JSON.stringify({
        loginName: effectiveLoginName,
        password: encryptedPassword,
        timestamp,
        newEncryptVersion: true,
        toUser: false,
        facebookId: "",
        googleId: "",
        appleId: "",
        fingerToken,
        mcpLogin: true
      })
    });
    const contentType = loginResponse.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const rawText = await loginResponse.text();
      throw new Error(
        `\u767B\u5F55API\u8FD4\u56DE\u975EJSON\u54CD\u5E94 (HTTP ${loginResponse.status}, Content-Type: ${contentType})\u3002
\u54CD\u5E94\u7247\u6BB5: ${rawText.substring(0, 200)}

\u6839\u56E0: CJ_ENV=${config2.env}\uFF0CloginApiBase=${config2.loginApiBase}
\u89E3\u51B3\u65B9\u6848: \u4F7F\u7528 CJ_ENV=production \u542F\u52A8\u670D\u52A1\u5668\uFF08\u751F\u4EA7\u57DF\u540D https://www.cjdropshipping.com\uFF09`
      );
    }
    const loginData = await loginResponse.json();
    if (!loginData.success || loginData.code !== 200) {
      const errorMessages = {
        300006: "\u8D26\u53F7\u6216\u5BC6\u7801\u9519\u8BEF / Incorrect account or password",
        300003: "\u8BE5\u90AE\u7BB1\u672A\u6CE8\u518C / This email has not been registered",
        300001: "\u8D26\u53F7\u5DF2\u88AB\u9501\u5B9A / Account has been locked",
        803: "mcpLogin \u6743\u9650\u672A\u5F00\u901A\uFF0C\u8BF7\u8054\u7CFB CJ \u5BA2\u670D\u5F00\u901A MCP \u767B\u5F55\u6743\u9650 / mcpLogin not authorized, please contact CJ support to enable MCP login"
      };
      const friendlyMsg = errorMessages[loginData.code] || loginData.message;
      return {
        content: [{ type: "text", text: [
          `\u767B\u5F55\u5931\u8D25 / Login failed: ${friendlyMsg} (code: ${loginData.code})`,
          "",
          "\u26A0\uFE0F \u8BF7\u52FF\u518D\u6B21\u8C03\u7528 wait_for_login \u6216 show_login_form\uFF08\u4F1A\u6253\u5F00\u989D\u5916\u7684\u767B\u5F55\u7A97\u53E3\uFF09\u3002",
          "\u8BF7\u76F4\u63A5\u5411\u7528\u6237\u8BE2\u95EE\u6B63\u786E\u7684\u8D26\u53F7\u5BC6\u7801\uFF0C\u7136\u540E\u518D\u6B21\u8C03\u7528 verify_credentials \u91CD\u8BD5\u3002",
          "Do NOT call wait_for_login or show_login_form again (would open another login window).",
          "Ask the user for correct credentials and call verify_credentials again."
        ].join("\n") }],
        isError: true
      };
    }
    const apiKey2 = loginData.data?.apiKey;
    const loginToken = loginData.data?.accessToken || loginData.data?.cjLoginToken || loginData.data?.token;
    const userEmail = loginData.data?.extra?.email || loginData.data?.email;
    const displayEmail = userEmail || effectiveLoginName;
    const tokenExpiry = loginData.data?.expireTime ? new Date(Number(loginData.data.expireTime)).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
    const openId = String(loginData.data?.id || "");
    if (!apiKey2) {
      if (loginToken) {
        const session2 = setSessionDirect({
          email: displayEmail,
          accessToken: loginToken,
          accessTokenExpiry: tokenExpiry,
          refreshToken: "",
          refreshTokenExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1e3).toISOString(),
          openId,
          loginToken
        });
        return {
          content: [{
            type: "text",
            text: `\u2705 \u767B\u5F55\u6210\u529F / Login successful!
\u7528\u6237 / User: ${displayEmail}
CJ\u53F7 / CJ Number: ${loginData.data?.num || "N/A"}
Token \u5DF2\u4FDD\u5B58\uFF0C\u53EF\u7528\u4E8E\u540E\u7EED OpenAPI \u63A5\u53E3\u8C03\u7528\u3002
Token saved, ready for OpenAPI calls.`
          }]
        };
      }
      const config22 = getEnvConfig();
      const apiKeyUrl = config22.env === "production" ? "https://www.cjdropshipping.com/myCJ.html#/apikey" : "http://www.cjdropshipping.offline.pre.com/myCJ.html#/apikey";
      return {
        content: [{
          type: "text",
          text: `\u26A0\uFE0F \u767B\u5F55\u6210\u529F\uFF0C\u4F46\u672A\u83B7\u53D6\u5230 token \u6216 API Key / Login succeeded, but no token or API Key found.
\u7528\u6237 / User: ${displayEmail}
CJ\u53F7 / CJ Number: ${loginData.data?.num || "N/A"}

\u8981\u4F7F\u7528 OpenAPI \u529F\u80FD\uFF08\u67E5\u8BE2\u8BA2\u5355\u3001\u641C\u7D22\u5546\u54C1\u7B49\uFF09\uFF0C\u8BF7\u5148\u5230 CJ \u540E\u53F0\u751F\u6210 API Key:
To use OpenAPI features (query orders, search products, etc.), please generate an API Key at:
${apiKeyUrl}

\u751F\u6210\u540E\u91CD\u65B0\u8C03\u7528 show_login_form \u767B\u5F55\u5373\u53EF / After generating, call show_login_form to login again.`
        }],
        isError: true
      };
    }
    const session = await createSession(effectiveLoginName, apiKey2, loginToken || void 0);
    return {
      content: [{
        type: "text",
        text: `\u2705 \u767B\u5F55\u6210\u529F / Login successful!
\u7528\u6237 / User: ${displayEmail}
OpenID: ${session.openId}
Token\u6709\u6548\u671F / Token expires: ${session.accessTokenExpiry}`
      }]
    };
  } catch (error2) {
    const msg = error2 instanceof Error ? error2.message : String(error2);
    return {
      content: [{ type: "text", text: `\u767B\u5F55\u5F02\u5E38 / Login error: ${msg}` }],
      isError: true
    };
  }
}
function handleCheckLoginStatus() {
  const directCtx = getDirectTokenContext();
  if (directCtx) {
    return {
      content: [{
        type: "text",
        text: [
          `\u2705 \u5DF2\u767B\u5F55\uFF08URL \u76F4\u63A5 Token \u6A21\u5F0F\uFF09/ Logged in (URL direct token mode)`,
          `\u7528\u6237 / User: ${directCtx.userId}`,
          `\u{1F511} \u8BA4\u8BC1\u65B9\u5F0F / Auth via: URL \u76F4\u63A5 Token / URL direct token (stateless, no server storage)`,
          `\u26A0\uFE0F \u6CE8\u610F\uFF1AToken \u8FC7\u671F\u540E\u9700\u66F4\u65B0 ChatGPT \u5E94\u7528 URL / Note: Update URL when token expires`
        ].join("\n")
      }]
    };
  }
  const session = getSession();
  const ctxApiKey = getContextApiKey();
  if (!session) {
    return {
      content: [{
        type: "text",
        text: "\u274C \u672A\u767B\u5F55\uFF0C\u8BF7\u4F7F\u7528 show_login_form \u8FDB\u884C\u767B\u5F55 / Not logged in. Please use show_login_form to login."
      }]
    };
  }
  const valid = isSessionValid();
  const accessExpiry = new Date(session.accessTokenExpiry);
  const now = /* @__PURE__ */ new Date();
  const authMethod = ctxApiKey ? `\u{1F511} \u8BA4\u8BC1\u65B9\u5F0F / Auth via: URL apiKey (${ctxApiKey.length > 12 ? ctxApiKey.slice(0, 12) + "\u2026" : ctxApiKey})` : `\u{1F511} \u8BA4\u8BC1\u65B9\u5F0F / Auth via: \u624B\u52A8\u767B\u5F55 / Manual login`;
  return {
    content: [{
      type: "text",
      text: valid ? `\u2705 \u5DF2\u767B\u5F55 / Logged in
\u7528\u6237 / User: ${session.email}
${authMethod}
AccessToken ${accessExpiry > now ? "\u6709\u6548" : "\u5DF2\u8FC7\u671F(\u53EF\u81EA\u52A8\u7EED\u671F)"} / ${accessExpiry > now ? "valid" : "expired (auto-refresh)"}
RefreshToken \u8FC7\u671F\u65F6\u95F4 / expires: ${session.refreshTokenExpiry}` : `\u26A0\uFE0F \u4F1A\u8BDD\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55 / Session expired. Please re-login.`
    }]
  };
}
function handleRateLimitStatus() {
  const status = rateLimiter.getStatus();
  const lines = [
    "\u{1F4CA} QPS \u9650\u901F\u72B6\u6001 / Rate Limit Status:",
    `  \u67E5\u8BE2/Read: ${status.tiers.read.available}/${status.tiers.read.max} (${status.tiers.read.refillRate}/s)`,
    `  \u5199\u5165/Write: ${status.tiers.write.available}/${status.tiers.write.max} (${status.tiers.write.refillRate}/s)`,
    `  \u8BA4\u8BC1/Auth: ${status.tiers.auth.available}/${status.tiers.auth.max} (${status.tiers.auth.refillRate}/s)`,
    `  \u5168\u5C40/Global: ${status.global.available}/${status.global.max} (${status.global.refillRate}/s)`,
    "",
    "\u{1F4C5} \u65E5\u914D\u989D / Daily Quota:",
    `  \u5DF2\u7528/Used: ${status.dailyQuota.used}/${status.dailyQuota.max} (\u5269\u4F59/remaining: ${status.dailyQuota.remaining})`,
    "",
    "\u{1F504} \u5E76\u53D1 / Concurrency:",
    `  \u6D3B\u8DC3/Active: ${status.concurrency.active}/${status.concurrency.max} (\u961F\u5217/queued: ${status.concurrency.queued})`,
    "",
    "\u{1F4BE} \u7F13\u5B58 / Cache:",
    `  \u6761\u76EE/Entries: ${status.cache.size} (TTL: ${status.cache.ttlMs / 1e3}s)`
  ];
  return { content: [{ type: "text", text: lines.join("\n") }] };
}
function handleLogout() {
  const session = getSession();
  const email2 = session?.email || "\u672A\u77E5\u7528\u6237";
  clearSession();
  return {
    content: [{
      type: "text",
      text: `\u2705 \u5DF2\u767B\u51FA\u8D26\u53F7: ${email2} / Logged out: ${email2}
\u53EF\u4F7F\u7528 show_login_form \u6216 verify_credentials \u91CD\u65B0\u767B\u5F55\u5176\u4ED6\u8D26\u53F7\u3002
You can use show_login_form or verify_credentials to login with another account.`
    }]
  };
}

// src/utils/product-href.ts
function urlQueryFormat(name, encode3 = true) {
  let url = String(name).toLocaleLowerCase();
  url = url.replace(/,/g, "");
  url = url.replace(/( )?&/g, "");
  url = url.replace(/'/g, "");
  url = url.replace(/\?/g, "");
  url = url.replace(/ /g, "-");
  return encode3 ? encodeURIComponent(url) : decodeURIComponent(url);
}
function getProductHref(id, name = "") {
  return `/product/${urlQueryFormat(name)}-p-${id}.html`;
}
function getProductUrl(baseUrl, id, name = "") {
  return `${baseUrl}${getProductHref(id, name)}`;
}

// src/mcp-server/resources/index.ts
var MCP_APP_HTML_MIME = "text/html;profile=mcp-app";
var CJ_MCP_UI_CSP = {
  resourceDomains: [
    "https://cf.cjdropshipping.com",
    "https://frontend.cjdropshipping.com",
    "https://www.cjdropshipping.com",
    "https://cjdropshipping.com",
    "https://*.cjdropshipping.com",
    // 测试环境静态资源 / login API
    "http://www.cjdropshipping.offline.pre.com",
    "http://*.cjdropshipping.offline.pre.com"
  ],
  connectDomains: [
    "https://www.cjdropshipping.com",
    "https://developers.cjdropshipping.com",
    "https://*.cjdropshipping.com",
    "http://www.cjdropshipping.offline.pre.com",
    "http://developers.cjdropshipping.offline.pre.com",
    "http://*.cjdropshipping.offline.pre.com"
  ]
};
var CJ_MCP_UI_META = { ui: { csp: CJ_MCP_UI_CSP } };
function buildMcpAppHtmlContent(uri, htmlContent) {
  return {
    uri,
    mimeType: MCP_APP_HTML_MIME,
    text: htmlContent,
    _meta: CJ_MCP_UI_META
  };
}
var cachedProductListData = null;
var cachedProductDetailData = null;
var cachedOrderListData = null;
var cachedOrderDetailData = null;
function setProductListCache(data) {
  cachedProductListData = data;
}
function setProductDetailCache(data) {
  cachedProductDetailData = data;
}
function setOrderListCache(data) {
  cachedOrderListData = data;
}
function setOrderDetailCache(data) {
  cachedOrderDetailData = data;
}
var resources = [
  {
    uri: "ui://cj-mcp/login",
    name: "CJ Login Form",
    description: "Interactive login form for CJ Dropshipping / CJ\u767B\u5F55\u9875\u9762",
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META
  },
  {
    uri: "ui://cj-mcp/product-list",
    name: "CJ Product List",
    description: "Interactive product list viewer. Use this to display search_products results in a visual card layout. / \u5546\u54C1\u5217\u8868\u5C55\u793A\u9875\u9762\uFF0C\u7528\u4E8E\u4EE5\u5361\u7247\u65B9\u5F0F\u53EF\u89C6\u5316\u5C55\u793A\u5546\u54C1\u641C\u7D22\u7ED3\u679C\u3002",
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META
  },
  {
    uri: "ui://cj-mcp/product-detail",
    name: "CJ Product Detail",
    description: "Interactive product detail viewer. Use this to display get_product_detail results with images, variants, and pricing. / \u5546\u54C1\u8BE6\u60C5\u5C55\u793A\u9875\u9762\uFF0C\u7528\u4E8E\u5C55\u793A\u5546\u54C1\u56FE\u7247\u3001\u89C4\u683C\u548C\u4EF7\u683C\u4FE1\u606F\u3002",
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META
  },
  {
    uri: "ui://cj-mcp/order-list",
    name: "CJ Order List",
    description: "Visual order list viewer. Displays order status, amounts, logistics and shipping info. / \u8BA2\u5355\u5217\u8868\u5C55\u793A\u9875\u9762\uFF0C\u4EE5\u5361\u7247\u65B9\u5F0F\u5C55\u793A\u8BA2\u5355\u72B6\u6001\u3001\u91D1\u989D\u3001\u7269\u6D41\u7B49\u4FE1\u606F\u3002",
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META
  },
  {
    uri: "ui://cj-mcp/order-detail",
    name: "CJ Order Detail",
    description: "Visual order detail viewer. Displays full order info: status, address, product list, logistics, amounts. / \u8BA2\u5355\u8BE6\u60C5\u5C55\u793A\u9875\u9762\uFF0C\u5C55\u793A\u8BA2\u5355\u72B6\u6001\u3001\u6536\u8D27\u5730\u5740\u3001\u5546\u54C1\u6E05\u5355\u3001\u7269\u6D41\u4FE1\u606F\u7B49\u5B8C\u6574\u8BE6\u60C5\u3002",
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META
  }
];
function registerResources() {
}
function getResourcesList() {
  return resources;
}
async function handleResourceRead(uri) {
  if (uri.startsWith("ui://cj-mcp/login")) {
    const htmlContent = readUiHtmlFile("login.html");
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }
  if (uri.startsWith("ui://cj-mcp/product-list")) {
    if (!cachedProductListData) {
      await fetchProductListFallback();
    }
    logger.debug(`[RESOURCE] product-list requested, cache=${cachedProductListData != null ? "HIT" : "MISS"}`);
    let htmlContent = readUiHtmlFile("product-list.html");
    if (cachedProductListData) {
      const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedProductListData)};</script>`;
      htmlContent = htmlContent.replace("</head>", `${initScript}
</head>`);
    }
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }
  if (uri.startsWith("ui://cj-mcp/product-detail")) {
    logger.debug(`[RESOURCE] product-detail requested, cache=${cachedProductDetailData != null ? "HIT" : "MISS"}`);
    let htmlContent = readUiHtmlFile("product-detail.html");
    if (cachedProductDetailData) {
      const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedProductDetailData)};</script>`;
      htmlContent = htmlContent.replace("</head>", `${initScript}
</head>`);
    }
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }
  if (uri.startsWith("ui://cj-mcp/order-detail")) {
    logger.debug(`[RESOURCE] order-detail requested, cache=${cachedOrderDetailData != null ? "HIT" : "MISS"}`);
    let htmlContent = readUiHtmlFile("order-detail.html");
    if (cachedOrderDetailData) {
      const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedOrderDetailData)};</script>`;
      htmlContent = htmlContent.replace("</head>", `${initScript}
</head>`);
    }
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }
  if (uri.startsWith("ui://cj-mcp/order-list")) {
    if (!cachedOrderListData) {
      await fetchOrderListFallback();
    }
    logger.debug(`[RESOURCE] order-list requested, cache=${cachedOrderListData != null ? "HIT" : "MISS"}`);
    let htmlContent = readUiHtmlFile("order-list.html");
    if (cachedOrderListData) {
      const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedOrderListData)};</script>`;
      htmlContent = htmlContent.replace("</head>", `${initScript}
</head>`);
    }
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }
  throw new Error(`Unknown resource: ${uri}`);
}
async function fetchProductListFallback() {
  const token = getAccessToken();
  if (!token) {
    logger.debug("[RESOURCE] product-list fallback: no auth token, skip auto-fetch");
    return;
  }
  try {
    logger.debug("[RESOURCE] product-list fallback: fetching from API...");
    const response = await httpClient.request(ENDPOINTS.product.listV2, {
      method: "GET",
      params: { page: "1", size: "20", isWarehouse: "true", startWarehouseInventory: "1" },
      tier: "read"
    });
    if (isApiSuccess(response) && response.data) {
      const config2 = getEnvConfig();
      const data = response.data;
      if (data && Array.isArray(data.content)) {
        data.content = data.content.map((contentItem) => {
          if (!Array.isArray(contentItem.productList)) return contentItem;
          return {
            ...contentItem,
            productList: contentItem.productList.map((item) => ({
              ...item,
              productUrl: getProductUrl(config2.webBase, String(item.id || ""), String(item.nameEn || ""))
            }))
          };
        });
      }
      cachedProductListData = response.data;
      logger.debug("[RESOURCE] product-list fallback: cache populated");
    }
  } catch (err) {
    logger.debug(`[RESOURCE] product-list fallback failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
async function fetchOrderListFallback() {
  const token = getAccessToken();
  if (!token) {
    logger.debug("[RESOURCE] order-list fallback: no auth token, skip auto-fetch");
    return;
  }
  try {
    logger.debug("[RESOURCE] order-list fallback: fetching from API...");
    const env = getEnvConfig();
    const urlParams = new URLSearchParams({ pageNum: "1", pageSize: "10" });
    const listUrl = `${env.openApiBase}${API_VERSION_PREFIX}${ENDPOINTS.shopping.listOrder}?${urlParams.toString()}`;
    const listResponse = await fetch(listUrl, {
      method: "GET",
      headers: {
        "CJ-Access-Token": token,
        "Content-Type": "application/json"
      }
    });
    const listData = await listResponse.json();
    if (listData.code === 200 && listData.data) {
      cachedOrderListData = listData.data;
      logger.debug("[RESOURCE] order-list fallback: cache populated");
    }
  } catch (err) {
    logger.debug(`[RESOURCE] order-list fallback failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// src/mcp-server/tools/product.tool.ts
setTokenGetter(() => getAccessToken());
var productTools = [
  {
    name: "search_products",
    description: '\u641C\u7D22CJ\u5E73\u53F0\u4E0A\u5DF2\u6709\u7684\u5546\u54C1\u76EE\u5F55\uFF0C\u652F\u6301\u5173\u952E\u8BCD\u3001\u5206\u7C7B\u3001\u4EF7\u683C\u3001\u56FD\u5BB6\u3001\u4ED3\u5E93\u7C7B\u578B\u7B49\u591A\u7EF4\u5EA6\u7B5B\u9009\u3002\n\u3010\u4E24\u6B65\u5C55\u793A\u6D41\u7A0B - \u5FC5\u987B\u6309\u987A\u5E8F\u6267\u884C\u3011\n  \u7B2C1\u6B65\uFF1A\u5148\u8C03\u7528\u672C\u5DE5\u5177 search_products \u83B7\u53D6\u6700\u65B0\u6570\u636E\n  \u7B2C2\u6B65\uFF1A\u518D\u8C03\u7528 show_product_list \u6253\u5F00\u53EF\u89C6\u5316\u5361\u7247\u754C\u9762\uFF08\u6570\u636E\u5DF2\u7F13\u5B58\uFF09\n\u26A0\uFE0F \u672C\u5DE5\u5177\u4EC5\u83B7\u53D6\u6570\u636E\uFF0C\u4E0D\u6E32\u67D3 UI\uFF1BUI \u6E32\u67D3\u7531 show_product_list \u72EC\u7ACB\u5B8C\u6210\u3002\n\u26A0\uFE0F \u4E0D\u8981\u5C1D\u8BD5\u5728\u672C\u5DE5\u5177\u7684\u8FD4\u56DE\u7ED3\u679C\u4E2D\u6CE8\u5165 _meta.ui\uFF0C\u90A3\u6837\u4F1A\u5BFC\u81F4 UI \u5728\u6570\u636E\u5230\u8FBE\u524D\u5C31\u6E32\u67D3\uFF08\u65E7\u6570\u636E\uFF09\u3002\n\u3010\u610F\u56FE\u6620\u5C04\u89C4\u5219\u3011\n- \u7528\u6237\u8BF4\u300C\u5168\u7403\u4ED3\u5546\u54C1\u300D\u300C\u7F8E\u56FD\u4ED3\u5546\u54C1\u300D\u300C\u7F8E\u56FD\u4ED3\u300D\u300CUS\u4ED3\u300D\u2192 isWarehouse=true, countryCode=US\n- \u7528\u6237\u8BF4\u300C\u4E2D\u56FD\u4ED3\u5546\u54C1\u300D\u300CCN\u4ED3\u5546\u54C1\u300D\u2192 isWarehouse=true, countryCode=CN\n- \u7528\u6237\u8BF4\u300C\u5168\u7403\u4ED3\u300D\u4E0D\u6307\u5B9A\u56FD\u5BB6 \u2192 isWarehouse=true\n- \u7528\u6237\u8BF4\u300C\u627E\u624B\u673A\u58F3\u300D\u300C\u641C\u4E00\u4E0B\u9F20\u6807\u300D\u2192 keyword=\u5BF9\u5E94\u5173\u952E\u8BCD\uFF08\u652F\u6301\u4E2D\u82F1\u6587\uFF09\n- \u7528\u6237\u8BF4\u300C50\u7F8E\u5143\u4EE5\u5185\u7684XX\u300D\u2192 keyword=XX, maxPrice=50\n- \u7528\u6237\u8BF4\u300C\u514D\u8D39\u914D\u9001\u300D\u300C\u5305\u90AE\u300D\u2192 addMarkStatus=1\n- \u7528\u6237\u8BF4\u300C\u6309\u4EF7\u683C\u4ECE\u4F4E\u5230\u9AD8\u300D\u2192 orderBy=2, sort=asc\n- \u7528\u6237\u8BF4\u300C\u7ED9\u6211\u770B\u66F4\u591A\u300D\u300C\u4E0B\u4E00\u9875\u300D\u2192 pageNum \u9012\u589E\n- \u7528\u6237\u8BF4\u300C\u524DN\u6761\u300D\u300CN\u6761\u6570\u636E\u300D\u300CN\u4E2A\u5546\u54C1\u300D\u2192 pageSize=N\uFF08\u672A\u6307\u5B9A\u65F6\u9ED8\u8BA4 pageSize=20\uFF09\n- \u7528\u6237\u8BF4\u300C\u6211\u81EA\u5DF1\u7684\u5907\u8D27\u300D\u300C\u6211\u7684\u79C1\u6709\u5E93\u5B58\u300D\u300C\u6211\u5165\u5E93\u7684\u5546\u54C1\u300D\u2192 \u4F7F\u7528 query_private_inventory\n\u26A0\uFE0F\u3010\u641C\u54C1 vs \u641C\u7D22\u5546\u54C1 \u533A\u5206\u3011\n- \u6B64\u5DE5\u5177\u4EC5\u641C\u7D22 CJ \u5E73\u53F0**\u73B0\u6709\u5546\u54C1\u76EE\u5F55**\u4E2D\u7684\u5546\u54C1\n- \u82E5\u7528\u6237\u8BF4\u300C\u5E2E\u6211\u641C\u54C1\u300D\u300C\u6211\u60F3\u8BA9CJ\u5E2E\u6211\u627E\u8D27\u6E90\u300D\u300C\u63D0\u4EA4\u641C\u54C1\u9700\u6C42\u300D\u300C\u8FD9\u4E2A\u5546\u54C1CJ\u6709\u6CA1\u6709\u4EE3\u53D1\u300D\u300C\u6211\u57281688/\u901F\u5356\u901A/\u963F\u91CC\u770B\u5230\u4E00\u4E2A\u5546\u54C1\uFF0C\u5E2E\u6211\u627E\u300D\u2192 \u4F7F\u7528 create_sourcing\uFF08\u4E0D\u662F\u6B64\u5DE5\u5177\uFF09\n\u3010Two-step display - MUST call in order\u3011\n  Step1: Call this tool (search_products) to fetch data\n  Step2: Call show_product_list to render the visual card UI (data already cached)\n\u26A0\uFE0F This tool fetches data ONLY; UI rendering is done by show_product_list separately.\nSearch EXISTING products in CJ catalog.\n[Intent mapping] "US warehouse" \u2192 isWarehouse=true, countryCode=US;\n"my own stock/private inventory" \u2192 use query_private_inventory instead.\n[NOT for] "sourcing request" / "find product not on CJ" / "I found this on 1688, can CJ source it?" \u2192 use create_sourcing.',
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "\u641C\u7D22\u5173\u952E\u8BCD\uFF08\u5546\u54C1\u540D/SKU/\u63CF\u8FF0\uFF09/ Search keyword (product name/SKU/description)"
        },
        categoryId: {
          type: "string",
          description: "\u5206\u7C7BID\uFF0C\u53EF\u901A\u8FC7 get_category_tree \u83B7\u53D6 / Category ID from get_category_tree"
        },
        countryCode: {
          type: "string",
          description: "\u56FD\u5BB6\u4EE3\u7801\uFF0C\u7528\u4E8E\u8FC7\u6EE4\u6307\u5B9A\u56FD\u5BB6\u6709\u5E93\u5B58\u7684\u5546\u54C1\uFF0C\u5982 US/CN/GB/DE/FR \u7B49\u3002\n\u4F8B\uFF1A\u7F8E\u56FD\u4ED3 \u2192 countryCode=US\uFF1B\u4E2D\u56FD\u4ED3 \u2192 countryCode=CN / Country code to filter products with inventory in that country. e.g. US, CN, GB. US warehouse \u2192 US."
        },
        isWarehouse: {
          type: "boolean",
          description: "\u662F\u5426\u67E5\u8BE2\u5168\u7403\u4ED3\u5546\u54C1\u3002true=\u53EA\u67E5\u5168\u7403\u4ED3\u5546\u54C1\uFF0Cfalse/\u4E0D\u4F20=\u5168\u90E8\u5546\u54C1 / Filter global warehouse products. true=global warehouse only. Use with countryCode for specific country."
        },
        minPrice: {
          type: "number",
          description: "\u6700\u4F4E\u4EF7\u683C(USD) / Minimum price in USD"
        },
        maxPrice: {
          type: "number",
          description: "\u6700\u9AD8\u4EF7\u683C(USD) / Maximum price in USD"
        },
        addMarkStatus: {
          type: "number",
          description: "\u5305\u90AE\u7B5B\u9009\uFF1A0-\u4E0D\u5305\u90AE\uFF0C1-\u5305\u90AE / Free shipping filter: 0-not free, 1-free shipping"
        },
        productType: {
          type: "string",
          description: "\u5546\u54C1\u7C7B\u578B\uFF08listV2 API \u4F7F\u7528\u5B57\u7B26\u4E32\u683C\u5F0F\uFF09\uFF1AORDINARY_PRODUCT-\u666E\u901A\u5546\u54C1\uFF0CSUPPLIER_PRODUCT-\u4F9B\u5E94\u5546\u5546\u54C1 / Product type: ORDINARY_PRODUCT (regular), SUPPLIER_PRODUCT (supplier)"
        },
        productFlag: {
          type: "number",
          description: "\u5546\u54C1\u6807\u7B7E\uFF1A0-\u70ED\u5356\uFF0C1-\u65B0\u54C1\uFF0C2-\u89C6\u9891\uFF0C3-\u6EDE\u9500 / Product flag: 0-Trending, 1-New, 2-Video, 3-Slow-moving"
        },
        sort: {
          type: "string",
          description: "\u6392\u5E8F\u65B9\u5411\uFF1Adesc-\u964D\u5E8F\uFF08\u9ED8\u8BA4\uFF09\uFF0Casc-\u5347\u5E8F / Sort direction: desc(default), asc"
        },
        orderBy: {
          type: "number",
          description: "\u6392\u5E8F\u5B57\u6BB5\uFF1A0-\u6700\u4F73\u5339\u914D\uFF08\u9ED8\u8BA4\uFF09\uFF0C1-\u520A\u767B\u6570\uFF0C2-\u4EF7\u683C\uFF0C3-\u521B\u5EFA\u65F6\u95F4\uFF0C4-\u5E93\u5B58 / Sort field: 0-Best match, 1-Listed count, 2-Price, 3-Create time, 4-Inventory"
        },
        pageNum: {
          type: "number",
          description: "\u9875\u7801\uFF0C\u9ED8\u8BA41 / Page number, default 1"
        },
        pageSize: {
          type: "number",
          description: "\u6BCF\u9875\u6570\u91CF\uFF0C\u9ED8\u8BA420\uFF0C\u6700\u5927100 / Page size, default 20, max 100"
        },
        startWarehouseInventory: {
          type: "number",
          description: '\u8D77\u59CB\u5E93\u5B58\u4E0B\u9650\uFF08\u22651\uFF09\uFF0C\u9ED8\u8BA4\u4E3A1\uFF0C\u53EA\u641C\u7D22\u6709\u5E93\u5B58\u7684\u5546\u54C1\u3002\n\u7528\u6237\u8BF4\u300C\u5E93\u5B58\u5927\u4E8EN\u300D\u300C\u5E93\u5B58\u81F3\u5C11N\u4EF6\u300D\u300C\u5E93\u5B58\u4E0D\u4F4E\u4E8EN\u300D\u2192 \u4F20\u5165\u5BF9\u5E94\u6570\u503C\uFF08\u6700\u5C0F\u4E3A1\uFF09\u3002\nMinimum warehouse inventory (\u22651), default 1. Only returns products with stock. User: "stock > N" / "at least N in stock" \u2192 pass N (min 1).'
        },
        lv2categoryList: {
          type: "array",
          items: { type: "string" },
          description: "\u4E8C\u7EA7\u7C7B\u76EEID\u5217\u8868\uFF0C\u7528\u4E8E\u7CBE\u786E\u7B5B\u9009 / List of second-level category IDs for precise filtering"
        },
        lv3categoryList: {
          type: "array",
          items: { type: "string" },
          description: "\u4E09\u7EA7\u7C7B\u76EEID\u5217\u8868 / List of third-level category IDs"
        },
        features: {
          type: "array",
          items: { type: "string" },
          description: "\u9644\u52A0\u7279\u6027\uFF0C\u7528\u4E8E\u63A7\u5236\u8FD4\u56DE\u6570\u636E\u8303\u56F4\u3002\u53EF\u9009\u503C\uFF1A\n  enable_description \u2014 \u8FD4\u56DE\u5546\u54C1\u8BE6\u60C5\n  enable_category \u2014 \u8FD4\u56DE\u5546\u54C1\u7C7B\u76EE\u4FE1\u606F\n  enable_combine \u2014 \u8FD4\u56DE\u7EC4\u5408\u5546\u54C1\u4FE1\u606F\n  enable_video \u2014 \u8FD4\u56DE\u89C6\u9891ID\nExtra features: enable_description, enable_category, enable_combine, enable_video"
        },
        zonePlatform: {
          type: "string",
          description: "\u4E13\u533A\u5E73\u53F0\uFF0C\u7528\u4E8E\u7B5B\u9009\u9002\u5408\u7279\u5B9A\u7535\u5546\u5E73\u53F0\u7684\u5546\u54C1\u3002\u53EF\u9009\u503C\uFF1A\n  shopify / ebay / amazon / tiktok / etsy / walmart \u7B49\nPlatform filter: shopify, ebay, amazon, tiktok, etsy, walmart, etc."
        },
        supplierId: {
          type: "string",
          description: "\u4F9B\u5E94\u5546ID\uFF0C\u7B5B\u9009\u6307\u5B9A\u4F9B\u5E94\u5546\u7684\u5546\u54C1 / Supplier ID to filter products by supplier"
        },
        isSelfPickup: {
          type: "number",
          description: "\u662F\u5426\u652F\u6301\u81EA\u63D0\uFF1A0-\u4E0D\u652F\u6301\uFF0C1-\u652F\u6301 / Self pickup: 0-no, 1-yes"
        },
        hasCertification: {
          type: "number",
          description: "\u662F\u5426\u8D44\u8D28\u8BA4\u8BC1\uFF1A0-\u65E0\uFF0C1-\u6709 / Certification: 0-no, 1-yes"
        },
        timeStart: {
          type: "string",
          description: "\u4E0A\u67B6\u65F6\u95F4\u8D77\u59CB\uFF08\u65F6\u95F4\u6233\u6BEB\u79D2\uFF09\uFF0C\u7B5B\u9009\u5728\u6B64\u4E4B\u540E\u4E0A\u67B6\u7684\u5546\u54C1 / Start time for listing date (ms timestamp)"
        },
        timeEnd: {
          type: "string",
          description: "\u4E0A\u67B6\u65F6\u95F4\u622A\u6B62\uFF08\u65F6\u95F4\u6233\u6BEB\u79D2\uFF09\uFF0C\u7B5B\u9009\u5728\u6B64\u4E4B\u524D\u4E0A\u67B6\u7684\u5546\u54C1 / End time for listing date (ms timestamp)"
        },
        endWarehouseInventory: {
          type: "number",
          description: "\u7ED3\u675F\u5E93\u5B58\u4E0A\u9650\uFF0C\u7B5B\u9009\u5E93\u5B58\u6570\u91CF\u5C0F\u4E8E\u7B49\u4E8E\u8BE5\u503C\u7684\u5546\u54C1\u3002\n\u7528\u6237\u8BF4\u300C\u5E93\u5B58\u4E0D\u8D85\u8FC7N\u300D\u300C\u6700\u591AN\u4EF6\u300D\u2192 \u914D\u5408 startWarehouseInventory \u4E00\u8D77\u4F7F\u7528\u3002\nEnd warehouse inventory (\u2264N). Use with startWarehouseInventory for range."
        },
        verifiedWarehouse: {
          type: "number",
          description: "\u9A8C\u8BC1\u5E93\u5B58\u7C7B\u578B\u7B5B\u9009\uFF1A0/\u4E0D\u4F20=\u5168\u90E8\uFF0C1=\u5DF2\u9A8C\u8BC1\u5E93\u5B58\uFF0C2=\u5F85\u9A8C\u8BC1\u5E93\u5B58 / Verified warehouse filter: 0/all(default), 1=verified, 2=pending verification"
        },
        customization: {
          type: "number",
          description: "\u662F\u5426\u5B9A\u5236\u5546\u54C1\uFF1A0-\u5426\uFF0C1-\u662F / Customization: 0-no, 1-yes"
        }
      },
      required: []
    }
  },
  {
    name: "get_category_tree",
    description: "\u83B7\u53D6CJ\u5546\u54C1\u5206\u7C7B\u6811\uFF0C\u7528\u4E8E\u7B5B\u9009\u641C\u7D22\u8303\u56F4\u3002\u4E00\u7EA7\u5206\u7C7B\u5982\u670D\u88C5\u3001\u7535\u5B50\u3001\u5BB6\u5C45\u7B49 / Get CJ product category tree for filtering. Top categories: Clothing, Electronics, Home, etc.",
    inputSchema: {
      type: "object",
      properties: {
        parentId: {
          type: "string",
          description: "\u7236\u5206\u7C7BID\uFF0C\u4E0D\u4F20\u8FD4\u56DE\u9876\u7EA7\u5206\u7C7B / Parent category ID, omit for top-level categories"
        }
      },
      required: []
    }
  },
  {
    name: "get_warehouses",
    description: "\u3010\u4EC5\u7528\u4E8E\u3011\u83B7\u53D6CJ\u5168\u7403\u4ED3\u5E93\u533A\u57DF\u5217\u8868\uFF08\u56FD\u5BB6\u7EF4\u5EA6\uFF1AUS/CN/DE/GB/PL\u7B49\uFF09\uFF0C\u542B\u5404\u533A\u57DF warehouseId\uFF0C\u4E3B\u8981\u7528\u4E8E\u8FC7\u6EE4 query_private_inventory \u7684\u4ED3\u5E93\u7EF4\u5EA6\u3002\n\u26A0\uFE0F\u3010\u4E25\u683C\u610F\u56FE\u533A\u5206\u3011\n  - \u7528\u6237\u8BF4\u300CCJ\u6709\u54EA\u4E9B\u4ED3\u5E93\u300D\u300C\u5168\u7403\u4ED3\u6709\u54EA\u4E9B\u300D\u300C\u7F8E\u56FD/\u4E2D\u56FD/\u5FB7\u56FD\u4ED3\u7684ID\u662F\u591A\u5C11\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n  - \u7528\u6237\u8BF4\u300C\u67E5\u770B\u67D0\u4E2A\u4ED3\u5E93\u7684\u8BE6\u60C5/\u5730\u5740/\u652F\u6301\u7269\u6D41\u300D\u2192 \u4F7F\u7528 get_storage_info\uFF08\u9700\u8981 storageId UUID\uFF09\n  - \u7528\u6237\u8BF4\u300C\u67D0\u4E2A\u8BA2\u5355\u5728\u54EA\u4E2A\u4ED3\u5E93\u300D\u300C\u8FD9\u4E2A\u8BA2\u5355\u7684\u4ED3\u5E93\u4FE1\u606F\u300D\u2192 \u5148\u8C03\u7528 get_order_detail \u83B7\u53D6 storageId\uFF0C\u518D\u8C03 get_storage_info\n\u26A0\uFE0F \u6B64\u5DE5\u5177\u8FD4\u56DE\u7684 id \u5B57\u6BB5\u662F\u533A\u57DF\u6807\u8BC6\uFF0C\u4E0D\u662F\u4ED3\u5E93UUID\uFF0C\u4E0D\u53EF\u76F4\u63A5\u7528\u4E8E get_storage_info\u3002\n\nGet CJ global warehouse REGION list (country level: US/CN/DE/GB...) with warehouseId for inventory filtering.\n[NOT for] getting warehouse address/details \u2014 use get_storage_info with a UUID storageId for that.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_product_detail",
    description: '\u67E5\u8BE2CJ\u5355\u4E2A\u5546\u54C1\u7684\u5B8C\u6574\u8BE6\u60C5\uFF0C\u5305\u62EC\u5546\u54C1\u540D\u79F0\u3001\u56FE\u7247\u3001\u4EF7\u683C\u3001\u53D8\u4F53(\u989C\u8272/\u5C3A\u7801)\u3001\u5E93\u5B58\u3001\u63CF\u8FF0\u3001\u7269\u6D41\u5C5E\u6027\u7B49\u3002\n\u3010\u4E24\u6B65\u5C55\u793A\u6D41\u7A0B - \u5FC5\u987B\u6309\u987A\u5E8F\u6267\u884C\u3011\n  \u7B2C1\u6B65\uFF1A\u5148\u8C03\u7528\u672C\u5DE5\u5177 get_product_detail \u83B7\u53D6\u6700\u65B0\u6570\u636E\n  \u7B2C2\u6B65\uFF1A\u518D\u8C03\u7528 show_product_detail(pid) \u6253\u5F00\u53EF\u89C6\u5316\u8BE6\u60C5\u754C\u9762\uFF08\u6570\u636E\u5DF2\u7F13\u5B58\uFF09\n\u26A0\uFE0F \u672C\u5DE5\u5177\u4EC5\u83B7\u53D6\u6570\u636E\uFF0C\u4E0D\u6E32\u67D3 UI\uFF1BUI \u6E32\u67D3\u7531 show_product_detail(pid) \u72EC\u7ACB\u5B8C\u6210\u3002\n\u26A0\uFE0F \u4E0D\u8981\u5C1D\u8BD5\u5728\u672C\u5DE5\u5177\u7684\u8FD4\u56DE\u7ED3\u679C\u4E2D\u6CE8\u5165 _meta.ui\uFF0C\u90A3\u6837\u4F1A\u5BFC\u81F4 UI \u5728\u6570\u636E\u5230\u8FBE\u524D\u5C31\u6E32\u67D3\uFF08\u65E7\u6570\u636E\uFF09\u3002\n\u3010\u610F\u56FE\u6620\u5C04\u3011\n- \u7528\u6237\u8BF4\u300C\u8FD9\u4E2A\u5546\u54C1\u7684\u8BE6\u60C5\u300D\u300C\u5546\u54C1\u8BE6\u7EC6\u4FE1\u606F\u300D\u300C\u67E5\u4E00\u4E0B\u8FD9\u4E2A\u5546\u54C1\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n- \u7528\u6237\u8BF4\u300C\u8FD9\u4E2A pid/SKU \u7684\u5546\u54C1\u300D\u2192 \u4F20\u5165 pid \u6216 productSku\n- \u7528\u6237\u8BF4\u300C\u7F8E\u56FD\u4ED3\u6709\u591A\u5C11\u5E93\u5B58\u300D\u2192 countryCode=US\n- pid/productSku/variantSku \u4E09\u9009\u4E00\u5FC5\u4F20 / One of pid/productSku/variantSku is required.\n\u3010Two-step display - MUST call in order\u3011\n  Step1: Call this tool (get_product_detail) to fetch data\n  Step2: Call show_product_detail(pid) to render the visual detail UI (data already cached)\n\u26A0\uFE0F This tool fetches data ONLY; UI rendering is done by show_product_detail(pid) separately.\nGet full product details: name, images, price, variants(color/size), inventory, description, logistics.\n[Intent mapping] "product detail" / "\u67E5\u8FD9\u4E2A\u5546\u54C1" / "show product info" \u2192 use this tool with pid or productSku.',
    inputSchema: {
      type: "object",
      properties: {
        pid: {
          type: "string",
          description: "\u5546\u54C1ID\uFF08\u4ECE\u641C\u7D22\u7ED3\u679C\u4E2D\u83B7\u53D6\uFF09/ Product ID (from search results)"
        },
        productSku: {
          type: "string",
          description: "\u5546\u54C1SPU\u7F16\u7801\uFF0C\u5982 CJJJJTJT05843 / Product SPU code"
        },
        variantSku: {
          type: "string",
          description: "\u53D8\u4F53SKU\u7F16\u7801\uFF0C\u5982 CJJJJTJT05843-Black / Variant SKU code"
        },
        countryCode: {
          type: "string",
          description: "\u56FD\u5BB6\u4EE3\u7801\uFF0C\u53EA\u8FD4\u56DE\u8BE5\u56FD\u6709\u5E93\u5B58\u7684\u53D8\u4F53\uFF0C\u5982 US/CN/GB / Country code to filter variants with inventory in that country"
        },
        features: {
          type: "string",
          description: "\u9644\u52A0\u529F\u80FD\uFF0C\u591A\u4E2A\u7528\u9017\u53F7\u5206\u9694\uFF1Aenable_combine\uFF08\u542B\u7EC4\u5408\u53D8\u4F53\uFF09\uFF0Cenable_video\uFF08\u542B\u89C6\u9891\uFF09/ Extra features (comma-separated): enable_combine, enable_video"
        }
      },
      required: []
    }
  },
  {
    name: "query_cj_inventory",
    description: [
      "\u67E5\u8BE2 CJ \u5E73\u53F0\u516C\u5F00\u5546\u54C1\u5E93\u5B58\uFF08\u975E\u79C1\u6709\u5907\u8D27\u5E93\u5B58\uFF09\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u8FD9\u4E2A\u5546\u54C1CJ\u6709\u591A\u5C11\u5E93\u5B58\u300D\u300CSKU CJXXX \u8FD8\u6709\u591A\u5C11\u8D27\u300D\u300C\u67E5\u4E00\u4E0B\u67D0\u4E2A\u53D8\u4F53\u7684CJ\u5E93\u5B58\u300D\u3002",
      "\u26A0\uFE0F \u5982\u679C\u67E5\u8BE2\u81EA\u5DF1\u5907\u8D27\u7684\u79C1\u6709\u5E93\u5B58\u8BF7\u4F7F\u7528 query_private_inventory\u3002",
      "\u652F\u6301\u4E09\u79CD\u67E5\u8BE2\u65B9\u5F0F\uFF08\u4E09\u9009\u4E00\uFF09\uFF1Avid\uFF08\u53D8\u4F53ID\uFF09/ sku\uFF08\u53D8\u4F53SKU\u6216SPU\uFF09/ pid\uFF08\u5546\u54C1ID\uFF09\u3002",
      "\u8FD4\u56DE\u5404\u4ED3\u5E93\u7684\u5E93\u5B58\u6570\u91CF\uFF08totalInventoryNum / cjInventoryNum / factoryInventoryNum\uFF09\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        vid: { type: "string", description: "\u53D8\u4F53ID\uFF08vid\uFF09\uFF0C\u4E0E sku/pid \u4E09\u9009\u4E00 / Variant ID" },
        sku: { type: "string", description: "\u53D8\u4F53SKU\u6216SPU\u7F16\u7801\uFF0C\u4E0E vid/pid \u4E09\u9009\u4E00 / Variant SKU or SPU code" },
        pid: { type: "string", description: "\u5546\u54C1ID\uFF08pid\uFF09\uFF0C\u4E0E vid/sku \u4E09\u9009\u4E00 / Product ID" }
      },
      required: []
    }
  },
  {
    name: "get_my_products",
    description: [
      "\u67E5\u8BE2\u6211\u7684\u9009\u54C1\u5217\u8868\uFF08\u5DF2\u6DFB\u52A0\u5230\u6211\u7684\u5546\u54C1\u7684\u4EA7\u54C1\uFF09\uFF0C\u652F\u6301\u5173\u952E\u8BCD\u641C\u7D22\u548C\u65F6\u95F4\u7B5B\u9009\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u6211\u4FDD\u5B58\u7684\u5546\u54C1\u300D\u300C\u6211\u7684\u9009\u54C1\u5217\u8868\u300D\u300C\u67E5\u4E00\u4E0B\u6211\u6536\u85CF\u7684\u5546\u54C1\u300D\u300CisListed=1 \u5DF2\u520A\u767B\u7684\u5546\u54C1\u300D\u3002",
      "\u26A0\uFE0F \u4E0E search_products \u4E0D\u540C\uFF1A\u6B64\u5DE5\u5177\u8FD4\u56DE\u7528\u6237\u4E3B\u52A8\u6DFB\u52A0\u8FC7\u7684\u5546\u54C1\uFF0C\u4E0D\u662F\u5168\u91CF\u641C\u7D22\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        keyword: { type: "string", description: "SKU/SPU/\u5546\u54C1\u540D\u641C\u7D22\u8BCD / Keyword: SKU, SPU, or product name" },
        categoryId: { type: "string", description: "\u54C1\u7C7BID / Category ID" },
        startAt: { type: "string", description: "\u6DFB\u52A0\u65F6\u95F4\u8D77\u59CB\uFF08ISO\u6216\u65F6\u95F4\u6233\uFF09/ Start time for when product was added" },
        endAt: { type: "string", description: "\u6DFB\u52A0\u65F6\u95F4\u622A\u6B62 / End time" },
        isListed: { type: "number", description: "\u662F\u5426\u5DF2\u520A\u767B 0/1 / Is listed: 0=no, 1=yes" },
        visiable: { type: "number", description: "\u662F\u5426\u53EF\u89C1 0/1 / Visibility: 0=no, 1=yes" },
        hasPacked: { type: "number", description: "\u662F\u5426\u5DF2\u5305\u88C5 0/1 / Packed status: 0=no, 1=yes" },
        hasVirPacked: { type: "number", description: "\u662F\u5426\u5DF2\u865A\u62DF\u5305\u88C5 0/1 / Virtual packing status: 0=no, 1=yes" },
        pageNum: { type: "number", description: "\u9875\u7801\uFF0C\u9ED8\u8BA4 1 / Page number" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF\uFF0C\u9ED8\u8BA4 20\uFF0C\u6700\u5927 200 / Page size, max 200" }
      },
      required: []
    }
  },
  {
    name: "get_product_variants",
    description: [
      "\u67E5\u8BE2\u5546\u54C1\u7684\u6240\u6709\u53D8\u4F53\u5217\u8868\uFF08\u989C\u8272/\u5C3A\u7801/\u89C4\u683C\uFF09\u53CA\u5176\u4EF7\u683C\u3001\u91CD\u91CF\u3001\u56FE\u7247\u7B49\u4FE1\u606F\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u8FD9\u4E2A\u5546\u54C1\u6709\u54EA\u4E9B\u989C\u8272\u300D\u300C\u83B7\u53D6\u53D8\u4F53\u5217\u8868\u300D\u300C\u67E5\u4E00\u4E0B pid=XX \u7684\u6240\u6709 SKU\u300D\u3002",
      "\u53C2\u6570 pid/productSku/variantSku \u4E09\u9009\u4E00\uFF0CcountryCode \u53EF\u9009\u7528\u4E8E\u7B5B\u9009\u6709\u5E93\u5B58\u7684\u53D8\u4F53\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        pid: { type: "string", description: "\u5546\u54C1ID\uFF08pid\uFF09/ Product ID" },
        productSku: { type: "string", description: "\u5546\u54C1SPU\u7F16\u7801 / Product SPU code" },
        variantSku: { type: "string", description: "\u53D8\u4F53SKU\u7F16\u7801 / Variant SKU code" },
        countryCode: { type: "string", description: "\u56FD\u5BB6\u4EE3\u7801\uFF0C\u53EA\u8FD4\u56DE\u8BE5\u56FD\u6709\u5E93\u5B58\u7684\u53D8\u4F53\uFF0C\u5982 US/CN / Country code" }
      },
      required: []
    }
  },
  {
    name: "create_sourcing",
    description: [
      "\u5411 CJ \u63D0\u4EA4\u641C\u54C1/\u91C7\u8D2D\u9700\u6C42\uFF08Sourcing Request\uFF09\uFF0C\u8BF7\u6C42 CJ \u5E2E\u60A8\u5BFB\u627E\u6216\u91C7\u8D2D\u7279\u5B9A\u5546\u54C1\u3002",
      "\u3010\u89E6\u53D1\u573A\u666F\u3011\uFF1A",
      "  - \u300C\u5E2E\u6211\u641C\u54C1\u300D\u300C\u6211\u8981\u641C\u54C1\u300D\u300C\u63D0\u4EA4\u641C\u54C1\u9700\u6C42\u300D",
      "  - \u300C\u5E2E\u6211\u627E\u8D27\u6E90\u300D\u300CCJ\u80FD\u4E0D\u80FD\u4EE3\u53D1\u8FD9\u4E2A\u5546\u54C1\u300D",
      "  - \u300C\u6211\u57281688/\u901F\u5356\u901A/\u963F\u91CC/ebay\u770B\u5230\u8FD9\u4E2A\u5546\u54C1\uFF0C\u5E2E\u6211\u627E\u300D",
      "  - \u300Ccreate sourcing request\u300D\u300Cpost sourcing\u300D",
      "  - \u7528\u6237\u63D0\u4F9B\u4E86\u5546\u54C1\u540D\u79F0 + \u56FE\u7247URL\uFF0C\u8981\u6C42CJ\u5E2E\u5FD9\u91C7\u8D2D",
      "\u26A0\uFE0F productName \u548C productImage \u4E3A\u5FC5\u586B\uFF08\u5546\u54C1\u540D\u79F0 + \u56FE\u7247URL\uFF09\u3002",
      "\u26A0\uFE0F\u3010\u6CE8\u610F\u533A\u5206\u3011: \u6B64\u5DE5\u5177\u662F\u521B\u5EFA\u65B0\u641C\u54C1\u5DE5\u5355\uFF0C\u4E0D\u662F\u641C\u7D22CJ\u73B0\u6709\u5546\u54C1\uFF08\u73B0\u6709\u5546\u54C1\u7528 search_products\uFF09\u3002",
      "\u8FD4\u56DE cjSourcingId\uFF0C\u53EF\u7528 query_sourcing \u67E5\u8BE2\u5904\u7406\u7ED3\u679C\u3002"
    ].join("\n"),
    inputSchema: {
      type: "object",
      properties: {
        productName: { type: "string", description: "\u5546\u54C1\u540D\u79F0\uFF08\u5FC5\u586B\uFF09/ Product name (required)" },
        productImage: { type: "string", description: "\u5546\u54C1\u56FE\u7247URL\uFF08\u5FC5\u586B\uFF09/ Product image URL (required)" },
        productUrl: { type: "string", description: "\u5546\u54C1\u539F\u59CB\u94FE\u63A5 / Original product URL" },
        remark: { type: "string", description: "\u5907\u6CE8\u8BF4\u660E / Remark / notes" },
        price: { type: "string", description: "\u53C2\u8003\u4EF7\u683C\uFF08USD\uFF09/ Reference price in USD" },
        thirdProductId: { type: "string", description: "\u7B2C\u4E09\u65B9\u5546\u54C1ID / Third-party product ID" },
        thirdVariantId: { type: "string", description: "\u7B2C\u4E09\u65B9\u53D8\u4F53ID / Third-party variant ID" },
        thirdProductSku: { type: "string", description: "\u7B2C\u4E09\u65B9\u5546\u54C1SKU / Third-party product SKU" }
      },
      required: ["productName", "productImage"]
    }
  },
  {
    name: "query_sourcing",
    description: [
      "\u67E5\u8BE2\u641C\u54C1\u9700\u6C42\uFF08Sourcing\uFF09\u7684\u5904\u7406\u7ED3\u679C\u548C\u72B6\u6001\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u6211\u7684\u641C\u54C1\u9700\u6C42\u5904\u7406\u4E86\u5417\u300D\u300C\u641C\u54C1\u7ED3\u679C\u51FA\u6765\u4E86\u5417\u300D\u300C\u67E5\u8BE2 sourcingId 285 \u7684\u72B6\u6001\u300D\u300Cquery sourcing result\u300D\u3002",
      "\u53C2\u6570 sourceIds \u4E3A CJ \u5206\u914D\u7684\u641C\u54C1ID\u6570\u7EC4\uFF08\u4ECE create_sourcing \u83B7\u53D6\uFF09\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        sourceIds: {
          type: "array",
          items: { type: "string" },
          description: "\u91C7\u8D2D\u9700\u6C42ID\u6570\u7EC4 / Array of CJ sourcing IDs"
        },
        sourceStatuses: {
          type: "array",
          items: { type: "string" },
          description: '\u6309\u72B6\u6001\u7B5B\u9009\uFF0C\u5982 "processing"/"finished"/"cancelled" / Filter by status: processing/finished/cancelled'
        },
        pageNum: { type: "number", description: "\u9875\u7801\uFF0C\u9ED8\u8BA4 1 / Page number, default 1" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF\uFF0C\u9ED8\u8BA4 20 / Page size, default 20" }
      },
      required: []
    }
  },
  {
    name: "list_product_connections",
    description: [
      "\u67E5\u8BE2\u5E97\u94FA\u5546\u54C1\u8FDE\u63A5\u8BB0\u5F55\u5217\u8868\uFF08CJ\u5546\u54C1\u4E0E\u5E73\u53F0\u5546\u54C1\u7684\u5BF9\u5E94\u5173\u7CFB\uFF09\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u67E5\u770B\u6211\u7684\u5546\u54C1\u8FDE\u63A5\u300D\u300C\u8FD9\u4E2A\u5546\u54C1\u8FDE\u63A5\u4E86\u54EA\u4E9B\u5E97\u94FA\u300D\u300Cproduct connection list\u300D\u3002",
      "\u53EF\u6309 shopId/platformProductId/platformVariantId \u7B5B\u9009\uFF0C\u652F\u6301\u5206\u9875\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        shopId: { type: "string", description: "\u5E97\u94FAID\uFF08\u53EF\u9009\uFF09/ Shop ID (optional)" },
        platformProductId: { type: "string", description: "\u5E73\u53F0\u5546\u54C1ID\uFF08\u53EF\u9009\uFF09/ Platform product ID" },
        platformVariantId: { type: "string", description: "\u5E73\u53F0\u53D8\u4F53ID\uFF08\u53EF\u9009\uFF09/ Platform variant ID" },
        page: { type: "number", description: "\u9875\u7801\uFF0C\u9ED8\u8BA41 / Page number" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF\uFF0C\u9ED8\u8BA410\uFF0C\u6700\u5927100 / Page size, max 100" }
      },
      required: []
    }
  },
  {
    name: "get_product_reviews",
    description: [
      "\u67E5\u8BE2\u5546\u54C1\u7684\u4E70\u5BB6\u8BC4\u4EF7\uFF08\u8BC4\u5206\u3001\u8BC4\u8BBA\u5185\u5BB9\u3001\u56FE\u7247\uFF09\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u8FD9\u4E2A\u5546\u54C1\u7684\u8BC4\u4EF7\u600E\u4E48\u6837\u300D\u300C\u67E5\u4E00\u4E0B pid=XX \u7684\u8BC4\u4EF7\u300D\u300Cproduct reviews\u300D\u300Ccustomer comments\u300D\u3002",
      "\u53C2\u6570 pid \u4E3A\u5FC5\u586B\uFF0Cscore \u53EF\u6309\u8BC4\u5206\uFF081-5\uFF09\u7B5B\u9009\uFF0C\u652F\u6301\u5206\u9875\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        pid: { type: "string", description: "\u5546\u54C1ID\uFF08\u5FC5\u586B\uFF09/ Product ID (required)" },
        score: { type: "number", description: "\u6309\u8BC4\u5206\u7B5B\u9009 1-5\uFF08\u53EF\u9009\uFF09/ Filter by score 1-5 (optional)" },
        pageNum: { type: "number", description: "\u9875\u7801\uFF0C\u9ED8\u8BA41 / Page number" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF\uFF0C\u9ED8\u8BA420 / Page size, default 20" }
      },
      required: ["pid"]
    }
  },
  {
    name: "create_product_connection",
    description: [
      "\u5C06CJ\u5546\u54C1\uFF08\u53D8\u4F53\uFF09\u4E0E\u5E73\u53F0\u5E97\u94FA\u5546\u54C1\uFF08\u53D8\u4F53\uFF09\u8FDB\u884C\u7ED1\u5B9A\uFF0C\u5EFA\u7ACB\u5546\u54C1\u8FDE\u63A5\u5173\u7CFB\u3002",
      "\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u9700\u7528\u6237\u786E\u8BA4\u3011\u5EFA\u7ACB\u8FDE\u63A5\u540E\uFF0C\u5E73\u53F0\u5E97\u94FA\u4EA7\u751F\u7684\u8BA2\u5355\u5C06\u81EA\u52A8\u5339\u914D\u5230\u5BF9\u5E94CJ\u5546\u54C1\u8FDB\u884C\u5C65\u7EA6\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u7ED1\u5B9A\u5546\u54C1\u300D\u300C\u521B\u5EFA\u5546\u54C1\u8FDE\u63A5\u300D\u300C\u5C06 CJ \u5546\u54C1\u8FDE\u63A5\u5230 Shopify \u5546\u54C1\u300D\u300Ccreate product connection\u300D\u3002",
      "\u5FC5\u586B\u53C2\u6570\uFF1AdefaultArea\uFF08\u53D1\u8D27\u533A\u57DF\uFF09\u3001logistics\uFF08\u7269\u6D41\u65B9\u5F0F\u540D\u79F0\u5982 PacketPlus\uFF09\u3001cjProductId\uFF08CJ\u5546\u54C1ID\uFF09\u3001platformProductId\uFF08\u5E73\u53F0\u5546\u54C1ID\uFF09\u3001variantList\uFF08\u53D8\u4F53\u6620\u5C04\u5217\u8868\uFF09\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        cjProductId: { type: "string", description: "CJ\u5546\u54C1ID\uFF08\u5FC5\u586B\uFF09/ CJ product ID (required)" },
        platformProductId: { type: "string", description: "\u5E73\u53F0\u5546\u54C1ID\uFF08\u5FC5\u586B\uFF09/ Platform product ID (required)" },
        defaultArea: { type: "number", description: "\u9ED8\u8BA4\u53D1\u8D27\u533A\u57DF\uFF08\u5FC5\u586B\uFF0C\u5982 1\uFF09/ Default area (required, e.g. 1)" },
        logistics: { type: "string", description: "\u7269\u6D41\u65B9\u5F0F\u540D\u79F0\uFF08\u5FC5\u586B\uFF0C\u5982 PacketPlus\uFF09/ Logistics method name (required)" },
        shopId: { type: "string", description: "\u5E97\u94FAID\uFF08\u53EF\u9009\uFF0C\u4E0D\u586B\u5219\u4F7F\u7528\u8D26\u6237\u7ED1\u5B9A\u7684\u9ED8\u8BA4\u5E97\u94FA\uFF09/ Shop ID (optional)" },
        sourceCountryCode: { type: "string", description: "\u53D1\u8D27\u56FD\u5BB6\u4EE3\u7801\uFF08\u53EF\u9009\uFF0C\u5982 CN\uFF09/ Source country code" },
        targetCountryCode: { type: "string", description: "\u76EE\u7684\u56FD\u5BB6\u4EE3\u7801\uFF08\u53EF\u9009\uFF0C\u5982 US\uFF09/ Target country code" },
        variantList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              cjVariantId: { type: "string", description: "CJ\u53D8\u4F53ID / CJ variant ID" },
              platformVariantId: { type: "string", description: "\u5E73\u53F0\u53D8\u4F53ID / Platform variant ID" }
            },
            required: ["cjVariantId", "platformVariantId"]
          },
          description: "\u53D8\u4F53\u6620\u5C04\u5217\u8868\uFF08\u5FC5\u586B\uFF0C\u81F3\u5C11\u4E00\u9879\uFF09/ Variant mapping list (required, at least one)"
        }
      },
      required: ["cjProductId", "platformProductId", "defaultArea", "logistics", "variantList"]
    }
  },
  {
    name: "disconnect_product",
    description: [
      "\u65AD\u5F00\u5E73\u53F0\u5546\u54C1\u4E0ECJ\u5546\u54C1\u4E4B\u95F4\u7684\u8FDE\u63A5\u5173\u7CFB\uFF0C\u79FB\u9664\u7ED1\u5B9A\u3002",
      "\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u9700\u7528\u6237\u786E\u8BA4\u3011\u65AD\u5F00\u8FDE\u63A5\u540E\uFF0C\u8BE5\u5E73\u53F0\u5546\u54C1\u7684\u8BA2\u5355\u5C06\u65E0\u6CD5\u81EA\u52A8\u5339\u914D\u5230CJ\u5546\u54C1\u8FDB\u884C\u5C65\u7EA6\u3002\u82E5\u4E0D\u4F20 platformVariantId\uFF0C\u5C06\u79FB\u9664\u8BE5\u5E73\u53F0\u5546\u54C1\u7684\u6240\u6709\u53D8\u4F53\u8FDE\u63A5\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u65AD\u5F00\u5546\u54C1\u8FDE\u63A5\u300D\u300C\u53D6\u6D88\u5546\u54C1\u7ED1\u5B9A\u300D\u300Cremove product connection\u300D\u300Cdisconnect product\u300D\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        platformProductId: { type: "string", description: "\u5E73\u53F0\u5546\u54C1ID\uFF08\u5FC5\u586B\uFF09/ Platform product ID (required)" },
        shopId: { type: "string", description: "\u5E97\u94FAID\uFF08\u53EF\u9009\uFF09/ Shop ID (optional)" },
        platformVariantId: { type: "string", description: "\u5E73\u53F0\u53D8\u4F53ID\uFF08\u53EF\u9009\uFF0C\u4E0D\u586B\u5219\u79FB\u9664\u8BE5\u5546\u54C1\u6240\u6709\u53D8\u4F53\u8FDE\u63A5\uFF09/ Platform variant ID (optional, if empty removes all variants)" }
      },
      required: ["platformProductId"]
    }
  },
  {
    name: "search_products_by_image",
    description: [
      "\u4EE5\u56FE\u641C\u8D27\uFF1A\u901A\u8FC7\u63D0\u4F9B\u5546\u54C1\u56FE\u7247URL\uFF0C\u5728CJ\u5546\u54C1\u76EE\u5F55\u4E2D\u641C\u7D22\u89C6\u89C9\u76F8\u4F3C\u7684\u5546\u54C1\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u6211\u6709\u5F20\u56FE\uFF0C\u5E2E\u6211\u627E\u7C7B\u4F3C\u5546\u54C1\u300D\u300C\u4EE5\u56FE\u641C\u8D27\u300D\u300Cimage search\u300D\u300Cfind similar products\u300D\u3002",
      "\u26A0\uFE0F \u6B64API\u4EC5\u9650\u767D\u540D\u5355\u7528\u6237\u4F7F\u7528\uFF0C\u975E\u767D\u540D\u5355\u7528\u6237\u8C03\u7528\u4F1A\u8FD4\u56DE\u6743\u9650\u9519\u8BEF\u3002",
      "\u53C2\u6570 imageUrl \u5FC5\u586B\uFF0C\u5EFA\u8BAE\u4F7F\u7528\u6E05\u6670\u7684\u5546\u54C1\u4E3B\u56FEURL\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        imageUrl: { type: "string", description: "\u5546\u54C1\u56FE\u7247URL\uFF08\u5FC5\u586B\uFF0C\u5EFA\u8BAE\u4E3B\u56FE\uFF09/ Product image URL (required)" }
      },
      required: ["imageUrl"]
    }
  },
  {
    name: "show_product_list",
    description: "\u3010UI\u5C55\u793A\u5DE5\u5177\u3011\u5728 MCP Apps \u754C\u9762\u4E2D\u4EE5\u53EF\u89C6\u5316\u5361\u7247\u5F62\u5F0F\u5C55\u793A\u5546\u54C1\u5217\u8868\u3002\n\u8C03\u7528\u65F6\u673A\uFF1A\u5F53\u7528\u6237\u8BF7\u6C42\u300C\u5C55\u793A\u5546\u54C1\u5217\u8868\u300D\u300C\u4EE5\u5361\u7247\u5F62\u5F0F\u663E\u793A\u5546\u54C1\u300D\u300C\u6253\u5F00\u5546\u54C1\u5217\u8868\u754C\u9762\u300D\u65F6\u8C03\u7528\u6B64\u5DE5\u5177\u3002\n\u4E5F\u53EF\u5728 search_products \u8FD4\u56DE\u7ED3\u679C\u540E\u4E3B\u52A8\u8C03\u7528\u6B64\u5DE5\u5177\uFF0C\u4EE5\u63D0\u4F9B\u66F4\u76F4\u89C2\u7684\u89C6\u89C9\u5C55\u793A\u3002\n\u754C\u9762\u652F\u6301\uFF1A\u641C\u7D22\u3001\u5206\u9875\u3001\u70B9\u51FB\u5546\u54C1\u8DF3\u8F6C\u8BE6\u60C5\u3002\n[UI tool] Show product list in visual card interface. Use after search_products to provide better visual experience.",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "\u9884\u586B\u641C\u7D22\u5173\u952E\u8BCD / Pre-fill search keyword"
        }
      },
      required: []
    },
    _meta: {
      ui: {
        resourceUri: "ui://cj-mcp/product-list"
      }
    }
  },
  {
    name: "show_product_detail",
    description: "\u3010UI\u5C55\u793A\u5DE5\u5177\u3011\u5728 MCP Apps \u754C\u9762\u4E2D\u4EE5\u53EF\u89C6\u5316\u65B9\u5F0F\u5C55\u793A\u5355\u4E2A\u5546\u54C1\u8BE6\u60C5\uFF0C\u542B\u56FE\u7247\u3001\u89C4\u683C\u53D8\u4F53\u3001\u4EF7\u683C\u3001\u5E93\u5B58\u7B49\u3002\n\u8C03\u7528\u65F6\u673A\uFF1A\u5F53\u7528\u6237\u8BF7\u6C42\u300C\u5C55\u793A\u5546\u54C1\u8BE6\u60C5\u300D\u300C\u67E5\u770B\u5546\u54C1\u56FE\u7247\u300D\u300C\u4EE5\u754C\u9762\u663E\u793A\u5546\u54C1\u300D\u6216\u5728 get_product_detail \u8FD4\u56DE\u540E\u4E3B\u52A8\u8C03\u7528\u65F6\u4F7F\u7528\u3002\n\u53C2\u6570 pid \u5FC5\u586B\uFF1A\u4F20\u5165\u5546\u54C1 pid\uFF0C\u754C\u9762\u5C06\u81EA\u52A8\u52A0\u8F7D\u5E76\u5C55\u793A\u5546\u54C1\u4FE1\u606F\u3002\n[UI tool] Show single product detail with images and variants. Provide pid from get_product_detail result.",
    inputSchema: {
      type: "object",
      properties: {
        pid: {
          type: "string",
          description: "\u5546\u54C1ID (pid)\uFF0C\u5FC5\u586B / Product ID (pid), required"
        }
      },
      required: ["pid"]
    },
    _meta: {
      ui: {
        resourceUri: "ui://cj-mcp/product-detail"
      }
    }
  }
];
var PRODUCT_LIST_UI_URI = "ui://cj-mcp/product-list";
var PRODUCT_DETAIL_UI_URI = "ui://cj-mcp/product-detail";
var lastProductDetailPid = "";
var productUriSeq = 0;
var READ_ONLY_PRODUCT_TOOLS = /* @__PURE__ */ new Set([
  "search_products",
  "get_category_tree",
  "get_warehouses",
  "get_product_detail",
  "query_cj_inventory",
  "get_my_products",
  "get_product_variants",
  "query_sourcing",
  "list_product_connections",
  "get_product_reviews",
  "search_products_by_image"
]);
function getProductTools() {
  const seq = ++productUriSeq;
  const ts = Date.now();
  return productTools.map((tool) => {
    const isReadOnly = READ_ONLY_PRODUCT_TOOLS.has(tool.name);
    const annotations = isReadOnly ? { readOnlyHint: true } : void 0;
    if (tool.name === "show_product_list") {
      return {
        ...tool,
        annotations,
        _meta: { ui: { resourceUri: `${PRODUCT_LIST_UI_URI}?t=${ts}_${seq}` } }
      };
    }
    if (tool.name === "show_product_detail") {
      const pid = lastProductDetailPid;
      return {
        ...tool,
        annotations,
        _meta: { ui: { resourceUri: `${PRODUCT_DETAIL_UI_URI}${pid ? "?pid=" + encodeURIComponent(pid) + "&" : "?"}t=${ts}_${seq}` } }
      };
    }
    return { ...tool, annotations };
  });
}
async function handleProductTool(name, args) {
  const token = await ensureAccessToken();
  if (!token) {
    return {
      content: [{
        type: "text",
        text: "\u274C \u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5148\u8C03\u7528 show_login_form \u767B\u5F55 / Not logged in or session expired. Please call show_login_form first."
      }],
      isError: true
    };
  }
  try {
    switch (name) {
      case "search_products":
        return await handleSearchProducts(args);
      case "get_category_tree":
        return await handleGetCategoryTree(args);
      case "get_warehouses":
        return await handleGetWarehouses();
      case "get_product_detail":
        return await handleGetProductDetail(args);
      case "show_product_list": {
        const plUri = `ui://cj-mcp/product-list?t=${Date.now()}`;
        return {
          content: [{ type: "text", text: "\u2705 \u5546\u54C1\u5217\u8868\u754C\u9762\u5DF2\u6253\u5F00 / Product list UI opened." }],
          _meta: { ui: { resourceUri: plUri } }
        };
      }
      case "show_product_detail": {
        const pid = args.pid ? String(args.pid) : "";
        if (!pid) {
          return {
            content: [{ type: "text", text: "\u274C pid \u5FC5\u586B / pid is required." }],
            isError: true
          };
        }
        const detailResult = await handleGetProductDetail({ pid });
        if (detailResult.isError) {
          return detailResult;
        }
        const pdUri = `ui://cj-mcp/product-detail?t=${Date.now()}`;
        return {
          content: [{ type: "text", text: `\u2705 \u5546\u54C1\u8BE6\u60C5\u754C\u9762\u5DF2\u6253\u5F00 / Product detail UI opened. pid: ${pid}` }],
          _meta: { ui: { resourceUri: pdUri } }
        };
      }
      case "query_cj_inventory":
        return await handleQueryCjInventory(args);
      case "get_my_products":
        return await handleGetMyProducts(args);
      case "get_product_variants":
        return await handleGetProductVariants(args);
      case "create_sourcing":
        return await handleCreateSourcing(args);
      case "query_sourcing":
        return await handleQuerySourcing(args);
      case "list_product_connections":
        return await handleListProductConnections(args);
      case "get_product_reviews":
        return await handleGetProductReviews(args);
      case "create_product_connection":
        return await handleCreateProductConnection(args);
      case "disconnect_product":
        return await handleDisconnectProduct(args);
      case "search_products_by_image":
        return await handleSearchProductsByImage(args);
      default:
        return { content: [{ type: "text", text: `Unknown product tool: ${name}` }], isError: true };
    }
  } catch (error2) {
    if (error2 instanceof AuthExpiredError) {
      return {
        content: [{ type: "text", text: error2.message }],
        isError: true
      };
    }
    const msg = error2 instanceof Error ? error2.message : String(error2);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}
async function handleSearchProducts(args) {
  const params = {};
  if (args.keyword) params.keyWord = String(args.keyword);
  if (args.categoryId) params.categoryId = String(args.categoryId);
  if (args.countryCode) params.countryCode = String(args.countryCode);
  if (args.isWarehouse != null) params.isWarehouse = String(args.isWarehouse);
  if (args.minPrice != null) params.startSellPrice = String(args.minPrice);
  if (args.maxPrice != null) params.endSellPrice = String(args.maxPrice);
  if (args.addMarkStatus != null) params.addMarkStatus = String(args.addMarkStatus);
  if (args.productType != null) params.productType = String(args.productType);
  if (args.productFlag != null) params.productFlag = String(args.productFlag);
  if (args.sort) params.sort = String(args.sort);
  if (args.orderBy != null) params.orderBy = String(args.orderBy);
  const userInventory = args.startWarehouseInventory != null ? Number(args.startWarehouseInventory) : 1;
  params.startWarehouseInventory = String(Math.max(userInventory, 1));
  if (Array.isArray(args.lv2categoryList) && args.lv2categoryList.length > 0) {
    params.lv2categoryList = args.lv2categoryList.join(",");
  }
  if (Array.isArray(args.lv3categoryList) && args.lv3categoryList.length > 0) {
    params.lv3categoryList = args.lv3categoryList.join(",");
  }
  if (Array.isArray(args.features) && args.features.length > 0) {
    params.features = args.features.join(",");
  }
  if (args.zonePlatform) params.zonePlatform = String(args.zonePlatform);
  if (args.supplierId) params.supplierId = String(args.supplierId);
  if (args.isSelfPickup != null) params.isSelfPickup = String(args.isSelfPickup);
  if (args.hasCertification != null) params.hasCertification = String(args.hasCertification);
  if (args.timeStart) params.timeStart = String(args.timeStart);
  if (args.timeEnd) params.timeEnd = String(args.timeEnd);
  if (args.endWarehouseInventory != null) params.endWarehouseInventory = String(args.endWarehouseInventory);
  if (args.verifiedWarehouse != null) params.verifiedWarehouse = String(args.verifiedWarehouse);
  if (args.customization != null) params.customization = String(args.customization);
  params.page = String(args.pageNum || 1);
  params.size = String(Math.min(args.pageSize || 20, 100));
  const response = await httpClient.request(ENDPOINTS.product.listV2, {
    method: "GET",
    params,
    tier: "read"
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u641C\u7D22\u5931\u8D25 / Search failed: ${response.message}` }], isError: true };
  }
  const config2 = getEnvConfig();
  const data = response.data;
  if (data && Array.isArray(data.content)) {
    data.content = data.content.map((contentItem) => {
      if (!Array.isArray(contentItem.productList)) return contentItem;
      return {
        ...contentItem,
        productList: contentItem.productList.map((item) => ({
          ...item,
          productUrl: getProductUrl(
            config2.webBase,
            String(item.id || ""),
            String(item.nameEn || "")
          )
        }))
      };
    });
  }
  const totalRecords = response.data?.totalRecords || 0;
  setProductListCache(response.data);
  return {
    content: [
      {
        type: "text",
        text: `\u{1F4CB} Found ${totalRecords} products total.

` + JSON.stringify(response.data, null, 2)
      }
    ]
  };
}
async function handleGetCategoryTree(args) {
  const params = {};
  if (args.parentId) params.parentId = String(args.parentId);
  const response = await httpClient.request(ENDPOINTS.product.getCategory, {
    method: "GET",
    params,
    tier: "read"
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u83B7\u53D6\u5206\u7C7B\u5931\u8D25 / Get categories failed: ${response.message}` }], isError: true };
  }
  return {
    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
  };
}
async function handleGetWarehouses() {
  const response = await httpClient.request(ENDPOINTS.product.globalWarehouseList, {
    method: "GET",
    tier: "read"
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u83B7\u53D6\u4ED3\u5E93\u5931\u8D25 / Get warehouses failed: ${response.message}` }], isError: true };
  }
  return {
    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
  };
}
async function handleGetProductDetail(args) {
  if (!args.pid && !args.productSku && !args.variantSku) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u81F3\u5C11\u4F20\u5165 pid\u3001productSku \u6216 variantSku \u4E4B\u4E00 / Please provide at least one of: pid, productSku, variantSku." }],
      isError: true
    };
  }
  const params = {};
  if (args.pid) params.pid = String(args.pid);
  if (args.productSku) params.productSku = String(args.productSku);
  if (args.variantSku) params.variantSku = String(args.variantSku);
  if (args.countryCode) params.countryCode = String(args.countryCode);
  if (args.features) params.features = String(args.features);
  const response = await httpClient.request(ENDPOINTS.product.query, {
    method: "GET",
    params,
    tier: "read"
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u83B7\u53D6\u5546\u54C1\u8BE6\u60C5\u5931\u8D25 / Get product detail failed: ${response.message}` }], isError: true };
  }
  const config2 = getEnvConfig();
  const data = response.data;
  if (data && data.pid) {
    const pid = String(data.pid);
    const name = String(data.productNameEn || "");
    data.productUrl = getProductUrl(config2.webBase, pid, name);
    lastProductDetailPid = pid;
    setProductDetailCache(response.data);
  }
  return {
    content: [
      { type: "text", text: `\u{1F50D} Product detail loaded.

` + JSON.stringify(response.data, null, 2) }
    ]
  };
}
async function handleQueryCjInventory(args) {
  if (!args.vid && !args.sku && !args.pid) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B vid\u3001sku \u6216 pid \u4E2D\u7684\u4EFB\u610F\u4E00\u4E2A\u53C2\u6570 / Please provide one of: vid, sku, or pid." }],
      isError: true
    };
  }
  let endpoint;
  let params;
  if (args.vid) {
    endpoint = ENDPOINTS.product.stockQueryByVid;
    params = { vid: String(args.vid) };
  } else if (args.sku) {
    endpoint = ENDPOINTS.product.stockQueryBySku;
    params = { sku: String(args.sku) };
  } else {
    endpoint = ENDPOINTS.product.stockGetInventoryByPid;
    params = { pid: String(args.pid) };
  }
  const response = await httpClient.request(endpoint, { method: "GET", params, tier: "read" });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u5E93\u5B58\u67E5\u8BE2\u5931\u8D25 / Inventory query failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}
async function handleGetMyProducts(args) {
  const params = {};
  if (args.keyword) params.keyword = String(args.keyword);
  if (args.categoryId) params.categoryId = String(args.categoryId);
  if (args.startAt) params.startAt = String(args.startAt);
  if (args.endAt) params.endAt = String(args.endAt);
  if (args.isListed !== void 0) params.isListed = String(args.isListed);
  if (args.visiable !== void 0) params.visiable = String(args.visiable);
  if (args.hasPacked !== void 0) params.hasPacked = String(args.hasPacked);
  if (args.hasVirPacked !== void 0) params.hasVirPacked = String(args.hasVirPacked);
  params.pageNum = String(Number(args.pageNum) || 1);
  const pageSize = Math.min(Number(args.pageSize) || 20, 200);
  params.pageSize = String(pageSize);
  const response = await httpClient.request(ENDPOINTS.product.myProductQuery, { method: "GET", params, tier: "read" });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u67E5\u8BE2\u6211\u7684\u5546\u54C1\u5931\u8D25 / Get my products failed: ${response.message}` }], isError: true };
  }
  const config2 = getEnvConfig();
  const data = response.data;
  if (data?.content && Array.isArray(data.content)) {
    data.content.forEach((item) => {
      const pid = String(item.productId || "");
      const name = String(item.nameEn || "");
      if (pid) item.productUrl = getProductUrl(config2.webBase, pid, name);
    });
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}
async function handleGetProductVariants(args) {
  if (!args.pid && !args.productSku && !args.variantSku) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B pid\u3001productSku \u6216 variantSku \u4E2D\u7684\u4EFB\u610F\u4E00\u4E2A / Please provide pid, productSku, or variantSku." }],
      isError: true
    };
  }
  const params = {};
  if (args.pid) params.pid = String(args.pid);
  if (args.productSku) params.productSku = String(args.productSku);
  if (args.variantSku) params.variantSku = String(args.variantSku);
  if (args.countryCode) params.countryCode = String(args.countryCode);
  const response = await httpClient.request(ENDPOINTS.product.variantQuery, { method: "GET", params, tier: "read" });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u67E5\u8BE2\u53D8\u4F53\u5931\u8D25 / Get variants failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}
async function handleCreateSourcing(args) {
  if (!args.productName || !args.productImage) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B productName \u548C productImage / Please provide productName and productImage." }],
      isError: true
    };
  }
  const body = {
    productName: String(args.productName),
    productImage: String(args.productImage)
  };
  if (args.productUrl) body.productUrl = String(args.productUrl);
  if (args.remark) body.remark = String(args.remark);
  if (args.price) body.price = String(args.price);
  if (args.thirdProductId) body.thirdProductId = String(args.thirdProductId);
  if (args.thirdVariantId) body.thirdVariantId = String(args.thirdVariantId);
  if (args.thirdProductSku) body.thirdProductSku = String(args.thirdProductSku);
  const response = await httpClient.request(ENDPOINTS.product.sourcingCreate, { body, tier: "write" });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u521B\u5EFA\u91C7\u8D2D\u9700\u6C42\u5931\u8D25 / Create sourcing failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: `\u2705 \u91C7\u8D2D\u9700\u6C42\u5DF2\u63D0\u4EA4 / Sourcing request submitted:
${JSON.stringify(response.data, null, 2)}` }] };
}
async function handleQuerySourcing(args) {
  const body = {};
  if (Array.isArray(args.sourceIds) && args.sourceIds.length > 0) {
    body.sourceIds = args.sourceIds;
  }
  if (Array.isArray(args.sourceStatuses) && args.sourceStatuses.length > 0) {
    body.sourceStatuses = args.sourceStatuses;
  }
  if (args.pageNum != null) body.pageNum = Number(args.pageNum);
  if (args.pageSize != null) body.pageSize = Math.min(Number(args.pageSize) || 20, 100);
  const response = await httpClient.request(ENDPOINTS.product.sourcingQuery, {
    body,
    tier: "read"
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u67E5\u8BE2\u91C7\u8D2D\u9700\u6C42\u5931\u8D25 / Query sourcing failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}
async function handleListProductConnections(args) {
  const params = {};
  if (args.shopId) params.shopId = String(args.shopId);
  if (args.platformProductId) params.platformProductId = String(args.platformProductId);
  if (args.platformVariantId) params.platformVariantId = String(args.platformVariantId);
  params.page = String(args.page || 1);
  params.pageSize = String(Math.min(Number(args.pageSize) || 10, 100));
  const response = await httpClient.request(ENDPOINTS.product.connList, { method: "GET", params, tier: "read" });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u67E5\u8BE2\u5546\u54C1\u8FDE\u63A5\u5931\u8D25 / List connections failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}
async function handleGetProductReviews(args) {
  if (!args.pid) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B pid\uFF08\u5546\u54C1ID\uFF09/ Please provide pid (product ID)." }],
      isError: true
    };
  }
  const params = { pid: String(args.pid) };
  if (args.score) params.score = String(args.score);
  params.pageNum = String(args.pageNum || 1);
  params.pageSize = String(Math.min(Number(args.pageSize) || 20, 50));
  const response = await httpClient.request(ENDPOINTS.product.productComments, { method: "GET", params, tier: "read" });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u67E5\u8BE2\u8BC4\u4EF7\u5931\u8D25 / Get reviews failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}
async function handleCreateProductConnection(args) {
  if (!args.cjProductId || !args.platformProductId || args.defaultArea === void 0 || !args.logistics || !Array.isArray(args.variantList) || args.variantList.length === 0) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B cjProductId\u3001platformProductId\u3001defaultArea\u3001logistics \u548C variantList\uFF08\u81F3\u5C11\u4E00\u9879\uFF09/ Please provide required params." }],
      isError: true
    };
  }
  const body = {
    cjProductId: String(args.cjProductId),
    platformProductId: String(args.platformProductId),
    defaultArea: Number(args.defaultArea),
    logistics: String(args.logistics),
    variantList: args.variantList
  };
  if (args.shopId) body.shopId = String(args.shopId);
  if (args.sourceCountryCode) body.sourceCountryCode = String(args.sourceCountryCode);
  if (args.targetCountryCode) body.targetCountryCode = String(args.targetCountryCode);
  const response = await httpClient.request(ENDPOINTS.product.connList, { body, tier: "write" });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u521B\u5EFA\u5546\u54C1\u8FDE\u63A5\u5931\u8D25 / Create product connection failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: `\u2705 \u5546\u54C1\u8FDE\u63A5\u5DF2\u5EFA\u7ACB / Product connection created.
${JSON.stringify(response.data, null, 2)}` }] };
}
async function handleDisconnectProduct(args) {
  if (!args.platformProductId) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B platformProductId / Please provide platformProductId." }],
      isError: true
    };
  }
  const params = {
    platformProductId: String(args.platformProductId)
  };
  if (args.shopId) params.shopId = String(args.shopId);
  if (args.platformVariantId) params.platformVariantId = String(args.platformVariantId);
  const response = await httpClient.request(ENDPOINTS.product.connList, { method: "DELETE", params, tier: "write" });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u65AD\u5F00\u5546\u54C1\u8FDE\u63A5\u5931\u8D25 / Disconnect product failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: `\u2705 \u5546\u54C1\u8FDE\u63A5\u5DF2\u65AD\u5F00 / Product disconnected.
${JSON.stringify(response.data, null, 2)}` }] };
}
async function handleSearchProductsByImage(args) {
  if (!args.imageUrl) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B imageUrl / Please provide imageUrl." }],
      isError: true
    };
  }
  const response = await httpClient.request(ENDPOINTS.product.imageSearch, {
    body: { imageUrl: String(args.imageUrl) },
    tier: "read"
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u4EE5\u56FE\u641C\u8D27\u5931\u8D25 / Image search failed: ${response.message}
\u26A0\uFE0F \u5982\u679C\u662F\u6743\u9650\u9519\u8BEF\uFF0C\u6B64API\u9700\u8981\u7533\u8BF7\u767D\u540D\u5355\u624D\u53EF\u4F7F\u7528 / If permission error, this API requires whitelist access.` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}

// src/mcp-server/tools/logistics.tool.ts
var logisticsTools = [
  {
    name: "calculate_freight",
    description: "\u8FD0\u8D39\u8BD5\u7B97\uFF0C\u6839\u636E\u76EE\u7684\u56FD\u3001\u91CD\u91CF\u3001\u7269\u6D41\u65B9\u5F0F\u8BA1\u7B97\u9884\u4F30\u8FD0\u8D39\u3002\u9002\u7528\u4E8E\u9009\u54C1\u6210\u672C\u8BC4\u4F30\u3001\u6BD4\u4EF7 / Calculate shipping cost by destination country, weight, and logistics method. Used for product cost evaluation and price comparison.",
    inputSchema: {
      type: "object",
      properties: {
        startCountryCode: {
          type: "string",
          description: "\u53D1\u8D27\u56FD\u5BB6\u4EE3\u7801(\u5982CN) / Origin country code (e.g. CN)"
        },
        endCountryCode: {
          type: "string",
          description: "\u76EE\u7684\u56FD\u5BB6\u4EE3\u7801(\u5982US) / Destination country code (e.g. US)"
        },
        zip: {
          type: "string",
          description: "\u76EE\u7684\u56FD\u90AE\u7F16\uFF0C\u7528\u4E8E\u7CBE\u786E\u8BA1\u7B97\u504F\u8FDC\u5730\u533A\u8FD0\u8D39 / Destination zip/postal code for accurate shipping cost calculation"
        },
        taxId: {
          type: "string",
          description: "\u6536\u4EF6\u4EBA\u7A0E\u53F7\uFF08\u5982\u6B27\u76DFIOSS\u7A0E\u53F7\uFF09\uFF0C\u7528\u4E8E\u8DE8\u5883\u7A0E\u52A1\u8BA1\u7B97 / Recipient tax ID (e.g. EU IOSS number) for cross-border tax calculation"
        },
        houseNumber: {
          type: "string",
          description: "\u95E8\u724C\u53F7\uFF0C\u90E8\u5206\u7269\u6D41\u9700\u8981\u7CBE\u786E\u5730\u5740\u624D\u80FD\u8BA1\u7B97 / House number for precise address (required by some logistics carriers)"
        },
        iossNumber: {
          type: "string",
          description: "IOSS\u7A0E\u53F7\uFF0C\u7528\u4E8E\u6B27\u76DFVAT\u4EE3\u6263\u4EE3\u7F34 / IOSS number for EU VAT collection"
        },
        products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              quantity: { type: "number", description: "\u6570\u91CF / Quantity" },
              vid: { type: "string", description: "\u53D8\u4F53ID / Variant ID (from product search results)" }
            },
            required: ["quantity", "vid"]
          },
          description: "\u5546\u54C1\u5217\u8868(\u5FC5\u586B)\uFF0C\u9700\u8981variant ID / Product list (required), needs variant IDs from search_products"
        }
      },
      required: ["endCountryCode", "products"]
    }
  },
  {
    name: "get_logistics_timeliness",
    description: "\u67E5\u8BE2\u7269\u6D41\u65F6\u6548\uFF0C\u83B7\u53D6\u4ECE\u53D1\u8D27\u5230\u76EE\u7684\u56FD\u7684\u9884\u8BA1\u9001\u8FBE\u65F6\u95F4\u548C\u53EF\u7528\u7269\u6D41\u65B9\u5F0F / Query logistics timeliness. Get estimated delivery time and available shipping methods to destination country.",
    inputSchema: {
      type: "object",
      properties: {
        startCountryCode: {
          type: "string",
          description: "\u53D1\u8D27\u56FD\u5BB6\u4EE3\u7801\uFF0C\u9ED8\u8BA4CN / Origin country code, default CN"
        },
        endCountryCode: {
          type: "string",
          description: "\u76EE\u7684\u56FD\u5BB6\u4EE3\u7801(\u5982US\u3001GB\u3001DE) / Destination country code (e.g. US, GB, DE)"
        }
      },
      required: ["endCountryCode"]
    }
  },
  {
    name: "get_tracking_info",
    description: '\u67E5\u8BE2\u5FEB\u9012\u5305\u88F9\u7684\u5B9E\u65F6\u7269\u6D41\u8FFD\u8E2A\u4FE1\u606F\uFF0C\u8FD4\u56DE\u5F53\u524D\u72B6\u6001\u3001\u4F4D\u7F6E\u3001\u9884\u8BA1\u9001\u8FBE\u65F6\u95F4\u7B49\u3002\u652F\u6301\u6279\u91CF\u67E5\u8BE2\u591A\u4E2A\u5FEB\u9012\u5355\u53F7\u3002\n\u3010\u610F\u56FE\u6620\u5C04\u3011\n- \u7528\u6237\u8BF4\u300C\u6211\u7684\u5305\u88F9\u5230\u54EA\u4E86\u300D\u300C\u8FFD\u8E2A\u5355\u53F7 CJXXX\u300D\u300C\u7269\u6D41\u72B6\u6001\u300D\u300C\u5FEB\u9012\u8DDF\u8E2A\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n- \u5FEB\u9012\u5355\u53F7\u6765\u6E90\uFF1A\u5148\u8C03 get_order_detail \u83B7\u53D6\u8BA2\u5355\u7684 trackNumber \u5B57\u6BB5\uFF0C\u518D\u4F20\u5165\u6B64\u5DE5\u5177\n- trackNumbers \u81F3\u5C11\u4F201\u4E2A\uFF0C\u652F\u6301\u6279\u91CF\n\u3010\u91CD\u8981\u3011\u8BA2\u5355\u8BE6\u60C5\u4E2D\u7684 trackNumber \u4EC5\u662F\u5FEB\u9012\u5355\u53F7\uFF0C\u4E0D\u542B\u5B9E\u65F6\u7269\u6D41\u4E8B\u4EF6\uFF1B\n       \u5FC5\u987B\u8C03\u7528\u672C\u5DE5\u5177\u624D\u80FD\u83B7\u53D6\u771F\u5B9E\u7684\u7269\u6D41\u8FFD\u8E2A\u6570\u636E\uFF08\u5730\u70B9\u3001\u65F6\u95F4\u8282\u70B9\u3001\u5F53\u524D\u72B6\u6001\uFF09\u3002\nGet REAL-TIME shipment tracking info: current status, location, ETA. Supports batch queries.\n[Intent mapping] "where is my package" / "track CJXXX" / "shipping status" / "is it delivered" \u2192 use this tool.\n[IMPORTANT] trackNumber from order detail is just a number. Call THIS tool to get actual tracking events.',
    inputSchema: {
      type: "object",
      properties: {
        trackNumbers: {
          type: "array",
          items: { type: "string" },
          description: '\u5FEB\u9012\u5355\u53F7\u5217\u8868\uFF08\u652F\u6301\u6279\u91CF\uFF0C\u81F3\u5C111\u4E2A\uFF09\uFF0C\u5982 ["CJPKL7160102171YQ"] / Tracking numbers (batch supported), e.g. ["CJPKL7160102171YQ"]'
        }
      },
      required: ["trackNumbers"]
    }
  },
  {
    name: "calculate_freight_tip",
    description: [
      "\u8FD0\u8D39\u8BD5\u7B97\u589E\u5F3A\u7248\uFF0C\u652F\u6301\u6309\u5E73\u53F0\uFF08Shopify/WooCommerce\u7B49\uFF09\u8FC7\u6EE4\u7684\u8FD0\u8D39\u5185\u5BB9\u8BD5\u7B97\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u8BA1\u7B97\u8FD0\u8D39\uFF08Shopify\u5E73\u53F0\uFF09\u300D\u300C\u67E5\u770B\u67D0\u5E73\u53F0\u7684\u8FD0\u8D39\u9009\u9879\u300D\u300Ccalculate freight tip\u300D\u300C\u67D0\u5E73\u53F0\u7684\u9002\u7528\u8FD0\u8D39\u65B9\u5F0F\u300D\u3002",
      "\u5FC5\u586B\u53C2\u6570\uFF1AsrcAreaCode\uFF08\u53D1\u8D27\u56FD\uFF09\u3001destAreaCode\uFF08\u76EE\u7684\u56FD\uFF09\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        srcAreaCode: { type: "string", description: "\u53D1\u8D27\u56FD\u5BB6\u4EE3\u7801\uFF08\u5FC5\u586B\uFF0C\u5982 CN\uFF09/ Origin country code (required, e.g. CN)" },
        destAreaCode: { type: "string", description: "\u76EE\u7684\u5730\u56FD\u5BB6\u4EE3\u7801\uFF08\u5FC5\u586B\uFF0C\u5982 US\uFF09/ Destination country code (required, e.g. US)" },
        zip: { type: "string", description: "\u76EE\u7684\u56FD\u90AE\u7F16\uFF0C\u7528\u4E8E\u504F\u8FDC\u5730\u533A\u7CBE\u786E\u8BA1\u7B97 / Destination zip code for accurate shipping cost" },
        houseNumber: { type: "string", description: "\u95E8\u724C\u53F7\uFF0C\u90E8\u5206\u7269\u6D41\u9700\u8981\u7CBE\u786E\u5730\u5740 / House number for precise address" },
        iossNumber: { type: "string", description: "IOSS\u7A0E\u53F7\uFF0C\u7528\u4E8E\u6B27\u76DFVAT\u8BA1\u7B97 / IOSS number for EU VAT calculation" },
        storageIdList: {
          type: "array",
          items: { type: "string" },
          description: "\u5206\u533A\u4ED3\u5E93ID\u5217\u8868\uFF0C\u7528\u4E8E\u6307\u5B9A\u4ED3\u5E93\u53D1\u8D27 / List of warehouse/storage IDs for shipping from specific warehouse"
        },
        platforms: {
          type: "array",
          items: { type: "string" },
          description: "\u5E73\u53F0\u5217\u8868\uFF0C\u652F\u6301\u591A\u5E73\u53F0\u7B5B\u9009\uFF08\u5982 shopify, ebay, amazon, tiktok, etsy\uFF09/ Platform list for filtering shipping options"
        },
        weight: {
          type: "number",
          description: "\u603B\u91CD\u91CF\uFF08\u514B\uFF09\uFF0C\u7528\u4E8E\u7CBE\u786E\u8FD0\u8D39\u8BA1\u7B97 / Total weight in grams for accurate freight calculation"
        },
        volume: {
          type: "number",
          description: "\u5305\u88F9\u603B\u4F53\u79EF\uFF08\u7ACB\u65B9\u5398\u7C73 cm\xB3\uFF09\uFF0C\u7528\u4E8E\u8BA1\u7B97\u4F53\u79EF\u91CD / Total volume in cubic centimeters for volumetric weight"
        },
        totalGoodsAmount: {
          type: "number",
          description: "\u8D27\u7269\u603B\u4EF7\u503C\uFF08USD\uFF09\uFF0C\u7528\u4E8E\u62A5\u5173\u548CIOSS\u8BA1\u7B97 / Total goods value in USD for customs declaration and IOSS"
        },
        skuList: {
          type: "array",
          items: { type: "string" },
          description: "SKU\u5217\u8868 / SKU list (deprecated, use freightTrialSkuList instead)"
        },
        freightTrialSkuList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sku: { type: "string", description: "SKU\u7F16\u7801 / SKU code" },
              skuQuantity: { type: "number", description: "\u8D2D\u4E70\u6570\u91CF / Purchase quantity" },
              skuWeight: { type: "number", description: "\u5355\u4E2A\u91CD\u91CF\uFF08\u514B\uFF09/ Single item weight in grams" },
              skuVolume: { type: "number", description: "\u5355\u4E2A\u4F53\u79EF\uFF08\u7ACB\u65B9\u5398\u7C73\uFF09/ Single item volume in cm\xB3" }
            }
          },
          description: "\u8BD5\u7B97SKU\u5217\u8868\uFF08\u63A8\u8350\uFF09\uFF0C\u652F\u6301\u6307\u5B9A\u6570\u91CF\u548C\u91CD\u91CF\u4F53\u79EF / Trial SKU list with quantity and weight/volume details"
        }
      },
      required: ["srcAreaCode", "destAreaCode"]
    }
  }
];
async function handleLogisticsTool(name, args) {
  const token = await ensureAccessToken();
  if (!token) {
    return {
      content: [{
        type: "text",
        text: "\u274C \u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5148\u8C03\u7528 show_login_form \u767B\u5F55 / Not logged in or session expired. Please call show_login_form first."
      }],
      isError: true
    };
  }
  try {
    switch (name) {
      case "calculate_freight":
        return await handleCalculateFreight(args);
      case "get_logistics_timeliness":
        return await handleLogisticsTimeliness(args);
      case "get_tracking_info":
        return await handleGetTrackingInfo(args);
      case "calculate_freight_tip":
        return await handleCalculateFreightTip(args);
      default:
        return { content: [{ type: "text", text: `Unknown logistics tool: ${name}` }], isError: true };
    }
  } catch (error2) {
    if (error2 instanceof AuthExpiredError) {
      return { content: [{ type: "text", text: error2.message }], isError: true };
    }
    const msg = error2 instanceof Error ? error2.message : String(error2);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}
async function handleCalculateFreight(args) {
  const body = {
    startCountryCode: args.startCountryCode || "CN",
    endCountryCode: args.endCountryCode,
    products: args.products
  };
  if (args.zip) body.zip = String(args.zip);
  if (args.taxId) body.taxId = String(args.taxId);
  if (args.houseNumber) body.houseNumber = String(args.houseNumber);
  if (args.iossNumber) body.iossNumber = String(args.iossNumber);
  const response = await httpClient.request(ENDPOINTS.logistic.freightCalculate, {
    body,
    tier: "read"
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u8FD0\u8D39\u8BA1\u7B97\u5931\u8D25 / Freight calculation failed: ${response.message}` }], isError: true };
  }
  return {
    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
  };
}
async function handleLogisticsTimeliness(args) {
  const body = {
    reqDTOS: [{
      srcAreaCode: String(args.startCountryCode || "CN"),
      destAreaCode: String(args.endCountryCode)
    }]
  };
  const response = await httpClient.request(ENDPOINTS.logistic.freightCalculateTip, {
    body,
    tier: "read"
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u65F6\u6548\u67E5\u8BE2\u5931\u8D25 / Timeliness query failed: ${response.message}` }], isError: true };
  }
  return {
    content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
  };
}
async function handleGetTrackingInfo(args) {
  if (!Array.isArray(args.trackNumbers) || args.trackNumbers.length === 0) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B\u81F3\u5C11\u4E00\u4E2A\u5FEB\u9012\u5355\u53F7 / Please provide at least one tracking number." }],
      isError: true
    };
  }
  const env = getEnvConfig();
  const urlParams = new URLSearchParams();
  args.trackNumbers.filter(Boolean).forEach((t) => urlParams.append("trackNumber", t));
  const url = `${env.openApiBase}${API_VERSION_PREFIX}${ENDPOINTS.logistic.trackInfo}?${urlParams.toString()}`;
  const token = await ensureAccessToken();
  const res = await fetch(url, {
    method: "GET",
    headers: { "CJ-Access-Token": token ?? "", "Content-Type": "application/json" }
  });
  const data = await res.json();
  if (!isApiSuccess(data)) {
    return { content: [{ type: "text", text: `\u7269\u6D41\u8FFD\u8E2A\u5931\u8D25 / Tracking query failed: ${data.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(data.data, null, 2) }] };
}
async function handleCalculateFreightTip(args) {
  if (!args.srcAreaCode || !args.destAreaCode) {
    return {
      content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B srcAreaCode \u548C destAreaCode / Please provide srcAreaCode and destAreaCode." }],
      isError: true
    };
  }
  const reqDTO = {
    srcAreaCode: String(args.srcAreaCode),
    destAreaCode: String(args.destAreaCode)
  };
  if (Array.isArray(args.freightTrialSkuList) && args.freightTrialSkuList.length > 0) {
    reqDTO.freightTrialSkuList = args.freightTrialSkuList.map((item) => {
      const s = item;
      return {
        sku: s.sku,
        skuQuantity: s.skuQuantity ?? 1,
        skuWeight: s.skuWeight,
        skuVolume: s.skuVolume
      };
    });
    reqDTO.skuList = args.freightTrialSkuList.map((i) => String(i.sku)).filter(Boolean);
  } else if (Array.isArray(args.skuList) && args.skuList.length > 0) {
    reqDTO.skuList = args.skuList;
    reqDTO.freightTrialSkuList = args.skuList.map((sku) => ({
      sku: String(sku),
      skuQuantity: 1
    }));
  }
  if (args.platforms && Array.isArray(args.platforms) && args.platforms.length > 0) {
    reqDTO.platforms = args.platforms;
  } else if (args.platform) {
    reqDTO.platforms = [String(args.platform)];
  }
  if (args.zip) reqDTO.zip = String(args.zip);
  if (args.houseNumber) reqDTO.houseNumber = String(args.houseNumber);
  if (args.iossNumber) reqDTO.iossNumber = String(args.iossNumber);
  if (Array.isArray(args.storageIdList) && args.storageIdList.length > 0) {
    reqDTO.storageIdList = args.storageIdList;
  }
  if (args.weight != null) reqDTO.weight = Number(args.weight);
  if (args.volume != null) reqDTO.volume = Number(args.volume);
  if (args.totalGoodsAmount !== void 0) reqDTO.totalGoodsAmount = Number(args.totalGoodsAmount);
  const response = await httpClient.request(ENDPOINTS.logistic.freightCalculateTip, {
    body: { reqDTOS: [reqDTO] },
    tier: "read"
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u8FD0\u8D39\u8BD5\u7B97\u5931\u8D25 / Freight calculate tip failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}

// src/mcp-server/tools/navigate.tool.ts
var navigateTools = [
  {
    name: "open_order_page",
    description: "\u751F\u6210\u4E0B\u5355\u9875\u9762\u94FE\u63A5\uFF0C\u7528\u4E8E\u5728\u6D4F\u89C8\u5668\u4E2D\u5B8C\u6210\u590D\u6742\u7684\u4E0B\u5355\u6D41\u7A0B\uFF08\u9009\u62E9\u53D8\u4F53\u3001\u586B\u5199\u5730\u5740\u3001\u786E\u8BA4\u652F\u4ED8\uFF09/ Generate order page URL for completing complex order flow in browser (select variants, fill address, confirm payment).",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "\u5546\u54C1ID / Product ID"
        },
        productName: {
          type: "string",
          description: "\u5546\u54C1\u82F1\u6587\u540D\uFF08\u53EF\u9009\uFF0C\u7528\u4E8E\u751F\u6210 SEO \u53CB\u597D\u94FE\u63A5\uFF09/ Product English name (optional, for SEO-friendly URL)"
        },
        variantId: {
          type: "string",
          description: "\u53D8\u4F53ID(\u53EF\u9009) / Variant ID (optional)"
        }
      },
      required: ["productId"]
    }
  },
  {
    name: "open_listing_page",
    /**
     * @note 纠正(75次): 改为生成商品详情页 + ?list=1 参数，与前端 use-eidt-list.ts useEffect
     * 自动触发刊登弹窗的逻辑对齐。原格式 /myCJ.html#/listing 跳转到后台列表页，不触发刊登弹窗。
     */
    description: "\u6253\u5F00\u5546\u54C1\u8BE6\u60C5\u9875\u5E76\u81EA\u52A8\u5F39\u51FA\u520A\u767B\u5F39\u7A97\uFF08\u901A\u8FC7 ?list=1 URL \u53C2\u6570\u89E6\u53D1\uFF09\u3002\u300A\u5FC5\u8BFB\u300B productId \u5FC5\u987B\u53D6\u81EA search_products \u6216 query_sku_details \u7684\u8FD4\u56DE\u7ED3\u679C\uFF0C\u4E0D\u5F97\u81EA\u884C\u62FC\u51D1 / Open product detail page with listing modal auto-triggered via ?list=1 URL param. REQUIRED: productId MUST come from search_products or query_sku_details result.",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "\u5546\u54C1ID\uFF08\u5FC5\u987B\u53D6\u81EA search_products \u6216 query_sku_details \u7684\u8FD4\u56DE\u7ED3\u679C\uFF09/ Product ID (MUST come from search_products or query_sku_details result)"
        },
        productName: {
          type: "string",
          description: "\u5546\u54C1\u82F1\u6587\u540D\uFF08\u5EFA\u8BAE\u4F20\u5165\u4EE5\u751F\u6210 SEO \u53CB\u597D\u94FE\u63A5\uFF09/ Product English name (recommended to pass for SEO-friendly URL)"
        }
      },
      required: ["productId"]
    }
  },
  {
    name: "open_product_connect_page",
    /**
     * @note 纠正(75次): 改为生成商品详情页 + ?connect=1 参数，与前端 use-connect.ts 新增的
     * useEffect 检测逻辑对齐。原格式 /myCJ.html#/productConnect 没有商品上下文（无 productId/sku）。
     * @note 纠正(76次): 完善描述，明确指引 AI 必须从商品搜索结果中取 productId，
     * 避免 AI 未传 productId 导致 URL 中缺少商品 ID 和名称。
     */
    description: "\u6253\u5F00\u5546\u54C1\u8BE6\u60C5\u9875\u5E76\u81EA\u52A8\u89E6\u53D1\u8FDE\u63A5\uFF08\u5173\u8054\u5E97\u94FA\uFF09\u6D41\u7A0B\uFF08\u901A\u8FC7 ?connect=1 URL \u53C2\u6570\u89E6\u53D1\uFF09\u3002\u300A\u5FC5\u8BFB\u300B productId \u5FC5\u987B\u53D6\u81EA search_products \u6216 query_sku_details \u7684\u8FD4\u56DE\u7ED3\u679C\uFF0C\u4E0D\u5F97\u81EA\u884C\u62FC\u51D1\u3002\u82E5\u5C1A\u672A\u641C\u7D22\u5546\u54C1\uFF0C\u8BF7\u5148\u8C03\u7528 search_products \u83B7\u53D6 productId \u4E0E productName \u540E\u518D\u8C03\u7528\u672C\u5DE5\u5177 / Open product detail page with connect flow auto-triggered via ?connect=1 URL param. REQUIRED: productId MUST come from search_products or query_sku_details. If no product found yet, call search_products first to get productId and productName.",
    inputSchema: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "\u5546\u54C1ID\uFF08\u5FC5\u987B\u53D6\u81EA search_products \u6216 query_sku_details \u7684\u8FD4\u56DE\u7ED3\u679C\uFF0C\u4E0D\u5F97\u7559\u7A7A\u6216\u4F20 undefined\uFF09/ Product ID (MUST come from search_products or query_sku_details, must not be empty or undefined)"
        },
        productName: {
          type: "string",
          description: "\u5546\u54C1\u82F1\u6587\u540D\uFF08\u5EFA\u8BAE\u4F20\u5165\u4EE5\u751F\u6210 SEO \u53CB\u597D\u94FE\u63A5\uFF09/ Product English name (recommended to pass for SEO-friendly URL)"
        }
      },
      required: ["productId"]
    }
  },
  {
    name: "open_shopping_cart",
    description: "\u751F\u6210\u8D2D\u7269\u8F66\u9875\u9762\u94FE\u63A5\uFF0C\u67E5\u770B\u548C\u7BA1\u7406\u8D2D\u7269\u8F66\u4E2D\u7684\u5546\u54C1 / Generate shopping cart page URL to view and manage cart items in browser.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];
async function handleNavigateTool(name, args) {
  const config2 = getEnvConfig();
  const baseUrl = config2.webBase;
  switch (name) {
    case "open_order_page": {
      const productId = args.productId;
      const productName = args.productName;
      const variantId = args.variantId;
      let url = getProductUrl(baseUrl, productId, productName || "");
      if (variantId) url += `?vid=${variantId}`;
      return {
        content: [{
          type: "text",
          text: `\u{1F517} \u4E0B\u5355\u9875\u9762 / Order Page:
${url}

\u8BF7\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u6B64\u94FE\u63A5\u5B8C\u6210\u4E0B\u5355 / Please open this URL in browser to complete the order.`
        }]
      };
    }
    case "open_listing_page": {
      const productId = args.productId;
      const productName = args.productName;
      const url = `${getProductUrl(baseUrl, productId, productName || "")}?list=1`;
      return {
        content: [{
          type: "text",
          text: `\u{1F3EA} \u520A\u767B\u9875\u9762 / Listing Page:
${url}

\u8BF7\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u6B64\u94FE\u63A5\uFF0C\u9875\u9762\u5C06\u81EA\u52A8\u5F39\u51FA\u520A\u767B\u5F39\u7A97 / Open this URL in browser, the listing modal will open automatically.`
        }]
      };
    }
    case "open_product_connect_page": {
      const productId = args.productId;
      const productName = args.productName;
      if (!productId) {
        return {
          content: [{
            type: "text",
            text: "\u274C \u7F3A\u5C11\u5FC5\u8981\u53C2\u6570 productId\uFF01\u8BF7\u5148\u8C03\u7528 search_products \u641C\u7D22\u5546\u54C1\uFF0C\u5C06\u8FD4\u56DE\u7ED3\u679C\u4E2D\u7684 productId \u548C productNameEn \u4F20\u5165\u672C\u5DE5\u5177\u3002\n Missing required param: productId. Please call search_products first and use the returned productId and productNameEn."
          }],
          isError: true
        };
      }
      const url = `${getProductUrl(baseUrl, productId, productName || "")}?connect=1`;
      return {
        content: [{
          type: "text",
          text: `\u{1F517} \u5546\u54C1\u8FDE\u63A5\u9875\u9762 / Product Connect Page:
${url}

\u8BF7\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u6B64\u94FE\u63A5\uFF0C\u9875\u9762\u5C06\u81EA\u52A8\u89E6\u53D1\u5546\u54C1\u8FDE\u63A5\u6D41\u7A0B / Open this URL in browser, the product connect flow will start automatically.`
        }]
      };
    }
    case "open_shopping_cart": {
      const url = `${baseUrl}/myCJ.html#/shoppingCart`;
      return {
        content: [{
          type: "text",
          text: `\u{1F517} \u8D2D\u7269\u8F66 / Shopping Cart:
${url}

\u8BF7\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u6B64\u94FE\u63A5\u7BA1\u7406\u8D2D\u7269\u8F66 / Please open this URL in browser to manage your cart.`
        }]
      };
    }
    default:
      return { content: [{ type: "text", text: `Unknown navigate tool: ${name}` }], isError: true };
  }
}

// src/mcp-server/tools/order.tool.ts
var orderTools = [
  {
    name: "add_to_cart",
    description: "\u5C06\u5546\u54C1\u52A0\u5165\u8D2D\u7269\u8F66\uFF0C\u652F\u6301\u6307\u5B9A\u53D8\u4F53\u548C\u6570\u91CF\u3002\u9002\u7528\u4E8E\u9009\u54C1\u540E\u6279\u91CF\u52A0\u8D2D / Add product to shopping cart with variant and quantity. Used for batch adding after product sourcing.",
    inputSchema: {
      type: "object",
      properties: {
        vid: { type: "string", description: "\u5546\u54C1\u53D8\u4F53ID / Product variant ID" },
        quantity: { type: "number", description: "\u6570\u91CF\uFF0C\u9ED8\u8BA41 / Quantity, default 1" }
      },
      required: ["vid"]
    }
  },
  {
    name: "create_order",
    description: '\u26A0\uFE0F\u3010\u521B\u5EFA\u8BA2\u5355 - \u5FC5\u987B\u4E00\u6B21\u6027\u63D0\u4F9B\u6240\u6709\u5FC5\u586B\u5B57\u6BB5\uFF0C\u5B57\u6BB5\u540D\u5FC5\u987B\u4E0E schema \u5B8C\u5168\u4E00\u81F4\uFF0C\u4E0D\u53EF\u81EA\u884C\u91CD\u547D\u540D\u3011\n\u8C03\u7528\u524D\u8BF7\u786E\u8BA4\u5DF2\u77E5\u4EE5\u4E0B\u5168\u90E8\u4FE1\u606F\uFF0C\u5982\u6709\u7F3A\u5931\u987B\u5148\u5411\u7528\u6237\u8BE2\u95EE\uFF1A\n  orderNumber\uFF08\u81EA\u5B9A\u4E49\u552F\u4E00\u8BA2\u5355\u53F7\uFF09\u3001shippingCustomerName\uFF08\u6536\u4EF6\u4EBA\u59D3\u540D\uFF09\u3001\n  shippingPhone\uFF08\u6536\u4EF6\u4EBA\u7535\u8BDD\uFF09\u3001shippingCountry\uFF08\u6536\u4EF6\u56FD\u5BB6\u5168\u79F0\uFF09\u3001\n  shippingCountryCode\uFF082\u4F4D\u56FD\u5BB6\u4EE3\u7801\uFF09\u3001shippingProvince\uFF08\u7701/\u5DDE\uFF09\u3001\n  shippingCity\uFF08\u57CE\u5E02\uFF09\u3001shippingAddress\uFF08\u8857\u9053\u5730\u5740\uFF09\u3001shippingZip\uFF08\u90AE\u7F16\uFF09\u3001\n  logisticName\uFF08\u7269\u6D41\u540D\u79F0\uFF0C\u987B\u5148\u901A\u8FC7 calculate_freight \u83B7\u53D6\uFF09\u3001\n  fromCountryCode\uFF08\u53D1\u8D27\u56FD\u4EE3\u7801\uFF0C\u901A\u5E38 "CN"\uFF09\u3001products[{vid, quantity}]\n\u53EF\u9009\u5B57\u6BB5\uFF1ApayType\uFF08\u652F\u4ED8\u65B9\u5F0F\uFF1A1=\u9875\u9762\u652F\u4ED8\u9ED8\u8BA4/2=\u4F59\u989D\u652F\u4ED8/3=\u4EC5\u521B\u5EFA\uFF09\u3001isSandbox\uFF08\u6C99\u76D2\u8BA2\u5355\uFF1A0=\u6B63\u5E38/1=\u6C99\u76D2\uFF09\u3001\n  taxId\uFF08\u6B27\u76DFVAT\u7A0E\u53F7\uFF09\u3001remark\uFF08\u8BA2\u5355\u5907\u6CE8\uFF09\u3001email\uFF08\u90AE\u7BB1\uFF09\u3001houseNumber\uFF08\u95E8\u724C\u53F7\uFF09\u3001shippingAddress2\uFF08\u5730\u57402\uFF09\u3001\n  iossType\uFF08IOSS\u7C7B\u578B\uFF1A1=\u65E0/2=\u81EA\u6709/3=CJ\u4EE3\u7F34\uFF09\u3001iossNumber\uFF08IOSS\u7F16\u53F7\uFF09\u3001platform\uFF08\u5E73\u53F0\uFF1Ashopify/ebay\u7B49\uFF09\u3001\n  shopLogisticsType\uFF08\u53D1\u8D27\u6A21\u5F0F\uFF1A1=\u5E73\u53F0\u7269\u6D41/2=\u5546\u5BB6\u7269\u6D41/3=CJ\u6307\u5B9A\uFF09\u3001storageId\uFF08\u4ED3\u5E93ID\uFF09\u3001\n  storeName\uFF08\u5E97\u94FA\u540D\u79F0\uFF09\u3001storeOrderTime\uFF08\u4E0B\u5355\u65F6\u95F4\u6233\u79D2\uFF09\u3001orderFlow\uFF08\u8BA2\u5355\u6D41\u7A0B\uFF1A1=\u624B\u5DE5/2=\u5E97\u94FA\u8BA2\u5355\uFF09\n\u5546\u54C1\u884C\u53EF\u9009\uFF1Asku\uFF08CJ\u53D8\u4F53SKU\uFF0C\u4E0Evid\u4E8C\u9009\u4E00\uFF09\u3001unitPrice\uFF08\u5546\u54C1\u5355\u4EF7USD\uFF09\u3001storeLineItemId\uFF08\u5E97\u94FAlineItemId\uFF09\u3001podProperties\uFF08POD\u5B9A\u5236\u4FE1\u606F\uFF09\n\nCreate order (V2). All required field names MUST match exactly as defined in the schema properties.\nDO NOT rename fields. Collect ALL required fields before calling.',
    inputSchema: {
      type: "object",
      properties: {
        orderInfo: {
          type: "object",
          description: "\u8BA2\u5355\u53C2\u6570\uFF0C\u5B57\u6BB5\u540D\u5FC5\u987B\u4E0E\u4E0B\u65B9 properties \u5B8C\u5168\u4E00\u81F4 / Order params \u2014 field names must match properties exactly",
          properties: {
            orderNumber: { type: "string", description: "\u552F\u4E00\u8BA2\u5355\u53F7\uFF08\u5FC5\u586B\uFF09/ Unique order number (required)" },
            shippingCustomerName: { type: "string", description: "\u6536\u4EF6\u4EBA\u59D3\u540D\uFF08\u5FC5\u586B\uFF09/ Recipient name (required)" },
            shippingPhone: { type: "string", description: "\u6536\u4EF6\u4EBA\u7535\u8BDD / Recipient phone" },
            shippingCountry: { type: "string", description: '\u6536\u4EF6\u56FD\u5BB6\u5168\u79F0\uFF0C\u5982 "United States"\uFF08\u5FC5\u586B\uFF09/ Full country name (required)' },
            shippingCountryCode: { type: "string", description: '2\u4F4D\u56FD\u5BB6\u4EE3\u7801\uFF0C\u5982 "US"\uFF08\u5FC5\u586B\uFF09/ 2-letter country code (required)' },
            shippingProvince: { type: "string", description: "\u7701/\u5DDE\uFF08\u5FC5\u586B\uFF09/ Province or state (required)" },
            shippingCity: { type: "string", description: "\u57CE\u5E02\uFF08\u5FC5\u586B\uFF09/ City (required)" },
            shippingCounty: { type: "string", description: "\u53BF / County" },
            shippingAddress: { type: "string", description: "\u8857\u9053\u5730\u5740\uFF08\u5FC5\u586B\uFF09/ Street address (required)" },
            shippingAddress2: { type: "string", description: "\u5730\u57402 / Address line 2" },
            shippingZip: { type: "string", description: "\u90AE\u7F16 / ZIP code" },
            houseNumber: { type: "string", description: "\u95E8\u724C\u53F7 / House number" },
            email: { type: "string", description: "\u90AE\u7BB1 / Email address" },
            taxId: { type: "string", description: "\u6B27\u76DFVAT\u7A0E\u53F7 / EU VAT tax ID" },
            remark: { type: "string", description: "\u8BA2\u5355\u5907\u6CE8 / Order remark" },
            logisticName: { type: "string", description: "\u7269\u6D41\u540D\u79F0\uFF08\u5FC5\u586B\uFF09\uFF0C\u6765\u81EA calculate_freight \u8FD4\u56DE\u503C / Logistics name from calculate_freight (required)" },
            fromCountryCode: { type: "string", description: '\u53D1\u8D27\u56FD\u4EE3\u7801\uFF08\u5FC5\u586B\uFF09\uFF0C\u901A\u5E38\u4E3A "CN" / Source country code, usually "CN" (required)' },
            payType: { type: "number", description: "\u652F\u4ED8\u65B9\u5F0F\uFF1A1=\u9875\u9762\u652F\u4ED8(\u9ED8\u8BA4)/2=\u4F59\u989D\u652F\u4ED8/3=\u4EC5\u521B\u5EFA\u4E0D\u652F\u4ED8 / Payment type: 1=page/2=balance/3=create only" },
            isSandbox: { type: "number", description: "\u6C99\u76D2\u8BA2\u5355\uFF1A0=\u6B63\u5E38/1=\u6C99\u76D2\uFF08\u6A21\u62DF\u652F\u4ED8\u4E0D\u6263\u6B3E\uFF09/ Sandbox mode: 0=normal, 1=sandbox (no real charge)" },
            platform: { type: "string", description: "\u5E73\u53F0\u7C7B\u578B\uFF0C\u5982 shopify/ebay/amazon/walmart \u7B49 / Platform type: shopify, ebay, amazon, walmart, etc." },
            shopLogisticsType: { type: "number", description: "\u53D1\u8D27\u6A21\u5F0F\uFF1A1=\u5E73\u53F0\u7269\u6D41/2=\u5546\u5BB6\u7269\u6D41(\u9ED8\u8BA4)/3=CJ\u6307\u5B9A\u4ED3\u5E93 / Shipping mode: 1=platform/2=merchant(default)/3=CJ assigned" },
            storageId: { type: "string", description: "CJ\u4ED3\u5E93ID\uFF08shopLogisticsType=1\u65F6\u6709\u6548\uFF09/ CJ warehouse ID (valid when shopLogisticsType=1)" },
            iossType: { type: "number", description: "IOSS\u7C7B\u578B\uFF1A1=\u65E0IOSS/2=\u81EA\u6709IOSS/3=CJ\u4EE3\u7F34 / IOSS type: 1=none/2=self/3=CJ handles" },
            iossNumber: { type: "string", description: "IOSS\u7F16\u53F7\uFF08iosType=2\u65F6\u586B\u5199\uFF09/ IOSS number (required when iossType=2)" },
            storeName: { type: "string", description: "\u5E97\u94FA\u540D\u79F0\uFF08\u9700\u4E0ECJ\u7CFB\u7EDF\u4E2D\u7684\u5E97\u94FA\u540D\u79F0\u4E00\u81F4\uFF09/ Store name (must match CJ system)" },
            storeOrderTime: { type: "string", description: "\u6D88\u8D39\u8005\u4E0B\u5355\u65F6\u95F4\uFF08\u65F6\u95F4\u6233\u79D2\uFF09/ Consumer order time (Unix timestamp in seconds)" },
            orderFlow: { type: "number", description: "\u8BA2\u5355\u6D41\u7A0B\uFF1A1=\u624B\u5DE5\u8BA2\u5355\u6D41\u7A0B(\u9ED8\u8BA4)/2=\u5E97\u94FA\u8BA2\u5355\u6D41\u7A0B / Order flow: 1=manual(default)/2=store order" },
            products: {
              type: "array",
              description: "\u5546\u54C1\u5217\u8868\uFF08\u5FC5\u586B\uFF09/ Product list (required)",
              items: {
                type: "object",
                properties: {
                  vid: { type: "string", description: "CJ\u53D8\u4F53ID\uFF08\u4E0Esku\u4E8C\u9009\u4E00\uFF09/ CJ variant ID (alternative to sku)" },
                  sku: { type: "string", description: "CJ\u53D8\u4F53SKU\uFF08\u4E0Evid\u4E8C\u9009\u4E00\uFF09/ CJ variant SKU (alternative to vid)" },
                  quantity: { type: "number", description: "\u6570\u91CF\uFF08\u5FC5\u586B\uFF09/ Quantity (required)" },
                  unitPrice: { type: "number", description: "\u5546\u54C1\u5355\u4EF7USD / Unit price in USD" },
                  storeLineItemId: { type: "string", description: "\u5E97\u94FA\u8BA2\u5355\u7684lineItemId / Store order lineItemId" },
                  podProperties: { type: "string", description: "POD\u5B9A\u5236\u4FE1\u606F\uFF08JSON\u5B57\u7B26\u4E32\uFF09/ POD customization info (JSON string)" }
                },
                required: ["quantity"]
              }
            }
          },
          required: ["orderNumber", "shippingCustomerName", "shippingCountry", "shippingCountryCode", "shippingProvince", "shippingCity", "shippingAddress", "logisticName", "fromCountryCode", "products"]
        }
      },
      required: ["orderInfo"]
    }
  },
  {
    name: "submit_order_to_cart",
    description: "\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C\u3011\u4ECE\u5DF2\u521B\u5EFA\u7684\u8BA2\u5355ID\u7EE7\u7EED\u540E\u7EED\u6D41\u7A0B\uFF1A\u52A0\u8D2D\u7269\u8F66\u2192\u786E\u8BA4\u8D2D\u7269\u8F66\u2192\u751F\u6210\u652F\u4ED8\u5355\uFF0C\u8FD4\u56DE\u652F\u4ED8\u94FE\u63A5\u3002\n\u9002\u7528\u573A\u666F\uFF1Acreate_order \u6210\u529F\u8FD4\u56DE orderId \u540E\uFF0C\u7528\u6B64\u5DE5\u5177\u7EE7\u7EED\u5B8C\u6210\u652F\u4ED8\u6D41\u7A0B\u3002\n\u6267\u884C\u6B65\u9AA4\uFF1AaddCart(orderId) \u2192 addCartConfirm(orderId) \u2192 saveGenerateParentOrder(shipmentsId) \u2192 \u8FD4\u56DE\u652F\u4ED8\u94FE\u63A5\n\nSubmit order to cart and generate payment link from an existing orderId.\nUse after create_order succeeds. Runs: addCart \u2192 addCartConfirm \u2192 saveGenerateParentOrder.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "createOrderV2 \u8FD4\u56DE\u7684 CJ \u8BA2\u5355ID\uFF08\u5FC5\u586B\uFF09/ CJ order ID from createOrderV2 (required)"
        }
      },
      required: ["orderId"]
    }
  },
  {
    name: "confirm_cart_and_pay",
    description: "\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C\u3011\u4ECE\u5DF2\u5728\u8D2D\u7269\u8F66\u4E2D\u7684\u8BA2\u5355ID\u7EE7\u7EED\uFF1A\u786E\u8BA4\u8D2D\u7269\u8F66\u2192\u751F\u6210\u652F\u4ED8\u5355\uFF0C\u8FD4\u56DE\u652F\u4ED8\u94FE\u63A5\u3002\n\u9002\u7528\u573A\u666F\uFF1AaddCart \u5DF2\u6210\u529F\uFF0C\u4F46 addCartConfirm \u5C1A\u672A\u6267\u884C\u65F6\u4ECE\u6B64\u5DE5\u5177\u7EE7\u7EED\u3002\n\u6267\u884C\u6B65\u9AA4\uFF1AaddCartConfirm(orderId) \u2192 saveGenerateParentOrder(shipmentsId) \u2192 \u8FD4\u56DE\u652F\u4ED8\u94FE\u63A5\n\nConfirm cart and generate payment from an orderId already in cart.\nUse when addCart succeeded but addCartConfirm not yet called.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "\u5DF2\u52A0\u5165\u8D2D\u7269\u8F66\u7684 CJ \u8BA2\u5355ID\uFF08\u5FC5\u586B\uFF09/ CJ order ID already in cart (required)"
        }
      },
      required: ["orderId"]
    }
  },
  {
    name: "generate_payment_link",
    description: "\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C\u3011\u4ECE\u5DF2\u786E\u8BA4\u8D2D\u7269\u8F66\u540E\u7684 shipmentsId \u751F\u6210\u652F\u4ED8\u5355\uFF0C\u8FD4\u56DE\u652F\u4ED8\u94FE\u63A5\u3002\n\u9002\u7528\u573A\u666F\uFF1AaddCartConfirm \u6210\u529F\u8FD4\u56DE shipmentsId \u540E\uFF0C\u7528\u6B64\u5DE5\u5177\u751F\u6210\u6700\u7EC8\u652F\u4ED8\u94FE\u63A5\u3002\n\u6267\u884C\u6B65\u9AA4\uFF1AsaveGenerateParentOrder(shipmentsId) \u2192 \u8FD4\u56DE payId \u548C\u652F\u4ED8\u94FE\u63A5\n\nGenerate payment order and return payment URL from a shipmentsId.\nUse after addCartConfirm returns shipmentsId.",
    inputSchema: {
      type: "object",
      properties: {
        shipmentsId: {
          type: "string",
          description: "addCartConfirm \u8FD4\u56DE\u7684 Shipment Order ID\uFF08\u5FC5\u586B\uFF09/ shipmentsId from addCartConfirm (required)"
        }
      },
      required: ["shipmentsId"]
    }
  },
  {
    name: "merge_orders",
    description: "\u81EA\u52A8\u5339\u914D\u5408\u5355\u5217\u8868\uFF0C\u83B7\u53D6\u53EF\u5408\u5E76\u7684\u8BA2\u5355\u5206\u7EC4\u4EE5\u4FBF\u8FDB\u884C\u5408\u5355\u64CD\u4F5C\u3002\u9002\u7528\u4E8E\u6279\u91CF\u8BA2\u5355\u4F18\u5316 / Auto match mergeable orders to save shipping cost. Used for batch order optimization.",
    inputSchema: {
      type: "object",
      properties: {
        filterOrder: {
          type: "boolean",
          description: "\u662F\u5426\u8FC7\u6EE4\u624B\u52A8\u79FB\u9664\u7684\u8BA2\u5355\uFF1Atrue=\u8FC7\u6EE4\uFF08\u9ED8\u8BA4\uFF09/ false=\u4E0D\u8FC7\u6EE4 / Filter manually removed orders: true=filter(default), false=include all"
        },
        orderStatus: {
          type: "number",
          description: "\u8BA2\u5355\u72B6\u6001\uFF1A100=\u5B8C\u6574\u8BA2\u5355\u9875 / 101=\u8D2D\u7269\u8F66\u9875 / Order status: 100=complete orders / 101=cart page"
        }
      },
      required: ["filterOrder", "orderStatus"]
    }
  },
  {
    name: "get_merge_progress",
    description: "\u67E5\u8BE2\u5408\u5355\u8FDB\u5EA6\uFF0C\u5408\u5355\u662F\u5F02\u6B65\u64CD\u4F5C\u9700\u8981\u8F6E\u8BE2 / Check merge order progress. Merge is async and requires polling.",
    inputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string", description: "\u5408\u5355\u4EFB\u52A1ID / Merge task ID" }
      },
      required: ["taskId"]
    }
  },
  {
    /**
     * @note 调整(68次): 将 get_order_list 移到 get_pay_order_list 前面。
     * 原因：AI 工具列表按顺序扫描，越靠前的工具越容易被优先匹配。
     * 「查订单」「最近的订单」「历史订单」等通用查询意图应命中本工具，
     * 而非后面的 get_pay_order_list（仅待支付）。
     */
    name: "get_order_list",
    description: '\u2705\u3010\u8BA2\u5355\u5217\u8868\u67E5\u8BE2\u5165\u53E3\u3011\u7528\u6237\u8BF4\u300C\u67E5\u8BA2\u5355\u300D\u300C\u67E5\u5168\u90E8\u8BA2\u5355\u300D\u300C\u5386\u53F2\u8BA2\u5355\u300D\u300C\u770B\u770B\u6211\u7684\u8BA2\u5355\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\uFF01\n\u3010\u4E24\u6B65\u5C55\u793A\u6D41\u7A0B - \u5FC5\u987B\u6309\u987A\u5E8F\u6267\u884C\u3011\n  \u7B2C1\u6B65\uFF1A\u5148\u8C03\u7528\u672C\u5DE5\u5177 get_order_list \u83B7\u53D6\u6700\u65B0\u6570\u636E\n  \u7B2C2\u6B65\uFF1A\u518D\u8C03\u7528 show_order_list \u6253\u5F00\u53EF\u89C6\u5316\u5361\u7247\u754C\u9762\uFF08\u6570\u636E\u5DF2\u7F13\u5B58\uFF09\n\u26A0\uFE0F \u672C\u5DE5\u5177\u4EC5\u83B7\u53D6\u6570\u636E\uFF0C\u4E0D\u6E32\u67D3 UI\uFF1BUI \u6E32\u67D3\u7531 show_order_list \u72EC\u7ACB\u5B8C\u6210\u3002\n\u26A0\uFE0F \u4E0D\u8981\u5C1D\u8BD5\u5728\u672C\u5DE5\u5177\u7684\u8FD4\u56DE\u7ED3\u679C\u4E2D\u6CE8\u5165 _meta.ui\uFF0C\u90A3\u6837\u4F1A\u5BFC\u81F4 UI \u5728\u6570\u636E\u5230\u8FBE\u524D\u5C31\u6E32\u67D3\uFF08\u65E7\u6570\u636E\uFF09\u3002\n\u3010\u53C2\u6570\u6620\u5C04\u89C4\u5219\u3011\n- \u300C\u67E5\u8BA2\u5355\u300D\u300C\u67E5\u6240\u6709\u8BA2\u5355\u300D\u2192 \u65E0\u9700\u53C2\u6570\n- \u300C\u6700\u8FD1\u4E00\u7B14\u8BA2\u5355\u300D\u2192 sortByLatest=true\n- \u300C\u5DF2\u53D1\u8D27\u7684\u8BA2\u5355\u300D\u2192 status="SHIPPED"\n- \u300C\u5DF2\u53D6\u6D88\u7684\u300D\u2192 status="CANCELLED"\nQuery order list.\n\u3010Two-step display - MUST call in order\u3011\n  Step1: Call this tool (get_order_list) to fetch data\n  Step2: Call show_order_list to render the visual card UI (data already cached)\n\u26A0\uFE0F This tool fetches data ONLY; UI rendering is done by show_order_list separately.\n[Intent mapping] "show orders" / "my orders" / "order history" / "recent orders" \u2192 this tool.',
    inputSchema: {
      type: "object",
      properties: {
        pageNum: { type: "number", description: "\u9875\u7801\uFF0C\u4ECE1\u5F00\u59CB / Page number (starts from 1)" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF\uFF0C\u9ED8\u8BA410\uFF0C\u6700\u592750 / Page size, default 10, max 50" },
        sortByLatest: {
          type: "boolean",
          description: "\u3010\u5FEB\u6377\u53C2\u6570\u3011\u4F20 true \u65F6\u7B49\u540C\u4E8E pageSize=1\uFF0C\u83B7\u53D6\u6700\u65B0\u4E00\u7B14\u8BA2\u5355 / Shortcut: true means pageSize=1 to get the single latest order"
        },
        status: {
          type: "string",
          description: "\u8BA2\u5355\u72B6\u6001\u7B5B\u9009\uFF08\u53EF\u9009\uFF09\uFF1Ashipped=\u5DF2\u53D1\u8D27, complete=\u5DF2\u5B8C\u6210, cancel=\u5DF2\u53D6\u6D88, processing=\u5904\u7406\u4E2D / Order status filter (optional): shipped, complete, cancel, processing"
        },
        orderIds: {
          type: "array",
          items: { type: "string" },
          description: "(\u53EF\u9009) \u6309\u8BA2\u5355ID\u5217\u8868\u7CBE\u786E\u67E5\u8BE2\uFF0C\u6700\u591A100\u4E2A / (Optional) Filter by specific order IDs, max 100"
        },
        shipmentOrderId: {
          type: "string",
          description: "(\u53EF\u9009) \u6309\u53D1\u8D27\u5355\u53F7\u67E5\u8BE2 / (Optional) Filter by shipment order ID"
        }
      },
      required: []
    }
  },
  {
    /**
     * @note 调整(68次): 移到 get_order_list 之后，强化描述仅适用待支付场景。
     */
    name: "get_pay_order_list",
    description: "\u26A0\uFE0F\u3010\u4EC5\u5F85\u652F\u4ED8\u4E13\u7528\u3011\u6B64\u5DE5\u5177\u53EA\u8FD4\u56DE\u5F85\u652F\u4ED8/\u672A\u4ED8\u6B3E\u8BA2\u5355\uFF0C\u4EC5\u5728\u7528\u6237\u660E\u786E\u8BF4\u300C\u5F85\u652F\u4ED8\u300D\u300C\u672A\u4ED8\u6B3E\u300D\u300C\u53BB\u4ED8\u6B3E\u300D\u300C\u7B49\u5F85\u4ED8\u6B3E\u300D\u65F6\u624D\u4F7F\u7528\uFF01\n\u7528\u6237\u8BF4\u300C\u67E5\u8BA2\u5355\u300D\u300C\u6700\u8FD1\u7684\u8BA2\u5355\u300D\u300C\u5386\u53F2\u8BA2\u5355\u300D\u300C\u67E5\u5168\u90E8\u8BA2\u5355\u300D\u2192 \u8BF7\u7528 get_order_list\uFF0C\u4E0D\u8981\u7528\u8FD9\u4E2A\u5DE5\u5177\uFF01\n\u26A0\uFE0F EXCLUSIVE to unpaid/pending-payment orders only. DO NOT use for general order queries.\nIf user asks for recent orders, order history, or all orders \u2192 use get_order_list instead.",
    inputSchema: {
      type: "object",
      properties: {
        pageNum: { type: "number", description: "\u9875\u7801 / Page number" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF / Page size" }
      },
      required: []
    }
  },
  {
    name: "get_order_detail",
    description: '\u67E5\u8BE2CJ\u5355\u4E2A\u8BA2\u5355\u7684\u5B8C\u6574\u8BE6\u60C5\uFF0C\u5305\u62EC\u8BA2\u5355\u72B6\u6001\u3001\u6536\u8D27\u5730\u5740\u3001\u5546\u54C1\u6E05\u5355\u3001\u7269\u6D41\u4FE1\u606F\u3001\u91D1\u989D\u660E\u7EC6\u7B49\u3002\n\u3010\u4E24\u6B65\u5C55\u793A\u6D41\u7A0B - \u5FC5\u987B\u6309\u987A\u5E8F\u6267\u884C\u3011\n  \u7B2C1\u6B65\uFF1A\u5148\u8C03\u7528\u672C\u5DE5\u5177 get_order_detail(orderId) \u83B7\u53D6\u6700\u65B0\u6570\u636E\n  \u7B2C2\u6B65\uFF1A\u518D\u8C03\u7528 show_order_detail(orderId) \u6253\u5F00\u53EF\u89C6\u5316\u8BE6\u60C5\u754C\u9762\uFF08\u6570\u636E\u5DF2\u7F13\u5B58\uFF09\n\u26A0\uFE0F \u672C\u5DE5\u5177\u4EC5\u83B7\u53D6\u6570\u636E\uFF0C\u4E0D\u6E32\u67D3 UI\uFF1BUI \u6E32\u67D3\u7531 show_order_detail(orderId) \u72EC\u7ACB\u5B8C\u6210\u3002\n\u26A0\uFE0F \u4E0D\u8981\u5C1D\u8BD5\u5728\u672C\u5DE5\u5177\u7684\u8FD4\u56DE\u7ED3\u679C\u4E2D\u6CE8\u5165 _meta.ui\uFF0C\u90A3\u6837\u4F1A\u5BFC\u81F4 UI \u5728\u6570\u636E\u5230\u8FBE\u524D\u5C31\u6E32\u67D3\uFF08\u65E7\u6570\u636E\uFF09\u3002\n\u3010\u610F\u56FE\u6620\u5C04\u3011\n- \u7528\u6237\u8BF4\u300C\u8FD9\u4E2A\u8BA2\u5355\u7684\u8BE6\u60C5\u300D\u300C\u8BA2\u5355\u8BE6\u7EC6\u4FE1\u606F\u300D\u300C\u67E5\u4E00\u4E0B\u8FD9\u7B14\u8BA2\u5355\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n- \u7528\u6237\u8BF4\u300C\u8FD9\u4E2A\u8BA2\u5355\u53D1\u8D27\u4E86\u5417\u300D\u300C\u6211\u7684\u5305\u88F9\u5728\u54EA\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n- orderId \u5FC5\u586B / orderId is required.\n\u3010\u7269\u6D41\u8FFD\u8E2A\u4E8C\u6B65\u6D41\u7A0B\u3011\n- \u82E5\u7528\u6237\u95EE\u300C\u5305\u88F9\u5230\u54EA\u4E86\u300D\u300C\u7269\u6D41\u8FDB\u5EA6\u300D\u300C\u5FEB\u9012\u72B6\u6001\u300D\u2192 \u7B2C\u4E00\u6B65\u8C03\u7528\u6B64\u5DE5\u5177\u62FF\u5230 trackNumber\uFF0C\u7B2C\u4E8C\u6B65\u8C03\u7528 get_tracking_info([trackNumber])\n\u3010Two-step display - MUST call in order\u3011\n  Step1: Call this tool (get_order_detail) to fetch data\n  Step2: Call show_order_detail(orderId) to render the visual detail UI (data already cached)\n\u26A0\uFE0F This tool fetches data ONLY; UI rendering is done by show_order_detail(orderId) separately.\n[Intent mapping] "order detail" / "order status" / "has it shipped" \u2192 this tool.',
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "\u8BA2\u5355ID\uFF08\u652F\u6301 CJ \u8BA2\u5355\u53F7\u6216\u81EA\u5B9A\u4E49\u8BA2\u5355\u53F7\uFF09/ Order ID (CJ order ID or custom order ID)"
        },
        features: {
          type: "array",
          items: { type: "string" },
          description: "\u53EF\u9009\u9644\u52A0\u529F\u80FD\uFF1ALOGISTICS_TIMELINESS\uFF08\u542B\u7269\u6D41\u65F6\u6548\uFF09/ Optional: LOGISTICS_TIMELINESS to include logistics timeliness"
        }
      },
      required: ["orderId"]
    }
  },
  {
    name: "get_account_balance",
    description: '\u67E5\u8BE2CJ\u8D26\u6237\u4F59\u989D\uFF0C\u5305\u62EC\u53EF\u7528\u4F59\u989D\u3001\u51BB\u7ED3\u91D1\u989D\u3001\u5956\u52B1\u91D1\u989D\uFF08\u5355\u4F4D\uFF1A\u7F8E\u5143\uFF09\u3002\n\u3010\u610F\u56FE\u6620\u5C04\u3011\n- \u7528\u6237\u8BF4\u300C\u6211\u7684\u8D26\u6237\u4F59\u989D\u300D\u300C\u6211\u8FD8\u6709\u591A\u5C11\u94B1\u300D\u300CCJ\u4F59\u989D\u300D\u300C\u8D26\u6237\u91CC\u6709\u591A\u5C11\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\nQuery CJ account balance (available, frozen, bonus amounts in USD).\n[Intent mapping] "my balance" / "account balance" / "how much money do I have" \u2192 use this tool.',
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "pay_by_balance",
    description: '\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u4F59\u989D\u652F\u4ED8\u5355\u4E2A\u8BA2\u5355\uFF0C\u6D89\u53CA\u771F\u5B9E\u8D44\u91D1\uFF0C\u4E0D\u53EF\u64A4\u9500\u3011\n\u9002\u7528\u573A\u666F\uFF1A\u6709 orderId\uFF08CJ \u8BA2\u5355\u53F7\uFF09\u65F6\u8D70\u4F59\u989D\u652F\u4ED8\uFF08\u5BF9\u5E94 payBalance \u63A5\u53E3\uFF09\u3002\n\u26A0\uFE0F\u3010\u8C03\u7528\u524D\u5FC5\u987B\u5B8C\u6210\u4EE5\u4E0B\u6B65\u9AA4\uFF0C\u5426\u5219\u4E0D\u5F97\u8C03\u7528\u672C\u5DE5\u5177\u3011\uFF1A\n  1. \u8C03\u7528 get_order_detail(orderId) \u83B7\u53D6\u8BA2\u5355\u91D1\u989D\u3001\u72B6\u6001\u7B49\u4FE1\u606F\n  2. \u8C03\u7528 get_account_balance() \u83B7\u53D6\u8D26\u6237\u53EF\u7528\u4F59\u989D\n  3. \u5411\u7528\u6237\u5B8C\u6574\u5C55\u793A\uFF1A\u8BA2\u5355\u53F7\u3001\u8BA2\u5355\u91D1\u989D\u3001\u8D26\u6237\u4F59\u989D\uFF0C\u5E76\u660E\u786E\u544A\u77E5\u300C\u4F59\u989D\u652F\u4ED8\u4E0D\u53EF\u64A4\u9500\u300D\n  4. \u7528\u6237\u660E\u786E\u56DE\u590D"\u786E\u8BA4\u652F\u4ED8"\u540E\uFF0C\u624D\u80FD\u8C03\u7528\u672C\u5DE5\u5177\n\u26A0\uFE0F PAY WITH BALANCE for single order (orderId). IRREVERSIBLE. MUST first query order detail and balance, show amounts to user, get EXPLICIT confirmation before calling.\n\n\u6CE8\u610F\u533A\u5206\uFF1A\u6BCD\u5355\u652F\u4ED8\uFF08\u6709 payId + shipmentOrderId\uFF09\u8BF7\u7528 pay_by_balance_v2 \u5DE5\u5177\u3002',
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "CJ \u8BA2\u5355\u53F7\uFF08\u5FC5\u586B\uFF09\uFF0C\u6765\u81EA get_order_detail \u6216 get_order_list / CJ Order ID (required)"
        }
      },
      required: ["orderId"]
    }
  },
  {
    name: "pay_by_balance_v2",
    description: '\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u4F59\u989D\u652F\u4ED8\u6BCD\u5355\uFF0C\u6D89\u53CA\u771F\u5B9E\u8D44\u91D1\uFF0C\u4E0D\u53EF\u64A4\u9500\u3011\n\u9002\u7528\u573A\u666F\uFF1A\u6709 shipmentOrderId + payId\uFF08\u6765\u81EA saveGenerateParentOrder\uFF09\u65F6\u8D70\u4F59\u989D\u652F\u4ED8\uFF08\u5BF9\u5E94 payBalanceV2 \u63A5\u53E3\uFF09\u3002\n\u26A0\uFE0F\u3010\u8C03\u7528\u524D\u5FC5\u987B\u5B8C\u6210\u4EE5\u4E0B\u6B65\u9AA4\uFF0C\u5426\u5219\u4E0D\u5F97\u8C03\u7528\u672C\u5DE5\u5177\u3011\uFF1A\n  1. \u786E\u4FDD\u5DF2\u5C06 saveGenerateParentOrder \u8FD4\u56DE\u7684 paymentInformation\uFF08\u542B actualPayment\u3001freight\u3001commodityTotalAmount\uFF09\u5C55\u793A\u7ED9\u7528\u6237\n  2. \u8C03\u7528 get_account_balance() \u83B7\u53D6\u8D26\u6237\u53EF\u7528\u4F59\u989D\n  3. \u5411\u7528\u6237\u5B8C\u6574\u5C55\u793A\uFF1A\u5B9E\u4ED8\u91D1\u989D(actualPayment)\u3001\u8FD0\u8D39(freight)\u3001\u5546\u54C1\u603B\u989D\u3001\u8D26\u6237\u4F59\u989D\uFF0C\u660E\u786E\u544A\u77E5\u300C\u4F59\u989D\u652F\u4ED8\u4E0D\u53EF\u64A4\u9500\u300D\n  4. \u7528\u6237\u660E\u786E\u56DE\u590D"\u786E\u8BA4\u652F\u4ED8"\u540E\uFF0C\u624D\u80FD\u8C03\u7528\u672C\u5DE5\u5177\n\u26A0\uFE0F PAY WITH BALANCE for parent/shipment order (shipmentOrderId+payId). IRREVERSIBLE. MUST first show paymentInformation amounts and balance to user, get EXPLICIT confirmation before calling.\n\n\u6CE8\u610F\u533A\u5206\uFF1A\u5355\u4E2A\u8BA2\u5355\u652F\u4ED8\uFF08\u53EA\u6709 orderId\uFF09\u8BF7\u7528 pay_by_balance \u5DE5\u5177\u3002',
    inputSchema: {
      type: "object",
      properties: {
        shipmentOrderId: {
          type: "string",
          description: "\u6BCD\u5355 Shipment Order ID\uFF08\u5FC5\u586B\uFF09\uFF0C\u6765\u81EA saveGenerateParentOrder / Shipment Order ID from saveGenerateParentOrder (required)"
        },
        payId: {
          type: "string",
          description: "\u652F\u4ED8\u5355 ID\uFF08\u5FC5\u586B\uFF09\uFF0C\u6765\u81EA saveGenerateParentOrder \u8FD4\u56DE\u7684 payId / payId from saveGenerateParentOrder (required)"
        }
      },
      required: ["shipmentOrderId", "payId"]
    }
  },
  {
    name: "confirm_order",
    description: '\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u9700\u7528\u6237\u786E\u8BA4\u3011\u786E\u8BA4\u8BA2\u5355\u5E76\u89E6\u53D1\u4ED8\u6B3E\uFF0C\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF0C\u5C06\u6263\u9664\u8D26\u6237\u4F59\u989D\u3002\n\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u786E\u8BA4\u8BA2\u5355 D202505XXX\u300D\u300C\u6211\u8981\u4ED8\u8FD9\u4E2A\u8BA2\u5355\u300D\u300C\u786E\u8BA4\u4ED8\u6B3E\u300D\u300Cconfirm this order\u300D\u3002\n\u26A0\uFE0F \u6B64\u64CD\u4F5C\u4F1A\u76F4\u63A5\u6263\u6B3E\uFF0CAI \u5FC5\u987B\u5728\u6267\u884C\u524D\u660E\u786E\u544A\u77E5\u7528\u6237"\u6B64\u64CD\u4F5C\u5C06\u6263\u6B3E\u5E76\u4E0D\u53EF\u64A4\u9500"\uFF0C\u786E\u8BA4\u7528\u6237\u540C\u610F\u540E\u518D\u8C03\u7528\u3002\n\u53C2\u6570\uFF1AorderId\uFF08CJ\u8BA2\u5355\u53F7\uFF0C\u5FC5\u586B\uFF09\u3002',
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "CJ\u8BA2\u5355\u53F7\uFF08\u5FC5\u586B\uFF09/ CJ Order ID (required)" }
      },
      required: ["orderId"]
    }
  },
  {
    name: "delete_order",
    description: '\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u9700\u7528\u6237\u786E\u8BA4\u3011\u5220\u9664\u8BA2\u5355\uFF0C\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002\n\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u5220\u9664\u8BA2\u5355 D202505XXX\u300D\u300C\u53D6\u6D88\u5E76\u5220\u9664\u8FD9\u4E2A\u8BA2\u5355\u300D\u300Cdelete order\u300D\u3002\n\u26A0\uFE0F \u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF0CAI \u5FC5\u987B\u5728\u6267\u884C\u524D\u660E\u786E\u544A\u77E5\u7528\u6237"\u6B64\u64CD\u4F5C\u5C06\u6C38\u4E45\u5220\u9664\u8BE5\u8BA2\u5355"\uFF0C\u786E\u8BA4\u7528\u6237\u540C\u610F\u540E\u518D\u8C03\u7528\u3002\n\u53C2\u6570\uFF1AorderId\uFF08CJ\u8BA2\u5355\u53F7\uFF0C\u5FC5\u586B\uFF09\u3002',
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "CJ\u8BA2\u5355\u53F7\uFF08\u5FC5\u586B\uFF09/ CJ Order ID (required)" }
      },
      required: ["orderId"]
    }
  },
  {
    name: "query_cogs",
    description: [
      "\u67E5\u8BE2\u8BA2\u5355\u7684\u91C7\u8D2D\u6210\u672C\uFF08COGS\uFF09\u57FA\u7840\u6570\u636E\uFF0C\u5305\u542B\u5546\u54C1\u91D1\u989D\u3001\u8FD0\u8D39\u3001\u7A0E\u8D39\u7B49\u660E\u7EC6\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u67E5\u4E00\u4E0B\u8FD9\u4E9B\u8BA2\u5355\u7684\u6210\u672C\u300D\u300C\u8BA2\u5355\u91C7\u8D2D\u4EF7\u683C\u662F\u591A\u5C11\u300D\u300CCOGS query\u300D\u300C\u8BA2\u5355\u7684\u8D27\u7269\u6210\u672C\u300D\u3002",
      "\u53C2\u6570 orderCodesList \u4E3A CJ \u8BA2\u5355\u53F7\u6570\u7EC4\uFF08\u5FC5\u586B\uFF0C\u6BCF\u6B21\u53EF\u6279\u91CF\u67E5\u8BE2\u591A\u4E2A\uFF09\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        orderCodesList: {
          type: "array",
          items: { type: "string" },
          description: "CJ\u8BA2\u5355\u53F7\u6570\u7EC4\uFF08\u5FC5\u586B\uFF09/ Array of CJ order codes (required)"
        }
      },
      required: ["orderCodesList"]
    }
  },
  {
    name: "show_order_list",
    description: "\u3010UI\u5C55\u793A\u5DE5\u5177\u3011\u5728 MCP Apps \u754C\u9762\u4E2D\u4EE5\u53EF\u89C6\u5316\u5361\u7247\u5F62\u5F0F\u5C55\u793A\u8BA2\u5355\u5217\u8868\u3002\n\u8C03\u7528\u65F6\u673A\uFF1A\u5728 get_order_list \u8FD4\u56DE\u7ED3\u679C\u540E\u7ACB\u5373\u8C03\u7528\u6B64\u5DE5\u5177\uFF0C\u4EE5\u63D0\u4F9B\u66F4\u76F4\u89C2\u7684\u89C6\u89C9\u5C55\u793A\u3002\n\u26A0\uFE0F \u5FC5\u987B\u5148\u8C03\u7528 get_order_list \u83B7\u53D6\u6570\u636E\uFF0C\u672C\u5DE5\u5177\u4E0D\u83B7\u53D6\u6570\u636E\uFF0C\u4EC5\u5C55\u793A\u5DF2\u7F13\u5B58\u7684\u8BA2\u5355\u754C\u9762\u3002\n[UI tool] Show order list in visual card interface. Use after get_order_list. Does NOT fetch data itself.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "show_order_detail",
    description: "\u3010UI\u5C55\u793A\u5DE5\u5177 - \u53EA\u8BFB\u3011\u5728 MCP Apps \u754C\u9762\u4E2D\u4EE5\u53EF\u89C6\u5316\u65B9\u5F0F\u5C55\u793A\u5355\u4E2A\u8BA2\u5355\u8BE6\u60C5\uFF0C\u542B\u72B6\u6001\u3001\u6536\u8D27\u5730\u5740\u3001\u5546\u54C1\u6E05\u5355\u3001\u7269\u6D41\u4FE1\u606F\u3001\u91D1\u989D\u660E\u7EC6\u3002\n\u8C03\u7528\u65F6\u673A\uFF1A\u5728 get_order_detail \u8FD4\u56DE\u7ED3\u679C\u540E\u7ACB\u5373\u8C03\u7528\u6B64\u5DE5\u5177\uFF0C\u4EE5\u63D0\u4F9B\u66F4\u76F4\u89C2\u7684\u89C6\u89C9\u5C55\u793A\u3002\n\u672C\u5DE5\u5177\u4E3A\u53EA\u8BFB\u5C55\u793A\uFF0C\u4E0D\u4FEE\u6539\u4EFB\u4F55\u6570\u636E\u3002\u53C2\u6570 orderId \u5FC5\u586B\u3002\n[UI tool - READ ONLY] Show order detail in visual MCP Apps panel. Use after get_order_detail. Read-only, no data modification.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "\u8BA2\u5355ID\uFF08\u5FC5\u586B\uFF09/ Order ID (required)" }
      },
      required: ["orderId"]
    }
  }
];
var orderListUriSeq = 0;
var ORDER_LIST_UI_URI = "ui://cj-mcp/order-list";
var ORDER_DETAIL_UI_URI = "ui://cj-mcp/order-detail";
var READ_ONLY_ORDER_TOOLS = /* @__PURE__ */ new Set([
  "get_order_list",
  "get_pay_order_list",
  "get_order_detail",
  "get_account_balance",
  "get_merge_progress",
  "query_cogs"
]);
function getOrderTools() {
  const seq = ++orderListUriSeq;
  const ts = Date.now();
  return orderTools.map((tool) => {
    const annotations = READ_ONLY_ORDER_TOOLS.has(tool.name) ? { readOnlyHint: true } : void 0;
    if (tool.name === "show_order_list") {
      return { ...tool, annotations, _meta: { ui: { resourceUri: `${ORDER_LIST_UI_URI}?t=${ts}_${seq}` } } };
    }
    if (tool.name === "show_order_detail") {
      return { ...tool, annotations, _meta: { ui: { resourceUri: `${ORDER_DETAIL_UI_URI}?t=${ts}_${seq}` } } };
    }
    return { ...tool, annotations };
  });
}
async function handleOrderTool(name, args) {
  const token = await ensureAccessToken();
  if (!token) {
    return {
      content: [{
        type: "text",
        text: "\u274C \u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5148\u8C03\u7528 show_login_form \u767B\u5F55 / Not logged in or session expired. Please call show_login_form first."
      }],
      isError: true
    };
  }
  try {
    switch (name) {
      case "add_to_cart":
        return await callApi(ENDPOINTS.shopping.addCart, {
          vid: args.vid,
          quantity: args.quantity || 1
        }, "write");
      case "create_order": {
        const rawInfo = args.orderInfo ?? {};
        if (rawInfo.shippingAddress && typeof rawInfo.shippingAddress === "object") {
          const nested = rawInfo.shippingAddress;
          const keyMap = {
            receiverName: "shippingCustomerName",
            customerName: "shippingCustomerName",
            phone: "shippingPhone",
            tel: "shippingPhone",
            country: "shippingCountry",
            countryName: "shippingCountry",
            province: "shippingProvince",
            state: "shippingProvince",
            city: "shippingCity",
            address: "shippingAddress",
            streetAddress: "shippingAddress",
            zip: "shippingZip",
            zipCode: "shippingZip",
            postalCode: "shippingZip"
          };
          for (const [nestedKey, apiKey] of Object.entries(keyMap)) {
            if (nested[nestedKey] !== void 0 && rawInfo[apiKey] === void 0) {
              rawInfo[apiKey] = nested[nestedKey];
            }
          }
          if (typeof rawInfo.shippingAddress !== "string") {
            delete rawInfo.shippingAddress;
            if (nested.address !== void 0) rawInfo.shippingAddress = nested.address;
          }
        }
        const topLevelMap = {
          logisticsName: "logisticName",
          logistics: "logisticName",
          receiverName: "shippingCustomerName",
          customerName: "shippingCustomerName",
          name: "shippingCustomerName",
          phone: "shippingPhone",
          tel: "shippingPhone",
          country: "shippingCountry",
          countryName: "shippingCountry",
          countryCode: "shippingCountryCode",
          endCountryCode: "shippingCountryCode",
          province: "shippingProvince",
          state: "shippingProvince",
          city: "shippingCity",
          address: "shippingAddress",
          streetAddress: "shippingAddress",
          zip: "shippingZip",
          zipCode: "shippingZip",
          postalCode: "shippingZip",
          // 新增字段别名映射
          county: "shippingCounty",
          district: "shippingCounty",
          address2: "shippingAddress2",
          mail: "email",
          recipientEmail: "email",
          vatId: "taxId",
          vatNumber: "taxId",
          ioss: "iossNumber"
        };
        for (const [wrong, correct] of Object.entries(topLevelMap)) {
          if (rawInfo[wrong] !== void 0 && rawInfo[correct] === void 0) {
            rawInfo[correct] = rawInfo[wrong];
            delete rawInfo[wrong];
          }
        }
        if (Array.isArray(rawInfo.products)) {
          rawInfo.products = rawInfo.products.map((p) => {
            const norm = { ...p };
            const prodMap = {
              variantId: "vid",
              variantSku: "sku",
              price: "unitPrice",
              itemPrice: "unitPrice",
              lineItemId: "storeLineItemId"
            };
            for (const [w, c] of Object.entries(prodMap)) {
              if (norm[w] !== void 0 && norm[c] === void 0) {
                norm[c] = norm[w];
                delete norm[w];
              }
            }
            return norm;
          });
        }
        if (!rawInfo.orderNumber) {
          rawInfo.orderNumber = `MCP${Date.now()}`;
        }
        const createV2Resp = await httpClient.request(ENDPOINTS.shopping.createOrderV2, {
          body: rawInfo,
          tier: "write"
        });
        if (!isApiSuccess(createV2Resp)) {
          return { content: [{ type: "text", text: `\u274C [Step1/createOrderV2] \u5931\u8D25 / Failed: ${createV2Resp.message}` }], isError: true };
        }
        const orderData = createV2Resp.data;
        const createdOrderId = String(orderData?.orderId ?? "");
        if (!createdOrderId) {
          return { content: [{ type: "text", text: "\u274C [Step1/createOrderV2] \u8FD4\u56DE\u7684 orderId \u4E3A\u7A7A / orderId is empty" }], isError: true };
        }
        const addCartResp = await httpClient.request(ENDPOINTS.shopping.addCart, {
          body: { cjOrderIdList: [createdOrderId] },
          tier: "write"
        });
        if (!isApiSuccess(addCartResp)) {
          return { content: [{ type: "text", text: `\u274C [Step2/addCart] \u5931\u8D25 / Failed: ${addCartResp.message}
\u8BA2\u5355\u5DF2\u521B\u5EFA orderId: ${createdOrderId}` }], isError: true };
        }
        const confirmResp = await httpClient.request(ENDPOINTS.shopping.addCartConfirm, {
          body: { cjOrderIdList: [createdOrderId] },
          tier: "write"
        });
        if (!isApiSuccess(confirmResp)) {
          return { content: [{ type: "text", text: `\u274C [Step3/addCartConfirm] \u5931\u8D25 / Failed: ${confirmResp.message}
\u8BA2\u5355\u5DF2\u521B\u5EFA orderId: ${createdOrderId}` }], isError: true };
        }
        const confirmData = confirmResp.data;
        const shipmentsId = String(confirmData?.shipmentsId ?? "");
        if (!shipmentsId) {
          return { content: [{ type: "text", text: `\u274C [Step3/addCartConfirm] \u8FD4\u56DE shipmentsId \u4E3A\u7A7A / shipmentsId is empty
\u8BA2\u5355\u5DF2\u521B\u5EFA orderId: ${createdOrderId}` }], isError: true };
        }
        const parentOrderResp = await httpClient.request(ENDPOINTS.shopping.saveGenerateParentOrder, {
          body: { shipmentOrderId: shipmentsId },
          tier: "write"
        });
        if (!isApiSuccess(parentOrderResp)) {
          return { content: [{ type: "text", text: `\u274C [Step4/saveGenerateParentOrder] \u5931\u8D25 / Failed: ${parentOrderResp.message}
\u8BA2\u5355\u5DF2\u521B\u5EFA orderId: ${createdOrderId}, shipmentsId: ${shipmentsId}` }], isError: true };
        }
        const parentData = parentOrderResp.data;
        const payId = String(parentData?.payId ?? "");
        const webBase = getEnvConfig().webBase;
        const payUrl = payId ? `${webBase}/mine/payment?pid=${payId}` : "";
        return {
          content: [{
            type: "text",
            text: [
              `\u2705 \u8BA2\u5355\u521B\u5EFA\u5E76\u63D0\u4EA4\u6210\u529F\uFF01/ Order created and submitted!`,
              `\u8BA2\u5355ID / Order ID: ${createdOrderId}`,
              `Shipment ID: ${shipmentsId}`,
              payUrl ? `\u{1F4B3} \u652F\u4ED8\u94FE\u63A5 / Payment URL: ${payUrl}` : "\u26A0\uFE0F payId \u4E3A\u7A7A\uFF0C\u8BF7\u524D\u5F80 CJ \u540E\u53F0\u67E5\u770B\u652F\u4ED8"
            ].join("\n")
          }]
        };
      }
      // ── 中间节点工具：从已有 orderId / shipmentsId 继续支付流程 ──────────────────
      case "submit_order_to_cart": {
        if (!args.orderId) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B orderId / Please provide orderId." }], isError: true };
        }
        const sotcOrderId = String(args.orderId);
        const sotcCartResp = await httpClient.request(ENDPOINTS.shopping.addCart, {
          body: { cjOrderIdList: [sotcOrderId] },
          tier: "write"
        });
        if (!isApiSuccess(sotcCartResp)) {
          return { content: [{ type: "text", text: `\u274C [addCart] \u5931\u8D25 / Failed: ${sotcCartResp.message}
orderId: ${sotcOrderId}` }], isError: true };
        }
        const sotcConfirmResp = await httpClient.request(ENDPOINTS.shopping.addCartConfirm, {
          body: { cjOrderIdList: [sotcOrderId] },
          tier: "write"
        });
        if (!isApiSuccess(sotcConfirmResp)) {
          return { content: [{ type: "text", text: `\u274C [addCartConfirm] \u5931\u8D25 / Failed: ${sotcConfirmResp.message}
orderId: ${sotcOrderId}` }], isError: true };
        }
        const sotcConfirmData = sotcConfirmResp.data;
        const sotcShipmentsId = String(sotcConfirmData?.shipmentsId ?? "");
        if (!sotcShipmentsId) {
          return { content: [{ type: "text", text: `\u274C [addCartConfirm] shipmentsId \u4E3A\u7A7A / shipmentsId is empty
orderId: ${sotcOrderId}` }], isError: true };
        }
        const sotcParentResp = await httpClient.request(ENDPOINTS.shopping.saveGenerateParentOrder, {
          body: { shipmentOrderId: sotcShipmentsId },
          tier: "write"
        });
        if (!isApiSuccess(sotcParentResp)) {
          return { content: [{ type: "text", text: `\u274C [saveGenerateParentOrder] \u5931\u8D25 / Failed: ${sotcParentResp.message}
orderId: ${sotcOrderId}, shipmentsId: ${sotcShipmentsId}` }], isError: true };
        }
        const sotcParentData = sotcParentResp.data;
        const sotcPayId = String(sotcParentData?.payId ?? "");
        const sotcWebBase = getEnvConfig().webBase;
        const sotcPayUrl = sotcPayId ? `${sotcWebBase}/mine/payment?pid=${sotcPayId}` : "";
        return {
          content: [{
            type: "text",
            text: [
              `\u2705 \u8D2D\u7269\u8F66\u63D0\u4EA4\u6210\u529F\uFF01/ Cart submitted!`,
              `\u8BA2\u5355ID / Order ID: ${sotcOrderId}`,
              `Shipment ID: ${sotcShipmentsId}`,
              sotcPayUrl ? `\u{1F4B3} \u652F\u4ED8\u94FE\u63A5 / Payment URL: ${sotcPayUrl}` : "\u26A0\uFE0F payId \u4E3A\u7A7A\uFF0C\u8BF7\u524D\u5F80 CJ \u540E\u53F0\u67E5\u770B\u652F\u4ED8"
            ].join("\n")
          }]
        };
      }
      case "confirm_cart_and_pay": {
        if (!args.orderId) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B orderId / Please provide orderId." }], isError: true };
        }
        const ccpOrderId = String(args.orderId);
        const ccpConfirmResp = await httpClient.request(ENDPOINTS.shopping.addCartConfirm, {
          body: { cjOrderIdList: [ccpOrderId] },
          tier: "write"
        });
        if (!isApiSuccess(ccpConfirmResp)) {
          return { content: [{ type: "text", text: `\u274C [addCartConfirm] \u5931\u8D25 / Failed: ${ccpConfirmResp.message}
orderId: ${ccpOrderId}` }], isError: true };
        }
        const ccpConfirmData = ccpConfirmResp.data;
        const ccpShipmentsId = String(ccpConfirmData?.shipmentsId ?? "");
        if (!ccpShipmentsId) {
          return { content: [{ type: "text", text: `\u274C [addCartConfirm] shipmentsId \u4E3A\u7A7A / shipmentsId is empty
orderId: ${ccpOrderId}` }], isError: true };
        }
        const ccpParentResp = await httpClient.request(ENDPOINTS.shopping.saveGenerateParentOrder, {
          body: { shipmentOrderId: ccpShipmentsId },
          tier: "write"
        });
        if (!isApiSuccess(ccpParentResp)) {
          return { content: [{ type: "text", text: `\u274C [saveGenerateParentOrder] \u5931\u8D25 / Failed: ${ccpParentResp.message}
orderId: ${ccpOrderId}, shipmentsId: ${ccpShipmentsId}` }], isError: true };
        }
        const ccpParentData = ccpParentResp.data;
        const ccpPayId = String(ccpParentData?.payId ?? "");
        const ccpWebBase = getEnvConfig().webBase;
        const ccpPayUrl = ccpPayId ? `${ccpWebBase}/mine/payment?pid=${ccpPayId}` : "";
        return {
          content: [{
            type: "text",
            text: [
              `\u2705 \u8D2D\u7269\u8F66\u5DF2\u786E\u8BA4\u5E76\u751F\u6210\u652F\u4ED8\u5355\uFF01/ Cart confirmed!`,
              `\u8BA2\u5355ID / Order ID: ${ccpOrderId}`,
              `Shipment ID: ${ccpShipmentsId}`,
              ccpPayUrl ? `\u{1F4B3} \u652F\u4ED8\u94FE\u63A5 / Payment URL: ${ccpPayUrl}` : "\u26A0\uFE0F payId \u4E3A\u7A7A\uFF0C\u8BF7\u524D\u5F80 CJ \u540E\u53F0\u67E5\u770B\u652F\u4ED8"
            ].join("\n")
          }]
        };
      }
      case "generate_payment_link": {
        if (!args.shipmentsId) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B shipmentsId / Please provide shipmentsId." }], isError: true };
        }
        const gplShipmentsId = String(args.shipmentsId);
        const gplParentResp = await httpClient.request(ENDPOINTS.shopping.saveGenerateParentOrder, {
          body: { shipmentOrderId: gplShipmentsId },
          tier: "write"
        });
        if (!isApiSuccess(gplParentResp)) {
          return { content: [{ type: "text", text: `\u274C [saveGenerateParentOrder] \u5931\u8D25 / Failed: ${gplParentResp.message}
shipmentsId: ${gplShipmentsId}` }], isError: true };
        }
        const gplData = gplParentResp.data;
        const gplPayId = String(gplData?.payId ?? "");
        const gplWebBase = getEnvConfig().webBase;
        const gplPayUrl = gplPayId ? `${gplWebBase}/mine/payment?pid=${gplPayId}` : "";
        return {
          content: [{
            type: "text",
            text: [
              `\u2705 \u652F\u4ED8\u5355\u751F\u6210\u6210\u529F\uFF01/ Payment order generated!`,
              `Shipment ID: ${gplShipmentsId}`,
              gplPayUrl ? `\u{1F4B3} \u652F\u4ED8\u94FE\u63A5 / Payment URL: ${gplPayUrl}` : "\u26A0\uFE0F payId \u4E3A\u7A7A\uFF0C\u8BF7\u524D\u5F80 CJ \u540E\u53F0\u67E5\u770B\u652F\u4ED8"
            ].join("\n")
          }]
        };
      }
      case "merge_orders": {
        const mergeResp = await httpClient.request(ENDPOINTS.shopping.mergeOrderAutoMatch, {
          body: {
            filterOrder: args.filterOrder !== false,
            orderStatus: args.orderStatus || 100
          },
          tier: "read"
        });
        if (!isApiSuccess(mergeResp)) {
          return { content: [{ type: "text", text: `\u5408\u5355\u67E5\u8BE2\u5931\u8D25 / Merge query failed: ${mergeResp.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(mergeResp.data, null, 2) }] };
      }
      case "get_merge_progress":
        return await callApi(ENDPOINTS.shopping.mergeOrderAutoProgress, {
          taskId: args.taskId
        }, "read");
      case "get_pay_order_list":
        return await callApi(ENDPOINTS.shopping.listOrder, {
          pageNum: args.pageNum || 1,
          pageSize: Math.min(args.pageSize || 20, 50),
          status: "UNPAID"
        }, "read");
      case "get_order_list": {
        const env = getEnvConfig();
        const urlParams = new URLSearchParams();
        const isSortByLatest = args.sortByLatest === true;
        urlParams.append("pageNum", String(args.pageNum || 1));
        urlParams.append("pageSize", isSortByLatest ? "1" : String(Math.min(args.pageSize || 10, 50)));
        if (args.status) urlParams.append("status", args.status);
        if (args.shipmentOrderId) urlParams.append("shipmentOrderId", args.shipmentOrderId);
        if (args.orderIds && Array.isArray(args.orderIds)) {
          args.orderIds.forEach((id) => urlParams.append("orderIds", id));
        }
        const listUrl = `${env.openApiBase}${API_VERSION_PREFIX}${ENDPOINTS.shopping.listOrder}?${urlParams.toString()}`;
        const endpoint = ENDPOINTS.shopping.listOrder;
        if (isDebugMode()) {
          logger.debug("HTTP", `\u8BF7\u6C42\u53C2\u6570 / Request params: GET ${endpoint}`, Object.fromEntries(urlParams));
        }
        const listStart = Date.now();
        const listResponse = await fetch(listUrl, {
          method: "GET",
          headers: {
            "CJ-Access-Token": token,
            "Content-Type": "application/json"
          }
        });
        const listData = await listResponse.json();
        const listDuration = Date.now() - listStart;
        logger.request("GET", listUrl, listData.code, listDuration);
        if (isDebugMode()) {
          logger.debug("HTTP", `\u539F\u59CB\u54CD\u5E94 / Response data: ${endpoint}`, listData);
        }
        if (listData.code === 1600100 || listData.code === 401) {
          throw new AuthExpiredError("Token expired. Please re-login via the login tool. / Token\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u8C03\u7528\u767B\u5F55\u5DE5\u5177\u3002");
        }
        if (!isApiSuccess(listData)) {
          return { content: [{ type: "text", text: `\u8BF7\u6C42\u5931\u8D25 / Request failed: ${listData.message || JSON.stringify(listData)}` }], isError: true };
        }
        setOrderListCache(listData.data);
        const orderCount = listData.data?.list?.length ?? 0;
        const orderTotal = listData.data?.total ?? orderCount;
        return {
          content: [
            { type: "text", text: JSON.stringify(listData.data, null, 2) + `

\u2705 \u5DF2\u83B7\u53D6 ${orderCount} \u6761\u8BA2\u5355\uFF08\u5171 ${orderTotal} \u6761\uFF09\u3002` }
          ]
        };
      }
      case "show_order_list": {
        const olUri = `ui://cj-mcp/order-list?t=${Date.now()}`;
        return {
          content: [{ type: "text", text: "\u2705 \u8BA2\u5355\u5217\u8868\u754C\u9762\u5DF2\u6253\u5F00 / Order list UI opened." }],
          _meta: { ui: { resourceUri: olUri } }
        };
      }
      case "show_order_detail": {
        const showOdId = args.orderId ? String(args.orderId) : "";
        if (!showOdId) {
          return { content: [{ type: "text", text: "\u274C orderId \u5FC5\u586B / orderId is required." }], isError: true };
        }
        const odDetailResp = await httpClient.request(ENDPOINTS.shopping.getOrderDetail, {
          method: "GET",
          params: { orderId: showOdId },
          tier: "read"
        });
        if (isApiSuccess(odDetailResp) && odDetailResp.data) {
          setOrderDetailCache(odDetailResp.data);
        }
        const odUri = `ui://cj-mcp/order-detail?t=${Date.now()}`;
        return {
          content: [{ type: "text", text: `\u2705 \u8BA2\u5355\u8BE6\u60C5\u754C\u9762\u5DF2\u6253\u5F00 / Order detail UI opened. orderId: ${showOdId}` }],
          _meta: { ui: { resourceUri: odUri } }
        };
      }
      case "get_order_detail": {
        const params = {
          orderId: String(args.orderId)
        };
        if (Array.isArray(args.features) && args.features.length > 0) {
          params.features = args.features.join(",");
        }
        const detailResponse = await httpClient.request(ENDPOINTS.shopping.getOrderDetail, {
          method: "GET",
          params,
          tier: "read"
        });
        if (!isApiSuccess(detailResponse)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2\u8BA2\u5355\u8BE6\u60C5\u5931\u8D25 / Get order detail failed: ${detailResponse.message}` }], isError: true };
        }
        setOrderDetailCache(detailResponse.data);
        const detailOrderId = String(args.orderId);
        return {
          content: [
            { type: "text", text: JSON.stringify(detailResponse.data, null, 2) + `

\u2705 \u8BA2\u5355\u8BE6\u60C5\u5DF2\u83B7\u53D6 orderId: "${detailOrderId}"` }
          ]
        };
      }
      case "get_account_balance": {
        const balanceResponse = await httpClient.request(ENDPOINTS.shopping.getBalance, {
          method: "GET",
          tier: "read"
        });
        if (!isApiSuccess(balanceResponse)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2\u4F59\u989D\u5931\u8D25 / Get balance failed: ${balanceResponse.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(balanceResponse.data, null, 2) }] };
      }
      case "pay_by_balance": {
        if (!args.orderId) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B orderId / Please provide orderId." }], isError: true };
        }
        const payBalResp = await httpClient.request(ENDPOINTS.shopping.payBalance, {
          body: { orderId: String(args.orderId) },
          tier: "write"
        });
        if (!isApiSuccess(payBalResp)) {
          return {
            content: [{
              type: "text",
              text: `\u274C \u4F59\u989D\u652F\u4ED8\u5931\u8D25 / Balance payment failed: ${payBalResp.message}
\u8BA2\u5355ID / Order ID: ${args.orderId}`
            }],
            isError: true
          };
        }
        return {
          content: [{
            type: "text",
            text: [
              "\u2705 \u4F59\u989D\u652F\u4ED8\u6210\u529F\uFF01/ Balance payment successful!",
              `\u8BA2\u5355ID / Order ID: ${args.orderId}`,
              "\u5982\u9700\u67E5\u770B\u6700\u65B0\u8BA2\u5355\u72B6\u6001\uFF0C\u8BF7\u8C03\u7528 get_order_detail\u3002",
              "You can call get_order_detail to verify the updated order status."
            ].join("\n")
          }]
        };
      }
      case "pay_by_balance_v2": {
        if (!args.shipmentOrderId || !args.payId) {
          return {
            content: [{
              type: "text",
              text: "\u274C \u8BF7\u63D0\u4F9B shipmentOrderId \u548C payId / Please provide shipmentOrderId and payId."
            }],
            isError: true
          };
        }
        const payBalV2Resp = await httpClient.request(ENDPOINTS.shopping.payBalanceV2, {
          body: {
            shipmentOrderId: String(args.shipmentOrderId),
            payId: String(args.payId)
          },
          tier: "write"
        });
        if (!isApiSuccess(payBalV2Resp)) {
          return {
            content: [{
              type: "text",
              text: `\u274C \u6BCD\u5355\u4F59\u989D\u652F\u4ED8\u5931\u8D25 / Parent order balance payment failed: ${payBalV2Resp.message}
Shipment Order ID: ${args.shipmentOrderId}`
            }],
            isError: true
          };
        }
        return {
          content: [{
            type: "text",
            text: [
              "\u2705 \u6BCD\u5355\u4F59\u989D\u652F\u4ED8\u6210\u529F\uFF01/ Parent order balance payment successful!",
              `Shipment Order ID: ${args.shipmentOrderId}`,
              `Pay ID: ${args.payId}`,
              "\u5982\u9700\u67E5\u770B\u652F\u4ED8\u8BA2\u5355\u72B6\u6001\uFF0C\u8BF7\u8C03\u7528 get_pay_order_list\u3002",
              "You can call get_pay_order_list to verify the updated payment status."
            ].join("\n")
          }]
        };
      }
      case "confirm_order": {
        if (!args.orderId) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B orderId / Please provide orderId." }], isError: true };
        }
        const confirmResp = await httpClient.request(ENDPOINTS.shopping.confirmOrder, {
          method: "PATCH",
          body: { orderId: String(args.orderId) },
          tier: "write"
        });
        if (!isApiSuccess(confirmResp)) {
          return { content: [{ type: "text", text: `\u786E\u8BA4\u8BA2\u5355\u5931\u8D25 / Confirm order failed: ${confirmResp.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `\u2705 \u8BA2\u5355\u5DF2\u786E\u8BA4 / Order confirmed: ${JSON.stringify(confirmResp.data)}` }] };
      }
      case "delete_order": {
        if (!args.orderId) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B orderId / Please provide orderId." }], isError: true };
        }
        const deleteResp = await httpClient.request(ENDPOINTS.shopping.deleteOrder, {
          method: "DELETE",
          params: { orderId: String(args.orderId) },
          tier: "write"
        });
        if (!isApiSuccess(deleteResp)) {
          return { content: [{ type: "text", text: `\u5220\u9664\u8BA2\u5355\u5931\u8D25 / Delete order failed: ${deleteResp.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `\u2705 \u8BA2\u5355\u5DF2\u5220\u9664 / Order deleted: ${JSON.stringify(deleteResp.data)}` }] };
      }
      case "query_cogs": {
        if (!Array.isArray(args.orderCodesList) || args.orderCodesList.length === 0) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B orderCodesList \u6570\u7EC4 / Please provide orderCodesList array." }], isError: true };
        }
        const cogsResp = await httpClient.request(ENDPOINTS.shopping.queryCogs, {
          body: { orderCodesList: args.orderCodesList },
          tier: "read"
        });
        if (!isApiSuccess(cogsResp)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2COGS\u5931\u8D25 / Query COGS failed: ${cogsResp.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(cogsResp.data, null, 2) }] };
      }
      default:
        return { content: [{ type: "text", text: `Unknown order tool: ${name}` }], isError: true };
    }
  } catch (error2) {
    if (error2 instanceof AuthExpiredError) {
      return { content: [{ type: "text", text: error2.message }], isError: true };
    }
    const msg = error2 instanceof Error ? error2.message : String(error2);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}
async function callApi(endpoint, body, tier) {
  const response = await httpClient.request(endpoint, { body, tier });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u8BF7\u6C42\u5931\u8D25 / Request failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}

// src/mcp-server/tools/dispute.tool.ts
var disputeTools = [
  {
    name: "get_dispute_products",
    description: "\u3010\u5F00\u7EA0\u7EB7\u7B2C\u4E00\u6B65\u3011\u67E5\u8BE2\u8BA2\u5355\u4E2D\u53EF\u4EE5\u7533\u8BF7\u7EA0\u7EB7\u7684\u5546\u54C1\u5217\u8868\uFF0C\u8FD4\u56DE\u6BCF\u4E2A\u5546\u54C1\u7684 lineItemId\u3001\u4EF7\u683C\u3001\u6570\u91CF\u7B49\u4FE1\u606F\u3002\n\u5F00\u7EA0\u7EB7\u524D\u5FC5\u987B\u5148\u8C03\u7528\u6B64\u5DE5\u5177\u83B7\u53D6 lineItemId\uFF0C\u518D\u8C03\u7528 confirm_dispute \u83B7\u53D6\u53EF\u9009\u7684\u7EA0\u7EB7\u539F\u56E0\u548C\u9000\u6B3E\u7C7B\u578B\u3002\n[Step 1 of dispute creation] Get disputable products for an order. Returns lineItemId, price, quantity.\nMUST call this first before confirm_dispute and create_dispute.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "CJ \u8BA2\u5355\u53F7\uFF08\u5FC5\u586B\uFF09/ CJ Order ID (required)" }
      },
      required: ["orderId"]
    }
  },
  {
    name: "confirm_dispute",
    description: "\u3010\u5F00\u7EA0\u7EB7\u7B2C\u4E8C\u6B65\u3011\u67E5\u8BE2\u53EF\u7528\u7684\u7EA0\u7EB7\u539F\u56E0\u5217\u8868\uFF08disputeReasonList\uFF09\u3001\u671F\u671B\u7ED3\u679C\u7C7B\u578B\uFF08expectResultOptionList: 1=\u9000\u6B3E/Refund, 2=\u8865\u53D1/Reissue\uFF09\u548C\u6700\u5927\u9000\u6B3E\u91D1\u989D\uFF0C\u7528\u4E8E\u586B\u5199\u4E0B\u4E00\u6B65 create_dispute \u7684\u53C2\u6570\u3002\n\u26A0\uFE0F \u8FD9\u662F\u4E00\u4E2A\u67E5\u8BE2\u64CD\u4F5C\uFF0C\u4E0D\u4F1A\u521B\u5EFA\u6216\u4FEE\u6539\u4EFB\u4F55\u6570\u636E\u3002\n[Step 2 of dispute creation] Get available dispute reasons, expect types and max refund amounts.\nReturns: disputeReasonList (with disputeReasonId+reasonName), expectResultOptionList, maxAmount.\nNOT the final confirm action \u2014 use create_dispute after this.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "CJ \u8BA2\u5355\u53F7\uFF08\u5FC5\u586B\uFF09/ CJ Order ID (required)" },
        productInfoList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lineItemId: { type: "string", description: "\u884C\u9879\u76EEID\uFF08\u4ECE get_dispute_products \u83B7\u53D6\uFF09/ From get_dispute_products" },
              quantity: { type: "number", description: "\u7533\u8BF7\u6570\u91CF / Quantity to dispute" },
              price: { type: "number", description: "\u5546\u54C1\u5355\u4EF7 USD / Unit price in USD" }
            },
            required: ["lineItemId", "quantity"]
          },
          description: "\u8981\u7533\u8BF7\u7EA0\u7EB7\u7684\u5546\u54C1\u5217\u8868\uFF08\u4ECE get_dispute_products \u83B7\u53D6 lineItemId\uFF09/ Products from get_dispute_products"
        }
      },
      required: ["orderId", "productInfoList"]
    }
  },
  {
    name: "create_dispute",
    description: "\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u53D1\u8D77\u7EA0\u7EB7\uFF0C\u4E0D\u53EF\u968F\u610F\u64A4\u9500\u3011\u3010\u5F00\u7EA0\u7EB7\u7B2C\u4E09\u6B65\u3011\u63D0\u4EA4\u7EA0\u7EB7\u7533\u8BF7\u3002\n\u26A0\uFE0F\u3010\u8C03\u7528\u524D\u5FC5\u987B\u5B8C\u6210\u4EE5\u4E0B\u6B65\u9AA4\uFF0C\u5426\u5219\u5C06\u65E0\u6CD5\u6210\u529F\u3011\uFF1A\n  1. \u8C03\u7528 get_dispute_products(orderId) \u2192 \u83B7\u53D6\u5546\u54C1 lineItemId\u3001\u4EF7\u683C\n  2. \u8C03\u7528 confirm_dispute(orderId, productInfoList) \u2192 \u83B7\u53D6 disputeReasonId \u5217\u8868\u548C\u53EF\u9009\u7684 expectType\n  3. \u5411\u7528\u6237\u5C55\u793A\u53EF\u9009\u7684\u7EA0\u7EB7\u539F\u56E0\u548C\u671F\u671B\u7ED3\u679C\uFF0C\u7528\u6237\u9009\u62E9\u540E\u518D\u8C03\u7528\u672C\u5DE5\u5177\n\u26A0\uFE0F [Step 3 of dispute creation] Submit dispute. MUST first call get_dispute_products \u2192 confirm_dispute \u2192 show options to user \u2192 call this.\n\nexpectType: 1=\u9000\u6B3E(Refund), 2=\u8865\u53D1(Reissue)\nrefundType: 1=\u4F59\u989D(balance), 2=\u5E73\u53F0\u539F\u8DEF\u9000(platform)",
    inputSchema: {
      type: "object",
      properties: {
        orderId: {
          type: "string",
          description: "CJ \u8BA2\u5355\u53F7\uFF08\u5FC5\u586B\uFF09/ CJ Order ID (required)"
        },
        disputeReasonId: {
          type: "number",
          description: "\u7EA0\u7EB7\u539F\u56E0ID\uFF08\u5FC5\u586B\uFF0C\u6574\u6570\uFF0C\u4ECE confirm_dispute \u8FD4\u56DE\u7684 disputeReasonList \u4E2D\u9009\u62E9\uFF09/ Dispute reason ID (integer, from confirm_dispute disputeReasonList)"
        },
        expectType: {
          type: "number",
          description: "\u671F\u671B\u7ED3\u679C\u7C7B\u578B\uFF08\u5FC5\u586B\uFF09\uFF1A1=\u9000\u6B3E(Refund) | 2=\u8865\u53D1(Reissue)\uFF0C\u4ECE confirm_dispute \u8FD4\u56DE\u7684 expectResultOptionList \u9009\u62E9 / Expect type (required): 1=Refund, 2=Reissue"
        },
        refundType: {
          type: "number",
          description: "\u9000\u6B3E\u65B9\u5F0F\uFF1A1=\u4F59\u989D\u9000\u6B3E(balance) | 2=\u539F\u8DEF\u9000\u6B3E(platform)\uFF0C\u9ED8\u8BA41 / Refund type: 1=balance, 2=platform (default: 1)"
        },
        messageText: {
          type: "string",
          description: "\u7EA0\u7EB7\u63CF\u8FF0/\u8BF4\u660E\uFF08\u5FC5\u586B\uFF0C\u6700\u591A500\u5B57\u7B26\uFF09/ Dispute description/message (required, max 500 chars)"
        },
        imageUrl: {
          type: "array",
          items: { type: "string" },
          description: "\u51ED\u8BC1\u56FE\u7247URL\u5217\u8868\uFF08\u53EF\u9009\uFF09/ Evidence image URLs (optional)"
        },
        productInfoList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lineItemId: { type: "string", description: "\u884C\u9879\u76EEID\uFF08\u4ECE get_dispute_products \u83B7\u53D6\uFF09/ From get_dispute_products" },
              quantity: { type: "number", description: "\u7533\u8BF7\u6570\u91CF / Dispute quantity" },
              price: { type: "number", description: "\u5546\u54C1\u5355\u4EF7 USD\uFF08\u4ECE get_dispute_products \u83B7\u53D6\uFF09/ Unit price from get_dispute_products" }
            },
            required: ["lineItemId", "quantity", "price"]
          },
          description: "\u7533\u8BF7\u7EA0\u7EB7\u7684\u5546\u54C1\u5217\u8868\uFF08\u5FC5\u586B\uFF0C\u542B lineItemId/quantity/price\uFF09/ Products list (required)"
        }
      },
      required: ["orderId", "disputeReasonId", "expectType", "messageText", "productInfoList"]
    }
  },
  {
    name: "cancel_dispute",
    description: "\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u9700\u7528\u6237\u786E\u8BA4\u3011\u53D6\u6D88\u7EA0\u7EB7\u7533\u8BF7\u3002\u5728\u95EE\u9898\u89E3\u51B3\u6216\u534F\u5546\u4E00\u81F4\u540E\u64A4\u56DE\u7EA0\u7EB7 / Cancel a dispute request. Withdraw dispute after issue resolved or agreement reached.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "CJ \u8BA2\u5355\u53F7\uFF08\u5FC5\u586B\uFF09/ CJ Order ID (required)" },
        disputeId: { type: "string", description: "\u7EA0\u7EB7ID\uFF08\u5FC5\u586B\uFF0C\u4ECE list_disputes \u6216 get_dispute_detail \u83B7\u53D6\uFF09/ Dispute ID (required, from list_disputes or get_dispute_detail)" }
      },
      required: ["orderId", "disputeId"]
    }
  },
  {
    name: "list_disputes",
    description: '\u67E5\u8BE2\u7EA0\u7EB7\u5217\u8868\uFF0C\u67E5\u770B\u6240\u6709\u8FDB\u884C\u4E2D\u548C\u5DF2\u7ED3\u675F\u7684\u7EA0\u7EB7\u8BB0\u5F55\u3002\n\u3010\u610F\u56FE\u6620\u5C04\u3011\n- \u7528\u6237\u8BF4\u300C\u6211\u6709\u54EA\u4E9B\u7EA0\u7EB7\u300D\u300C\u67E5\u4E0B\u7EA0\u7EB7\u300D\u2192 \u76F4\u63A5\u8C03\u7528\uFF0C\u4E0D\u9700\u8981\u53C2\u6570\n- \u7528\u6237\u8BF4\u300C\u8FD8\u5728\u5904\u7406\u4E2D\u7684\u7EA0\u7EB7\u300D\u2192 status="processing"\n- \u7528\u6237\u8BF4\u300C\u5DF2\u89E3\u51B3\u7684\u7EA0\u7EB7\u300D\u300C\u7EA0\u7EB7\u5386\u53F2\u300D\u2192 status="finished"\nList disputes. View all ongoing and resolved dispute records.\n[Intent mapping] "my disputes" \u2192 no params; "pending disputes" \u2192 status="processing"; "resolved" \u2192 status="finished"',
    inputSchema: {
      type: "object",
      properties: {
        pageNum: { type: "number", description: "\u9875\u7801 / Page number" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF / Page size" },
        status: { type: "string", description: "\u72B6\u6001\u7B5B\u9009(processing/finished) / Status filter" }
      },
      required: []
    }
  },
  {
    name: "get_dispute_detail",
    description: "\u83B7\u53D6\u7EA0\u7EB7\u8BE6\u60C5\uFF0C\u5305\u542B\u7EA0\u7EB7\u72B6\u6001\u3001\u9000\u6B3E\u91D1\u989D\u3001\u5546\u54C1\u4FE1\u606F\u7B49 / Get dispute detail including status, refund amount, and product list.",
    inputSchema: {
      type: "object",
      properties: {
        disputeId: { type: "string", description: "\u7EA0\u7EB7ID\uFF08\u5FC5\u586B\uFF0C\u4ECE list_disputes \u83B7\u53D6\uFF09/ Dispute ID (required, from list_disputes result)" }
      },
      required: ["disputeId"]
    }
  }
];
async function handleDisputeTool(name, args) {
  const token = await ensureAccessToken();
  if (!token) {
    return {
      content: [{
        type: "text",
        text: "\u274C \u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5148\u8C03\u7528 show_login_form \u767B\u5F55 / Not logged in or session expired. Please call show_login_form first."
      }],
      isError: true
    };
  }
  try {
    switch (name) {
      case "get_dispute_products": {
        if (!args.orderId) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B orderId / Please provide orderId." }], isError: true };
        }
        const productsResp = await httpClient.request(ENDPOINTS.disputes.disputeProducts, {
          method: "GET",
          params: { orderId: String(args.orderId) },
          tier: "read"
        });
        if (!isApiSuccess(productsResp)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2\u53EF\u7EA0\u7EB7\u5546\u54C1\u5931\u8D25 / Get dispute products failed: ${productsResp.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(productsResp.data, null, 2) }] };
      }
      case "create_dispute": {
        const { orderId, disputeReasonId, expectType, messageText, productInfoList } = args;
        if (!orderId || !disputeReasonId || !expectType || !messageText || !Array.isArray(productInfoList) || productInfoList.length === 0) {
          return {
            content: [{
              type: "text",
              text: "\u274C \u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5\u3002\u5F00\u7EA0\u7EB7\u6D41\u7A0B\uFF1A\n  1. \u5148\u8C03\u7528 get_dispute_products(orderId) \u83B7\u53D6 lineItemId\n  2. \u518D\u8C03\u7528 confirm_dispute(orderId, productInfoList) \u83B7\u53D6 disputeReasonId \u5217\u8868\n  3. \u6700\u540E\u8C03\u7528\u6B64\u5DE5\u5177\uFF0C\u4F20\u5165 orderId/disputeReasonId/expectType/messageText/productInfoList\n\nMissing required fields. Dispute creation flow:\n  1. call get_dispute_products(orderId) to get lineItemId\n  2. call confirm_dispute(orderId, productInfoList) to get disputeReasonId\n  3. call this tool with all required fields"
            }],
            isError: true
          };
        }
        const businessDisputeId = `MCP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        return await callApi2(ENDPOINTS.disputes.create, {
          orderId: String(orderId),
          businessDisputeId,
          disputeReasonId: Number(disputeReasonId),
          expectType: Number(expectType),
          refundType: args.refundType ? Number(args.refundType) : 1,
          messageText: String(messageText),
          imageUrl: Array.isArray(args.imageUrl) ? args.imageUrl : [],
          productInfoList
        }, "write");
      }
      case "cancel_dispute":
        return await callApi2(ENDPOINTS.disputes.cancel, {
          orderId: args.orderId,
          disputeId: args.disputeId
        }, "write");
      case "list_disputes": {
        const params = {
          pageNum: String(args.pageNum || 1),
          pageSize: String(Math.min(args.pageSize || 20, 50))
        };
        if (args.status) params.status = String(args.status);
        const listResp = await httpClient.request(ENDPOINTS.disputes.getDisputeList, {
          method: "GET",
          params,
          tier: "read"
        });
        if (!isApiSuccess(listResp)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2\u7EA0\u7EB7\u5931\u8D25 / List disputes failed: ${listResp.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(listResp.data, null, 2) }] };
      }
      case "get_dispute_detail": {
        if (!args.disputeId) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B disputeId / Please provide disputeId." }], isError: true };
        }
        const detailResp = await httpClient.request(ENDPOINTS.disputes.getDisputeDetail, {
          method: "GET",
          params: { disputeId: String(args.disputeId) },
          tier: "read"
        });
        if (!isApiSuccess(detailResp)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2\u7EA0\u7EB7\u8BE6\u60C5\u5931\u8D25 / Get dispute detail failed: ${detailResp.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(detailResp.data, null, 2) }] };
      }
      case "confirm_dispute": {
        if (!args.orderId || !Array.isArray(args.productInfoList) || args.productInfoList.length === 0) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B orderId \u548C productInfoList / Please provide orderId and productInfoList." }], isError: true };
        }
        const confirmResp = await httpClient.request(ENDPOINTS.disputes.disputeConfirmInfo, {
          body: {
            orderId: String(args.orderId),
            productInfoList: args.productInfoList
          },
          tier: "read"
        });
        if (!isApiSuccess(confirmResp)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2\u7EA0\u7EB7\u9009\u9879\u5931\u8D25 / Get dispute options failed: ${confirmResp.message}` }], isError: true };
        }
        return {
          content: [{
            type: "text",
            text: `\u2705 \u7EA0\u7EB7\u9009\u9879\u67E5\u8BE2\u6210\u529F\uFF0C\u8BF7\u5C06\u4EE5\u4E0B\u4FE1\u606F\u4F20\u7ED9 create_dispute:
  - disputeReasonId: \u4ECE disputeReasonList \u4E2D\u9009\u62E9\u6574\u6570ID
  - expectType: \u4ECE expectResultOptionList \u4E2D\u9009\u62E9 (1=\u9000\u6B3E/Refund, 2=\u8865\u53D1/Reissue)

` + JSON.stringify(confirmResp.data, null, 2)
          }]
        };
      }
      default:
        return { content: [{ type: "text", text: `Unknown dispute tool: ${name}` }], isError: true };
    }
  } catch (error2) {
    if (error2 instanceof AuthExpiredError) {
      return { content: [{ type: "text", text: error2.message }], isError: true };
    }
    const msg = error2 instanceof Error ? error2.message : String(error2);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}
async function callApi2(endpoint, body, tier) {
  const response = await httpClient.request(endpoint, { body, tier });
  if (!isApiSuccess(response)) {
    return { content: [{ type: "text", text: `\u8BF7\u6C42\u5931\u8D25 / Request failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
}

// src/mcp-server/tools/shop.tool.ts
var shopTools = [
  {
    name: "list_shops",
    description: "\u83B7\u53D6\u5DF2\u6388\u6743\u5E97\u94FA\u5217\u8868\uFF0C\u5305\u542BShopify/WooCommerce/eBay\u7B49\u5E73\u53F0\u7684\u5E97\u94FA\u4FE1\u606F / Get authorized shop list including Shopify/WooCommerce/eBay platform stores.",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "\u641C\u7D22\u5173\u952E\u8BCD\uFF0C\u6309\u5E97\u94FA\u540D\u79F0\u8FC7\u6EE4 / Search keyword to filter shops by name"
        },
        pageNum: { type: "number", description: "\u9875\u7801 / Page number" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF / Page size" }
      },
      required: []
    }
  },
  {
    name: "get_authorize_url",
    description: "\u83B7\u53D6\u5E97\u94FA\u6388\u6743\u94FE\u63A5\uFF0C\u7528\u4E8E\u8FDE\u63A5\u65B0\u7684\u7535\u5546\u5E73\u53F0\u5E97\u94FA\u5230CJ\u8D26\u6237 / Get shop authorization URL for connecting a new e-commerce platform store to CJ account.",
    inputSchema: {
      type: "object",
      properties: {
        shopType: {
          type: "string",
          description: "\u5E73\u53F0\u7C7B\u578B(shopify/woocommerce/ebay\u7B49) / Platform type"
        }
      },
      required: ["shopType"]
    }
  },
  {
    name: "get_account_settings",
    description: "\u83B7\u53D6CJ\u8D26\u6237\u8BBE\u7F6E\u4FE1\u606F\uFF0C\u5305\u542B\u8D26\u6237\u540D\u79F0\u3001\u90AE\u7B71\u3001API\u914D\u989D\u9650\u5236\u3001QPS\u9650\u5236\u3001Webhook\u56DE\u8C03\u914D\u7F6E\u7B49\u3002\n\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u6211\u7684\u8D26\u6237\u8BBE\u7F6E\u300D\u300C\u6211\u7684\u8D26\u53F7\u4FE1\u606F\u300D\u300CAPI\u914D\u989D\u8FD8\u5269\u591A\u5C11\u300D\u300C\u6211\u7684QPS\u9650\u5236\u662F\u591A\u5C11\u300D\u300Cmy account settings\u300D\u3002Returns: openId, openName, openEmail, quotaLimits, qpsLimit, webhook callback config, etc.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "save_product_to_shop",
    description: [
      "\u5C06\u5E97\u94FA\u5546\u54C1\u4FE1\u606F\u4FDD\u5B58/\u540C\u6B65\u5230CJ\u7CFB\u7EDF\u4E2D\uFF0C\u5EFA\u7ACB\u5546\u54C1\u4E0ECJ\u7684\u5173\u8054\u3002",
      "\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u9700\u7528\u6237\u786E\u8BA4\u3011\u6B64\u64CD\u4F5C\u5C06\u4FEE\u6539CJ\u7CFB\u7EDF\u4E2D\u7684\u5E97\u94FA\u5546\u54C1\u6570\u636E\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u4FDD\u5B58\u5546\u54C1\u5230CJ\u300D\u300C\u540C\u6B65\u5546\u54C1\u5230\u5E97\u94FA\u300D\u300Csave product to CJ\u300D\u3002",
      "\u5FC5\u586B\u53C2\u6570\uFF1Aid\uFF08\u5E97\u94FA\u5546\u54C1ID\uFF09\u3001title\uFF08\u5546\u54C1\u6807\u9898\uFF09\u3001image\uFF08\u5546\u54C1\u56FE\u7247URL\uFF09\u3002",
      "\u9009\u586B\u53C2\u6570\uFF1Adescription\uFF08\u63CF\u8FF0\uFF09\u3001priceMin/priceMax/priceCurrency\uFF08\u4EF7\u683C\u533A\u95F4\u548C\u8D27\u5E01\uFF0C\u9700\u540C\u65F6\u63D0\u4F9B\u4E09\u8005\uFF09\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "\u5E97\u94FA\u5546\u54C1ID\uFF08\u5FC5\u586B\uFF0C\u6700\u957F64\u4F4D\uFF09/ Store product ID (required)" },
        title: { type: "string", description: "\u5546\u54C1\u6807\u9898\uFF08\u5FC5\u586B\uFF0C\u6700\u957F500\u4F4D\uFF09/ Product title (required)" },
        image: { type: "string", description: "\u5546\u54C1\u56FE\u7247URL\uFF08\u5FC5\u586B\uFF0C\u6700\u957F400\u4F4D\uFF09/ Product image URL (required)" },
        description: { type: "string", description: "\u5546\u54C1\u63CF\u8FF0\uFF08\u53EF\u9009\uFF0C\u6700\u957F5000\u4F4D\uFF09/ Product description (optional)" },
        priceMin: { type: "number", description: "\u6700\u4F4E\u4EF7\u683C\uFF08\u53EF\u9009\uFF0C\u9700\u4E0EpriceCurrency\u540C\u65F6\u63D0\u4F9B\uFF09/ Min price" },
        priceMax: { type: "number", description: "\u6700\u9AD8\u4EF7\u683C\uFF08\u53EF\u9009\uFF0C\u9700\u4E0EpriceCurrency\u540C\u65F6\u63D0\u4F9B\uFF09/ Max price" },
        priceCurrency: { type: "string", description: "\u4EF7\u683C\u8D27\u5E01\u4EE3\u7801\u5982USD\uFF08\u53EF\u9009\uFF09/ Price currency e.g. USD" }
      },
      required: ["id", "title", "image"]
    }
  }
];
async function handleShopTool(name, args) {
  const token = await ensureAccessToken();
  if (!token) {
    return {
      content: [{
        type: "text",
        text: "\u274C \u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5148\u8C03\u7528 show_login_form \u767B\u5F55 / Not logged in or session expired. Please call show_login_form first."
      }],
      isError: true
    };
  }
  try {
    switch (name) {
      case "list_shops": {
        const params = {
          pageNum: String(args.pageNum || 1),
          pageSize: String(Math.min(args.pageSize || 20, 50))
        };
        if (args.keyword) params.keyword = String(args.keyword);
        const response = await httpClient.request(ENDPOINTS.shop.getShops, {
          method: "GET",
          params,
          tier: "read"
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: "text", text: `\u83B7\u53D6\u5E97\u94FA\u5217\u8868\u5931\u8D25 / Get shops failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }
      case "get_authorize_url": {
        const response = await httpClient.request(ENDPOINTS.auth.getAuthorizeUrl, {
          method: "GET",
          params: { shopType: String(args.shopType) },
          tier: "read"
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: "text", text: `\u83B7\u53D6\u6388\u6743\u94FE\u63A5\u5931\u8D25 / Get auth URL failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }
      case "get_account_settings": {
        const settingResp = await httpClient.request(ENDPOINTS.setting.get, {
          method: "GET",
          tier: "read"
        });
        if (!isApiSuccess(settingResp)) {
          return { content: [{ type: "text", text: `\u83B7\u53D6\u8D26\u6237\u8BBE\u7F6E\u5931\u8D25 / Get settings failed: ${settingResp.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(settingResp.data, null, 2) }] };
      }
      case "save_product_to_shop": {
        if (!args.id || !args.title || !args.image) {
          return {
            content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B id\u3001title \u548C image / Please provide id, title and image." }],
            isError: true
          };
        }
        const body = {
          id: String(args.id),
          title: String(args.title),
          image: String(args.image)
        };
        if (args.description) body.description = String(args.description);
        if (args.priceMin !== void 0) body.priceMin = Number(args.priceMin);
        if (args.priceMax !== void 0) body.priceMax = Number(args.priceMax);
        if (args.priceCurrency) body.priceCurrency = String(args.priceCurrency);
        const saveResp = await httpClient.request(ENDPOINTS.store.saveProduct, {
          body,
          tier: "write"
        });
        if (!isApiSuccess(saveResp)) {
          return { content: [{ type: "text", text: `\u4FDD\u5B58\u5546\u54C1\u5931\u8D25 / Save product failed: ${saveResp.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: `\u2705 \u5546\u54C1\u5DF2\u4FDD\u5B58\u5230CJ\u5E97\u94FA\u7CFB\u7EDF / Product saved to CJ store system.
${JSON.stringify(saveResp.data, null, 2)}` }] };
      }
      default:
        return { content: [{ type: "text", text: `Unknown shop tool: ${name}` }], isError: true };
    }
  } catch (error2) {
    if (error2 instanceof AuthExpiredError) {
      return { content: [{ type: "text", text: error2.message }], isError: true };
    }
    const msg = error2 instanceof Error ? error2.message : String(error2);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}

// src/mcp-server/tools/stock.tool.ts
var stockTools = [
  {
    name: "query_private_inventory",
    description: '\u67E5\u8BE2\u60A8\u81EA\u5DF1\u91C7\u8D2D\u5E76\u5B58\u653E\u5728CJ\u4ED3\u5E93\u4E2D\u7684\u79C1\u6709\u5907\u8D27\u5546\u54C1\uFF08SPU\u5217\u8868\uFF09\u3002\u4EC5\u8FD4\u56DE\u60A8\u8D26\u6237\u4E0B\u7684\u79C1\u6709\u5E93\u5B58\uFF0C\u4E0D\u662FCJ\u5E73\u53F0\u516C\u5F00\u5546\u54C1\u3002\n\u26A0\uFE0F\u3010\u91CD\u8981\u533A\u5206\u3011\n  - "\u5168\u7403\u4ED3\u5546\u54C1"/"\u7F8E\u56FD\u4ED3\u5546\u54C1"\uFF08CJ\u5E73\u53F0\u5168\u7403\u4ED3\u53EF\u8D2D\u5546\u54C1\uFF09\u2192 \u4F7F\u7528 search_products\uFF08isWarehouse=true + countryCode=US\uFF09\n  - "\u6211\u81EA\u5DF1\u7684\u5907\u8D27"/"\u6211\u8D2D\u5165\u7684\u5546\u54C1"/"\u79C1\u6709\u5E93\u5B58"/"\u6211\u81EA\u5DF1\u5165\u5E93\u7684" \u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n\u3010\u610F\u56FE\u6620\u5C04\u3011\n- \u7528\u6237\u8BF4\u300C\u6211\u7684\u5907\u8D27\u300D\u300C\u79C1\u6709\u5E93\u5B58\u300D\u300C\u6211\u81EA\u5DF1\u8D2D\u5165\u7684\u5546\u54C1\u300D\u300C\u67E5\u6211\u7684\u5E93\u5B58\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n- \u7528\u6237\u8BF4\u300C\u54EA\u4E2A\u4ED3\u5E93\u300D\u2192 \u5148\u8C03\u7528 get_warehouses \u83B7\u53D6\u4ED3\u5E93\u5217\u8868\uFF0C\u518D\u4F20 warehouseId \u7B5B\u9009\nQuery YOUR OWN stocked products (private inventory) you purchased and stored in CJ warehouses.\n[IMPORTANT] "global warehouse products" / "US warehouse products from CJ catalog" \u2192 use search_products(isWarehouse=true, countryCode=US)\n"My own inventory / My stocked products / Private inventory" \u2192 use this tool.',
    inputSchema: {
      type: "object",
      properties: {
        pageNum: { type: "number", description: "\u9875\u7801\uFF0C\u9ED8\u8BA41 / Page number, default 1" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF\uFF0C\u9ED8\u8BA420\uFF0C\u6700\u5927200 / Page size, default 20, max 200" },
        keyword: { type: "string", description: "\u641C\u7D22\u5173\u952E\u8BCD\uFF08\u5546\u54C1\u540D/SKU\uFF09/ Search keyword (product name/SKU)" },
        warehouseId: {
          type: "string",
          description: "\u4ED3\u5E93ID\uFF0C\u4ECE get_warehouses \u8FD4\u56DE\u7ED3\u679C\u4E2D\u83B7\u53D6\uFF0C\u7528\u4E8E\u8FC7\u6EE4\u7279\u5B9A\u4ED3\u5E93\u7684\u5546\u54C1\u3002\n\u4F8B\uFF1A\u7528\u6237\u8BF4\u300C\u7F8E\u56FD\u4ED3\u300D\u2192 \u5148 get_warehouses \u627E country=US \u7684\u4ED3\u5E93\uFF0C\u53D6 warehouseId / Warehouse ID from get_warehouses. Use to filter by specific warehouse (e.g. US warehouse \u2192 country=US)."
        }
      },
      required: []
    }
  },
  {
    name: "query_sku_details",
    description: "\u67E5\u8BE2\u79C1\u6709\u5E93\u5B58SKU\u660E\u7EC6\uFF0C\u67E5\u770B\u67D0\u4E2A\u5546\u54C1\u7684\u5404\u53D8\u4F53\u5E93\u5B58\u6570\u91CF\u548C\u4ED3\u5E93\u5206\u5E03 / Query private inventory SKU details. View variant stock quantities and warehouse distribution for a product.",
    inputSchema: {
      type: "object",
      properties: {
        productId: { type: "string", description: "\u5546\u54C1ID / Product ID" }
      },
      required: ["productId"]
    }
  },
  {
    name: "query_sku_detail_page",
    description: "\u5206\u9875\u67E5\u8BE2SKU\u660E\u7EC6\u5217\u8868\uFF0C\u9002\u7528\u4E8E\u5927\u91CFSKU\u7684\u5546\u54C1 / Paginated SKU detail list query. Suitable for products with many SKUs.",
    inputSchema: {
      type: "object",
      properties: {
        pageNum: { type: "number", description: "\u9875\u7801 / Page number" },
        pageSize: { type: "number", description: "\u6BCF\u9875\u6570\u91CF / Page size" },
        keyword: { type: "string", description: "\u641C\u7D22\u5173\u952E\u8BCD / Search keyword" }
      },
      required: []
    }
  },
  {
    name: "query_sku_detail_by_sku",
    description: "\u901A\u8FC7\u53D8\u4F53SKU\u7CBE\u786E\u67E5\u8BE2\u79C1\u6709\u5E93\u5B58\u7684SKU\u660E\u7EC6\u4FE1\u606F\uFF08\u5165\u5E93\u6279\u6B21\u3001\u5907\u6CE8\u7B49\uFF09\u3002\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u67E5\u4E00\u4E0B SKU CJXXX-Black \u7684\u79C1\u6709\u5E93\u5B58\u660E\u7EC6\u300D\u300C\u8FD9\u4E2A\u53D8\u4F53\u6211\u5907\u4E86\u591A\u5C11\u8D27\u300D\u3002\u26A0\uFE0F \u67E5\u8BE2 CJ \u516C\u5F00\u5E93\u5B58\u8BF7\u4F7F\u7528 query_cj_inventory\u3002",
    inputSchema: {
      type: "object",
      properties: {
        variantSku: { type: "string", description: "\u53D8\u4F53SKU\u7F16\u7801\uFF08\u5FC5\u586B\uFF09/ Variant SKU code (required)" }
      },
      required: ["variantSku"]
    }
  },
  {
    name: "get_product_inventory",
    description: '\u67E5\u8BE2\u67D0\u4E2A\u5546\u54C1\u5728\u5404\u56FD/\u5404\u5B50\u4ED3\u7684\u5E93\u5B58\u5206\u5E03\uFF0C\u8FD4\u56DE\u5404\u53D8\u4F53\u5728\u4E0D\u540C\u4ED3\u5E93\u7684\u5E93\u5B58\u6570\u91CF\u548C\u5B50\u4ED3ID\uFF08stockId\uFF09\u3002\n\u3010\u610F\u56FE\u6620\u5C04\u3011\n- \u7528\u6237\u8BF4\u300C\u8FD9\u4E2A\u5546\u54C1\u5728\u7F8E\u56FD\u4ED3\u6709\u591A\u5C11\u5E93\u5B58\u300D\u300C\u67E5\u5546\u54C1 XXX \u7684\u5E93\u5B58\u300D\u300C\u8FD9\u4E2A\u5546\u54C1\u5728\u54EA\u4E9B\u4ED3\u5E93\u6709\u8D27\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n- \u8FD4\u56DE\u6570\u636E\u4E2D inventories[].stock[].stockId \u662F\u5B50\u4ED3UUID\uFF0C\u53EF\u4F20\u7ED9 get_storage_info \u67E5\u8BE2\u4ED3\u5E93\u8BE6\u60C5\nQuery inventory of a product across countries and sub-warehouses.\n[Intent mapping] "how much stock does product XXX have" / "which warehouses stock this product" \u2192 use this tool.\n[Key field] inventories[].stock[].stockId = sub-warehouse UUID \u2192 pass to get_storage_info for warehouse details.',
    inputSchema: {
      type: "object",
      properties: {
        pid: {
          type: "string",
          description: '\u5546\u54C1ID\uFF08\u5FC5\u586B\uFF09\uFF0C\u6765\u81EA search_products \u6216 get_product_detail \u8FD4\u56DE\u7684 pid / Product ID (required), from search_products or get_product_detail response field "pid"'
        },
        countryCode: {
          type: "string",
          description: "\u56FD\u5BB6\u4EE3\u7801\uFF08\u53EF\u9009\uFF09\uFF0C\u7B5B\u9009\u6307\u5B9A\u56FD\u5BB6\u7684\u5E93\u5B58\u5206\u5E03 / Country code (optional), filter inventory by country e.g. US, CN"
        }
      },
      required: ["pid"]
    }
  },
  {
    name: "get_storage_info",
    description: '\u67E5\u8BE2\u67D0\u4E2A\u5177\u4F53CJ\u4ED3\u5E93\u7684\u8BE6\u7EC6\u4FE1\u606F\uFF08\u5730\u5740\u3001\u8054\u7CFB\u65B9\u5F0F\u3001\u652F\u6301\u7684\u7269\u6D41\u54C1\u724C\u3001\u662F\u5426\u652F\u6301\u81EA\u63D0\u7B49\uFF09\u3002\n\u26A0\uFE0F\u3010\u91CD\u8981\u3011\u9700\u8981\u63D0\u4F9B storageId\uFF08UUID\u683C\u5F0F\uFF0C\u5982 "2991a224-737b-42a3-a1d9-8ccd2936b341"\uFF09\uFF0C\u4E0D\u662F\u56FD\u5BB6\u4EE3\u7801\uFF01\n\u3010\u5982\u4F55\u83B7\u53D6 storageId\u3011\uFF08\u4E24\u4E2A\u6765\u6E90\uFF09\uFF1A\n  1. \u8BA2\u5355\u7EF4\u5EA6\uFF1A\u4ECE get_order_detail \u8FD4\u56DE\u7684 storageId \u5B57\u6BB5\u83B7\u53D6\uFF08\u53D1\u8D27\u4ED3\u5E93ID\uFF09\n     \u2192 \u7528\u6237\u8BF4\u300C\u8FD9\u4E2A\u8BA2\u5355\u4ECE\u54EA\u4E2A\u4ED3\u5E93\u53D1\u7684\u300D\u2192 \u5148\u8C03 get_order_detail\uFF0C\u53D6 storageId\uFF0C\u518D\u8C03\u672C\u5DE5\u5177\n  2. \u5546\u54C1\u7EF4\u5EA6\uFF1A\u4ECE get_product_inventory(pid) \u8FD4\u56DE\u7684 inventories[].stock[].stockId \u5B57\u6BB5\u83B7\u53D6\uFF08\u5B50\u4ED3ID\uFF09\n     \u2192 \u7528\u6237\u8BF4\u300C\u8FD9\u4E2A\u5546\u54C1\u5728\u54EA\u4E2A\u4ED3\u5E93\u300D\u300C\u67E5\u5546\u54C1 XXX \u5BF9\u5E94\u7684\u4ED3\u5E93\u4FE1\u606F\u300D\u2192 \u5148\u8C03 get_product_inventory\uFF0C\u53D6 stockId\uFF0C\u518D\u8C03\u672C\u5DE5\u5177\n\u3010\u610F\u56FE\u6620\u5C04\u3011\n  - \u300C\u4ED3\u5E93\u5730\u5740\u662F\u4EC0\u4E48\u300D\u300C\u4ED3\u5E93\u652F\u6301\u54EA\u4E9B\u7269\u6D41\u300D\u300C\u8FD9\u4E2A\u4ED3\u5E93\u8BE6\u60C5\u300D+ \u6709 storageId/stockId \u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n  - \u300CCJ\u6709\u54EA\u4E9B\u4ED3\u5E93\u300D\u300C\u6240\u6709\u4ED3\u5E93\u5217\u8868\u300D\u2192 \u4F7F\u7528 get_warehouses\uFF08\u4E0D\u662F\u6B64\u5DE5\u5177\uFF09\n\nGet DETAILED info of a SPECIFIC CJ warehouse (address, logistics brands, self-pickup, etc.).\n[storageId sources]\n  1. Order: from get_order_detail response field "storageId" (UUID format)\n  2. Product: from get_product_inventory response inventories[].stock[].stockId (sub-warehouse UUID)\n[NOT for] listing all CJ warehouses \u2014 use get_warehouses for that.',
    inputSchema: {
      type: "object",
      properties: {
        storageId: {
          type: "string",
          description: '\u4ED3\u5E93UUID\uFF08\u5FC5\u586B\uFF09\u3002\u6765\u6E90\uFF1A\n  1. \u6765\u81EA get_order_detail \u54CD\u5E94\u7684 storageId \u5B57\u6BB5\uFF08\u53D1\u8D27\u4ED3\u5E93\uFF09\n  2. \u6765\u81EA get_product_inventory \u54CD\u5E94\u7684 inventories[].stock[].stockId \u5B57\u6BB5\uFF08\u5B50\u4ED3\uFF09\n  \u26A0\uFE0F stockId \u548C storageId \u662F\u540C\u4E00\u79CD UUID\uFF0C\u76F4\u63A5\u5C06 stockId \u7684\u503C\u4F20\u7ED9\u672C\u53C2\u6570\u5373\u53EF\uFF01\nWarehouse UUID (required).\n  Source 1: get_order_detail response field "storageId"\n  Source 2: get_product_inventory response field "inventories[].stock[].stockId"\n  \u26A0\uFE0F stockId IS the same UUID \u2014 pass it directly to this storageId parameter.'
        }
      },
      required: ["storageId"]
    }
  },
  {
    name: "query_warehouse_order_pictures",
    description: '\u67E5\u8BE2\u4ED3\u5E93\u5904\u7406\u8BA2\u5355\u65F6\u62CD\u6444\u7684\u5B9E\u64CD\u7167\u7247\uFF08\u6253\u5305\u56FE\u3001\u5165\u5E93\u56FE\u7B49\uFF09\u3002\n\u3010\u610F\u56FE\u6620\u5C04\u3011\n- \u7528\u6237\u8BF4\u300C\u67E5\u4E00\u4E0B\u8FD9\u4E2A\u8BA2\u5355\u7684\u4ED3\u5E93\u56FE\u7247\u300D\u300C\u67E5\u770B\u8BA2\u5355\u7684\u6253\u5305\u7167\u7247\u300D\u300C\u4ED3\u5E93\u6709\u6CA1\u6709\u7ED9\u6211\u62CD\u7167\u300D\u2192 \u4F7F\u7528\u6B64\u5DE5\u5177\n- \u53EF\u540C\u65F6\u67E5\u8BE2\u591A\u4E2A\u8BA2\u5355\u7684\u56FE\u7247\nQuery warehouse processing photos (packing photos, inbound photos, etc.) for orders.\n[Intent mapping] "warehouse order photos" / "packing photos for my order" / "show order pictures from warehouse" \u2192 use this tool.',
    inputSchema: {
      type: "object",
      properties: {
        orderIds: {
          type: "array",
          items: { type: "string" },
          description: "\u8BA2\u5355ID\u5217\u8868\uFF08\u5FC5\u586B\uFF09\uFF0C\u6700\u591A\u652F\u6301\u540C\u65F6\u67E5\u8BE2\u591A\u4E2A\u8BA2\u5355 / List of order IDs (required), supports batch query"
        }
      },
      required: ["orderIds"]
    }
  }
];
async function handleStockTool(name, args) {
  const token = await ensureAccessToken();
  if (!token) {
    return {
      content: [{
        type: "text",
        text: "\u274C \u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5148\u8C03\u7528 show_login_form \u767B\u5F55 / Not logged in or session expired. Please call show_login_form first."
      }],
      isError: true
    };
  }
  try {
    switch (name) {
      case "query_private_inventory": {
        const requestBody = {
          pageNum: args.pageNum || 1,
          pageSize: Math.min(args.pageSize || 20, 200),
          keyword: args.keyword
        };
        if (args.warehouseId) requestBody.warehouseId = String(args.warehouseId);
        const response = await httpClient.request(ENDPOINTS.stock.querySpuPage, {
          body: requestBody,
          tier: "read"
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2\u5E93\u5B58\u5931\u8D25 / Query inventory failed: ${response.message}` }], isError: true };
        }
        const config2 = getEnvConfig();
        const data = response.data;
        if (data) {
          const list = Array.isArray(data.list) ? data.list : Array.isArray(data.records) ? data.records : null;
          if (list) {
            const listKey = Array.isArray(data.list) ? "list" : "records";
            data[listKey] = list.map((item) => {
              const pid = String(item.pid || item.productId || "");
              const name2 = String(item.productNameEn || item.productName || "");
              return pid ? { ...item, productUrl: getProductUrl(config2.webBase, pid, name2) } : item;
            });
          }
        }
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }
      case "query_sku_details": {
        const response = await httpClient.request(ENDPOINTS.stock.querySkuListByProductId, {
          body: { productId: args.productId },
          tier: "read"
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2SKU\u5931\u8D25 / Query SKU failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }
      case "query_sku_detail_page": {
        const response = await httpClient.request(ENDPOINTS.stock.querySkuDetailPage, {
          body: {
            pageNum: args.pageNum || 1,
            pageSize: Math.min(args.pageSize || 20, 50),
            keyword: args.keyword
          },
          tier: "read"
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2SKU\u660E\u7EC6\u5931\u8D25 / Query SKU details failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }
      case "query_sku_detail_by_sku": {
        if (!args.variantSku) {
          return { content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B variantSku \u53C2\u6570 / Please provide variantSku." }], isError: true };
        }
        const response = await httpClient.request(ENDPOINTS.stock.querySkuDetailListBySku, {
          body: { sku: String(args.variantSku) },
          tier: "read"
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: "text", text: `\u6309SKU\u67E5\u8BE2\u660E\u7EC6\u5931\u8D25 / Query SKU detail by sku failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }
      case "get_product_inventory": {
        if (!args.pid) {
          return {
            content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B pid\uFF08\u5546\u54C1ID\uFF09/ Please provide pid (Product ID)." }],
            isError: true
          };
        }
        const params = { pid: String(args.pid) };
        if (args.countryCode) params.countryCode = String(args.countryCode);
        const invResponse = await httpClient.request(ENDPOINTS.product.stockGetInventoryByPid, {
          method: "GET",
          params,
          tier: "read"
        });
        if (!isApiSuccess(invResponse)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2\u5546\u54C1\u5E93\u5B58\u5931\u8D25 / Get product inventory failed: ${invResponse.message}` }], isError: true };
        }
        const rawData = invResponse.data;
        if (rawData?.variantInventories) {
          rawData.variantInventories.forEach((vi) => {
            (vi.inventory || []).forEach((inv) => {
              (inv.stock || []).forEach((s) => {
                if (s.stockId) {
                  s.stockId = s.stockId.replace(/^\{|\}$/g, "");
                }
              });
            });
          });
        }
        return {
          content: [{
            type: "text",
            text: `\u2705 \u5546\u54C1\u5E93\u5B58\u67E5\u8BE2\u6210\u529F\u3002
\u3010\u5982\u4F55\u9009\u62E9\u6B63\u786E\u7684 stockId \u4F20\u7ED9 get_storage_info\u3011:
  - \u4F18\u5148\u9009 cjInventory > 0 \u7684 stock \u6761\u76EE\u7684 stockId\uFF08CJ\u81EA\u6709\u4ED3\uFF09
  - \u82E5\u53EA\u6709 factoryInventory > 0 \u7684\u6761\u76EE\uFF0C\u4E5F\u53EF\u4F7F\u7528\u5176 stockId\uFF08\u5DE5\u5382\u4ED3\uFF09
  - stockId \u4E2D\u7684\u82B1\u62EC\u53F7\u5DF2\u81EA\u52A8\u53BB\u9664\uFF0C\u53EF\u76F4\u63A5\u4F20\u7ED9 get_storage_info \u7684 storageId \u53C2\u6570

` + JSON.stringify(rawData, null, 2)
          }]
        };
      }
      case "get_storage_info": {
        if (!args.storageId) {
          return {
            content: [{
              type: "text",
              text: '\u274C \u8BF7\u63D0\u4F9B storageId\uFF08UUID\u683C\u5F0F\uFF0C\u5982 "2991a224-737b-42a3-a1d9-8ccd2936b341"\uFF09\u3002\n\u{1F4A1} \u83B7\u53D6\u65B9\u5F0F\uFF1A\n  1. \u8C03\u7528 get_order_detail\uFF0C\u8FD4\u56DE\u7ED3\u679C\u5305\u542B storageId \u5B57\u6BB5\uFF08\u8BA2\u5355\u53D1\u8D27\u4ED3\u5E93\uFF09\n  2. \u8C03\u7528 get_product_inventory(pid)\uFF0C\u8FD4\u56DE inventories[].stock[].stockId\uFF08\u5546\u54C1\u5B50\u4ED3\uFF09\n  \u26A0\uFE0F stockId \u5C31\u662F storageId\uFF0C\u76F4\u63A5\u4F20 stockId \u7684\u503C\u5373\u53EF\uFF01\nPlease provide storageId (UUID). From get_order_detail storageId, or get_product_inventory stock[].stockId (same UUID, pass directly).'
            }],
            isError: true
          };
        }
        const response = await httpClient.request(ENDPOINTS.warehouse.detail, {
          method: "GET",
          params: { id: String(args.storageId) },
          tier: "read"
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: "text", text: `\u67E5\u8BE2\u4ED3\u5E93\u8BE6\u60C5\u5931\u8D25 / Get storage info failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }
      case "query_warehouse_order_pictures": {
        if (!args.orderIds || !Array.isArray(args.orderIds) || args.orderIds.length === 0) {
          return {
            content: [{
              type: "text",
              text: "\u274C \u8BF7\u63D0\u4F9B orderIds \u5217\u8868\uFF08\u81F3\u5C11\u4E00\u4E2A\u8BA2\u5355ID\uFF09/ Please provide orderIds array (at least one order ID)."
            }],
            isError: true
          };
        }
        const orderIdList = args.orderIds.map(String);
        const picResp = await httpClient.request(ENDPOINTS.warehouse.orderPictures, {
          body: { orderIdList },
          tier: "read"
        });
        if (!isApiSuccess(picResp)) {
          return {
            content: [{
              type: "text",
              text: `\u67E5\u8BE2\u4ED3\u5E93\u8BA2\u5355\u56FE\u7247\u5931\u8D25 / Query warehouse order pictures failed: ${picResp.message}`
            }],
            isError: true
          };
        }
        return { content: [{ type: "text", text: JSON.stringify(picResp.data, null, 2) }] };
      }
      default:
        return { content: [{ type: "text", text: `Unknown stock tool: ${name}` }], isError: true };
    }
  } catch (error2) {
    if (error2 instanceof AuthExpiredError) {
      return { content: [{ type: "text", text: error2.message }], isError: true };
    }
    const msg = error2 instanceof Error ? error2.message : String(error2);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}

// src/mcp-server/tools/webhook.tool.ts
var webhookTools = [
  {
    name: "configure_webhook",
    description: [
      "\u914D\u7F6E CJ Webhook \u6D88\u606F\u63A8\u9001\u8BBE\u7F6E\uFF0C\u53EF\u542F\u7528/\u7981\u7528\u5546\u54C1/\u5E93\u5B58/\u8BA2\u5355/\u7269\u6D41\u7B49\u4E8B\u4EF6\u7684 HTTPS \u56DE\u8C03\u901A\u77E5\u3002",
      "\u26A0\uFE0F\u3010\u654F\u611F\u64CD\u4F5C - \u9700\u7528\u6237\u786E\u8BA4\u3011\u6B64\u64CD\u4F5C\u5C06\u4FEE\u6539\u8D26\u6237\u7684 Webhook \u56DE\u8C03 URL \u914D\u7F6E\uFF0C\u5F71\u54CD\u6240\u6709\u4E8B\u4EF6\u901A\u77E5\u7684\u63A8\u9001\u76EE\u6807\u3002",
      "\u89E6\u53D1\u573A\u666F\uFF1A\u300C\u8BBE\u7F6E Webhook \u901A\u77E5\u300D\u300C\u914D\u7F6E\u4E8B\u4EF6\u63A8\u9001\u300D\u300C\u8BA2\u9605\u8BA2\u5355\u72B6\u6001\u53D8\u66F4\u901A\u77E5\u300D\u300Cconfigure webhook\u300D\u3002",
      "\u6CE8\u610F\uFF1AcallbackUrl \u5FC5\u987B\u662F\u53EF\u516C\u5F00\u8BBF\u95EE\u7684 HTTPS \u5730\u5740\uFF08\u4E0D\u652F\u6301 localhost/127.0.0.1\uFF09\u3002",
      "\u6BCF\u79CD\u4E8B\u4EF6\u7C7B\u578B\u53EA\u652F\u6301\u4E00\u4E2A\u56DE\u8C03 URL\u3002type \u5B57\u6BB5\u503C\uFF1AENABLE\uFF08\u542F\u7528\uFF09\u6216 CANCEL\uFF08\u7981\u7528\uFF09\u3002",
      "\u56DB\u79CD\u4E8B\u4EF6\u7C7B\u578B\u5747\u4E3A\u5FC5\u586B\uFF1Aproduct\uFF08\u5546\u54C1\u53D8\u66F4\uFF09\u3001stock\uFF08\u5E93\u5B58\u53D8\u66F4\uFF09\u3001order\uFF08\u8BA2\u5355\u72B6\u6001\uFF09\u3001logistics\uFF08\u7269\u6D41\u4FE1\u606F\uFF09\u3002"
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        callbackUrl: {
          type: "string",
          description: "\u7EDF\u4E00\u56DE\u8C03 URL\uFF08\u5FC5\u987B\u662F\u516C\u5F00 HTTPS \u5730\u5740\uFF09/ Unified callback URL (must be public HTTPS)"
        },
        productType: {
          type: "string",
          enum: ["ENABLE", "CANCEL"],
          description: "\u5546\u54C1\u6D88\u606F\u7C7B\u578B ENABLE/CANCEL\uFF0C\u9ED8\u8BA4 ENABLE / Product event type"
        },
        stockType: {
          type: "string",
          enum: ["ENABLE", "CANCEL"],
          description: "\u5E93\u5B58\u6D88\u606F\u7C7B\u578B ENABLE/CANCEL\uFF0C\u9ED8\u8BA4 ENABLE / Stock event type"
        },
        orderType: {
          type: "string",
          enum: ["ENABLE", "CANCEL"],
          description: "\u8BA2\u5355\u6D88\u606F\u7C7B\u578B ENABLE/CANCEL\uFF0C\u9ED8\u8BA4 ENABLE / Order event type"
        },
        logisticsType: {
          type: "string",
          enum: ["ENABLE", "CANCEL"],
          description: "\u7269\u6D41\u6D88\u606F\u7C7B\u578B ENABLE/CANCEL\uFF0C\u9ED8\u8BA4 ENABLE / Logistics event type"
        }
      },
      required: ["callbackUrl"]
    }
  }
];
async function handleWebhookTool(name, args) {
  const token = await ensureAccessToken();
  if (!token) {
    return {
      content: [{
        type: "text",
        text: "\u274C \u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u5148\u8C03\u7528 show_login_form \u767B\u5F55 / Not logged in or session expired. Please call show_login_form first."
      }],
      isError: true
    };
  }
  try {
    switch (name) {
      case "configure_webhook": {
        if (!args.callbackUrl) {
          return {
            content: [{ type: "text", text: "\u274C \u8BF7\u63D0\u4F9B callbackUrl\uFF08\u5FC5\u987B\u662F\u516C\u5F00 HTTPS \u5730\u5740\uFF09/ Please provide callbackUrl (must be a public HTTPS URL)." }],
            isError: true
          };
        }
        const url = String(args.callbackUrl);
        if (!url.startsWith("https://")) {
          return {
            content: [{ type: "text", text: "\u274C callbackUrl \u5FC5\u987B\u4EE5 https:// \u5F00\u5934 / callbackUrl must start with https://" }],
            isError: true
          };
        }
        const productType = String(args.productType || "ENABLE");
        const stockType = String(args.stockType || "ENABLE");
        const orderType = String(args.orderType || "ENABLE");
        const logisticsType = String(args.logisticsType || "ENABLE");
        const body = {
          product: { type: productType, callbackUrls: [url] },
          stock: { type: stockType, callbackUrls: [url] },
          order: { type: orderType, callbackUrls: [url] },
          logistics: { type: logisticsType, callbackUrls: [url] }
        };
        const response = await httpClient.request(ENDPOINTS.webhook.set, { body, tier: "write" });
        if (!isApiSuccess(response)) {
          return { content: [{ type: "text", text: `Webhook \u914D\u7F6E\u5931\u8D25 / Configure webhook failed: ${response.message}` }], isError: true };
        }
        return {
          content: [{
            type: "text",
            text: [
              "\u2705 Webhook \u914D\u7F6E\u5DF2\u66F4\u65B0 / Webhook configured successfully.",
              `
- product: ${productType} \u2192 ${url}`,
              `
- stock: ${stockType} \u2192 ${url}`,
              `
- order: ${orderType} \u2192 ${url}`,
              `
- logistics: ${logisticsType} \u2192 ${url}`
            ].join("")
          }]
        };
      }
      default:
        return { content: [{ type: "text", text: `Unknown webhook tool: ${name}` }], isError: true };
    }
  } catch (error2) {
    if (error2 instanceof AuthExpiredError) {
      return { content: [{ type: "text", text: error2.message }], isError: true };
    }
    const msg = error2 instanceof Error ? error2.message : String(error2);
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
}

// src/utils/sensitive-ops.ts
var SENSITIVE_TOOLS = /* @__PURE__ */ new Set([
  "create_order",
  // 创建订单 (涉及资金)
  "submit_order_to_cart",
  // 从 orderId 继续：加购→确认→生成支付单
  "confirm_cart_and_pay",
  // 从购物车内 orderId 继续：确认→生成支付单
  "generate_payment_link",
  // 从 shipmentsId 生成支付单
  "add_to_cart",
  // 加入购物车
  "merge_orders",
  // 合单 (不可逆)
  "create_dispute",
  // 发起纠纷
  "cancel_dispute",
  // 取消纠纷 (不可撤销)
  "logout",
  // 登出 (会清除会话)
  "confirm_order",
  // 确认订单付款 (涉及资金，不可撤销)
  "delete_order",
  // 删除订单 (不可恢复)
  "pay_by_balance",
  // 余额支付单个订单 (涉及真实资金，不可撤销)
  "pay_by_balance_v2",
  // 余额支付母单 (涉及真实资金，不可撤销)
  "confirm_dispute",
  // 确认纠纷处理结果 (提交后不可更改) — 保留以向后兼容，实为只读查询
  "save_product_to_shop",
  // 保存商品到店铺（影响店铺商品数据）
  "create_product_connection",
  // 建立商品连接（影响订单自动匹配）
  "disconnect_product",
  // 断开商品连接（可能影响现有订单匹配）
  "configure_webhook"
  // 配置Webhook（影响通知推送设置）
]);
function isSensitiveTool(toolName) {
  return SENSITIVE_TOOLS.has(toolName);
}
function getConfirmationPrompt(toolName, args) {
  const descriptions = {
    create_order: "\u{1F6D2} \u5373\u5C06\u521B\u5EFA\u8BA2\u5355 / About to create an order",
    submit_order_to_cart: "\u{1F6D2} \u5373\u5C06\u6267\u884C\uFF1A\u52A0\u8D2D\u7269\u8F66\u2192\u786E\u8BA4\u8D2D\u7269\u8F66\u2192\u751F\u6210\u652F\u4ED8\u5355 / About to: addCart \u2192 addCartConfirm \u2192 generatePayment",
    confirm_cart_and_pay: "\u{1F6D2} \u5373\u5C06\u6267\u884C\uFF1A\u786E\u8BA4\u8D2D\u7269\u8F66\u2192\u751F\u6210\u652F\u4ED8\u5355 / About to: addCartConfirm \u2192 generatePayment",
    generate_payment_link: "\u{1F4B3} \u5373\u5C06\u4ECE shipmentsId \u751F\u6210\u652F\u4ED8\u5355\uFF08\u6D89\u53CA\u8D44\u91D1\uFF09/ About to generate payment order from shipmentsId",
    add_to_cart: "\u{1F6D2} \u5373\u5C06\u6DFB\u52A0\u5546\u54C1\u5230\u8D2D\u7269\u8F66 / About to add item to cart",
    merge_orders: "\u{1F4E6} \u5373\u5C06\u6267\u884C\u5408\u5355\u64CD\u4F5C\uFF08\u4E0D\u53EF\u64A4\u9500\uFF09/ About to merge orders (irreversible)",
    create_dispute: "\u26A0\uFE0F \u5373\u5C06\u53D1\u8D77\u7EA0\u7EB7 / About to create a dispute",
    cancel_dispute: "\u26A0\uFE0F \u5373\u5C06\u53D6\u6D88\u7EA0\u7EB7\uFF08\u4E0D\u53EF\u64A4\u9500\uFF09/ About to cancel dispute (irreversible)",
    logout: "\u{1F512} \u5373\u5C06\u767B\u51FA\u5F53\u524D\u8D26\u53F7 / About to logout",
    confirm_order: "\u{1F4B3} \u5373\u5C06\u786E\u8BA4\u8BA2\u5355\u4ED8\u6B3E\uFF08\u6D89\u53CA\u8D44\u91D1\uFF0C\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF09/ About to confirm order payment (involves funds, irreversible)",
    delete_order: "\u{1F5D1}\uFE0F \u5373\u5C06\u5220\u9664\u8BA2\u5355\uFF08\u4E0D\u53EF\u6062\u590D\uFF09/ About to delete order (cannot be undone)",
    pay_by_balance: "\u{1F4B0} \u5373\u5C06\u4F7F\u7528\u8D26\u6237\u4F59\u989D\u652F\u4ED8\u8BA2\u5355\uFF08\u6D89\u53CA\u771F\u5B9E\u8D44\u91D1\uFF0C\u4E0D\u53EF\u64A4\u9500\uFF09\n\u26A0\uFE0F \u8BF7\u786E\u8BA4\u5DF2\u77E5\u6089\u8BA2\u5355\u91D1\u989D\u548C\u8D26\u6237\u4F59\u989D\u518D\u7EE7\u7EED / About to pay order with account balance (REAL FUNDS, IRREVERSIBLE)",
    pay_by_balance_v2: "\u{1F4B0} \u5373\u5C06\u4F7F\u7528\u8D26\u6237\u4F59\u989D\u652F\u4ED8\u6BCD\u5355\uFF08\u6D89\u53CA\u771F\u5B9E\u8D44\u91D1\uFF0C\u4E0D\u53EF\u64A4\u9500\uFF09\n\u26A0\uFE0F \u8BF7\u786E\u8BA4\u5DF2\u77E5\u6089\u5B9E\u4ED8\u91D1\u989D\u548C\u8D26\u6237\u4F59\u989D\u518D\u7EE7\u7EED / About to pay parent order with account balance (REAL FUNDS, IRREVERSIBLE)",
    confirm_dispute: "\u2696\uFE0F \u5373\u5C06\u63D0\u4EA4\u7EA0\u7EB7\u786E\u8BA4\u4FE1\u606F\uFF08\u63D0\u4EA4\u540E\u4E0D\u53EF\u66F4\u6539\uFF09/ About to submit dispute confirmation (cannot be changed after submission)",
    save_product_to_shop: "\u{1F3EA} \u5373\u5C06\u4FDD\u5B58\u5546\u54C1\u5230CJ\u5E97\u94FA\u7CFB\u7EDF\uFF08\u5C06\u4FEE\u6539\u5E97\u94FA\u5546\u54C1\u6570\u636E\uFF09/ About to save product to CJ store system (modifies store product data)",
    create_product_connection: "\u{1F517} \u5373\u5C06\u521B\u5EFA\u5546\u54C1\u8FDE\u63A5\uFF08\u5C06CJ\u5546\u54C1\u4E0E\u5E73\u53F0\u5546\u54C1\u7ED1\u5B9A\uFF0C\u5F71\u54CD\u8BA2\u5355\u81EA\u52A8\u5339\u914D\uFF09/ About to create product connection (binds CJ product to platform product)",
    disconnect_product: "\u2702\uFE0F \u5373\u5C06\u65AD\u5F00\u5546\u54C1\u8FDE\u63A5\uFF08\u79FB\u9664\u5E73\u53F0\u5546\u54C1\u4E0ECJ\u5546\u54C1\u7684\u7ED1\u5B9A\uFF0C\u53EF\u80FD\u5F71\u54CD\u73B0\u6709\u8BA2\u5355\u81EA\u52A8\u5339\u914D\uFF09/ About to disconnect product (removes binding, may affect order matching)",
    configure_webhook: "\u{1F514} \u5373\u5C06\u4FEE\u6539Webhook\u901A\u77E5\u8BBE\u7F6E\uFF08\u5C06\u5F71\u54CD\u6240\u6709\u4E8B\u4EF6\u901A\u77E5\u7684\u63A8\u9001\u76EE\u6807URL\uFF09/ About to configure webhook settings (affects all event notification URLs)"
  };
  const desc = descriptions[toolName] || `\u26A0\uFE0F \u5373\u5C06\u6267\u884C: ${toolName}`;
  const safeArgs = sanitizeForDisplay(args);
  return `${desc}

\u{1F4CB} \u53C2\u6570 / Parameters:
${JSON.stringify(safeArgs, null, 2)}

\u8BF7\u786E\u8BA4\u662F\u5426\u7EE7\u7EED / Please confirm to proceed.`;
}
function sanitizeForDisplay(args) {
  const sensitiveFields = ["password", "token", "apiKey", "cardNumber", "cvv"];
  const result = {};
  for (const [key, value] of Object.entries(args)) {
    if (sensitiveFields.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      result[key] = "***[\u5DF2\u9690\u85CF/hidden]***";
    } else if (typeof value === "object" && value !== null) {
      result[key] = Array.isArray(value) ? `[Array(${value.length})]` : sanitizeForDisplay(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// src/utils/error-messages.ts
var ERROR_CODES = {
  // 认证相关
  AUTH_REQUIRED: "AUTH_REQUIRED",
  AUTH_EXPIRED: "AUTH_EXPIRED",
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_ACCOUNT_LOCKED: "AUTH_ACCOUNT_LOCKED",
  AUTH_NO_APIKEY: "AUTH_NO_APIKEY",
  // 限流相关
  RATE_LIMIT_QPS: "RATE_LIMIT_QPS",
  RATE_LIMIT_DAILY: "RATE_LIMIT_DAILY",
  RATE_LIMIT_CONCURRENCY: "RATE_LIMIT_CONCURRENCY",
  // 请求相关
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  SERVER_ERROR: "SERVER_ERROR",
  INVALID_PARAMS: "INVALID_PARAMS",
  // 业务相关
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  ORDER_FAILED: "ORDER_FAILED",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  // 权限相关
  PERMISSION_DENIED: "PERMISSION_DENIED",
  SENSITIVE_OP_REJECTED: "SENSITIVE_OP_REJECTED"
};
var ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: {
    code: ERROR_CODES.AUTH_REQUIRED,
    message: "\u274C \u8BF7\u5148\u767B\u5F55 / Please login first",
    suggestion: "\u4F7F\u7528 show_login_form \u5DE5\u5177\u6253\u5F00\u767B\u5F55\u9875\u9762\uFF0C\u6216\u4F7F\u7528 verify_credentials \u5DE5\u5177\u76F4\u63A5\u767B\u5F55\u3002\nUse show_login_form to open login page, or verify_credentials to login directly.",
    helpUrl: "https://developers.cjdropshipping.com/api2.0/guide/getstarted.html"
  },
  [ERROR_CODES.AUTH_EXPIRED]: {
    code: ERROR_CODES.AUTH_EXPIRED,
    message: "\u26A0\uFE0F \u767B\u5F55\u5DF2\u8FC7\u671F / Session expired",
    suggestion: "\u8BF7\u91CD\u65B0\u767B\u5F55\u3002\u5982\u9891\u7E41\u8FC7\u671F\uFF0C\u8BF7\u68C0\u67E5 apiKey \u662F\u5426\u6709\u6548\u3002\nPlease re-login. If expires frequently, check if your apiKey is still valid.",
    helpUrl: "https://developers.cjdropshipping.com/api2.0/guide/getstarted.html"
  },
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: {
    code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
    message: "\u274C \u8D26\u53F7\u6216\u5BC6\u7801\u9519\u8BEF / Incorrect credentials",
    suggestion: "\u8BF7\u68C0\u67E5\u90AE\u7BB1\u548C\u5BC6\u7801\u662F\u5426\u6B63\u786E\u3002\u5982\u5FD8\u8BB0\u5BC6\u7801\u8BF7\u5230 CJ \u5B98\u7F51\u91CD\u7F6E\u3002\nCheck your email and password. Reset at CJ website if forgotten."
  },
  [ERROR_CODES.AUTH_ACCOUNT_LOCKED]: {
    code: ERROR_CODES.AUTH_ACCOUNT_LOCKED,
    message: "\u{1F512} \u8D26\u53F7\u5DF2\u88AB\u9501\u5B9A / Account locked",
    suggestion: "\u8BF7\u8054\u7CFB CJ \u5BA2\u670D\u89E3\u9501\u8D26\u53F7\u3002\nPlease contact CJ support to unlock your account."
  },
  [ERROR_CODES.AUTH_NO_APIKEY]: {
    code: ERROR_CODES.AUTH_NO_APIKEY,
    message: "\u26A0\uFE0F \u672A\u627E\u5230 API Key / No API Key found",
    suggestion: "\u8BF7\u5230 CJ \u540E\u53F0\u751F\u6210 API Key:\n\u6D4B\u8BD5\u73AF\u5883: http://www.cjdropshipping.offline.pre.com/myCJ.html#/apikey\n\u7EBF\u4E0A\u73AF\u5883: https://www.cjdropshipping.com/myCJ.html#/apikey\nPlease generate an API Key at CJ dashboard."
  },
  [ERROR_CODES.RATE_LIMIT_QPS]: {
    code: ERROR_CODES.RATE_LIMIT_QPS,
    message: "\u{1F6A6} \u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41 / Too many requests",
    suggestion: "\u8BF7\u7A0D\u7B49\u51E0\u79D2\u540E\u91CD\u8BD5\u3002\u5F53\u524D\u8BF7\u6C42\u5DF2\u8FDB\u5165\u961F\u5217\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u5EF6\u8FDF\u91CD\u8BD5\u3002\nPlease wait a few seconds. Request is queued for automatic retry."
  },
  [ERROR_CODES.RATE_LIMIT_DAILY]: {
    code: ERROR_CODES.RATE_LIMIT_DAILY,
    message: "\u{1F4C5} \u4ECA\u65E5\u914D\u989D\u5DF2\u7528\u5B8C / Daily quota exceeded",
    suggestion: "\u4ECA\u65E5 API \u8C03\u7528\u6B21\u6570\u5DF2\u8FBE\u4E0A\u9650 (10000\u6B21)\uFF0C\u8BF7\u660E\u65E5\u518D\u8BD5\u6216\u8054\u7CFB\u7BA1\u7406\u5458\u63D0\u5347\u914D\u989D\u3002\nDaily API call limit (10000) reached. Try again tomorrow or contact admin."
  },
  [ERROR_CODES.RATE_LIMIT_CONCURRENCY]: {
    code: ERROR_CODES.RATE_LIMIT_CONCURRENCY,
    message: "\u23F3 \u5E76\u53D1\u8BF7\u6C42\u8FC7\u591A / Too many concurrent requests",
    suggestion: "\u5F53\u524D\u540C\u65F6\u6267\u884C\u7684\u64CD\u4F5C\u8F83\u591A\uFF0C\u8BF7\u7B49\u5F85\u524D\u9762\u64CD\u4F5C\u5B8C\u6210\u3002\nToo many operations running. Please wait for previous ones to complete."
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    code: ERROR_CODES.NETWORK_ERROR,
    message: "\u{1F310} \u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25 / Network error",
    suggestion: "\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\uFF0C\u786E\u8BA4 CJ API \u670D\u52A1\u53EF\u8BBF\u95EE\u3002\nCheck your network connection and CJ API accessibility."
  },
  [ERROR_CODES.TIMEOUT]: {
    code: ERROR_CODES.TIMEOUT,
    message: "\u23F1\uFE0F \u8BF7\u6C42\u8D85\u65F6 / Request timeout",
    suggestion: "\u8BF7\u6C42\u672A\u5728\u89C4\u5B9A\u65F6\u95F4\u5185\u5B8C\u6210\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002\nRequest timed out. Please try again later."
  },
  [ERROR_CODES.SERVER_ERROR]: {
    code: ERROR_CODES.SERVER_ERROR,
    message: "\u{1F527} \u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF / Server error",
    suggestion: "\u670D\u52A1\u7AEF\u6682\u65F6\u5F02\u5E38\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002\u5982\u6301\u7EED\u51FA\u73B0\u8BF7\u8054\u7CFB\u6280\u672F\u652F\u6301\u3002\nServer temporarily unavailable. Try again later or contact support."
  },
  [ERROR_CODES.INVALID_PARAMS]: {
    code: ERROR_CODES.INVALID_PARAMS,
    message: "\u{1F4CB} \u53C2\u6570\u9519\u8BEF / Invalid parameters",
    suggestion: "\u8BF7\u68C0\u67E5\u8F93\u5165\u53C2\u6570\u662F\u5426\u6B63\u786E\u548C\u5B8C\u6574\u3002\nPlease check if your input parameters are correct and complete."
  },
  [ERROR_CODES.PERMISSION_DENIED]: {
    code: ERROR_CODES.PERMISSION_DENIED,
    message: "\u{1F6AB} \u65E0\u6743\u9650 / Permission denied",
    suggestion: "\u5F53\u524D\u8D26\u53F7\u65E0\u6743\u6267\u884C\u6B64\u64CD\u4F5C\uFF0C\u8BF7\u68C0\u67E5\u8D26\u53F7\u6743\u9650\u3002\nCurrent account lacks permission. Check account privileges."
  },
  [ERROR_CODES.SENSITIVE_OP_REJECTED]: {
    code: ERROR_CODES.SENSITIVE_OP_REJECTED,
    message: "\u{1F6E1}\uFE0F \u654F\u611F\u64CD\u4F5C\u88AB\u62D2\u7EDD / Sensitive operation rejected",
    suggestion: "\u8BE5\u64CD\u4F5C\u9700\u8981\u4EBA\u5DE5\u786E\u8BA4\u540E\u624D\u80FD\u6267\u884C\u3002\u8BF7\u5728\u63D0\u793A\u540E\u786E\u8BA4\u3002\nThis operation requires manual confirmation. Please confirm when prompted."
  }
};
function getFriendlyError(code) {
  return ERROR_MESSAGES[code] || {
    code,
    message: `\u672A\u77E5\u9519\u8BEF / Unknown error (${code})`,
    suggestion: "\u8BF7\u7A0D\u540E\u91CD\u8BD5\u6216\u8054\u7CFB\u6280\u672F\u652F\u6301\u3002\n Try again later or contact support."
  };
}
function formatToolError(errorCode, extraDetail) {
  const err = getFriendlyError(errorCode);
  let text = `${err.message}

\u{1F4A1} ${err.suggestion}`;
  if (extraDetail) text += `

\u{1F4DD} \u8BE6\u60C5 / Detail: ${extraDetail}`;
  if (err.helpUrl) text += `

\u{1F4D6} \u5E2E\u52A9\u6587\u6863 / Help: ${err.helpUrl}`;
  return { content: [{ type: "text", text }], isError: true };
}

// src/mcp-server/tools/index.ts
var toolRegistry = /* @__PURE__ */ new Map();
var staticTools = [];
function registerTools() {
  for (const tool of authTools) {
    toolRegistry.set(tool.name, handleAuthTool);
  }
  for (const tool of productTools) {
    toolRegistry.set(tool.name, handleProductTool);
  }
  for (const tool of logisticsTools) {
    toolRegistry.set(tool.name, handleLogisticsTool);
  }
  for (const tool of orderTools) {
    toolRegistry.set(tool.name, handleOrderTool);
  }
  for (const tool of disputeTools) {
    toolRegistry.set(tool.name, handleDisputeTool);
  }
  for (const tool of shopTools) {
    toolRegistry.set(tool.name, handleShopTool);
  }
  for (const tool of stockTools) {
    toolRegistry.set(tool.name, handleStockTool);
  }
  for (const tool of webhookTools) {
    toolRegistry.set(tool.name, handleWebhookTool);
  }
  for (const tool of navigateTools) {
    toolRegistry.set(tool.name, handleNavigateTool);
  }
  staticTools = [
    ...productTools,
    ...logisticsTools,
    ...orderTools,
    ...disputeTools,
    ...shopTools,
    ...stockTools,
    ...webhookTools,
    ...navigateTools
  ];
}
function getToolsList() {
  const nonDynamic = [
    ...logisticsTools,
    ...disputeTools,
    ...shopTools,
    ...stockTools,
    ...webhookTools,
    ...navigateTools
  ];
  return [...getAuthTools(), ...getProductTools(), ...getOrderTools(), ...nonDynamic];
}
async function handleToolCall(name, args) {
  const handler = toolRegistry.get(name);
  if (!handler) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true
    };
  }
  const startTime2 = Date.now();
  logger.info("TOOL", `\u8C03\u7528 / Calling: ${name}`, { args: Object.keys(args) });
  if (isDebugMode()) {
    logger.debug("TOOL", `\u8C03\u7528\u53C2\u6570\u8BE6\u60C5 / Args detail: ${name}`, args);
  }
  if (isSensitiveTool(name)) {
    const confirmPrompt = getConfirmationPrompt(name, args);
    logger.info("SENSITIVE", `\u654F\u611F\u64CD\u4F5C\u9700\u786E\u8BA4 / Sensitive operation requires confirmation: ${name}`);
    logger.debug("SENSITIVE", confirmPrompt);
  }
  await rateLimiter.acquireConcurrency();
  try {
    const result = await handler(name, args);
    const duration3 = Date.now() - startTime2;
    const resultSummary = result.content?.[0]?.text?.slice(0, 80).replace(/\n/g, " ") ?? "";
    logger.info("TOOL", `\u5B8C\u6210 / Done: ${name} (${duration3}ms)`, { isError: result.isError || false, result: resultSummary });
    if (isDebugMode()) {
      logger.debug("TOOL", `\u5B8C\u6210\u8BE6\u60C5 / Done detail: ${name}`, {
        isError: result.isError || false,
        content: result.content
      });
    }
    return result;
  } catch (error2) {
    const duration3 = Date.now() - startTime2;
    if (error2 instanceof QuotaExceededError) {
      logger.rateLimit("daily", "exceeded", error2.message);
      return formatToolError(ERROR_CODES.RATE_LIMIT_DAILY);
    }
    if (error2 instanceof AuthExpiredError) {
      logger.warn("AUTH", `Token\u8FC7\u671F / Token expired during ${name}`);
      return formatToolError(ERROR_CODES.AUTH_EXPIRED);
    }
    const message = error2 instanceof Error ? error2.message : String(error2);
    logger.error("TOOL", `\u5F02\u5E38 / Error: ${name} (${duration3}ms)`, { error: message });
    if (message.includes("fetch") || message.includes("ECONNREFUSED") || message.includes("ETIMEDOUT")) {
      return formatToolError(ERROR_CODES.NETWORK_ERROR, message);
    }
    return {
      content: [{ type: "text", text: `\u274C \u64CD\u4F5C\u5931\u8D25 / Operation failed: ${message}

\u{1F4A1} \u8BF7\u7A0D\u540E\u91CD\u8BD5\uFF0C\u6216\u4F7F\u7528 check_login_status \u786E\u8BA4\u767B\u5F55\u72B6\u6001\u3002
Please try again later, or use check_login_status to verify your session.` }],
      isError: true
    };
  } finally {
    rateLimiter.releaseConcurrency();
  }
}

// src/mcp-server/index.ts
registerTools();
registerResources();
async function ensureApiKeySession(apiKey) {
  await apiKeyStorage.run(apiKey, async () => {
    const session = getSession();
    if (session && new Date(session.accessTokenExpiry) > /* @__PURE__ */ new Date()) return;
    if (session?.refreshToken && new Date(session.refreshTokenExpiry) > /* @__PURE__ */ new Date()) {
      const refreshed = await refreshSession();
      if (refreshed) return;
    }
    try {
      await createSession("apikey-url-user", apiKey);
    } catch (e) {
      logger.warn("AUTH", `[ensureApiKeySession] apiKey URL \u81EA\u52A8\u8BA4\u8BC1\u5931\u8D25: ${e}`);
    }
  });
}
function createMCPServer() {
  const mcpServer = new Server(
    { name: "cj-dropshipping-mcp", version: "0.2.0" },
    { capabilities: { tools: {}, resources: {} } }
  );
  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: getToolsList()
  }));
  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return handleToolCall(name, args || {});
  });
  mcpServer.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: getResourcesList()
  }));
  mcpServer.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    logger.debug(`[RESOURCE] Reading URI: ${request.params.uri}`);
    return await handleResourceRead(request.params.uri);
  });
  return mcpServer;
}
async function main() {
  const transportType = process.env.CJ_TRANSPORT || "stdio";
  if (transportType === "http" || transportType === "https") {
    const port = parseInt(process.env.CJ_HTTP_PORT || "3009", 10);
    const requestHandler = async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id");
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", tools: getToolsList().length }));
        return;
      }
      const urlPath = (req.url ?? "/").split("?")[0];
      const directTokenMatch = urlPath.match(/^\/mcp\/(API@([^@]+)@CJ:(.+))$/);
      const mcpApiKeyMatch = !directTokenMatch && urlPath.match(/^\/mcp\/(.+)$/);
      const urlApiKey = mcpApiKeyMatch ? decodeURIComponent(mcpApiKeyMatch[1]) : void 0;
      const urlDirectToken = directTokenMatch ? { userId: directTokenMatch[2], accessToken: decodeURIComponent(directTokenMatch[3]) } : void 0;
      const isMcpPath = urlPath === "/mcp" || !!mcpApiKeyMatch || !!directTokenMatch;
      if (isMcpPath) {
        if (urlApiKey) {
          await ensureApiKeySession(urlApiKey);
        }
        const mcpServer = createMCPServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: void 0
        });
        await mcpServer.connect(transport);
        if (req.method === "GET") {
          const authTag = urlDirectToken ? `directToken(${urlDirectToken.userId})` : urlApiKey ? `apiKey(${urlApiKey.slice(0, 12)}\u2026)` : "none";
          logger.raw(`[MCP-REQ] ${(/* @__PURE__ */ new Date()).toISOString()} | GET(SSE) | auth=${authTag}`);
          const handleGet = () => transport.handleRequest(req, res, void 0);
          if (urlDirectToken) {
            await directTokenStorage.run(urlDirectToken, handleGet);
          } else if (urlApiKey) {
            await apiKeyStorage.run(urlApiKey, handleGet);
          } else {
            await handleGet();
          }
        } else {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          let body;
          try {
            body = JSON.parse(Buffer.concat(chunks).toString());
          } catch {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid JSON body" }));
            await transport.close();
            await mcpServer.close();
            return;
          }
          {
            const b = body;
            let rpcLabel = String(b?.method ?? "?");
            let argsSummary = "";
            if (b?.method === "tools/call") {
              const params = b.params;
              const name = params?.name;
              rpcLabel = `tools/call:${name}`;
              const args = params?.arguments;
              if (args && Object.keys(args).length > 0) {
                argsSummary = ` | args=[${Object.keys(args).join(",")}]`;
              }
            }
            const authTag = urlDirectToken ? ` | directToken(${urlDirectToken.userId})` : urlApiKey ? ` | apiKey=${urlApiKey.slice(0, 12)}\u2026` : "";
            const id = b?.id != null ? `#${b.id}` : "";
            logger.raw(`[MCP-REQ] ${(/* @__PURE__ */ new Date()).toISOString()} | ${rpcLabel}${id}${authTag}${argsSummary}`);
          }
          const handlePost = () => transport.handleRequest(req, res, body);
          if (urlDirectToken) {
            await directTokenStorage.run(urlDirectToken, handlePost);
          } else if (urlApiKey) {
            await apiKeyStorage.run(urlApiKey, handlePost);
          } else {
            await handlePost();
          }
        }
        res.on("finish", async () => {
          await transport.close();
          await mcpServer.close();
        });
        return;
      }
      res.writeHead(404);
      res.end("Not Found");
    };
    if (transportType === "https") {
      const certPath = (0, import_node_path.resolve)(process.env.CJ_HTTPS_CERT || "certs/cert.pem");
      const keyPath = (0, import_node_path.resolve)(process.env.CJ_HTTPS_KEY || "certs/key.pem");
      if (!(0, import_node_fs.existsSync)(certPath) || !(0, import_node_fs.existsSync)(keyPath)) {
        console.error(`[MCP] \u274C \u627E\u4E0D\u5230 HTTPS \u8BC1\u4E66\u6587\u4EF6\u3002\u8BF7\u5148\u8FD0\u884C: npm run gen:cert`);
        console.error(`[MCP]    \u8BC1\u4E66\u8DEF\u5F84: ${certPath}`);
        console.error(`[MCP]    \u79C1\u94A5\u8DEF\u5F84: ${keyPath}`);
        console.error(`[MCP]    \u6216\u901A\u8FC7 CJ_HTTPS_CERT / CJ_HTTPS_KEY \u73AF\u5883\u53D8\u91CF\u6307\u5B9A\u81EA\u5B9A\u4E49\u8DEF\u5F84`);
        process.exit(1);
      }
      const httpsServer = (0, import_node_https.createServer)(
        {
          cert: (0, import_node_fs.readFileSync)(certPath),
          key: (0, import_node_fs.readFileSync)(keyPath)
        },
        requestHandler
      );
      httpsServer.listen(port, () => {
        console.error(`[MCP] HTTPS Server running on https://localhost:${port}/mcp`);
        console.error(`[MCP] Health check: https://localhost:${port}/health`);
        console.error(`[MCP] Tools: ${getToolsList().length}`);
        console.error(`[MCP] \u{1F4A1} \u81EA\u7B7E\u540D\u8BC1\u4E66\u9700\u5728\u6D4F\u89C8\u5668/\u5BA2\u6237\u7AEF\u4E2D\u624B\u52A8\u4FE1\u4EFB`);
      });
    } else {
      const httpServer = (0, import_node_http.createServer)(requestHandler);
      httpServer.listen(port, () => {
        console.error(`[MCP] HTTP Server running on http://localhost:${port}/mcp`);
        console.error(`[MCP] Health check: http://localhost:${port}/health`);
        console.error(`[MCP] Tools: ${getToolsList().length}`);
      });
    }
  } else {
    const mcpServer = createMCPServer();
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
  }
}
main().catch((error2) => {
  console.error("MCP Server failed to start:", error2);
  process.exit(1);
});
//# sourceMappingURL=index.cjs.map
