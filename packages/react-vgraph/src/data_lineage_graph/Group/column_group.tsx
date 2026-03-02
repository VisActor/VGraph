import React from "react";
import Table from "../Table";
import "./index.less";

export default ({
  data,
  showData,
  group,
  options,
  highlightTables,
  onClickTable,
}: {
  data: any;
  showData: any;
  group: any;
  options: any;
  highlightTables: any;
  onClickTable: (tableData: any, group: any) => void;
}) => {
  function getTableContent(tableData: any, group: any, i: number) {
    if (options.getTableContent) {
      return options.getTableContent(tableData.configs, options, group, i);
    }
    return options.getTableName(tableData.configs);
  }

  return group.subGroups.map((table: any) => {
    let clsName = "data-lineage-group-sub-title";
    if (highlightTables.length) {
      const highlight = table.children.find((id: string) =>
        highlightTables.includes(id)
      );
      if (highlight) {
        clsName += " highlight";
      } else {
        clsName += " blur";
      }
    }
    if (!data.getNodeById(table.children[0]) || !showData) {
      return null;
    }
    const y = data.getNodeById(table.children[0]).y - 28;
    return (
      <div className="data-lineage-group-sub" key={table.id}>
        <div className={clsName} style={{ top: y }}>
          {options.getGroupContent
            ? options.getGroupContent(table)
            : table.name}
        </div>
        {table.children.map((id: string, index: number) => {
          const tableData = data.getNodeById(id);
          if (!showData.includes(id) || !tableData) {
            return null;
          }
          const content = getTableContent(tableData, group, index);
          return (
            <Table
              key={id}
              data={tableData}
              content={content}
              height={options.tableHeight}
              highlight={highlightTables.length !== 0}
              onClickTable={(tableData: any) => {
                onClickTable(tableData, group);
              }}
            />
          );
        })}
      </div>
    );
  });
};
