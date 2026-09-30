'use client'

import type { FormEvent, ReactNode } from 'react'
import { useId, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../../components/ui/field'
import { Input } from '../../components/ui/input'
import { LiveRegion } from '../../components/ui/live-region'
import { NativeSelect } from '../../components/ui/native-select'
import { PasswordField } from '../../components/ui/password-field'
import { Progress } from '../../components/ui/progress'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One choice in a `select` field, and nothing else.
 *
 * A native `<option>` holds text and nothing more, which is the whole reason an
 * account form's select is a `NativeSelect` rather than the Base UI one. The two
 * values are a string and its label, so a caller who needs a description beside an
 * option, a count, or anything nested is reaching for a control the platform cannot
 * render, and `Signup01` does not pretend otherwise: it names `NativeSelect`'s own
 * argument in its JSDoc and stops there.
 */
export type SignupOption = {
  /** What the form submits for this choice, which is a key and not a sentence. */
  value: string
  /** The words the reader sees, in the product's own language. */
  label: string
}

/**
 * What every account field carries, whichever control it draws.
 *
 * `required` is a boolean rather than an optional prop because there is no third
 * state worth having: a field is one the reader must fill or one they may leave, and
 * a `required?: boolean` leaves a caller who passed nothing unable to say which of
 * the two they meant. A field is a data declaration and nothing else, and the two
 * arms below differ only in which control is drawn and in the one property that
 * control needs and the other has no use for.
 */
type SignupFieldBase = {
  /** The caller's key for this field, and the key the value arrives under. */
  id: string
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /** Whether the reader may submit the form without filling it. */
  required: boolean
  /**
   * A line under the control, announced with it rather than printed under the row.
   *
   * A node, because the honest line in this position is often not one sentence: a
   * caller's hint, a link to the document that says why a field is being asked for,
   * a piece of the page's own copy. It is wired to the control through
   * `aria-describedby`, so a screen reader hears what this field is for as the reader
   * reaches it rather than as a footnote they have to go back for.
   */
  description?: ReactNode
  /** What the control shows while it is empty. A hint, not a name. */
  placeholder?: string
  /** The platform's own autofill hint for this field. */
  autoComplete?: string
}

/**
 * One field of the caller's account form, and the control it draws.
 *
 * **A union and not one type with an optional `options`, and that is the shape of
 * the whole argument in this Block.** An account form's fields are the caller's
 * declaration, not this package's opinion about what a person may be asked, and the
 * one place that shows is the select: a select with no options is a control with
 * nothing in it, which is a question no reader can answer, so `options` is required
 * inside the select arm and forbidden beside the other three. A `options?: string[]`
 * on one type would typecheck the defect and only the diagnostic at run time would
 * catch it, which is one gate too late. The union is the same mechanism
 * `ContactField` uses for the same reason: the shape that requires something declares
 * it, and the shape that forbids it says so in the type rather than in prose.
 *
 * The cost of the union is that a caller who wants to build a field list
 * generically, from a schema, has to narrow before it can type the result, and the
 * answer to that is a narrowing function in the caller's own code rather than a
 * looser type here.
 */
export type SignupField =
  | (SignupFieldBase & {
      type: 'select'
      /** The choices, in the order the reader should meet them. */
      options: readonly SignupOption[]
    })
  | (SignupFieldBase & {
      type: 'text' | 'email' | 'tel'
      /** A select with no options is a question nobody can answer, so it is not one here. */
      options?: never
    })

/**
 * One reading of the secret the reader is typing, in the caller's own words and on
 * the caller's own scale.
 *
 * A named type rather than an inline object, for the ordinary reason: a consumer
 * assembling a signup form outside JSX, from a policy module or a store, has to be
 * able to declare the reading once and return it from a function it passes in.
 *
 * Both members are the caller's and the reason is the Block's JSDoc: the label is a
 * vocabulary question and the number is a policy question, and a Block that supplied
 * either would be shipping a security policy into every product that installed it.
 */
export type Signup01Reading = {
  /** The reading, in the product's own words. "Weak" and "unusable" are not the same sentence. */
  label: string
  /**
   * The reading as a number, drawn against 100 because the Block cannot know the
   * caller's scale. Pass a percentage, and pass a label that says what the number
   * means, because the number on its own is a bar and not a reading.
   */
  value: number
}

/**
 * The secret, the two sentences its reveal control is named with, and the caller's
 * own reading of it.
 *
 * `revealLabel` and `hideLabel` cannot be defaulted and the reason is the one
 * `PasswordField` argues for at length: a reveal control that says one sentence in
 * a product whose interface is in another language looks localised, because the icon
 * is the same everywhere and the half a screen reader user hears is English. A new
 * password is the field where that matters most of all, because it is the field a
 * reader is looking at while they choose.
 */
export type Signup01Password = {
  /** The field's visible name, and the accessible name its control announces. */
  label: string
  /** The accessible name of a reveal control while the secret is hidden. */
  revealLabel: string
  /** The accessible name of a reveal control while the secret is showing. */
  hideLabel: string
  /**
   * Called with the secret as it changes, and returning the caller's own reading of
   * it. Omit it and no reading is drawn at all.
   *
   * **A function and not a string, and that is the whole argument.** A strength
   * reading is a judgement, and a judgement has two parts that both belong to the
   * product: the word for it, which is a vocabulary, and the number behind it, which
   * is a policy. A Block that accepted a label would still have to know the scale to
   * draw a bar, and a Block that drew the bar would be shipping a rule about what
   * makes a secret acceptable into every product that installed it, invisibly, in a
   * component library, where no consumer reads it. Calling the caller's own function
   * is the only arrangement in which the reading is a fact about their product
   * rather than a claim about somebody else's. The cost is stated rather than hidden:
   * a caller with no function gets no reading, and a caller whose function is
   * expensive is called on every keystroke, which is their decision to make and the
   * one place on this screen where a consumer might be surprised by its own cost.
   */
  strength?: (value: string) => Signup01Reading
  /**
   * A line under the control.
   *
   * Replaced by nothing rather than stacked under the reading, because the reading
   * and the instruction are two answers to one question and a reader who has both
   * has been given a paragraph about a field.
   */
  description?: ReactNode
}

/**
 * What the caller's own account request is doing, in the caller's own words.
 *
 * A prop and never a state this Block writes, for the reason every Block in this
 * family states: an account request has more outcomes than any other form in this
 * package, from a refusal because the address is already registered to a refusal
 * because the address was never deliverable to a breach list that caught the secret
 * to an identity provider that is down, and one sentence cannot be true of them all.
 */
export type Signup01Status = {
  /**
   * Which of the four the request is in. Read by the Block for two things only.
   *
   * `working` disables the submit control, and `done` is the one member that makes
   * the Block clear the whole form, because a secret and a half-written address
   * sitting in a form after the account exists is a worse thing than a caller who
   * wanted to keep them. Everything else is the caller's to say.
   */
  state: 'idle' | 'working' | 'done' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/**
 * The way off this screen for a reader who already has an account, and where it
 * goes.
 *
 * A sentence and not a noun phrase, for the reason `Login01Link` gives: a link whose
 * visible words do not say what activating it does is a link a voice control user
 * cannot say out loud, because the words they can see are the words they can speak.
 */
export type Signup01SignIn = {
  /** The words on the link, and its accessible name. */
  label: string
  /** The destination, in the `href` where a reader can copy it. */
  href: string
}

/**
 * What the form hands over: the caller's own field values keyed by the caller's own
 * ids, and the secret.
 *
 * A named type and not an inline signature, for the ordinary reason: a consumer that
 * builds an account request in its own store names it to type the object it passes
 * in, and the alternative is the same anonymous shape written at every call site.
 */
export type SignupValue = {
  /** The declared fields' values, keyed by the caller's own `id`s. */
  fields: Record<string, string>
  /**
   * The secret, exactly as it was typed.
   *
   * Held by this Block for the length of the form and cleared when the caller's own
   * status reads `done`, which is the one piece of state this Block keeps about it.
   */
  password: string
}

/**
 * The props a Signup01 takes. Every string in this Block is one of them.
 *
 * There is a field list in this Block and it is the caller's, and the secret beside
 * it is Prism's. That is the whole of what this Block knows about account creation:
 * the two controls that are one arrangement rather than a declaration are the secret
 * with its reveal control and its reading, and everything a reader is asked about
 * their own account is the caller's to declare.
 */
export type Signup01Props = {
  /** The short line above the title, usually which product this is. */
  eyebrow?: ReactNode
  /**
   * The heading.
   *
   * Required, because an account form with no heading is a form in a page, and a
   * reader about to hand a product their name and a secret deserves to be told which
   * product before they do.
   */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * Called with what the reader typed, and the only thing this Block does with it.
   *
   * **Required, and the requirement is what makes it installable.** A form that
   * collects a person's name, their address and a secret and then does nothing with
   * them is a form that has handled a credential and discarded it without telling
   * anyone, and the alternative shape, an optional handler with a form that renders
   * and goes nowhere, is a legal TypeScript signature for exactly that. There is no
   * transport here, no route and no account store, because each of those is a
   * decision about the caller's product and its data.
   *
   * The secret arrives here and nowhere else. It is held by this Block for as long as
   * the form is on screen, handed over once, and cleared the moment the caller's own
   * status says the account exists.
   */
  onSubmit: (value: SignupValue) => void
  /**
   * The fields, in the order the reader should meet them.
   *
   * **Required, and this list is the whole design rather than a convenience.** An
   * account form with a fixed set of fields is a form that decides what a person may
   * say about themselves, and the decision is invisible in a review because the
   * rendered form looks complete. It is also the decision that loses the signup: a
   * form that cannot ask for a workspace name sends a free agent into a product
   * where every entity is scoped to one, a form that cannot ask for a job title
   * guarantees a sales team three weeks of discovery calls, and a form that cannot
   * ask which estate somebody is observing sends a half a dozen accounts onto a
   * queue that belongs to one. So `fields` is the caller's declaration, Prism names
   * the four controls it can draw and supplies no field at all. The cost is stated
   * rather than hidden: one column in the order the list gives, so a consumer that
   * wants a two-column form for a subset composes two of these or reaches for a
   * `Page`.
   */
  fields: readonly SignupField[]
  /** The secret, and the caller's own reading of it. See `Signup01Password`. */
  password: Signup01Password
  /**
   * The terms, and what accepting them means.
   *
   * **Optional in the type, and the cost of that is named here rather than left for
   * a consumer to discover.** A consumer who can ship this Block without stating
   * terms can make a legal claim they did not write, because the form on the page
   * will read as an account creation with nothing said about what the account is
   * for, who can see what is entered, and what happens to it afterwards. So the gate
   * is the consumer's and this Block cannot see it: `terms` is a node the caller
   * composes, and the check that it was accepted belongs beside the caller's own
   * submit control, because only the caller knows whether refusing the terms is a
   * refusal, a disabled control, or a message under the field. What this Block
   * supplies is the one thing that is not theirs to arrange, which is the place: the
   * terms are drawn under the fields and above the control, so a reader meets them
   * at the moment they are about to press it rather than in a page they have already
   * scrolled past.
   */
  terms?: ReactNode
  /** The words on the one control that submits. */
  submitLabel: string
  /**
   * Whether the caller's request is in flight.
   *
   * A prop and not read from `status`, because the two answer different questions:
   * `submitting` is the control and `status.state` is the outcome.
   */
  submitting?: boolean
  /**
   * What the caller's own request is doing, drawn in a live region and announced.
   *
   * See the Block's JSDoc for why there is no success sentence anywhere in this file
   * and what the honest failure of an account creation looks like.
   */
  status?: Signup01Status
  /** The link that leaves this screen for a reader who already has an account. */
  signIn?: Signup01SignIn
  /** Heading level for the section heading. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The empty form, which is an empty record and an empty secret.
 *
 * A frozen constant rather than a value built on each render, so the state a Block
 * holds has one identity for as long as it is empty and the "has this changed" check
 * below is comparing a value rather than a fresh object.
 */
const EMPTY_SIGNUP: SignupValue = { fields: {}, password: '' }

/**
 * Whether a caller passed a word that is not there.
 *
 * Read as `string | undefined` rather than as the declared type, because the check
 * is about the value that turned up rather than about what the type promised. A
 * JavaScript caller and a value out of a config store both arrive with the type's
 * guarantee already gone, and the diagnostic below is the last place that can still
 * say what was wrong.
 */
function blank(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a nameless control on the screen where a
 * reader is about to create an account.
 *
 * Four shapes, and each one is a control that cannot be used or a sentence that
 * would be read in the wrong language. A nameless field is announced as a text
 * field, and two nameless fields on one page are announced identically. A select
 * with nothing in it is a question no reader can answer that looks answered only
 * because the control is there and focusable. An English `revealLabel` in a product
 * that does not use the word is the half-localised control the copy gate was written
 * to end, and it is the worst of the three because a new secret is the one field a
 * reader is watching while they choose it.
 */
function assertSignup(input: {
  fields: readonly SignupField[]
  password: Signup01Password
  signIn: Signup01SignIn | undefined
}): void {
  const { fields, password, signIn } = input

  for (const field of fields) {
    if (blank(field.label)) {
      throw new Error(
        `Signup01: the field "${field.id}" declares no label, so its control would be announced with no name ` +
          'and two fields on this page would be announced identically. Every control this Block draws is named ' +
          'by its label, so there is no fallback to fall back to.',
      )
    }
    if (field.type === 'select' && (field.options === undefined || field.options.length === 0)) {
      throw new Error(
        `Signup01: the field "${field.id}" is a select and passes no options, so it would render a control ` +
          'with nothing in it, which is a question no reader can answer and looks answered only because the ' +
          'control is there and focusable. Pass the choices, or declare the field as a text field and check the ' +
          'answer in your own handler.',
      )
    }
  }

  if (blank(password.label) || blank(password.revealLabel) || blank(password.hideLabel)) {
    throw new Error(
      'Signup01: the secret field is missing one of its three words. A reveal control with no name is ' +
        'announced as a button, and it is the only control on this screen a keyboard reader reaches with Tab. ' +
        'Pass label, revealLabel and hideLabel in your own language.',
    )
  }

  if (signIn !== undefined && blank(signIn.label)) {
    throw new Error(
      `Signup01: the link to ${JSON.stringify(signIn.href)} declares no label, so the anchor's accessible ` +
        'name would be its destination, which a screen reader reads as a run of characters and a mouse ' +
        'reader cannot copy. Pass the sentence that says what following it does.',
    )
  }
}

/**
 * An account being created: the fields the caller says to ask, the terms the caller
 * supplies, a secret with a reveal control and the caller's own reading of it, and
 * one control that hands all of it over.
 *
 * **The translation, because the pattern is not ours and the framing is.** A
 * storefront publishes a registration card: a name, an address, a password with an
 * eye and a strength bar, a tick beside the terms, a button and a link back to
 * signing in, and its purpose is to turn a visitor into a shopper with a basket and a
 * saved address. Prism's products observe a pipeline, capture a market, watch an
 * estate and run agents, and a machine acting on behalf of a person is the whole
 * subject, so this is the screen where a person is given the authority to run one.
 * The composition is the storefront's and is unchanged: the declared fields, the
 * terms, the reveal, the reading, the single control, the one link. What it creates
 * is an identity that a machine may act under afterwards, and the difference from the
 * storefront shows up in three places: the reading is the caller's, the terms are the
 * caller's, and the sentence on the failure is the caller's.
 *
 * **What it authorises.** A successful `onSubmit` means the caller has an account and
 * that a session may be opened for it. It does not mean the address can receive
 * mail, that the terms were accepted, that the person is who they say they are, or
 * that anything about them has been verified. The Block has done no more than carry
 * the declared fields' values and one secret across a form boundary, and it holds
 * neither after the caller's own status says the account exists.
 *
 * **What it deliberately does not do.** It will not score the secret. It will not
 * decide whether the address is already in use. And it will not send a verification.
 * Each of those is the consumer's, and each is a security decision rather than a
 * rendering one, so a Block that made any of them would be something other than a
 * composition. A Block that scored a secret would be shipping a security policy into
 * every product that installed it, invisibly, in a component library, and the policy
 * would be Prism's rather than the product's: which is why `strength` is a function
 * returning the caller's own label and the caller's own number rather than a string
 * this Block could have named. A Block that decided whether an address is already
 * registered would be an account directory, which is the same enumeration oracle the
 * sign-in surface refuses to be, and here it is worse because registration is where
 * the directory is usually readable. And a Block that sent a verification would be
 * sending mail, which is a transport, a sender, a reputation and a legal claim, none
 * of which is a rendering decision.
 *
 * **The honest failure state is a single sentence, and the sentence is the caller's,
 * and the reason is that an account creation has more shapes than one sentence can be
 * true of.** It can fail because the address is already registered, because the
 * domain can never receive mail, because a name in the list is not a name, because
 * the caller's own field validation refuses an answer, because the terms were not
 * accepted, because a breach list caught the secret, because a rate limit was
 * reached, because the caller's identity provider is down, or because the caller's
 * own database is unreachable. Those are nine outcomes and each of them is a different
 * sentence, and which of them a reader is told about is a product's disclosure
 * decision with a security consequence. So `status` is a prop, this file holds no
 * `done` flag of its own and no `error` flag, and the words for a field are the
 * caller's. What the Block does about a failure is the two things that are rendering
 * rather than policy: it refuses a second press while the caller's request is in
 * flight, because a second press is a second account creation attempt against a
 * limit the Block cannot see, and it clears the form when the caller's own status
 * reads `done`, because a secret and a half-written address sitting in a form after
 * the account exists is a worse thing than a caller who wanted to keep them.
 *
 * **The reading is drawn as a `Progress` and not as a `Meter`, and the reason is that
 * `Meter` would require this Block to choose a tone.** A `Meter` takes thresholds and
 * a tone for each, which is exactly a policy: a reading of zero would be drawn in the
 * destructive token, which is a claim that the reader's secret is now a hazard, and
 * that claim belongs to the product. A `Progress` bar carries a value, a maximum and
 * a text alternative and no judgement, so the bar is Prism's and the number and the
 * words are the caller's. The cost is stated rather than hidden: the bar is drawn
 * against 100 because the Block cannot know the caller's scale, so a caller whose
 * scale is not a percentage has to pass one, and a bar that never changes colour is a
 * bar that cannot warn anybody. Both are the caller's decisions to make and neither is
 * one this package can make for four products at once.
 *
 * **The terms are optional in the type and the Block cannot see whether they were
 * accepted, and the cost of that is stated here rather than left to be discovered.** A
 * consumer who installs this Block and passes no `terms` has shipped an account
 * creation that says nothing about what the account is for, who can see what is
 * entered, or what happens to it afterwards, and a form that reads as complete is a
 * legal claim nobody chose. The alternative was making `terms` required, and the cost
 * of that is real too: a product whose account creation genuinely states no terms,
 * which is a workspace invited through a link and creates its record on first use,
 * would have had to write a sentence describing the absence, and that sentence would
 * sit in their source describing something they do not render. So the type is
 * optional, the placement is the Block's, and the check that the terms were accepted
 * is the caller's beside their own control, because only they know whether refusing
 * them is a refusal, a disabled button, or a message under the field.
 *
 * **The field values and the secret are held by this Block, and the reason is the one
 * the reveal control forces.** `PasswordField` is a controlled control, so the secret
 * has to exist before the reader types anything, and a Block that read the declared
 * fields out of the form while holding one value in state would have two different
 * ways of learning the same fact. So both are state, the form is submitted from that
 * state rather than from `FormData`, and clearing on `done` is a single set. The cost
 * is that a caller who never passes a `status` cannot clear the form from outside
 * this Block, and the answer is that a caller who never passes a `status` also never
 * said the account exists, so there is nothing to clear for.
 *
 * **It is a client Component, and the directive is unconditional.** `onSubmit` and
 * `strength` are functions, a function is a piece of state, and state is a client
 * module: a server Component cannot hand an event handler to a `<form>`, nor a
 * function to a prop, so a caller rendering this from a server component gets a form
 * that submits and calls nothing and a reading that never appears.
 */
export function Signup01({
  eyebrow,
  title,
  description,
  onSubmit,
  fields,
  password,
  terms,
  submitLabel,
  submitting = false,
  status,
  signIn,
  headingLevel = 'h2',
  className,
}: Signup01Props) {
  assertSignup({ fields, password, signIn })

  const generated = useId()
  const working = submitting || status?.state === 'working'
  const done = status?.state === 'done'

  /*
   * The declared values and the secret, and the two pieces of render-time state
   * that let the form be cleared when the caller's own status says the account
   * exists. The second is adjusted during render rather than in an effect, because
   * the trigger is a prop changing and this is the arrangement React documents for
   * it: a set during render is applied before the browser paints, so the reader never
   * sees the secret they just chose sitting in the field for a frame after the
   * account has been created.
   */
  const [typed, setTyped] = useState<SignupValue>(EMPTY_SIGNUP)
  const [wasDone, setWasDone] = useState(done)
  if (done !== wasDone) {
    setWasDone(done)
    if (done) setTyped(EMPTY_SIGNUP)
  }

  const setField = (id: string) => (value: string) =>
    setTyped((was) => ({ ...was, fields: { ...was.fields, [id]: value } }))

  const setSecret = (value: string) => setTyped((was) => ({ ...was, password: value }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(typed)
  }

  const reading = password.strength === undefined ? null : password.strength(typed.password)

  return (
    <Section data-slot="signup-01" className={cn(className)}>
      <div data-slot="signup-01-body" className="flex flex-col gap-10">
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        <Card data-slot="signup-01-card" className="max-w-measure-narrow gap-0 px-6">
          <form
            data-slot="signup-01-form"
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-5"
          >
            <FieldGroup data-slot="signup-01-fields">
              {fields.map((field) => {
                const controlId = `${generated}-${field.id}`
                const descriptionId = `${controlId}-description`

                return (
                  <Field
                    key={field.id}
                    data-slot="signup-01-field"
                    data-field={field.type}
                  >
                    <FieldLabel htmlFor={controlId}>{field.label}</FieldLabel>

                    {/*
                      The four controls, and the select is the platform's own. A
                      registration form is submitted from JavaScript on four of the four
                      consumer sites, and a custom select would still have to submit a
                      value through a hidden input, so the platform's control is the
                      honest one: it submits itself, it opens the mobile picker a
                      reader on a phone expects, and it is the control their password
                      manager already knows how to fill. The cost is stated rather than
                      hidden: a native `<option>` holds text and nothing else, so a
                      caller who needs a description beside a choice is reaching for a
                      control this Block cannot draw.
                    */}
                    {field.type === 'select' ? (
                      <NativeSelect
                        id={controlId}
                        name={field.id}
                        value={typed.fields[field.id] ?? ''}
                        onChange={(event) => setField(field.id)(event.target.value)}
                        required={field.required}
                        aria-describedby={
                          field.description === undefined ? undefined : descriptionId
                        }
                      >
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </NativeSelect>
                    ) : (
                      <Input
                        id={controlId}
                        name={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        value={typed.fields[field.id] ?? ''}
                        onChange={(event) => setField(field.id)(event.target.value)}
                        required={field.required}
                        aria-describedby={
                          field.description === undefined ? undefined : descriptionId
                        }
                      />
                    )}

                    {/*
                      The description is wired to the control rather than drawn under
                      the row, so what a sighted reader reads under the field and what a
                      screen reader announces with it are the same sentence. The id is
                      derived from the control's own, which is also the id a
                      `FieldError` would take if a caller were composing this row
                      themselves; see the JSDoc for why this Block draws no error of
                      its own.
                    */}
                    {field.description === undefined ? null : (
                      <FieldDescription id={descriptionId}>{field.description}</FieldDescription>
                    )}
                  </Field>
                )
              })}

              {/*
                The secret, and it is `PasswordField` rather than an `Input` with a
                caller's own button beside it. The Component's own argument is the
                reason and it matters more here than anywhere else in the package: a
                reveal control a consumer writes is a `<button>` with three things that
                can each be wrong in a way nothing on screen shows. Leave `type` off
                and it submits the form, so pressing it on a phone keyboard's go key
                posts a half-chosen secret before the reader has read a character of
                it. Give it no accessible name and it is announced as a button, and it
                is the only button on this screen a Tab key reaches. Give it a real
                name in one language and ship it into a product in another.

                `autoComplete` is left at the Component's own default rather than
                passed, and here that default is the one thing that has to be right: a
                new secret wants `new-password`, and the Component's default is
                `current-password` because a sign-in is the common case. So this Block
                passes `new-password` explicitly, and the reason it can is that the
                whole of this screen is a new secret.
              */}
              <PasswordField
                value={typed.password}
                onValueChange={setSecret}
                label={password.label}
                description={password.description}
                revealLabel={password.revealLabel}
                hideLabel={password.hideLabel}
                autoComplete="new-password"
              />
            </FieldGroup>

            {/*
              The reading, and it is a `Progress` bar and the caller's sentence beside
              it. The bar is drawn against 100 because the Block cannot know the
              caller's scale, and the sentence is the announced text alternative as
              well as the visible one, so a screen reader user is told what the bar
              means rather than being handed a number. The bar is `Progress` and not
              `Meter` for the reason the Block's JSDoc gives at length: a `Meter`
              needs a tone per threshold, and a tone here is a claim that the reader's
              secret is a hazard, which is a policy and not a rendering.

              The reading is drawn only when the caller passed a function, and it is
              drawn at every keystroke including the empty string, so a caller whose
              function has an opinion about an empty field will see it. That is the
              caller's own function and their own edge case.
            */}
            {reading === null ? null : (
              <div data-slot="signup-01-strength" className="flex flex-col gap-1.5">
                <Progress value={reading.value} max={100} valueText={reading.label} />
                <span data-slot="signup-01-strength-label" className="text-muted-foreground text-sm">
                  {reading.label}
                </span>
              </div>
            )}

            {/*
              The terms, drawn between the fields and the control for the reason the
              prop states: a reader meets them at the moment they are about to press
              it rather than in a page they have already scrolled past. The Block
              draws no tick and no check of any kind, and cannot see whether the terms
              were accepted; both of those are the caller's, and only the caller knows
              whether refusing them is a refusal, a disabled control, or a message
              under the field.
            */}
            {terms === undefined ? null : (
              <p data-slot="signup-01-terms" className="text-muted-foreground text-sm text-pretty">
                {terms}
              </p>
            )}

            <div data-slot="signup-01-actions" className="flex flex-col gap-3">
              <Button
                data-slot="signup-01-submit"
                type="submit"
                disabled={working}
                className="w-full"
              >
                {submitLabel}
              </Button>

              {/*
                The outcome, in a live region, and it renders nothing while there is
                no message. `LiveRegion` draws no element at all for an empty child,
                which is why a form in its resting state carries no live region rather
                than an empty one announcing every unrelated change of its ancestors.
                `assertive` only for a refusal, because that is the one state where the
                reader is waiting for an answer and nothing else follows it.
              */}
              <LiveRegion
                data-slot="signup-01-status"
                politeness={status?.state === 'error' ? 'assertive' : 'polite'}
                busy={working}
                className={cn(
                  'text-sm',
                  status?.state === 'error' ? 'text-destructive font-medium' : 'text-muted-foreground',
                )}
              >
                {status?.message}
              </LiveRegion>
            </div>
          </form>
        </Card>

        {signIn === undefined ? null : (
          <CtaLink
            data-slot="signup-01-sign-in"
            href={signIn.href}
            variant="ghost"
            size="sm"
            className="self-start"
          >
            {signIn.label}
          </CtaLink>
        )}
      </div>
    </Section>
  )
}

export default Signup01
