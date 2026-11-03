import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site-config"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteConfig.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.url}/cadastro/candidato/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/cadastro/empresa/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/privacidade/`, changeFrequency: "yearly", priority: 0.3 },
  ]
}
