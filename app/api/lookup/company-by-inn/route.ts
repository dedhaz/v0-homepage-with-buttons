import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/api-auth"

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/(^|\s|-)([a-zа-яё])/giu, (_m, sep: string, ch: string) => `${sep}${ch.toUpperCase()}`)
}

function initialsFromFio(fio: string) {
  const parts = fio.split(/\s+/).filter(Boolean)
  if (parts.length < 2) return toTitleCase(fio)
  const [lastName, firstName, middleName] = parts
  const fi = firstName ? `${firstName[0].toUpperCase()}.` : ""
  const mi = middleName ? `${middleName[0].toUpperCase()}.` : ""
  return `${toTitleCase(lastName)} ${fi}${mi}`.trim()
}

function normalizeCompanyName(raw: string) {
  const normalized = raw.replace(/\s+/g, " ").trim()
  if (!normalized) return ""

  const ipMatch = normalized.match(/(?:индивидуальный\s+предприниматель|ип)\s+(.+)$/i)
  if (ipMatch?.[1]) {
    return `ИП ${initialsFromFio(ipMatch[1].replace(/["']/g, "").trim())}`
  }

  if (/^[А-ЯЁ\s]+$/.test(normalized) && normalized.split(/\s+/).length >= 2) {
    return `ИП ${initialsFromFio(normalized)}`
  }

  return normalized
}

function parseAddress(addressRaw: string) {
  const normalized = addressRaw.replace(/\s+/g, " ").trim()
  const parts = normalized.split(",").map((item) => item.trim()).filter(Boolean)

  const index = normalized.match(/\b\d{6}\b/)?.[0] ?? ""
  const region = parts.find((p) => /обл\.|область|край|респ\.|республика|АО|округ|г\.\s*москва|г\.\s*санкт-петербург/i.test(p)) ?? ""
  const city = parts.find((p) => /^(г\.?|гор\.?|город|п\.?|пос\.?|поселок|с\.?|дер\.?|д\.?\s*\w+)/i.test(p)) ?? ""
  const street = parts.find((p) => /ул\.|улица|пр-кт|проспект|пер\.|переулок|наб\.|ш\.|шоссе|б-р|бульвар/i.test(p)) ?? ""
  const house = parts.find((p) => /(^|\s)(д\.?|дом|вл\.?|строен|корп\.?)/i.test(p)) ?? ""

  return {
    index,
    region,
    city: city.replace(/^(г\.?|город)\s*/i, "").trim(),
    street,
    house,
  }
}

function pickString(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== "object") return ""
  const map = obj as Record<string, unknown>
  for (const key of keys) {
    const direct = map[key]
    if (typeof direct === "string" && direct.trim()) return direct.trim()
  }
  for (const value of Object.values(map)) {
    if (value && typeof value === "object") {
      const nested = pickString(value, keys)
      if (nested) return nested
    }
  }
  return ""
}

function getAddressRaw(row: Record<string, unknown>) {
  const fromRow = pickString(row, ["a", "adr", "address", "address_full"])
  if (fromRow) return fromRow

  const fromAddressObj = pickString(row.a, ["a", "c", "text", "full"])
  return fromAddressObj
}

function detectType(inn: string, rawName: string) {
  if (inn.length === 12) return "ИП"
  if (/(?:индивидуальный\s+предприниматель|\bип\b)/i.test(rawName)) return "ИП"
  return "ООО"
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
    | { rows?: Array<Record<string, unknown> & { n?: string; c?: string; o?: string; p?: string; k?: string }> }
    | null

  const row = resultData?.rows?.[0]
  if (!row) {
    return NextResponse.json({ ok: false, error: "Компания не найдена" }, { status: 404 })
  }

  const rawName = row.n?.trim() || row.c?.trim() || ""
  const addressRaw = getAddressRaw(row)
  const type = detectType(inn, rawName)

  return NextResponse.json({
    ok: true,
    company: {
      type,
      ogrn: row.o?.trim() ?? "",
      kpp: type === "ООО" ? (row.p?.trim() || row.k?.trim() || pickString(row, ["kpp", "КПП"])) : "",
      companyName: normalizeCompanyName(rawName),
      addressRaw,
      address: parseAddress(addressRaw),
    },
  })
}
