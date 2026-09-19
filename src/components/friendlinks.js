"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Comments from "./comments";
import siteMetadata from "../../data/sitemetadata";

// Small, fast, deterministic PRNG (mulberry32) — pure function, safe to use during render
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function FriendLinks({ friends }) {
  const [seed, setSeed] = useState(null);
  const repository = siteMetadata.github && siteMetadata.siteRepo ? `https://github.com/${siteMetadata.github}/${siteMetadata.siteRepo}` : "";
  useEffect(() => {
    const id = setTimeout(() => setSeed(Math.floor(Math.random() * 2 ** 31)), 0);
    return () => clearTimeout(id);
  }, []);

  const shuffledFriends = useMemo(() => {
    const arr = [...(friends || [])];
    if (seed === null) return arr;
    const rnd = mulberry32(seed);
    return arr
      .map((f) => ({ f, key: Math.floor(rnd() * 2 ** 31) }))
      .sort((a, b) => a.key - b.key)
      .map((x) => x.f);
  }, [friends, seed]);

  return (
    <div className="container mx-auto p-4 py-12">
      <p className="eyebrow mx-auto w-fit">Friends</p>
      <h2 className="pb-12 pt-2 text-center text-3xl font-semibold tracking-tight text-foreground">
        友情链接
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shuffledFriends.length === 0 ? (
          <div className="card col-span-full px-6 py-12 text-center text-sm text-muted">
            暂无友链。
          </div>
        ) : null}
        {shuffledFriends.map((friend) => (
          <Link
            key={friend.name}
            href={friend.blog_url}
            target="_blank"
            className="card card-interactive card-spotlight group p-6 text-center"
          >
            <Image
              src={friend.avatar}
              height={80}
              width={80}
              alt={friend.name}
              className="mx-auto mb-4 h-20 w-20 rounded-full object-cover ring-2 ring-border transition-all duration-300 group-hover:ring-accent"
            />
            <h3 className="card-title text-lg font-semibold text-foreground transition-colors duration-200">
              {friend.name}
            </h3>
            <p className="mb-4 pt-1 text-sm text-muted">{friend.description}</p>
          </Link>
        ))}
      </div>
      {repository || siteMetadata.commentsEnabled ? <p className="mt-4 py-8 text-center text-sm text-muted">
        如有意交换友链，请
        {repository ? <Link
          className="mx-1 text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:text-accent-strong"
          href={`${repository}/edit/main/data/links.yaml`}
        >
          在Github上编辑links.yaml提PR
        </Link> : null}
        {siteMetadata.commentsEnabled ? `${repository ? "或" : ""}在评论区留言。` : null}
      </p> : null}
      {siteMetadata.commentsEnabled ? <Comments path="/links" title="友情链接" /> : null}
    </div>
  );
}
