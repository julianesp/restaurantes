import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { createHash } from "node:crypto";
import { patchCssModules } from "vite-css-modules";
import path from "node:path";

// @clerk/nextjs usa require() en dos sitios que no existen en el entorno ESM de Workers (dev):
//  - require("server-only") dentro de auth()/currentUser(): solo impide importarlo desde el cliente,
//    ya garantizado aquí, así que se elimina.
//  - require("next/navigation") dentro de un hook: se sustituye por un import estático equivalente.
const fixClerkRequires = {
  name: "fix-clerk-requires",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    if (!id.includes("@clerk/nextjs")) return null;
    let out = code;
    if (out.includes('require("server-only")')) out = out.replaceAll('require("server-only");', "");
    if (out.includes('require("next/navigation")')) {
      out = 'import * as __clerkNextNavigation from "next/navigation";\n' + out.replaceAll('require("next/navigation")', "__clerkNextNavigation");
    }
    return out === code ? null : { code: out, map: null };
  },
};

// styled-jsx/style es CommonJS. vinext lo resuelve por su cuenta (se salta el pre-empaquetado de Vite),
// así que en desarrollo el navegador lo pide como módulo ES y falla ("does not provide an export named
// 'default'"). Solo en `vite dev` y solo para el cliente se sirve ya convertido a ES con esbuild.
// El build de producción y el SSR no lo necesitan.
const styledJsxEsmForDevClient = {
  name: "styled-jsx-esm-dev-client",
  apply: "serve" as const,
  enforce: "pre" as const,
  async load(this: { environment?: { name?: string } }, id: string) {
    if (!/node_modules[\\/]styled-jsx[\\/]style\.js$/.test(id.split("?")[0])) return null;
    if (this.environment?.name !== "client") return null;
    const { build } = await import("esbuild");
    const result = await build({
      entryPoints: [id.split("?")[0]],
      bundle: true,
      format: "esm",
      platform: "browser",
      define: { "process.env.NODE_ENV": '"development"' },
      write: false,
      plugins: [
        {
          // require("react") de styled-jsx -> módulo ES que re-exporta el MISMO react de Vite
          // (sin esto habría un require() inválido en el navegador o un React duplicado)
          name: "react-as-esm",
          setup(b) {
            b.onResolve({ filter: /^react$/ }, (args) =>
              args.namespace === "react-shim"
                ? { path: "react", external: true }
                : { path: "react", namespace: "react-shim" }
            );
            b.onLoad({ filter: /.*/, namespace: "react-shim" }, () => ({
              contents: 'import * as R from "react"; export default R; export * from "react";',
              loader: "js",
            }));
          },
        },
      ],
    });
    return result.outputFiles[0].text;
  },
};

// Vite sirve los archivos de node_modules que NO pre-empaqueta (p. ej. los shims de vinext) con
// `?v=<hash del paquete>` y caché inmutable de un año. Ese hash no cambia cuando Vite vuelve a
// optimizar dependencias, pero el contenido sí (importa react.js?v=<hash nuevo>): el navegador se
// queda con la copia vieja, carga dos Reacts y la página muere con "Invalid hook call" / "reading
// 'useContext'" incluso tras recargar. En desarrollo esos archivos se revalidan siempre (ETag).
const revalidateUnbundledNodeModules = {
  name: "revalidate-unbundled-node-modules",
  apply: "serve" as const,
  configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: { setHeader: (k: string, v: unknown) => unknown }, next: () => void) => void) => void } }) {
    server.middlewares.use((req, res, next) => {
      const url = req.url ?? "";
      if (url.includes("/node_modules/") && !url.includes("/.vite/deps")) {
        const setHeader = res.setHeader.bind(res);
        res.setHeader = (key, value) =>
          setHeader(key, key.toLowerCase() === "cache-control" ? "no-cache" : value);
      }
      next();
    });
  },
};

export default defineConfig({
  resolve: {
    alias: [
      // jspdf no declara condición workerd/worker: se apunta a su build ES directamente
      { find: /^jspdf$/, replacement: path.resolve(import.meta.dirname, "node_modules/jspdf/dist/jspdf.es.min.js") },
    ],
  },
  plugins: [
    fixClerkRequires,
    styledJsxEsmForDevClient,
    revalidateUnbundledNodeModules,
    patchCssModules({ exportMode: "default" }),
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["@clerk/nextjs"],
    // @clerk/nextjs está excluido, así que Vite descubre sus imports de next/* en mitad de la primera
    // carga, re-optimiza y el navegador acaba con dos copias de React ("Invalid hook call").
    // Se pre-empaquetan desde el arranque para que eso no ocurra.
    include: ["next/compat/router", "next/dynamic", "next/router", "next/script"],
  },
  environments: {
    // Igual en el servidor: evita el "optimized dependencies changed. reloading" del primer request
    rsc: {
      optimizeDeps: {
        include: ["@clerk/backend", "@clerk/backend/internal", "@clerk/backend/jwt"],
      },
    },
  },
  css: {
    modules: {
      generateScopedName(name: string, filename: string) {
        const relativePath = path.relative(import.meta.dirname, filename.replace(/\?.*$/, "")).replaceAll("\\", "/");
        return `_${name}_${createHash("sha256").update(relativePath).digest("hex").slice(0, 7)}`;
      },
    },
  },
});
