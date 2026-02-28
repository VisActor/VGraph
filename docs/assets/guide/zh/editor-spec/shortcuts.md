# 快捷键 Shortcuts

快捷键组件是 vGraph 中用于处理快捷键的组件，用于处理用户的快捷键操作。采用字符组合的方式来进行快捷键的监听。
- 支持修饰键： `⇧`, `shift`, `⌥`, `alt`, `option`, `^`, `ctrl`, `control`, `⌘`,`command`。
- 支持特殊键：`,`, `.`, `/`, `-`, `=`, `;`, `[`, `]`, `backspace`, `tab`, `clear`, `enter`, `return`, `esc`, `escape`, `space`, `up`, `down`, `left`, `right`, `home`, `end`, `pageup`, `pagedown`, `del`, `delete`, `f1` - `f12`。

快捷键组件接受`shortcutsHandlers`配置，类型定义如下：
```javascript
type ShortcutsHandlers = {
    [key: string]: {
        // 可以是一个，也可以是多个快捷键组合。以 , 分割。具体可以参考内置快捷键。
        shortcut: string;
        // 事件处理方法
        handler:  (event: KeyboardEvent | ClipboardEvent) => {};
    };
};
```

以下是快捷键组件的使用示例，也可以在 demo 中进行体验。

```javascript
import { Graph, Shortcuts } from "@visactor/vgraph";
const shortcuts = new Shortcuts({
    pressA: {
      shortcut: 'a',
      handler: (event: KeyboardEvent | ClipboardEvent) => {
        console.log('you just pressed a');
      }
    },
});
```

由于快捷键操作经常需要与操作栈配合工作，比如复制粘贴操作。vGraph 提供了工具方法生成默认快捷键操作，使用如下

```javascript
import { Graph, Stack, Shortcuts, getDefaultShortcuts } from "@visactor/vgraph";
// stack 应支持复制，剪切，粘贴，选择，删除指令以配合默认快捷键正常工作
const stack = new Stack({...});
const shortcutsHandlers = getDefaultShortcuts(stack);
// shortcutsHandlers 会以 object 的方式返回，可以剔除掉一些不需要的快捷键。例如禁止全选。所有默认快捷键请见下方列表。
delete shortcutsHandlers.selectAll;
const shortcuts = new Shortcuts(shortcutsHandlers);
```

## 内置默认快捷键
vGraph 中内置了多个常用快捷键，可以通过 getDefaultShortcuts(stack) 获取。

| key | shortcut | handler |
| ---- | ------- | ------- |
| copy | ⌘+c, ctrl+c | 复制 |
| cut | ⌘+x, ctrl+x | 剪切 |
| paste | ⌘+v, ctrl+v | 粘贴 |
| undo | ⌘+z, ctrl+z | 撤销 |
| redo | ⌘+shift+z, ctrl+shift+z | 重做 |
| selectAll | ⌘+a, ctrl+a | 全选 |
| delete | backspace | 删除 |
