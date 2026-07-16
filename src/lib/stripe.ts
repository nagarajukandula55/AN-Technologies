import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-06-24.dahlia",
});

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
