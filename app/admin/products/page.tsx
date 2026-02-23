"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Plus, Pencil, Upload, X, FileText, ImageIcon, ArrowUpDown, ArrowUp, ArrowDown, Search, Trash2, Download, FileUp } from "lucide-react"

/* ========== types ========== */
interface ProductDimensions {
  length: string
  width: string
  height: string
}

interface Product {
  id: number
  owner: string
  manufacturer: string
  article: string
  nameZh: string
  nameEn: string
  nameRu: string
  barcode: string
  composition: string
  tnved: string
  priceSupplier: string
  currencySupplier: "CNY" | "USD" | "RUB"
  priceSale: string
  currencySale: "CNY" | "USD" | "RUB"
  dimUnit: ProductDimensions
  weightNettoUnit: string
  weightBruttoUnit: string
  dimPackage: ProductDimensions
  weightNettoPackage: string
  weightBruttoPackage: string
  qtyInPackage: string
  dutyPercent: string
  vatPercent: "0" | "10" | "22"
  excise: string
  antiDumping: string
  permitDocType: "" | "refusal" | "DS" | "SS" | "SGR" | "notification"
  permitDocNumber: string
  permitDocDate: string
  permitDocFile: string
  photos: string[]
  documents: { name: string; url: string }[]
}

const emptyDim: ProductDimensions = { length: "", width: "", height: "" }

const emptyProduct: Omit<Product, "id"> = {
  owner: "",
  manufacturer: "",
  article: "",
  nameZh: "",
  nameEn: "",
  nameRu: "",
  barcode: "",
  composition: "",
  tnved: "",
  priceSupplier: "",
  currencySupplier: "CNY",
  priceSale: "",
  currencySale: "CNY",
  dimUnit: { ...emptyDim },
  weightNettoUnit: "",
  weightBruttoUnit: "",
  dimPackage: { ...emptyDim },
  weightNettoPackage: "",
  weightBruttoPackage: "",
  qtyInPackage: "",
  dutyPercent: "",
  vatPercent: "22",
  excise: "",
  antiDumping: "",
  permitDocType: "",
  permitDocNumber: "",
  permitDocDate: "",
  permitDocFile: "",
  photos: [],
  documents: [],
}

/* ========== mock clients / suppliers for autocomplete ========== */
const defaultClientCompanies = [
  'ООО "Техно-Импорт"',
  "ИП Козлова А.М.",
  'ООО "ГлобалТрейд"',
]

const defaultSupplierCompanies = [
  "Шэньчжэнь Хуацян Электроникс",
  "Гуанчжоу Байда Трейдинг",
  "Иу Цзиньчэн Импорт Экспорт",
]

/* ========== seed data ========== */
const seedProducts: Product[] = [
  {
    id: 1,
    owner: 'ООО "Техно-Импорт"',
    manufacturer: "Шэньчжэнь Хуацян Электроникс",
    article: "LED-6060-W",
    nameZh: "LED平板灯 60x60",
    nameEn: "LED Panel Light 60x60",
    nameRu: "Светодиодная панель 60x60",
    barcode: "4607012345678",
    composition: "Алюминиевый корпус, LED чипы SMD2835, рассеиватель PMMA",
    tnved: "9405 42 310 0",
    priceSupplier: "90",
    currencySupplier: "CNY",
    priceSale: "24.00",
    currencySale: "USD",
    dimUnit: { length: "60", width: "60", height: "1.2" },
    weightNettoUnit: "2.8",
    weightBruttoUnit: "3.2",
    dimPackage: { length: "65", width: "65", height: "28" },
    weightNettoPackage: "14.0",
    weightBruttoPackage: "16.5",
    qtyInPackage: "5",
    dutyPercent: "6",
    vatPercent: "22",
    excise: "",
    antiDumping: "",
    permitDocType: "DS",
    permitDocNumber: "РОСС RU.HB68.H00136/22",
    permitDocDate: "2026-01-10",
    permitDocFile: "",
    photos: [],
    documents: [],
  },
  {
    id: 2,
    owner: "ИП Козлова А.М.",
    manufacturer: "Гуанчжоу Байда Трейдинг",
    article: "CTN-100M-W",
    nameZh: "棉布 100米/卷",
    nameEn: "Cotton Fabric Roll 100m",
    nameRu: "Хлопковая ткань (рулон 100м)",
    barcode: "4607098765432",
    composition: "100% хлопок, плотность 120 г/м2",
    tnved: "5208 11 100 0",
    priceSupplier: "610",
    currencySupplier: "CNY",
    priceSale: "145.00",
    currencySale: "USD",
    dimUnit: { length: "150", width: "30", height: "30" },
    weightNettoUnit: "12.0",
    weightBruttoUnit: "13.0",
    dimPackage: { length: "155", width: "35", height: "35" },
    weightNettoPackage: "13.0",
    weightBruttoPackage: "14.5",
    qtyInPackage: "1",
    dutyPercent: "8",
    vatPercent: "22",
    excise: "",
    antiDumping: "",
    permitDocType: "",
    permitDocNumber: "",
    permitDocDate: "",
    permitDocFile: "",
    photos: [],
    documents: [],
  },
]

