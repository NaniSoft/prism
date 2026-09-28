/**
 * The laws, defined once.
 *
 * For four years the cross-repository contract between the five NaniSoft
 * repositories was a prose document mirrored in four files, and it decayed in
 * the only way a mirror can: the two sites that mattered drifted into three
 * implementations of one rule and one of the three rules was false. A prose law
 * cannot fail, so it stays true until the day it is not, and nobody is told.
 *
 * So a law here is not a sentence a reader is asked to believe. It is the text a
 * gate prints when the build fails, and it lives in the package every consumer
 * pins exactly. A consumer's own repository holds data: its roots, its sheet, its
 * pack map, its coverage floors. It does not hold the wording of a rule, because
 * a wording held in four places is four rules that will disagree.
 *
 * **The test for what belongs here.** A clause earns a law when its violation is
 * silent. Every entry below is silent by construction: an unlayered bare-element
 * declaration of the page ground looks like a design decision in a screenshot, a
 * `var()` that resolves to nothing erases the declaration rather than painting a
 * wrong colour, a link that goes nowhere renders exactly like a link that works,
 * and a boundary that resolves the light block on a dark page is pack-correct and
 * looks right. None of them throws. That is the whole reason they are programs.
 *
 * **Why `stops` is here and not in a document.** A gate's failure message is read
 * at the moment somebody's build is red, which is the only moment a rule about
 * cross-repository conduct is ever going to be read by the person it is for. The
 * consequence therefore belongs in the same string as the assertion, or it is
 * prose again.
 *
 * Published at `@nanisoft/prism-ui/gates`. Not imported from `src/`, because a
 * gate is a build-time program for a consumer's repository and must never enter a
 * consumer's module graph or its bundle.
 */

/**
 * Every law the kit can enforce, keyed by the id a consumer names in its
 * configuration. Order is the order a reader meets them in, which is the order
 * they were written in the contract this file replaces.
 */
