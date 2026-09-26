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
