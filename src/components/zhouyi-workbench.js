"use client";

import { useEffect, useRef } from "react";
import { initializeZhouyi } from "../lib/zhouyi/engine";
import markup from "../lib/zhouyi/markup.json";

export default function ZhouyiWorkbench() {
  const container = useRef(null);
  useEffect(() => {
    const root = container.current;
    root.innerHTML = markup;
    const dispose = initializeZhouyi(root);
    return () => {
      dispose();
      root.querySelector("dialog[open]")?.close();
      root.replaceChildren();
    };
  }, []);

  return <div ref={container} className="zhouyi-workbench" dangerouslySetInnerHTML={{ __html: markup }} />;
}
