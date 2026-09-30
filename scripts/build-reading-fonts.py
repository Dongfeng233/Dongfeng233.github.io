"""Rebuild the small WenKai fonts shared by the home and article pages.

Run after a production build with fontTools and brotli installed locally.
Other characters continue to use the webfont package's Unicode-range files.
"""

from html.parser import HTMLParser
from pathlib import Path

from fontTools.merge import Merger
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
FONT_FILES = ROOT / "node_modules/lxgw-wenkai-webfont/files"
OUTPUT = ROOT / "public/fonts"


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hidden = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript", "svg", "math"}:
            self.hidden += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript", "svg", "math"} and self.hidden:
            self.hidden -= 1

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


pages = [ROOT / "out/index.html", *(ROOT / "out/blog").glob("**/index.html")]
if not all(page.is_file() for page in pages):
    raise SystemExit("Build the static site before rebuilding reading fonts.")

reader = VisibleText()
for page in pages:
    reader.feed(page.read_text(encoding="utf-8"))
characters = {ord(character) for character in "".join(reader.parts)}
OUTPUT.mkdir(parents=True, exist_ok=True)

for weight in ("regular", "bold"):
    family = f"lxgwwenkai-{weight}"
    sources = []
    for source in sorted(FONT_FILES.glob(f"{family}-subset-*.woff2")):
        font = TTFont(source)
        if set(font.getBestCmap() or {}) & characters:
            sources.append(str(source))
        font.close()

    merged = Merger().merge(sources)
    subset = Subsetter(options=Options())
    subset.populate(unicodes=characters)
    subset.subset(merged)
    merged.flavor = "woff2"
    destination = OUTPUT / f"reading-{weight}.woff2"
    merged.save(destination)
    print(f"{destination.name}: {len(sources)} source files, {destination.stat().st_size // 1024} KiB")
