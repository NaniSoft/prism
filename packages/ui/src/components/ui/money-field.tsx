'use client'

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FocusEventHandler,
  type ReactNode,
} from 'react'

import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group'
import { cn } from '../../lib/utils'

/**
 * The props the Money field accepts.
 *
 * A declared interface rather than a forwarded native one, and the reason is the
 * gate on the surface rather than a preference: a forwarded `value` and
 * `onChange` would be a second way to say what the field holds, and `value` here
 * is a number while the DOM's is a string, so forwarding the native pair would
 * make it possible to pass a string where a number belongs. The native attributes
 * a money field genuinely needs are named individually below.
 */
export interface MoneyFieldProps {
  /**
   * The amount, as a number.
   *
   * Required and controlled, and a number rather than a string for the whole
   * reason this Component exists: the value the caller holds and the value the
   * reader sees are different kinds of thing, and only one of them is arithmetic.
   * `null` means the field is empty, which is a different fact from zero and is
   * reported as `null` rather than as a number the reader never typed.
   */
  value: number | null
  /**
   * Called with the amount the reader's text currently parses to.
   *
   * Required, and called on every keystroke rather than on blur, because a form
   * that learns the amount only when the reader leaves the field has already lost
   * the reason to keep the text at all. It is called with `null` when the text
   * holds no amount yet, which includes a partially typed one: `12.`, `-` and `.5`
   * are all legitimate states of a field somebody is typing into, and reporting
   * them as a number would report a number the reader did not mean.
   */
  onValueChange: (value: number | null) => void
  /**
   * The locale the amount is written in.
   *
   * Required, because a locale is a claim about the caller's market and this
   * Component may not guess one. It decides the grouping separator, the decimal
   * separator, and how many fraction digits the currency has: `1.234,56` in
   * `de-DE` and `1,234.56` in `en-US` are the same amount typed two ways, and a
   * Component that hardcoded either one would be wrong for every reader in the
   * other half of the world.
   */
  locale: Intl.LocalesArgument
  /**
   * The currency, as an ISO 4217 code.
   *
   * Required, and a code rather than a symbol for three reasons: the symbol is
   * read back out of the platform so no two products can disagree about it, a code
   * is the one currency name every product already holds, and a symbol as an input
   * would be an input that cannot be validated. `Intl` throws on a code it does not
   * recognise, which is the right place for that error.
   */
  currency: string
  /**
   * The field's own id, so a `Label` elsewhere can point at it.
   *
   * A native attribute forwarded untouched, because an id is a fact about the
   * caller's form rather than about this Component.
   */
  id?: string
  /**
   * The field's accessible name, when no visible label is used.
   *
   * Optional and not defaulted, because the visible label is the ordinary answer
   * and a defaulted name here would be the English Prism guessed in place of the
   * caller's own word.
   */
  'aria-label'?: string
  /**
   * What the reader is expected to do with the amount.
   *
   * Forwarded rather than drawn, so a form can describe the field in one sentence
   * a screen reader will reach. There is no `name`: a money field submits the text
   * the reader typed, with this locale's punctuation in it, and a caller who needs
   * a numeric submit owns a hidden input holding the number.
   */
  describedBy?: string
  /** Whether the reader may not change the amount. */
  readOnly?: boolean
  /** Whether the field ignores interaction. */
  disabled?: boolean
  /**
   * Whether an amount must be entered.
   *
   * Announced on the field as `aria-required` rather than enforced by the browser's
   * own `required`, for the same reason the JSDoc on `onBlur` matters: the browser
   * refuses to submit with a message in English, and this Component may not choose
   * a word for the reader. Enforce it in the caller's own submit handler, where it
   * can be said in the caller's language.
   */
  required?: boolean
  /**
   * The keyboard the field asks for. @defaultValue 'decimal'
   *
   * A `decimal` keyboard is the one with the separator a money field needs, and it
   * is the default because a `numeric` keyboard on a phone has no decimal point at
   * all. Override it for a market that types amounts some other way; the parser
   * reads whatever the reader produced.
   */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal'
  /**
   * Called when the reader leaves the field, after the text has been re-formatted.
   *
   * Forwarded rather than drawn, and last in the Component's own handler on
   * purpose: a caller's handler runs against a field that has already settled,
   * so a validation that reads the field at that moment reads what the reader is
   * looking at and not the keystrokes they are leaving behind.
   */
  onBlur?: FocusEventHandler<HTMLInputElement>
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * Everything one locale and one currency say about the shape of an amount.
 *
 * Memoised on the two props that decide it and not read per keystroke, because
 * building three `Intl.NumberFormat` objects on every character typed is a cost
 * with no reader attached, and the answer cannot change while the locale and the
 * currency do not.
 */
function readCurrency(locale: Intl.LocalesArgument, currency: string) {
  // The currency formatter is the only thing that knows how this currency is
  // written: where the symbol sits, how many fraction digits it has, and which
  // characters are its own.
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency })
  const symbol =
    money
      .formatToParts(0)
      .find((part) => part.type === 'currency')
      ?.value ?? currency
  const { minimumFractionDigits, maximumFractionDigits } = money.resolvedOptions()

  // The digits come from a decimal formatter carrying the currency's own fraction
  // digits, so the amount is grouped and padded the way this currency is padded
  // and carries no symbol, because the symbol is already in the field's frame.
  const digits = new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits })

  // The decimal separator, taken from a value that has one. `undefined` is a real
  // answer and not a gap: a locale whose numbers are written without a fractional
  // part has no decimal separator to accept and none is offered to the reader.
  const marks = new Intl.NumberFormat(locale).formatToParts(1.5)
  const separator = marks.find((part) => part.type === 'decimal')?.value

  /*
   * The characters this locale's own formatter could have produced.
   *
   * Grouping is deliberately absent. A group separator is cosmetic, and dropping
   * one leaves the same digits, which is exactly the amount the reader meant. So a
   * reader typing `1,234.56` into `en-US` and a reader typing `1.234,56` into
   * `de-DE` both end up with a field holding the number they wanted, and neither
   * has to be told which characters their market uses to write it.
   */
  const allowed = new Set<string>('0123456789-')
  for (const character of separator ?? '') allowed.add(character)
  for (const character of symbol) allowed.add(character)

  return { symbol, digits, separator, allowed }
}

