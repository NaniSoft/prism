import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

/**
 * jsdom is missing the browser APIs Base UI's positioning, focus management and
 * pointer handling touch. Each stub is the minimum that lets a component mount
 * and respond to a keyboard event; none of them asserts layout.
 */
afterEach(() => cleanup())

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverStub {
  root = null
  rootMargin = ''
  thresholds: number[] = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

const globals = globalThis as Record<string, unknown>
globals.ResizeObserver ??= ResizeObserverStub
globals.IntersectionObserver ??= IntersectionObserverStub

/**
 * jsdom ships no `PointerEvent`, and Base UI's button and checkbox handlers
 * dispatch one to carry modifier state. A MouseEvent subclass with the pointer
 * fields is enough for the handlers that read `pointerType` and `pointerId`.
 */
if (typeof globals.PointerEvent === 'undefined') {
  class PointerEventStub extends MouseEvent {
    pointerId: number
    pointerType: string
    isPrimary: boolean
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params)
      this.pointerId = params.pointerId ?? 1
      this.pointerType = params.pointerType ?? 'mouse'
      this.isPrimary = params.isPrimary ?? true
    }
  }
  globals.PointerEvent = PointerEventStub
  ;(window as unknown as Record<string, unknown>).PointerEvent = PointerEventStub
}

const elementProto = Element.prototype as unknown as Record<string, unknown>
elementProto.scrollIntoView ??= vi.fn()
elementProto.hasPointerCapture ??= () => false
elementProto.setPointerCapture ??= vi.fn()
elementProto.releasePointerCapture ??= vi.fn()

/**
 * `focus({ preventScroll })`, which jsdom's `focus` accepts and ignores.
 *
 * Base UI's modal asks whether focus should come back after an outside press by
 * probing for it: it calls `focus()` on a throwaway element with a getter for
 * `preventScroll`, and returns the reader's focus only if the browser read it. It
 * does not because restoring focus without `preventScroll` scrolls the page, and
 * two mobile engines still ignore the option, so the check is a runtime one rather
 * than a version one.
 *
 * Every browser this package supports answers the probe, so a jsdom that drops
 * the argument reports "unsupported" and the outside-press return focus looks
 * broken when it is not. Reading the getter is the minimum that makes the probe
 * answer as a browser answers it, and it asserts nothing about layout.
 */
const focusProto = HTMLElement.prototype as unknown as {
  focus: (options?: FocusOptions) => void
}
const nativeFocus = focusProto.focus
focusProto.focus = function focusWithOptions(this: HTMLElement, options?: FocusOptions) {
  void options?.preventScroll
  nativeFocus.call(this)
}
