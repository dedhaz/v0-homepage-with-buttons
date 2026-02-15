import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RegisterForm } from "@/components/register-form"

export const metadata = {
  title: "Регистрация — Склад 13",
  description: "Создайте аккаунт в Склад 13 для доступа к услугам доставки из Китая.",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  )
}
