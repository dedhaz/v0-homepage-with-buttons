import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RegisterVerificationForm } from "@/components/register-verification-form"
import { Suspense } from "react"

export const metadata = {
  title: "Подтверждение регистрации — Склад 13",
  description: "Подтвердите e-mail кодом из письма, чтобы завершить регистрацию.",
}

export default function RegisterVerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Suspense fallback={<div>Загрузка…</div>}>
          <RegisterVerificationForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
