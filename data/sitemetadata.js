const config = require("./site.json");

const comments = {
  enabled: false,
  provider: "waline",
  serverUrl: "",
  ...config.comments,
};
comments.serverUrl = String(comments.serverUrl || "").trim().replace(/\/+$/, "");

function commentsConfigured(value) {
  if (!value.enabled || value.provider !== "waline") return false;
  try {
    const server = new URL(value.serverUrl);
    return ["https:", "http:"].includes(server.protocol) && !server.username && !server.password && !server.search && !server.hash;
  } catch {
    return false;
  }
}

const legacyCommentsEnabled = Boolean(
  config.giscus?.enabled && config.github && config.siteRepo && config.giscus.repoId && config.giscus.categoryId,
);

const siteMetadata = {
  ...config,
  comments,
  commentsEnabled: comments.enabled ? commentsConfigured(comments) : legacyCommentsEnabled,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || config.siteUrl,
  repoid: config.giscus?.enabled ? config.giscus.repoId : "",
  categoryid: config.giscus?.enabled ? config.giscus.categoryId : "",
  umami: config.umami?.enabled ? config.umami : undefined,
};

module.exports = siteMetadata;
