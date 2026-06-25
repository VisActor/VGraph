import React from "react";
import { createRoot } from "react-dom/client";
import { Popover, Tooltip } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import { GraphStructure } from "@visactor/vgraph";
import { DataLineageGraph } from "../../src";
import data from "../static/column.json";
import { IDataOptions } from "../../src/data_lineage_graph/types";

(() => {
  const App = () => {
    const graphData = new GraphStructure({
      nodes: data.nodes,
      edges: data.edges,
      groups: data.groups,
    });

    const options: IDataOptions = {
      baseTableId: data.baseTableId,
      mode: "column",
      tableHeight: 32,
      getGroupTitle(groupData: any) {
        if (groupData.depth === 0) {
          return "主节点";
        }
        const countStr = "总计";
        const count = groupData.subGroups.length;
        return (
          <div>
            <span>
              {`${Math.abs(groupData.depth)}`}
              {`层${groupData.depth > 0 ? "下游" : "上游"}`}
            </span>
            <span
              style={{
                float: "right",
                color: "rgba(20, 20, 20, 0.65)",
                fontWeight: "normal",
              }}
            >
              {countStr}{" "}
              <b style={{ color: "rgba(20, 20, 20, 0.9)" }}>{count}</b> 个
            </span>
          </div>
        );
      },
      onClickTable(node: any) {
        console.log(node);
      },
      getTaskTooltipContent(data: any) {
        return (
          <div>
            <div style={{ color: "rgba(20, 20, 20, 0.65)", fontSize: 12 }}>
              加工任务名称
            </div>
            {data.edges.map((task: any) => (
              <div key={task.id}>{task.name}</div>
            ))}
          </div>
        );
      },
      getGroupWidth: () => 240,
      getGroupContent(groupData: any) {
        const { name, type } = groupData;
        return (
          <Popover content={name}>
            <div className="relation-table-container" style={{ height: 28 }}>
              <div className="relation-table-name">{name}</div>
            </div>
          </Popover>
        );
      },
      getTableContent(data: any) {
        return (
          <Tooltip content={data.name}>
            <div className="relation-table-name" style={{ paddingLeft: 12 }}>
              {data.name}
            </div>
          </Tooltip>
        );
      },
    };
    return (
      <div style={{ width: 800, height: 600 }}>
        <DataLineageGraph
          data={graphData}
          options={options}
          size={[800, 600]}
          minDepth={-2}
          maxDepth={2}
        />
      </div>
    );
  };
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
