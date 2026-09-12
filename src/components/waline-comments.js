"use client";

import { useEffect, useRef, useState } from "react";

export default function WalineComments({ path, title, serverUrl }) {
  const host = useRef(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    let instance;

    import("@waline/client").then(({ init }) => {
      if (!active || !host.current) return;
      instance = init({
        el: host.current,
        serverURL: serverUrl,
        path,
        lang: "zh-CN",
        dark: "html.dark",
        meta: ["nick", "mail"],
        requiredMeta: ["nick"],
        login: "disable",
        imageUploader: false,
        emoji: false,
        search: false,
        reaction: false,
        pageview: false,
        comment: false,
        locale: {
          nick: "昵称",
          mail: "邮箱",
          optional: "选填",
          placeholder: "写下你的想法…",
          submit: "提交评论",
          sofa: "还没有公开评论，欢迎留下你的想法。",
          commentUnderReview: "评论已提交，审核通过后公开显示。",
        },
      });
    }).catch(() => { if (active) setLoadError(true); });

    return () => {
      active = false;
      instance?.destroy();
    };
  }, [path, serverUrl]);

  return (
    <section id="comments" className="moderated-comments not-prose" aria-label={title ? `${title}的评论` : "评论"}>
      <header className="comments-heading">
        <h2>评论</h2>
        <p>评论审核通过后公开显示。</p>
      </header>
      {loadError ? <p className="comments-load-error" role="alert">评论暂时无法加载，请稍后刷新页面。</p> : null}
      <div ref={host} className="waline-widget" />
    </section>
  );
}
