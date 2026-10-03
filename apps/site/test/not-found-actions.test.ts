/**
 * The 404 route's one action is one control, and this lane renders the real route
 * to prove it.
 *
 * **THE DEFECT, and it was invalid markup rather than a wrong colour.** The page
 * wrapped a `Button` in a `next/link`, which emits `<a href><button>…</button></a>`:
 * a `<button>` inside an `<a>`, which the HTML specification forbids, and two
 * focusable controls for one action. A keyboard reader tabs twice to reach one
 * control and hears it twice. A pointer reader's click is resolved by the browser
 * between two elements whose activation rules disagree, and the destination is on
 * the outer one while the press is on the inner one. It was the only occurrence in
 * either tree, and it was on the page that a lost reader lands on.
 *
 * **WHY A SOURCE SCAN IS NOT THE ASSERTION, and why the class strings are
 * asserted as well as the structure.** The obvious cheap version of this test
 * reads the file and looks for `<Link` followed by a Component. That would pass on
 * a file which had been rewritten into two anchors and one of them unstyled, and
 * it would keep passing if the nesting came back in a shape the regex did not
 * match. So the route is rendered, and the assertions are about the elements a
 * reader reaches: how many, what they are, what they navigate to, what they are
 * named, and which classes they carry.
 *
 * **WHY A HAND-WRITTEN TAG WALKER RATHER THAN jsdom.** `apps/site/vitest.config.ts`
 * runs in the `node` environment and collects only `.ts` specs, and the reason is
 * stated in `narrow-viewport-and-type-scale.test.ts`: there is no jsdom here and
 * no `.tsx` spec can run at all. Adding a DOM implementation and a JSX lane to a
 * private application package to hold one assertion is a worse trade than forty
 * lines of walker, and `renderToStaticMarkup` is already the lane's own tool:
 * `api-reference-table.test.ts` renders a real site Component with it. The walker
 * reads the emitted markup and nothing else. It sees elements, their attributes
 * and their ancestry; it has no CSS engine, no layout and no accessibility tree,
 * so nothing here can say whether a ring is visible or whether a name is
 * announced. `apps/site/e2e/display.spec.ts` over a real browser is that lane, and
 * what is asserted here is the part it does not repeat: that the document says it.
 */

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Button } from '@nanisoft/prism-ui/components/button'

import NotFound from '../src/app/not-found'

/* ------------------------------------------------------------------ *
 * The rendered route
 * ------------------------------------------------------------------ */

const MARKUP = renderToStaticMarkup(createElement(NotFound))

/* ------------------------------------------------------------------ *
 * A tag walker over the emitted markup
 * ------------------------------------------------------------------ */

/** One element, with the parent it sits inside. */
type El = {
  tag: string
  attrs: Record<string, string>
  parent: El | null
  children: El[]
  text: string
}

/**
 * The elements that never have a closing tag, so the walker does not wait for
 * one and swallow the rest of the document.
 */
const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

/**
 * The pair list is the part that had to be written rather than improvised, and two
 * defects in this walker were both invisible until a case asserted coverage.
 *
 * The first was the tag pattern above: a group of "some quoted things" matches a
 * single-attribute element and no others, because the space between two
 * attributes is not a quoted thing, so it matched nothing on a document whose
 * every element carries two. The second was the destructuring below: the
 * attribute pattern has two capture groups, and reading the value out of the
 * third slot produced `undefined` for every attribute on the page, which
 * `JSON.stringify` renders as an empty object and a reader would have taken for an
 * empty class list.
 *
 * `it('reads the whole document rather than nothing at all')` is what turned both
 * into failures rather than into vacuous passes, and it is the reason a walker in
 * a lane with no DOM is worth having at all.
 */
const TAG = /<(\/)?([a-zA-Z][\w-]*)((?:\s+[a-zA-Z_:][\w:.-]*="[^"]*")*)\s*(\/?)>/g

/** `name="value"` pairs, which is the only shape React emits. */
function attributes(source: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [, name, value] of source.matchAll(/([a-zA-Z_:][\w:.-]*)="([^"]*)"/g)) {
    out[name] = value
  }
  return out
}

