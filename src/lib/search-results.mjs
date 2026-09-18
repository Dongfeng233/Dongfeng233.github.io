export function searchResult(result, query) {
  const item = result.item;
  const indices = new Set();
  for (const match of result.matches || []) if (match.key === "blocks.text" && Number.isInteger(match.refIndex)) indices.add(match.refIndex);
  for (const [i, block] of (item.blocks || []).entries()) if (block.text.toLowerCase().includes(query.toLowerCase())) indices.add(i);
  const hits = [...indices].slice(0, 3).map((i) => {
    const block = item.blocks[i];
    const match = result.matches?.find((entry) => entry.key === "blocks.text" && entry.refIndex === i);
    const literal = block.text.toLowerCase().indexOf(query.toLowerCase());
    const at = literal >= 0 ? literal : match?.indices?.[0]?.[0] || 0;
    const start = Math.max(0, at - 45), end = Math.min(block.text.length, at + Math.max(query.length, 1) + 100);
    return { id: block.id, excerpt: (start ? "…" : "") + block.text.slice(start, end) + (end < block.text.length ? "…" : ""), href: `${item.slug}?highlight=${encodeURIComponent(query)}#${encodeURIComponent(block.id)}` };
  });
  const { blocks: _blocks, ...metadata } = item;
  return { ...metadata, searchHits: hits, searchQuery: query, searchHref: hits[0]?.href || item.slug };
}
