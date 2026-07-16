import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const routes = [
    "",
    "/pricing",
    "/tools",
    "/tools/pdf",
    "/tools/qr",
    "/tools/invoice",
    "/tools/resume",
    "/tools/signature",
    "/tools/image-resizer",
    "/tools/image-compressor",
    "/tools/watermark",
    "/tools/json-formatter",
    "/tools/base64",
    "/tools/password-generator",
    "/tools/color-picker",
    "/tools/text-compare",
    "/tools/csv-cleaner",
    "/tools/markdown-editor",
    "/tools/email-validator",
    "/tools/image-converter",
    "/tools/gst-calculator",
    "/tools/api-tester",
    "/tools/ocr",
    "/legal/terms",
    "/legal/privacy",
    "/legal/refund",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/tools") ? 0.8 : 0.5,
  }));
}
