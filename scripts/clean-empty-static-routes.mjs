import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EMPTY_EXPORT_SLUG } from "../src/lib/static-content-params.mjs";

if (process.env.GITHUB_ACTIONS === "true" || process.env.GITHUB_PAGES === "true") {
  const projectRoot = fileURLToPath(new URL("../", import.meta.url));
  const outRoot = path.resolve(projectRoot, "out");

  for (const prefix of ["", "blog", "tags"]) {
    const target = path.resolve(outRoot, prefix, EMPTY_EXPORT_SLUG);
    const relative = path.relative(outRoot, target);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Empty export route must stay inside the out directory");
    }
    try {
      await fs.access(target);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }

    const metadataPath = path.join(projectRoot, ".next", "server", "app", prefix, `${EMPTY_EXPORT_SLUG}.meta`);
    const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
    if (metadata.status !== 404) {
      throw new Error(`Reserved empty export route must render 404: ${relative}`);
    }
    await fs.rm(target, { recursive: true, force: true });
  }
}
