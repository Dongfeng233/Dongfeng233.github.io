import fs from "node:fs";
import path from "node:path";
import { allPosts, allPages } from "contentlayer/generated";

function config(name) {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", `${name}.json`), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}
function links(document) {
  const html = document.body.html || "";
  const raw = document.body.raw.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`]*`/g, "");
  const urls = html ? Array.from(html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/g), (match) => match[1]) : Array.from(raw.matchAll(/(?<!!)\[[^\]]*\]\((\/[^\s)]+)\)/g), (match) => match[1]);
  return [...new Set(urls.filter((url) => url.startsWith("/") && !url.startsWith("//")).map((url) => { try { return decodeURI(url.split(/[?#]/)[0]).replace(/\/$/, "") || "/"; } catch { return url; } }))];
}
export function getContentIndex() {
  const series = config("series");
  const nodes = [...allPosts.filter((post) => post.draft !== true).map((post) => ({ ...post, kind: "posts" })), ...allPages.map((page) => ({ ...page, kind: "pages" }))].map((document) => ({
    kind: document.kind, slug: document.slugAsParams, url: document.kind === "posts" ? `/blog/${document.slugAsParams}` : `/${document.slugAsParams}`, title: document.title, description: document.description || "", date: document.publishDate || document.lastmod || "", image: document.image || "", tags: document.tags || [], series: (document.series || []).filter((membership) => series.some((entry) => entry.id === membership.id)), links: links(document), updates: document.updates || [],
  }));
  const published = new Set(nodes.map((node) => node.url));
  for (const node of nodes) node.links = node.links.filter((url) => published.has(url));
  const cleanArticles = (items) => items.map((item) => ({ ...item, articles: (item.articles || []).filter((url) => published.has(url)) }));
  return { nodes, series, collection: cleanArticles(config("collection")), travel: cleanArticles(config("travel")) };
}
