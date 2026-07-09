"use client"

import React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import type { DropdownItem } from "@/components/safecheck/layout/nav-data"

export function NavDropdown({
  label,
  id,
  isOpen,
  onToggle,
  items,
  onClose,
  wide,
  withIcons,
  footerCta,
}: {
  label: string
  id: string
  isOpen: boolean
  onToggle: () => void
  items: DropdownItem[]
  onClose: () => void
  wide?: boolean
  withIcons?: boolean
  /**
   * Optional accent CTA rendered at the bottom of the dropdown when it's open.
   * Used by the Audits menu to surface the "Voir tous les audits" shortcut on
   * every page, separated from the regular menu items by a divider.
   */
  footerCta?: {
    label: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
  }
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 cursor-pointer
          ${isOpen
            ? "bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)]"
            : "text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-text)] hover:bg-[color:var(--sc-bg-soft)]/70"
          }
        `}
        aria-expanded={isOpen}
        aria-controls={`menu-${id}`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div
          id={`menu-${id}`}
          className={`absolute top-full left-0 mt-2 ${wide ? "w-80" : "w-64"} rounded-xl z-50 overflow-hidden sc-fade-in
            border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)]
            shadow-[0_12px_36px_-12px_rgba(15,23,42,0.18),0_4px_12px_-4px_rgba(15,23,42,0.10)]
            p-1.5`}
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={onClose}
                className="group flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[color:var(--sc-text)]
                  hover:bg-[color:var(--sc-bg-soft)] transition-colors"
              >
                {withIcons && Icon && (
                  <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-md
                    bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue)]
                    group-hover:bg-[color:var(--sc-blue)] group-hover:text-white transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold leading-tight">{item.label}</div>
                  {item.desc && (
                    <div className="text-[11.5px] text-[color:var(--sc-text-muted)] mt-0.5">{item.desc}</div>
                  )}
                </div>
              </Link>
            )
          })}

          {footerCta && (
            <>
              <div
                role="separator"
                aria-hidden="true"
                className="my-1.5 mx-2 h-px bg-[color:var(--sc-border)]"
              />
              <Link
                href={footerCta.href}
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 mx-1 mb-0.5 px-3 py-2.5 rounded-lg text-sm font-semibold
                  text-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]/8
                  hover:bg-[color:var(--sc-blue)]/15 hover:text-[color:var(--sc-blue-hover)] transition-colors"
              >
                {footerCta.icon && <footerCta.icon className="w-3.5 h-3.5" />}
                {footerCta.label}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
