"use client"

import { useState, useMemo, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import {
  ArrowLeft, Plus, Trash2, Upload, ChevronDown, ChevronUp, Download,
} from "lucide-react"
import type {
  Currency, DealItem, DeliveryMethod, Incoterms, ImporterType, DeclarantType,
} from "@/lib/deal-types"
import { CURRENCY_SYMBOLS, permitDocLabels } from "@/lib/deal-types"
import { calcDeal, fmtNum, toRub } from "@/lib/deal-calc"
import { exportDealToExcel } from "@/lib/deal-export"

interface ClientOption { companyName?: string }
interface SupplierOption { nameRu?: string; nameEn?: string; nameZh?: string }
interface ProductOption {
  id: number
  article?: string
  nameRu?: string
  photo?: string
  tnved?: string
  priceSale?: string | number
  currencySale?: Currency
  dutyPercent?: string | number
  vatPercent?: string | number
  excise?: string | number
  antiDumping?: string | number
  dimUnit?: { length?: string; width?: string; height?: string }
  weightBruttoUnit?: string | number
  dimPackage?: { length?: string; width?: string; height?: string }
  weightBruttoPackage?: string | number
  qtyInPackage?: string | number
}

/* ===== helpers ===== */
function genTempId() { return Math.random().toString(36).slice(2, 10) }

function parseNumberish(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const normalized = value.replace(/\s+/g, "").replace(",", ".")
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function emptyDealItem(): DealItem {
  return {
    tempId: genTempId(), productId: null, article: "", nameRu: "", photo: "", tnved: "",
    description: "", priceSale: 0, priceCurrency: "CNY", quantity: 1,
    dutyPercent: 0, vatPercent: 22, excise: 0, antiDumping: 0,
    dimUnitL: 0, dimUnitW: 0, dimUnitH: 0, weightBruttoUnit: 0,
    dimPackageL: 0, dimPackageW: 0, dimPackageH: 0, weightBruttoPackage: 0, qtyInPackage: 0,
  }
}

function itemFromProduct(cp: ProductOption): DealItem {
  return {
    tempId: genTempId(),
    productId: cp.id,
    article: cp.article || "",
    nameRu: cp.nameRu || "",
    photo: cp.photo || "",
    tnved: cp.tnved || "",
    description: "",
    priceSale: parseNumberish(cp.priceSale),
    priceCurrency: cp.currencySale || "CNY",
    quantity: 1,
    dutyPercent: parseNumberish(cp.dutyPercent),
    vatPercent: parseNumberish(cp.vatPercent) || 22,
    excise: parseNumberish(cp.excise),
    antiDumping: parseNumberish(cp.antiDumping),
    dimUnitL: parseNumberish(cp.dimUnit?.length),
    dimUnitW: parseNumberish(cp.dimUnit?.width),
    dimUnitH: parseNumberish(cp.dimUnit?.height),
    weightBruttoUnit: parseNumberish(cp.weightBruttoUnit),
    dimPackageL: parseNumberish(cp.dimPackage?.length),
    dimPackageW: parseNumberish(cp.dimPackage?.width),
    dimPackageH: parseNumberish(cp.dimPackage?.height),
    weightBruttoPackage: parseNumberish(cp.weightBruttoPackage),
    qtyInPackage: parseNumberish(cp.qtyInPackage),
  }
}

/* ===== Currency select ===== */
function CurrencySelect({ value, onChange }: { value: Currency; onChange: (v: Currency) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Currency)}
      className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <option value="CNY">CNY</option>
      <option value="USD">USD</option>
      <option value="RUB">RUB</option>
    </select>
  )
}

/* ===== Autocomplete ===== */
function AutoSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  useEffect(() => { setQuery(value) }, [value])
  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-40 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
          {filtered.map((o) => (
            <li key={o}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                onMouseDown={() => { onChange(o); setQuery(o); setOpen(false) }}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ================================================================ */
/*                         MAIN PAGE                                */
/* ================================================================ */
export default function DealFormPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Загрузка...</div>}>
      <DealFormPage />
    </Suspense>
  )
}

function DealFormPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const isNew = params.id === "new"
  const clientFromUrl = searchParams.get("client") || ""

  /* --- rates --- */
  const [rateUsd, setRateUsd] = useState("88.50")
  const [rateCny, setRateCny] = useState("12.20")
  const [cbUsd, setCbUsd] = useState(88.5)
  const [cbCny, setCbCny] = useState(12.2)

  /* --- main form state --- */
  const [dealNumber, setDealNumber] = useState(isNew ? "" : "")
  const [clientName, setClientName] = useState(clientFromUrl)
  const [supplierName, setSupplierName] = useState("")
  const [cityFrom, setCityFrom] = useState("")
  const [cityTo, setCityTo] = useState("")
  const [items, setItems] = useState<DealItem[]>([])
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("auto")
  const [deliveryCostTotal, setDeliveryCostTotal] = useState("")
  const [deliveryCostCurrency, setDeliveryCostCurrency] = useState<Currency>("USD")
  const [deliveryCostBorder, setDeliveryCostBorder] = useState("")
  const [deliveryCostBorderCurrency, setDeliveryCostBorderCurrency] = useState<Currency>("USD")
  const [deliveryCostRussia, setDeliveryCostRussia] = useState("")
  const [deliveryCostRussiaCurrency, setDeliveryCostRussiaCurrency] = useState<Currency>("RUB")
  const [incoterms, setIncoterms] = useState<Incoterms>("EXW")
  const [deliveryChinaLocal, setDeliveryChinaLocal] = useState("")
  const [deliveryChinaLocalCurrency, setDeliveryChinaLocalCurrency] = useState<Currency>("CNY")
  const [deliveryRussiaLocal, setDeliveryRussiaLocal] = useState("")
  const [deliveryRussiaLocalCurrency, setDeliveryRussiaLocalCurrency] = useState<Currency>("RUB")
  const [importer, setImporter] = useState<ImporterType>("client")
  const [hasPermitDocs, setHasPermitDocs] = useState(false)
  const [commissionPercent, setCommissionPercent] = useState("")
  const [declarant, setDeclarant] = useState<DeclarantType>("our")
  const [customsCostManual, setCustomsCostManual] = useState("")
  const [commissionImporterUsd, setCommissionImporterUsd] = useState("")
  const [swiftUsd, setSwiftUsd] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<"draft" | "sent" | "approved" | "rejected">("draft")
  const [clientOptions, setClientOptions] = useState<string[]>([])
  const [supplierOptions, setSupplierOptions] = useState<string[]>([])
  const [catalogProducts, setCatalogProducts] = useState<ProductOption[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  /* --- item add sheet --- */
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [addMode, setAddMode] = useState<"catalog" | "manual">("catalog")
  const [quickProductQuery, setQuickProductQuery] = useState("")

  /* --- expand sections --- */
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    rates: true, client: true, items: true, delivery: true, customs: true, summary: true,
  })
  const toggle = (s: string) => setExpandedSections((prev) => ({ ...prev, [s]: !prev[s] }))

  useEffect(() => {
    fetch("https://www.cbr-xml-daily.ru/daily_json.js")
      .then((r) => r.json())
      .then((data) => {
        setCbUsd(data?.Valute?.USD?.Value ?? 88.5)
        setCbCny(data?.Valute?.CNY?.Value ?? 12.2)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      fetch("/api/admin/clients").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/suppliers").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/products").then((r) => r.json()).catch(() => null),
    ]).then(([clientsRes, suppliersRes, productsRes]) => {
      if (clientsRes?.ok && Array.isArray(clientsRes.items)) {
        setClientOptions(clientsRes.items.map((item: ClientOption & { internalName?: string }) => item.companyName || item.internalName || "").filter(Boolean))
      }
      if (suppliersRes?.ok && Array.isArray(suppliersRes.items)) {
        setSupplierOptions(
          suppliersRes.items
            .flatMap((item: SupplierOption) => [item.nameRu, item.nameEn, item.nameZh])
            .filter((name: string | undefined): name is string => Boolean(name))
        )
      }
      if (productsRes?.ok && Array.isArray(productsRes.items)) {
        setCatalogProducts(productsRes.items)
      }
    }).finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (isNew) return
    setIsLoading(true)
    fetch(`/api/admin/deals/${params.id}`)
      .then((response) => response.json())
      .then((result) => {
        if (!result?.ok || !result.item) return
        const deal = result.item
        setDealNumber(deal.number || "")
        setClientName(deal.clientName || "")
        setSupplierName(deal.supplierName || "")
        setCityFrom(deal.cityFrom || "")
        setCityTo(deal.cityTo || "")
        setItems(Array.isArray(deal.items) ? deal.items : [])
        setStatus(deal.status || "draft")
        setDeliveryMethod(deal.deliveryMethod || "auto")
        setDeliveryCostTotal(String(deal.deliveryCostTotal ?? ""))
        setDeliveryCostCurrency(deal.deliveryCostCurrency || "USD")
        setDeliveryCostBorder(String(deal.deliveryCostBorder ?? ""))
        setDeliveryCostBorderCurrency(deal.deliveryCostBorderCurrency || "USD")
        setDeliveryCostRussia(String(deal.deliveryCostRussia ?? ""))
        setDeliveryCostRussiaCurrency(deal.deliveryCostRussiaCurrency || "RUB")
        setIncoterms(deal.incoterms || "EXW")
        setDeliveryChinaLocal(String(deal.deliveryChinaLocal ?? ""))
        setDeliveryChinaLocalCurrency(deal.deliveryChinaLocalCurrency || "CNY")
        setDeliveryRussiaLocal(String(deal.deliveryRussiaLocal ?? ""))
        setDeliveryRussiaLocalCurrency(deal.deliveryRussiaLocalCurrency || "RUB")
        setImporter(deal.importer || "client")
        setHasPermitDocs(Boolean(deal.hasPermitDocs))
        setCommissionPercent(String(deal.commissionPercent ?? ""))
        setDeclarant(deal.declarant || "our")
        setCustomsCostManual(String(deal.customsCostManual ?? ""))
        setCommissionImporterUsd(String(deal.commissionImporterUsd ?? ""))
        setSwiftUsd(String(deal.swiftUsd ?? ""))
        setNotes(deal.notes || "")
        if (deal.rates) {
          setRateUsd(String(deal.rates.usd ?? 88.5))
          setRateCny(String(deal.rates.cny ?? 12.2))
          setCbUsd(Number(deal.rates.cbUsd ?? cbUsd))
          setCbCny(Number(deal.rates.cbCny ?? cbCny))
        }
      })
      .finally(() => setIsLoading(false))
  }, [isNew, params.id])

  /* --- calculation --- */
  const rates = useMemo(() => ({
    usd: parseFloat(rateUsd) || 88.5,
    cny: parseFloat(rateCny) || 12.2,
    cbUsd, cbCny,
  }), [rateUsd, rateCny, cbUsd, cbCny])

  const saveDraft = useCallback(async () => {
    setIsSaving(true)
    const payload = {
      number: dealNumber || `КП-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`,
      status,
      clientName,
      supplierName,
      cityFrom,
      cityTo,
      items,
      deliveryMethod,
      deliveryCostTotal: parseFloat(deliveryCostTotal) || 0,
      deliveryCostCurrency,
      deliveryCostBorder: parseFloat(deliveryCostBorder) || 0,
      deliveryCostBorderCurrency,
      deliveryCostRussia: parseFloat(deliveryCostRussia) || 0,
      deliveryCostRussiaCurrency,
      incoterms,
      deliveryChinaLocal: parseFloat(deliveryChinaLocal) || 0,
      deliveryChinaLocalCurrency,
      deliveryRussiaLocal: parseFloat(deliveryRussiaLocal) || 0,
      deliveryRussiaLocalCurrency,
      importer,
      hasPermitDocs,
      permitDocs: [],
      commissionPercent: parseFloat(commissionPercent) || 0,
      declarant,
      customsCostManual: parseFloat(customsCostManual) || 0,
      commissionImporterUsd: parseFloat(commissionImporterUsd) || 0,
      swiftUsd: parseFloat(swiftUsd) || 0,
      rates,
      notes,
    }

    const endpoint = isNew ? "/api/admin/deals" : `/api/admin/deals/${params.id}`
    const method = isNew ? "POST" : "PUT"
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const result = await response.json().catch(() => null)
    if (result?.ok) {
      if (isNew && result.id) {
        window.location.href = `/admin/deals/${result.id}`
        return
      }
      if (!dealNumber) setDealNumber(payload.number)
    } else {
      alert(result?.error || "Не удалось сохранить сделку")
    }
    setIsSaving(false)
  }, [isNew, params.id, dealNumber, status, clientName, supplierName, cityFrom, cityTo, items, deliveryMethod, deliveryCostTotal, deliveryCostCurrency, deliveryCostBorder, deliveryCostBorderCurrency, deliveryCostRussia, deliveryCostRussiaCurrency, incoterms, deliveryChinaLocal, deliveryChinaLocalCurrency, deliveryRussiaLocal, deliveryRussiaLocalCurrency, importer, hasPermitDocs, commissionPercent, declarant, customsCostManual, commissionImporterUsd, swiftUsd, rates, notes])

  const handleDeliveryBorderChange = useCallback((value: string) => {
    setDeliveryCostBorder(value)
    const total = parseNumberish(deliveryCostTotal)
    const border = parseNumberish(value)
    if (deliveryCostCurrency === deliveryCostBorderCurrency && deliveryCostBorderCurrency === deliveryCostRussiaCurrency && total > 0) {
      setDeliveryCostRussia(String(Math.max(total - border, 0)))
    }
  }, [deliveryCostTotal, deliveryCostCurrency, deliveryCostBorderCurrency, deliveryCostRussiaCurrency])

  const handleDeliveryRussiaChange = useCallback((value: string) => {
    setDeliveryCostRussia(value)
    const total = parseNumberish(deliveryCostTotal)
    const russia = parseNumberish(value)
    if (deliveryCostCurrency === deliveryCostBorderCurrency && deliveryCostBorderCurrency === deliveryCostRussiaCurrency && total > 0) {
      setDeliveryCostBorder(String(Math.max(total - russia, 0)))
    }
  }, [deliveryCostTotal, deliveryCostCurrency, deliveryCostBorderCurrency, deliveryCostRussiaCurrency])

  const dealForCalc = useMemo(() => ({
    id: 0, number: dealNumber, createdAt: "", status: "draft" as const,
    clientName, supplierName, cityFrom, cityTo, items,
    deliveryMethod,
    deliveryCostTotal: parseFloat(deliveryCostTotal) || 0,
    deliveryCostCurrency,
    deliveryCostBorder: parseFloat(deliveryCostBorder) || 0,
    deliveryCostBorderCurrency,
    deliveryCostRussia: parseFloat(deliveryCostRussia) || 0,
    deliveryCostRussiaCurrency,
    incoterms,
    deliveryChinaLocal: parseFloat(deliveryChinaLocal) || 0,
    deliveryChinaLocalCurrency,
    deliveryRussiaLocal: parseFloat(deliveryRussiaLocal) || 0,
    deliveryRussiaLocalCurrency,
    importer, hasPermitDocs, permitDocs: [],
    commissionPercent: parseFloat(commissionPercent) || 0,
    declarant,
    customsCostManual: parseFloat(customsCostManual) || 0,
    commissionImporterUsd: parseFloat(commissionImporterUsd) || 0,
    swiftUsd: parseFloat(swiftUsd) || 0,
    rates, notes,
  }), [dealNumber, clientName, supplierName, cityFrom, cityTo, items,
    deliveryMethod, deliveryCostTotal, deliveryCostCurrency,
    deliveryCostBorder, deliveryCostBorderCurrency,
    deliveryCostRussia, deliveryCostRussiaCurrency,
    incoterms, deliveryChinaLocal, deliveryChinaLocalCurrency,
    deliveryRussiaLocal, deliveryRussiaLocalCurrency,
    importer, hasPermitDocs, commissionPercent, declarant, customsCostManual,
    commissionImporterUsd, swiftUsd, rates, notes])

  const calc = useMemo(() => calcDeal(dealForCalc), [dealForCalc])

  const quickProductMatches = useMemo(() => {
    const q = quickProductQuery.trim().toLowerCase()
    if (q.length < 2) return []
    return catalogProducts
      .filter((product) =>
        (product.article || "").toLowerCase().includes(q) ||
        (product.nameRu || "").toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [quickProductQuery, catalogProducts])

  /* --- item helpers --- */
  const updateItem = useCallback((tempId: string, patch: Partial<DealItem>) => {
    setItems((prev) => prev.map((it) => it.tempId === tempId ? { ...it, ...patch } : it))
  }, [])
  const removeItem = useCallback((tempId: string) => {
    setItems((prev) => prev.filter((it) => it.tempId !== tempId))
  }, [])

  const applyProductSuggestion = useCallback((tempId: string, query: string, field: "article" | "nameRu") => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return

    const found = catalogProducts.find((product) => {
      const article = (product.article || "").toLowerCase()
      const nameRu = (product.nameRu || "").toLowerCase()
      return article.includes(q) || nameRu.includes(q)
    })

    if (!found) return

    setItems((prev) => prev.map((it) => {
      if (it.tempId !== tempId) return it
      const suggested = itemFromProduct(found)
      return {
        ...it,
        ...suggested,
        tempId: it.tempId,
        quantity: it.quantity || 1,
        article: field === "article" ? query : suggested.article,
        nameRu: field === "nameRu" ? query : suggested.nameRu,
      }
    }))
  }, [catalogProducts])

  /* --- section header --- */
  function SectionHeader({ id, title, num }: { id: string; title: string; num: string }) {
    const isOpen = expandedSections[id] !== false
    return (
      <button
        type="button"
        onClick={() => toggle(id)}
        className="flex w-full items-center justify-between rounded-lg bg-card px-4 py-3 text-left transition-colors hover:bg-accent"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">{num}</span>
          <span className="font-display text-sm font-semibold text-foreground">{title}</span>
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
    )
  }

  /* customs fee auto-calc */
  const autoCustomsFee = items.length <= 5 ? 25000 : 25000 + (items.length - 5) * 600

  return (
    <div className="space-y-4">
      {/* top bar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/deals"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-foreground">
            {isNew ? "Новая сделка" : "Сделка " + dealNumber}
          </h1>
        </div>
        <Button variant="outline" className="gap-2" onClick={saveDraft} disabled={isSaving || isLoading}>
          {isSaving ? "Сохраняем..." : "Сохранить черновик"}
        </Button>
      </div>

      {/* ======= SECTION: Rates ======= */}
      <div className="rounded-xl border border-border">
        <SectionHeader id="rates" title="Курсы валют для расчета" num="0" />
        {expandedSections.rates !== false && (
          <div className="space-y-3 px-4 pb-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{"Курс USD для расчета"}</Label>
                <Input type="number" step="0.01" value={rateUsd} onChange={(e) => setRateUsd(e.target.value)} />
                <p className="text-xs text-muted-foreground">{"Курс ЦБ: " + cbUsd.toFixed(2) + " \u20BD"}</p>
              </div>
              <div className="space-y-1">
                <Label>{"Курс CNY для расчета"}</Label>
                <Input type="number" step="0.01" value={rateCny} onChange={(e) => setRateCny(e.target.value)} />
                <p className="text-xs text-muted-foreground">{"Курс ЦБ: " + cbCny.toFixed(2) + " \u20BD"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======= SECTION: Client & Supplier ======= */}
      <div className="rounded-xl border border-border">
        <SectionHeader id="client" title="Клиент и продавец" num="1" />
        {expandedSections.client !== false && (
          <div className="space-y-4 px-4 pb-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Клиент</Label>
                <AutoSelect value={clientName} onChange={setClientName} options={clientOptions} placeholder="Выберите или введите клиента" />
              </div>
              <div className="space-y-1">
                <Label>Продавец</Label>
                <AutoSelect value={supplierName} onChange={setSupplierName} options={supplierOptions} placeholder="Выберите или введите продавца" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Город отправки (адрес)</Label>
                <Input value={cityFrom} onChange={(e) => setCityFrom(e.target.value)} placeholder="Шэньчжэнь, Китай" />
              </div>
              <div className="space-y-1">
                <Label>Город доставки (адрес)</Label>
                <Input value={cityTo} onChange={(e) => setCityTo(e.target.value)} placeholder="Москва, Россия" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{"N\u00B0 КП"}</Label>
              <Input value={dealNumber} onChange={(e) => setDealNumber(e.target.value)} placeholder="КП-2026/001" />
            </div>
          </div>
        )}
      </div>

      {/* ======= SECTION: Items ======= */}
      <div className="rounded-xl border border-border">
        <SectionHeader id="items" title={"Товары (" + items.length + ")"} num="2" />
        {expandedSections.items !== false && (
          <div className="space-y-4 px-4 pb-4 pt-2">
            <div className="flex gap-2">
              <Button size="sm" className="gap-1" onClick={() => { setAddMode("catalog"); setAddSheetOpen(true) }}>
                <Plus className="h-3 w-3" /> Из каталога
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                setItems((prev) => [...prev, emptyDealItem()])
              }}>
                <Plus className="h-3 w-3" /> Вручную
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Поиск товара (артикул или название)</Label>
              <Input
                value={quickProductQuery}
                onChange={(e) => setQuickProductQuery(e.target.value)}
                placeholder="Начните вводить артикул или название..."
              />
              {quickProductMatches.length > 0 && (
                <div className="max-h-48 overflow-auto rounded-lg border border-border">
                  {quickProductMatches.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-accent"
                      onClick={() => {
                        setItems((prev) => [...prev, itemFromProduct(product)])
                        setQuickProductQuery("")
                      }}
                    >
                      <span className="font-medium">{product.article || "—"}</span>
                      <span className="text-muted-foreground">{product.nameRu || "Без названия"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-border pb-2">
                <Table className="min-w-[1650px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">{"#"}</TableHead>
                      <TableHead>Артикул</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Кол-во</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>ТНВЭД</TableHead>
                      <TableHead>{"Пошлина %"}</TableHead>
                      <TableHead>{"НДС %"}</TableHead>
                      <TableHead>{"Акциз"}</TableHead>
                      <TableHead>{"Антидемп. %"}</TableHead>
                      <TableHead>{"Пошлина ₽"}</TableHead>
                      <TableHead>{"Объем м\u00B3"}</TableHead>
                      <TableHead>{"Вес кг"}</TableHead>
                      <TableHead className="text-right">{"Сумма"}</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it, idx) => {
                      const ic = calc.items[idx]
                      return (
                        <TableRow key={it.tempId}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell>
                            <Input className="h-8 w-24 text-xs" value={it.article}
                              onChange={(e) => { updateItem(it.tempId, { article: e.target.value }); applyProductSuggestion(it.tempId, e.target.value, "article") }} />
                          </TableCell>
                          <TableCell>
                            <Input className="h-8 w-36 text-xs" value={it.nameRu}
                              onChange={(e) => { updateItem(it.tempId, { nameRu: e.target.value }); applyProductSuggestion(it.tempId, e.target.value, "nameRu") }} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" className="h-8 w-24 text-xs" value={it.quantity || ""}
                              onChange={(e) => updateItem(it.tempId, { quantity: parseInt(e.target.value) || 0 })} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Input type="number" step="0.01" className="h-8 w-20 text-xs" value={it.priceSale || ""}
                                onChange={(e) => updateItem(it.tempId, { priceSale: parseFloat(e.target.value) || 0 })} />
                              <select className="h-8 rounded border border-input bg-background px-1 text-xs text-foreground"
                                value={it.priceCurrency}
                                onChange={(e) => updateItem(it.tempId, { priceCurrency: e.target.value as Currency })}>
                                <option value="CNY">{"\u00A5"}</option>
                                <option value="USD">$</option>
                                <option value="RUB">{"\u20BD"}</option>
                              </select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input className="h-8 w-28 text-xs" value={it.tnved}
                              onChange={(e) => updateItem(it.tempId, { tnved: e.target.value })} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" step="0.1" className="h-8 w-14 text-xs" value={it.dutyPercent || ""}
                              onChange={(e) => updateItem(it.tempId, { dutyPercent: parseFloat(e.target.value) || 0 })} />
                          </TableCell>
                          <TableCell>
                            <select className="h-8 rounded border border-input bg-background px-1 text-xs text-foreground"
                              value={it.vatPercent}
                              onChange={(e) => updateItem(it.tempId, { vatPercent: parseInt(e.target.value) || 0 })}>
                              <option value={0}>0%</option>
                              <option value={10}>10%</option>
                              <option value={22}>22%</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <Input type="number" className="h-8 w-16 text-xs" value={it.excise || ""}
                              onChange={(e) => updateItem(it.tempId, { excise: parseFloat(e.target.value) || 0 })} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" step="0.1" className="h-8 w-14 text-xs" value={it.antiDumping || ""}
                              onChange={(e) => updateItem(it.tempId, { antiDumping: parseFloat(e.target.value) || 0 })} />
                          </TableCell>
                          <TableCell className="font-mono text-xs">{ic ? fmtNum(ic.dutyRub, 0) : "—"}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.0001"
                              className="h-8 w-24 text-xs"
                              value={it.manualTotalVolume || ""}
                              placeholder={ic ? fmtNum(ic.totalVolume, 4) : ""}
                              onChange={(e) => updateItem(it.tempId, { manualTotalVolume: parseFloat(e.target.value) || 0 })}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.1"
                              className="h-8 w-24 text-xs"
                              value={it.manualTotalWeight || ""}
                              placeholder={ic ? fmtNum(ic.totalWeight, 1) : ""}
                              onChange={(e) => updateItem(it.tempId, { manualTotalWeight: parseFloat(e.target.value) || 0 })}
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {ic ? fmtNum(ic.totalPriceRub, 0) + " \u20BD" : "\u2014"}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                              onClick={() => removeItem(it.tempId)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {/* totals row */}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={11} className="text-right text-xs">Итого:</TableCell>
                      <TableCell className="font-mono text-xs">{fmtNum(calc.totalVolume, 4)}</TableCell>
                      <TableCell className="font-mono text-xs">{fmtNum(calc.totalWeight, 1)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmtNum(calc.totalGoodsRub, 0) + " \u20BD"}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======= SECTION: Delivery ======= */}
      <div className="rounded-xl border border-border">
        <SectionHeader id="delivery" title="Доставка" num="3" />
        {expandedSections.delivery !== false && (
          <div className="space-y-4 px-4 pb-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Способ доставки</Label>
                <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="auto">Авто</option>
                  <option value="rail">ЖД</option>
                  <option value="sea_rail">{"Море + ЖД"}</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Условия Инкотермс</Label>
                <select value={incoterms} onChange={(e) => setIncoterms(e.target.value as Incoterms)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  {(["EXW","FOB","CIF","FCA","DAP","DDP","CFR","CPT"] as Incoterms[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Импортер</Label>
                <select value={importer} onChange={(e) => setImporter(e.target.value as ImporterType)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="client">Клиент</option>
                  <option value="longan">{"Лонган Трейд"}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Стоимость доставки общая</Label>
                <div className="flex gap-2">
                  <Input type="number" step="0.01" value={deliveryCostTotal} onChange={(e) => setDeliveryCostTotal(e.target.value)} className="flex-1" placeholder="1520" />
                  <CurrencySelect value={deliveryCostCurrency} onChange={setDeliveryCostCurrency} />
                </div>
                {deliveryCostCurrency !== "RUB" && deliveryCostTotal && (
                  <p className="text-xs text-muted-foreground">{"= " + fmtNum(toRub(parseFloat(deliveryCostTotal) || 0, deliveryCostCurrency, rates)) + " \u20BD"}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>До границы</Label>
                <div className="flex gap-2">
                  <Input type="number" step="0.01" value={deliveryCostBorder} onChange={(e) => handleDeliveryBorderChange(e.target.value)} className="flex-1" placeholder="1100" />
                  <CurrencySelect value={deliveryCostBorderCurrency} onChange={setDeliveryCostBorderCurrency} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>По России</Label>
                <div className="flex gap-2">
                  <Input type="number" step="0.01" value={deliveryCostRussia} onChange={(e) => handleDeliveryRussiaChange(e.target.value)} className="flex-1" placeholder="420" />
                  <CurrencySelect value={deliveryCostRussiaCurrency} onChange={setDeliveryCostRussiaCurrency} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Доставка по Китаю (до перевозчика)</Label>
                <div className="flex gap-2">
                  <Input type="number" step="0.01" value={deliveryChinaLocal} onChange={(e) => setDeliveryChinaLocal(e.target.value)} className="flex-1" placeholder="3000" />
                  <CurrencySelect value={deliveryChinaLocalCurrency} onChange={setDeliveryChinaLocalCurrency} />
                </div>
                {deliveryChinaLocalCurrency !== "RUB" && deliveryChinaLocal && (
                  <p className="text-xs text-muted-foreground">{"= " + fmtNum(toRub(parseFloat(deliveryChinaLocal) || 0, deliveryChinaLocalCurrency, rates)) + " \u20BD"}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Доставка по РФ (до клиента)</Label>
                <div className="flex gap-2">
                  <Input type="number" step="0.01" value={deliveryRussiaLocal} onChange={(e) => setDeliveryRussiaLocal(e.target.value)} className="flex-1" placeholder="31500" />
                  <CurrencySelect value={deliveryRussiaLocalCurrency} onChange={setDeliveryRussiaLocalCurrency} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="permitDocs" checked={hasPermitDocs} onChange={(e) => setHasPermitDocs(e.target.checked)}
                  className="h-4 w-4 rounded border-border" />
                <Label htmlFor="permitDocs">{"Наличие разрешительных документов (ДС/СС/СГР/отказное)"}</Label>
              </div>
              {hasPermitDocs && (
                <Button variant="outline" size="sm" className="gap-1">
                  <Upload className="h-3 w-3" /> Загрузить документ
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======= SECTION: Customs & Commissions ======= */}
      <div className="rounded-xl border border-border">
        <SectionHeader id="customs" title="Таможня и комиссии" num="4" />
        {expandedSections.customs !== false && (
          <div className="space-y-4 px-4 pb-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Таможенное оформление</Label>
                <select value={declarant} onChange={(e) => setDeclarant(e.target.value as DeclarantType)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="our">Наш декларант</option>
                  <option value="client">Декларант клиента</option>
                </select>
              </div>
              {declarant === "our" && (
                <div className="space-y-1">
                  <Label>{"Стоимость ДС, \u20BD"}</Label>
                  <Input type="number" value={customsCostManual} onChange={(e) => setCustomsCostManual(e.target.value)}
                    placeholder={String(autoCustomsFee)} />
                  <p className="text-xs text-muted-foreground">
                    {"Авто: " + fmtNum(autoCustomsFee, 0) + " \u20BD (25\u00A0000 за 1-5 товаров" + (items.length > 5 ? " + 600 за каждый доп." : "") + ")"}
                  </p>
                </div>
              )}
            </div>

            {importer === "longan" && (
              <div className="space-y-1">
                <Label>{"Комиссия импортера (% от инвойса)"}</Label>
                <Input type="number" step="0.1" value={commissionPercent} onChange={(e) => setCommissionPercent(e.target.value)} placeholder="7" />
                {commissionPercent && (
                  <p className="text-xs text-muted-foreground">
                    {"= " + fmtNum(calc.invoiceCommissionRub, 2) + " \u20BD"}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{"Комиссия импортера, $"}</Label>
                <Input type="number" step="0.01" value={commissionImporterUsd} onChange={(e) => setCommissionImporterUsd(e.target.value)} placeholder="500" />
                {commissionImporterUsd && (
                  <p className="text-xs text-muted-foreground">
                    {"= " + fmtNum(calc.commissionImporterRub, 2) + " \u20BD"}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>{"СВИФТ, $"}</Label>
                <Input type="number" step="0.01" value={swiftUsd} onChange={(e) => setSwiftUsd(e.target.value)} placeholder="50" />
                {swiftUsd && (
                  <p className="text-xs text-muted-foreground">
                    {"= " + fmtNum(calc.swiftRub, 2) + " \u20BD"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Примечания</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Дополнительная информация..." className="min-h-20" />
            </div>
          </div>
        )}
      </div>

      {/* ======= SECTION: Summary Table ======= */}
      <div className="rounded-xl border border-border">
        <SectionHeader id="summary" title="Итоговый расчет" num="5" />
        {expandedSections.summary !== false && (
          <div className="space-y-4 px-4 pb-4 pt-2">
            {/* Export button */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                exportDealToExcel({
                  calc, rates, incoterms, cityFrom, cityTo,
                  deliveryCostTotal: parseFloat(deliveryCostTotal) || 0,
                  deliveryCostCurrency,
                  deliveryRussiaLocal: parseFloat(deliveryRussiaLocal) || 0,
                  deliveryRussiaLocalCurrency,
                  commissionImporterUsd: parseFloat(commissionImporterUsd) || 0,
                  swiftUsd: parseFloat(swiftUsd) || 0,
                  declarant, importer,
                  commissionPercent: parseFloat(commissionPercent) || 0,
                  itemsCurrency: items[0]?.priceCurrency ?? "CNY",
                })
              }}>
                <Download className="h-4 w-4" />
                Скачать Excel
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border" id="summary-table">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="px-4 py-2 text-left font-semibold text-foreground">Статья расходов</th>
                    <th className="px-4 py-2 text-right font-semibold text-foreground">Валюта</th>
                    <th className="px-4 py-2 text-right font-semibold text-foreground">Сумма</th>
                    <th className="px-4 py-2 text-right font-semibold text-foreground">{"Сумма, \u20BD"}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Invoice */}
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-medium">
                      {"Инвойс" + (importer === "longan" && commissionPercent ? " (Фин.логистика + компания импортер) " + commissionPercent + "%" : "")}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      {items.length > 0 ? CURRENCY_SYMBOLS[items[0].priceCurrency] : ""}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      {fmtNum(calc.totalGoodsOriginal + calc.invoiceCommissionOriginal)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-semibold">
                      {fmtNum(calc.totalGoodsRub + calc.invoiceCommissionRub, 2) + " \u20BD"}
                    </td>
                  </tr>

                  {/* Main delivery */}
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-medium">
                      {incoterms + " " + cityFrom + " \u2013 " + cityTo}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{CURRENCY_SYMBOLS[deliveryCostCurrency]}</td>
                    <td className="px-4 py-2 text-right font-mono">{fmtNum(parseFloat(deliveryCostTotal) || 0)}</td>
                    <td className="px-4 py-2 text-right font-mono font-semibold">{fmtNum(calc.deliveryTotalRub, 2) + " \u20BD"}</td>
                  </tr>

                  {/* Delivery Russia local */}
                  {(parseFloat(deliveryRussiaLocal) || 0) > 0 && (
                    <tr className="border-b border-border">
                      <td className="px-4 py-2 font-medium">{"Автовывоз по " + cityTo}</td>
                      <td className="px-4 py-2 text-right font-mono">{CURRENCY_SYMBOLS[deliveryRussiaLocalCurrency]}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtNum(parseFloat(deliveryRussiaLocal) || 0)}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">{fmtNum(calc.deliveryRussiaLocalRub, 2) + " \u20BD"}</td>
                    </tr>
                  )}

                  {/* Customs header */}
                  <tr className="border-b border-border bg-amber-50/60">
                    <td className="px-4 py-2 font-semibold" colSpan={2}>{"СТП - Совокупный Таможенный Платеж"}</td>
                    <td className="px-4 py-2 text-right font-mono">
                      ""
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-semibold">{fmtNum(calc.totalCustomsPayments + calc.customsFee + calc.declarationFee, 2) + " \u20BD"}</td>
                  </tr>

                  {/* Customs sub-items */}
                  {calc.customsFee > 0 && (
                    <tr className="border-b border-border bg-amber-50/30">
                      <td className="px-4 py-2 pl-8">Таможенный сбор (тариф 2026)</td>
                      <td />
                      <td className="px-4 py-2 text-right font-mono">{fmtNum(calc.customsFee, 0)}</td>
                      <td />
                    </tr>
                  )}
                  {calc.declarationFee > 0 && (
                    <tr className="border-b border-border bg-amber-50/30">
                      <td className="px-4 py-2 pl-8">Стоимость ДС</td>
                      <td />
                      <td className="px-4 py-2 text-right font-mono">{fmtNum(calc.declarationFee, 0)}</td>
                      <td />
                    </tr>
                  )}
                  {calc.dutyByTnved.map((entry) => (
                    <tr key={entry.tnved} className="border-b border-border bg-amber-50/30">
                      <td className="px-4 py-2 pl-8">Пошлина ({entry.tnved})</td>
                      <td />
                      <td className="px-4 py-2 text-right font-mono">{fmtNum(entry.amount, 2)}</td>
                      <td />
                    </tr>
                  ))}
                  {calc.totalExcise > 0 && (
                    <tr className="border-b border-border bg-amber-50/30">
                      <td className="px-4 py-2 pl-8">Акциз</td>
                      <td />
                      <td className="px-4 py-2 text-right font-mono">{fmtNum(calc.totalExcise, 2)}</td>
                      <td />
                    </tr>
                  )}
                  {calc.totalAntiDumping > 0 && (
                    <tr className="border-b border-border bg-amber-50/30">
                      <td className="px-4 py-2 pl-8">Антидемпинговая пошлина</td>
                      <td />
                      <td className="px-4 py-2 text-right font-mono">{fmtNum(calc.totalAntiDumping, 2)}</td>
                      <td />
                    </tr>
                  )}
                  <tr className="border-b border-border bg-amber-50/30">
                    <td className="px-4 py-2 pl-8">{"НДС"}</td>
                    <td />
                    <td className="px-4 py-2 text-right font-mono">{fmtNum(calc.totalVat, 2)}</td>
                    <td />
                  </tr>

                  {/* Customs clearance */}
                  {declarant === "our" && (
                    <tr className="border-b border-border">
                      <td className="px-4 py-2 font-medium">Таможенное оформление</td>
                      <td />
                      <td />
                      <td className="px-4 py-2 text-right font-mono font-semibold">{fmtNum(calc.declarationFee, 2) + " \u20BD"}</td>
                    </tr>
                  )}

                  {/* Importer commission */}
                  {calc.commissionImporterRub > 0 && (
                    <tr className="border-b border-border">
                      <td className="px-4 py-2 font-medium">Комиссия импортера</td>
                      <td className="px-4 py-2 text-right font-mono">$</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtNum(parseFloat(commissionImporterUsd) || 0)}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">{fmtNum(calc.commissionImporterRub, 2) + " \u20BD"}</td>
                    </tr>
                  )}

                  {/* SWIFT */}
                  {calc.swiftRub > 0 && (
                    <tr className="border-b border-border">
                      <td className="px-4 py-2 font-medium">СВИФТ</td>
                      <td className="px-4 py-2 text-right font-mono">$</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtNum(parseFloat(swiftUsd) || 0)}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">{fmtNum(calc.swiftRub, 2) + " \u20BD"}</td>
                    </tr>
                  )}

                  {/* GRAND TOTAL */}
                  <tr className="bg-emerald-50/60 font-bold">
                    <td className="px-4 py-3 text-base">{"Итого поставка:"}</td>
                    <td />
                    <td />
                    <td className="px-4 py-3 text-right font-mono text-base">{fmtNum(calc.grandTotal, 2) + " \u20BD"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Volume / Weight summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">{"Общий объем"}</p>
                <p className="font-mono text-lg font-bold text-foreground">{fmtNum(calc.totalVolume, 4) + " m\u00B3"}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Общий вес</p>
                <p className="font-mono text-lg font-bold text-foreground">{fmtNum(calc.totalWeight, 1) + " кг"}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Позиций</p>
                <p className="font-mono text-lg font-bold text-foreground">{items.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======= Add from catalog sheet ======= */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Добавить товар из каталога</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {catalogProducts.map((cp) => (
              <button
                key={cp.id}
                type="button"
                className="flex w-full items-center gap-4 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                onClick={() => {
                  setItems((prev) => [...prev, itemFromProduct(cp)])
                  setAddSheetOpen(false)
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  {cp.photo ? <img src={cp.photo} alt="" className="h-full w-full object-cover rounded-md" /> : (cp.article || "ТОВ").slice(0, 3)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{cp.nameRu}</p>
                  <p className="text-xs text-muted-foreground">{cp.article + " \u00B7 " + cp.tnved}</p>
                </div>
                <p className="font-mono text-sm">{cp.priceSale + " " + CURRENCY_SYMBOLS[cp.currencySale || "CNY"]}</p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
