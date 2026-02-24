import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/api-auth"
import { createAdminRecord, listAdminRecords } from "@/lib/server/admin-storage"

export async function GET() {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  if (auth.user?.role === "user") {
    return NextResponse.json({ ok: false, error: "Нет доступа." }, { status: 403 })
  }

  const items = await listAdminRecords("deals")
  return NextResponse.json({ ok: true, items })
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  if (auth.user?.role === "user") {
    return NextResponse.json({ ok: false, error: "Нет доступа." }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 })
  }

  const id = await createAdminRecord("deals", body as Record<string, unknown>)
  return NextResponse.json({ ok: true, id })
}
