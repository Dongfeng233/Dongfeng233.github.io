"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
const Graph = dynamic(() => import("./relation-graph"));
const TravelMap = dynamic(() => import("./travel-map"));

export default function Explore({ index }) {
  const [filters, setFilters] = useState({ view: "articles", mode: "list", tag: "", series: "", q: "" });
  const [ready, setReady] = useState(false), [queue, setQueue] = useState([]), [position, setPosition] = useState(0);
  const posts = index.nodes.filter((node) => node.kind === "posts");
  const tags = [...new Set(posts.flatMap((node) => node.tags))].sort();
  useEffect(() => { const read = () => { const params = new URLSearchParams(window.location.search); setFilters({ view: params.get("view") === "travel" ? "travel" : "articles", mode: params.get("mode") === "graph" ? "graph" : "list", tag: params.get("tag") || "", series: params.get("series") || "", q: params.get("q") || "" }); setReady(true); }; read(); window.addEventListener("popstate", read); return () => window.removeEventListener("popstate", read); }, []);
  useEffect(() => { if (!ready) return; const params = new URLSearchParams(); for (const [key, value] of Object.entries(filters)) if (value && !((key === "view" && value === "articles") || (key === "mode" && value === "list"))) params.set(key, value); window.history.replaceState(null, "", `/explore/${params.size ? `?${params}` : ""}`); setQueue([]); setPosition(0); }, [filters, ready]);
  function set(key, value) { setFilters((current) => ({ ...current, [key]: value })); }
  const series = index.series.find((series) => series.id === filters.series);
  const visible = useMemo(() => posts.filter((post) => (!filters.tag || post.tags.includes(filters.tag)) && (!filters.series || post.series.some((entry) => entry.id === filters.series)) && `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase().includes(filters.q.toLowerCase())).sort((a, b) => filters.series ? a.series.find((entry) => entry.id === filters.series).order - b.series.find((entry) => entry.id === filters.series).order || a.title.localeCompare(b.title) : b.date.localeCompare(a.date)), [index, filters]);
  const href = (node) => node.url + (filters.series ? `?series=${encodeURIComponent(filters.series)}` : "");
  function roam() {
    const key = `blog-roam:${filters.tag}:${filters.series}:${filters.q}`;
    let seen; try { seen = JSON.parse(sessionStorage.getItem(key) || "[]"); } catch { seen = []; }
    let candidates = visible.filter((post) => !seen.includes(post.url));
    if (!candidates.length) { candidates = [...visible]; seen = []; }
    for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
    setQueue(candidates); setPosition(0);
    try { sessionStorage.setItem(key, JSON.stringify([...seen, ...candidates.map((node) => node.url)])); } catch {}
  }
  return <div className="explore-page"><header className="explore-heading"><div><p className="explore-eyebrow">EXPLORE / 发现</p><h1>探索</h1><p>从一个主题出发，也可以随便走走。</p></div><Link className="explore-now" href="/now">我的近况 ↗</Link></header><div className="explore-tabs">{[["articles", "文章"], ["travel", "足迹"]].map(([key, label]) => <button key={key} aria-pressed={filters.view === key} onClick={() => set("view", key)}>{label}</button>)}</div>
    {filters.view === "travel" ? <TravelMap places={index.travel} nodes={index.nodes} /> : <><div className="explore-controls"><input aria-label="搜索探索文章" placeholder="搜索标题、摘要与标签" value={filters.q} onChange={(e) => set("q", e.target.value)} /><select aria-label="按标签筛选" value={filters.tag} onChange={(e) => set("tag", e.target.value)}><option value="">所有标签</option>{tags.map((tag) => <option key={tag}>{tag}</option>)}</select><select aria-label="按系列筛选" value={filters.series} onChange={(e) => set("series", e.target.value)}><option value="">所有系列</option>{index.series.map((series) => <option key={series.id} value={series.id}>{series.name}</option>)}</select><button className="explore-primary" disabled={!visible.length} onClick={roam}>随便读读 ↗</button></div>
      {series ? <section className="series-intro">{series.cover ? <img src={series.cover} alt="" /> : null}<div><small>专题 / {visible.length} 篇</small><h2>{series.name}</h2><p>{series.description}</p></div></section> : null}
      {queue[position] ? <section className="roam-card"><small>这次漫游 · {position + 1} / {queue.length}</small><h2><Link href={href(queue[position])}>{queue[position].title} →</Link></h2><p>{queue[position].description}</p><div className="explore-controls"><button disabled={position === 0} onClick={() => setPosition(position - 1)}>上一篇</button><button disabled={position === queue.length - 1} onClick={() => setPosition(position + 1)}>下一篇</button><button onClick={roam}>重新洗牌</button><button onClick={() => setQueue([])}>收起</button></div></section> : null}
      <div className="explore-display"><span>{visible.length} 篇文章</span><div className="explore-tabs">{[["list", "列表"], ["graph", "关系图"]].map(([key, label]) => <button key={key} aria-pressed={filters.mode === key} onClick={() => set("mode", key)}>{label}</button>)}</div></div>
      {filters.mode === "graph" ? <Graph posts={visible} series={index.series} selectedSeries={filters.series} /> : <div className="explore-articles">{visible.map((post, i) => <Link href={href(post)} key={post.url} className="explore-article"><span className="explore-number">{String(i + 1).padStart(2, "0")}</span><div><small>{post.date.slice(0, 10)} · {post.tags.join(" / ")}</small><h2>{post.title}</h2><p>{post.description}</p></div><span aria-hidden>↗</span></Link>)}</div>}{!visible.length ? <p className="explore-empty">暂时没有符合条件的文章。</p> : null}
    </>}
  </div>;
}
