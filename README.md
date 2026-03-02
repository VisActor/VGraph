
# VGraph

VGraph, more than just a graph visualization engine, but also a solution for graph analysis.

[Introduction](https://visactor.io/vgraph) •
[Demo](https://visactor.io/vgraph/example) •
[Tutorial](https://visactor.io/vgraph/guide) •
[API](https://visactor.io/vgraph/api/vgraph)

English | [简体中文](./README.zh-CN.md)

## Introduction

VGraph is the graph visualization and analysis engine of [VisActor](https://visactor.io). The core capabilities are as follows:

- **Rich elements**: Built-in multiple nodes, edges and other graph elements to meet the drawing needs of various graph analysis scenarios such as flowcharts, mind maps, and DAGs.
- **High performance**: Based on the high-performance rendering engine, it supports smooth interaction of tens of thousands of nodes and edges. It also supports WASM-based high-performance layout, which perfectly solves the performance problems of graph analysis.
- **Rich interaction**: Built-in rich interaction, supports custom interaction to meet various interactive analysis needs.
- **Layout on demand**: Supports a variety of built-in layouts and custom layouts, which can be combined and switched at will.

### Repository Introduction

This repository includes the following packages:

1. `@visactor/vgraph`: The core code repository of VGraph
2. `@visactor/react-vgraph`: The VGraph component encapsulated based on [React](https://react.dev/)
3. `@visactor/react-vgraph-ui`: Some React UI components for VGraph
4. `@visactor/vgraph-wasm`: Wasm version of vgraph layouts

## Installation

### 📦 Installation

```
# npm
$ npm install @visactor/vgraph

# yarn
$ yarn add @visactor/vgraph
```

### 📊 A Chart Example

```
import { Graph } from '@visactor/vgraph';

const spec = {
  width: 800,
  height: 600,
  data: {
    nodes: [
      { id: '0', label: '0' },
      { id: '1', label: '1' },
      { id: '2', label: '2' },
      { id: '3', label: '3' },
      { id: '4', label: '4' },
    ],
    edges: [
      { source: '0', target: '1' },
      { source: '0', target: '2' },
      { source: '0', target: '3' },
      { source: '1', target: '4' },
      { source: '2', target: '4' },
      { source: '3', target: '4' }
    ]
  },
  layout: {
    type: 'force'
  }
};

// 'chart' is the id of your dom container, such as <div id="chart"></chart>
const vgraph = new Graph(spec, { dom: 'chart' });
vgraph.render();
```

## Development

First of all, please install [@microsoft/rush](https://rushjs.io/pages/intro/get_started/)

```
$ npm i --global @microsoft/rush
```

Then clone locally:

```
# clone
$ git clone git@github.com:VisActor/vgraph.git
$ cd vgraph
# install dependencies
$ rush update
# start vgraph development server
$ rush start
# start document development server
$ rush docs
```

## 🔗 Related Links

- [Homepage](https://www.visactor.io/vgraph)
- [Graph Examples](https://www.visactor.io/vgraph/example)
- [VGraph Tutorials](https://www.visactor.io/vgraph/guide)
- [CodeSandbox Template](https://codesandbox.io/s/vgraph-simple-demo-g8q738?file=/src/index.ts) for bug reports

## 🤝 Contribution

If you would like to contribute, please read the [Code of Conduct](./CODE_OF_CONDUCT.md) and our [contributing guide](./CONTRIBUTING.md) first。

Small streams converge to make great rivers and seas!

## License

This project is licensed under the [MIT License](./LICENSE).

This project contains third-party components, and their respective licenses are listed in the [THIRD-PARTY-LICENSES.md](./THIRD-PARTY-LICENSES.md) file. The original notices can be found in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
