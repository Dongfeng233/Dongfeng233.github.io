export default function remarkFolds() {
  return (tree) => {
    function walk(node) {
      if (node.type === "containerDirective" && node.name === "details") {
        node.data = { ...node.data, hName: "details", hProperties: { "data-studio-fold": "" } };
        node.children.unshift({ type: "paragraph", data: { hName: "summary" }, children: [{ type: "text", value: node.attributes?.title || "补充说明" }] });
      }
      for (const child of node.children || []) walk(child);
    }
    walk(tree);
  };
}
