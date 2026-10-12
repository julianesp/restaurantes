import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-primary-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurante
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Crea tu cuenta para dejar reseñas y comentarios
          </p>
        </div>
        <SignUp
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
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}
