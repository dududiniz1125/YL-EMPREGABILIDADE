import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify, type JWTPayload } from "jose"

import type { Role } from "@/lib/roles"
import { SUPABASE_URL } from "./env"

export type Claims = JWTPayload & { sub: string; email?: string; app_metadata?: { role?: Role } }

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
const secret = process.env.SUPABASE_JWT_SECRET ? new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET) : null

/**
 * Valida o access token do Supabase SEM ir à rede:
 * - chaves assimétricas (ES256/RS256): usa o JWKS do projeto (baixado uma vez e guardado em cache);
 * - chave simétrica (HS256): usa SUPABASE_JWT_SECRET (a integração da Vercel cria essa variável).
 * Devolve null se o token for inválido/expirado ou se não der para validar localmente.
 */
export async function verifyAccessToken(token: string | undefined | null): Promise<Claims | null> {
  if (!token) return null
  try {
    const { alg } = decodeProtectedHeader(token)
    if (alg === "HS256") {
      if (!secret) return null
      const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] })
      return payload.sub ? (payload as Claims) : null
    }
    jwks ??= createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`), { cacheMaxAge: 10 * 60_000 })
    const { payload } = await jwtVerify(token, jwks)
    return payload.sub ? (payload as Claims) : null
  } catch {
    return null
  }
}
