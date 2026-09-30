import {
  PermissionMatrix01,
  type PermissionMatrixColumn,
  type PermissionMatrixRole,
} from '@nanisoft/prism-ui/blocks/permission-matrix-01'

/** The words an ordinary cell announces, given whether it is granted or refused. */
function valueLabel(allowed: boolean, role: string, permission: string): string {
  return allowed
    ? `${role} can ${permission.toLowerCase()}`
    : `${role} cannot ${permission.toLowerCase()}`
}

/** A count of people, in a sentence, because a bare figure in a heading is a number to guess at. */
function countLabel(count: number): string {
  return count === 1 ? 'One person' : `${count} people`
}

const COLUMNS: PermissionMatrixColumn[] = [
  { id: 'viewer', header: 'Viewer' },
  { id: 'editor', header: 'Editor' },
  { id: 'admin', header: 'Admin' },
  { id: 'owner', header: 'Owner' },
]

const ROLES: PermissionMatrixRole[] = [
  { id: 'viewer', name: 'Viewer', count: 12, countLabel },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Everything a viewer can do, and the findings themselves.',
    count: 4,
    countLabel,
  },
  { id: 'admin', name: 'Admin', count: 2, countLabel },
  { id: 'owner', name: 'Owner' },
]

/** The matrix, then the same model with one group, then a matrix with a single role. */
export default function PermissionMatrix01Demo() {
  return (
    <>
      <PermissionMatrix01
        headingLevel="h3"
        eyebrow="Preview"
        title="What each role can do"
        description="Two groups and eleven cells, one of which is a third answer: a permission that depends on a hold the reader has to look up."
        columns={COLUMNS}
        roles={ROLES}
        groups={[
          {
            title: 'The findings',
            permissions: [
              { id: 'read', label: 'Read a finding', values: [true, true, true, true] },
              { id: 'assign', label: 'Assign a finding', values: [false, true, true, true] },
              {
                id: 'close',
                label: 'Close a finding',
                description: 'A closed finding is not deleted, and the audit trail keeps it.',
                values: [false, 'Where the hold is not open', true, true],
              },
              { id: 'delete', label: 'Delete a finding', values: [false, false, false, true] },
            ],
          },
          {
            title: 'The workspace',
            permissions: [
              { id: 'members', label: 'Add and remove members', values: [false, false, true, true] },
              {
                id: 'billing',
                label: 'Change the plan',
                values: [false, false, 'Only from the billing page', true],
              },
              { id: 'keys', label: 'Hold an API key', values: [false, false, true, true] },
            ],
          },
        ]}
        valueLabel={valueLabel}
        legend={{
          allowed: 'Granted',
          denied: 'Refused',
          conditional: 'Depends on something else',
        }}
      />
      <PermissionMatrix01
        headingLevel="h3"
        eyebrow="Preview"
        title="One group, and no counts"
        description="A group with an empty title is the only row of headers the table carries, which is the right shape for a model that does not divide."
        columns={COLUMNS}
        roles={ROLES.map((role) => ({ id: role.id, name: role.name, description: role.description }))}
        groups={[
          {
            title: '',
            permissions: [
              { id: 'read', label: 'Read a finding', values: [true, true, true, true] },
              {
                id: 'export',
                label: 'Export a finding',
                description: 'A file leaves the workspace, so the export is recorded.',
                values: [false, true, true, true],
              },
            ],
          },
        ]}
        valueLabel={valueLabel}
        legend={{
          allowed: 'Granted',
          denied: 'Refused',
          conditional: 'Depends on something else',
        }}
      />
      <PermissionMatrix01
        headingLevel="h3"
        eyebrow="Preview"
        title="A product with one role"
        description="One column is a real table with a real header, and a matrix of a single role is a legitimate answer rather than an edge case."
        columns={[{ id: 'member', header: 'Member' }]}
        roles={[{ id: 'member', name: 'Member', count: 31, countLabel }]}
        groups={[
          {
            title: 'Everything',
            permissions: [
              { id: 'read', label: 'Read anything', values: [true] },
              { id: 'invite', label: 'Invite somebody', values: [false] },
            ],
          },
        ]}
        valueLabel={valueLabel}
        legend={{
          allowed: 'Granted',
          denied: 'Refused',
          conditional: 'Depends on something else',
        }}
      />
    </>
  )
}
