# vgraph-site(2.x demo) -> vgraph demo 迁移注意事项

## 涉及目录：
/Users/bytedance/VisActor/vgraph-dev/vgraph-site/src/specs/graphs/2.x
/Users/bytedance/VisActor/vgraph-dev/vgraph/docs/assets/demo
/Users/bytedance/VisActor/vgraph-dev/visactor-site/docs/output_resource/documents/vgraph-1.0.0/demo

## 目标与原则

请一定要参照目前已经迁移好的demo，如：
docs/assets/demo/zh/editor/commonFlowEditorGroup.md（多文件）
docs/assets/demo/zh/editor/dagTreeEditor.md（单文件）

原则：
- 保持原 demo 的结构和行为，优先做兼容改造，不做不必要重构。
- 顶部要有一段元信息如
    ---
    category: examples
    group: wasm
    title: WASM DAG Layout
    cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/wasmlayout.jpeg
    link: wasm/daglayout
    option:
    ---
- 优先保证可运行，再逐步对齐视觉和交互细节。
- `vgraph/docs` 与 `visactor-site/output_resource` 必须同步更新，避免两边漂移。
- 生成的demo的md文件中上面的原信息来自/vgraph-site/src/const/menu-config-v2.ts。其中英文title要翻译成短句
- 标题后的段落信息（也就是demo说明信息）请用menu-config-v2.ts中的description字段描述。
- demo中如果有引用"@dp/vgraph-solutions"的包，请不要迁移这个demo。
- demo中所写到 vgraph的地方都改为vgraph。"@dp/vgraph"改为"@visactor/vgraph"。
- demo 的代码标题英文是 ## Code Demo. 代码以：
  ```livedemo-files template=vgraph-react
  >>> app.tsx

  ```
  来开头



## 迁移流程建议

1. 先读原始 demo（如果是多文件demo，如editor下有些demo包括了`app/node/sidebar/toolbar`多个文件源码）并记录关键交互点。
2. 如果是多文件demo直接转成 `livedemo-files` 多文件格式，不要先合并成单文件再拆回去。
3. 做最小必要改造：包名替换、语法降级、容器与样式适配。
4. 同步更新中英文和双仓文件。
5. 逐页验证：先能跑，再看视觉，再看交互一致性。

## 高风险坑位清单

### 1) 运行模型不一致

- `vgraph-site（2.x）` 是 UMI + 多文件 TSX；目标侧是 `livedemo-files` + 浏览器端转译。
- 迁移时默认按纯 JS/JSX 去写，减少转译不确定性。

### 2) 不要副作用 CSS 导入

- 避免 `import 'xxx.css'` 这种副作用导入（在 `livedemo-files` 链路里容易触发 `Unexpected string`）。
- 需要样式时优先使用 `insertStyles()` 或站点全局样式。

### 3) 容器 ID 不可复用

- `CommonFlowEditor` 的 `container` 不要直接用 `CONTAINER_ID`（React 挂载根）。
- 建议使用独立 `GRAPH_CONTAINER_ID`，避免覆盖 UI 区域导致 toolbar/sidebar 异常。

### 4) 保守语法优先

- 高风险语法：`?.`、`??`、对象展开、类型断言、`useState<T>`、`: any` 等。
- 统一改为 `if/&&/||`、显式赋值、无类型标注。

### 5) 字段替换要防污染

- 批量替换时重点检查 `action` 字段，避免出现 `action: '\\1'` 这类污染结果。
- 该问题会直接导致 hover 图标行为异常。

### 6) iconfont 依赖要补齐

- 使用 `&#xe613; / &#xe6a7;` 这类字形时，需要可用的 `iconfont`。
- 原仓有全局字体时无需额外处理；目标侧缺失时需注入 `@font-face`。

### 7) 图层与定位问题

- toolbar工具栏 不显示常见原因：
  - 容器无宽高；
  - `zIndex` 过低或被内置控件覆盖；
  - `top/right` 偏移不合理。
- 常用策略：容器 `width/height: 100%`，toolbar 合理 `zIndex` 与定位。

### 8) 跨仓同步原则

- 每次变更至少同步 4 份：
  - `vgraph/docs/assets/demo/zh/...`
  - `vgraph/docs/assets/demo/en/...`
  - `visactor-site/docs/output_resource/.../zh/...`
  - `visactor-site/docs/output_resource/.../en/...`

### 9) getConfigsForShape 必须完整传递 nodeData

- **问题表现**：图标不显示、标签缺失、配置项无效（如 align、percent、showLabel 等）
- **错误写法**：
  ```javascript
  getConfigsForShape: function(nodeData) {
    return {
      width: nodeData.width,
      height: nodeData.height,
      label: { ... }
    };
  }
  ```
  这种写法只会显式传递指定的属性，其他属性（如 icon、tags、align 等）会丢失。
- **正确写法**：
  ```javascript
  getConfigsForShape: function(nodeData) {
    var configs = Object.assign({}, nodeData);
    configs.label = { ... };
    return configs;
  }
  ```
  先用 Object.assign 复制所有 nodeData，再覆盖需要自定义的属性。
- 这个问题影响范围广：所有使用自定义节点且通过 getConfigsForShape 配置的 demo 都需要检查。

## 修改后验证策略

- 目的：尽快发现“文件能改但运行会炸”的问题（转译/运行时错误）。
- 推荐节奏：
  - 小改动：先做语法扫描，不必每次都跑完整 build。
  - 一组 demo 改完：统一跑一次构建或页面验证。
  - 遇到链路敏感改动（转译、模块、容器、字体）：改完即做运行验证。
- 常见验证点：
  - 控制台是否出现 `Unexpected string`、`Unexpected token`。
  - `transform fail in xxx.tsx` 是否消失。
  - hover 锚点、toolbar、快捷键、布局行为是否与原仓一致。

## 快速检查清单

- [ ] 若为多文件demo 检查其结构是否完整（`app/node/sidebar/toolbar`）。
- [ ] 是否残留 TS 语法与高风险现代语法。
- [ ] 是否存在副作用 CSS 导入。
- [ ] editor container 是否与 React 根容器隔离。
- [ ] iconfont 是否可用（涉及 unicode 图标时）。
- [ ] `action` 字段是否正确且未被污染。
- [ ] getConfigsForShape 是否完整传递 nodeData（使用 Object.assign({}, nodeData)）。
- [ ] 中英文与双仓文件是否全部同步。
- [ ] 页面行为是否与原 demo 对齐。
