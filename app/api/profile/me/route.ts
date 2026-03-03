import { NextResponse } from "next/server"
import { getCurrentUser, updateMyProfile } from "@/lib/server/auth-service"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Требуется авторизация." }, { status: 401 })
  }

  return NextResponse.json({ ok: true, user })
}

export async function PUT(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Требуется авторизация." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 })
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""

  if (!fullName || !email) {
    return NextResponse.json({ ok: false, error: "Заполните ФИО и e-mail." }, { status: 400 })
  }

  await updateMyProfile({ id: user.id, fullName, email })
  return NextResponse.json({ ok: true })
}
