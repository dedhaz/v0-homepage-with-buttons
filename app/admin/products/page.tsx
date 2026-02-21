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
import { Plus, Pencil, Upload, X, FileText, ImageIcon } from "lucide-react"

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
  photos: [],
  documents: [],
}

/* ========== mock clients / suppliers for autocomplete ========== */
const clientCompanies = [
  'ООО "Техно-Импорт"',
  "ИП Козлова А.М.",
  'ООО "ГлобалТрейд"',
]

const supplierCompanies = [
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
    photos: [],
    documents: [],
  },
]

/* ========== helpers ========== */
type Currency = "CNY" | "USD" | "RUB"

const CURRENCY_LABELS: Record<Currency, string> = { CNY: "\u00A5", USD: "$", RUB: "\u20BD" }

function calcVolumeCm(d: ProductDimensions): string {
  const l = parseFloat(d.length)
  const w = parseFloat(d.width)
  const h = parseFloat(d.height)
  if (isNaN(l) || isNaN(w) || isNaN(h) || l === 0 || w === 0 || h === 0) return "\u2014"
  const m3 = (l * w * h) / 1_000_000
  return m3.toFixed(6) + " m\u00B3"
}

function convertToRub(price: string, currency: Currency, rates: { usd: number; cny: number }): string {
  const v = parseFloat(price)
  if (isNaN(v) || v === 0) return "\u2014"
  if (currency === "RUB") return v.toFixed(2) + " \u20BD"
  if (currency === "USD") return (v * rates.usd).toFixed(2) + " \u20BD"
  return (v * rates.cny).toFixed(2) + " \u20BD"
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

  function handleSave() {
    if (editingId !== null) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...form,
                dimUnit: { ...form.dimUnit },
                dimPackage: { ...form.dimPackage },
                photos: [...form.photos],
                documents: [...form.documents],
              }
            : p
        )
      )
    } else {
      const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1
      setProducts((prev) => [
        ...prev,
        {
          id: newId,
          ...form,
          dimUnit: { ...form.dimUnit },
          dimPackage: { ...form.dimPackage },
          photos: [...form.photos],
          documents: [...form.documents],
        },
      ])
    }
    setOpen(false)
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
          <p className="text-sm text-muted-foreground">Каталог товаров клиентов</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить товар
        </Button>
      </div>

      {/* table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Артикул</TableHead>
              <TableHead>Наименование (рус.)</TableHead>
              <TableHead>ТНВЭД</TableHead>
              <TableHead>Владелец</TableHead>
              <TableHead className="text-right">{"Цена пост."}</TableHead>
              <TableHead className="text-right">{"Цена прод."}</TableHead>
              <TableHead>ШК</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => openEdit(p)}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                    onChange={(e) => setForm({ ...form, tnved: e.target.value })}
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
                      type="number"
                      step="0.01"
                      value={form.priceSupplier}
                      onChange={(e) => setForm({ ...form, priceSupplier: e.target.value })}
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
                      type="number"
                      step="0.01"
                      value={form.priceSale}
                      onChange={(e) => setForm({ ...form, priceSale: e.target.value })}
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
                    type="number"
                    value={form.dimUnit.length}
                    onChange={(e) =>
                      setForm({ ...form, dimUnit: { ...form.dimUnit, length: e.target.value } })
                    }
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Ширина, см"}</Label>
                  <Input
                    type="number"
                    value={form.dimUnit.width}
                    onChange={(e) =>
                      setForm({ ...form, dimUnit: { ...form.dimUnit, width: e.target.value } })
                    }
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Высота, см"}</Label>
                  <Input
                    type="number"
                    value={form.dimUnit.height}
                    onChange={(e) =>
                      setForm({ ...form, dimUnit: { ...form.dimUnit, height: e.target.value } })
                    }
                    placeholder="1.2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Вес нетто 1 шт.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.weightNettoUnit}
                    onChange={(e) => setForm({ ...form, weightNettoUnit: e.target.value })}
                    placeholder="2.8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Вес брутто 1 шт.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.weightBruttoUnit}
                    onChange={(e) => setForm({ ...form, weightBruttoUnit: e.target.value })}
                    placeholder="3.2"
                  />
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Объем 1 шт.</p>
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
                    type="number"
                    value={form.dimPackage.length}
                    onChange={(e) =>
                      setForm({ ...form, dimPackage: { ...form.dimPackage, length: e.target.value } })
                    }
                    placeholder="65"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Ширина, см"}</Label>
                  <Input
                    type="number"
                    value={form.dimPackage.width}
                    onChange={(e) =>
                      setForm({ ...form, dimPackage: { ...form.dimPackage, width: e.target.value } })
                    }
                    placeholder="65"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{"Высота, см"}</Label>
                  <Input
                    type="number"
                    value={form.dimPackage.height}
                    onChange={(e) =>
                      setForm({ ...form, dimPackage: { ...form.dimPackage, height: e.target.value } })
                    }
                    placeholder="28"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Вес нетто упаковки</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.weightNettoPackage}
                    onChange={(e) => setForm({ ...form, weightNettoPackage: e.target.value })}
                    placeholder="14.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Вес брутто упаковки</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.weightBruttoPackage}
                    onChange={(e) => setForm({ ...form, weightBruttoPackage: e.target.value })}
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
              <Button onClick={handleSave} className="flex-1">
                {editingId !== null ? "Сохранить" : "Добавить товар"}
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
