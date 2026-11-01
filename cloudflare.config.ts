import { bindings, defineConfig, defineWorker, triggers } from "cf/config";

// Dominio raíz de la plataforma (p. ej. "tusaas.com"). Si está definido al desplegar,
// el Worker atiende el dominio y todos sus subdominios (un restaurante por subdominio).
// Requiere que el dominio esté en Cloudflare con un registro DNS wildcard "*" (proxied).
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

export default defineConfig({
  worker: defineWorker({
    name: "restaurantes",
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-09-28",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    env: {
      ASSETS: bindings.assets(),
      // Base de datos (esquema en migrations/)
      DB: bindings.d1({ name: "restaurantes" }),
      // Imágenes subidas por los restaurantes
      MEDIA: bindings.r2({ name: "restaurantes-media" }),

      // Variables públicas
      DEFAULT_TENANT_SLUG: bindings.text(process.env.DEFAULT_TENANT_SLUG ?? ""),
      ADMIN_EMAILS: bindings.text(process.env.ADMIN_EMAILS ?? ""),

      // Secretos: se cargan con `wrangler secret put <NOMBRE>`
      CLERK_SECRET_KEY: bindings.secret(),
      CRON_SECRET: bindings.secret(),
      EPAYCO_PRIVATE_KEY: bindings.secret(),
      // Cifra las llaves de ePayco de cada restaurante y protege PIN y sesiones (lib/crypto.ts)
      APP_SECRET: bindings.secret(),
      // Bot de Telegram de la plataforma (avisos de pedidos). Sin declararlo aquí, `pnpm dev` no lo
      // pasa al Worker aunque esté en .env.local y el panel dice "el bot aún no está activado".
      TELEGRAM_BOT_TOKEN: bindings.secret(),
      // Chat de respaldo del restaurante de demostración (lib/notificationService.ts)
      TELEGRAM_CHAT_ID: bindings.secret(),
    },
    triggers: [
      // Lunes 05:00 UTC: publica el plato ganador de la semana anterior de cada restaurante
      triggers.scheduled({ schedule: "0 5 * * 1" }),
      // Todos los días 14:00 UTC (9:00 en Colombia): recordatorios de pago por WhatsApp
      triggers.scheduled({ schedule: "0 14 * * *" }),
      ...(rootDomain
        ? [
            triggers.fetch({ pattern: `${rootDomain}/*`, zone: rootDomain }),
            triggers.fetch({ pattern: `*.${rootDomain}/*`, zone: rootDomain }),
          ]
        : []),
    ],
  }),
});
