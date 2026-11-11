import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Graph, Group, Node } from "@visactor/vgraph";
import { Viewer } from "../../src/viewer";

function OrderPanel({ reverse }: { reverse: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const calls = useRef(0);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [result, setResult] = useState("等待渲染");
  const [clicked, setClicked] = useState("");

  useEffect(() => {
    const element = container.current!;
    const { width, height } = element.getBoundingClientRect();
    const g = new Graph({
      container: element,
      width,
      height,
      renderMode: "dom",
      setDefaultNode: () => ({ width: 200, height: 56 }),
      setDefaultGroup: () => ({
        titleSize: 56,
        padding: [20, 20, 20, 20],
        fillStyle: "#f1f5f9",
        strokeStyle: "#cbd5e1",
      }),
    });
    g.data({
      nodes: [
        { id: "inside", x: width / 2, y: height / 2 + 30 },
        { id: "overlay", x: width / 2, y: height / 2 },
      ],
      edges: [],
      groups: [{ id: "group", children: ["inside"] }],
    });
    g.refresh();
    const title = g.getGroupById("group")!.getTitleBBox();
    g.update(g.getNodeById("overlay")!, {
      x: title.left + title.width / 2,
      y: title.top + title.height / 2,
    });
    g.refresh();
    setGraph(g);
    return () => g.destroy();
  }, []);

  useEffect(() => {
    if (!graph) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      const viewport = container.current!.querySelector(
        ".vgraph-viewer-viewport"
      )!;
      const order = Array.from(viewport.children).map((child) =>
        child.classList.contains("vgraph-viewer-group-title")
          ? "group"
          : child.querySelector("[data-id]")!.getAttribute("data-id")
      );
      const expected = reverse
        ? ["overlay", "inside", "group"]
        : ["group", "inside", "overlay"];
      const passed =
        JSON.stringify(order) === JSON.stringify(expected) &&
        (reverse ? calls.current > 0 : calls.current === 0);
      console.assert(passed, "Viewer 渲染顺序校验失败", { order, expected });
      setResult(
        `${passed ? "通过" : "失败"} · 回调 ${calls.current} 次 · ${order.join(
          " → "
        )}`
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [graph, reverse]);

  function reverseOrder(items: (Node | Group)[]) {
    calls.current += 1;
    return items.reverse();
  }

  return (
    <section style={{ flex: "1 1 360px", minWidth: 0 }}>
      <h2>{reverse ? "反转：节点 → 分组标题" : "默认：分组标题 → 节点"}</h2>
      <p>{reverse ? "重叠处由分组标题覆盖" : "重叠处由节点覆盖"}</p>
      <div
        ref={container}
        style={{
          position: "relative",
          width: "100%",
          height: "min(55vh, 420px)",
          border: "1px solid #cbd5e1",
        }}
      >
        {graph && (
          <Viewer
            graph={graph}
            localRendering={false}
            setNode={(node) => (
              <button
                style={{
                  width: "100%",
                  height: "100%",
                  border: 0,
                  background:
                    node.get("id") === "overlay" ? "#bae6fd" : "#e2e8f0",
                }}
                onClick={() => setClicked(`节点 ${node.get("id")}`)}
              >
                {node.get("id") === "overlay" ? "重叠节点" : "组内节点"}
              </button>
            )}
            setGroupTitle={() => (
              <button
                style={{
                  width: "100%",
                  height: "100%",
                  border: 0,
                  background: "#fde68a",
                }}
                onClick={() => setClicked("分组标题")}
              >
                分组标题
              </button>
            )}
            setRenderOrder={reverse ? reverseOrder : undefined}
          />
        )}
      </div>
      <p data-order-result={reverse ? "reverse" : "default"}>{result}</p>
      <p>点击结果：{clicked || "请点击重叠区域"}</p>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <main style={{ maxWidth: 1120, margin: "32px auto", padding: "0 24px" }}>
    <h1>节点与分组渲染顺序对照</h1>
    <p>
      两侧使用相同数据和位置。右侧将可见元素列表反转；下方检查实际 DOM
      顺序与回调执行，点击重叠区域可对比覆盖效果。
    </p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <OrderPanel reverse={false} />
      <OrderPanel reverse />
    </div>
  </main>
);
