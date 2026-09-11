# Kaze 的博客

基于 [Prologue Blog Template](https://github.com/hxlog/prologue-blog-template) 搭建的个人博客，使用 Next.js 16、React 19、Tailwind CSS v4 与 Contentlayer2。

## 本地运行

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。

## 日常更新

- 文章：`data/content/blog/`
- 独立页面：`data/content/pages/`
- 站点信息：`data/sitemetadata.js`
- 短动态：`data/microblog.yaml`
- 友链：`data/links.yaml`
- 图片与其他静态文件：`public/`

也可以使用相邻目录中的 `my-blog-admin` 网页管理端编辑以上内容：

```powershell
cd E:\Playground+\my-blog-admin
npm run dev
```

文章使用 Markdown，Frontmatter 示例：

```yaml
---
title: 文章标题
description: 一句话摘要
publishDate: 2026-09-12
lastmod: 2026-09-12
featured: true
draft: false
tags: ["Technology", "Meta"]
image: /static/photos/cover.jpg
imageDesc: 图片说明
---
```

## 发布前配置

在 `data/sitemetadata.js` 中填写邮箱、GitHub 用户名和仓库名。评论使用 Giscus，填入 `repoid` 与 `categoryid` 后自动显示。

部署时把 `NEXT_PUBLIC_SITE_URL` 设置为博客的完整网址，例如 `https://blog.example.com`。

## 常用命令

```bash
npm run dev
npm run build
npm run start
npm run build:content
```

## GitHub Pages

推送 `main` 分支后，GitHub Actions 会生成静态站点并发布到 <https://dongfeng233.github.io>。

## 同步模板更新

项目保留 `upstream` 指向原始模板：

```bash
git fetch upstream
git merge upstream/master
```

## License

MIT
