"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function ArticleConnections({ article, nodes, series }) {
  const memberships = article?.series || [];
  const [context, setContext] = useState(memberships[0]?.id || "");
  useEffect(() => { const selected = new URLSearchParams(window.location.search).get("series"); if (memberships.some((value) => value.id === selected)) setContext(selected); }, [article?.url]);
  if (!article) return null;
  const incoming = nodes.filter((node) => node.url !== article.url && node.links.includes(article.url));
  const group = series.find((entry) => entry.id === context);
  const siblings = nodes.filter((node) => node.kind === "posts" && node.series.some((value) => value.id === context)).sort((a, b) => a.series.find((value) => value.id === context).order - b.series.find((value) => value.id === context).order || a.title.localeCompare(b.title));
  const index = siblings.findIndex((node) => node.url === article.url);
  if (!memberships.length && !incoming.length && !article.updates.length) return null;
  const url = (node) => `${node.url}?series=${encodeURIComponent(context)}`;
  return <section className="article-connections not-prose"><h2>延伸阅读</h2>{memberships.length ? <div><label>正在阅读的系列 <select aria-label="当前阅读系列" value={context} onChange={(e) => { setContext(e.target.value); const params = new URLSearchParams(window.location.search); params.set("series", e.target.value); window.history.replaceState(null, "", `${window.location.pathname}?${params}`); }}>{memberships.map((value) => <option key={value.id} value={value.id}>{series.find((entry) => entry.id === value.id)?.name}</option>)}</select></label><h3><Link href={`/explore?series=${encodeURIComponent(context)}`}>{group?.name}</Link></h3><ol>{siblings.map((node) => <li key={node.url}><Link aria-current={node.url === article.url ? "page" : undefined} href={url(node)}>{node.title}</Link></li>)}</ol><div className="series-adjacent">{siblings[index - 1] ? <Link href={url(siblings[index - 1])}>← {siblings[index - 1].title}</Link> : null}{siblings[index + 1] ? <Link href={url(siblings[index + 1])}>{siblings[index + 1].title} →</Link> : null}</div></div> : null}
    {incoming.length ? <details open><summary>引用了这篇文章</summary>{incoming.map((node) => <Link className="graph-list-link" href={node.url} key={node.url}>{node.title}</Link>)}</details> : null}
    {article.updates.length ? <details><summary>更新记录 · {article.updates.length}</summary>{[...article.updates].reverse().map((update, i) => <p key={`${update.date}-${i}`}><time>{update.date.slice(0, 10)}</time> {update.text}</p>)}</details> : null}
  </section>;
}
