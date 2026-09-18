"use client";
import { useState } from "react";
import Link from "next/link";
const types = { book: "书", film: "电影", music: "音乐", game: "游戏" };
const statuses = { wishlist: "想体验", active: "进行中", finished: "已完成" };
export default function CollectionShelf({ items, nodes }) {
  const [type, setType] = useState(""), [status, setStatus] = useState("");
  const filtered = items.filter((item) => (!type || item.type === type) && (!status || item.status === status));
  return <section className="collection-shelf"><div className="explore-heading"><h2>喜欢的作品</h2><div className="explore-controls"><select aria-label="收藏类型" value={type} onChange={(e) => setType(e.target.value)}><option value="">所有类型</option>{Object.entries(types).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><select aria-label="收藏状态" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">所有状态</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div></div>
    <div className="collection-grid">{filtered.map((item) => <details key={item.id} className="collection-card"><summary>{item.cover ? <img src={item.cover} alt={item.title} loading="lazy" /> : <div className="collection-placeholder">{types[item.type]}</div>}<div><small>{types[item.type]} · {statuses[item.status]}</small><h3>{item.title}</h3><p>{item.creator}</p>{item.rating !== null && item.rating !== undefined ? <span>{item.rating} / 10</span> : null}</div></summary><div className="collection-detail"><p>{item.review || "还没有写下短评。"}</p>{item.date ? <time>{item.date}</time> : null}{item.articles.map((url) => <Link key={url} href={url}>{nodes.find((node) => node.url === url)?.title} →</Link>)}</div></details>)}</div>{!filtered.length ? <p className="explore-empty">这个架子还留着空位。</p> : null}
  </section>;
}
