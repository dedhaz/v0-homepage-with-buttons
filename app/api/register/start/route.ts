import { NextResponse } from "next/server"
import { startRegistration } from "@/lib/server/auth-service"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { ok: false, error: "Заполните e-mail, пароль и имя." },
      { status: 400 },
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Пароль должен быть не короче 8 символов." },
      { status: 400 },
    )
  }

  const result = await startRegistration({ email, password, fullName })

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}
