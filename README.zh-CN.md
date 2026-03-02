
# VGraph

VGraph，不仅仅是图可视化渲染引擎，更是图分析解决方案。

[官网](https://visactor.io/vgraph) •
[案例](https://visactor.io/vgraph/example) •
[教程](https://visactor.io/vgraph/guide) •
[API](https://visactor.io/vgraph/api/vgraph)

[English](./README.md) | 简体中文

## 简介

VGraph 是 [VisActor](https://visactor.io) 可视化体系中的图可视化及分析引擎。核心能力如下：

- **元素丰富**: 内置多种节点、边等图元素，满足流程图、脑图、DAG 图等各类图分析场景的绘制需求。
- **性能卓越**: 基于高性能渲染引擎，支持上万点边的流畅交互。同时支持基于 WASM 的高性能布局，完美解决图分析的性能问题。
- **交互丰富**: 内置丰富的交互，支持自定义交互，满足各类交互分析需求。
- **布局按需**: 支持多种内置布局及自定义布局，可随意组合切换。

### 仓库简介

本仓库包含如下包：

1. `@visactor/vgraph`: VGraph 核心代码仓库
2. `@visactor/react-vgraph`: 基于 [React](https://react.dev/) 封装的 VGraph 组件
3. `@visactor/react-vgraph-ui`: VGraph 的部分 React UI 组件
4. `@visactor/vgraph-wasm`: vgraph 布局的 wasm 版本

## 安装

### 📦 安装

```
# npm
$ npm install @visactor/vgraph

# yarn
$ yarn add @visactor/vgraph
```

### 📊 一个简单的图表示例

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

// 'chart' 是图表 dom 容器的 id，比如 <div id="chart"></chart>
const vgraph = new Graph(spec, { dom: 'chart' });
vgraph.render();
```

## 开发

首先，请全局安装 [@microsoft/rush](https://rushjs.io/pages/intro/get_started/)

```
$ npm i --global @microsoft/rush
```

接着将代码 clone 至本地：

```
# clone
$ git clone git@github.com:VisActor/vgraph.git
$ cd vgraph
# 安装依赖
$ rush update
# 启动 vgraph 开发服务
$ rush start
# 启动文档开发服务
$ rush docs
```

## 🔗 相关链接

- [官网](https://www.visactor.io/vgraph)
- [图表示例](https://www.visactor.io/vgraph/example)
- [教程](https://www.visactor.io/vgraph/guide)
- [CodeSandbox 模板](https://codesandbox.io/s/vgraph-simple-demo-g8q738?file=/src/index.ts) for bug reports

## 🤝 贡献

如果您希望参与贡献，请阅读 [行为准则](./CODE_OF_CONDUCT.md) 和我们的 [贡献指南](./CONTRIBUTING.md)。

涓涓细流，汇聚成海！

## 协议

本项目基于 [MIT 协议](./LICENSE)，请自由享受及参与开源。

本项目包含第三方组件，其各自的许可证在 [THIRD-PARTY-LICENSES.md](./THIRD-PARTY-LICENSES.md) 文件中列出。原有的声明文件可见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
