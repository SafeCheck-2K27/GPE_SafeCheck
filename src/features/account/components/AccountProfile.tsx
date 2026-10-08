import { ShieldCheck } from "lucide-react"
import type { SafeCheckUser } from "@/components/safecheck/AuthProvider"
import { AccountSectionCard } from "./AccountSectionCard"

export function AccountProfile({ user }: { user: SafeCheckUser }) {
  return (
    <AccountSectionCard icon={ShieldCheck} title="Profil" description="Informations associées à ton compte.">
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-[color:var(--sc-text-muted)]">Pseudo</dt><dd className="font-semibold text-[color:var(--sc-text)] break-words">{user.pseudo}</dd></div>
        <div><dt className="text-[color:var(--sc-text-muted)]">Email</dt><dd className="font-semibold text-[color:var(--sc-text)] break-all">{user.email}</dd></div>
      </dl>
    </AccountSectionCard>
  )
}
