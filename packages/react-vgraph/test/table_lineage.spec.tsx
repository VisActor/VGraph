import React from "react";
import { render, screen } from "@testing-library/react";
import { DataLineageGraph } from "../src/index";
import { GraphStructure } from "@visactor/vgraph";
import { ITableData } from "../src/data_lineage_graph/types";

describe("<DataLineageGraph />", () => {
  it("data lineage graph should render", () => {
    //  1   3   4
    //  2       5
    const data = new GraphStructure({
      nodes: [
        {
          id: "1",
        },
        {
          id: "2",
        },
        {
          id: "3",
        },
        {
          id: "4",
        },
        {
          id: "5",
        },
      ],
      edges: [
        {
          source: "1",
          target: "3",
        },
        {
          source: "2",
          target: "3",
        },
        {
          source: "3",
          target: "4",
        },
        {
          source: "3",
          target: "5",
        },
      ],
    });
    const options: any = {
      baseTableId: "3",
      mode: "table",
      getTableName(data: ITableData) {
        return data.id;
      },
    };
    const { unmount } = render(
      <DataLineageGraph size={[800, 600]} data={data} options={options} />
    );
    const node1 = screen.queryByText("1");
    expect(node1).not.toBeNull();
    expect(screen.queryByText("2")).not.toBeNull();
    expect(screen.queryByText("3")).not.toBeNull();
    expect(screen.queryByText("4")).not.toBeNull();
    expect(screen.queryByText("5")).not.toBeNull();
    expect(
      document.querySelectorAll(".data-lineage-group-container").length
    ).toBe(3);
    expect(
      document.querySelectorAll(".data-lineage-table-container").length
    ).toBe(5);
    node1?.click();
    expect(
      document.querySelector(".data-lineage-table-container.highlight.primary")
    );
    unmount();
  });
});
