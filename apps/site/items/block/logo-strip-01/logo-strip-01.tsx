import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01'

/** The transition band: one line of short phrases, as a list. */
export default function LogoStrip01Demo() {
  return (
    <LogoStrip01
      label="Data sources"
      items={['Fyers v3', 'yfinance', 'nselib / nse-xbrl', 'NSE filings']}
    />
  )
}
