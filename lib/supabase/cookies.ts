import type { CookieOptions } from "@supabase/ssr"

import { REMEMBER_COOKIE } from "./env"

/** Se o usuário pediu para não continuar conectado, os cookies viram "de sessão". */
export function applyRemember(options: CookieOptions, remember: boolean): CookieOptions {
  if (remember) return options
  const { maxAge: _maxAge, expires: _expires, ...rest } = options
  void _maxAge
  void _expires
  return rest
}

export function readRemember(get: (name: string) => string | undefined) {
  return get(REMEMBER_COOKIE) !== "0"
}
