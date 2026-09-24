// Reserved for Next's required route sample when a static content collection is empty.
// Its page renders notFound(); the export cleanup removes the sample from out/.
export const EMPTY_EXPORT_SLUG = "__empty-static-export__";

export function staticContentParams(slugs) {
  const params = slugs.map((slug) => ({ slug: slug.split("/") }));
  const staticExport = process.env.GITHUB_ACTIONS === "true" || process.env.GITHUB_PAGES === "true";
  return params.length || !staticExport ? params : [{ slug: [EMPTY_EXPORT_SLUG] }];
}