/** What is left after the allowed set has had its turn, which is what can be typed. */
function filterAmount(text: string, allowed: Set<string>): string {
  let out = ''
  for (const character of text) {
    if (allowed.has(character)) out += character
  }
  return out
}

const DIGITS_ONLY = /^[0-9]+$/

/**
 * The number the reader's text means, or nothing.
 *
 * `null` is the honest answer in four distinct cases and the Component does not
 * distinguish them for the caller, because none of them is an amount: the field is
 * empty, the field holds only a sign, the field holds only the separator, and the
 * field holds something that is not an amount at all. The text is never rewritten
 * in response, so all four are visible to the reader as states of a field they are
 * in the middle of typing into.
 */
function readAmount(text: string, separator: string | undefined, symbol: string): number | null {
  let body = ''
  for (const character of text) {
    // The currency symbol is dropped wherever it appears rather than only at the
    // front, because a reader pasting a formatted amount gets whatever order their
    // source wrote it in.
    if (symbol !== '' && symbol.includes(character)) continue
    body += character
  }

  const negative = body.startsWith('-')
  if (negative) body = body.slice(1)
  if (body === '') return null

  const halves = separator === undefined ? [body] : body.split(separator)
  // More than one separator is not a partially typed amount, it is a different
  // number, and guessing which separator was meant is a guess about money.
  if (halves.length > 2) return null

  let [whole, fraction = ''] = halves
  // A separator with no whole part is that many units. The reader who typed the
  // separator first is at the beginning of an amount, not at the end of one.
  if (whole === '' && fraction !== '') whole = '0'
  if (!DIGITS_ONLY.test(whole)) return null
  if (fraction !== '' && !DIGITS_ONLY.test(fraction)) return null

  const amount = Number(`${whole}.${fraction}`)
  if (!Number.isFinite(amount)) return null
  return negative ? -amount : amount
}

