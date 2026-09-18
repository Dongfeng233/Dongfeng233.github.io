"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
let indexPromise;
function loadIndex() { return indexPromise ||= fetch("/link-index.json").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).catch((error) => { indexPromise = null; throw error; }); }
function key(url) { const parsed = new URL(url, location.origin); if (parsed.origin !== location.origin) return ""; const name = parsed.pathname.replace(/\/$/, "") || "/"; return name === "/now" && parsed.searchParams.has("item") ? `/now?item=${encodeURIComponent(parsed.searchParams.get("item"))}` : name; }
export default function LinkPreviews() {
  const [preview, setPreview] = useState(null), [position, setPosition] = useState({ left: 16, top: 100 });
  const timer = useRef(null), closeTimer = useRef(null), popup = useRef(null), active = useRef(null);
  useEffect(() => {
    const root = document.querySelector("[data-reading-body]"); if (!root) return;
    const links = [...root.querySelectorAll("a[href]")].filter((link) => { try { return key(link.href) && !link.hasAttribute("data-footnote-ref") && !link.hasAttribute("data-footnote-backref"); } catch { return false; } });
    if (!links.length) return;
    let alive = true; const cleanups = [];
    loadIndex().then((items) => {
      if (!alive) return;
      for (const link of links) {
        const item = items.find((entry) => entry.url === key(link.href)); if (!item) continue;
        const trigger = document.createElement("button"); trigger.type = "button"; trigger.className = "link-peek-trigger"; trigger.textContent = ""; trigger.setAttribute("aria-label", `预览：${item.title}`); trigger.setAttribute("aria-expanded", "false"); trigger.setAttribute("aria-haspopup", "dialog"); trigger.setAttribute("aria-controls", "internal-link-preview"); link.after(trigger);
        const show = () => { clearTimeout(timer.current); clearTimeout(closeTimer.current); active.current?.setAttribute("aria-expanded", "false"); active.current = trigger; trigger.setAttribute("aria-expanded", "true"); const rect = link.getBoundingClientRect(); setPosition({ left: Math.max(12, Math.min(rect.left, innerWidth - 352)), top: Math.max(70, Math.min(rect.bottom + 10, innerHeight - 340)) }); setPreview({ ...item, href: link.href }); };
        const enter = () => { clearTimeout(closeTimer.current); timer.current = setTimeout(show, 220); };
        const leave = () => { clearTimeout(timer.current); closeTimer.current = setTimeout(() => { if (!popup.current?.contains(document.activeElement)) { setPreview(null); trigger.setAttribute("aria-expanded", "false"); } }, 180); };
        const click = (event) => { event.preventDefault(); event.stopPropagation(); show(); requestAnimationFrame(() => popup.current?.focus()); };
        link.addEventListener("pointerenter", enter); link.addEventListener("pointerleave", leave); link.addEventListener("focus", show); trigger.addEventListener("click", click);
        cleanups.push(() => { link.removeEventListener("pointerenter", enter); link.removeEventListener("pointerleave", leave); link.removeEventListener("focus", show); trigger.removeEventListener("click", click); trigger.remove(); });
      }
    }).catch(() => {});
    const dismiss = (event) => { if (event.type === "keydown" && event.key !== "Escape") return; if (event.type === "pointerdown" && (popup.current?.contains(event.target) || event.target.closest(".link-peek-trigger"))) return; setPreview(null); active.current?.setAttribute("aria-expanded", "false"); if (event.type === "keydown") active.current?.focus(); };
    document.addEventListener("pointerdown", dismiss); document.addEventListener("keydown", dismiss);
    return () => { alive = false; clearTimeout(timer.current); clearTimeout(closeTimer.current); cleanups.forEach((cleanup) => cleanup()); document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", dismiss); };
  }, []);
  if (!preview) return null;
  return createPortal(<aside id="internal-link-preview" tabIndex={-1} ref={popup} className="link-peek-card" role="dialog" aria-label={`预览 ${preview.title}`} style={position} onPointerEnter={() => clearTimeout(closeTimer.current)} onPointerLeave={() => { closeTimer.current = setTimeout(() => { if (!popup.current?.contains(document.activeElement)) { setPreview(null); active.current?.setAttribute("aria-expanded", "false"); } }, 180); }}><button className="link-peek-close" aria-label="关闭预览" onClick={() => { setPreview(null); active.current?.setAttribute("aria-expanded", "false"); active.current?.focus(); }}>×</button>{preview.image ? <img src={preview.image} alt="" loading="lazy" /> : null}<small>{preview.kind === "collection" ? "收藏的作品" : "站内阅读"}</small><h3>{preview.title}</h3><p>{preview.description || "打开查看完整内容。"}</p><a href={preview.href}>{preview.kind === "collection" ? "查看作品" : "阅读全文"} →</a></aside>, document.body);
}
