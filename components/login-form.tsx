"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const allFieldsFilled = form.email.trim() !== "" && form.password.trim() !== ""
  const canSubmit = allFieldsFilled && confirmed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    // Login logic here
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
          Войти
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-primary"
              />
              <span className="text-sm text-muted-foreground leading-relaxed">
                Подтвердить действия на странице
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
              Войти
            </Button>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/register">Зарегистрироваться</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
