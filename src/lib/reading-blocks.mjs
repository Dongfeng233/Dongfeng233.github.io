import { createHash } from "node:crypto";

const candidates = new Set(["p", "pre", "li", "blockquote", "figcaption", "summary", "h1", "h2", "h3", "h4", "h5", "h6"]);
export function visibleText(node) {
  if (node.type === "text") return node.value;
  if (["script", "style", "annotation"].includes(node.tagName) || node.properties?.className?.includes("katex-mathml") || node.properties?.dataFootnoteBackref !== undefined) return "";
  return (node.children || []).map(visibleText).join(node.tagName === "br" ? " " : "");
}
function nestedBlock(node) { return (node.children || []).some((child) => child.type === "element" && (candidates.has(child.tagName) || nestedBlock(child))); }
export function indexReadingBlocks(tree, assign = false) {
  const blocks = [], counts = new Map();
  function walk(node, excluded = false) {
    const skip = excluded || ["script", "style"].includes(node.tagName) || node.properties?.className?.includes("mermaid");
    if (!skip && node.type === "element" && candidates.has(node.tagName) && (!nestedBlock(node) || node.tagName === "pre")) {
      const text = visibleText(node).replace(/\s+/g, " ").trim();
      if (text) {
        const hash = createHash("sha256").update(text).digest("hex").slice(0, 12);
        const count = (counts.get(hash) || 0) + 1; counts.set(hash, count);
        const id = node.properties?.id || `read-${hash}${count > 1 ? `-${count}` : ""}`;
        if (assign) node.properties = { ...node.properties, id, "data-reading-anchor": true };
        blocks.push({ id, text });
      }
      return;
    }
    for (const child of node.children || []) walk(child, skip);
  }
  walk(tree);
  return blocks;
}
export default function readingAnchors() { return (tree) => { indexReadingBlocks(tree, true); }; }
