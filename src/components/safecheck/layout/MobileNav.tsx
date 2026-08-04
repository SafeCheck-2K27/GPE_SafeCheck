"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import type { DropdownItem } from "@/components/safecheck/layout/nav-data"

/**
 * MobileSection - a collapsible group of links used inside the mobile menu.
 */
export function MobileSection({
  title,
  items,
  onClose,
}: {
  title: string
  items: DropdownItem[]
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[color:var(--sc-border)]/70">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[color:var(--sc-text)]"
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="bg-[color:var(--sc-bg-soft)]/60 pb-2">
          {items.map((it) => (
            <Link
              key={it.href + it.label}
              href={it.href}
              onClick={onClose}
              className="block px-6 py-2 text-sm text-[color:var(--sc-text-2)] hover:text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)]"
            >
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
