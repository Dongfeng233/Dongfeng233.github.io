"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const Comments = dynamic(() => import("./comments"), {
  ssr: false,
  loading: () => <p className="comments-load-error">正在载入评论…</p>,
});

export default function DeferredComments({ path, title }) {
  const host = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "600px" });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  return <section id="comments" ref={host} className="not-prose" aria-label={`${title}的评论`}>
    {ready ? <Comments path={path} title={title} containerId="" /> :
      <div className="comments-heading"><h2>评论</h2><button type="button" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-accent" onClick={() => setReady(true)}>查看评论</button></div>}
  </section>;
}
