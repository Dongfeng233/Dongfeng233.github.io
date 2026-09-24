import { embedAddress } from "../lib/page-types";

export default function EmbeddedPage({ page }) {
  const src = embedAddress(page.embedUrl);
  const height = Math.max(320,Math.min(1600,Number(page.embedHeight)||720));
  return <section className="mx-auto max-w-6xl py-8"><header className="mb-6">{page.eyebrow?<p className="text-sm text-muted">{page.eyebrow}</p>:null}<h1 className="mt-2 text-3xl font-semibold text-foreground">{page.title}</h1>{page.description?<p className="mt-3 leading-8 text-muted">{page.description}</p>:null}</header>{src?<><iframe src={src} title={page.title} loading="lazy" sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-downloads" referrerPolicy="no-referrer" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]" style={{height}}/><p className="mt-3 text-right text-sm"><a href={src} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">在新窗口打开 ↗</a></p></>:<p>页面内容正在准备中。</p>}</section>;
}
