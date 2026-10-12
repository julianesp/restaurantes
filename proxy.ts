import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  parseHost,
  TENANT_SLUG_HEADER,
  TENANT_HOST_HEADER,
} from "@/lib/tenant-host";

// Rutas completamente públicas (sin Clerk) - cron jobs
const isCronRoute = createRouteMatcher([
  '/api/cron/(.*)',
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/plataforma(.*)", // Landing de la plataforma SaaS (dominio raíz)
  "/api/platform/slug-available", // Verificación de subdominio libre
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/menu(.*)",
  "/nosotros(.*)",
  "/blog(.*)",
  "/galeria(.*)",
  "/checkout(.*)",
  "/payment/(.*)",
  "/invoice(.*)",
  "/mesa/(.*)", // Páginas de pedidos por QR para mesas
  "/api/tenant", // Datos públicos del restaurante actual
  "/api/featured-dishes(.*)", // Platos destacados (lectura pública; las escrituras exigen admin en la ruta)
  "/media/(.*)", // Imágenes públicas de los restaurantes (R2)
  "/api/epayco/(.*)",
  "/api/menu/(.*)",
  "/api/orders/(.*)",
  "/api/weekly-dishes(.*)",
  "/api/suggestions(.*)", // Buzón de sugerencias
  "/api/daily-specials(.*)", // Platos del día (lectura pública para el modal)
  "/api/permanent-dishes(.*)", // Platos permanentes (lectura pública para el modal)
  "/mesero(.*)", // Panel del mesero (protegido por PIN propio)
  "/api/waiters/verify", // Verificación de PIN de mesero
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isApiAdminRoute = createRouteMatcher([
  "/api/menu/categories(.*)",
  "/api/menu/items(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Bypass Clerk completamente para rutas de cron
  if (isCronRoute(req)) {
    return NextResponse.next();
  }

  // --- Resolución del restaurante (tenant) por host --------------------------
  // Se descartan SIEMPRE las cabeceras x-tenant-* que envíe el cliente para que
  // nadie pueda suplantar a otro restaurante; solo valen las calculadas aquí.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete(TENANT_SLUG_HEADER);
  requestHeaders.delete(TENANT_HOST_HEADER);

  const host = parseHost(req.headers.get("host"));
  if (host.kind === "tenant") requestHeaders.set(TENANT_SLUG_HEADER, host.slug);
  if (host.kind === "custom") requestHeaders.set(TENANT_HOST_HEADER, host.host);

  const forward = () => NextResponse.next({ request: { headers: requestHeaders } });

  // Dominio raíz de la plataforma: la portada es la landing del SaaS
  if (host.kind === "platform" && req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/plataforma";
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // Permitir rutas públicas sin ninguna protección
  if (isPublicRoute(req)) {
    return forward();
  }

  const { userId } = await auth();

  // Proteger rutas de admin
  if (isAdminRoute(req)) {
    if (!userId) {
      // Redirigir a sign-in si no está autenticado
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    // Usuario autenticado; la pertenencia al restaurante se verifica en app/admin/layout.tsx
    return forward();
  }

  // Proteger API routes de escritura del menú (POST, PUT, DELETE)
  // Las lecturas (GET) son públicas
  if (isApiAdminRoute(req) && req.method !== "GET") {
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    // Usuario autenticado, la verificación de admin se hace en cada ruta
    return forward();
  }

  // Para todas las demás rutas, requerir autenticación
  await auth.protect();
  return forward();
});

export const config = {
  matcher: [
    // Todo salvo internos de Next y archivos estáticos (cualquier ruta con extensión).
    // Patrón simple: vinext rechaza el matcher largo recomendado por Clerk.
    "/((?!_next|.*\\..*).*)",
    // Siempre ejecutar para rutas de API
    "/(api|trpc)(.*)",
  ],
};
