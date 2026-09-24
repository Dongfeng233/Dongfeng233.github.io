import fs from "node:fs";
import path from "node:path";
import { allPages, allPosts } from "contentlayer/generated";
import navigation from "../../data/navigation.json";

// Match the pages that will exist in the export, including custom content pages.
export function publishedNavigation() {
  const routes = ["/"];
  function walk(directory, segments = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(directory, entry.name), [...segments, entry.name]);
      else if (/^page\.(js|jsx|tsx|ts)$/.test(entry.name) && !segments.some((part) => part.startsWith("["))) {
        routes.push("/" + segments.filter((part) => !part.startsWith("(") && !part.startsWith("@")).join("/"));
      }
    }
  }
  walk(path.join(process.cwd(), "src/app"));
  const published = new Set([...routes, ...allPages.filter((page) => !page.draft).map((page) => `/${page.slugAsParams}`), ...allPosts.filter((post) => !post.draft).map((post) => `/blog/${post.slugAsParams}`)]);
  const drafts = new Set(allPages.filter((page) => page.draft).map((page) => `/${page.slugAsParams}`));
  return navigation.filter((link) => {
    const route = link.href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
    if (drafts.has(route)) return false;
    if (published.has(route) || route.startsWith("/tags/") || /^https?:\/\//.test(route)) return true;
    const file = path.resolve(process.cwd(), "public", "." + route);
    const relative = path.relative(path.join(process.cwd(), "public"), file);
    return !relative.startsWith("..") && !path.isAbsolute(relative) && (fs.existsSync(file) || fs.existsSync(`${file}.html`));
  });
}
