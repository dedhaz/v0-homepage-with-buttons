import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RegisterVerificationForm } from "@/components/register-verification-form"

export const metadata = {
  title: "Подтверждение регистрации — Склад 13",
  description: "Подтверждение e-mail для завершения регистрации",
}

export default function RegisterVerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <RegisterVerificationForm />
      </main>
      <Footer />
    </div>
  )
}
