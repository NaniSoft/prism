import { createContext, useContext, type ComponentType, type ReactNode } from 'react';

export interface PrismLinkContextValue {
  link?: ComponentType<{ href: string; children: ReactNode }>;
}

const PrismLinkContext = createContext<PrismLinkContextValue>({});

export function PrismLinkContextProvider({
  children,
  link,
}: {
  children: ReactNode;
  link?: ComponentType<{ href: string; children: ReactNode }>;
}): ReactNode {
  return (
    <PrismLinkContext.Provider value={{ link }}>
      {children}
    </PrismLinkContext.Provider>
  );
}

export function usePrismLink(): ComponentType<{ href: string; children: ReactNode }> {
  const { link } = useContext(PrismLinkContext);
  return link ?? ((props) => <a href={props.href}>{props.children}</a>);
}