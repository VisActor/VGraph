# Shortcuts

The Shortcuts component in vGraph is used to handle keyboard shortcuts. It listens for key combinations to process user shortcut operations.
- Supported modifier keys: `⇧`, `shift`, `⌥`, `alt`, `option`, `^`, `ctrl`, `control`, `⌘`,`command`.
- Supported special keys: `,`, `.`, `/`, `-`, `=`, `;`, `[`, `]`, `backspace`, `tab`, `clear`, `enter`, `return`, `esc`, `escape`, `space`, `up`, `down`, `left`, `right`, `home`, `end`, `pageup`, `pagedown`, `del`, `delete`, `f1` - `f12`.

The Shortcuts component accepts a `shortcutsHandlers` configuration, with the type defined as follows:
```javascript
type ShortcutsHandlers = {
    [key: string]: {
        // Can be a single shortcut or multiple combinations, separated by commas. Refer to the built-in shortcuts for details.
        shortcut: string;
        // Event handler method
        handler:  (event: KeyboardEvent | ClipboardEvent) => {};
    };
};
```

Here is an example of using the Shortcuts component. You can also try it in the demo.

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

Since shortcut operations often need to work with the operation stack (e.g., copy and paste), vGraph provides a utility method to generate default shortcut actions, as shown below:

```javascript
import { Graph, Stack, Shortcuts, getDefaultShortcuts } from "@visactor/vgraph";
// The stack should support copy, cut, paste, select, and delete commands to work correctly with default shortcuts.
const stack = new Stack({...});
const shortcutsHandlers = getDefaultShortcuts(stack);
// shortcutsHandlers will be returned as an object, allowing you to remove any unwanted shortcuts. For example, to disable select all. See the list below for all default shortcuts.
delete shortcutsHandlers.selectAll;
const shortcuts = new Shortcuts(shortcutsHandlers);
```

## Built-in Default Shortcuts
vGraph has several commonly used shortcuts built-in, which can be obtained via `getDefaultShortcuts(stack)`.

| key | shortcut | handler |
| ---- | ------- | ------- |
| copy | ⌘+c, ctrl+c | Copy |
| cut | ⌘+x, ctrl+x | Cut |
| paste | ⌘+v, ctrl+v | Paste |
| undo | ⌘+z, ctrl+z | Undo |
| redo | ⌘+shift+z, ctrl+shift+z | Redo |
| selectAll | ⌘+a, ctrl+a | Select All |
| delete | backspace | Delete |