function unescape(source: string): string {
  return source
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

/** Every element in document order, each carrying its parent. */
function parse(html: string): El[] {
  const all: El[] = []
  const open: El[] = []
  let at = 0
  let match: RegExpExecArray | null

  while ((match = TAG.exec(html)) !== null) {
    const between = html.slice(at, match.index)
    const current = open[open.length - 1]
    if (current && between.trim()) current.text += unescape(between)
    at = TAG.lastIndex

    const [, closing, name, attrText] = match
    if (closing) {
      // Pop to the matching name and drop whatever was left open inside it, so one
      // missing close tag cannot make every later element look nested.
      for (let i = open.length - 1; i >= 0; i -= 1) {
        if (open[i].tag === name.toLowerCase()) {
          open.length = i
          break
        }
      }
      continue
    }

    const el: El = {
      tag: name.toLowerCase(),
      attrs: attributes(attrText),
      parent: current ?? null,
      children: [],
      text: '',
    }
    all.push(el)
    if (current) current.children.push(el)
    if (!VOID.has(el.tag)) open.push(el)
  }

  return all
}

const TREE = parse(MARKUP)

/** The concatenated text of an element and everything inside it. */
function textOf(el: El): string {
  return el.text + el.children.map(textOf).join('')
}

/**
 * What a reader can tab to, and what the browser treats as a control.
 *
 * An anchor counts only with an `href`, which is the same rule `CtaLink` states
 * for requiring one: an anchor without a destination is not a link.
 */
const CONTROL_TAGS = new Set(['button', 'input', 'select', 'textarea', 'summary'])

function isControl(el: El): boolean {
  if (CONTROL_TAGS.has(el.tag)) return true
  if (el.tag === 'a') return el.attrs.href !== undefined
  return el.attrs.tabindex !== undefined
}

/**
 * The same question asked of a tag name alone, which is how an ancestor is judged.
 *
 * An anchor counts here whatever its attributes, and that is stricter on purpose: an
 * anchor wrapping another control is invalid markup whether or not it has a
 * destination, and a rule that had to re-read the attributes of every ancestor
 * would be a rule whose answer depends on which of them the walker happened to
 * reach.
 */
function isControlTag(tag: string): boolean {
  return CONTROL_TAGS.has(tag) || tag === 'a'
}

/** Every control on the page, in document order. */
const CONTROLS = TREE.filter(isControl)

/** The tags on the way up from an element, nearest first. */
function ancestors(el: El): string[] {
  const tags: string[] = []
  for (let at = el.parent; at; at = at.parent) tags.push(at.tag)
  return tags
}

/** The one element carrying a `data-slot`, which is how this package names a part. */
const CTA = TREE.find((el) => el.attrs['data-slot'] === 'cta-link')

/* ------------------------------------------------------------------ *
 * The assertions
 * ------------------------------------------------------------------ */

describe('the walker', () => {
  it('reads the whole document rather than nothing at all', () => {
    // Coverage asserted, not assumed. Every other assertion in this file is about
    // an element the walker found, so a walker that matched nothing would turn
    // "no control is nested inside a control" into a statement about an empty
    // document. This is the case that fails first when the walker breaks, and it is
    // why the numbers are stated rather than asserted as merely positive.
    expect(TREE.length).toBeGreaterThan(10)
    expect(CONTROLS.length).toBe(2)
    expect(MARKUP.match(/<[a-z]/g)?.length ?? 0).toBe(TREE.length)
  })

  it('attributes an element with more than one attribute', () => {
    // The specific failure this walker had: a pattern that could not read past the
    // first `name="value"` matched nothing on a page whose every element carries
    // two or more. An anchor is asserted with both its `data-slot` and its `href`,
    // which is the case that could not have passed.
    const anchors = TREE.filter((el) => el.tag === 'a')
    expect(anchors.length).toBe(2)
    expect(anchors.every((el) => el.attrs.href !== undefined)).toBe(true)
    expect(anchors[0]?.attrs['data-slot']).toBe('cta-link')
    expect((anchors[0]?.attrs.class ?? '').length).toBeGreaterThan(0)
  })
})

describe('the 404 route', () => {
  it('renders no button at all, which is the shape the defect had', () => {
    // The negative first, because a test that counts the control it expected
    // passes on a nested pair as readily as on a single one. `<Link><Button/></Link>`
    // renders one button inside one anchor, so "there is a control with the right
    // name" was true of the defect; only "there is no button" was not.
    expect(MARKUP).not.toContain('<button')
    expect(CONTROLS.filter((el) => el.tag === 'button')).toHaveLength(0)
  })

  it('puts no control inside another control', () => {
    // The claim, stated over every control on the page rather than over the one
    // that was wrong: a control nested inside a control is two tab stops for one
    // action, and the activation a reader causes lands on the inner element while
    // the destination belongs to the outer one.
    const nested = CONTROLS.filter((el) => ancestors(el).some(isControlTag))
    expect(nested.map((el) => `${el.tag} in ${ancestors(el).join(' > ')}`)).toEqual([])
  })

  it('renders the quickstart action as one anchor that navigates', () => {
    expect(CTA).toBeDefined()
    expect(CTA?.tag).toBe('a')
    expect(CTA?.attrs.href).toBe('/overview/quickstart')
  })

  it('names that anchor by the words on it', () => {
    // The accessible name of an anchor is its content, so the name and the visible
    // text are the same string. Asserting it here is what says the control is
    // correctly named rather than merely present.
    expect(textOf(CTA as El).trim()).toBe('Read the quickstart')
  })

  it('leaves the page two controls, and both navigate', () => {
    // Two is the page's decision, not a defect: one call to action and one quiet
    // text link, stated in the route's own documentation. What is asserted is that
    // each is a single element with a destination.
    expect(CONTROLS.map((el) => el.tag)).toEqual(['a', 'a'])
    expect(CONTROLS.map((el) => el.attrs.href)).toEqual([
      '/overview/quickstart',
      '/components',
    ])
  })
})

describe('the quickstart action keeps the button it replaces', () => {
  it('carries the class list a size lg button carries, and no others', () => {
    // The visible styling must be unchanged, and the recipe lives in the component
    // package rather than in this file. So the expectation is rendered from the
    // real `Button` and compared as a subset, which is the same assertion
    // `packages/ui/test/cta-destination.test.tsx` makes inside that package: a
    // subset rather than an equality because the anchor drops exactly two button
    // states, `disabled:*` and `aria-invalid:*`, neither of which an anchor has.
    const button = renderToStaticMarkup(
      createElement(Button, { size: 'lg', variant: 'default' }, 'Read the quickstart'),
    )
    const buttonClasses = new Set(
      (button.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean),
    )
    const ctaClasses = (CTA?.attrs.class ?? '').split(/\s+/).filter(Boolean)

    expect(ctaClasses.length).toBeGreaterThan(0)
    for (const className of ctaClasses) {
      expect(buttonClasses, `size lg carries ${className}`).toContain(className)
    }
  })

  it('still reads as the filled call to action and not as a quiet link', () => {
    // A subset is not a claim that the two look the same, so the two utilities that
    // make this one the primary action on the page are asserted directly.
    expect(CTA?.attrs.class).toContain('bg-primary')
    expect(CTA?.attrs.class).toContain('h-10')
  })
})