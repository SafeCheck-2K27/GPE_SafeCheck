"use client"

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
} from "react"
import { cn } from "@/lib/utils"

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

const openModalIds: symbol[] = []

let scrollLockCount = 0
let previousBodyOverflow = ""
let previousBodyPaddingRight = ""

type AccessibleModalName =
  | {
      "aria-label": string
      "aria-labelledby"?: never
    }
  | {
      "aria-label"?: never
      "aria-labelledby": string
    }

type AccessibleModalProps = AccessibleModalName & {
  open: boolean
  onClose: () => void
  children: ReactNode
  "aria-describedby"?: string
  initialFocusRef?: RefObject<HTMLElement | null>
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  zIndex?: number
  className?: string
  style?: CSSProperties
  role?: "dialog" | "alertdialog"
}

export function AccessibleModal({
  open,
  onClose,
  children,
  initialFocusRef,
  closeOnBackdrop = true,
  closeOnEscape = true,
  zIndex = 50,
  className,
  style,
  role = "dialog",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const modalIdRef = useRef(Symbol("accessible-modal"))
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const modal = modalRef.current
    if (!modal) return

    const modalId = modalIdRef.current
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    openModalIds.push(modalId)
    lockBodyScroll()
    focusInitialElement(modal, initialFocusRef)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopModal(modalId)) return

      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault()
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (event.key === "Tab") trapFocus(event, modal)
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (
        !isTopModal(modalId) ||
        !(event.target instanceof Node) ||
        modal.contains(event.target)
      ) {
        return
      }

      focusFirstElement(modal)
    }

    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("focusin", handleFocusIn, true)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("focusin", handleFocusIn, true)
      removeOpenModal(modalId)
      unlockBodyScroll()

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [closeOnEscape, initialFocusRef, open])

  if (!open) return null

  return (
    <div
      ref={modalRef}
      role={role}
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      tabIndex={-1}
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-[color:var(--sc-backdrop)] backdrop-blur-sm px-4",
        className,
      )}
      style={{ ...style, zIndex }}
      onClick={(event) => {
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget &&
          isTopModal(modalIdRef.current)
        ) {
          onCloseRef.current()
        }
      }}
    >
      {children}
    </div>
  )
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0,
  )
}

function focusInitialElement(
  modal: HTMLElement,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  const requestedElement = initialFocusRef?.current
  if (requestedElement && modal.contains(requestedElement)) {
    requestedElement.focus({ preventScroll: true })
    return
  }

  focusFirstElement(modal)
}

function focusFirstElement(modal: HTMLElement) {
  const firstFocusable = getFocusableElements(modal)[0]
  const focusTarget = firstFocusable ?? modal
  focusTarget.focus({ preventScroll: true })
}

function trapFocus(event: KeyboardEvent, modal: HTMLElement) {
  const focusableElements = getFocusableElements(modal)

  if (focusableElements.length === 0) {
    event.preventDefault()
    modal.focus({ preventScroll: true })
    return
  }

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]
  const activeElement = document.activeElement

  if (event.shiftKey) {
    if (activeElement === firstFocusable || !modal.contains(activeElement)) {
      event.preventDefault()
      lastFocusable.focus({ preventScroll: true })
    }
    return
  }

  if (activeElement === lastFocusable || !modal.contains(activeElement)) {
    event.preventDefault()
    firstFocusable.focus({ preventScroll: true })
  }
}

function isTopModal(modalId: symbol): boolean {
  return openModalIds[openModalIds.length - 1] === modalId
}

function removeOpenModal(modalId: symbol) {
  const modalIndex = openModalIds.lastIndexOf(modalId)
  if (modalIndex >= 0) openModalIds.splice(modalIndex, 1)
}

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    previousBodyPaddingRight = document.body.style.paddingRight

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    const currentPaddingRight =
      Number.parseFloat(
        window.getComputedStyle(document.body).paddingRight,
      ) || 0

    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
    }
  }

  scrollLockCount += 1
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount > 0) return

  document.body.style.overflow = previousBodyOverflow
  document.body.style.paddingRight = previousBodyPaddingRight
}
