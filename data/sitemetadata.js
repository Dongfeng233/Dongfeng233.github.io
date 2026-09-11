const config = require("./site.json");

const siteMetadata = {
  ...config,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || config.siteUrl,
  repoid: config.giscus?.enabled ? config.giscus.repoId : "",
  categoryid: config.giscus?.enabled ? config.giscus.categoryId : "",
  umami: config.umami?.enabled ? config.umami : undefined,
};

module.exports = siteMetadata;
