import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/server/auth-service"

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    return { user: null, response: NextResponse.json({ ok: false, error: "Требуется авторизация." }, { status: 401 }) }
  }

  return { user, response: null }
}
