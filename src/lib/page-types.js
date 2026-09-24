import pageTypes from "../../data/page-types.json";
export function getPageType(layout = "article") { return pageTypes.find((type) => type.id === (layout || "article")); }
export function embedAddress(value) {
  if (typeof value !== "string" || !value) return "";
  if (value.startsWith("/") && !value.startsWith("//") && !/[\\\r\n\t]/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? value : ""; } catch { return ""; }
}