/**
 * A field that holds a currency amount as a number and shows it as the reader's
 * market writes it.
 *
 * **The number the caller holds and the string the reader sees are different
 * kinds of thing, and the round trip between them is the Component.** Everything
 * else here follows from that. The caller passes a `number` and gets a `number`
 * back; the field draws the platform's own rendering of that number in the
 * caller's locale and the caller's currency; and every character the reader adds
 * is parsed back into one. A field that handed the caller a string would push the
 * parsing into every consumer, and a field that printed a hardcoded `$1,234.56`
 * would be making three claims about every product that installed it.
 *
 * **The currency symbol is an input and not an output, and the difference is the
 * whole of the composition.** It sits in the field's own frame, drawn by
 * `InputGroupAddon`, read out of `Intl.NumberFormat` rather than written here, and
 * it is hidden from the accessibility tree: a screen reader reads the digits, and
 * the currency belongs in the field's accessible name, which is the caller's
 * word. It is also not part of the value. The number a caller holds is `1234.56`
 * whatever the reader sees on screen, and a symbol that leaked into the parse would
 * make the same amount parse two ways depending on whether the reader typed it.
 *
 * **Nothing about a currency may be a literal in this file.** The symbol, the
 * grouping and the decimal separators, and the number of fraction digits all come
 * out of the platform for the locale and the code the caller passed. `de-DE` with
 * `EUR` and `en-US` with `USD` differ in all four, and a Component that hardcoded
 * any of them would be right for one market and silently wrong for the rest.
 *
 * **A partially typed amount is a legitimate state and the parser must not reject
 * it.** `12.`, `-` and `.5` are all things a person is in the middle of typing,
 * and `12,` and `,5` are the same three in a locale that separates with a comma.
 * So the parser is not asked whether the text is a valid amount, only whether it
 * currently means one: it reports `12` for `12.`, it reports nothing for a lone sign
 * and for a lone separator, and it reports `0.5` for `.5`. And the text is never
 * rewritten while the field has focus, because a field that re-formats under the
 * reader moves the caret and eats the character being typed. That is what makes the
 * states survivable at all.
 *
 * **The two values disagree for the whole of a mid-edit, and the Component
 * resolves it in one direction.** The caller's number is always the parse of the
 * text, and the text is never rewritten until the reader leaves. So a consumer
 * that also renders the amount somewhere else on the page sees the parsed value and
 * not the keystrokes, and that is deliberate: a second rendering of an amount
 * mid-edit is a second thing to keep in step with a third. The cost is that a
 * consumer whose own validation depends on the exact characters cannot get them
 * from here; it gets the number, which is the thing worth validating.
 *
 * **On blur the text is re-formatted, and text that is not an amount is refused.**
 * The reader leaves and the field holds what the platform writes for the number it
 * parsed: grouped where this locale groups, padded to this currency's fraction
 * digits, and with the grouping the reader did not type replaced by the grouping
 * the reader's market uses. If the text held nothing that means an amount at all,
 * the field restores the canonical rendering of the caller's own value and reports
 * `null`. **That refusal has a real cost, and it is the cost of a snapped-back
 * keystroke**: a reader who typed something this locale cannot write loses what
 * they typed rather than being told it was wrong. The alternative is to keep the
 * text and mark the field invalid, which needs an error this Component cannot
 * render and a `required` rule this Component cannot judge. Refusing it here means
 * an amount field never holds something that is not an amount, which is the
 * strongest claim available; a caller who would rather explain the problem says so
 * in their own `FieldError` beside a `value` of `null`.
 *
 * **A pasted amount from another market is read with this market's punctuation,
 * and there is no better answer available.** `1,234.56` pasted into a `de-DE`
 * field is `1.23456` here, because `,` is this locale's decimal separator. A
 * Component that guessed the other way round would be guessing about money from a
 * string with no locale in it, so it does not: pass the number in, and let the
 * field format it. Grouping characters survive nothing either way, because
 * dropping one leaves the same digits.
 *
 * **A `name` is deliberately absent, and the omission is the honest one.** What a
 * form would submit from here is the reader's text, with this locale's separators
 * in it, and a server that parses it has to guess the same things this Component
 * guessed. A caller who needs a numeric submit writes a hidden input holding
 * `value`. That is two lines, and it is better than a Component that submits a
 * string and calls it a number.
 *
 * **It is a client Component**, because it holds the text while the reader is
 * typing and because it takes the callback that carries the parse. What that
 * costs is the price of every form control, and it is worth naming because the
 * Component looks like a text input: a server render draws the canonical rendering
 * of the caller's number, which is right, and cannot report a keystroke, which is
 * also right.
 */
function MoneyField({
  value,
  onValueChange,
  locale,
  currency,
  id,
  'aria-label': ariaLabel,
  describedBy,
  readOnly = false,
  disabled = false,
  required = false,
  inputMode = 'decimal',
  onBlur: onBlurProp,
  className,
}: MoneyFieldProps) {
  const { symbol, digits, separator, allowed } = useMemo(
    () => readCurrency(locale, currency),
    [locale, currency],
  )

  // The text while it is being typed, and `null` when it is not. A separate value
  // from the caller's is the whole mechanism: a field whose displayed text is
  // derived from a number on every render cannot hold `12.` without rewriting it.
  const [draft, setDraft] = useState<string | null>(null)

  const canonical = value === null || !Number.isFinite(value) ? '' : digits.format(value)
  const text = draft === null ? canonical : draft

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = filterAmount(event.target.value, allowed)
    setDraft(next)
    onValueChange(readAmount(next, separator, symbol))
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    // A field nobody edited is not a field that resolved. Without this a reader who
    // tabbed through a field holding an amount would have that amount reported as
    // `null` on the way out, because an untouched field has no draft to re-formatted.
    if (draft !== null) {
      // The one place the text is rewritten, and the one place the parse is reported
      // a second time: whatever parsed is what the reader is left looking at.
      onValueChange(readAmount(draft, separator, symbol))
      setDraft(null)
    }
    // Forwarded last, so a caller's own handler runs against a field that has
    // already settled rather than one caught mid-transition.
    onBlurProp?.(event)
  }

  return (
    <InputGroup className={className} disabled={disabled}>
      <InputGroupAddon position="prefix">
        {/*
         * The symbol, hidden from the accessibility tree. See the JSDoc: it is an
         * input and not an output, and a screen reader reads the digits.
         */}
        <span data-slot="money-field-symbol" aria-hidden="true">
          {symbol}
        </span>
      </InputGroupAddon>

      <InputGroupInput
        data-slot="money-field-input"
        id={id}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        spellCheck={false}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        readOnly={readOnly}
        disabled={disabled}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </InputGroup>
  )
}

export { MoneyField }