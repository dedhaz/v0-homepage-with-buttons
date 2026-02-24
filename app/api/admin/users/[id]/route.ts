import { NextResponse } from "next/server"
import { getCurrentUser, updateUserById, type UserRole } from "@/lib/server/auth-service"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ ok: false, error: "Требуется авторизация." }, { status: 401 })
  }

  const { id } = await params
  const userId = Number(id)

  if (!Number.isFinite(userId)) {
    return NextResponse.json({ ok: false, error: "Некорректный id." }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 })
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : ""
  const role = body.role === "admin" || body.role === "manager" || body.role === "user" ? body.role : null

  if (!fullName || !role) {
    return NextResponse.json({ ok: false, error: "Укажите ФИО и роль." }, { status: 400 })
  }

  if (currentUser.role === "user") {
    return NextResponse.json({ ok: false, error: "Нет доступа." }, { status: 403 })
  }

  if (currentUser.role === "manager" && role !== "user") {
    return NextResponse.json({ ok: false, error: "Менеджер не может назначать роли выше user." }, { status: 403 })
  }

  await updateUserById({ id: userId, fullName, role: role as UserRole })
  return NextResponse.json({ ok: true })
}
