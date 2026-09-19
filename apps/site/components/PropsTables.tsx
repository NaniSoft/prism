// Generated API tables (ticket 12 §2): the Prism-added props only — one
// section per extracted interface, "Extends" noted for antd bases.
// Pass-through items render nothing (the doc's own seam line covers them).

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
          Extends <code>{entry.extendsType}</code> — see the antd base for inherited props.
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
