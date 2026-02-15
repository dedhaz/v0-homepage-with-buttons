"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, Send, Check, User, Package, Truck, FileCheck } from "lucide-react"

const STEPS = [
  { id: 1, label: "Контакты", icon: User },
  { id: 2, label: "Товары", icon: Package },
  { id: 3, label: "Доставка и документы", icon: Truck },
  { id: 4, label: "Отправка", icon: FileCheck },
]

export function CalculatorForm() {
  const [step, setStep] = useState(1)

  const [contacts, setContacts] = useState({
    name: "",
    phone: "",
    telegram: "",
    email: "",
    comment: "",
  })

  const [weightMode, setWeightMode] = useState<"batch" | "unit">("batch")

  const [goods, setGoods] = useState({
    productName: "",
    quantity: "",
    pricePerUnit: "",
    currency: "RUB",
    weight: "",
    volume: "",
    link: "",
    note: "",
  })

  const [delivery, setDelivery] = useState({
    needSupplier: "discuss",
    importerContract: "discuss",
    exportLicense: "unknown",
    paymentFromRF: "unknown",
    permits: "unknown",
    deliveryMethod: "optimal",
  })

  const nextStep = () => setStep((s) => Math.min(s + 1, 4))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const parseNumber = (value: string) => {
    const normalized = value.replace(/\s/g, "").replace(",", ".").replace(/[^\d.-]/g, "")
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  const quantityNumber = parseNumber(goods.quantity)
  const pricePerUnitNumber = parseNumber(goods.pricePerUnit)
  const weightNumber = parseNumber(goods.weight)
  const volumeNumber = parseNumber(goods.volume)

  const totalAmount =
    quantityNumber !== null && pricePerUnitNumber !== null ? quantityNumber * pricePerUnitNumber : null
  const totalWeight =
    weightNumber !== null
      ? weightMode === "unit" && quantityNumber !== null
        ? weightNumber * quantityNumber
        : weightNumber
      : null
  const totalVolume =
    volumeNumber !== null
      ? weightMode === "unit" && quantityNumber !== null
        ? volumeNumber * quantityNumber
        : volumeNumber
      : null

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 3,
    }).format(value)

  return (
    <div className="grid gap-8 md:grid-cols-[280px_1fr]">
      {/* Left: Step navigation */}
      <aside className="hidden md:block">
        <nav className="sticky top-28 space-y-2">
          {STEPS.map((s) => {
            const isActive = step === s.id
            const isDone = step > s.id
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : isDone
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : s.id}
                </span>
                {s.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Mobile step indicator */}
      <div className="flex items-center justify-between md:hidden">
        {STEPS.map((s) => {
          const isActive = step === s.id
          const isDone = step > s.id
          return (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-accent text-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : s.id}
              </span>
              <span
                className={`text-[10px] ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                {s.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Right: Form content */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        {/* Step 1: Contacts */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Контакты</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Основное общение ведем в Telegram — оставьте контакты, а детали уточним в чате.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Ваше имя</Label>
                <Input
                  id="name"
                  placeholder="Иван Иванов"
                  value={contacts.name}
                  onChange={(e) => setContacts({ ...contacts, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={contacts.phone}
                  onChange={(e) => setContacts({ ...contacts, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram (юзернейм)</Label>
                <Input
                  id="telegram"
                  placeholder="@username"
                  value={contacts.telegram}
                  onChange={(e) => setContacts({ ...contacts, telegram: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">{"Если без @ — тоже ок, мы поправим."}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (необязательно)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  value={contacts.email}
                  onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Коротко о задаче (необязательно)</Label>
              <Textarea
                id="comment"
                placeholder="Опишите что хотите привезти, объемы, сроки..."
                rows={3}
                value={contacts.comment}
                onChange={(e) => setContacts({ ...contacts, comment: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={nextStep} className="gap-2">
                {"Далее: товары"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Goods */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Товары</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Поля по товару необязательные — можно заполнить минимум, а детали уточним в чате.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productName">Название товара</Label>
                <Input
                  id="productName"
                  placeholder="Например: светодиодные лампы"
                  value={goods.productName}
                  onChange={(e) => setGoods({ ...goods, productName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Количество (шт/партия)</Label>
                <Input
                  id="quantity"
                  placeholder="1000 шт"
                  value={goods.quantity}
                  onChange={(e) => setGoods({ ...goods, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Цена за 1 шт.</Label>
                <div className="flex gap-2">
                  <Input
                    id="pricePerUnit"
                    placeholder="150"
                    value={goods.pricePerUnit}
                    onChange={(e) => setGoods({ ...goods, pricePerUnit: e.target.value })}
                    className="flex-1"
                  />
                  <select
                    value={goods.currency}
                    onChange={(e) => setGoods({ ...goods, currency: e.target.value })}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="RUB">Рубли</option>
                    <option value="CNY">Юани</option>
                    <option value="USD">Доллары</option>
                  </select>
                </div>
              </div>
              <div className="col-span-full">
                <Label className="mb-2 block">Вес / Объем указаны за</Label>
                <div className="flex rounded-lg border border-border bg-background p-1">
                  <button
                    type="button"
                    onClick={() => setWeightMode("batch")}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      weightMode === "batch"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Партия
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightMode("unit")}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      weightMode === "unit"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Штука
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">
                  {weightMode === "batch" ? "Вес партии (кг)" : "Вес 1 шт. (кг)"}
                </Label>
                <Input
                  id="weight"
                  placeholder={weightMode === "batch" ? "500" : "0.5"}
                  value={goods.weight}
                  onChange={(e) => setGoods({ ...goods, weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">
                  {weightMode === "batch" ? "Объем партии (м\u00B3)" : "Объем 1 шт. (м\u00B3)"}
                </Label>
                <Input
                  id="volume"
                  placeholder={weightMode === "batch" ? "2.5" : "0.01"}
                  value={goods.volume}
                  onChange={(e) => setGoods({ ...goods, volume: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Ссылка на товар (необязательно)</Label>
              <Input
                id="link"
                placeholder="https://1688.com/..."
                value={goods.link}
                onChange={(e) => setGoods({ ...goods, link: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Примечание (необязательно)</Label>
              <Textarea
                id="note"
                placeholder="Особые требования к упаковке, маркировке и т.д."
                rows={3}
                value={goods.note}
                onChange={(e) => setGoods({ ...goods, note: e.target.value })}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <Button onClick={nextStep} className="gap-2">
                {"Далее: доставка"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Delivery & Docs */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Доставка и документы</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Укажите параметры доставки и наличие документов.
              </p>
            </div>

            <div className="space-y-5">
              <fieldset className="space-y-3">
                <Label>Требуется поиск поставщика?</Label>
                <RadioGroup value={delivery.needSupplier} onValueChange={(v) => setDelivery({ ...delivery, needSupplier: v })}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="discuss" id="supplier-discuss" />
                    <Label htmlFor="supplier-discuss" className="font-normal">{"Не знаю / обсудим"}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="supplier-yes" />
                    <Label htmlFor="supplier-yes" className="font-normal">Да, нужен поиск</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="supplier-no" />
                    <Label htmlFor="supplier-no" className="font-normal">Нет, поставщик есть</Label>
                  </div>
                </RadioGroup>
              </fieldset>

              <fieldset className="space-y-3">
                <Label>На чей контракт везем (кто импортер)?</Label>
                <RadioGroup value={delivery.importerContract} onValueChange={(v) => setDelivery({ ...delivery, importerContract: v })}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="discuss" id="importer-discuss" />
                    <Label htmlFor="importer-discuss" className="font-normal">Обсудим</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="self" id="importer-self" />
                    <Label htmlFor="importer-self" className="font-normal">Я буду импортером</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sklad13" id="importer-sklad" />
                    <Label htmlFor="importer-sklad" className="font-normal">{"Импортер — Склад 13"}</Label>
                  </div>
                </RadioGroup>
              </fieldset>

              <fieldset className="space-y-3">
                <Label>Разрешительные документы на товар</Label>
                <RadioGroup value={delivery.permits} onValueChange={(v) => setDelivery({ ...delivery, permits: v })}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="unknown" id="permits-unknown" />
                    <Label htmlFor="permits-unknown" className="font-normal">Не знаю</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="have" id="permits-have" />
                    <Label htmlFor="permits-have" className="font-normal">Есть</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="need" id="permits-need" />
                    <Label htmlFor="permits-need" className="font-normal">Нужно заказать</Label>
                  </div>
                </RadioGroup>
              </fieldset>

              <fieldset className="space-y-3">
                <Label>Способ доставки</Label>
                <RadioGroup value={delivery.deliveryMethod} onValueChange={(v) => setDelivery({ ...delivery, deliveryMethod: v })}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="optimal" id="method-optimal" />
                    <Label htmlFor="method-optimal" className="font-normal">Подберите оптимальный</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sea-rail" id="method-sea-rail" />
                    <Label htmlFor="method-sea-rail" className="font-normal">{"Море + ЖД"}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="rail" id="method-rail" />
                    <Label htmlFor="method-rail" className="font-normal">ЖД</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="auto" id="method-auto" />
                    <Label htmlFor="method-auto" className="font-normal">Авто</Label>
                  </div>
                </RadioGroup>
              </fieldset>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <Button onClick={nextStep} className="gap-2">
                {"Далее: отправка"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Проверьте данные</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {"Проверьте данные и нажмите \"Отправить\". Мы свяжемся с вами в Telegram."}
              </p>
            </div>

            <div className="space-y-4">
              {/* Contacts summary */}
              <div className="rounded-xl border border-border bg-background p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <User className="h-4 w-4" />
                  Контакты
                </h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  {contacts.name && (
                    <div>
                      <dt className="text-muted-foreground">Имя</dt>
                      <dd className="font-medium text-foreground">{contacts.name}</dd>
                    </div>
                  )}
                  {contacts.phone && (
                    <div>
                      <dt className="text-muted-foreground">Телефон</dt>
                      <dd className="font-medium text-foreground">{contacts.phone}</dd>
                    </div>
                  )}
                  {contacts.telegram && (
                    <div>
                      <dt className="text-muted-foreground">Telegram</dt>
                      <dd className="font-medium text-foreground">{contacts.telegram}</dd>
                    </div>
                  )}
                  {contacts.email && (
                    <div>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium text-foreground">{contacts.email}</dd>
                    </div>
                  )}
                </dl>
                {contacts.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">{contacts.comment}</p>
                )}
              </div>

              {/* Goods summary */}
              <div className="rounded-xl border border-border bg-background p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Package className="h-4 w-4" />
                  Товары
                </h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  {goods.productName && (
                    <div>
                      <dt className="text-muted-foreground">Товар</dt>
                      <dd className="font-medium text-foreground">{goods.productName}</dd>
                    </div>
                  )}
                  {goods.quantity && (
                    <div>
                      <dt className="text-muted-foreground">Количество</dt>
                      <dd className="font-medium text-foreground">{goods.quantity}</dd>
                    </div>
                  )}
                  {goods.pricePerUnit && (
                    <div>
                      <dt className="text-muted-foreground">Цена за 1 шт.</dt>
                      <dd className="font-medium text-foreground">
                        {goods.pricePerUnit}{" "}
                        {goods.currency === "RUB" && "руб."}
                        {goods.currency === "CNY" && "юань"}
                        {goods.currency === "USD" && "$"}
                      </dd>
                    </div>
                  )}
                  {goods.weight && (
                    <div>
                      <dt className="text-muted-foreground">
                        {weightMode === "batch" ? "Вес партии" : "Вес 1 шт."}
                      </dt>
                      <dd className="font-medium text-foreground">{goods.weight} кг</dd>
                    </div>
                  )}
                  {goods.volume && (
                    <div>
                      <dt className="text-muted-foreground">
                        {weightMode === "batch" ? "Объем партии" : "Объем 1 шт."}
                      </dt>
                      <dd className="font-medium text-foreground">{goods.volume} {"\u043C\u00B3"}</dd>
                    </div>
                  )}
                  {totalAmount !== null && (
                    <div>
                      <dt className="text-muted-foreground">Сумма</dt>
                      <dd className="font-medium text-foreground">
                        {formatNumber(totalAmount)}{" "}
                        {goods.currency === "RUB" && "руб."}
                        {goods.currency === "CNY" && "юань"}
                        {goods.currency === "USD" && "$"}
                      </dd>
                    </div>
                  )}
                  {totalWeight !== null && (
                    <div>
                      <dt className="text-muted-foreground">Итого вес</dt>
                      <dd className="font-medium text-foreground">{formatNumber(totalWeight)} кг</dd>
                    </div>
                  )}
                  {totalVolume !== null && (
                    <div>
                      <dt className="text-muted-foreground">Итого объем</dt>
                      <dd className="font-medium text-foreground">{formatNumber(totalVolume)} м³</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Delivery summary */}
              <div className="rounded-xl border border-border bg-background p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Truck className="h-4 w-4" />
                  Доставка
                </h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Поиск поставщика</dt>
                    <dd className="font-medium text-foreground">
                      {delivery.needSupplier === "discuss" && "Не знаю / обсудим"}
                      {delivery.needSupplier === "yes" && "Да, нужен поиск"}
                      {delivery.needSupplier === "no" && "Нет, поставщик есть"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Импортер</dt>
                    <dd className="font-medium text-foreground">
                      {delivery.importerContract === "discuss" && "Обсудим"}
                      {delivery.importerContract === "self" && "Я буду импортером"}
                      {delivery.importerContract === "sklad13" && "Склад 13"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Способ доставки</dt>
                    <dd className="font-medium text-foreground">
                      {delivery.deliveryMethod === "optimal" && "Подберите оптимальный"}
                      {delivery.deliveryMethod === "sea-rail" && "Море + ЖД"}
                      {delivery.deliveryMethod === "rail" && "ЖД"}
                      {delivery.deliveryMethod === "auto" && "Авто"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Разрешительные документы</dt>
                    <dd className="font-medium text-foreground">
                      {delivery.permits === "unknown" && "Не знаю"}
                      {delivery.permits === "have" && "Есть"}
                      {delivery.permits === "need" && "Нужно заказать"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <Button
                className="gap-2"
                asChild
              >
                <a
                  href={`https://t.me/sklad13white?text=${encodeURIComponent(
                   `Заявка на расчет доставки

Имя: ${contacts.name}
Телефон: ${contacts.phone}
Telegram: ${contacts.telegram}
Email: ${contacts.email}
Комментарий: ${contacts.comment}

Товар: ${goods.productName}
Количество: ${goods.quantity}
Цена за 1 шт: ${goods.pricePerUnit} ${goods.currency === "RUB" ? "руб." : goods.currency === "CNY" ? "юань" : "$"}
${weightMode === "batch" ? "Вес партии" : "Вес 1 шт."}: ${goods.weight} кг
${weightMode === "batch" ? "Объем партии" : "Объем 1 шт."}: ${goods.volume} м³
Сумма: ${totalAmount !== null ? `${formatNumber(totalAmount)} ${goods.currency === "RUB" ? "руб." : goods.currency === "CNY" ? "юань" : "$"}` : "не указана"}
Итого вес: ${totalWeight !== null ? `${formatNumber(totalWeight)} кг` : "не указан"}
Итого объем: ${totalVolume !== null ? `${formatNumber(totalVolume)} м³` : "не указан"}
Ссылка: ${goods.link}

Поиск поставщика: ${delivery.needSupplier}
Импортер: ${delivery.importerContract}
Способ доставки: ${delivery.deliveryMethod}
Документы: ${delivery.permits}`  
                    )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Отправить заявку
                  <Send className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