/* ========== helpers ========== */
type Currency = "CNY" | "USD" | "RUB"

const CURRENCY_LABELS: Record<Currency, string> = { CNY: "\u00A5", USD: "$", RUB: "\u20BD" }

function calcVolumeCm(d: ProductDimensions): string {
  const l = parseFloat(d.length.replace(",", "."))
  const w = parseFloat(d.width.replace(",", "."))
  const h = parseFloat(d.height.replace(",", "."))
  if (isNaN(l) || isNaN(w) || isNaN(h) || l === 0 || w === 0 || h === 0) return "\u2014"
  const m3 = (l * w * h) / 1_000_000
  return m3.toFixed(6) + " m\u00B3"
}

function convertToRub(price: string, currency: Currency, rates: { usd: number; cny: number }): string {
  const v = parseFloat(price.replace(",", "."))
  if (isNaN(v) || v === 0) return "\u2014"
  if (currency === "RUB") return v.toFixed(2) + " \u20BD"
  if (currency === "USD") return (v * rates.usd).toFixed(2) + " \u20BD"
  return (v * rates.cny).toFixed(2) + " \u20BD"
}

function normalizeDecimalInput(value: string) {
  const sanitized = value.replace(/\s+/g, "").replace(/[.]/g, ",").replace(/[^\d,]/g, "")
  if (sanitized === "") return ""
  if (sanitized === ",") return "0,"
  if (sanitized.startsWith(",")) return `0${sanitized}`
  const firstComma = sanitized.indexOf(",")
  if (firstComma === -1) return sanitized
  return `${sanitized.slice(0, firstComma + 1)}${sanitized.slice(firstComma + 1).replace(/,/g, "")}`
}

function formatTnvedInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10)
  const groups = [4, 2, 3, 1]
  let index = 0
  const parts: string[] = []
  for (const group of groups) {
    if (index >= digits.length) break
    parts.push(digits.slice(index, index + group))
    index += group
  }
  return parts.join(" ")
}

