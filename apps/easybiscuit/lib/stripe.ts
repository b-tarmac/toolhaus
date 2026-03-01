import { createStripeClientLazy } from "@portfolio/billing";

export const stripe = createStripeClientLazy(
  () => process.env.STRIPE_SECRET_KEY ?? ""
);

export const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
export const STRIPE_YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID;
