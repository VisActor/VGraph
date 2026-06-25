import { Stack } from "./stack";
import { Node, Edge, Group } from "../../models/entities";

export function getDefaultShortcuts(stack: Stack) {
  return {
    copy: {
      shortcut: "⌘+c, ctrl+c",
      handler: (event: KeyboardEvent | ClipboardEvent) => {
        stack.execute("copy", { event });
      },
    },
    cut: {
      shortcut: "⌘+x, ctrl+x",
      handler: (event: KeyboardEvent | ClipboardEvent) => {
        stack.execute("cut", { event });
      },
    },
    paste: {
      shortcut: "⌘+v, ctrl+v",
      handler: (event: KeyboardEvent | ClipboardEvent) => {
        stack.execute("paste", { event });
      },
    },
    delete: {
      shortcut: "backspace",
      handler: () => {
        stack.execute("remove");
      },
    },
    undo: {
      shortcut: "⌘+z, ctrl+z",
      handler: () => {
        stack.undo();
      },
    },
    redo: {
      shortcut: "⌘+shift+z, ctrl+shift+z",
      handler: () => {
        stack.redo();
      },
    },
    selectAll: {
      shortcut: "⌘+a, ctrl+a",
      handler: (e: KeyboardEvent | ClipboardEvent) => {
        e.preventDefault();
        const graph = stack.graph;
        let selections: (Node | Edge | Group)[] = graph.getNodes();
        selections = selections
          .concat(graph.getEdges())
          .concat(graph.getGroups());
        stack.execute("select", { selections });
      },
    },
  };
}

export async function execClipboardEvent(configs: {
  type: "copy" | "cut" | "paste";
  stack: Stack;
  stackArgs?: Record<string, unknown>;
  cmdName?: string;
}) {
  const { type, stack, stackArgs, cmdName } = configs;
  let success: boolean;
  if (navigator.clipboard) {
    if (type === "copy" || type === "cut") {
      const event = new ClipboardEvent(type, {
        clipboardData: new DataTransfer(),
      });
      success = stack.execute(cmdName || type, {
        event,
        ...stackArgs,
      });
      const content = event.clipboardData?.getData("text/plain") ?? "";
      return await navigator.clipboard.writeText(content).then(
        () => {
          return success; // 成功
        },
        () => {
          return false; // Safari 浏览器可能由于非按键事件而直接reject.
        }
      );
    } else {
      return (
        (await navigator.clipboard.readText?.().then(
          (text) => {
            // firefox 早期版本不支持 clipboard 且也不支持 execCommand('paste')（出于安全性考虑）
            const event = new ClipboardEvent(type, {
              clipboardData: new DataTransfer(),
            });
            event.clipboardData?.setData("text/plain", text);
            success = stack.execute(cmdName || type, {
              event,
              ...stackArgs,
            });
            return success;
          },
          () => {
            return false; // rejected.
          }
        )) ?? false
      );
    }
  } else {
    // 如果浏览器不支持 navigator.clipboard, 降级使用 execCommand
    return document.execCommand(type); //  最近的 chrome 版本已经不再支持 execCommand('paste')
  }
}

// 未来 navigator.clipboard 将是统一的标准。
// 目前所实现方案的限制：
// 1. Safari 必须伴随某个按钮的点击事件触发，否则会被直接reject。 苹果的要求，无法解决。
// 2. Firefox 早期版本不支持 clipboard 且也不支持 execCommand('paste')。火狐出于安全性考虑的设计，无法解决。
// 3. 现有资料表明该方案下 Huawei 设备可能存在兼容性问题. FIXME: 该兼容性问题可解，但 ROI 不高，暂时不解。
