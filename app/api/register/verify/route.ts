import { NextResponse } from "next/server"
import { verifyRegistrationCode } from "@/lib/server/auth-store"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const code = typeof body.code === "string" ? body.code.trim() : ""

  if (!email || !code) {
    return NextResponse.json({ ok: false, error: "Укажите e-mail и код." }, { status: 400 })
  }

  const result = verifyRegistrationCode({ email, code })

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}
