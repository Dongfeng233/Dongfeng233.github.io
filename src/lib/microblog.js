import fs from "fs";
import path from "path";
import { load } from "js-yaml";
import { toPublicationDate } from "./date";

/**
 * Microblog data access + normalization.
 *
 * Schema (data/microblog.yaml), backward compatible with old {date, content}
 * entries — a Weibo/Zhihu-style entry supports multiple text paragraphs and
 * multiple captioned images:
 *
 *   - date: 2026-03-14
 *     content: |
 *       First paragraph…
 *
 *       Second paragraph…        (blank line = new paragraph)
 *     images:
 *       - src: /static/microblog/a.jpg
 *         desc: caption           (optional; shown in the lightbox)
 *       - /static/microblog/b.jpg (plain-string shorthand)
 *
 * Normalized entry: { id, date, paragraphs[], images[{src, desc}] }.
 * `id` is stable (date + index) and used for page anchors and RSS guids.
 */
export function getMicroblog() {
  const filePath = path.join(process.cwd(), "data", "microblog.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const entries = load(raw) || [];

  return entries
    .map((entry, index) => normalize(entry, index))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function normalize(entry, index) {
  const paragraphs = String(entry.content || "")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  const images = (entry.images || []).map((img) =>
    typeof img === "string" ? { src: img, desc: "" } : { src: img.src, desc: img.desc || "" }
  );

  const normalizedDate = entry.date instanceof Date
    ? entry.date.toISOString().slice(0, 10)
    : String(entry.date || "").slice(0, 10);
  const dateKey = normalizedDate.replace(/-/g, "");
  const time = /^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(String(entry.time || ""))
    ? String(entry.time)
    : "";
  const location = String(entry.location || "").trim();
  const publishedAt = toPublicationDate(normalizedDate, time).toISOString();
  return {
    id: `mb-${dateKey}-${time.replace(/[:.]/g, "") || index}`,
    date: normalizedDate,
    time,
    location,
    publishedAt,
    paragraphs,
    images,
  };
}

/** HTML serialization for the microblog RSS feed (paragraphs + figures). */
export function entryToHtml(entry, absolutize) {
  const parts = [];
  if (entry.location) {
    parts.push(`<p><small>发布于 ${escapeHtml(entry.location)}</small></p>`);
  }
  for (const p of entry.paragraphs) {
    parts.push(`<p>${escapeHtml(p)}</p>`);
  }
  for (const img of entry.images) {
    const src = absolutize(img.src);
    const alt = escapeHtml(img.desc || "");
    parts.push(
      `<figure><img src="${src}" alt="${alt}" loading="lazy" />${
        img.desc ? `<figcaption>${escapeHtml(img.desc)}</figcaption>` : ""
      }</figure>`
    );
  }
  return parts.join("");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
