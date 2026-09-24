import siteMetadata from "../../data/sitemetadata";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/_next/', '/og'],
    },
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
  };
}
