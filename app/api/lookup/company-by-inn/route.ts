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

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/(^|\s|-)([a-zа-яё])/giu, (_m, sep: string, ch: string) => `${sep}${ch.toUpperCase()}`)
}

function normalizeCompanyName(raw: string) {
  const normalized = raw.replace(/\s+/g, " ").trim()
  if (!normalized) return ""

  const ipMatch = normalized.match(/(?:индивидуальный\s+предприниматель|ип)\s+(.+)$/i)
  if (ipMatch?.[1]) {
    return `ИП ${toTitleCase(ipMatch[1].replace(/["']/g, "").trim())}`
  }

  return normalized
}

function getAddressRaw(row: Record<string, unknown>) {
  const direct = typeof row.a === "string" ? row.a : ""
  if (direct.trim()) return direct.trim()

  const addr = row.a as Record<string, unknown> | undefined
  if (addr && typeof addr === "object") {
    const text = typeof addr.a === "string" ? addr.a : typeof addr.c === "string" ? addr.c : ""
    if (text.trim()) return text.trim()
  }

  const alt = [row.adr, row.address, row.address_full].find((v) => typeof v === "string")
  return typeof alt === "string" ? alt.trim() : ""
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
    | { rows?: Array<Record<string, unknown> & { n?: string; c?: string; o?: string }> }
    | null

  const row = resultData?.rows?.[0]
  if (!row) {
    return NextResponse.json({ ok: false, error: "Компания не найдена" }, { status: 404 })
  }

  const addressRaw = getAddressRaw(row)

  return NextResponse.json({
    ok: true,
    company: {
      ogrn: row.o?.trim() ?? "",
      companyName: normalizeCompanyName(row.n?.trim() || row.c?.trim() || ""),
      addressRaw,
      address: parseAddress(addressRaw),
    },
  })
}
