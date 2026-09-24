"use client";
import { useEffect } from "react";
export default function FootnotePopovers() {
  useEffect(() => {
    let opened = null, active = null;
    const close = () => { opened?.remove(); opened = null; if (active) active.setAttribute("aria-expanded", "false"); };
    const click = (event) => {
      const ref = event.target.closest('a[data-footnote-ref]');
      if (!ref) { if (!event.target.closest(".footnote-popover")) close(); return; }
      const id = ref.getAttribute("href")?.slice(1), note = id && document.getElementById(decodeURIComponent(id));
      if (!note) return;
      event.preventDefault();
      if (active === ref && opened) { close(); return; }
      close(); active = ref;
      const panel = document.createElement("span"); panel.className = "footnote-popover"; panel.setAttribute("role", "note");
      const content = note.cloneNode(true); content.removeAttribute("id"); content.querySelectorAll('[id], [data-footnote-backref]').forEach((node) => { if (node.hasAttribute("data-footnote-backref")) node.remove(); else node.removeAttribute("id"); });
      const rect = ref.getBoundingClientRect(); panel.style.setProperty("--note-x", `${Math.max(20, Math.min(rect.left, window.innerWidth - 360))}px`); panel.style.setProperty("--note-y", `${Math.max(20, Math.min(rect.bottom + 12, window.innerHeight - 280))}px`);
      panel.innerHTML = content.innerHTML; ref.parentElement.after(panel); opened = panel; ref.setAttribute("aria-expanded", "true");
    };
    const key = (event) => { if (event.key === "Escape" && opened) { close(); active?.focus(); } };
    document.addEventListener("click", click); document.addEventListener("keydown", key);
    return () => { close(); document.removeEventListener("click", click); document.removeEventListener("keydown", key); };
  }, []);
  return null;
}
