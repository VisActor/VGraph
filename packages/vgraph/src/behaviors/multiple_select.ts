import { GraphEvent } from "../typings/event";
/**
 * Multiple select behavior.
 * 多选交互
 */
export const multipleSelect: any = {
  type: "multipleSelect",
  selections: [],
  multiple: true,
  targets: ["node", "edge", "group"],
  modifierKey: ["ctrlKey", "metaKey"],
  modifyState: true,
  selectState: "select",
  clickCanvasToReset: true,
  shouldSelectItem(ev: GraphEvent, selections: any) {
    // if (!selections.length) {
    //   return true;
    // }
    // 默认不可多选不同类型的节点
    // return ev.target.type === selections[0].type;
    return true;
  },
  onSelectionsChange() {},
  getEvents() {
    const events = {};
    this.targets.forEach((item: string) => {
      events[`${item}:click`] = "onClick";
    });
    if (this.clickCanvasToReset) {
      events["canvas:click"] = "reset";
    }
    return events;
  },
  onClick(ev: GraphEvent) {
    // 多选模式
    if (this.multiple && this.shouldMultiSelect(ev)) {
      if (this.select(ev)) {
        this.onSelectionsChange(this.selections);
      }
      return;
    }
    // 单选模式
    this.reset(false);
    if (this.select(ev)) {
      this.onSelectionsChange(this.selections);
    }
  },

  shouldMultiSelect(ev: GraphEvent) {
    const modifierKey = this.modifierKey;
    const evt = ev.nativeEvent;
    for (const key of modifierKey) {
      if (evt[key]) {
        return true;
      }
    }
    return false;
  },

  select(ev: GraphEvent) {
    const target = ev.target;
    const selectState = this.selectState;
    const selections = this.selections;
    const modifyState = this.modifyState;
    if (target.hasState(selectState)) {
      modifyState && target.removeState(selectState);
      const index = selections.indexOf(target);
      if (index >= 0) {
        selections.splice(index, 1);
      }
      return true;
    }
    if (this.shouldSelectItem(ev, selections)) {
      modifyState && target.setState(selectState);
      selections.push(target);
      return true;
    }
    return false;
  },

  reset(emit = true) {
    const selectState = this.selectState;
    if (this.modifyState) {
      this.selections.forEach((item: any) => {
        item.removeState(selectState);
      });
    }
    this.selections = [];
    emit && this.onSelectionsChange([]);
  },

  destroy() {
    const dom = this.graph.canvas.getCanvasDom();
    dom.removeEventListener("wheel", this._event);
  },
};
