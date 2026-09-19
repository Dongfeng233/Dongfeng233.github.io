import { fromHtml } from "hast-util-from-html";
import { visibleText } from "./src/lib/reading-blocks.mjs";
import readingAnchors from "./src/lib/reading-blocks.mjs";
import remarkDirective from "remark-directive";
import remarkFolds from "./src/lib/remark-folds.mjs";
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import readingTime from "reading-time";
import rehypeFigure from "./src/components/rehype-figure"
import remarkGemoji from "remark-gemoji";
import rehypeMermaidPre from "./src/components/rehype-mermaid-pre.js"
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'



/** @type {import('contentlayer2/source-files').ComputedFields} */
const computedFields = {
  urlslug: {
    type: "string",
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },
  slug: {
    type: "string",
    resolve: (doc) => `/${doc._raw.flattenedPath}`.toLowerCase(),
  },
  slugAsParams: {
    type: "string",
    resolve: (doc) =>
      doc._raw.flattenedPath.split("/").slice(1).join("/").toLowerCase(),
  },
  readingTime: {
    type: "json",
    resolve: (doc) => readingTime(doc.body.raw, { wordsPerMinute: 1000 }),
  },
  headings: {
    type: "json",
    resolve: async (doc) => {
      if (doc.body.html) {
        const headings = [];
        function walk(node) {
          if (node.type === "element" && /^h[2-6]$/.test(node.tagName) && node.properties?.id !== "footnote-label") {
            const text = visibleText(node).trim();
            if (text && node.properties?.id) headings.push({ level: node.tagName === "h2" ? "two" : "three", text, id: String(node.properties.id) });
          }
          for (const child of node.children || []) walk(child);
        }
        walk(fromHtml(doc.body.html, { fragment: true }));
        return headings;
      }
      const regXHeader = /(?:^|\n)(?<flag>#{2,6})[ \t]+(?<content>.+)/g;
      const headings = Array.from(doc.body.raw.matchAll(regXHeader)).map(
        ({ groups }) => {
          const flag = groups?.flag;
          const content = groups?.content;
          return {
            level:
              flag?.length == 1 ? "one" : flag?.length == 2 ? "two" : "three",
            text: content,
            id: content.split(" ").join("-").toLowerCase(),
          };
        }
      );
      return headings;
    },
  },
};

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `pages/**/*.md`,
  contentType: "mdx",
  fields: {
    layout: { type: "enum", options: ["article", "zhouyi"], default: "article" },
    draft: { type: "boolean", default: false },
    eyebrow: { type: "string", default: "" },
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    lastmod: {
      type: "date",
      required: false,
    },
  },
  computedFields,
}));

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `blog/**/*.md`,
  contentType: "markdown",
  fields: {
    series: { type: "json", default: [] },
    updates: { type: "json", default: [] },
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    publishDate: {
      type: "date",
      required: true,
    },
    publishTime: {
      type: "string",
      default: "",
      required: false,
    },
    location: {
      type: "string",
      default: "",
      required: false,
    },
    lastmod: {
      type: "date",
      required: false,
    },
    image: {
      type: "string",
      default: "",
    },
    draft: {
      type: "boolean",
      default: false,
      required: false,
    },
    featured: {
      type: "boolean",
      default: false,
      required: false,
    },
    categories: {
      type: "list",
      default: [],
      of: { type: "string" },
    },
    tags: {
      type: "list",
      default: [],
      of: { type: "string" },
    },
    imageDesc: {
      type: "string",
      default: "",
    },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: "./data/content",
  documentTypes: [Post, Page],
  mdx: { remarkPlugins: [remarkGfm, remarkMath, remarkDirective, remarkFolds], rehypePlugins: [rehypeKatex, rehypeSlug, readingAnchors] },
  markdown: {
    remarkPlugins: [remarkParse, remarkDirective, remarkFolds,[remarkRehype, { footnoteLabel: "旁注", footnoteBackLabel: "返回正文" }], remarkGfm, remarkMath, remarkGemoji],
    rehypePlugins: [
      [
        rehypeKatex,
        {
          strict: false,
          trust: true,
          output: 'htmlAndMathml'
        }
      ],
      rehypeSlug,
      rehypeFigure,
      rehypeMermaidPre,
      readingAnchors,
      rehypeStringify,
            [
        rehypeShiki,
        {
          themes: {
            light: "material-theme-lighter",
            dark: "material-theme-darker",
          },
          // Emit only --shiki-light/--shiki-dark CSS variables per token
          // (no inline default color). The active color is chosen by CSS in
          // globals.css (.shiki uses var(--shiki-light), html.dark uses
          // var(--shiki-dark)). This avoids shipping two full color values per
          // token, shrinking code-heavy posts' HTML substantially.
          defaultColor: false,
        },
      ],
    ],
  },
});
