# 快速开始

## 安装

### 通过 npm 安装
【需要设置默认的 npm 源为 bnpm】

```
npm install @visactor/vgraph --save
```

成功安装完成之后，即可引用 vgraph 进行丰富的图分析产品研发:

```typescript
import { Graph } from '@visactor/vgraph';
```



## 快速试用

在 vGraph 引入页面后，我们就已经做好了创建第一个关系图的准备了。下面是以一个 Hello World 图为例开始搭建我们的第一个图。

### step1: 创建图容器

```html
<div id="graphContainer"></div>
```

### step2: 数据准备
```typescript
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
```

### step3: 创建 graph 实例

```typescript
const graph = new Graph({
    // 指定图容器
    container: 'graphContainer',
    // 指定图尺寸
    width: 400,
    height: 300,
    // 配置节点样式
    setDefaultNode(nodeData) {
        return {
            label: nodeData.id,
            width: 100,
            height: 40,
        }
    }
});

```

### step4: 导入数据
```typescript
graph.data(data);
```

最终结果：

<p><img src="/vgraph/guide/sample.png" width="400"></p>

### step5: 销毁实例
```typescript
graph.destroy();
```
