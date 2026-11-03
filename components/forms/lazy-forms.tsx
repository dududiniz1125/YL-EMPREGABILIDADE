"use client"

import dynamic from "next/dynamic"

/**
 * Formulários renderizados no servidor (aparecem no HTML, sem depender de
 * clique ou de JavaScript para serem vistos). O JS de validação vem em
 * um pedaço separado do bundle.
 */
export const LazyCandidatoForm = dynamic(() => import("@/components/forms/candidato-form"))
export const LazyEmpresaForm = dynamic(() => import("@/components/forms/empresa-form"))
