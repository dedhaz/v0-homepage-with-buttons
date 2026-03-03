/* ===== Shared types for Deals ===== */

export type Currency = "CNY" | "USD" | "RUB"

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CNY: "\u00A5",
  USD: "$",
  RUB: "\u20BD",
}

export interface DealRates {
  usd: number // manual USD rate for the deal
  cny: number // manual CNY rate for the deal
  cbUsd: number // Central Bank USD rate
  cbCny: number // Central Bank CNY rate
}

export type DeliveryMethod = "auto" | "rail" | "sea_rail"
export type Incoterms = "EXW" | "FOB" | "CIF" | "FCA" | "DAP" | "DDP" | "CFR" | "CPT"
export type ImporterType = "client" | "longan"
export type DeclarantType = "our" | "client"
export type PermitDocType = "" | "refusal" | "DS" | "SS" | "SGR" | "notification"

export const permitDocLabels: Record<string, string> = {
  "": "Нет",
  refusal: "Отказное",
  DS: "ДС",
  SS: "СС",
  SGR: "СГР",
  notification: "Нотификация",
}

export interface DealItem {
  tempId: string
  productId: number | null // null = manual entry
  article: string
  nameRu: string
  photo: string
  tnved: string
  description: string
  priceSale: number
  priceCurrency: Currency
  quantity: number
  dutyPercent: number
  vatPercent: number // 0 | 10 | 22
  excise: number // absolute value in RUB
  antiDumping: number // percent
  // from product card or manual
  dimUnitL: number // cm
  dimUnitW: number
  dimUnitH: number
  weightBruttoUnit: number // kg
  dimPackageL: number
  dimPackageW: number
  dimPackageH: number
  weightBruttoPackage: number
  qtyInPackage: number // 0 = no package info
  manualTotalVolume?: number // manual volume override in m3
  manualTotalWeight?: number // manual weight override in kg
}

export interface Deal {
  id: number
  number: string
  createdAt: string
  status: "draft" | "sent" | "approved" | "rejected"
  clientName: string
  supplierName: string
  cityFrom: string
  cityTo: string
  items: DealItem[]
  deliveryMethod: DeliveryMethod
  deliveryCostTotal: number
  deliveryCostCurrency: Currency
  deliveryCostBorder: number
  deliveryCostBorderCurrency: Currency
  deliveryCostRussia: number
  deliveryCostRussiaCurrency: Currency
  incoterms: Incoterms
  deliveryChinaLocal: number
  deliveryChinaLocalCurrency: Currency
  deliveryRussiaLocal: number
  deliveryRussiaLocalCurrency: Currency
  importer: ImporterType
  isClientImporter?: boolean
  importerClientName?: string
  isSupplierManufacturer?: boolean
  manufacturerSupplierName?: string
  hasPermitDocs: boolean
  permitDocs: { name: string; url: string }[]
  commissionPercent: number // importer commission %
  declarant: DeclarantType
  customsCostManual: number // manual override for DS cost, 0 = auto-calc
  commissionImporterUsd: number // flat commission $ (field 14)
  swiftUsd: number // SWIFT cost $
  rates: DealRates
  notes: string
}
