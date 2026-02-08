import React, { useEffect, useState, useRef } from "react";
import { render } from "react-dom";
import { Button, Popover } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import { GraphStructure } from "@visactor/vgraph";
import { DataLineageGraph } from "../../src";
import data from "../static/table.json";
import { IDataOptions } from "../../src/data_lineage_graph/types";

(() => {
  const App = () => {
    const [graphData, setGraphData] = useState<GraphStructure | null>(null);
    const [options, setOptions] = useState<IDataOptions>({
      baseTableId: data.baseTableId,
      mode: "table",
      getGroupWidth(depth: number, count: number) {
        return 250;
      },
      onClickTable(data: any) {
        console.log(arguments);
      },
      onClickEdge(data: any) {
        console.log("edge clicked", data);
      },
      getEmptyContent(group: any) {
        return <div>暂无数据</div>;
      },
      getTableContent(data: any) {
        return (
          <Popover
            title={null}
            content={data.name}
            triggerProps={{ mouseEnterDelay: 400 }}
          >
            <div
              style={{
                padding: 10,
                lineHeight: "20px",
                backgroundColor: data.search ? "#e8f4ff" : "#fff",
              }}
              className="relation-table-container"
            >
              <div className="relation-table-name">{data.name}</div>
            </div>
          </Popover>
        );
      },
      getGroupTitle(groupData: any) {
        const { depth } = groupData;
        if (depth === 0) {
          return "主节点";
        }
        let countStr = "总计";
        let count = groupData.children.length;
        // if (filter) {
        //   countStr = i18n`筛选结果为`;
        //   const data = state.lineageData;
        //   count = 0;
        //   groupData.children.filter((id: string) => {
        //     if (!data?.nodeMap[id].filtered) {
        //       count++;
        //     }
        //   });
        // }
        return (
          <div>
            <span>
              {`${Math.abs(depth)}`}
              {`层${depth > 0 ? "下游" : "上游"}`}
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
      getTaskTooltipContent(data: any) {
        return data.edges.map((task: any) => (
          <div key={task.id} className="data-lineage-tooltip-list">
            {task.name}
          </div>
        ));
      },
    });

    const [size, setSize] = useState([800, 550]);

    useEffect(() => {
      const tableData = new GraphStructure({
        directed: true,
        nodes: data.nodes,
        edges: data.edges,
      });
      setGraphData(tableData);
    }, []);

    function toggleFilter() {
      const newOptions = Object.assign({}, options, {
        filter: options.filter
          ? null
          : {
              type: "type",
              value: ["ClickhouseTable"],
            },
      });
      setOptions(newOptions);
    }

    function toggleGroup() {
      const newOptions = Object.assign({}, options, {
        getGroupData: options.getGroupData
          ? null
          : (tableData: any) => {
              return tableData.department;
            },
      });
      setOptions(newOptions);
    }

    function searchItem() {
      const newOptions = Object.assign({}, options, {
        search: (nodeData: any) =>
          nodeData.get("name") === "random.table0.9271959855645995",
        onEmptySearch: () => {
          console.log("No items found.");
        },
      });
      setOptions(newOptions);
    }

    function changeContent() {
      const newOptions = Object.assign({}, options, {
        getTableContent(data: any) {
          return (
            <Popover
              title={null}
              content={data.name}
              triggerProps={{ mouseEnterDelay: 400 }}
            >
              <div
                style={{
                  padding: 10,
                  lineHeight: "20px",
                  backgroundColor: "#666",
                }}
                className="relation-table-container"
              >
                <div className="relation-table-name">{data.name}</div>
              </div>
            </Popover>
          );
        },
      });
      setOptions(newOptions);
    }

    function update() {
      setGraphData(
        new GraphStructure({
          nodes: [
            {
              id: "695",
              type: "HiveTable",
              name: "random.table0.5455542412864671",
              department: "department4",
            },
            {
              id: "2267",
              type: "EsIndex",
              name: "random.table0.5739123504509811",
              department: "department3",
            },
            {
              id: "2268",
              type: "DoradoTask",
              name: "random.table0.10492836627639268",
              department: "department2",
            },
          ],
          edges: [
            {
              source: "2267",
              target: "695",
              processId: "1562",
            },
            {
              source: "695",
              target: "2268",
              processId: "1562",
            },
          ],
        })
      );
      setOptions({
        ...options,
        getGroupData: (tableData: any) => {
          return tableData.department;
        },
      });
    }

    return (
      <div>
        <div style={{ marginBottom: 8 }}>
          <Button onClick={toggleFilter} style={{ marginRight: 12 }}>
            {options.filter ? "清除筛选" : "筛选"}
          </Button>
          <Button onClick={toggleGroup} style={{ marginRight: 12 }}>
            {options.getGroupData ? "取消分组" : "分组"}
          </Button>
          <Button onClick={searchItem} style={{ marginRight: 12 }}>
            搜索
          </Button>
          <Button onClick={update} style={{ marginRight: 12 }}>
            更新
          </Button>
          <Button onClick={changeContent}>节点样式</Button>
        </div>
        <div style={{ width: size[0], height: size[1] }}>
          <DataLineageGraph data={graphData!} options={options} size={size} />
        </div>
      </div>
    );
  };
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
})();
