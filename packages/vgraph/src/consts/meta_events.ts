export const EVENTS = [
  "click",
  "dblclick",
  "mouseenter",
  "mouseover",
  "mouseout",
  "mouseleave",
  "mousedown",
  "mouseup",
  "mousemove",
  "contextmenu",
  "touchstart",
  "touchmove",
  "touchend",
];

export const GRAPH_EVENTS = {
  MOVE_START: "move:start",
  MOVING: "moving",
  MOVE_END: "move:end",

  ADD_START: "add:start",
  ADD_END: "add:end",

  UPDATE_START: "update:start",
  UPDATE_END: "update:end",
  VISIBILITY_END: "visibility:end",

  REMOVE_START: "remove:start",
  REMOVE_END: "remove:end",

  // 用于 graph.setState || entity.setState 的单独场景。业务交互多触发此事件
  STATE_START: "state:start",
  STATE_END: "state:end",

  // 用于编辑选中等的批量场景, 内部实现不会同时触发 state:start
  BATCH_STATE_START: "batchstate:start",
  BATCH_STATE_END: "batchstate:end",

  EXPAND_NODE_END: "expandnode:end",
  COLLAPSE_NODE_END: "collapsenode:end",

  LAYOUT_START: "layout:start",
  LAYOUT_END: "layout:end",

  DATA_START: "data:start",
  DATA_END: "data:end",
  UPDATE_DATA_START: "updatedata:start",
  UPDATE_DATA_END: "updatedata:end",

  CHANGE_SIZE: "changesize",

  CHANGE_ANCHOR: "changeanchor",
  CHANGE_ANCHOR_END: "changeanchor:end",

  TRANSFORMED: "transformed",

  REFRESHED: "refreshed",

  CHANGE: "change",

  CLEAR_START: "clear:start",
  CLEAR_END: "clear:end",

  ANIMATION_FRAME: "animationframe",

  DRAW_START: "draw:start",
  DRAW_END: "draw:end",
  ANIMATION_START: "animation:start",
  ANIMATION_END: "animation:end",

  GROUP_BBOX_START: "groupbbox:start",
  GROUP_BBOX_END: "groupbbox:end",
};

export const CANVAS_EVENTS = {
  PAN_ZOOM_START: "panzoom:start",
  PAN_ZOOM_END: "panzoom:end",
};

export const CHANGE_EVENTS = {
  "move:end": true,
  "add:end": true,
  "update:end": true,
  "remove:end": true,
  "layout:end": true,
  "data:end": true,
  "updatedata:end": true,
  "clear:end": true,
};
