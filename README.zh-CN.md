
# VGraph

VGraph，不仅仅是图可视化渲染引擎，更是图分析解决方案。

[官网](https://visactor.io/vgraph) •
[案例](https://visactor.io/vgraph/example) •
[教程](https://visactor.io/vgraph/guide) •

[English](./README.md) | 简体中文

## 简介

VGraph 是 [VisActor](https://visactor.io) 可视化体系中的图可视化及分析引擎。核心能力如下：

- **元素丰富**: 内置多种节点、边等图元素，满足流程图、脑图、DAG 图等各类图分析场景的绘制需求。
- **性能卓越**: 基于高性能渲染引擎，支持上万点边的流畅交互。
- **交互丰富**: 内置丰富的交互，支持自定义交互，满足各类交互分析需求。
- **布局按需**: 支持多种内置布局及自定义布局，可随意组合切换。

### 仓库简介

本仓库包含如下包：

1. `@visactor/vgraph`: VGraph 核心代码仓库
2. `@visactor/react-vgraph`: 基于 [React](https://react.dev/) 封装的 VGraph 组件
3. `@visactor/react-vgraph-ui`: VGraph 的部分 React UI 组件

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
// 准备数据
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
  // 指定图容器
  container: 'graphContainer',
  width: 800,
  height: 600,
  // 配置节点样式
  setDefaultNode(nodeData) {
      return {
          label: nodeData.id,
          width: 100,
          height: 40,
      }
  }
};
// 创建 graph 实例
const vgraph = new Graph(spec);
// 导入数据
vgraph.data(data);
```

## 开发

首先，请全局安装 [@microsoft/rush](https://rushjs.io/pages/intro/get_started/)

```
$ npm i --global @microsoft/rush
```

接着将代码 clone 至本地：

```
# clone
$ git clone git@github.com:VisActor/VGraph.git
$ cd vgraph
# 安装依赖
$ rush update
# 启动 vgraph 开发服务
$ rush start
# 启动文档开发服务
$ rush docs
```

维护者可阅读 [发布说明](./docs/release.md) 了解 npm 发布流程。

## 🔗 相关链接

- [官网](https://www.visactor.io/vgraph)
- [图表示例](https://www.visactor.io/vgraph/example)
- [教程](https://www.visactor.io/vgraph/guide)
- [CodeSandbox 模板](https://codesandbox.io/p/sandbox/vgraph-demo-gxvp5z) for bug reports

## 🤝 贡献

如果您希望参与贡献，请阅读 [行为准则](./CODE_OF_CONDUCT.md) 和我们的 [贡献指南](./CONTRIBUTING.md)。

涓涓细流，汇聚成海！

## 协议

本项目基于 [MIT 协议](./LICENSE)，请自由享受及参与开源。

第三方运行时依赖和 peer 依赖的许可证见 [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md)。
