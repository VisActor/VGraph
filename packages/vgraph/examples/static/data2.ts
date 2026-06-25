export const data = {
  nodes: [
    {
      id: "recall",
      topOrder: 1,
    },
    {
      id: "group_info",
      topOrder: 1,
    },
    {
      id: "content_strategy",
      topOrder: 1,
    },
    {
      id: "content_strategy2",
      topOrder: 1,
    },
    {
      id: "prerank",
      topOrder: 1,
    },
    {
      id: "rank",
      topOrder: 1,
    },
    {
      id: "post_rank",
      topOrder: 1,
    },
    {
      id: "mixrank",
      topOrder: 1,
    },
    {
      id: "info_collect",
      topOrder: 1,
    },
    {
      id: "post_archon",
      topOrder: 1,
    },
    {
      id: "live_sort",
    },
    {
      id: "lane_ecom",
    },
    {
      id: "lane_ecom_guarant",
    },
    {
      id: "lane_ecom_cache",
    },
    {
      id: "lane_ecom_coldstart",
    },
    {
      id: "lane_ecom_card",
    },
    {
      id: "lane_ecom_author_pick_card",
    },
    {
      id: "lane_vt",
    },
  ],
  edges: [
    {
      source: "prerank",
      target: "rank",
    },
    {
      source: "recall",
      target: "group_info",
    },
    {
      source: "group_info",
      target: "content_strategy",
    },
    {
      source: "content_strategy",
      target: "content_strategy2",
    },
    {
      source: "content_strategy2",
      target: "prerank",
    },

    {
      source: "rank",
      target: "post_rank",
    },
    {
      source: "post_rank",
      target: "mixrank",
    },
    {
      source: "mixrank",
      target: "info_collect",
    },
    {
      source: "info_collect",
      target: "post_archon",
    },
    {
      source: "recall",
      target: "live_sort",
    },
    {
      source: "live_sort",
      target: "mixrank",
    },
    {
      source: "recall",
      target: "lane_ecom",
    },
    {
      source: "lane_ecom",
      target: "prerank",
    },
    {
      source: "recall",
      target: "lane_ecom_cache",
    },
    {
      source: "lane_ecom_cache",
      target: "rank",
    },
    {
      source: "recall",
      target: "lane_ecom_coldstart",
    },
    {
      source: "lane_ecom_coldstart",
      target: "rank",
    },
    {
      source: "recall",
      target: "lane_ecom_card",
    },
    {
      source: "lane_ecom_card",
      target: "mixrank",
    },
    {
      source: "recall",
      target: "lane_ecom_author_pick_card",
    },
    {
      source: "lane_ecom_author_pick_card",
      target: "mixrank",
    },
    {
      source: "prerank",
      target: "lane_ecom_guarant",
    },
    {
      source: "lane_ecom_guarant",
      target: "rank",
    },
    {
      source: "prerank",
      target: "lane_vt",
    },
    {
      source: "lane_vt",
      target: "post_rank",
    },
  ],
  groups: [
    {
      id: "Content Strategy Group",
      topOrder: 1,
      order: -1,
      children: ["content_strategy", "content_strategy2"],
    },
  ],
};
