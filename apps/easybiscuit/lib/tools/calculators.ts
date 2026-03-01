/** VAT / GST Calculator */
export function calcVat(amount: number, ratePercent: number) {
  const tax = (amount * ratePercent) / 100;
  return { tax, total: amount + tax };
}

/** Profit Margin: cost + margin% -> selling price */
export function calcProfitMargin(cost: number, marginPercent: number) {
  const sellingPrice = cost / (1 - marginPercent / 100);
  const profit = sellingPrice - cost;
  return { sellingPrice, profit, marginPercent };
}

/** Markup: cost + markup% -> selling price */
export function calcMarkup(cost: number, markupPercent: number) {
  const sellingPrice = cost * (1 + markupPercent / 100);
  const profit = sellingPrice - cost;
  return { sellingPrice, profit, markupPercent };
}

/** Discount: original - discount% -> final price */
export function calcDiscount(original: number, discountPercent: number) {
  const savings = (original * discountPercent) / 100;
  const finalPrice = original - savings;
  return { finalPrice, savings, discountPercent };
}

/** Break-even: fixed costs / (price per unit - variable cost per unit) */
export function calcBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  pricePerUnit: number
) {
  const contribution = pricePerUnit - variableCostPerUnit;
  if (contribution <= 0) return { breakEvenUnits: null, contribution };
  const breakEvenUnits = fixedCosts / contribution;
  return { breakEvenUnits, contribution };
}

/** Hourly rate from annual salary and weekly hours */
export function calcHourlyRate(annualIncome: number, hoursPerWeek: number) {
  const weeksPerYear = 52;
  const annualHours = hoursPerWeek * weeksPerYear;
  const hourlyRate = annualIncome / annualHours;
  return { hourlyRate, annualHours };
}

/** Late payment interest: principal * rate * days / 365 */
export function calcLatePaymentInterest(
  principal: number,
  annualRatePercent: number,
  daysLate: number
) {
  const interest = (principal * (annualRatePercent / 100) * daysLate) / 365;
  return { interest, total: principal + interest };
}
