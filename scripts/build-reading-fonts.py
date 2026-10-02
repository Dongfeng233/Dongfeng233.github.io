"""Generate reading fonts after Contentlayer and before Next.js builds.

Use a character superset of published content and site source text. Characters
outside WenKai's cmap continue to use the site's fallback fonts.
"""

from html import unescape
import json
from pathlib import Path

from fontTools.merge import Merger
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables.otBase import USE_HARFBUZZ_REPACKER


ROOT = Path(__file__).resolve().parents[1]
FONT_FILES = ROOT / "node_modules/lxgw-wenkai-webfont/files"
OUTPUT = ROOT / "public/fonts"
TEXT_EXTENSIONS = {".js", ".jsx", ".mjs", ".ts", ".tsx", ".json", ".yaml", ".yml", ".css"}


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)


def collect_characters():
    parts = []
    for document_type in ("Post", "Page"):
        index = ROOT / ".contentlayer/generated" / document_type / "_index.json"
        if not index.is_file():
            raise SystemExit("Run contentlayer2 build before generating reading fonts.")
        for document in json.loads(index.read_text(encoding="utf-8")):
            if document.get("draft") is not True:
                # Includes metadata, Markdown/MDX source and rendered HTML.
                parts.extend(strings(document))

    # Include UI labels, CSS-generated text and configurable site text. Reading
    # JSON values also covers characters represented by Unicode escapes.
    for directory in (ROOT / "data", ROOT / "src"):
        for source in sorted(directory.rglob("*")):
            if source.is_file() and source.suffix in TEXT_EXTENSIONS:
                text = source.read_text(encoding="utf-8")
                parts.append(text)
                if source.suffix == ".json":
                    parts.extend(strings(json.loads(text)))
    return {ord(character) for part in parts for character in unescape(part)}


def main():
    characters = collect_characters()
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for weight in ("regular", "bold"):
        family = f"lxgwwenkai-{weight}"
        sources = []
        timestamps = []
        for source in sorted(FONT_FILES.glob(f"{family}-subset-*.woff2")):
            with TTFont(source) as font:
                if set(font.getBestCmap() or {}) & characters:
                    sources.append(str(source))
                    timestamps.append((font["head"].created, font["head"].modified))
        if not sources:
            raise SystemExit(f"No {family} source fonts found; run npm ci first.")

        merged = Merger().merge(sources)
        # Merger sets these dates to the current time; restore source timestamps.
        merged["head"].created = min(created for created, _ in timestamps)
        merged["head"].modified = max(modified for _, modified in timestamps)
        merged.recalcTimestamp = False
        # Use one serializer across environments, including local installations.
        merged.cfg[USE_HARFBUZZ_REPACKER] = False
        subset = Subsetter(options=Options())
        subset.populate(unicodes=sorted(characters))
        subset.subset(merged)
        merged.flavor = "woff2"
        destination = OUTPUT / f"reading-{weight}.woff2"
        merged.save(destination)
        merged.close()
        print(f"{destination.name}: {len(sources)} source files, {destination.stat().st_size // 1024} KiB")


if __name__ == "__main__":
    main()
