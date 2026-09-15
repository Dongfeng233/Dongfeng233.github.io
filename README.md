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
publishTime: "09:30:15.250"
location: "福州 · 家中"
lastmod: 2026-09-12
featured: true
draft: false
tags: ["Technology", "Meta"]
image: /static/photos/cover.jpg
imageDesc: 图片说明
---
```

## 发布前配置

站点资料保存在 `data/site.json`，可通过本地管理端编辑。评论使用 Waline：在“站点设置 → 评论与审核”填写评论服务地址并启用，侧栏“评论审核”可打开专属审核后台。

访客提交的评论进入待审核队列，站长批准后公开。访客修改已批准评论的正文后会重新待审。服务端源码位于相邻的 `my-blog-comments` 项目，`COMMENT_AUDIT` 已在服务入口固定开启。

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

## 版权与许可

博客原创内容（文章、独立页面、短动态及原创图片等）版权归 Kaze 所有，保留所有权利（All rights reserved）。转载、复制、改编或商业使用，请事先取得作者书面授权。完整声明见 [CONTENT-LICENSE.md](./CONTENT-LICENSE.md)。

博客程序代码采用 [MIT 许可证](./LICENSE)，保留 Prologue Blog Template 原作者的版权与许可声明。
