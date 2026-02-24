import { NextResponse } from "next/server"
import { logout } from "@/lib/server/auth-service"

export async function POST() {
  await logout()
  return NextResponse.json({ ok: true })
}
