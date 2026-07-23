"use client"

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { ModalStack } from "./modal-stack"

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

const MODAL_ATTRIBUTE = "data-safecheck-modal"

const openModals = new ModalStack<HTMLElement>()

interface PreservedAttributes {
  inert: string | null
  ariaHidden: string | null
}

const isolatedBackgroundElements = new Map<HTMLElement, PreservedAttributes>()
const isolatedModalElements = new Map<HTMLElement, PreservedAttributes>()

let backgroundObserver: MutationObserver | null = null

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
  const closeOnEscapeRef = useRef(closeOnEscape)
  const isClient = useSyncExternalStore(
    subscribeToClientReady,
    getClientSnapshot,
    getServerSnapshot,
  )

  useEffect(() => {
    onCloseRef.current = onClose
    closeOnEscapeRef.current = closeOnEscape
  }, [closeOnEscape, onClose])

  useEffect(() => {
    if (!open || !isClient) return

    const modal = modalRef.current
    if (!modal) return

    const modalId = modalIdRef.current
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    openModals.add(modalId, modal)
    lockBodyScroll()
    focusInitialElement(modal, initialFocusRef)
    syncModalIsolation()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopModal(modalId)) return

      if (event.key === "Escape" && closeOnEscapeRef.current) {
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
      openModals.remove(modalId)
      restoreManagedElement(modal, isolatedModalElements)
      unlockBodyScroll()
      syncModalIsolation()

      if (
        previouslyFocused?.isConnected &&
        !previouslyFocused.closest("[inert]")
      ) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [initialFocusRef, isClient, open])

  if (!open || !isClient) return null

  return createPortal(
    <div
      ref={modalRef}
      data-safecheck-modal=""
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
    </div>,
    document.body,
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
  return openModals.isTop(modalId)
}

function syncModalIsolation() {
  const entries = openModals.entries

  if (entries.length === 0) {
    backgroundObserver?.disconnect()
    backgroundObserver = null
    restoreManagedElements(isolatedBackgroundElements)
    restoreManagedElements(isolatedModalElements)
    return
  }

  isolateBodyChildren()
  observeBodyChildren()

  const topModal = entries[entries.length - 1]?.value
  entries.forEach(({ value }) => {
    if (value === topModal) {
      restoreManagedElement(value, isolatedModalElements)
    } else {
      isolateElement(value, isolatedModalElements)
    }
  })
}

function isolateBodyChildren() {
  Array.from(document.body.children).forEach((element) => {
    if (
      element instanceof HTMLElement &&
      !element.hasAttribute(MODAL_ATTRIBUTE)
    ) {
      isolateElement(element, isolatedBackgroundElements)
    }
  })
}

function observeBodyChildren() {
  if (backgroundObserver) return

  backgroundObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          !node.hasAttribute(MODAL_ATTRIBUTE)
        ) {
          isolateElement(node, isolatedBackgroundElements)
        }
      })
    })
  })
  backgroundObserver.observe(document.body, { childList: true })
}

function subscribeToClientReady() {
  return () => undefined
}

function getClientSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

function isolateElement(
  element: HTMLElement,
  preservedAttributes: Map<HTMLElement, PreservedAttributes>,
) {
  if (!preservedAttributes.has(element)) {
    preservedAttributes.set(element, {
      inert: element.getAttribute("inert"),
      ariaHidden: element.getAttribute("aria-hidden"),
    })
  }

  element.inert = true
  element.setAttribute("aria-hidden", "true")
}

function restoreManagedElement(
  element: HTMLElement,
  preservedAttributes: Map<HTMLElement, PreservedAttributes>,
) {
  const attributes = preservedAttributes.get(element)
  if (!attributes) return

  restoreAttribute(element, "inert", attributes.inert)
  restoreAttribute(element, "aria-hidden", attributes.ariaHidden)
  preservedAttributes.delete(element)
}

function restoreManagedElements(
  preservedAttributes: Map<HTMLElement, PreservedAttributes>,
) {
  preservedAttributes.forEach((_, element) => {
    restoreManagedElement(element, preservedAttributes)
  })
}

function restoreAttribute(
  element: HTMLElement,
  name: "inert" | "aria-hidden",
  value: string | null,
) {
  if (value === null) {
    element.removeAttribute(name)
  } else {
    element.setAttribute(name, value)
  }
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
