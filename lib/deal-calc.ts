import type { Deal, DealItem, DealRates, Currency } from "./deal-types"

/* ======= Helpers ======= */

export function toRub(amount: number, currency: Currency, rates: DealRates): number {
  if (currency === "RUB") return amount
  if (currency === "USD") return amount * rates.usd
  return amount * rates.cny
}

export function fmtNum(n: number, decimals = 2): string {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/* Volume of one unit in m3 (from cm) */
function unitVolume(item: DealItem): number {
  const l = item.dimUnitL
  const w = item.dimUnitW
  const h = item.dimUnitH
  if (!l || !w || !h) return 0
  return (l * w * h) / 1_000_000
}

/* Volume of one package in m3 (from cm) */
function packageVolume(item: DealItem): number {
  const l = item.dimPackageL
  const w = item.dimPackageW
  const h = item.dimPackageH
  if (!l || !w || !h) return 0
  return (l * w * h) / 1_000_000
}

/* ======= Per-item calculations ======= */

export interface ItemCalc {
  item: DealItem
  totalPriceOriginal: number // price * qty in original currency
  totalPriceRub: number
  totalVolume: number // m3
  totalWeight: number // kg brutto
  deliveryShareRub: number // delivery allocated to this item
  dutyBaseRub: number // (item cost + china local delivery share) in RUB
  dutyRub: number // dutyBase * dutyPercent
  exciseRub: number
  antiDumpingRub: number
  vatBaseRub: number // (item cost + delivery + duty + excise + antiDumping)
  vatRub: number
  customsTotal: number // duty + vat + excise + antiDumping
}

export interface DealCalcResult {
  items: ItemCalc[]
  totalGoodsRub: number
  totalGoodsOriginal: number
  totalVolume: number
  totalWeight: number
  deliveryTotalRub: number
  deliveryChinaLocalRub: number
  deliveryRussiaLocalRub: number
  customsFee: number // 25000 base or manual
  totalDuty: number
  totalVat: number
  totalExcise: number
  totalAntiDumping: number
  totalCustomsPayments: number // duty + vat + excise + antiDumping
  invoiceCommissionRub: number // importer commission on invoice
  invoiceCommissionOriginal: number
  commissionImporterRub: number // flat $ commission
  swiftRub: number
  grandTotal: number
}

export function calcDeal(deal: Deal): DealCalcResult {
  const rates = deal.rates

  /* --- per-item volume & weight --- */
  const itemCalcs: ItemCalc[] = deal.items.map((item) => {
    const totalPriceOriginal = item.priceSale * item.quantity
    const totalPriceRub = toRub(totalPriceOriginal, item.priceCurrency, rates)

    let totalVolume: number
    let totalWeight: number

    const hasPackageInfo = item.qtyInPackage > 0 && packageVolume(item) > 0
    if (hasPackageInfo) {
      // calculate by packages
      const packages = Math.ceil(item.quantity / item.qtyInPackage)
      totalVolume = packages * packageVolume(item)
      totalWeight = packages * item.weightBruttoPackage
    } else {
      // per-unit calc: volume * 1.2
      const uVol = unitVolume(item)
      totalVolume = uVol > 0 ? uVol * item.quantity * 1.2 : 0
      totalWeight = item.weightBruttoUnit * item.quantity
    }

    return {
      item,
      totalPriceOriginal,
      totalPriceRub,
      totalVolume,
      totalWeight,
      deliveryShareRub: 0,
      dutyBaseRub: 0,
      dutyRub: 0,
      exciseRub: 0,
      antiDumpingRub: 0,
      vatBaseRub: 0,
      vatRub: 0,
      customsTotal: 0,
    }
  })

  /* --- totals --- */
  const totalVolume = itemCalcs.reduce((s, ic) => s + ic.totalVolume, 0)
  const totalWeight = itemCalcs.reduce((s, ic) => s + ic.totalWeight, 0)
  const totalGoodsRub = itemCalcs.reduce((s, ic) => s + ic.totalPriceRub, 0)
  const totalGoodsOriginal = itemCalcs.reduce((s, ic) => s + ic.totalPriceOriginal, 0)

  /* --- delivery --- */
  const deliveryTotalRub = toRub(deal.deliveryCostTotal, deal.deliveryCostCurrency, rates)
  const deliveryChinaLocalRub = toRub(deal.deliveryChinaLocal, deal.deliveryChinaLocalCurrency, rates)
  const deliveryRussiaLocalRub = toRub(deal.deliveryRussiaLocal, deal.deliveryRussiaLocalCurrency, rates)

  /* --- distribute delivery to items by volume, weight, or cost --- */
  for (const ic of itemCalcs) {
    if (totalVolume > 0) {
      ic.deliveryShareRub = deliveryTotalRub * (ic.totalVolume / totalVolume)
    } else if (totalWeight > 0) {
      ic.deliveryShareRub = deliveryTotalRub * (ic.totalWeight / totalWeight)
    } else if (totalGoodsRub > 0) {
      ic.deliveryShareRub = deliveryTotalRub * (ic.totalPriceRub / totalGoodsRub)
    }
  }

  /* --- customs per item --- */
  for (const ic of itemCalcs) {
    // distribute china local delivery similarly
    let chinaDeliveryShare = 0
    if (totalVolume > 0) {
      chinaDeliveryShare = deliveryChinaLocalRub * (ic.totalVolume / totalVolume)
    } else if (totalWeight > 0) {
      chinaDeliveryShare = deliveryChinaLocalRub * (ic.totalWeight / totalWeight)
    } else if (totalGoodsRub > 0) {
      chinaDeliveryShare = deliveryChinaLocalRub * (ic.totalPriceRub / totalGoodsRub)
    }

    // duty base: (goods cost + china local delivery) in RUB
    ic.dutyBaseRub = ic.totalPriceRub + chinaDeliveryShare
    ic.dutyRub = ic.dutyBaseRub * (ic.item.dutyPercent / 100)

    // excise
    ic.exciseRub = ic.item.excise * ic.item.quantity

    // anti-dumping
    ic.antiDumpingRub = ic.dutyBaseRub * (ic.item.antiDumping / 100)

    // VAT base: goods + delivery share + duty + excise + antiDumping
    ic.vatBaseRub = ic.totalPriceRub + ic.deliveryShareRub + ic.dutyRub + ic.exciseRub + ic.antiDumpingRub
    ic.vatRub = ic.vatBaseRub * (ic.item.vatPercent / 100)

    ic.customsTotal = ic.dutyRub + ic.vatRub + ic.exciseRub + ic.antiDumpingRub
  }

  const totalDuty = itemCalcs.reduce((s, ic) => s + ic.dutyRub, 0)
  const totalVat = itemCalcs.reduce((s, ic) => s + ic.vatRub, 0)
  const totalExcise = itemCalcs.reduce((s, ic) => s + ic.exciseRub, 0)
  const totalAntiDumping = itemCalcs.reduce((s, ic) => s + ic.antiDumpingRub, 0)
  const totalCustomsPayments = totalDuty + totalVat + totalExcise + totalAntiDumping

  /* --- customs fee (DS) --- */
  const itemCount = deal.items.length
  let customsFee: number
  if (deal.declarant === "our") {
    if (deal.customsCostManual > 0) {
      customsFee = deal.customsCostManual
    } else {
      customsFee = itemCount <= 5 ? 25000 : 25000 + (itemCount - 5) * 600
    }
  } else {
    customsFee = 0
  }

  /* --- importer commission (on invoice) --- */
  let invoiceCommissionRub = 0
  let invoiceCommissionOriginal = 0
  if (deal.importer === "longan" && deal.commissionPercent > 0) {
    invoiceCommissionOriginal = totalGoodsOriginal * (deal.commissionPercent / 100)
    invoiceCommissionRub = totalGoodsRub * (deal.commissionPercent / 100)
  }

  /* --- flat commission & swift --- */
  const commissionImporterRub = deal.commissionImporterUsd * rates.usd
  const swiftRub = deal.swiftUsd * rates.usd

  /* --- grand total --- */
  const grandTotal =
    totalGoodsRub +
    deliveryTotalRub +
    deliveryChinaLocalRub +
    deliveryRussiaLocalRub +
    totalCustomsPayments +
    customsFee +
    invoiceCommissionRub +
    commissionImporterRub +
    swiftRub

  return {
    items: itemCalcs,
    totalGoodsRub,
    totalGoodsOriginal,
    totalVolume,
    totalWeight,
    deliveryTotalRub,
    deliveryChinaLocalRub,
    deliveryRussiaLocalRub,
    customsFee,
    totalDuty,
    totalVat,
    totalExcise,
    totalAntiDumping,
    totalCustomsPayments,
    invoiceCommissionRub,
    invoiceCommissionOriginal,
    commissionImporterRub,
    swiftRub,
    grandTotal,
  }
}
