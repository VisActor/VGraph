
# VGraph

VGraph, more than just a graph visualization engine, but also a solution for graph analysis.

[Introduction](https://visactor.io/vgraph) •
[Demo](https://visactor.io/vgraph/example) •
[Tutorial](https://visactor.io/vgraph/guide) •

English | [简体中文](./README.zh-CN.md)

## Introduction

VGraph is the graph visualization and analysis engine of [VisActor](https://visactor.io). The core capabilities are as follows:

- **Rich elements**: Built-in multiple nodes, edges and other graph elements to meet the drawing needs of various graph analysis scenarios such as flowcharts, mind maps, and DAGs.
- **High performance**: Based on the high-performance rendering engine, it supports smooth interaction of tens of thousands of nodes and edges.
- **Rich interaction**: Built-in rich interaction, supports custom interaction to meet various interactive analysis needs.
- **Layout on demand**: Supports a variety of built-in layouts and custom layouts, which can be combined and switched at will.

### Repository Introduction

This repository includes the following packages:

1. `@visactor/vgraph`: The core code repository of VGraph
2. `@visactor/react-vgraph`: The VGraph component encapsulated based on [React](https://react.dev/)
3. `@visactor/react-vgraph-ui`: Some React UI components for VGraph

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
// prepare data
const data = {
    nodes: [{
        id: 'Hello',
        x: 100,
        y: 100,
    }, {
        id: 'World',
        x: 300,
        y: 100,
    }],
    edges: [{
        source: 'Hello',
        target: 'World',
    }],
};
const spec = {
  //  specify the graph container
  container: 'graphContainer',
  width: 800,
  height: 600,
  //  configure node style
  setDefaultNode(nodeData) {
      return {
          label: nodeData.id,
          width: 100,
          height: 40,
      }
  }
};
// create graph instance
const vgraph = new Graph(spec);
// import data
vgraph.data(data);
```

## Development

First of all, please install [@microsoft/rush](https://rushjs.io/pages/intro/get_started/)

```
$ npm i --global @microsoft/rush
```

Then clone locally:

```
# clone
$ git clone git@github.com:VisActor/VGraph.git
$ cd vgraph
# install dependencies
$ rush update
# start vgraph development server
$ rush start
# start document development server
$ rush docs
```

Maintainers can read the [release guide](./docs/release.md) for npm publishing.

## 🔗 Related Links

- [Homepage](https://www.visactor.io/vgraph)
- [Graph Examples](https://www.visactor.io/vgraph/example)
- [VGraph Tutorials](https://www.visactor.io/vgraph/guide)
- [CodeSandbox Template](https://codesandbox.io/p/sandbox/vgraph-demo-gxvp5z) for bug reports

## 🤝 Contribution

If you would like to contribute, please read the [Code of Conduct](./CODE_OF_CONDUCT.md) and our [contributing guide](./CONTRIBUTING.md) first。

Small streams converge to make great rivers and seas!

## License

This project is licensed under the [MIT License](./LICENSE).

Third-party runtime and peer dependency licenses are listed in [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md).
