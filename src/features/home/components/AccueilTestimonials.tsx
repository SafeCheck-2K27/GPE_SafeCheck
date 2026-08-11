"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { ScBadge } from "@/components/safecheck/primitives"
import { homeTestimonials } from "../data"

export function AccueilTestimonials() {
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const previous = () =>
    setTestimonialIndex((index) =>
      index === 0 ? homeTestimonials.length - 1 : index - 1,
    )
  const next = () =>
    setTestimonialIndex((index) =>
      index === homeTestimonials.length - 1 ? 0 : index + 1,
    )

  const testimonial = homeTestimonials[testimonialIndex]

  return (
    <section className="max-w-7xl mx-auto px-4 pb-16">
      <div className="text-center mb-8">
        <ScBadge tone="muted" className="mb-3">
          <Star className="w-3 h-3" />
          Nos utilisateurs témoignent
        </ScBadge>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-[color:var(--sc-text)] text-balance">
          Ce que SafeCheck change concrètement.
        </h2>
      </div>

      <div className="relative rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[0_2px_6px_-2px_rgb(var(--sc-ink-rgb)/0.06),0_10px_30px_-12px_rgb(var(--sc-ink-rgb)/0.08)] p-6 md:p-10">
        <Quote
          className="absolute top-5 left-6 w-8 h-8 text-[color:var(--sc-blue)]/15"
          aria-hidden
        />

        <div className="flex flex-col md:flex-row items-center gap-6">
          <button
            onClick={previous}
            className="hidden md:inline-flex p-2.5 rounded-full border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)] hover:border-[color:var(--sc-blue)] hover:text-[color:var(--sc-blue)] transition-colors shrink-0"
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full shrink-0 flex items-center justify-center text-[color:var(--sc-text-on-strong)] text-3xl font-display font-bold bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue)_55%,var(--sc-indigo))] shadow-[0_12px_28px_-10px_rgb(var(--sc-blue-rgb)/0.55)]">
              {testimonial.name[0]}
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-base text-[color:var(--sc-text)]">
                {testimonial.name}
              </p>
              <p className="text-xs text-[color:var(--sc-blue)] font-semibold mb-2">
                {testimonial.role}
              </p>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed italic">
                {`«\u00A0${testimonial.text}\u00A0»`}
              </p>
              <div className="flex justify-center md:justify-start gap-0.5 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3.5 h-3.5 text-[color:var(--sc-blue)] fill-[color:var(--sc-blue)]"
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={next}
            className="hidden md:inline-flex p-2.5 rounded-full border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)] hover:border-[color:var(--sc-blue)] hover:text-[color:var(--sc-blue)] transition-colors shrink-0"
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={previous}
            className="md:hidden inline-flex p-2 rounded-full border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)]"
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex justify-center gap-2 mx-auto">
            {homeTestimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                onClick={() => setTestimonialIndex(index)}
                className={`h-2 rounded-full transition-all ${index === testimonialIndex ? "w-6 bg-[color:var(--sc-blue)]" : "w-2 bg-[color:var(--sc-border-strong)]"}`}
                aria-label={`Aller au témoignage ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="md:hidden inline-flex p-2 rounded-full border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)]"
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
