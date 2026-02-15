"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [termsChecked, setTermsChecked] = useState(false)

  const passwordsMatch = form.password === form.confirmPassword
  const allFieldsFilled =
    form.email.trim() !== "" &&
    form.password.trim() !== "" &&
    form.confirmPassword.trim() !== "" &&
    form.fullName.trim() !== ""
  const canSubmit =
    allFieldsFilled && passwordsMatch && consentChecked && privacyChecked && termsChecked

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    // Registration logic here
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
          Регистрация
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Повтор пароля</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Повторите пароль"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-destructive">Пароли не совпадают</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">ФИО</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-primary"
              />
              <span className="text-sm text-muted-foreground leading-relaxed">
                {"Я даю согласие ООО \u00ABЛонган Трейд\u00BB на обработку моих персональных данных на условиях, изложенных в "}
                <Link href="/consent" className="text-foreground underline underline-offset-2 hover:text-primary">
                  Согласии на обработку персональных данных
                </Link>
                .
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-primary"
              />
              <span className="text-sm text-muted-foreground leading-relaxed">
                {"Я ознакомлен(а) с "}
                <Link href="/privacy" className="text-foreground underline underline-offset-2 hover:text-primary">
                  Политикой конфиденциальности
                </Link>
                .
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-primary"
              />
              <span className="text-sm text-muted-foreground leading-relaxed">
                {"Я принимаю условия "}
                <Link href="/terms" className="text-foreground underline underline-offset-2 hover:text-primary">
                  Пользовательского соглашения
                </Link>
                .
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
              Зарегистрироваться
            </Button>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/login">У меня уже есть аккаунт</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
