import PlatformShell from "@/components/platform/PlatformShell";
import { requirePlatformAdmin } from "@/lib/platform-stats";

export const metadata = { title: "Panel de Brasaya" };
export const dynamic = "force-dynamic";

// Administración de la plataforma: solo ADMIN_EMAILS. Cada página vuelve a comprobarlo.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePlatformAdmin();
  return <PlatformShell email={user.emailAddresses[0]?.emailAddress ?? ""}>{children}</PlatformShell>;
}
