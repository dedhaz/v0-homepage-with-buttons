import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export const metadata = {
  title: "Войти - Склад 13",
  description: "Войдите в свой аккаунт Склад 13",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-base font-bold text-primary-foreground">13</span>
          </div>
          <span className="text-lg font-bold font-display tracking-tight text-foreground">
            Склад 13
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <LoginForm />
      </main>
    </div>
  )
}
