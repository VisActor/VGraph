# @visactor/react-vgraph-ui

React UI helpers for [VGraph](https://visactor.io/vgraph), including tooltip, trigger, and context menu components.

## Installation

```bash
npm install @visactor/vgraph @visactor/react-vgraph-ui @arco-design/web-react react react-dom
```

If your application uses TypeScript, install React type packages in the app as usual:

```bash
npm install -D @types/react @types/react-dom
```

## Peer Dependencies

- `@visactor/vgraph`
- `@arco-design/web-react`
- `react`
- `react-dom`

## Exports

- `Tooltip`: Tooltip wrapper bound to graph entities or legends
- `Trigger`: Trigger helper for graph interactions
- `Contextmenu`: Context menu rendered inside the graph container

## Quick Start

```tsx
import React from 'react';
import '@arco-design/web-react/dist/css/arco.css';
import { Tooltip, Contextmenu } from '@visactor/react-vgraph-ui';

export function GraphUi({ graph }) {
  return (
    <>
      <Tooltip graph={graph} target="node" getContent={(node) => node.id} onVisibleChange={() => {}} />
      <Contextmenu
        graph={graph}
        targets={['node']}
        showContextmenu={() => true}
        getContent={(node) => <div>{node.id}</div>}
      />
    </>
  );
}
```

## Documentation

- Docs: [https://visactor.io/vgraph](https://visactor.io/vgraph)
- Examples: [https://visactor.io/vgraph/example](https://visactor.io/vgraph/example)
