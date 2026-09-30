"use client";
import { useEffect, useState } from "react";
const normalize = (value) => value.replace(/\s+/g, " ").trim();
function hashId() { try { return decodeURIComponent(location.hash.slice(1)); } catch { return location.hash.slice(1); } }
export function readingTop() {
  const root = document.querySelector(".reader-tools"), actions = root?.querySelector(":scope > .reader-actions");
  if (!root || !actions) return 110;
  const base = root.getBoundingClientRect().top, status = root.querySelector(":scope > p");
  const bottom = Math.max(actions.getBoundingClientRect().bottom, status?.getBoundingClientRect().bottom || 0);
  return Math.max(90, (Number.parseFloat(getComputedStyle(root).top) || 58) + bottom - base + 12);
}
function reveal(node) { for (let parent = node?.parentElement; parent; parent = parent.parentElement) if (parent.tagName === "DETAILS") parent.open = true; }
function literalRanges(root, query) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let text = "", points = [], node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest('script,style,.katex-mathml,[data-footnote-backref],.link-peek-trigger')) continue;
    for (let i = 0; i < node.textContent.length; i++) {
      const char = /\s/.test(node.textContent[i]) ? " " : node.textContent[i];
      if (char === " " && text.endsWith(" ")) continue;
      text += char; points.push({ node, offset: i });
    }
  }
  const needle = normalize(query).toLowerCase(), haystack = text.toLowerCase(), ranges = [];
  if (!needle) return ranges;
  for (let start = 0; ranges.length < 100;) {
    const at = haystack.indexOf(needle, start); if (at < 0) break;
    const a = points[at], b = points[at + needle.length - 1];
    if (!a || !b) break;
    const range = document.createRange(); range.setStart(a.node, a.offset); range.setEnd(b.node, b.offset + 1); ranges.push(range); start = at + needle.length;
  }
  return ranges;
}
export default function ReaderTools({ slug }) {
  const [message, setMessage] = useState(""), [query, setQuery] = useState("");
  useEffect(() => {
    const root = document.querySelector("[data-reading-body]"); if (!root) return;
    const syncQuery = () => { const next = new URLSearchParams(location.search).get("highlight") || ""; setQuery(next); if (!next) setMessage(""); };
    syncQuery();
    window.addEventListener("popstate", syncQuery);
    const hash = () => { syncQuery(); const target = document.getElementById(hashId()); if (target && root.contains(target)) { reveal(target); requestAnimationFrame(() => target.scrollIntoView({ block: "center" })); } };
    if (location.hash) hash(); window.addEventListener("hashchange", hash);
    return () => { window.removeEventListener("popstate", syncQuery); window.removeEventListener("hashchange", hash); };
  }, [slug]);
  useEffect(() => {
    const root = document.querySelector("[data-reading-body]"); if (!root || !query) return;
    let target = document.getElementById(hashId());
    if (!target || !root.contains(target)) target = [...root.querySelectorAll("[data-reading-anchor]")].find((node) => normalize(node.textContent).toLowerCase().includes(query.toLowerCase()));
    if (!target) { setMessage("正文已有更新，可以用页面搜索继续查找关键词。"); return; }
    reveal(target); target.classList.add("search-hit-block");
    const ranges = literalRanges(target, query);
    if (window.Highlight && CSS.highlights) CSS.highlights.set("blog-search", new Highlight(...ranges));
    const frame = requestAnimationFrame(() => { target.scrollIntoView({ block: "center" }); });
    return () => { cancelAnimationFrame(frame); target.classList.remove("search-hit-block"); CSS.highlights?.delete("blog-search"); };
  }, [query, slug]);
  if (!query && !message) return null;
  return <div className="reader-tools not-prose"><style>{"::highlight(blog-search) { color: var(--background); background-color: var(--accent); }"}</style><div className="reader-actions">
    {query ? <button onClick={() => { const url = new URL(location.href); url.searchParams.delete("highlight"); history.replaceState(null, "", url.pathname + url.search + url.hash); setQuery(""); setMessage(""); }} aria-label="清除搜索高亮">清除高亮</button> : null}
  </div>{message ? <p role="status">{message}</p> : null}</div>;
}
