import Image from "next/image"
import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { CurrentYear } from "@/components/site/current-year"
import { navLinks } from "@/lib/nav"
import { getPublicConfig } from "@/lib/public-config"
import { siteConfig } from "@/lib/site-config"

export async function Footer({ onHome = true }: { onHome?: boolean }) {
  const cfg = await getPublicConfig()
  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`)
  return (
    <footer id="contato" className="bg-ink text-paper/85 scroll-mt-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <div className="bg-paper inline-flex rounded-2xl p-3">
            <Image
              src="/logo-md.webp"
              alt="YL Empregabilidade"
              width={308}
              height={360}
              className="h-24 w-auto"
            />
          </div>
          <p className="mt-5 max-w-xs leading-relaxed">
            Conectando talentos às oportunidades certas, com eficiência e humanidade.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <h2 className="text-paper font-sans text-sm font-semibold tracking-wider uppercase">
            Navegue
          </h2>
          <ul className="mt-4 space-y-1">
            {navLinks
              .filter((l) => l.id !== "contato")
              .map((l) => (
                <li key={l.id}>
                  <a href={href(l.id)} className="hover:text-amber inline-flex min-h-9 items-center">
                    {l.label}
                  </a>
                </li>
              ))}
            <li>
              <Link href="/entrar/" className="hover:text-amber inline-flex min-h-9 items-center">
                Entrar
              </Link>
            </li>
            <li>
              <Link href="/cadastro/candidato/" className="hover:text-amber inline-flex min-h-9 items-center">
                Criar conta
              </Link>
            </li>
            <li>
              <Link href="/privacidade/" className="hover:text-amber inline-flex min-h-9 items-center">
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-paper font-sans text-sm font-semibold tracking-wider uppercase">
            Contato
          </h2>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href={`mailto:${cfg.email}`}
                className="hover:text-amber inline-flex min-h-9 items-center gap-2.5 break-all"
              >
                <Mail className="text-amber size-4 shrink-0" aria-hidden />
                {cfg.email}
              </a>
            </li>
            {cfg.phone && (
              <li>
                <a
                  href={`tel:${cfg.phone.replace(/\D/g, "")}`}
                  className="hover:text-amber inline-flex min-h-9 items-center gap-2.5"
                >
                  <Phone className="text-amber size-4 shrink-0" aria-hidden />
                  {cfg.phone}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <MapPin className="text-amber mt-1 size-4 shrink-0" aria-hidden />
              <span>{cfg.address ? `${cfg.address} · ` : ""}{siteConfig.city}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-paper/10 border-t">
        <div className="text-paper/70 mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © <CurrentYear /> {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p>CNPJ {siteConfig.cnpj}</p>
        </div>
      </div>
    </footer>
  )
}
