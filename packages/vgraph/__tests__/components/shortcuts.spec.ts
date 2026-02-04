import { Shortcuts } from "../../src/components";

describe("src/shortcuts", () => {
  const shortcut = new Shortcuts();

  it("single key should work", () => {
    const deleteFn = jest.fn();
    shortcut.bindKey("backspace", deleteFn);
    expect(Object.keys(shortcut.handlers).length).toBe(1);
    expect(shortcut.handlers[8]).toEqual([
      {
        shortcut: "backspace",
        mods: [],
        scope: "all",
        handler: deleteFn,
      },
    ]);

    shortcut.dispatch({ keyCode: 8 } as any);
    expect(deleteFn).toHaveBeenCalledTimes(1);
    shortcut.clearModifier({ keyCode: 8 } as any);

    shortcut.dispatch({ keyCode: 9 } as any);
    expect(deleteFn).toHaveBeenCalledTimes(1);
    shortcut.clearModifier({ keyCode: 9 } as any);

    shortcut.unbindKey("backspace");
    expect(shortcut.handlers[8]).toEqual([{}]);
    shortcut.dispatch({ keyCode: 8 } as any);
    shortcut.clearModifier({ keyCode: 8 } as any);
    expect(deleteFn).toHaveBeenCalledTimes(1);
  });

  it("combined keys should work with scope", () => {
    const undoFn = jest.fn();
    shortcut.bindKey("⌘+z, ctrl+z", undoFn, "edit");
    expect(shortcut.handlers[90]).toEqual([
      {
        shortcut: "⌘+z",
        mods: [91],
        scope: "edit",
        handler: undoFn,
      },
      {
        shortcut: "ctrl+z",
        mods: [17],
        scope: "edit",
        handler: undoFn,
      },
    ]);
    shortcut.dispatch({ keyCode: 91, metaKey: true } as any);
    expect(shortcut.downKeys).toEqual([91]);
    expect(shortcut.mods["91"]).toBe(true);
    expect(undoFn).toHaveBeenCalledTimes(0);
    shortcut.dispatch({ keyCode: 90 } as any);
    expect(undoFn).toHaveBeenCalledTimes(0);
    shortcut.clearModifier({ keyCode: 91 } as any);
    shortcut.clearModifier({ keyCode: 90 } as any);

    shortcut.setScope("edit");
    shortcut.dispatch({ keyCode: 91, metaKey: true } as any);
    shortcut.dispatch({ keyCode: 90, metaKey: true } as any);
    expect(undoFn).toHaveBeenCalledTimes(1);
    shortcut.clearModifier({ keyCode: 91 } as any);
    shortcut.clearModifier({ keyCode: 90 } as any);

    shortcut.dispatch({ keyCode: 17, metaKey: true } as any);
    shortcut.dispatch({ keyCode: 90, metaKey: true } as any);
    expect(undoFn).toHaveBeenCalledTimes(2);

    shortcut.unbindKey("⌘+z, ctrl+z");
    shortcut.dispatch({ keyCode: 17, metaKey: true } as any);
    shortcut.dispatch({ keyCode: 90, metaKey: true } as any);
    expect(undoFn).toHaveBeenCalledTimes(2);
  });

  it("edit keys should work", () => {
    const copyFn = jest.fn();
    shortcut.bindKey("copy", copyFn, "all", "copy");
    expect(shortcut._events.copy).not.toBe(undefined);
    // FIXME: mock 环境下 document 不支持 execCommand 没办法很好触发 copy 事件
    // document.execCommand('copy');
    // expect(copyFn).toHaveBeenCalledTimes(1);

    shortcut.unbindKey("copy", "all");
    expect(shortcut._events.copy).toBe(undefined);
    // document.execCommand('copy');
    // expect(copyFn).toHaveBeenCalledTimes(1);
  });
});
