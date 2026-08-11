import { AUDIT_LEVELS } from "../levels"
import { AuditBenefits } from "./AuditBenefits"
import { AuditLevelCard } from "./AuditLevelCard"

export function AuditsCatalog() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-10 md:py-14">
      <div className="flex flex-col gap-5">
        {AUDIT_LEVELS.map((audit, index) => (
          <AuditLevelCard key={audit.id} audit={audit} index={index} />
        ))}
      </div>

      <AuditBenefits />
    </section>
  )
}
