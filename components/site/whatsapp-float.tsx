import { PulsatingButton } from "@/components/magicui/pulsating-button"
import { whatsappLink } from "@/lib/site-config"

/** Ícone genérico de balão de conversa com telefone (sem marca registrada). */
function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 8.4c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .5.5.9 1.3 1.7 2.2 2.2.2.1.4.1.5 0l.6-.5c.2-.1.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.5.3-1.3.5-2.1.3-2.3-.6-4.5-2.8-5.1-5.1-.2-.8 0-1.6.3-2.1Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function WhatsappFloat() {
  const href = whatsappLink()
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a YL pelo WhatsApp"
      className="fixed right-4 bottom-4 z-40 rounded-full sm:right-6 sm:bottom-6"
    >
      <PulsatingButton
        tabIndex={-1}
        aria-hidden
        pulseColor="rgb(63 110 31 / 0.35)"
        duration="2.4s"
        className="bg-sprout-deep size-14 rounded-full p-0 text-white shadow-lg"
      >
        <ChatIcon className="size-7" />
      </PulsatingButton>
    </a>
  )
}
