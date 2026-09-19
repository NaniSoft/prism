// DisplayTitle — the ADR-0003 worked example of a `brand-behavior` wrapper:
// its entire reason to exist is ADR-0001's signature move (the width axis as
// refraction, wght 600 / wdth 125), a CSS font-variation-settings concern antd's
// ThemeConfig cannot express. It removes no props (brand-behavior never narrows).

import { Typography } from 'antd';
import type { TitleProps } from 'antd/es/typography/Title.js';

const { Title } = Typography;

export interface DisplayTitleProps extends TitleProps {
  /** 'refracted' applies the display width axis (wdth 125). Default. */
  width?: 'normal' | 'refracted';
}

export function DisplayTitle({ width = 'refracted', className, ...rest }: DisplayTitleProps) {
  const display = width === 'refracted' ? 'prism-display prism-display--refracted' : 'prism-display';
  return <Title className={[display, className].filter(Boolean).join(' ')} {...rest} />;
}
