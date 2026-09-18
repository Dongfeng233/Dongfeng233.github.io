"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
export default function RelationGraph({ posts, series, selectedSeries }) {
  const [selected, setSelected] = useState(""), [tagsOn, setTagsOn] = useState(true), [seriesOn, setSeriesOn] = useState(true), [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const drag = useRef(null), graphRoot = useRef(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => { const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width || 1000)); if (graphRoot.current) observer.observe(graphRoot.current); return () => observer.disconnect(); }, []);
  const unit = 1000 / camera.scale / width;
  const zoom = (factor) => setCamera((c) => { const scale = Math.max(.6, Math.min(3, c.scale * factor)); return { x: c.x + (1000 / c.scale - 1000 / scale) / 2, y: c.y + (620 / c.scale - 620 / scale) / 2, scale }; });
  const graph = useMemo(() => {
    const articles = posts.slice(0, 200), nodes = [], edges = [];
    const tags = tagsOn ? [...new Set(articles.flatMap((post) => post.tags))] : [];
    const groups = seriesOn ? series.filter((group) => articles.some((post) => post.series.some((entry) => entry.id === group.id))) : [];
    function ring(items, radius, type) { items.forEach((item, i) => { const angle = 2 * Math.PI * i / items.length - Math.PI / 2; nodes.push({ ...item, type, x: 500 + Math.cos(angle) * radius, y: 310 + Math.sin(angle) * radius }); }); }
    ring(articles.map((post) => ({ id: post.url, label: post.title, post })), articles.length === 1 ? 0 : 235, "article");
    ring(tags.map((tag) => ({ id: `tag:${tag}`, label: tag })), 125, "tag");
    ring(groups.map((group) => ({ id: `series:${group.id}`, label: group.name })), 65, "series");
    const ids = new Set(nodes.map((node) => node.id));
    for (const post of articles) {
      for (const link of post.links) if (ids.has(link)) edges.push([post.url, link]);
      for (const tag of post.tags) if (tagsOn) edges.push([post.url, `tag:${tag}`]);
      for (const group of post.series) if (ids.has(`series:${group.id}`)) edges.push([post.url, `series:${group.id}`]);
    }
    return { nodes, edges };
  }, [posts, series, tagsOn, seriesOn]);
  const connected = new Set([selected, ...graph.edges.filter((edge) => edge.includes(selected)).flat()]);
  const focus = graph.nodes.find((node) => node.id === selected);
  return <section className="relation-graph"><div className="explore-controls"><label><input type="checkbox" checked={tagsOn} onChange={(e) => setTagsOn(e.target.checked)} />标签</label><label><input type="checkbox" checked={seriesOn} onChange={(e) => setSeriesOn(e.target.checked)} />系列</label><button aria-label="放大关系图" onClick={() => zoom(1.2)}>＋</button><button aria-label="缩小关系图" onClick={() => zoom(1 / 1.2)}>−</button><button onClick={() => { setCamera({ x: 0, y: 0, scale: 1 }); setSelected(""); }}>重置</button><small>文章 · 标签 · 系列，点击节点查看关联</small></div>
    <svg ref={graphRoot} viewBox={`${camera.x} ${camera.y} ${1000 / camera.scale} ${620 / camera.scale}`} role="group" aria-label="文章关系图，可用下方列表阅读" onPointerDown={(e) => { if (e.target === e.currentTarget || e.target.tagName === "line") { drag.current = { x: e.clientX, y: e.clientY, camera }; e.currentTarget.setPointerCapture(e.pointerId); } }} onPointerMove={(e) => { if (drag.current) { const ratio = 1000 / camera.scale / e.currentTarget.getBoundingClientRect().width; setCamera({ ...drag.current.camera, x: drag.current.camera.x - (e.clientX - drag.current.x) * ratio, y: drag.current.camera.y - (e.clientY - drag.current.y) * ratio }); } }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      {graph.edges.map(([from, to], i) => { const a = graph.nodes.find((node) => node.id === from), b = graph.nodes.find((node) => node.id === to); return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} opacity={selected && !(from === selected || to === selected) ? .08 : .35} />; })}
      {graph.nodes.map((node) => <g className={`graph-node ${node.type}`} key={node.id} role="button" aria-label={`${node.type === "article" ? "文章" : node.type === "tag" ? "标签" : "系列"}：${node.label}`} tabIndex={0} opacity={selected && !connected.has(node.id) ? .25 : 1} onClick={() => setSelected(node.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(node.id); } }}><circle cx={node.x} cy={node.y} r={(node.type === "article" ? 8 : 6) * unit} /><text x={node.x} y={node.y + 22 * unit} style={{ fontSize: 12 * unit }} textAnchor="middle">{node.label.length > 14 ? node.label.slice(0, 14) + "…" : node.label}</text><title>{node.label}</title></g>)}
    </svg>
    {focus ? <div className="graph-focus"><strong>{focus.label}</strong>{focus.post ? <Link href={focus.post.url + (selectedSeries ? `?series=${encodeURIComponent(selectedSeries)}` : "")}>阅读文章 →</Link> : null}<button onClick={() => setSelected("")}>显示全部关系</button></div> : null}
    {posts.length > 200 ? <p>图中显示前 200 篇，可通过上方搜索和筛选缩小范围。</p> : null}
    <details><summary>以列表查看{focus ? "这些关联" : "文章"}</summary>{graph.nodes.filter((node) => node.post && (!selected || connected.has(node.id))).map((node) => <Link className="graph-list-link" key={node.id} href={node.post.url + (selectedSeries ? `?series=${encodeURIComponent(selectedSeries)}` : "")}>{node.label}</Link>)}</details>
  </section>;
}
