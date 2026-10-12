import { NextResponse } from "next/server";
import { getTenant, getTenantRole, isTenantServing } from "@/lib/tenant";

// GET /api/tenant — datos públicos del restaurante actual y si el usuario lo administra
export async function GET() {
  const tenant = await getTenant();
  if (!tenant || !isTenantServing(tenant)) {
    return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
  }

  const membership = await getTenantRole(tenant);

  return NextResponse.json({
    name: tenant.name,
    slug: tenant.slug,
    settings: {
      tagline: tenant.settings?.tagline ?? null,
      city: tenant.settings?.city ?? null,
      phone: tenant.settings?.phone ?? null,
      logo_url: tenant.settings?.logo_url ?? null,
      primary_color: tenant.settings?.primary_color ?? null,
    },
    isAdmin: !!membership,
  });
}
