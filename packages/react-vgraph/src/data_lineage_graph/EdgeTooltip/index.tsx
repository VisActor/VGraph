import React from "react";
import "./index.less";

export default ({
  data,
  getTaskTooltipContent,
}: {
  data: any;
  getTaskTooltipContent?: (data: any) => string;
}) => {
  if (!data) {
    return null;
  }
  let tasks;
  if (getTaskTooltipContent) {
    tasks = getTaskTooltipContent(data);
  } else {
    tasks = data.edges.map((task: any) => {
      return (
        <div key={task.id} className="data-lineage-tooltip-list">
          {task.name}
        </div>
      );
    });
  }

  return (
    <div
      className="data-lineage-tooltip"
      style={{ left: data.point.x, top: data.point.y }}
    >
      {tasks}
    </div>
  );
};
