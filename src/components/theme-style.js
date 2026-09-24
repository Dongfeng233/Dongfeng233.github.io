import theme from "../../data/theme.json" with { type: "json" };

const HEX = /^#[0-9a-fA-F]{6}$/;
const RADIUS = /^\d+(?:\.\d+)?(?:px|rem)$/;

function color(value, fallback) {
  return HEX.test(String(value || "")) ? value : fallback;
}

function palette(values, dark = false) {
  const background = color(values.background, dark ? "#09090b" : "#fafafa");
  const foreground = color(values.foreground, dark ? "#f4f4f5" : "#18181b");
  const surface = color(values.surface, dark ? "#111113" : "#ffffff");
  const surface2 = color(values.surface2, dark ? "#1b1b1f" : "#f4f4f5");
  const muted = color(values.muted, dark ? "#a1a1aa" : "#71717a");
  const accent = color(values.accent, dark ? "#22d3ee" : "#0891b2");
  const secondary = color(values.secondary, dark ? "#a78bfa" : "#8b5cf6");
  const strongMix = dark ? "white" : "black";

  return `
    --background:${background};
    --foreground:${foreground};
    --surface:${surface};
    --surface-2:${surface2};
    --surface-3:color-mix(in srgb, ${surface2} 82%, ${foreground});
    --muted:${muted};
    --faint:color-mix(in srgb, ${muted} 68%, ${background});
    --border:color-mix(in srgb, ${foreground} 8%, transparent);
    --border-strong:color-mix(in srgb, ${foreground} 16%, transparent);
    --shadow-tint:color-mix(in srgb, ${foreground} 12%, transparent);
    --accent:${accent};
    --accent-strong:color-mix(in srgb, ${accent} 78%, ${strongMix});
    --accent-soft:color-mix(in srgb, ${accent} 13%, transparent);
    --secondary:${secondary};
    --secondary-strong:color-mix(in srgb, ${secondary} 78%, ${strongMix});
    --secondary-soft:color-mix(in srgb, ${secondary} 14%, transparent);
    --gradient-brand:linear-gradient(120deg, ${accent}, ${secondary});
  `;
}

export default function ThemeStyle() {
  const radius = RADIUS.test(String(theme.radiusCard || ""))
    ? theme.radiusCard
    : "0.75rem";
  const css = `:root{${palette(theme.light)}--radius-card:${radius};}.dark{${palette(theme.dark, true)}}`;

  return <style id="site-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
