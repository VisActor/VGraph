export default {
  // more father 4 config: https://github.com/umijs/father-next/blob/master/docs/config.md
  esm: {
    output: "es",
    sourcemap: true,
  },
  cjs: {
    output: "cjs",
    sourcemap: true,
  },
  umd: {
    name: "vgraphReact",
    externals: {
      react: "React",
      "react-dom": "ReactDOM",
      "@visactor/vgraph": "vgraph",
    },
  },
};