export const LAWS = {
  'retired-line': {
    title: 'No trace of the retired component library survives.',
    message:
      'No trace of the retired line survives in a consumer: not a dependency, not an import, not a\n' +
      '  generated stylesheet, not a build step, and not a living instruction. A dependency line is the\n' +
      '  easy half; the lockfile is read as a graph because deleting a line does not empty a tree while\n' +
      '  another package still declares the library.',
    why:
      'The four repositories shipped the retired line together and each of them discovered it had to\n' +
      '      remove it separately. The rule survived the removal as prose in four files and nothing failed\n' +
      '      when one of them brought it back.',
  },

  'stylesheet-ownership': {
    title: "A site stylesheet does not own a surface the design system owns.",
    message:
      'A site stylesheet must not own a surface the design system already owns. The cascade layer is\n' +
      '  not the cause of the failures this replaces; it is the reason they were invisible. Prism\'s base\n' +
      '  is layered and a consumer\'s sheet is not, so an unlayered declaration wins at any specificity\n' +
      '  whatever the cascade then does with it.',
    why:
      'An unlayered bare-element declaration of the page ground, the body ink, a focus outline or a\n' +
      '      hairline colour was live in all four repositories at once, and every one of them was a box\n' +
      '      with no edge, a white page in dark mode, or an element with no keyboard indicator, each of\n' +
      '      which is a plausible design in a screenshot.',
  },

  'token-read': {
    title: 'A custom property that nothing declares is not a wrong colour; it is no declaration at all.',
    message:
      'Every custom property this sheet reads is declared, and that is what a shorthand with one dead\n' +
      '  operand does to itself: a declaration that is invalid at computed-value time is not a wrong\n' +
      '  colour, it is no declaration, so a page ground reverts to transparent and a hairline reverts to\n' +
      '  border-style: none. A read that cannot fail hides its own failure, which is the whole reason the\n' +
      '  runtime form of this law was written first.',
    why:
      'Roughly two hundred and twenty custom-property reads across the four repositories resolved to\n' +
      '      nothing on the new line, about half of them shorthands. The page ground, the body ink, the\n' +
      '      hairline and the focus outline all reverted, and a screenshot of unstyled body text is a\n' +
      '      plausible design.',
  },

  links: {
    title: 'Every internal destination resolves, and every fragment names an element that exists.',
    message:
      'A reader followed a link on this site and arrived nowhere. Every address a reader has ever used\n' +
      '  has to keep working, and a broken internal link renders exactly like a working one, so nothing\n' +
      '  else in the build can see it.',
    why:
      'A migration rewrites the rendering layer and is forbidden from changing a word, so a route that\n' +
      '      quietly stopped being published is the one defect class the whole programme was at risk of\n' +
      '      shipping. This is the gate that outlived the parity baseline.',
  },

  'pack-boundary': {
    title: 'A pack boundary lands on a mark, and a declared region set is the whole of what may carry a second pack.',
    message:
      'A pack boundary is a promise with two axes. It re-points the corner radius as well as the colour,\n' +
      '  so a boundary on anything but a fully rounded mark changes that shape, and a boundary with no\n' +
      '  mode class of its own resolves its pack in the wrong mode on half the pages a reader sees. A\n' +
      '  screenshot in one mode is not evidence for either.',
    why:
      'A boundary that carries no descendant form resolves the light block on a dark page, which is\n' +
      '      pack-correct, mode-inverted and indistinguishable from a design decision. And because radius\n' +
      '      is the one non-colour member of a pack block, a section ground would put the section index\n' +
      '      into that section\'s corner radius, which is an encoding nobody chose.',
  },

  'runtime-token-read': {
    title: 'No token is read at runtime, and a read with a hard-coded fallback is a read that cannot fail.',
    message:
      'A token is resolved once at runtime and the resolved value does not follow the cascade, so a reader with\n' +
      '  a stored theme and a reader without one are served different colours from the same markup. The design\n' +
      '      system publishes the replacement, which is a token-driven inline replacement painted in the HTML: it\n' +
      '      resolves through the cascade, holds every pack, and ships no client code. The fix is deletion, not a\n' +
      '      better value.',
    why:
      'One site shipped a curve of numbers under a label reading as a live market feed, and the gate that should\n' +
      '      have seen it read prose while the dishonesty was arithmetic. A runtime token read is the same shape:\n' +
      '      the disagreement is between what is painted and what the cascade says, and only a program that reads\n' +
      '      the read can see it.',
  },

  'hidden-state': {
    title: 'A CSS-authored hidden state is escapable, and its exit is not a clock.',
    message:
      'A reader with scripting switched off received opacity: 0 and no way out of it. A hidden state is\n' +
      '  allowed in exactly two shapes: an escapable condition, or a script-armed ancestor attribute. The\n' +
      '  arming attribute has one writer, the module that writes it withdraws it on every path including\n' +
      '      load, and an inlined listener covers the reader whose scripting started and stopped.',
    why:
      'A fallback animation\'s clock starts at first style resolution rather than at scroll, so by the\n' +
      '      time the class lands there is nothing left to cancel. Cancellability was never the\n' +
      '      load-bearing property; having an exit that does not depend on a clock was.',
  },

  pin: {
    title: 'The design system is pinned exactly, and the token package is the component package\'s dependency rather than the site\'s.',
    message:
      'The pinned package is the whole cross-repository contract, so the pin is an exact version and the\n' +
      '  token package is not a dependency of this repository: `@nanisoft/prism-ui` declares it at an\n' +
      '      exact version, so a consumer cannot be handed a mismatched pair, and a second declaration of\n' +
      '      that number in a consumer is a second fact to keep in step with a release.',
    why:
      'The four repositories each declared the token version beside the component version, in a\n' +
      '      workspace configuration file as well as a manifest, so there were five places holding the\n' +
      '      same pair and no gate that could read all five. One site spent a release on the wrong line\n' +
      '      because nothing failed.',
  },
}

/** The ids, in the order they are declared. The order a report prints them in. */
export const LAW_IDS = Object.keys(LAWS)

/**
 * One law by id, or a throw naming the ones that exist.
 *
 * A `throw` rather than a default, because a caller that misspells an id and
 * receives an empty law gets a gate that runs and prints nothing, which is the
 * failure this file exists to remove.
 */
export function law(id) {
  const found = LAWS[id]
  if (!found) {
    throw new Error(
      `prism-gates: unknown law "${id}". The kit enforces: ${LAW_IDS.join(', ')}.`,
    )
  }
  return { id, ...found }
}
