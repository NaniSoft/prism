import { Badge } from '@nanisoft/prism-ui/components/badge'

import { OpsChecklist01, type OpsChecklist01Group } from '@nanisoft/prism-ui/blocks/ops-checklist-01'

/**
 * Twelve checks in three groups, and one of every state a check can be in.
 *
 * The verdicts are the part a reader has to learn, so all four are on screen at once
 * and a Demo showing only `fail` teaches nothing about `skipped` looking calm. The
 * sixth check has no expected reading and the seventh has no actual one, because a
 * check nobody has run is a fact a runbook shows rather than hides, and that is only
 * visible when there is a row beside it that has both.
 */
const RUNBOOK: OpsChecklist01Group[] = [
  {
    id: 'certificates',
    title: 'Certificates',
    description: 'Everything this estate terminates TLS with, and how long each has left.',
    checks: [
      {
        id: 'expiry',
        name: 'Certificates under 90 days',
        expected: 'Three or fewer',
        actual: 'One',
        verdict: 'pass',
        verdictLabel: (verdict) => (verdict === 'pass' ? 'Green' : 'Needs a look'),
        note: 'The one at 61 days is on the Rotterdam load balancer. Renewal is booked.',
      },
      {
        id: 'wildcard',
        name: 'Wildcard covering every host',
        expected: 'Present on both estates',
        actual: 'Missing on Cardiff',
        verdict: 'fail',
        verdictLabel: (verdict) => (verdict === 'fail' ? 'Red' : 'Needs a look'),
        note: 'cardiff.internal is served by a certificate issued for a single host. Raised with the platform rota.',
      },
      {
        id: 'chain',
        name: 'Full chain served, no missing intermediate',
        expected: 'Complete on every endpoint',
        actual: 'Complete on every endpoint',
        verdict: 'pass',
        verdictLabel: (verdict) => (verdict === 'pass' ? 'Green' : 'Needs a look'),
      },
    ],
  },
  {
    id: 'storage',
    title: 'Storage',
    description: 'The volumes the captures land in, and what is left of them.',
    checks: [
      {
        id: 'headroom',
        name: 'Free space on the capture volume',
        expected: 'Above 20 percent',
        actual: '14 percent',
        verdict: 'warn',
        verdictLabel: (verdict) => (verdict === 'warn' ? 'Watch' : 'Needs a look'),
        note: 'Two captures a day land here. At this rate the volume is full in nine days, so the rotation is not keeping up.',
      },
      {
        id: 'retention',
        name: 'Captures older than the retention window removed',
        expected: 'Nothing older than 90 days',
        actual: 'Nothing older than 90 days',
        verdict: 'pass',
        verdictLabel: (verdict) => (verdict === 'pass' ? 'Green' : 'Needs a look'),
      },
      {
        id: 'backup',
        name: 'Last snapshot taken',
        expected: 'Within 24 hours',
        actual: <Badge variant="secondary">Three days ago</Badge>,
        verdict: 'fail',
        verdictLabel: (verdict) => (verdict === 'fail' ? 'Red' : 'Needs a look'),
        note: 'The snapshot job is failing on the Rotterdam volume and the error is not reaching anybody.',
      },
    ],
  },
  {
    id: 'access',
    title: 'Access',
    description: 'Who can reach what, and whether the last review happened.',
    checks: [
      {
        id: 'keys',
        name: 'Keys older than 90 days',
        expected: 'None',
        actual: 'Two',
        verdict: 'warn',
        verdictLabel: (verdict) => (verdict === 'warn' ? 'Watch' : 'Needs a look'),
        note: 'Both belong to a service account that has not been used since February.',
      },
      {
        id: 'review',
        name: 'Quarterly access review signed off',
        expected: 'Signed in the last quarter',
        actual: 'Signed in the last quarter',
        verdict: 'pass',
        verdictLabel: (verdict) => (verdict === 'pass' ? 'Green' : 'Needs a look'),
      },
      {
        id: 'secrets',
        name: 'Shared credentials with a named owner',
        expected: 'Every credential owned',
        actual: null,
        verdict: 'skipped',
        verdictLabel: (verdict) => (verdict === 'skipped' ? 'Not run' : 'Needs a look'),
        note: 'Nobody was on the rota to run this one. It is the only check in the group with no reading, and the runbook shows that rather than hiding it.',
      },
      {
        id: 'mfa',
        name: 'MFA enforced on every account that can reach production',
        expected: 'Every account',
        actual: null,
        verdict: 'skipped',
        verdictLabel: (verdict) => (verdict === 'skipped' ? 'Not run' : 'Needs a look'),
        note: 'Skipped for the same reason. A grey dot beside a word, which is deliberately not the tone that means a reader must not miss.',
      },
    ],
  },
]

export default function OpsChecklist01Demo() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex max-w-measure-narrow flex-col gap-6">
        <p className="text-muted-foreground text-sm">
          This Block does not decide a verdict and cannot be made to. The tones below are
          Prism&rsquo;s and the words beside them are the Demo&rsquo;s, which is the same
          split every status in this package keeps: a colour is a mapping and a
          sentence is a fact. Pass a verdict with no <code className="font-mono">verdictLabel</code> and
          the run throws rather than drawing a dot nobody can read.
        </p>
      </div>

      <OpsChecklist01
        headingLevel="h3"
        eyebrow="Preview"
        title="Bristol and Rotterdam, this morning"
        description="Eleven checks in three groups, with two that were not run and one with no expected reading yet. The verdicts are the Demo's; this Block maps them to tones and refuses to draw one of its own."
        groups={RUNBOOK}
        summary={[
          { label: 'Green', value: '5' },
          { label: 'Needs a look', value: '2' },
          { label: 'Red', value: '2' },
          { label: 'Not run', value: '2' },
        ]}
        empty="This estate has no checks written down yet. The first check somebody adds is the first row here."
      />

      <OpsChecklist01
        headingLevel="h3"
        eyebrow="Preview"
        title="A runbook with no checks in it"
        description="The empty sentence is yours, because the two honest answers are opposites: nothing needs checking, or nobody has written the checks down."
        groups={[]}
        summary={[{ label: 'Checks written', value: '0' }]}
        empty="Nothing to check on this estate yet. The runbook is here so that somebody can add the first check rather than so that there is an empty page."
      />
    </div>
  )
}
