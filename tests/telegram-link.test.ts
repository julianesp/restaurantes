// lib/telegram-link.ts: encontrar el chat que respondió con el código de conexión.
import { findChatInUpdates, newLinkCode } from "@/lib/telegram-link";

const msg = (text: string, chat: { id: number; title?: string; first_name?: string }) => ({ message: { text, chat } });

it("genera códigos que Telegram acepta en ?start=", () => {
  const code = newLinkCode();
  expect(code).toMatch(/^BRSY[0-9A-F]{12}$/);
  expect(newLinkCode()).not.toBe(code);
});

it("encuentra el chat privado que tocó Iniciar (/start CÓDIGO)", () => {
  const updates = [msg("hola", { id: 1, first_name: "Otro" }), msg("/start BRSYABC123ABC123", { id: 555, first_name: "Ana" })];
  expect(findChatInUpdates(updates, "BRSYABC123ABC123")).toEqual({ id: "555", name: "Ana" });
});

it("encuentra un grupo donde escribieron el código suelto, sin importar mayúsculas", () => {
  const updates = [msg("brsyabc123abc123", { id: -100987, title: "Cocina" })];
  expect(findChatInUpdates(updates, "BRSYABC123ABC123")).toEqual({ id: "-100987", name: "Cocina" });
});

it("no confunde códigos de otros restaurantes ni textos parecidos", () => {
  const updates = [msg("/start BRSYOTRO00000000", { id: 9 }), msg("mi código es BRSYABC123ABC1234", { id: 10 })];
  expect(findChatInUpdates(updates, "BRSYABC123ABC123")).toBeNull();
});
