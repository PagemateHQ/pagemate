import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  const now = new Date().toISOString()
  const routes = [
    "/",
    "/plans",
    "/products",
    "/support",
    "/quote",
    "/claims",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
  ]
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.6,
  }))
}
