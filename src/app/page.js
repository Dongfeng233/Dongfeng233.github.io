import fs from "fs";
import path from "path";
import { load } from "js-yaml";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import siteMetadata from "../../data/sitemetadata";
import AboutMe from "../components/aboutme";
import Articles from "../components/articles";
import MicroblogSnippet from "../components/microblog-snippet";
import TerminalQuotes from "../components/terminal-quotes";
import PageTransition from "../components/page-transition";
import { sortedTags } from "../lib/tag-counts";
import { toPublicationDate } from "../lib/date";

function getMicroblogQuotes() {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "data", "microblog.yaml"),
      "utf8"
    );
    const entries = load(raw) || [];
    return [...entries]
      .sort((a, b) => toPublicationDate(b.date, b.time) - toPublicationDate(a.date, a.time))
      .map((e) => String(e.content || ""))
      .filter((c) => c.length >= 8)
      .slice(0, 8)
      .map((c) => (c.length > 64 ? c.slice(0, 64) + "…" : c));
  } catch {
    return [];
  }
}

export default function Home() {
  // Copy before sorting — allPosts is shared module state.
  const posts = [...allPosts]
    .sort((a, b) => compareDesc(toPublicationDate(a.publishDate, a.publishTime), toPublicationDate(b.publishDate, b.publishTime)))
    .map((post) => ({
      title: post.title,
      description: post.description,
      draft: post.draft,
      featured: post.featured,
      slug: post.slug,
      tags: post.tags,
      publishDate: post.publishDate,
      publishTime: post.publishTime,
      location: post.location,
      readingTime: post.readingTime?.text,
    }));

  // Top-3 tags by post count (sortedTags desc); fewer if the taxonomy is small.
  const topTags = sortedTags.slice(0, 3);

  const quotes = getMicroblogQuotes();

  return (
    <div className="relative">
      <div className="max-w-7xl pt-10 lg:grid lg:grid-cols-9 lg:gap-8">
        <PageTransition className="col-span-7 max-w-4xl pt-6">
          <Articles articles={posts} topTags={topTags} />
        </PageTransition>

        <div className="col-span-2 mx-auto max-w-lg">
          <div
            className="sticky pt-10"
            style={{ top: "calc(var(--nav-height) + 1rem)" }}
          >
            <AboutMe />
            {quotes.length > 0 && <TerminalQuotes quotes={quotes} />}
            <MicroblogSnippet />
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    images: [siteMetadata.cover],
    authors: [siteMetadata.author],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [siteMetadata.cover],
  },
  locale: siteMetadata.language,
  type: "website",
};
