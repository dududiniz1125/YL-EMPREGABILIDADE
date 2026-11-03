import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Site 100% estático: gera a pasta `out/` (Vercel ou qualquer host estático)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
