import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { SignupFlow } from "./SignupFlow"

export function SignupPageContent() {
  return (
    <PageShell className="bg-[color:var(--sc-surface)]">
      <Navbar disableSignupAction />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <SignupFlow />
      </main>

      <Footer />
    </PageShell>
  )
}
