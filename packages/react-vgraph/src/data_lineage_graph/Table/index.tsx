import React, { ReactNode } from "react";
import "./index.less";

export default ({
  data,
  content,
  highlight,
  height,
  onClickTable,
}: {
  data: any;
  content: ReactNode | string;
  height: number;
  highlight: boolean;
  onClickTable: (dataTable: any) => void;
}) => {
  function onClick(e: any) {
    if (e.target.classList.contains("arco-checkbox-mask")) {
      return;
    }
    e.stopPropagation();
    if (onClickTable) {
      onClickTable(data);
    }
  }
  let clsName = "data-lineage-table-container";
  let styleHeight = height - 1;
  if (height === 60) {
    clsName += " larger";
  } else if (height === 32) {
    clsName += " smaller";
  }
  if (highlight) {
    if (data.highlight) {
      clsName += " highlight";
      styleHeight -= 1;
    } else {
      clsName += " blur";
    }
    if (data.primary) {
      clsName += " primary";
      styleHeight = height - 2;
    }
  }
  return (
    <div className={clsName} onClick={onClick} style={{ top: data.y }}>
      {content}
    </div>
  );
};
