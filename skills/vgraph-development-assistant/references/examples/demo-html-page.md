# Standalone HTML Demo Page

Use this pattern when the user asks for a standalone, previewable, or showcase-style VGraph demo, such as an HTML demo, runnable visualization, structure diagram, knowledge map, or code-tab page. For simple API usage, configuration help, or debugging answers, prefer a focused TypeScript snippet unless a runnable page materially improves verification.

## Demo page requirements

A polished standalone demo should contain:

- A live `Demo` tab with a visible VGraph canvas.
- A `Code` tab showing the key runnable TypeScript or JavaScript implementation.
- A copy-code button when practical.
- A fixed-size Code panel with internal scrolling for long code.
- Basic navigation behaviors such as `panZoom` and `dragCanvas` for graph exploration.
- Graph dimensions that match the visible container. Prefer measuring `container.clientWidth` and `container.clientHeight` over hard-coded graph sizes when the page is responsive.
- For large tree or hierarchy demos, an initial collapsed view and controls such as `Expand all` and `Collapse details`.
- For large non-tree Graph/DAG demos, readability controls such as fit-to-view, search/highlight, filtering, grouping, or progressive disclosure. Do not force tree-collapse patterns onto edge-list data.

## Minimal HTML shell

```html
<div class="tabs">
  <button class="tab active" data-tab="demo-panel">Demo</button>
  <button class="tab" data-tab="code-panel">Code</button>
</div>

<section id="demo-panel" class="panel active">
  <div id="container" class="graph-container"></div>
</section>

<section id="code-panel" class="panel code-panel">
  <div class="code-toolbar">
    <span>Core VGraph code</span>
    <button id="copy-code">Copy code</button>
  </div>
  <pre><code id="code-block"></code></pre>
</section>
```

```css
.panel {
  display: none;
  height: 640px;
}

.panel.active {
  display: block;
}

.graph-container {
  width: 100%;
  height: 100%;
}

.code-panel {
  border-radius: 16px;
  background: #0f172a;
  color: #e5e7eb;
  overflow: hidden;
}

.code-toolbar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.24);
}

.code-panel pre {
  height: calc(100% - 48px);
  margin: 0;
  padding: 16px;
  overflow: auto;
  white-space: pre;
  font-size: 13px;
  line-height: 1.6;
}
```

```ts
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>(".tab"));
const panels = Array.from(document.querySelectorAll<HTMLElement>(".panel"));
const container = document.getElementById("container") as HTMLDivElement;
const { width, height } = container.getBoundingClientRect();

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach(item => item.classList.toggle("active", item === tab));
    panels.forEach(panel => panel.classList.toggle("active", panel.id === target));
  });
}
```

## Tree collapse pattern

Use `TreeGraph` for nested `children` data. Keep the original full tree immutable, derive a visible tree from collapsed IDs, and call `graph.data(visibleTree)` after each toggle.

```ts
import { TreeGraph, panZoom, dragCanvas } from "@visactor/vgraph";

interface TreeNode {
  id: string;
  name?: string;
  level?: string;
  collapsed?: boolean;
  children?: TreeNode[];
}

const collapsedIds = new Set<string>();
const nodeMap = new Map<string, TreeNode>();

function walkTree(node: TreeNode, visitor: (node: TreeNode) => void) {
  visitor(node);
  node.children?.forEach(child => walkTree(child, visitor));
}

walkTree(sourceTree, node => {
  nodeMap.set(node.id, node);
  if (node.children?.length && node.level === "module") {
    collapsedIds.add(node.id);
  }
});

function cloneVisibleNode(node: TreeNode): TreeNode {
  const children = node.children ?? [];
  const collapsed = children.length > 0 && collapsedIds.has(node.id);
  const next: TreeNode = {
    ...node,
    collapsed,
    name: children.length ? `${collapsed ? "▸" : "▾"} ${node.name}` : node.name
  };

  if (children.length && !collapsed) {
    next.children = children.map(cloneVisibleNode);
  } else {
    delete next.children;
  }

  return next;
}

const graph = new TreeGraph({
  container: "container",
  width,
  height,
  layout: {
    type: "compactBox",
    options: { direction: "LR" }
  },
  setDefaultNode: node => ({
    id: node.id,
    label: node.name ?? node.id,
    width: node.children?.length ? 180 : 160,
    height: 40,
    style: {
      fill: node.collapsed ? "#f8fafc" : "#fff",
      stroke: "#2f80ed",
      cursor: nodeMap.get(node.id)?.children?.length ? "pointer" : "default"
    }
  })
});

function renderTree() {
  graph.data(cloneVisibleNode(sourceTree));
}

graph.addBehavior(panZoom, { sensitivity: 4 });
graph.addBehavior(dragCanvas);

graph.on("node:click", ev => {
  const id = ev?.datum?.id ?? ev?.target?.id;
  if (!id || !nodeMap.get(id)?.children?.length) return;

  if (collapsedIds.has(id)) collapsedIds.delete(id);
  else collapsedIds.add(id);

  renderTree();
});

renderTree();
```

## Verification

After creating the HTML file, open it through a local static/dev server when possible and check the browser console. The expected result is a visible graph in the Demo tab, a scrollable Code tab, working copy-code behavior if included, and no console errors. If browser preview is unavailable, state that runtime validation was skipped instead of implying it passed.

Keep the code shown in the Code tab focused on the reusable VGraph logic. It does not need to include every decorative CSS rule from the page.
