"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyRegistrationCode } from "@/lib/auth-storage"

export function RegisterVerificationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams])
  const [code, setCode] = useState("")
  const [demoCode, setDemoCode] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setDemoCode(window.sessionStorage.getItem("last_verification_code"))
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("E-mail не найден. Вернитесь на страницу регистрации.")
      return
    }

    setIsSubmitting(true)
    const result = await verifyRegistrationCode({ email, code: code.trim() })

    if (!result.ok) {
      setError(result.error ?? "Не удалось подтвердить код.")
      setSuccess("")
      setIsSubmitting(false)
      return
    }

    setError("")
    window.sessionStorage.removeItem("last_verification_code")
    setSuccess(`Аккаунт создан. Ваш ID: ${result.user?.id}. Роль: обычный пользователь.`)

    setTimeout(() => {
      router.push("/login")
    }, 1500)
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="mb-3 text-center font-display text-2xl font-bold text-foreground">
          Подтверждение e-mail
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Введите код из письма для завершения регистрации.
        </p>
        {demoCode && (
          <p className="mb-4 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
            Демо-режим: код подтверждения {demoCode}
          </p>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verifyEmail">E-mail</Label>
            <Input id="verifyEmail" value={email} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verificationCode">Код подтверждения</Label>
            <Input
              id="verificationCode"
              inputMode="numeric"
              placeholder="Введите 6-значный код"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          {success && <p className="rounded-md bg-green-600/10 px-3 py-2 text-sm text-green-700">{success}</p>}

          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={code.trim().length === 0 || isSubmitting}>
              {isSubmitting ? "Проверка..." : "Подтвердить и создать аккаунт"}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/register">Вернуться к регистрации</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
