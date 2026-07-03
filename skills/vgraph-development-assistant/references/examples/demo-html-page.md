# Standalone HTML Demo Page

Use this pattern when the user asks for a standalone, previewable, or showcase-style VGraph demo, such as an HTML demo, runnable visualization, structure diagram, knowledge map, or code-tab page. This is an artifact task: the deliverable is a runnable file, not only chat code.

For simple API usage, configuration help, or debugging answers, prefer a focused TypeScript snippet unless a runnable page materially improves verification. If the request says "create", "generate", "build", "show", "make a demo", "previewable", "HTML", "page", "knowledge map", "structure diagram", or "runnable visualization", classify it as an artifact task unless the user explicitly asks for a snippet/config only.

## Delivery gate

Before the final answer for an artifact task, verify all items:

- A standalone HTML/demo file was created or updated.
- The response gives the user a consumable path, link, or preview URL.
- The response explains how to open or validate the demo.
- The response summarizes the implementation and does not paste the full source into chat.

If any item is false, do not present the task as complete. Continue creating the artifact or state the exact blocker.

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

Keep generic HTML/CSS minimal. Spend tokens on VGraph data shape, layout,
behaviors, interaction controls, and runtime verification rather than decorative
page chrome.

## Minimal HTML shell

For a real standalone HTML file, use an executable module script. Prefer a local
package/dev-server import when working inside this repository; use an ESM CDN
only when the user explicitly wants a portable single HTML file and accepts
network access. Do not paste TypeScript-only syntax such as generic query
selectors or `interface` declarations into a plain browser `<script>`.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VGraph Demo</title>
  <style>
    html,
    body {
      height: 100%;
      margin: 0;
    }
  </style>
</head>
<body>
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

<script type="module">
  import {
    Graph,
    TreeGraph,
    panZoom,
    dragCanvas
  } from "https://esm.sh/@visactor/vgraph";

  // Put the demo logic here. If developing inside the monorepo, replace the
  // CDN import with the package/dev-server import used by the local example.
</script>
</body>
</html>
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

```js
const tabs = Array.from(document.querySelectorAll(".tab"));
const panels = Array.from(document.querySelectorAll(".panel"));
const container = document.getElementById("container");
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

Use `TreeGraph` for nested `children` data. Prefer the native collapse API:
`graph.collapse(node)`, `graph.expand(node)`, or `graph.toggleCollapse(node)`.
Do not implement ordinary expand/collapse by deriving a new visible tree and
calling `graph.data(...)` on every click; that turns a visibility interaction
into a data update, re-layout, redraw, and possible animation replay. Use the
visible-tree pattern only when the user needs true data filtering,
virtualization, or server-side paging.

```ts
import { TreeGraph, panZoom, dragCanvas } from "@visactor/vgraph";

interface TreeNode {
  id: string;
  name?: string;
  level?: string;
  collapsed?: boolean;
  children?: TreeNode[];
}

const nodeMap = new Map<string, TreeNode>();

function walkTree(node: TreeNode, visitor: (node: TreeNode) => void) {
  visitor(node);
  node.children?.forEach(child => walkTree(child, visitor));
}

walkTree(sourceTree, node => {
  nodeMap.set(node.id, node);
  node.collapsed = Boolean(node.children?.length && node.level === "module");
});

const graph = new TreeGraph({
  container: "container",
  width,
  height,
  animate: false,
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

graph.addBehavior(panZoom, { sensitivity: 4 });
graph.addBehavior(dragCanvas);

graph.on("node:click", ev => {
  const id = ev?.target?.get?.("id");
  if (!id || !nodeMap.get(id)?.children?.length) return;

  graph.toggleCollapse(ev.target);
});

graph.data(sourceTree);
```

Set `animate: false` for static knowledge-map demos when repeated expand/collapse
should feel instant and not replay layout transitions. Keep animation on only
when the transition itself is part of the requested experience.

## Verification

After creating the HTML file, open it through a local static/dev server when possible and check the browser console. The expected result is a visible graph in the Demo tab, a scrollable Code tab, working copy-code behavior if included, and no console errors. If browser preview is unavailable, state that runtime validation was skipped instead of implying it passed.

Keep the code shown in the Code tab focused on the reusable VGraph logic. It does not need to include every decorative CSS rule from the page.
