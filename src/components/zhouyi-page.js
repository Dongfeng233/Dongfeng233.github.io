import ZhouyiWorkbench from "./zhouyi-workbench";
import "../lib/zhouyi/base.css";
import "../app/zhouyi/zhouyi.css";

export default function ZhouyiPage({ page }) {
  return (
    <div className="zhouyi-page">
      <header className="zhouyi-heading">
        <div>
          {page.eyebrow ? <p className="zhouyi-eyebrow">{page.eyebrow}</p> : null}
          <h1>{page.title}</h1>
          {page.description ? <p>{page.description}</p> : null}
        </div>
      </header>
      <ZhouyiWorkbench />
      <noscript><p>开启 JavaScript 后可选卦与起卦。</p></noscript>
    </div>
  );
}
