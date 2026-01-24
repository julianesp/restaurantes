import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurante Munay
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Inicia sesión para dejar tu reseña o acceder al panel administrativo
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl",
              formButtonPrimary:
                "bg-primary-500 hover:bg-primary-600 text-sm normal-case",
              socialButtonsBlockButton:
                "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700",
              socialButtonsBlockButtonText: "font-medium",
              formFieldInput:
                "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600",
              footerActionLink: "text-primary-500 hover:text-primary-600",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