/* ========== autocomplete component ========== */
function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  suggestions: string[]
  placeholder: string
}) {
  const [focused, setFocused] = useState(false)
  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  )
  const show = focused && value.length > 0 && filtered.length > 0

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={placeholder}
      />
      {show && (
        <ul className="absolute left-0 top-full z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border border-border bg-popover shadow-md">
          {filtered.map((s) => (
            <li
              key={s}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
              onMouseDown={() => {
                onChange(s)
                setFocused(false)
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ========== main component ========== */
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(seedProducts)
  const [clientCompanies, setClientCompanies] = useState<string[]>(defaultClientCompanies)
  const [supplierCompanies, setSupplierCompanies] = useState<string[]>(defaultSupplierCompanies)
  const [isSaving, setIsSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Product, "id">>({
    ...emptyProduct,
    dimUnit: { ...emptyDim },
    dimPackage: { ...emptyDim },
    photos: [],
    documents: [],
  })

  const photoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  /* search & filters */
  const [search, setSearch] = useState("")
  const [filterOwner, setFilterOwner] = useState("")
  const [filterManufacturer, setFilterManufacturer] = useState("")
  const [filterTnved, setFilterTnved] = useState("")

  /* sorting */
  type SortKey = "id" | "article" | "nameRu" | "tnved" | "owner" | "priceSupplier" | "priceSale" | "barcode"
  type SortDir = "asc" | "desc" | null
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc")
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null) }
      else setSortDir("asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />
    if (sortDir === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />
    return <ArrowDown className="ml-1 inline h-3 w-3" />
  }

  /* hover image tooltip */
  const [hoverProduct, setHoverProduct] = useState<{ id: number; x: number; y: number } | null>(null)

  /* unique values for filter dropdowns */
  const uniqueOwners = useMemo(() => [...new Set(products.map((p) => p.owner))].filter(Boolean), [products])
  const uniqueManufacturers = useMemo(() => [...new Set(products.map((p) => p.manufacturer))].filter(Boolean), [products])

  /* filtered & sorted */
  const displayProducts = useMemo(() => {
    let result = [...products]

    // text search across article, name, tnved
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.article.toLowerCase().includes(q) ||
          p.nameRu.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.nameZh.toLowerCase().includes(q) ||
          p.tnved.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q)
      )
    }

    if (filterOwner) result = result.filter((p) => p.owner === filterOwner)
    if (filterManufacturer) result = result.filter((p) => p.manufacturer === filterManufacturer)
    if (filterTnved.trim()) {
      const q = filterTnved.toLowerCase()
      result = result.filter((p) => p.tnved.toLowerCase().includes(q))
    }

    // sorting
    if (sortKey && sortDir) {
      result.sort((a, b) => {
        let va: string | number = ""
        let vb: string | number = ""
        if (sortKey === "id") { va = a.id; vb = b.id }
        else if (sortKey === "priceSupplier") { va = parseFloat(a.priceSupplier) || 0; vb = parseFloat(b.priceSupplier) || 0 }
        else if (sortKey === "priceSale") { va = parseFloat(a.priceSale) || 0; vb = parseFloat(b.priceSale) || 0 }
        else { va = a[sortKey]; vb = b[sortKey] }
        if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va
        return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
      })
    }

    return result
  }, [products, search, filterOwner, filterManufacturer, filterTnved, sortKey, sortDir])

  /* CBR exchange rates */
  const [rates, setRates] = useState({ usd: 88.50, cny: 12.20 })

  useEffect(() => {
    fetch("https://www.cbr-xml-daily.ru/daily_json.js")
      .then((r) => r.json())
      .then((data) => {
        const usd = data?.Valute?.USD?.Value ?? 88.50
        const cny = data?.Valute?.CNY?.Value ?? 12.20
        setRates({ usd, cny })
      })
      .catch(() => { /* keep default rates */ })
  }, [])

  useEffect(() => {
    fetch("/api/admin/products")
      .then((response) => response.json())
      .then((result) => {
        if (result?.ok && Array.isArray(result.items)) {
          setProducts(result.items)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((response) => response.json())
      .then((result) => {
        if (result?.ok && Array.isArray(result.items)) {
          const options = result.items.map((item: { companyName?: string }) => item.companyName).filter(Boolean)
          if (options.length > 0) setClientCompanies(options)
        }
      })
      .catch(() => {})

    fetch("/api/admin/suppliers")
      .then((response) => response.json())
      .then((result) => {
        if (result?.ok && Array.isArray(result.items)) {
          const options = result.items.map((item: { nameRu?: string; nameEn?: string }) => item.nameRu || item.nameEn).filter(Boolean)
          if (options.length > 0) setSupplierCompanies(options)
        }
      })
      .catch(() => {})
  }, [])

  async function exportProductsToExcel(source: Product[]) {
    const ExcelJS = (await import("exceljs")).default
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("Товары")
    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Владелец", key: "owner", width: 28 },
      { header: "Производитель", key: "manufacturer", width: 28 },
      { header: "Артикул", key: "article", width: 20 },
      { header: "ШК", key: "barcode", width: 20 },
      { header: "ТНВЭД", key: "tnved", width: 16 },
      { header: "Русское название", key: "nameRu", width: 40 },
      { header: "Цена поставщика", key: "priceSupplier", width: 18 },
      { header: "Валюта поставщика", key: "currencySupplier", width: 18 },
      { header: "Цена продажи", key: "priceSale", width: 18 },
      { header: "Валюта продажи", key: "currencySale", width: 18 },
    ]

    source.forEach((p) => {
      sheet.addRow({
        id: p.id,
        owner: p.owner,
        manufacturer: p.manufacturer,
        article: p.article,
        barcode: p.barcode,
        tnved: p.tnved,
        nameRu: p.nameRu,
        priceSupplier: p.priceSupplier,
        currencySupplier: p.currencySupplier,
        priceSale: p.priceSale,
        currencySale: p.currencySale,
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "products.xlsx"
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadTemplate() {
    await exportProductsToExcel([])
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ExcelJS = (await import("exceljs")).default
    const workbook = new ExcelJS.Workbook()
    const arrayBuffer = await file.arrayBuffer()
    await workbook.xlsx.load(arrayBuffer)
    const sheet = workbook.worksheets[0]
    if (!sheet) return

    const imported: Omit<Product, "id">[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const owner = String(row.getCell(2).value ?? "").trim()
      const manufacturer = String(row.getCell(3).value ?? "").trim()
      const article = String(row.getCell(4).value ?? "").trim()
      if (!owner && !manufacturer && !article) return

      imported.push({
        ...emptyProduct,
        owner,
        manufacturer,
        article,
        barcode: String(row.getCell(5).value ?? "").trim(),
        tnved: formatTnvedInput(String(row.getCell(6).value ?? "")),
        nameRu: String(row.getCell(7).value ?? "").trim(),
        priceSupplier: normalizeDecimalInput(String(row.getCell(8).value ?? "")),
        currencySupplier: (String(row.getCell(9).value ?? "CNY").trim() as Currency) || "CNY",
        priceSale: normalizeDecimalInput(String(row.getCell(10).value ?? "")),
        currencySale: (String(row.getCell(11).value ?? "CNY").trim() as Currency) || "CNY",
        dimUnit: { ...emptyDim },
        dimPackage: { ...emptyDim },
        photos: [],
        documents: [],
      })
    })

    for (const payload of imported) {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)
      if (response.ok && result?.id) {
        setProducts((prev) => [{ id: result.id, ...payload }, ...prev])
      }
    }

    e.target.value = ""
  }

  /* computed volumes */
  const volumeUnit = useMemo(() => calcVolumeCm(form.dimUnit), [form.dimUnit])
  const volumePackage = useMemo(() => calcVolumeCm(form.dimPackage), [form.dimPackage])

  function openNew() {
    setEditingId(null)
    setForm({
      ...emptyProduct,
      dimUnit: { ...emptyDim },
      dimPackage: { ...emptyDim },
      photos: [],
      documents: [],
    })
    setOpen(true)
  }

  function openEdit(product: Product) {
    setEditingId(product.id)
    const { id: _id, ...rest } = product
    setForm({
      ...rest,
      dimUnit: { ...product.dimUnit },
      dimPackage: { ...product.dimPackage },
      photos: [...product.photos],
      documents: [...product.documents],
    })
    setOpen(true)
  }

  async function handleSave() {
    setIsSaving(true)

    try {
      const payload = {
        ...form,
        dimUnit: { ...form.dimUnit },
        dimPackage: { ...form.dimPackage },
        photos: [...form.photos],
        documents: [...form.documents],
      }

      if (editingId !== null) {
        const response = await fetch(`/api/admin/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error("save failed")

        setProducts((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item)))
      } else {
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await response.json().catch(() => null)

        if (!response.ok || !result?.id) throw new Error("create failed")

        setProducts((prev) => [{ id: result.id, ...payload }, ...prev])
      }

      setOpen(false)
    } catch {
      alert("Не удалось сохранить товар")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(productId: number) {
    if (!confirm("Удалить товар?")) return

    const response = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" })
    if (!response.ok) {
      alert("Не удалось удалить товар")
      return
    }

    setProducts((prev) => prev.filter((item) => item.id !== productId))
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const urls = Array.from(files).map((f) => URL.createObjectURL(f))
    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...urls] }))
    e.target.value = ""
  }

  function removePhoto(index: number) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const docs = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }))
    setForm((prev) => ({ ...prev, documents: [...prev.documents, ...docs] }))
    e.target.value = ""
  }

  function removeDoc(index: number) {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Товары</h1>
          <p className="text-sm text-muted-foreground">{"Каталог товаров клиентов \u00B7 " + displayProducts.length + " из " + products.length}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => importInputRef.current?.click()} className="gap-2">
            <FileUp className="h-4 w-4" />
            Загрузить файл
          </Button>
          <Button variant="outline" onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Скачать шаблон
          </Button>
          <Button variant="outline" onClick={() => exportProductsToExcel(displayProducts)} className="gap-2">
            <Download className="h-4 w-4" />
            Скачать все в Excel
          </Button>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Добавить товар
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportExcel}
          />
        </div>
      </div>

      {/* filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по артикулу, названию, ТНВЭД, ШК..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Все владельцы</option>
          {uniqueOwners.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          value={filterManufacturer}
          onChange={(e) => setFilterManufacturer(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Все производители</option>
          {uniqueManufacturers.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <Input
          placeholder="Фильтр по ТНВЭД"
          value={filterTnved}
          onChange={(e) => setFilterTnved(e.target.value)}
        />
        {(search || filterOwner || filterManufacturer || filterTnved) && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => { setSearch(""); setFilterOwner(""); setFilterManufacturer(""); setFilterTnved("") }}
          >
            <X className="h-3 w-3" />
            Сбросить
          </Button>
        )}
      </div>

      {/* table */}
      <div className="relative rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 cursor-pointer select-none" onClick={() => toggleSort("id")}>
                ID<SortIcon col="id" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("article")}>
                Артикул<SortIcon col="article" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("nameRu")}>
                {"Наименование (рус.)"}<SortIcon col="nameRu" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("tnved")}>
                ТНВЭД<SortIcon col="tnved" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("owner")}>
                Владелец<SortIcon col="owner" />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("priceSupplier")}>
                {"Цена пост."}<SortIcon col="priceSupplier" />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("priceSale")}>
                {"Цена прод."}<SortIcon col="priceSale" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("barcode")}>
                ШК<SortIcon col="barcode" />
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                  Ничего не найдено
                </TableCell>
              </TableRow>
            ) : (
              displayProducts.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => openEdit(p)}
                  onMouseEnter={(e) => {
                    if (p.photos.length > 0) {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      setHoverProduct({ id: p.id, x: rect.right + 8, y: rect.top })
                    }
                  }}
                  onMouseLeave={() => setHoverProduct(null)}
                >
                  <TableCell className="font-medium text-muted-foreground">{p.id}</TableCell>
                  <TableCell className="font-mono text-sm">{p.article}</TableCell>
                  <TableCell className="font-medium">{p.nameRu}</TableCell>
                  <TableCell className="font-mono text-sm">{p.tnved}</TableCell>
                  <TableCell>{p.owner}</TableCell>
                  <TableCell className="text-right">{p.priceSupplier} {CURRENCY_LABELS[p.currencySupplier]}</TableCell>
                  <TableCell className="text-right">{p.priceSale} {CURRENCY_LABELS[p.currencySale]}</TableCell>
                  <TableCell className="font-mono text-xs">{p.barcode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEdit(p)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(p.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* image tooltip on hover */}
        {hoverProduct && (() => {
          const p = products.find((pr) => pr.id === hoverProduct.id)
          if (!p || p.photos.length === 0) return null
          return (
            <div
              className="pointer-events-none fixed z-50 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
              style={{ left: hoverProduct.x, top: hoverProduct.y, maxWidth: 200, maxHeight: 200 }}
            >
              <img
                src={p.photos[0]}
                alt={p.nameRu}
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
          )
        })()}
      </div>

      {/* sheet form */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="font-display">
              {editingId !== null ? `Редактирование товара #${editingId}` : "Новый товар"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-8">

            {/* 1. Owner */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Владелец (клиент)
              </h3>
              <AutocompleteInput
                value={form.owner}
                onChange={(v) => setForm({ ...form, owner: v })}
                suggestions={clientCompanies}
                placeholder="Введите название компании клиента"
              />
            </section>

            {/* 2. Manufacturer */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Производитель
              </h3>
              <AutocompleteInput
                value={form.manufacturer}
                onChange={(v) => setForm({ ...form, manufacturer: v })}
                suggestions={supplierCompanies}
                placeholder="Введите название производителя"
              />
            </section>

            {/* 3. Article */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Артикул и коды
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Артикул</Label>
                  <Input
                    value={form.article}
                    onChange={(e) => setForm({ ...form, article: e.target.value })}
                    placeholder="LED-6060-W"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ШК (штрихкод)</Label>
                  <Input
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    placeholder="4607012345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Код ТНВЭД</Label>
                  <Input
                    value={form.tnved}
                    onChange={(e) => setForm({ ...form, tnved: formatTnvedInput(e.target.value) })}
                    placeholder="9405 42 310 0"
                  />
                </div>
              </div>
            </section>

            {/* 4. Names 3 languages */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Название
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Китайский</Label>
                  <Input
                    value={form.nameZh}
                    onChange={(e) => setForm({ ...form, nameZh: e.target.value })}
                    placeholder="LED平板灯 60x60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Английский</Label>
                  <Input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder="LED Panel Light 60x60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Русский</Label>
                  <Input
                    value={form.nameRu}
                    onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                    placeholder="Светодиодная панель 60x60"
                  />
                </div>
              </div>
            </section>

            {/* 6. Composition */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Состав / Описание
              </h3>
              <Textarea
                value={form.composition}
                onChange={(e) => setForm({ ...form, composition: e.target.value })}
                placeholder="Алюминиевый корпус, LED чипы SMD2835, рассеиватель PMMA..."
                className="min-h-24"
              />
            </section>

            {/* 8. Prices */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Цены
              </h3>
              <p className="text-xs text-muted-foreground">
                {"Курс ЦБ: 1 USD = " + rates.usd.toFixed(2) + " \u20BD, 1 CNY = " + rates.cny.toFixed(2) + " \u20BD"}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* Supplier price */}
                <div className="space-y-2">
                  <Label>Цена поставщика</Label>
                  <div className="flex gap-2">
                    <Input
                      step="0.01"
                      value={form.priceSupplier}
                      onChange={(e) => setForm({ ...form, priceSupplier: normalizeDecimalInput(e.target.value) })}
                      placeholder="90"
                      className="flex-1"
                    />
                    <select
                      value={form.currencySupplier}
                      onChange={(e) => setForm({ ...form, currencySupplier: e.target.value as Currency })}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="CNY">CNY</option>
                      <option value="USD">USD</option>
                      <option value="RUB">RUB</option>
                    </select>
                  </div>
                  {form.currencySupplier !== "RUB" && form.priceSupplier && (
                    <p className="text-xs text-muted-foreground">
                      {"= " + convertToRub(form.priceSupplier, form.currencySupplier, rates)}
                    </p>
                  )}
                </div>
                {/* Sale price */}
                <div className="space-y-2">
                  <Label>Цена продажи</Label>
                  <div className="flex gap-2">
                    <Input
                      step="0.01"
                      value={form.priceSale}
                      onChange={(e) => setForm({ ...form, priceSale: normalizeDecimalInput(e.target.value) })}
                      placeholder="24.00"
                      className="flex-1"
                    />
                    <select
                      value={form.currencySale}
                      onChange={(e) => setForm({ ...form, currencySale: e.target.value as Currency })}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="CNY">CNY</option>
                      <option value="USD">USD</option>
                      <option value="RUB">RUB</option>
                    </select>
                  </div>
                  {form.currencySale !== "RUB" && form.priceSale && (
                    <p className="text-xs text-muted-foreground">
                      {"= " + convertToRub(form.priceSale, form.currencySale, rates)}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 9-10. Unit dimensions & weight */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {"Габариты 1 шт. (см) и вес (кг)"}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{"Длина, см"}</Label>
                  <Input
                    value={form.dimUnit.length}
                    onChange={(e) =>
                      setForm({ ...form, dimUnit: { ...form.dimUnit, length: normalizeDecimalInput(e.target.value) } })
                    }
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Ширина, см"}</Label>
                  <Input
                    value={form.dimUnit.width}
                    onChange={(e) =>
                      setForm({ ...form, dimUnit: { ...form.dimUnit, width: normalizeDecimalInput(e.target.value) } })
                    }
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Высота, см"}</Label>
                  <Input
                    value={form.dimUnit.height}
                    onChange={(e) =>
                      setForm({ ...form, dimUnit: { ...form.dimUnit, height: normalizeDecimalInput(e.target.value) } })
                    }
                    placeholder="1.2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Вес нетто 1 шт.</Label>
                  <Input
                    step="0.01"
                    value={form.weightNettoUnit}
                    onChange={(e) => setForm({ ...form, weightNettoUnit: normalizeDecimalInput(e.target.value) })}
                    placeholder="2.8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Вес брутто 1 шт.</Label>
                  <Input
                    step="0.01"
                    value={form.weightBruttoUnit}
                    onChange={(e) => setForm({ ...form, weightBruttoUnit: normalizeDecimalInput(e.target.value) })}
                    placeholder="3.2"
                  />
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Объ��м 1 шт.</p>
                  <p className="text-sm font-semibold text-foreground">{volumeUnit}</p>
                </div>
              </div>
            </section>

            {/* 11-14. Package dimensions & weight */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {"Транспортная упаковка (см) и вес (кг)"}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{"Длина, см"}</Label>
                  <Input
                    value={form.dimPackage.length}
                    onChange={(e) =>
                      setForm({ ...form, dimPackage: { ...form.dimPackage, length: normalizeDecimalInput(e.target.value) } })
                    }
                    placeholder="65"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Ширина, см"}</Label>
                  <Input
                    value={form.dimPackage.width}
                    onChange={(e) =>
                      setForm({ ...form, dimPackage: { ...form.dimPackage, width: normalizeDecimalInput(e.target.value) } })
                    }
                    placeholder="65"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Высота, см"}</Label>
                  <Input
                    value={form.dimPackage.height}
                    onChange={(e) =>
                      setForm({ ...form, dimPackage: { ...form.dimPackage, height: normalizeDecimalInput(e.target.value) } })
                    }
                    placeholder="28"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Вес нетто упаковки</Label>
                  <Input
                    step="0.01"
                    value={form.weightNettoPackage}
                    onChange={(e) => setForm({ ...form, weightNettoPackage: normalizeDecimalInput(e.target.value) })}
                    placeholder="14.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Вес брутто упаковки</Label>
                  <Input
                    step="0.01"
                    value={form.weightBruttoPackage}
                    onChange={(e) => setForm({ ...form, weightBruttoPackage: normalizeDecimalInput(e.target.value) })}
                    placeholder="16.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Количество в упаковке</Label>
                  <Input
                    type="number"
                    value={form.qtyInPackage}
                    onChange={(e) => setForm({ ...form, qtyInPackage: e.target.value })}
                    placeholder="5"
                  />
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Объем транспортного места</p>
                  <p className="text-sm font-semibold text-foreground">{volumePackage}</p>
                </div>
              </div>
            </section>

            {/* Customs: duty, VAT, excise, anti-dumping */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Таможенные параметры
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{"Пошлина, %"}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.dutyPercent}
                    onChange={(e) => setForm({ ...form, dutyPercent: e.target.value })}
                    placeholder="6"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"НДС, %"}</Label>
                  <select
                    value={form.vatPercent}
                    onChange={(e) => setForm({ ...form, vatPercent: e.target.value as "0" | "10" | "22" })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="0">{"0%"}</option>
                    <option value="10">{"10%"}</option>
                    <option value="22">{"22%"}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Акциз</Label>
                  <Input
                    value={form.excise}
                    onChange={(e) => setForm({ ...form, excise: e.target.value })}
                    placeholder="Не облагается"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Антидемпинговая пошлина</Label>
                  <Input
                    value={form.antiDumping}
                    onChange={(e) => setForm({ ...form, antiDumping: e.target.value })}
                    placeholder="Не облагается"
                  />
                </div>
              </div>
            </section>

            {/* Permit document */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Разрешительный документ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип документа</Label>
                  <select
                    value={form.permitDocType}
                    onChange={(e) => setForm({ ...form, permitDocType: e.target.value as Product["permitDocType"] })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Не выбран</option>
                    <option value="refusal">Отказное</option>
                    <option value="DS">ДС (Декларация соответствия)</option>
                    <option value="SS">СС (Сертификат соответствия)</option>
                    <option value="SGR">СГР</option>
                    <option value="notification">Нотификация</option>
                  </select>
                </div>
                {form.permitDocType && (
                  <>
                    <div className="space-y-2">
                      <Label>{"N\u00B0 документа"}</Label>
                      <Input
                        value={form.permitDocNumber}
                        onChange={(e) => setForm({ ...form, permitDocNumber: e.target.value })}
                        placeholder="РОСС RU.HB68.H00136/22"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Дата документа</Label>
                      <Input
                        type="date"
                        value={form.permitDocDate}
                        onChange={(e) => setForm({ ...form, permitDocDate: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* 15. Photos */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Фотографии
              </h3>
              <div className="flex flex-wrap gap-3">
                {form.photos.map((url, i) => (
                  <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                    <img src={url} alt={`Фото ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs">Загрузить</span>
                </button>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </section>

            {/* 16. Documents */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Документы (INCI, MSDS и др.)
              </h3>
              <div className="space-y-2">
                {form.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDoc(i)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => docInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Загрузить документ
              </Button>
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                multiple
                className="hidden"
                onChange={handleDocUpload}
              />
            </section>

            {/* actions */}
            <div className="flex gap-3 border-t border-border pt-6">
              <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                {isSaving ? "Сохраняем..." : editingId !== null ? "Сохранить" : "Добавить товар"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Отмена
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
