"use client"

import { useSyncExternalStore } from "react"

const BUILD_YEAR = new Date().getFullYear()
const subscribe = () => () => {}

/** Ano atual: vem do build no HTML e é atualizado no navegador (site estático). */
export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => BUILD_YEAR
  )
  return <>{year}</>
}
