// Generated API tables: one section per public Prism interface extracted from
// the built declarations.

import type { ReactElement } from 'react';

import { itemPropsInterfaces, type ExtractedInterface } from '@/lib/item-props';

export function PropsTables({ itemKey }: { itemKey: string }): ReactElement | null {
  const interfaces = itemPropsInterfaces(itemKey);
  if (interfaces.length === 0) return null;

  return (
    <section className="site-api">
      <h2 id="api">API</h2>
      {interfaces.map((entry) => (
        <PropsTable key={entry.typeName} entry={entry} />
      ))}
    </section>
  );
}

function PropsTable({ entry }: { entry: ExtractedInterface }): ReactElement {
  return (
    <>
      <h3>
        <code>{entry.typeName}</code>
      </h3>
      {entry.extendsType && (
        <p>
          Inherits <code>{entry.extendsType}</code>.
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {entry.props.map((prop) => (
            <tr key={prop.name}>
              <td>
                <code>{prop.name}</code>
                {!prop.required && <span className="site-api__optional"> (optional)</span>}
              </td>
              <td>
                <code>{prop.typeText}</code>
              </td>
              <td>{prop.defaultValue ? <code>{prop.defaultValue}</code> : '—'}</td>
              <td>{prop.description ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
