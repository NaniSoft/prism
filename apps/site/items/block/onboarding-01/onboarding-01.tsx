'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Onboarding01, type OnboardingStep } from '@nanisoft/prism-ui/blocks/onboarding-01'

/**
 * The four steps, in the order the setup runs, with one of them blocked.
 *
 * The blocked step is the whole point of this fixture. A setup with four healthy
 * steps says nothing about why `blocked` is in the union, and a reader who has been
 * stuck on the third step for a week is exactly the reader this Block exists for:
 * the mark is the one shape on the surface that is not a disc, and the words beside
 * it name what is missing, so the reader is not left reading a step that looks
 * identical to one they have not reached.
 */
const STEPS: OnboardingStep[] = [
  {
    id: 'account',
    name: 'Create the workspace',
    description: 'One workspace per team. The name is what appears on every run.',
    state: 'done',
    stateLabel: 'Done on 2 March',
    action: <Button size="sm" variant="ghost">Rename</Button>,
  },
  {
    id: 'warehouse',
    name: 'Point it at your warehouse',
    description: 'A read-only role is enough to begin with. You can widen it later.',
    state: 'done',
    stateLabel: 'Connected to public.events',
  },
  {
    id: 'key',
    name: 'Add a write key',
    description: 'The key is shown once. If you lose it you have to issue another.',
    state: 'blocked',
    stateLabel: 'Blocked: the warehouse role has no write grant',
    href: '/settings/keys',
    hrefLabel: 'Read about write keys',
  },
  {
    id: 'first-run',
    name: 'Run the first backfill',
    description: 'About an hour for a year of orders. You can watch it in the queue.',
    state: 'current',
    stateLabel: 'Ready as soon as the key is in',
  },
]

/**
 * The checklist, with the reader's own row selectable.
 *
 * `onSelect` is a handler, so this Demo is a client file and the Block is too. The
 * selected step is held in state here rather than in the Block, which is the whole
 * reason the handler is a prop: the Block reports which step a reader picked and
 * the consumer decides what that means, which for a real product is a navigation or
 * a mutation and for this Demo is one line of state.
 */
export default function Onboarding01Demo() {
  const [picked, setPicked] = useState<string | undefined>(undefined)

  return (
    <>
      <Onboarding01
        headingLevel="h3"
        eyebrow="Getting started"
        title="Three things and you are running"
        description="The list of what is left, which is the form a reader on a return visit wants. Each row is a control here, so no step carries an action or a destination of its own: the Block refuses a step that has both a control and an action, because a row that is a button with a button inside it has two hit targets and one focus stop."
        steps={STEPS.map((step) => ({ ...step, action: undefined, href: undefined }))}
        onSelect={(id) => setPicked((current) => (current === id ? undefined : id))}
        progressLabel={(done, total) => `${done} of ${total} done`}
        completion="The last step can wait until Monday. Nothing runs until you do it."
        empty="This workspace has nothing to set up."
      />

      {picked === undefined ? null : (
        <p className="text-muted-foreground mt-4 text-sm">
          You picked the step whose id is {picked}. That sentence is the Demo’s, not the Block’s.
        </p>
      )}

      <Onboarding01
        headingLevel="h3"
        eyebrow="First run"
        title="The same four steps as a rail"
        description="The form for a reader who has never seen the setup. The rail has no room for a description, a control or a blocked step, so it is refused rather than quietly dropped."
        variant="steps"
        steps={[
          { id: 'account', name: 'Create the workspace', state: 'done', stateLabel: 'Done' },
          { id: 'warehouse', name: 'Point it at your warehouse', state: 'done', stateLabel: 'Done' },
          { id: 'key', name: 'Add a write key', state: 'current', stateLabel: 'Next' },
          { id: 'first-run', name: 'Run the first backfill', state: 'upcoming', stateLabel: 'Later' },
        ]}
        progressLabel={(done, total) => `${done} of ${total} done`}
        empty="This workspace has nothing to set up."
      />
    </>
  )
}
