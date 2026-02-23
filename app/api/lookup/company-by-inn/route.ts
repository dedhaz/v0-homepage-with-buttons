import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/api-auth"

function parseAddress(addressRaw: string) {
  const indexMatch = addressRaw.match(/\b\d{6}\b/)
  const cityMatch = addressRaw.match(/\bг\.?\s*([^,]+)/i)
  const streetMatch = addressRaw.match(/\b(ул\.?\s*[^,]+)/i)
  const houseMatch = addressRaw.match(/\bд\.?\s*([^,]+)/i)

  return {
    index: indexMatch?.[0] ?? "",
    city: cityMatch?.[1]?.trim() ?? "",
    street: streetMatch?.[1]?.trim() ?? "",
    house: houseMatch?.[1]?.trim() ?? "",
    region: addressRaw,
  }
}

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  const { searchParams } = new URL(request.url)
  const inn = searchParams.get("inn")?.trim() ?? ""

  if (!/^\d{10}(\d{2})?$/.test(inn)) {
    return NextResponse.json({ ok: false, error: "Некорректный ИНН" }, { status: 400 })
  }

  const tokenResponse = await fetch("https://egrul.nalog.ru", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: new URLSearchParams({ query: inn }).toString(),
    cache: "no-store",
  }).catch(() => null)

  if (!tokenResponse?.ok) {
    return NextResponse.json({ ok: false, error: "Сервис ФНС недоступен" }, { status: 502 })
  }

  const tokenData = (await tokenResponse.json().catch(() => null)) as { t?: string } | null
  const token = tokenData?.t
  if (!token) {
    return NextResponse.json({ ok: false, error: "ФНС не вернула токен поиска" }, { status: 502 })
  }

  const resultResponse = await fetch(`https://egrul.nalog.ru/search-result/${token}`, {
    method: "GET",
    cache: "no-store",
  }).catch(() => null)

  if (!resultResponse?.ok) {
    return NextResponse.json({ ok: false, error: "Не удалось получить данные ФНС" }, { status: 502 })
  }

  const resultData = (await resultResponse.json().catch(() => null)) as
    | { rows?: Array<{ n?: string; c?: string; o?: string; a?: string }> }
    | null

  const row = resultData?.rows?.[0]
  if (!row) {
    return NextResponse.json({ ok: false, error: "Компания не найдена" }, { status: 404 })
  }

  const addressRaw = row.a?.trim() ?? ""

  return NextResponse.json({
    ok: true,
    company: {
      ogrn: row.o?.trim() ?? "",
      companyName: row.n?.trim() || row.c?.trim() || "",
      addressRaw,
      address: parseAddress(addressRaw),
    },
  })
}
