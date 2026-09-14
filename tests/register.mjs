import { registerHooks, stripTypeScriptTypes } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";

// Node 24: resolve the same TypeScript aliases as Vite without a second bundler.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = resolve("src", specifier.slice(2));
      for (const suffix of [".ts", "/index.ts"])
        if (existsSync(base + suffix))
          return { url: pathToFileURL(base + suffix).href, shortCircuit: true };
    }
    if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts")) {
      const candidate = new URL(specifier + ".ts", context.parentURL);
      if (existsSync(fileURLToPath(candidate))) return { url: candidate.href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith(".ts") && !url.includes("/node_modules/"))
      return {
        format: "module",
        source: stripTypeScriptTypes(readFileSync(new URL(url), "utf8")),
        shortCircuit: true,
      };
    return nextLoad(url, context);
  },
});
