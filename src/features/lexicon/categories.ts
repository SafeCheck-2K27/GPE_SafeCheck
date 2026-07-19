import type { ComponentType } from "react"
import {
  Bug,
  Cpu,
  Database,
  Globe,
  KeyRound,
  Lock,
  Network,
  ShieldCheck,
} from "lucide-react"
import { DOMAINS, type DomainId } from "./data"

export const LEXICON_DOMAIN_ICONS: Record<
  DomainId,
  ComponentType<{ className?: string }>
> = {
  cybersecurite: ShieldCheck,
  comptes: KeyRound,
  donnees: Lock,
  web: Globe,
  reseau: Network,
  logiciels: Bug,
  hardware: Cpu,
  "data-ia": Database,
}

export function getLexiconDomain(domainId: DomainId) {
  return DOMAINS.find((domain) => domain.id === domainId)
}
