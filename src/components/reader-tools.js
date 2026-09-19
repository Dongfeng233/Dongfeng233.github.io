"use client";
import { useEffect, useRef, useState } from "react";
const MARKS = "blog-reading-bookmarks:v1";
const normalize = (value) => value.replace(/\s+/g, " ").trim();
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; } }
function hashId() { try { return decodeURIComponent(location.hash.slice(1)); } catch { return location.hash.slice(1); } }
const bookmarkKey = (item) => JSON.stringify([item.slug, item.anchor, item.quote]);
function readBookmarks() {
  const value = read(MARKS, []);
  return (Array.isArray(value) ? value : []).filter((item) => item && typeof item.slug === "string" && item.slug.startsWith("/") && !item.slug.startsWith("//") && typeof item.anchor === "string" && typeof item.quote === "string").slice(0,200);
}
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
export default function ReaderTools({ title, slug }) {
  const [resume, setResume] = useState(null), [bookmarks, setBookmarks] = useState([]), [open, setOpen] = useState(false), [message, setMessage] = useState(""), [query, setQuery] = useState("");
  const selection = useRef(null), pressedSelection = useRef(null), panel = useRef(null), bookmarksButton = useRef(null);
  const progressKey = `blog-reading-progress:v1:${slug}`;
  useEffect(() => {
    const root = document.querySelector("[data-reading-body]"); if (!root) return;
    setResume(read(progressKey, null)); setBookmarks(readBookmarks()); setQuery(new URLSearchParams(location.search).get("highlight") || "");
    let interacted = false, timer;
    const interact = (event) => { interacted = true; if (event.type === "pointerdown" || event.type === "touchstart" || event.type === "keydown" && event.key === "Enter") record(); };
    const record = () => {
      if (!interacted || !root.isConnected || document.getElementById("reading-bookmarks")) return;
      const blocks = [...root.querySelectorAll("[data-reading-anchor]")];
      const node = blocks.find((node) => node.getBoundingClientRect().bottom > readingTop()) || blocks.at(-1);
      if (!node) return;
      const percent = Math.round(Math.max(0, Math.min(100, (readingTop() - root.getBoundingClientRect().top) / Math.max(1, root.offsetHeight) * 100)));
      try { localStorage.setItem(progressKey, JSON.stringify({ anchor: node.id, quote: normalize(node.textContent).slice(0,180), offset: node.getBoundingClientRect().top - readingTop(), percent, updatedAt: Date.now() })); } catch {}
    };
    const scroll = () => { clearTimeout(timer); timer = setTimeout(record, 500); };
    const select = () => {
      const selected = window.getSelection(); if (!selected?.rangeCount || !root.contains(selected.anchorNode) || !root.contains(selected.focusNode) || selected.isCollapsed) { selection.current = null; return; }
      const range = selected.getRangeAt(0), element = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
      selection.current = { quote: normalize(selected.toString()).slice(0, 1000), anchor: element.closest("[data-reading-anchor]")?.id || "" };
    };
    document.addEventListener("selectionchange", select); window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("pagehide", record);
    for (const name of ["wheel", "pointerdown", "keydown", "touchstart"]) window.addEventListener(name, interact, { passive: true });
    const storage = (event) => { if (event.key === MARKS || event.key === null) setBookmarks(readBookmarks()); };
    window.addEventListener("storage", storage);
    const syncQuery = () => setQuery(new URLSearchParams(location.search).get("highlight") || "");
    window.addEventListener("popstate", syncQuery);
    const hash = () => { syncQuery(); const target = document.getElementById(hashId()); if (target && root.contains(target)) { reveal(target); requestAnimationFrame(() => target.scrollIntoView({ block: "center" })); } };
    if (location.hash) hash(); window.addEventListener("hashchange", hash);
    return () => { record(); clearTimeout(timer); window.removeEventListener("storage", storage); window.removeEventListener("popstate", syncQuery); document.removeEventListener("selectionchange", select); window.removeEventListener("scroll", scroll); window.removeEventListener("pagehide", record); window.removeEventListener("hashchange", hash); for (const name of ["wheel", "pointerdown", "keydown", "touchstart"]) window.removeEventListener(name, interact); };
  }, [slug, progressKey]);
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
  function closeBookmarks() { setOpen(false); bookmarksButton.current?.focus({ preventScroll: true }); }
  useEffect(() => {
    if (!open) return;
    const resize = () => {
      const node = panel.current; if (!node) return;
      const viewport = window.visualViewport;
      const bottom = viewport ? viewport.height + viewport.offsetTop : innerHeight;
      node.style.setProperty("--bookmarks-space", `${Math.max(80, bottom - node.getBoundingClientRect().top - 16)}px`);
    };
    const frame = requestAnimationFrame(() => { resize(); panel.current?.focus({ preventScroll: true }); });
    const observer = new ResizeObserver(resize); if (panel.current?.parentElement) observer.observe(panel.current.parentElement);
    window.addEventListener("resize", resize); window.addEventListener("scroll", resize, { passive: true });
    window.visualViewport?.addEventListener("resize", resize);
    const escape = (event) => { if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); closeBookmarks(); } };
    document.addEventListener("keydown", escape);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", resize); window.removeEventListener("scroll", resize); window.visualViewport?.removeEventListener("resize", resize); document.removeEventListener("keydown", escape); };
  }, [open]);
  function persist(update) {
    try { const next = update(readBookmarks()); localStorage.setItem(MARKS, JSON.stringify(next)); setBookmarks(next); return true; }
    catch { setMessage("浏览器未允许保存阅读记录。"); return false; }
  }
  function saveBookmark() {
    const root = document.querySelector("[data-reading-body]");
    const node = [...root.querySelectorAll("[data-reading-anchor]")].find((node) => node.getBoundingClientRect().bottom > readingTop());
    const selected = pressedSelection.current || selection.current; pressedSelection.current = null;
    const value = selected?.anchor ? selected : node ? { anchor: node.id, quote: normalize(node.textContent).slice(0, 180) } : null;
    if (!value) { setMessage("选中一段正文后即可收藏。"); return; }
    const entry = { ...value, slug, title, createdAt: Date.now() };
    if (persist((current) => [entry, ...current.filter((item) => bookmarkKey(item) !== bookmarkKey(entry))].slice(0,200))) setMessage("已收藏到当前浏览器的书签。");
  }
  function jump(anchor, quote = "", offset) {
    const root = document.querySelector("[data-reading-body]");
    let node = document.getElementById(anchor); if (node && !root?.contains(node)) node = null;
    if (!node && quote) node = [...document.querySelectorAll("[data-reading-body] [data-reading-anchor]")].find((node) => normalize(node.textContent).includes(quote));
    if (!node) { setMessage("这段内容已有修改，请用页面搜索查找摘录。"); return; }
    reveal(node); if (Number.isFinite(offset)) window.scrollTo({ top: window.scrollY + node.getBoundingClientRect().top - readingTop() - offset, behavior: "instant" }); else node.scrollIntoView({ block: "center", behavior: "instant" }); if (open) closeBookmarks();
  }
  return <div className="reader-tools not-prose"><style>{"::highlight(blog-search) { color: var(--background); background-color: var(--accent); }"}</style><div className="reader-actions">
    {resume?.percent > 2 && resume.percent < 98 && !query ? <button onClick={() => jump(resume.anchor, resume.quote || "", resume.offset)}>继续上次阅读 · {resume.percent}%</button> : null}
    <button onPointerDown={() => { pressedSelection.current = selection.current; }} onPointerCancel={() => { pressedSelection.current = null; }} onMouseDown={(event) => event.preventDefault()} onClick={saveBookmark} title="选中文字后收藏摘录；未选择时收藏当前位置">收藏段落</button>
    <button ref={bookmarksButton} aria-expanded={open} aria-controls="reading-bookmarks" onClick={() => setOpen(!open)}>书签 · {bookmarks.length}</button>
    {query ? <button onClick={() => { const url = new URL(location.href); url.searchParams.delete("highlight"); history.replaceState(null, "", url.pathname + url.search + url.hash); setQuery(""); }} aria-label="清除搜索高亮">清除高亮</button> : null}
  </div>{message ? <p role="status">{message}</p> : null}
    {open ? <section id="reading-bookmarks" role="dialog" tabIndex={-1} ref={panel} className="reading-bookmarks" aria-label="本机阅读书签"><div className="reader-actions"><strong>本机书签</strong><button onClick={closeBookmarks}>关闭</button></div>{bookmarks.length ? bookmarks.map((item) => <article key={`${item.slug}:${item.anchor}:${item.quote}`}><strong>{item.title}</strong><blockquote>{item.quote}</blockquote><div className="reader-actions">{item.slug === slug ? <button onClick={() => jump(item.anchor, item.quote)}>回到段落</button> : <a href={`${item.slug}#${encodeURIComponent(item.anchor)}`}>打开文章 →</a>}<button onClick={() => persist((current) => current.filter((entry) => bookmarkKey(entry) !== bookmarkKey(item)))}>移除书签</button></div></article>) : <p>选中喜欢的一段话，或收藏当前阅读位置。</p>}</section> : null}
  </div>;
}
