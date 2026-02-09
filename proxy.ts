import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rutas completamente públicas (sin Clerk) - cron jobs
const isCronRoute = createRouteMatcher([
  '/api/cron/(.*)',
]);

const isPublicRoute = createRouteMatcher([
  "/",
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
  "/api/epayco/(.*)",
  "/api/menu/(.*)",
  "/api/orders/(.*)",
  "/api/statistics(.*)",
  "/api/weekly-dishes(.*)",
  "/api/suggestions(.*)", // Buzón de sugerencias
  "/api/test-supabase", // Ruta de prueba de Supabase
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

  // Permitir rutas públicas sin ninguna protección
  if (isPublicRoute(req)) {
    return NextResponse.next();
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
    // Usuario autenticado, continuar
    return NextResponse.next();
  }

  // Proteger API routes de escritura del menú (POST, PUT, DELETE)
  // Las lecturas (GET) son públicas
  if (isApiAdminRoute(req) && req.method !== "GET") {
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    // Usuario autenticado, la verificación de admin se hace en cada ruta
    return NextResponse.next();
  }

  // Para todas las demás rutas, requerir autenticación
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
