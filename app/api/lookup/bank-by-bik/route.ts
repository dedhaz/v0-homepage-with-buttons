import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/api-auth"

function decodeXmlBuffer(buffer: ArrayBuffer) {
  const utf8 = new TextDecoder("utf-8").decode(buffer)
  if (!utf8.includes("���") && !utf8.includes("�")) return utf8

  try {
    const cp1251 = new TextDecoder("windows-1251").decode(buffer)
    return cp1251
  } catch {
    return utf8
  }
}

function xmlValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))
  return match?.[1]?.trim() ?? ""
}

function xmlAttrValue(xml: string, attr: string) {
  const match = xml.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i"))
  return match?.[1]?.trim() ?? ""
}

function xmlNestedAttrValue(xml: string, tag: string, attr: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}\\s*=\\s*["']([^"']+)["'][^>]*>`, "i"))
  return match?.[1]?.trim() ?? ""
}

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response

  const { searchParams } = new URL(request.url)
  const bik = searchParams.get("bik")?.trim() ?? ""

  if (!/^\d{9}$/.test(bik)) {
    return NextResponse.json({ ok: false, error: "Некорректный БИК" }, { status: 400 })
  }

  const response = await fetch(`https://www.cbr.ru/scripts/XML_bic.asp?bic=${bik}`, {
    method: "GET",
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0" },
  }).catch(() => null)

  if (!response?.ok) {
    return NextResponse.json({ ok: false, error: "Сервис ЦБ недоступен" }, { status: 502 })
  }

  const xmlBuffer = await response.arrayBuffer().catch(() => null)
  const xml = xmlBuffer ? decodeXmlBuffer(xmlBuffer) : ""

  const bankName =
    xmlNestedAttrValue(xml, "ParticipantInfo", "NameP") ||
    xmlAttrValue(xml, "NameP") ||
    xmlNestedAttrValue(xml, "ParticipantInfo", "ShortName") ||
    xmlAttrValue(xml, "ShortName") ||
    xmlValue(xml, "NameP") ||
    xmlValue(xml, "SHORTNAME") ||
    xmlValue(xml, "VKEY") ||
    xmlValue(xml, "NAMEP")

  const ksRaw =
    xmlNestedAttrValue(xml, "Accounts", "Account") ||
    xmlNestedAttrValue(xml, "Accounts", "Ksnp") ||
    xmlAttrValue(xml, "Account") ||
    xmlAttrValue(xml, "Ksnp") ||
    xmlValue(xml, "KSNP") ||
    xmlValue(xml, "Account")

  const ks = ksRaw.replace(/[^\d]/g, "")

  if (!bankName && !ks) {
    return NextResponse.json({ ok: false, error: "Банк по БИК не найден" }, { status: 404 })
  }

  return NextResponse.json({ ok: true, bank: { bankName, ks } })
}
