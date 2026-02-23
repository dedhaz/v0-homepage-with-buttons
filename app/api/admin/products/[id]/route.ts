import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/api-auth"
import { deleteAdminRecord, updateAdminRecord } from "@/lib/server/admin-storage"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  if (auth.user?.role === "user") {
    return NextResponse.json({ ok: false, error: "Нет доступа." }, { status: 403 })
  }

  const { id } = await params
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ ok: false, error: "Некорректный id." }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 })
  }

  await updateAdminRecord("products", numericId, body as Record<string, unknown>)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  if (auth.user?.role === "user") {
    return NextResponse.json({ ok: false, error: "Нет доступа." }, { status: 403 })
  }

  const { id } = await params
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ ok: false, error: "Некорректный id." }, { status: 400 })
  }

  await deleteAdminRecord("products", numericId)
  return NextResponse.json({ ok: true })
}
