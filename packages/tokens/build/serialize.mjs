/**
 * DTCG value serialisation shared by the build and the emitted-contract check.
 *
 * Keeping this in one module is what makes the check's "each emitted value equals
 * the authored value" assertion meaningful: both sides call the same function.
 */

/** A DTCG shadow layer. Multi-layer shadows are an array of these. */
function isShadowLayer(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('offsetX' in value || 'offsetY' in value || 'blur' in value)
  )
}

/**
 * A shadow length. Zero serialises without a unit (`0`, not `0px`), which is what
 * Tailwind's stock values use, so the emitted string is byte-identical to them.
 */
function shadowLength(value) {
  if (value && typeof value === 'object' && value.value === 0) return '0'
  return toCss(value ?? { value: 0, unit: 'px' })
}

/** `0 1px 2px 0 rgb(0 0 0 / 0.05)` — offset-x offset-y blur spread color. */
function shadowLayer(layer) {
  const x = shadowLength(layer.offsetX)
  const y = shadowLength(layer.offsetY)
  const blur = shadowLength(layer.blur)
  const spread = shadowLength(layer.spread)
  const color = typeof layer.color === 'string' ? layer.color : toCss(layer.color)
  return `${x} ${y} ${blur} ${spread} ${color}`
}

/**
 * With `usesDtcg: true` Style Dictionary keeps values on `token.$value` and does
 * not flatten DTCG types into CSS strings on its own. Serialising here rather
 * than relying on its transform matrix keeps the output stable across upgrades.
 */
export function toCss(value) {
  if (value === null || value === undefined) {
    throw new Error(`Token has no value: ${JSON.stringify(value)}`)
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  if (Array.isArray(value)) {
    // All numbers -> cubicBezier; all shadow layers -> layered shadow;
    // otherwise a fontFamily stack.
    if (value.every((v) => typeof v === 'number')) {
      return `cubic-bezier(${value.join(', ')})`
    }
    if (value.length > 0 && value.every(isShadowLayer)) {
      return value.map(shadowLayer).join(', ')
    }
    return value.join(', ')
  }
  if (typeof value === 'object') {
    if (isShadowLayer(value)) {
      return shadowLayer(value)
    }
    if (Array.isArray(value.components) && typeof value.colorSpace === 'string') {
      if (value.alpha === undefined || value.alpha === 1) {
        return value.hex
      }
      const [r, g, b] = value.components.map((c) => Math.round(c * 255))
      return `rgba(${r}, ${g}, ${b}, ${value.alpha})`
    }
    if (typeof value.value === 'number' && typeof value.unit === 'string') {
      return `${value.value}${value.unit}`
    }
  }
  return JSON.stringify(value)
}

/** Serialise a Style Dictionary token (DTCG `$value` or legacy `value`). */
export const readToken = (token) => toCss(token.$value ?? token.value)

/** DTCG `{color.neutral.900}` -> `['color', 'neutral', '900']`. */
export function referencePath(reference) {
  if (typeof reference !== 'string') return null
  const match = reference.match(/^\{([^}]+)\}$/)
  return match ? match[1].split('.') : null
}

/**
 * The CSS variable name is the token path joined by `-`, with any dot in a path
 * segment escaped so the fractional spacing keys are valid `<dashed-ident>`s
 * (`--spacing-0\.5`). Colour and radius names contain no dots, so the shadcn
 * contract is unchanged byte for byte.
 */
export function cssVarName(path) {
  return `--${path.map((segment) => String(segment).replace(/\./g, '\\.')).join('-')}`
}
