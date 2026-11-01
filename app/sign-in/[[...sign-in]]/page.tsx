import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { getTenant, isPlatformAdmin, isPlatformHost } from "@/lib/tenant";
import SignOutButton from "@/components/SignOutButton";

/** Solo rutas del mismo sitio: de una URL absoluta (la pone proxy.ts) se conserva la ruta. */
function safeRedirect(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return "/";
  try {
    const url = new URL(value, "http://x");
    return `${url.pathname}${url.search}` || "/";
  } catch {
    return "/";
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const platform = await isPlatformHost();
  // Nombre del restaurante actual (en el dominio raíz no hay restaurante: se muestra la plataforma)
  const name = platform ? "Brasaya" : (await getTenant())?.name ?? "Brasaya";
  const redirectTo = safeRedirect((await searchParams).redirect_url);

  // Con una sesión ya abierta, <SignIn/> no se muestra: Clerk redirige solo y no deja cambiar de
  // cuenta. Se muestra la cuenta actual con la opción de continuar o entrar con otra.
  const user = await currentUser();
  if (user) {
    const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
    const noPanelAccess = redirectTo.startsWith("/panel") && !(await isPlatformAdmin());
    const here = `/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{name}</h1>
          <p className="text-gray-600 dark:text-gray-300">Ya inició sesión como</p>
          <p className="mt-1 break-all font-semibold text-gray-900 dark:text-white">{email}</p>
          {noPanelAccess && (
            <p className="mt-4 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              Esta cuenta no tiene acceso al panel de la plataforma. Entre con la cuenta de administrador.
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            {!noPanelAccess && (
              <Link
                href={redirectTo}
                className="btn-press rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white hover:bg-primary-700"
              >
                Continuar
              </Link>
            )}
            <SignOutButton
              label="Usar otra cuenta"
              redirectUrl={here}
              className="justify-center rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {platform
              ? "Inicie sesión para administrar su restaurante o la plataforma"
              : "Inicia sesión para dejar tu reseña o acceder al panel administrativo"}
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl",
              formButtonPrimary:
                "bg-primary-600 hover:bg-primary-700 text-sm normal-case",
              socialButtonsBlockButton:
                "bg-white border-gray-300 text-gray-900 hover:bg-gray-50",
              socialButtonsBlockButtonText: "font-medium",
              formFieldInput:
                "bg-white border-gray-300",
              footerActionLink: "text-primary-500 hover:text-primary-600",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}
