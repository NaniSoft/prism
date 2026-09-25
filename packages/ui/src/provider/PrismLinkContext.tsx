'use client';

import { createContext, useContext, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from 'react';

export type PrismLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
export type PrismLinkComponent = ComponentType<PrismLinkProps>;

export interface PrismLinkContextValue {
  link?: PrismLinkComponent;
}

const PrismLinkContext = createContext<PrismLinkContextValue>({});

const AnchorLink: PrismLinkComponent = ({ children, ...props }) => <a {...props}>{children}</a>;

export function PrismLinkContextProvider({
  children,
  link = AnchorLink,
}: {
  children: ReactNode;
  link?: PrismLinkComponent;
}): ReactNode {
  return <PrismLinkContext.Provider value={{ link }}>{children}</PrismLinkContext.Provider>;
}

export function usePrismLink(): PrismLinkComponent {
  return useContext(PrismLinkContext).link ?? AnchorLink;
}
