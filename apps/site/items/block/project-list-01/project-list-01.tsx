import { Button } from '@nanisoft/prism-ui/components/button'
import { Checkbox } from '@nanisoft/prism-ui/components/checkbox'
import { Field, FieldLabel } from '@nanisoft/prism-ui/components/field'
import { FilterPanel } from '@nanisoft/prism-ui/components/filter-panel'
import { Input } from '@nanisoft/prism-ui/components/input'
import { NativeSelect } from '@nanisoft/prism-ui/components/native-select'
import {
  ProjectList01,
  type ProjectListColumn,
  type ProjectListProject,
} from '@nanisoft/prism-ui/blocks/project-list-01'

/** A moment in this year, as the platform will read it. */
const UPDATED = Date.parse('2026-03-04T00:00:00Z')

/**
 * The projects, in the order a reader should meet them.
 *
 * Five, and the mixture is the point: one blocked, two running, one shipped and one
 * nobody has touched for a month. A fixture of five healthy projects would show the
 * rows form without showing why the state and the moment are both on the row, and
 * the last one is the row that shows what a project with no owner looks like.
 */
const PROJECTS: ProjectListProject[] = [
  {
    id: 'migration',
    name: 'Warehouse migration, phase two',
    summary: 'Move the thirty tables nothing reads from yet, then retire the old schema.',
    state: 'blocked',
    stateLabel: 'Blocked on a credential',
    owner: { name: 'Ravi Menon', avatar: { name: 'Ravi Menon' } },
    progress: 62,
    progressLabel: (value, name) => `${value} per cent of ${name}`,
    updated: UPDATED,
    updatedLabel: () => 'four days ago',
    tags: [
      { id: 'data', label: 'Data' },
      { id: 'q1', label: 'Q1' },
    ],
    href: '/projects/migration',
    hrefLabel: 'Open the project',
  },
  {
    id: 'pricing',
    name: 'Pricing review, Q3',
    summary: 'Three plans, one of which nobody has looked at since 2024.',
    state: 'active',
    stateLabel: 'Running',
    owner: { name: 'Ada Okafor', avatar: { name: 'Ada Okafor' } },
    progress: 30,
    progressLabel: (value, name) => `${value} per cent of ${name}`,
    updated: Date.parse('2026-03-06T00:00:00Z'),
    updatedLabel: () => 'two days ago',
    tags: [{ id: 'revenue', label: 'Revenue' }],
    href: '/projects/pricing',
    hrefLabel: 'Open the project',
  },
  {
    id: 'sso',
    name: 'Single sign-on for the operator view',
    summary: 'Every customer on their own identity provider.',
    state: 'active',
    stateLabel: 'Running',
    owner: { name: 'Lior Benali', avatar: { name: 'Lior Benali' } },
    progress: 88,
    progressLabel: (value, name) => `${value} per cent of ${name}`,
    updated: Date.parse('2026-03-07T00:00:00Z'),
    updatedLabel: () => 'yesterday',
    href: '/projects/sso',
    hrefLabel: 'Open the project',
  },
  {
    id: 'archive',
    name: 'Archive the 2024 estate',
    summary: 'Finished in February. Kept because the audit trail points at it.',
    state: 'complete',
    stateLabel: 'Shipped',
    owner: { name: 'Ravi Menon', avatar: { name: 'Ravi Menon' } },
    progress: 100,
    progressLabel: (value, name) => `${value} per cent of ${name}`,
    updated: Date.parse('2026-02-19T00:00:00Z'),
    updatedLabel: () => 'a fortnight ago',
  },
  {
    id: 'edge',
    name: 'Edge region for the run queue',
    summary: 'Nobody has picked this up since it was written down.',
    state: 'planning',
    stateLabel: 'Planned',
    updated: Date.parse('2026-02-02T00:00:00Z'),
    updatedLabel: () => 'a month ago',
  },
]

/** The columns of the table form, in the order a reader should meet them. */
const COLUMNS: ProjectListColumn[] = [
  { id: 'name', header: 'Project' },
  { id: 'state', header: 'State' },
  { id: 'owner', header: 'Owner' },
  { id: 'progress', header: 'Progress' },
  { id: 'updated', header: 'Last moved' },
  { id: 'href', header: '', className: 'w-px' },
]

/**
 * The same five projects three ways: as rows with a filter column beside them, as a
 * real table, and as nothing at all.
 *
 * The three fixtures are the three states this Block has, and the third is the one
 * a documentation page is least able to show and most able to need: a list where a
 * filter matched nothing, which is a claim about the product and never about the
 * design system. The toolbar is a plain input and a button rather than a search
 * Component, because the slot is the caller's and a control that needs state would
 * make this Demo a client file for no gain.
 */
export default function ProjectList01Demo() {
  return (
    <>
      <ProjectList01
        headingLevel="h3"
        eyebrow="The estate"
        title="Everything we are running"
        description="Ordered by the query your team already uses. This Block does not sort, because the order is a claim about which project matters this week."
        projects={PROJECTS}
        toolbar={
          <>
            <Input placeholder="Search projects" aria-label="Search projects" className="w-56" />
            <Button size="sm" className="ms-auto">
              New project
            </Button>
          </>
        }
        filters={
          <FilterPanel
            title="Narrow it down"
            summary="One of four shown"
            actions={
              <>
                <Button size="sm">Apply</Button>
                <Button size="sm" variant="ghost">
                  Clear
                </Button>
              </>
            }
          >
            <Field>
              <FieldLabel htmlFor="project-list-state">State</FieldLabel>
              <NativeSelect id="project-list-state" name="state" defaultValue="open">
                <option value="open">Open</option>
                <option value="blocked">Blocked</option>
                <option value="all">Everything</option>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="project-list-owner">Owner</FieldLabel>
              <NativeSelect id="project-list-owner" name="owner" defaultValue="any">
                <option value="any">Anyone</option>
                <option value="ravi">Ravi Menon</option>
                <option value="ada">Ada Okafor</option>
              </NativeSelect>
            </Field>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox id="project-list-mine" />
              <label htmlFor="project-list-mine" className="text-sm">
                Only mine
              </label>
            </div>
          </FilterPanel>
        }
        empty="No project matches those three filters. Clear one and try again."
      />

      <ProjectList01
        headingLevel="h3"
        eyebrow="The estate"
        title="The same five projects as a table"
        description="Past about eight rows, or the moment a reader starts comparing one row against another, the content is records with columns rather than a list of things."
        projects={PROJECTS}
        variant="table"
        columns={COLUMNS}
        empty="No project matches those three filters. Clear one and try again."
      />

      <ProjectList01
        headingLevel="h3"
        eyebrow="The estate"
        title="And the state a filter leaves it in"
        description="A list of nothing is a claim, and the claim is yours to write."
        projects={[]}
        empty="Nothing matches state, owner and the last two weeks. Clearing the owner filter is the one that usually does it."
      />
    </>
  )
}
