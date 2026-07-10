"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { ScButton } from "@/components/safecheck/primitives"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { Shield, Check, Eye, EyeOff } from "lucide-react"

export default function CreerComptePage() {
  const router = useRouter()
  const auth = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", password: "", pseudo: "", age: "", pays: "France",
  })

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const canSubmitStep1 = form.email.trim().length > 0 && form.password.length >= 8
  const canSubmitStep2 = form.pseudo.trim().length > 0

  const handleCreateAccount = async () => {
    if (!canSubmitStep2 || submitting) return
    setSubmitting(true)
    try {
      await auth.signup({
        email: form.email.trim(),
        password: form.password,
        pseudo: form.pseudo.trim(),
        prenom: form.prenom.trim() || undefined,
        nom: form.nom.trim() || undefined,
        age: form.age.trim() || undefined,
        pays: form.pays,
      })
      router.push("/compte")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] font-sans">
      <Navbar onSignupClick={() => {}} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div
          className="w-full max-w-md rounded-xl p-7"
          style={{ background: "#F6F6F6", border: "1px solid #AEAEAE", boxShadow: "4px 4px 0px #C0DDF8" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-[#157FE2]" />
            <h1 className="text-xl font-extrabold text-[#000]">Créer un compte SafeCheck</h1>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "text-white" : "text-[#AEAEAE] bg-[#E8E8E8]"}`}
                  style={step >= s ? { background: "linear-gradient(to right, #6BB7FF, #157FE2)" } : {}}
                >
                  {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 2 && <div className={`h-0.5 w-16 ${step > s ? "bg-[#157FE2]" : "bg-[#E8E8E8]"}`} />}
              </div>
            ))}
            <span className="text-xs text-[#AEAEAE] ml-2">Étape {step}/2</span>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#000] mb-1">Informations personnelles</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#000] mb-1">Prénom</label>
                  <input type="text" value={form.prenom} onChange={(e) => update("prenom", e.target.value)} placeholder="Alaan" className="w-full px-3 py-2 rounded border border-[#AEAEAE] text-sm bg-white focus:outline-none focus:border-[#157FE2]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#000] mb-1">Nom</label>
                  <input type="text" value={form.nom} onChange={(e) => update("nom", e.target.value)} placeholder="Smithe" className="w-full px-3 py-2 rounded border border-[#AEAEAE] text-sm bg-white focus:outline-none focus:border-[#157FE2]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#000] mb-1">Adresse email</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="exemple@mail.com" className="w-full px-3 py-2 rounded border border-[#AEAEAE] text-sm bg-white focus:outline-none focus:border-[#157FE2]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#000] mb-1">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="12 caractères minimum"
                    className="w-full px-3 py-2 rounded border border-[#AEAEAE] text-sm bg-white focus:outline-none focus:border-[#157FE2] pr-9"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#AEAEAE]">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength indicator */}
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-colors"
                      style={{
                        background: form.password.length >= i * 4
                          ? (form.password.length >= 12 ? "#27AE60" : form.password.length >= 8 ? "#E67E22" : "#C0392B")
                          : "#E8E8E8"
                      }}
                    />
                  ))}
                </div>
              </div>
              <ScButton
                variant="primary"
                size="md"
                className="w-full mt-2"
                disabled={!canSubmitStep1}
                onClick={() => setStep(2)}
              >
                Continuer
              </ScButton>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#000] mb-1">Personnalisation du profil</p>
              <div>
                <label className="block text-xs font-medium text-[#000] mb-1">Pseudo (nom d&apos;affichage)</label>
                <input type="text" value={form.pseudo} onChange={(e) => update("pseudo", e.target.value)} placeholder="TheAliasMan" className="w-full px-3 py-2 rounded border border-[#AEAEAE] text-sm bg-white focus:outline-none focus:border-[#157FE2]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-age" className="block text-xs font-medium text-[#000] mb-1">
                    Tranche d&apos;âge
                  </label>
                  <select
                    id="signup-age"
                    value={form.age}
                    onChange={(e) => update("age", e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#AEAEAE] text-sm bg-white focus:outline-none focus:border-[#157FE2]"
                  >
                    <option value="">Choisir une tranche…</option>
                    <option value="moins-18">Moins de 18 ans</option>
                    <option value="18-24">18 - 24 ans</option>
                    <option value="25-34">25 - 34 ans</option>
                    <option value="35-44">35 - 44 ans</option>
                    <option value="45-54">45 - 54 ans</option>
                    <option value="55-64">55 - 64 ans</option>
                    <option value="65-plus">65 ans et plus</option>
                    <option value="non-renseigne">Préfère ne pas répondre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#000] mb-1">Pays</label>
                  <select value={form.pays} onChange={(e) => update("pays", e.target.value)} className="w-full px-3 py-2 rounded border border-[#AEAEAE] text-sm bg-white focus:outline-none focus:border-[#157FE2]">
                    <option>France</option>
                    <option>Belgique</option>
                    <option>Suisse</option>
                    <option>Canada</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
              <div
                className="rounded-lg p-3 text-xs text-[#000] leading-relaxed"
                style={{ background: "#C3E8FF", border: "1px solid #B3DBEF" }}
              >
                En créant un compte, tu acceptes les Conditions générales d&apos;utilisation et la Politique de protection des données personnelles de SafeCheck.
              </div>
              <div className="flex gap-3">
                <ScButton variant="secondary" size="md" onClick={() => setStep(1)}>
                  Retour
                </ScButton>
                <ScButton
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={!canSubmitStep2 || submitting}
                  onClick={handleCreateAccount}
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  {submitting ? "Création…" : "Créer mon compte"}
                </ScButton>
              </div>
            </div>
          )}

          <p className="text-xs text-center mt-4 text-[#000]">
            Déjà un compte ?{" "}
            <button onClick={() => router.push("/")} className="text-[#157FE2] hover:underline font-medium">
              Se connecter
            </button>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
