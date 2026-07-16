import Stripe from "stripe";

let _stripe: Stripe | null = null;

// Lazily instantiated so the app can build/run without STRIPE_SECRET_KEY set
// (e.g. before Stripe is configured); only routes that actually use Stripe
// need the key at request time.
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-06-24.dahlia",
    });
  }
  return _stripe;
}

export const PLANS = {
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
    price: 9,
    features: [
      "Unlimited PDF operations",
      "Unlimited QR/Barcode generation",
      "No watermark",
      "Priority support",
    ],
  },
  BUSINESS: {
    name: "Business",
    priceId: process.env.STRIPE_PRICE_BUSINESS ?? "",
    price: 29,
    features: [
      "Everything in Pro",
      "Team seats (5)",
      "API access",
      "Bulk processing",
    ],
  },
} as const;
