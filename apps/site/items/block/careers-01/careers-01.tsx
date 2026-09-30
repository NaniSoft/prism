'use client'

import { useState } from 'react'

import { Careers01 } from '@nanisoft/prism-ui/blocks/careers-01'
import { TagGroup } from '@nanisoft/prism-ui/components/tag-group'

/** The teams a role can belong to, which is the Demo own data. */
const TEAMS = ['Instrumentation', 'Platform', 'Design']

/**
 * Three roles, one of them closed, with the caller own filter control in the slot.
 *
 * **The filter slot is a `TagGroup` of applied filters, and that is the shape a
 * removable chip is for.** A `TagGroup` takes its tags as data rather than as
 * children, and this Demo holds the applied set in state so that pressing a
 * remove control takes the filter off. A row of static chips would be a legend
 * for something that filters nothing, which is the one thing a filter row must
 * not be.
 */
export default function Careers01Demo() {
  const [applied, setApplied] = useState(() => ['Instrumentation'])

  const roles = [
    {
      id: 'controls',
      title: 'Controls engineer',
      team: 'Instrumentation',
      location: 'Bristol',
      pattern: 'Hybrid',
      summary:
        'The layer between a sensor and an agent that is going to act on it, which is where the interesting failures live.',
      postedAt: 'Posted 12 days ago',
      href: '/careers/controls-engineer',
      hrefLabel: 'Apply for this role',
    },
    {
      id: 'agent-runtime',
      title: 'Agent runtime engineer',
      team: 'Platform',
      location: 'Remote, UK and EU',
      summary:
        'The run loop, the queue behind it, and the rule that a run either finishes or says why it did not.',
      postedAt: 'Posted 3 days ago',
      href: '/careers/agent-runtime',
      hrefLabel: 'Apply for this role',
    },
    {
      id: 'field-eng',
      title: 'Field engineer',
      team: 'Instrumentation',
      location: 'Rotterdam',
      pattern: 'On site',
      postedAt: 'Posted 5 weeks ago',
      closed: true,
    },
    {
      id: 'design-systems',
      title: 'Design systems engineer',
      team: 'Design',
      location: 'Remote',
      pattern: 'Remote',
      summary: 'The token pipeline, the one stylesheet, and the gate that holds both.',
      postedAt: 'Posted yesterday',
      href: '/careers/design-systems',
      hrefLabel: 'Apply for this role',
    },
  ]

  return (
    <Careers01
      headingLevel="h3"
      eyebrow="Preview"
      title="Somebody has to watch the pipeline"
      description="A pipeline that runs needs people watching it, and this is what that looks like as a list."
      closedLabel="No longer open"
      filters={
        <div className="flex flex-col gap-2">
          <TagGroup
            tags={TEAMS.map((team) => ({ id: team, label: team }))}
            onRemove={(id) => setApplied((current) => current.filter((team) => team !== id))}
            removeLabel={(label) => `Remove the ${String(label)} filter`}
          />
          <p className="text-muted-foreground text-sm">
            {applied.length} of {TEAMS.length} teams in the list above
          </p>
        </div>
      }
      roles={roles}
    />
  )
}
