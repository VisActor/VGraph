import { ReactNode } from "react";

export type IDataOptions = {
  baseTableId: string;
  mode: "table" | "column";

  getGroupData?: (data: any) => string;
  filter?: {
    type: string;
    value: any;
  };

  tableHeight?: number;
  groupGap?: number;
  highlightEdge?: boolean;
  highlightMode?: "MAIN" | "ALL";
  resetOnClickBlank?: boolean;
  search?: (data: ITableData) => boolean;
  getEdgeStyles?: (source: string, target: string) => any;
  getEdgeHighlightStyles?: (source: string, target: string) => any;

  getGroupName?: (depth: number, count: number) => string;
  getGroupWidth?: (depth: number, count: number) => number;
  getGroupTitle?: (data: any) => ReactNode;
  getGroupContent?: (data: any) => ReactNode;

  getTableId?: (data: any) => string;
  getTableName?: (data: ITableData) => string;
  getTableContent?: (data: ITableData, group?: any) => ReactNode | string;
  getEmptyContent?: (group: any) => ReactNode | string;

  getTaskTooltipContent?: (data: any) => string | ReactNode;

  onClickTable?: (data: ITableData) => void;
  onClickEdge?: (data: IEdgeData) => void;

  onClearHighlight?: () => void;
};

export type ITableData = {
  id: string;
  [key: string]: any;
};

export type IEdgeData = {
  source: string;
  target: string;
  [key: string]: any;
};
