import { notFound } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import PostsLayout from "../../blog/bloglistlayout";
import { tagCounts, sortedTags } from "../../../lib/tag-counts";
import { tagLabel } from "../../../../data/tagLabels";
import { toPublicationDate } from "../../../lib/date";
import siteMetadata from "../../../../data/sitemetadata";
import { EMPTY_EXPORT_SLUG, staticContentParams } from "../../../lib/static-content-params.mjs";

/** Prerender the tags used by published posts; unknown tags render notFound(). */
export function generateStaticParams() {
  return staticContentParams(sortedTags);
}

export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug?.join("/");
  if (slug === EMPTY_EXPORT_SLUG) return {};
  const label = tagLabel(slug);
  return {
    title: `${label} - ${siteMetadata.publishName}`,
    description: `标签「${label}」下的所有文章`,
    openGraph: {
      title: `${label} - ${siteMetadata.publishName}`,
      description: `标签「${label}」下的所有文章`,
      url: `${siteMetadata.siteUrl}/tags/${slug}`,
      type: "website",
    },
  };
}

export default async function Tag(props) {
  const params = await props.params;
  const slug = params?.slug?.join("/");
  if (slug === EMPTY_EXPORT_SLUG) notFound();

  const filtered = allPosts.filter(
    (post) => post.draft !== true && (post.tags || []).includes(slug)
  );
  if (filtered.length === 0) {
    notFound();
  }

  const posts = [...filtered].sort((a, b) =>
    compareDesc(toPublicationDate(a.publishDate, a.publishTime), toPublicationDate(b.publishDate, b.publishTime))
  );

  return (
    <PostsLayout
      posts={posts}
      tagCounts={tagCounts}
      sortedTags={sortedTags}
      activeTag={slug}
      title="标签"
      subtitle={`「${tagLabel(slug)}」下共有 ${posts.length} 篇文章`}
    />
  );
}
