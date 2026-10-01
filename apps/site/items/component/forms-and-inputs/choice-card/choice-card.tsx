import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import { ChoiceCard } from '@nanisoft/prism-ui/components/choice-card'

/**
 * Three groups, and between them every decision the Component makes.
 *
 * This Demo is a server module on purpose, and that is the demonstration: the
 * group below is a set of real radio inputs in a real form, the browser holds the
 * selection, the arrow keys move it, and the value is posted on submit. There is
 * no `use client` line here and there is no framework involved in any of it.
 *
 * The second group shows a disabled option, which stays in the accessibility tree
 * and is announced as unavailable, because a card that silently vanished is a
 * card a reader will believe has been withdrawn.
 */
const CADENCES = [
  { value: 'monthly', label: 'Monthly', description: 'Cancel whenever you like.' },
  { value: 'yearly', label: 'Yearly', description: 'Two months free on every workspace.' },
  { value: 'on-demand', label: 'On demand', description: 'Pay for what runs, nothing idle.' },
]

const REGIONS = [
  { value: 'eu', label: 'European Union', description: 'Frankfurt and Dublin.' },
  { value: 'uk', label: 'United Kingdom', description: 'London.' },
  { value: 'us', label: 'United States', description: 'Northern Virginia.' },
  { value: 'ap', label: 'Asia Pacific', description: 'Singapore and Sydney.', disabled: true },
]

const TARGETS = [
  { value: 'edge', label: 'Edge', description: 'Sixty regions, no data residency to choose.' },
  { value: 'region', label: 'Single region', description: 'One country, pinned.' },
  { value: 'private', label: 'Private link', description: 'Your own network, billed yearly.' },
]

/**
 * The three groups, in the shapes a product actually reaches for.
 *
 * A real `<form>` around the first, because a radio group's whole claim is that it
 * submits with a form, and a Demo that did not put one in front of it would be
 * demonstrating the markup and not the Component. No `action` is given: the form
 * is here for the semantics, and a Demo on a documentation page has nowhere
 * honest to post to.
 */
export default function ChoiceCardDemo() {
  return (
    <div className="flex max-w-measure flex-col gap-8">
      <form>
        <Card>
          <CardHeader>
            <CardTitle as="h3">Billing cadence</CardTitle>
            <CardDescription>
              Uncontrolled, in a real form, with no JavaScript anywhere on this
              page. The browser holds the selection, the arrows move it, and the
              value is posted under <code className="font-mono">name</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChoiceCard
              label="Billing cadence"
              name="cadence"
              defaultValue="monthly"
              required
              options={CADENCES}
            />
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle as="h3">Region</CardTitle>
          <CardDescription>
            Four choices on a row, one of them unavailable. A disabled option is
            refused rather than drawn as enabled and ignored, and it stays in the
            accessibility tree so a reader is told it exists and cannot be taken.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChoiceCard label="Region" name="region" columns={2} options={REGIONS} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">Deployment target</CardTitle>
          <CardDescription>
            Three choices side by side, and a group left read-only. The whole group
            is disabled, which is put on each radio rather than on the fieldset, so
            a card dims for one reason rather than two.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChoiceCard
            label="Deployment target"
            name="target"
            defaultValue="edge"
            columns={3}
            disabled
            options={TARGETS}
          />
        </CardContent>
      </Card>

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        Try it with the keyboard. Tab reaches a group as one stop and lands on the
        checked choice, the arrows move between the cards and choose as they go,
        and the focus ring is drawn on the card rather than on the radio inside it.
        Nothing on this page ships a client runtime.
      </p>
    </div>
  )
}
