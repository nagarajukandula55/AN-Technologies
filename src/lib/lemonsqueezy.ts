const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

export const PLANS = {
  PRO: {
    name: "Pro",
    variantId: process.env.LEMONSQUEEZY_VARIANT_PRO ?? "",
    price: 9,
    features: [
      "Unlimited use of every tool",
      "No watermark on any export",
      "Priority support",
    ],
  },
  BUSINESS: {
    name: "Business",
    variantId: process.env.LEMONSQUEEZY_VARIANT_BUSINESS ?? "",
    price: 29,
    features: [
      "Everything in Pro",
      "Team seats (5)",
      "API access",
      "Bulk processing",
    ],
  },
} as const;

type CheckoutParams = {
  variantId: string;
  userId: string;
  userEmail: string;
  plan: keyof typeof PLANS;
};

export async function createCheckout({ variantId, userId, userEmail, plan }: CheckoutParams) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey || !storeId) {
    throw new Error("Lemon Squeezy is not configured");
  }

  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId, plan },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Lemon Squeezy checkout creation failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  return json.data.attributes.url as string;
}

type ListingCheckoutParams = {
  variantId: string;
  userId: string;
  userEmail: string;
  listingSlug?: string;
  bundleSlug?: string;
};

// Same Lemon Squeezy checkout as createCheckout, but keyed to a Listing/Bundle rather than
// the fixed PLANS map - custom_data here is what the webhook reads to grant per-listing
// Entitlement rows instead of updating the single global Subscription.
export async function createListingCheckout({ variantId, userId, userEmail, listingSlug, bundleSlug }: ListingCheckoutParams) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey || !storeId) {
    throw new Error("Lemon Squeezy is not configured");
  }

  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId, listing_slug: listingSlug, bundle_slug: bundleSlug },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?purchased=1`,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Lemon Squeezy checkout creation failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  return json.data.attributes.url as string;
}
