// Entrada del Worker: delega las peticiones HTTP en vinext y añade el cron semanal.
import handler from "vinext/server/fetch-handler";
import { publishWeeklyWinners } from "../lib/cron";

export default {
  fetch: handler.fetch.bind(handler),

  // Cron Trigger (lunes 05:00 UTC): publica el plato ganador de la semana anterior
  async scheduled(_event: ScheduledController, _env: unknown, ctx: ExecutionContext) {
    ctx.waitUntil(
      publishWeeklyWinners().then(({ results }) => console.log("[Cron] weekly winners:", JSON.stringify(results)))
    );
  },
};
