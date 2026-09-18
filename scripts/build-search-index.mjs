import { fromHtml } from "hast-util-from-html";
import { indexReadingBlocks } from "../src/lib/reading-blocks.mjs";
/**
 * Build-time generation of public/search-index.json — a slim search index
 * (title/description/slug/tags/labels/date) used by the site-wide Fuse.js
 * search. Keeps the FULL post bodies out of the client bundle (previously
 * the search component imported contentlayer's generated module and shipped
 * ~2MB of HTML to anyone focusing the search box).
 *
 * Runs after `contentlayer2 build`, before `next build` (see package.json).
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const { default: tagLabels } = await import(
  pathToFileURL(path.join(ROOT, "data", "tagLabels.js"))
);

const GENERATED = path.join(ROOT, ".contentlayer", "generated", "Post", "_index.json");
const OUT = path.join(ROOT, "public", "search-index.json");

const posts = JSON.parse(readFileSync(GENERATED, "utf8"));

const index = posts
  .filter((post) => post.draft !== true)
  .map((post) => {
    const tags = post.tags || [];
    const labels = tags.map((tag) => tagLabels[tag] || tag);
    return {
      title: post.title,
      description: post.description || "",
      slug: post.slug,
      tags,
      // Chinese labels make 经济/社会/… queries hit English-tagged posts.
      text: [post.title, post.description || "", post.location || "", ...tags, ...labels]
        .filter(Boolean)
        .join(" "),
      date: post.publishDate,
      publishTime: post.publishTime || "",
      location: post.location || "",
      readingTime: post.readingTime?.text || "",
      featured: Boolean(post.featured),
    };
  });

writeFileSync(OUT, JSON.stringify(index));
console.log(`search-index: wrote ${index.length} posts to public/search-index.json`);

const fullText = posts.filter((post) => post.draft !== true).map((post) => ({ slug: post.slug, blocks: indexReadingBlocks(fromHtml(post.body.html, { fragment: true })) }));
writeFileSync(path.join(ROOT, "public/search-content.json"), JSON.stringify(fullText));
const pageFile = path.join(ROOT, ".contentlayer/generated/Page/_index.json");
const pages = JSON.parse(readFileSync(pageFile, "utf8"));
const previews = index.map((post) => ({ url: post.slug, kind: "post", title: post.title, description: post.description || (fullText.find((entry) => entry.slug === post.slug)?.blocks.find((block) => block.text.length > 30) || fullText.find((entry) => entry.slug === post.slug)?.blocks[0])?.text.slice(0, 180) || "", image: posts.find((entry) => entry.slug === post.slug)?.image || "" }));
for (const page of pages) previews.push({ url: `/${page.slugAsParams}`, kind: "page", title: page.title, description: page.description || "", image: "" });
let collection = [];
try { collection = JSON.parse(readFileSync(path.join(ROOT, "data/collection.json"), "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
for (const item of collection) previews.push({ url: `/now?item=${encodeURIComponent(item.id)}`, kind: "collection", title: item.title, description: item.review || item.creator || "", image: item.cover || "", type: item.type });
writeFileSync(path.join(ROOT, "public/link-index.json"), JSON.stringify(previews));
console.log(`reading-index: ${fullText.reduce((n, post) => n + post.blocks.length, 0)} paragraphs, ${previews.length} previews`);
