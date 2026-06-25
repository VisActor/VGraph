import React from "react";
import Table from "../Table";
import "./index.less";

export default ({
  data,
  group,
  showData,
  options,
  highlightTables,
  onClickTable,
  details,
}: {
  data: any;
  group: any;
  showData: any;
  options: any;
  highlightTables: string[];
  details?: string[];
  onClickTable: (tableData: any, group: any) => void;
}) => {
  function getTableContent(tableData: any) {
    if (options.getTableContent) {
      return options.getTableContent(tableData.configs, details);
    }
    return options.getTableName(tableData.configs);
  }

  function clickTableHandler(tableData: any) {
    onClickTable(tableData, group);
  }

  if (!showData) {
    return null;
  }

  if (group.subGroups) {
    return group.subGroupTitles.map((title: string, index: number) => {
      let clsName = "data-lineage-group-sub-title";
      const children = group.subGroups[title];
      if (highlightTables.length) {
        const highlight = children.find(
          (id: string) => data.getNodeById(id)?.highlight
        );
        if (highlight) {
          clsName += " highlight";
        } else {
          clsName += " blur";
        }
      }
      if (!data.getNodeById(children[0])) {
        return null;
      }
      const y = data.getNodeById(children[0]).y - 28;
      return (
        <div
          className="data-lineage-group-sub"
          key={`${group.id}-${title}-${index}`}
        >
          <div className={clsName} style={{ top: y }}>
            {title === "dataLineageEmptyGroup" ? "无" : title}
          </div>
          {children.map((id: string) => {
            const tableData = data.getNodeById(id);
            if (!showData.includes(id) || !tableData) {
              return null;
            }
            const content = getTableContent(tableData);
            return (
              <Table
                key={id}
                data={tableData}
                content={content}
                height={options.tableHeight}
                highlight={highlightTables.length !== 0}
                onClickTable={clickTableHandler}
              />
            );
          })}
        </div>
      );
    });
  } else {
    return showData.map((id: string) => {
      const tableData = data.getNodeById(id);
      if (!tableData) {
        return null;
      }
      const content = getTableContent(tableData);
      return (
        <Table
          highlight={highlightTables.length !== 0}
          height={options.tableHeight}
          key={id}
          data={tableData}
          content={content}
          onClickTable={clickTableHandler}
        />
      );
    });
  }
};
