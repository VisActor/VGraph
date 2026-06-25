const MODIFIERS = {
  "⇧": 16,
  shift: 16,
  "⌥": 18,
  alt: 18,
  option: 18,
  "⌃": 17,
  ctrl: 17,
  control: 17,
  "⌘": 91,
  command: 91,
};

const MAP = {
  backspace: 8,
  tab: 9,
  clear: 12,
  enter: 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  ",": 188,
  ".": 190,
  "/": 191,
  "`": 192,
  "-": 189,
  "=": 187,
  ";": 186,
  "'": 222,
  "[": 219,
  "]": 221,
  "\\": 220,
};

// F1 ~ F12
for (let k = 1; k < 13; k++) {
  MAP["f" + k] = 111 + k;
}

const MODIFIER_MAP = {
  16: "shiftKey",
  18: "altKey",
  17: "ctrlKey",
  91: "metaKey",
};

export type HandlerOption = {
  shortcut: string;
  handler: (
    event: KeyboardEvent | ClipboardEvent,
    handlerInfo: HandlerOption
  ) => void;
  scope?: string;
};

export class Shortcuts {
  scope = "all";
  handlers = {};
  downKeys = [];
  _events: Record<string, any>;
  _enable = true;
  mods = {
    16: false,
    18: false,
    17: false,
    91: false,
  };
  constructor(handlers?: Record<string, HandlerOption>) {
    this._events = {
      keydown: (e: KeyboardEvent) => {
        this.dispatch(e);
      },
      keyup: (e: KeyboardEvent) => {
        this.clearModifier(e);
      },
      focus: () => {
        this.resetModifier();
      },
    };
    document.addEventListener("keydown", this._events.keydown, false);
    document.addEventListener("keyup", this._events.keyup, false);
    window.addEventListener("focus", this._events.focus);

    if (handlers) {
      Object.keys(handlers).forEach((type: string) => {
        const handler = handlers[type];
        this.bindKey(handler.shortcut, handler.handler, handler.scope, type);
      });
    }
  }
  setScope(scope: string) {
    this.scope = scope || "all";
  }
  getScope() {
    return this.scope || "all";
  }
  getKeys(key: string) {
    const keys = key.replace(/\s/g, "").split(",");
    if (keys[keys.length - 1] === "") {
      keys[keys.length - 2] += ",";
    }
    return keys;
  }
  getMods(key: string[]) {
    const mods = key.slice(0, key.length - 1);
    for (let mi = 0; mi < mods.length; mi++) {
      mods[mi] = MODIFIERS[mods[mi]];
    }
    return mods;
  }
  code(x: string) {
    return MAP[x] || x.toUpperCase().charCodeAt(0);
  }
  bindKey(
    key: string,
    handler: (e: ClipboardEvent, info: HandlerOption) => void,
    scope = "all",
    type?: string
  ) {
    if (type && ["copy", "cut", "paste"].includes(type)) {
      this.bindEditKey(type, handler, scope);
      return;
    }
    const keys = this.getKeys(key);
    let mods: string[] = [];
    for (const string of keys) {
      mods = [];
      let key: string[] | string = string.split("+");
      if (key.length > 1) {
        mods = this.getMods(key);
        key = [key[key.length - 1]];
      }
      key = key[0];
      key = this.code(key);
      const listener = {
        shortcut: string,
        scope,
        handler,
        mods,
      };
      if (this.handlers[key as string]) {
        this.handlers[key as string].push(listener);
      } else {
        this.handlers[key as string] = [listener];
      }
    }
  }

  bindEditKey(
    type: string,
    handler: (e: ClipboardEvent, info: HandlerOption) => void,
    scope = "all"
  ) {
    this._events[type] = (e: ClipboardEvent) => {
      if (!this._enable || (this.getScope() !== scope && scope !== "all")) {
        return;
      }
      if (filter(e)) {
        return;
      }
      if (document.getSelection()?.toString()) {
        return;
      }
      handler(e, { scope, shortcut: type, handler: handler as any });
    };
    document.body.addEventListener(type, this._events[type]);
  }

  unbindKey(key: string, scope?: string) {
    if (this._events[key]) {
      document.body.removeEventListener(key, this._events[key]);
      delete this._events[key];
      return;
    }
    const keyArr = this.getKeys(key);
    let mods: string[] = [];
    if (!scope) {
      scope = this.getScope();
    }
    for (const shortcut of keyArr) {
      const keys = shortcut.split("+");
      if (keys.length > 1) {
        mods = this.getMods(keys);
      }
      let key = keys[keys.length - 1];
      key = this.code(key);
      if (!this.handlers[key]) {
        return;
      }
      for (let i = 0; i < this.handlers[key].length; i++) {
        const listener = this.handlers[key][i];
        if (listener.scope === scope && compareArray(listener.mods, mods)) {
          this.handlers[key][i] = {};
        }
      }
    }
  }
  dispatch(e: KeyboardEvent) {
    if (!this._enable) {
      return;
    }
    let key = e.keyCode;
    const downKeys: number[] = this.downKeys;
    const mods = this.mods;
    if (downKeys.indexOf(key) === -1) {
      downKeys.push(key);
    }
    if (key === 93 || key === 224) {
      key = 91;
    }
    if (mods[key] !== undefined) {
      mods[key] = true;
      return;
    }
    this.updateModifierKey(e);
    if (!this.handlers[key] || filter(e)) {
      return;
    }
    const scope = this.getScope();
    for (const handler of this.handlers[key]) {
      if (handler.scope === scope || handler.scope === "all") {
        let modifiersMatch = handler.mods.length > 0;
        Object.keys(mods).forEach((k: string) => {
          const mod = parseInt(k, 10);
          if (
            (!mods[k] && handler.mods.indexOf(mod) > -1) ||
            (mods[k] && handler.mods.indexOf(mod) === -1)
          ) {
            modifiersMatch = false;
          }
        });
        if (
          (handler.mods.length === 0 &&
            !mods[16] &&
            !mods[18] &&
            !mods[17] &&
            !mods[91]) ||
          modifiersMatch
        ) {
          if (handler.handler(e, handler) === false) {
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
          }
        }
      }
    }
  }
  updateModifierKey(e: KeyboardEvent) {
    const mods = this.mods;
    Object.keys(mods).forEach((k: string) => {
      mods[k] = e[MODIFIER_MAP[k]];
    });
  }
  clearModifier(e: KeyboardEvent) {
    let key = e.keyCode;
    const i = (this.downKeys as number[]).indexOf(key);
    if (i >= 0) {
      this.downKeys.splice(i, 1);
    }
    if (key === 93 || key === 224) {
      key = 91;
    }
    if (this.mods[key]) {
      this.mods[key] = false;
    }
  }
  resetModifier() {
    Object.keys(this.mods).forEach((k: string) => {
      this.mods[k] = false;
    });
  }
  enable() {
    this._enable = true;
  }

  disable() {
    this._enable = false;
  }

  destroy() {
    ["copy", "cut", "paste"].forEach((key) => {
      if (this._events[key]) {
        document.body.removeEventListener(key, this._events[key]);
      }
    });
    document.removeEventListener("keydown", this._events.keydown);
    document.removeEventListener("keyup", this._events.keyup);
    window.removeEventListener("focus", this._events.focus);
  }
}

function compareArray(a1: string[], a2: string[]) {
  if (a1.length !== a2.length) {
    return false;
  }
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}

function filter(e: KeyboardEvent | ClipboardEvent) {
  const tagName = (e.target as HTMLElement)?.tagName;
  return ["INPUT", "SELECT", "TEXTAREA"].includes(tagName);
}
