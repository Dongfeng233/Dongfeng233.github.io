import ZhouyiWorkbench from "../../components/zhouyi-workbench";
import "../../lib/zhouyi/base.css";
import "./zhouyi.css";

export const metadata = {
  title: "读易 · Kaze 的博客",
  description: "阅读六十四卦与爻辞，对照本卦、之卦，循爻变读易。",
  alternates: { canonical: "/zhouyi/" },
};

export default function ZhouyiPage() {
  return (
    <div className="zhouyi-page">
      <header className="zhouyi-heading">
        <div>
          <p className="zhouyi-eyebrow">周易 · 六十四卦</p>
          <h1>读易</h1>
          <p>观卦、读辞，对照本卦与之卦。</p>
        </div>
        <a className="zhouyi-download" href="/downloads/zhouyi.html" download="周易.html">保存离线版 <span aria-hidden="true">↓</span></a>
      </header>
      <ZhouyiWorkbench />
      <noscript><p>开启 JavaScript 后可选卦与起卦，也可以保存离线版阅读。</p></noscript>
    </div>
  );
}
