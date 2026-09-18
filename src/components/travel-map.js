"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
const point = (place) => [(Number(place.longitude) + 180) * 2, (90 - Number(place.latitude)) * 2];
export default function TravelMap({ places, nodes }) {
  const [trip, setTrip] = useState(""), [selected, setSelected] = useState(""), [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const drag = useRef(null);
  const visible = useMemo(() => places.filter((place) => !trip || place.trip === trip).sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order), [places, trip]);
  const current = visible.find((place) => place.id === selected) || visible[0];
  const zoom = (factor) => setCamera((c) => {
    const scale = Math.max(1, Math.min(8, c.scale * factor));
    const center = current ? point(current) : [c.x + 360 / c.scale, c.y + 180 / c.scale];
    return { scale, x: Math.max(0, Math.min(720 - 720 / scale, center[0] - 360 / scale)), y: Math.max(0, Math.min(360 - 360 / scale, center[1] - 180 / scale)) };
  });
  const trips = [...new Set(places.map((place) => place.trip).filter(Boolean))];
  return <section className="travel-view"><div className="explore-controls"><select aria-label="选择旅行" value={trip} onChange={(e) => { setTrip(e.target.value); setSelected(""); }}><option value="">所有足迹</option>{trips.map((name) => <option key={name}>{name}</option>)}</select><button aria-label="放大足迹地图" onClick={() => zoom(1.5)}>＋</button><button aria-label="缩小足迹地图" onClick={() => zoom(1 / 1.5)}>−</button><button onClick={() => setCamera({ x: 0, y: 0, scale: 1 })}>重置地图</button><span>{visible.length} 次到访 · {new Set(visible.map((place) => place.city)).size} 座城市</span></div>
    <svg className="travel-svg" viewBox={`${camera.x} ${camera.y} ${720 / camera.scale} ${360 / camera.scale}`} role="group" aria-label="城市级旅行地图" onPointerDown={(e) => { if (e.target.tagName !== "circle") { drag.current = { x: e.clientX, y: e.clientY, camera }; e.currentTarget.setPointerCapture(e.pointerId); } }} onPointerMove={(e) => { if (drag.current) { const ratio = 720 / camera.scale / e.currentTarget.getBoundingClientRect().width; setCamera({ ...drag.current.camera, x: drag.current.camera.x - (e.clientX - drag.current.x) * ratio, y: drag.current.camera.y - (e.clientY - drag.current.y) * ratio }); } }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <image href="/static/maps/world-land.svg" width="720" height="360" />
      {trips.filter((name) => !trip || name === trip).map((name) => { const route = visible.filter((place) => place.trip === name); return <path key={name} d={route.map((place, i) => `${!i || Math.abs(place.longitude - route[i - 1].longitude) > 180 ? "M" : "L"}${point(place).join(",")}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity=".5" />; })}
      {visible.map((place) => { const [x, y] = point(place); return <g key={place.id} role="button" tabIndex={0} aria-label={`${place.city} ${place.date}`} onClick={() => setSelected(place.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(place.id); } }}><circle cx={x} cy={y} r={(current?.id === place.id ? 5 : 3.5) / Math.sqrt(camera.scale)} fill="var(--accent)" stroke="var(--surface)" strokeWidth={1 / camera.scale} /><title>{place.city} · {place.date}</title></g>; })}
    </svg>
    <div className="travel-content"><div className="travel-cities" role="group" aria-label="城市列表">{visible.map((place) => <button key={place.id} aria-pressed={current?.id === place.id} onClick={() => setSelected(place.id)}><strong>{place.city}</strong><span>{place.date} {place.trip}</span></button>)}</div>{current ? <article className="travel-detail"><small>{current.trip} · {current.date}</small><h2>{current.city}</h2><p>{current.description}</p><div className="travel-photos">{current.photos.map((url) => <img src={url} key={url} alt={`${current.city}的照片`} loading="lazy" data-lightbox="true" />)}</div>{current.articles.map((url) => <Link className="graph-list-link" href={url} key={url}>{nodes.find((node) => node.url === url)?.title} →</Link>)}</article> : <p className="explore-empty">未来的旅途，从这里开始记录。</p>}</div>
    <small className="map-credit">底图：Natural Earth · 城市级足迹</small>
  </section>;
}
