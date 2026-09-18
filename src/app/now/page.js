import LinkPreviews from "../../components/link-previews";
import Link from "next/link";
import { allPages } from "contentlayer/generated";
import { MDXComponent } from "../../components/mdxcomponent";
import CollectionShelf from "../../components/collection-shelf";
import { getContentIndex } from "../../lib/content-index";
import "../explore.css";
export const metadata = { title: "此刻", description: "近况与最近喜欢的作品。" };
export default function NowPage() {
  const page = allPages.find((page) => page.slugAsParams === "now");
  const index = getContentIndex();
  return <div className="explore-page"><header className="explore-heading"><div><p className="explore-eyebrow">NOW / 最近</p><h1>{page?.title || "此刻"}</h1><p>{page?.description || "最近的生活与关注。"}</p></div><Link href="/explore">返回探索 →</Link></header>
    {page ? <article className="prose dark:prose-invert now-prose"><div data-reading-body><MDXComponent code={page.body.code} /></div><LinkPreviews />{page.lastmod ? <p>更新于 {page.lastmod.slice(0, 10)}</p> : null}</article> : <p className="explore-empty">近况正在慢慢积累。</p>}
    <CollectionShelf items={index.collection} nodes={index.nodes} />
  </div>;
}
