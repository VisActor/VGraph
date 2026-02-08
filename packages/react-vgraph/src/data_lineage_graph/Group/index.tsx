import React from "react";
import { GraphStructure } from "@visactor/vgraph";
import ColumnGroup from "./column_group";
import "./index.less";
import TableGroup from "./table_group";

export default ({
  data,
  id,
  group,
  options,
  details,
  highlightTables,
  showData,
  onClickTable,
  onScrollGroup,
}: {
  data: GraphStructure;
  id: string;
  group: any;
  showData: any;
  options: any;
  details?: string[];
  highlightTables: string[];
  onClickTable: (tableData: any, group: any) => void;
  onScrollGroup: (group: any) => void;
}) => {
  function onScroll(e: any) {
    group.scroll = e.target.scrollTop;
    onScrollGroup(group);
  }

  if (!group) {
    return null;
  }

  let title;
  if (options.getGroupTitle) {
    title = options.getGroupTitle(group);
  } else {
    title = options.getGroupName(
      group.depth,
      group.children ? group.children.length : group.subGroups.length
    );
  }

  return (
    <div
      className="data-lineage-group-container"
      style={{ left: group.x, width: group.width }}
    >
      <div
        className={
          (group.depth === 0 ? "primary " : "") + "data-lineage-group-sum"
        }
      >
        {title}
      </div>
      {group.children.length === 0 && options.getEmptyContent
        ? options.getEmptyContent(group)
        : null}
      <div
        className="data-lineage-group-inner-container"
        id={id}
        onScroll={onScroll}
      >
        <div style={{ height: group.height, position: "relative" }}>
          {options.mode === "column" ? (
            <ColumnGroup
              data={data}
              showData={showData}
              group={group}
              options={options}
              highlightTables={highlightTables}
              onClickTable={onClickTable}
            />
          ) : (
            <TableGroup
              data={data}
              showData={showData}
              group={group}
              options={options}
              highlightTables={highlightTables}
              details={details}
              onClickTable={onClickTable}
            />
          )}
        </div>
      </div>
    </div>
  );
};
