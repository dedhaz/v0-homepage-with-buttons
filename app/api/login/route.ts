import { NextResponse } from "next/server"
import { loginWithPassword } from "@/lib/server/auth-service"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Укажите e-mail и пароль." }, { status: 400 })
  }

  const result = await loginWithPassword({ email, password })

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}
