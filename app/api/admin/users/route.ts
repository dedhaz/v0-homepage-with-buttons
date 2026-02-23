import { NextResponse } from "next/server"
import { createUser, getCurrentUser, listUsers, type UserRole } from "@/lib/server/auth-service"

export async function GET() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ ok: false, error: "Требуется авторизация." }, { status: 401 })
  }

  if (currentUser.role !== "admin" && currentUser.role !== "manager") {
    return NextResponse.json({ ok: false, error: "Нет доступа." }, { status: 403 })
  }

  const users = await listUsers()
  return NextResponse.json({ ok: true, users })
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ ok: false, error: "Требуется авторизация." }, { status: 401 })
  }

  if (currentUser.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Нет доступа." }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const role = body.role === "admin" || body.role === "manager" || body.role === "user" ? body.role : "user"

  if (!email || !fullName || password.length < 8) {
    return NextResponse.json({ ok: false, error: "Заполните корректно e-mail, ФИО и пароль (от 8 символов)." }, { status: 400 })
  }

  const result = await createUser({ email, fullName, password, role: role as UserRole })
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}
