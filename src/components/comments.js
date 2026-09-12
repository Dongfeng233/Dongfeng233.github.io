"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import siteMetadata from "../../data/sitemetadata";
import WalineComments from "./waline-comments";

export default function Comments({ path, title }) {
  const { theme, resolvedTheme } = useTheme();
  if (!siteMetadata.commentsEnabled) return null;

  if (siteMetadata.comments.enabled) {
    const normalizedPath = `/${String(path || "/").split(/[?#]/)[0].replace(/^\/+|\/+$/g, "")}`;
    return <WalineComments key={normalizedPath} path={normalizedPath} title={title} serverUrl={siteMetadata.comments.serverUrl} />;
  }

  const commentsTheme =
    theme === "dark" || resolvedTheme === "dark" ? "transparent_dark" : "light";
  return (
    <div id="comments" className="not-prose">
      <Giscus
        repo={`${siteMetadata.github}/${siteMetadata.siteRepo}`}
        repoId={siteMetadata.repoid}
        category={siteMetadata.giscus?.category || "Announcements"}
        categoryId={siteMetadata.categoryid}
        mapping="pathname"
        reactionsEnabled="1"
        inputPosition="top"
        theme={commentsTheme}
        lang="zh-CN"
      />
    </div>
  );
}
