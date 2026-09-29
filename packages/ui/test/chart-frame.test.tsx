import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render, screen, within } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { ChartFrame, type ChartSeries } from '../src/components/ui/chart-frame'

/**
 * A chart: the frame every chart in a product shares, and the numbers behind it.
 *
 * Three claims carry the Component, and each is the kind that still looks right
 * in a screenshot.
 *
 * The first is the alignment claim, which is the reason a frame exists at all: a
 * chart of four-digit numbers and a chart of one-digit numbers put their plots in
 * the same box. A gutter that sized itself to its longest label would move the
 * second chart's plot sideways the first time a number grew a digit, and the only
 * symptom is two charts on a dashboard that no longer line up.
 *
 * The second is that the table and the marks cannot drift, because they are two
 * renderings of one `series` array. The failure is silent: a chart whose table
 * says last quarter is a picture of data with a table beside it, and nothing in
 * either is wrong on its own. So these tests read the numbers out of the cells
 * and out of the marks and check they are the same numbers, and then they check
 * the four cases where they would stop being the same: a gap, a zero, a series
 * shorter than the categories, and a value past the end of them.
 *
 * The third is that no colour is invented. A chart is the one surface where
 * hardcoding a hex is most tempting and least defensible, and the one gate that
 * would catch it does not scan this file, so the check is here instead: every
 * paint utility the frame renders is asserted to be a semantic role.
 */
const SOURCE = readFileSync(
  path.join(import.meta.dirname, '..', 'src', 'components', 'ui', 'chart-frame.tsx'),
  'utf8',
)

/** Four months, two series: the dataset the table and colour claims are read from. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr']

const API: ChartSeries = {
  id: 'api',
  label: 'API',
  color: 'chart-1',
  values: [120, 180, 150, 240],
}

const WEB: ChartSeries = {
  id: 'web',
  label: 'Web',
  color: 'chart-2',
  values: [60, 90, 140, 120],
}

const plot = (props: Partial<Parameters<typeof ChartFrame>[0]> = {}) =>
  render(
    <ChartFrame
      categories={MONTHS}
      series={[API, WEB]}
      label="Requests per month"
      tableCaption="Requests per month by surface"
      categoryHeading="Month"
      {...props}
    />,
  )

const frame = (container: HTMLElement) =>
  container.querySelector('[data-slot="chart-frame"]') as HTMLElement
const field = (container: HTMLElement) =>
  container.querySelector('[data-slot="chart-field"]') as HTMLElement
const gutter = (container: HTMLElement) =>
  container.querySelector('[data-slot="chart-axis-y"]') as HTMLElement
const bars = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('[data-slot="chart-bar"]'),
]
const points = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('[data-slot="chart-point"]'),
]
const ticks = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('[data-slot="chart-tick"]'),
]
const tickText = (container: HTMLElement) => ticks(container).map((tick) => tick.textContent)

/** The numbers in the table, read the way a reader reads cells: by series, in order. */
function tableNumbers(container: HTMLElement, seriesId: string): (string | null)[] {
  return [...container.querySelectorAll<HTMLElement>('[data-slot="chart-table"] td')]
    .filter((cell) => cell.getAttribute('data-series') === seriesId)
    .map((cell) => cell.textContent)
}

describe('the ChartFrame', () => {
  it('is a figure named by the caller, because two charts on a page are two figures', () => {
    const { container } = plot()
    expect(screen.getByRole('figure', { name: 'Requests per month' })).toBe(frame(container))
  })

  it('gives every chart the same plot box, whatever its numbers are', () => {
    // The alignment claim, read from the two charts' own class strings. A gutter
    // that fit its longest label would differ between these two by the width of
    // three digits, and the symptom on a dashboard is two plots that do not line
    // up with anything the reader can name.
    const { container: small } = render(
      <ChartFrame
        categories={MONTHS}
        series={[{ ...API, values: [1, 2, 3, 4] }]}
        label="Small"
        tableCaption="Small"
        categoryHeading="Month"
      />,
    )
    const { container: large } = render(
      <ChartFrame
        categories={MONTHS}
        series={[{ ...API, values: [120000, 180000, 150000, 240000] }]}
        label="Large"
        tableCaption="Large"
        categoryHeading="Month"
      />,
    )

    expect(gutter(large).className).toBe(gutter(small).className)
    expect(field(large).className).toBe(field(small).className)
    // And the height is a bound utility rather than something computed from the
    // data, which is the other half of the same claim.
    expect(field(small).className).toContain('h-48')
  })

  it('draws the caller own colour and no other', () => {
    const { container } = plot()
    // The assignment is the caller's claim about what a thing is, so the frame
    // draws it and never chooses one. A chart that coloured itself by position
    // would be making that claim on the caller's behalf.
    const api = points(container).filter((point) => point.dataset.series === 'api')
    const web = points(container).filter((point) => point.dataset.series === 'web')
    expect(api[0]).toHaveClass('bg-chart-1')
    expect(web[0]).toHaveClass('bg-chart-2')
    expect(field(container).querySelector('[data-series="api"] line')).toHaveClass('stroke-chart-1')
    expect(field(container).querySelector('[data-series="web"] line')).toHaveClass('stroke-chart-2')
    // Three points, so two segments, and the segment's ends are the categories
    // the points are on: a stroke drawn between two places the data is not is a
    // line that says something the table does not.
    const segment = field(container).querySelector('[data-series="api"] line') as SVGLineElement
    expect(segment.getAttribute('x1')).toBe('0%')
    expect(segment.getAttribute('x2')).toBe('33.33333333333333%')
  })

  it('paints with no value and no ramp step, anywhere in the frame', () => {
    const { container } = plot()
    const paints = [...container.querySelectorAll('*')].flatMap((element) =>
      [...element.classList].filter((name) =>
        /^(?:bg|text|border|stroke|fill|ring|outline|decoration)-/.test(name),
      ),
    )
    expect(paints.length).toBeGreaterThan(0)
    for (const paint of paints) {
      expect(paint).not.toMatch(/#[0-9a-f]{3,8}/i)
      expect(paint).not.toMatch(/rgba?\(/)
      // A ramp step is a colour utility whose suffix is a hue and a number, such
      // as `bg-red-500`. Every colour on this frame is a semantic role.
      expect(paint).not.toMatch(
        /-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/,
      )
    }
  })

  it('names no series role the caller did not assign', () => {
    const { container } = plot()
    const used = new Set(
      [...container.querySelectorAll('*')].flatMap((element) =>
        [...element.classList].filter((name) => /^(?:bg|stroke)-chart-/.test(name)),
      ),
    )
    // Two series, two roles, and the three the caller did not name are nowhere on
    // the frame. A Component that reached for a fourth role to draw a gridline or
    // an axis would be a Component choosing a colour.
    expect([...used].sort()).toEqual([
      'bg-chart-1',
      'bg-chart-2',
      'stroke-chart-1',
      'stroke-chart-2',
    ])
  })

  it('renders an authored empty state rather than an empty plot', () => {
    const { container } = plot({ series: [], empty: 'No requests in this period' })
    // An empty plot with an axis and no marks reads as a broken chart, and the
    // words are the caller's because only the caller knows whether this is "no
    // data yet" or "nothing matched this filter".
    expect(screen.getByText('No requests in this period')).toBeTruthy()
    expect(container.querySelector('[data-slot="chart-empty"]')).toBeTruthy()
    // The claims, as absences: no plot, no table, no legend, no axes.
    expect(container.querySelector('[data-slot="chart-field"]')).toBeNull()
    expect(container.querySelector('[data-slot="chart-table"]')).toBeNull()
    expect(container.querySelector('[data-slot="chart-legend"]')).toBeNull()
  })

  it('renders the empty state when the series are there and every value is a gap', () => {
    const { container } = plot({
      series: [{ ...API, values: [null, null, null, null] }],
      empty: 'Nothing recorded yet',
    })
    // A series of gaps is not a chart with nothing drawn in it, it is a chart with
    // nothing to draw, and the difference is the difference between an answer and
    // a defect.
    expect(container.querySelector('[data-slot="chart-empty"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="chart-field"]')).toBeNull()
  })

  it('keeps the empty state the height of the plot it replaces, so a row does not move', () => {
    const { container: withData } = plot()
    const { container: withoutData } = plot({ series: [], empty: 'No data' })
    // A dashboard row that changes height when its data arrives moves the row the
    // reader was looking at, which is the whole dashboard.
    const emptyBox = withoutData.querySelector('[data-slot="chart-empty"]') as HTMLElement
    expect(emptyBox.className).toContain('h-48')
    expect(field(withData).className).toContain('h-48')
  })

  it('carries the same numbers in its table as in its marks', () => {
    const { container } = plot()
    // The claim is that these cannot drift, because they are two renderings of one
    // `series` array rather than a table a consumer wrote beside the plot.
    expect(tableNumbers(container, 'api')).toEqual(['120', '180', '150', '240'])
    expect(tableNumbers(container, 'web')).toEqual(['60', '90', '140', '120'])
    // And the same values reach the marks: four points per series, at the
    // categories the table's rows are named for.
    expect(points(container).filter((point) => point.dataset.series === 'api')).toHaveLength(4)
  })

  it('draws a bar at the position its own table cell states', () => {
    const { container } = plot({
      mark: 'bar',
      series: [{ id: 'only', label: 'Only', color: 'chart-3', values: [0, 25, 50, 100] }],
    })
    const drawn = bars(container)
    expect(drawn).toHaveLength(4)
    // The scale runs 0 to 100 for this data, so a bar is its share of the field
    // and a zero is a zero-height bar rather than a missing one.
    expect(drawn.map((bar) => bar.style.height)).toEqual(['0%', '25%', '50%', '100%'])
    expect(drawn.map((bar) => bar.style.top)).toEqual(['100%', '75%', '50%', '0%'])
    expect(tableNumbers(container, 'only')).toEqual(['0', '25', '50', '100'])
  })

  it('divides each category into one slice per series, inside its own column', () => {
    const { container } = plot({ mark: 'bar' })
    // Four categories, two series, and the slices are shares of the column rather
    // than shares of the whole field. A bar chart whose second series is drawn
    // across the entire plot is a bar chart with eight bars where there are four.
    const columns = container.querySelectorAll('[data-slot="chart-column"]')
    expect(columns).toHaveLength(4)
    for (const column of columns) {
      expect(column.querySelectorAll('[data-slot="chart-bar"]')).toHaveLength(2)
    }
    expect(bars(container)[1].style.left).toBe('calc(50% + 1px)')
  })

  it('tells a gap from a zero, in the table and on the plot', () => {
    const { container } = plot({
      mark: 'bar',
      series: [{ id: 'only', label: 'Only', color: 'chart-3', values: [0, null, 50, null] }],
    })
    // A gap draws no mark and writes no cell, and a zero draws a mark at zero
    // height and writes a zero. If both rendered as an empty cell, a reader would
    // read "no data" where the data said "nothing happened".
    expect(bars(container)).toHaveLength(2)
    expect(tableNumbers(container, 'only')).toEqual(['0', '', '50', ''])
  })

  it('leaves a gap where a series is short rather than shifting its values along', () => {
    const { container } = plot({
      mark: 'bar',
      series: [{ id: 'only', label: 'Only', color: 'chart-3', values: [10, 20] }],
    })
    // Two values and four categories. Shifting them left would put 10 under Feb
    // and 20 under Mar, which is a wrong answer that looks right in every
    // screenshot: the bars are the right height under the wrong months.
    expect(tableNumbers(container, 'only')).toEqual(['10', '20', '', ''])
    expect(bars(container)).toHaveLength(2)
  })

  it('ignores a value past the end of the categories and does not let it stretch the axis', () => {
    const { container } = plot({
      mark: 'bar',
      series: [{ id: 'only', label: 'Only', color: 'chart-3', values: [10, 20, 30, 40, 9000] }],
    })
    // A value with no category has nowhere to be drawn, so it is neither plotted
    // nor tabulated. Letting it into the scale would squash the four real bars
    // into the top seventh of the field, and the chart would stay internally
    // consistent, which is what makes this failure quiet.
    expect(tableNumbers(container, 'only')).toEqual(['10', '20', '30', '40'])
    expect(bars(container)).toHaveLength(4)
    expect(tickText(container)).not.toContain('9000')
    const tallest = Math.max(...bars(container).map((bar) => Number.parseFloat(bar.style.height)))
    expect(tallest).toBe(100)
  })

  it('rounds the axis to a step a reader can place a value on', () => {
    const { container } = plot({
      mark: 'bar',
      series: [{ id: 'only', label: 'Only', color: 'chart-3', values: [37, 74, 111] }],
      categories: ['One', 'Two', 'Three'],
    })
    // 0, 37, 74, 111 is an axis a reader has to do arithmetic on. The step is one,
    // two, five or ten times a power of ten, so the gridlines land where a reader
    // expects and two charts on a page share a scale shape.
    expect(tickText(container)).toEqual(['0', '50', '100', '150'])
  })

  it('draws a negative value below the baseline rather than as nothing', () => {
    const { container } = plot({
      mark: 'bar',
      series: [{ id: 'only', label: 'Only', color: 'chart-5', values: [40, -20] }],
      categories: ['One', 'Two'],
    })
    // A loss drawn as a zero-height bar is a chart that is confidently wrong. The
    // bar hangs from the zero line, and the zero line is on the axis because both
    // ends of the scale are multiples of the step.
    const zero = ticks(container).find((tick) => tick.textContent === '0')
    const baseline = Number.parseFloat(zero?.style.top ?? 'NaN')
    expect(Number.isNaN(baseline)).toBe(false)

    const [positive, negative] = bars(container)
    // Above the baseline is a smaller distance from the top of the field.
    expect(Number.parseFloat(positive.style.top)).toBeLessThan(baseline)
    expect(Number.parseFloat(negative.style.top)).toBeCloseTo(baseline, 5)
    expect(Number.parseFloat(negative.style.height)).toBeGreaterThan(0)
    expect(negative.className).toContain('rounded-b-sm')
    expect(positive.className).toContain('rounded-t-sm')
  })

  it('draws a baseline rather than dividing by a range that is not there', () => {
    const { container } = plot({
      mark: 'bar',
      series: [{ id: 'only', label: 'Only', color: 'chart-3', values: [0, 0, 0] }],
    })
    // Every value the same, so the range is zero and the division is a NaN that
    // reaches the DOM as a height the browser discards. The frame gives the data
    // one step of scale instead, so the field has a top and a bottom.
    const drawn = bars(container)
    expect(drawn).toHaveLength(3)
    for (const bar of drawn) {
      expect(bar.style.height).toBe('0%')
      expect(bar.style.height).not.toContain('NaN')
    }
  })

  it('names every series in the legend, whatever the count', () => {
    const { container } = plot()
    // The legend is the only statement of the series-to-colour assignment on the
    // frame, and two of the five roles measure below 3:1 against a light card, so
    // a mark is found by its position and its shape rather than by its colour.
    const entries = [...container.querySelectorAll('[data-slot="chart-legend-entry"]')].map(
      (entry) => entry.textContent,
    )
    expect(entries).toEqual(['API', 'Web'])
    // The swatch is not the name, so it carries nothing a reader would hear twice.
    expect(container.querySelector('[data-slot="chart-swatch"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })

  it('keeps the table in the document when it is only announced', () => {
    const { container } = plot({ table: 'hidden' })
    // A consumer with a dense dashboard wants the representation without the
    // surface. What it must not lose is the table: still a table, still reachable
    // by a screen reader's table navigation, still findable by find-in-page.
    const wrapper = container.querySelector('[data-slot="chart-table"]') as HTMLElement
    expect(wrapper.className).toBe('sr-only')
    expect(within(wrapper).getByRole('table')).toBeTruthy()
    expect(tableNumbers(container, 'api')).toEqual(['120', '180', '150', '240'])
  })

  it('keeps the axis compact and the table exact, because they are two jobs', () => {
    const { container } = plot({
      format: (value) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)),
      series: [{ id: 'only', label: 'Only', color: 'chart-1', values: [1200, 4800] }],
      categories: ['One', 'Two'],
    })
    // Four characters on an axis, a currency symbol in a table. A caller that
    // passes one formatter and both the axis and the table round has stopped the
    // table being the exact representation the whole design rests on.
    expect(tickText(container)).toEqual(['0', '2k', '4k', '6k'])
    expect(tableNumbers(container, 'only')).toEqual(['1200', '4800'])
  })

  it('renders the caller own categories in the caller own order', () => {
    const { container } = plot()
    const labels = [...container.querySelectorAll('[data-slot="chart-category"]')].map(
      (label) => label.textContent,
    )
    expect(labels).toEqual(MONTHS)
  })

  it('renders no word the caller did not pass', () => {
    const { container } = plot({
      categories: ['Q1', 'Q2', 'Q3', 'Q4'],
      series: [{ id: 'x', label: 'Widget', color: 'chart-1', values: [1, 2, 3, 4] }],
      label: 'Widgets shipped',
      title: 'Widgets',
      tableCaption: 'Widgets by quarter',
      categoryHeading: 'Quarter',
    })
    // The months, the series names, the caption, the head of the category column
    // and the figure's own name are all the caller's. A chart that named its own
    // months would be right in one product and wrong in every other, and nothing
    // in a screenshot would show it.
    //
    // Read per text node rather than off `textContent`, which concatenates
    // adjacent nodes with no separator: a row head "Q1" followed by the cell "1"
    // is two words the caller passed, and `textContent` reports it as "Q11".
    const said = new Set(
      'Widgets Widget shipped Q1 Q2 Q3 Q4 by quarter Quarter 0 1 2 3 4'.split(' '),
    )
    const words = new Set<string>()
    for (const element of container.querySelectorAll('*')) {
      for (const child of element.childNodes) {
        if (child.nodeType !== Node.TEXT_NODE) continue
        for (const word of (child.textContent ?? '').split(/\s+/)) {
          if (word !== '') words.add(word)
        }
      }
    }
    expect(words.size).toBeGreaterThan(0)
    expect([...words].filter((word) => !said.has(word))).toEqual([])
  })

  it('does not draw in, because motion in this system is state feedback', () => {
    // A chart that animates its bars up on mount is decoration, and this system
    // has none. The one transition here is a bar resizing when its value changes,
    // which is the reader being shown that something happened.
    expect(SOURCE).not.toMatch(/@keyframes|animate-|duration-\[|ease-\[/)
    const { container } = plot({ mark: 'bar' })
    const bar = bars(container)[0]
    expect(bar.className).toContain('duration-base')
    expect(bar.className).toContain('ease-out')
  })

  it('has no accessibility violations with a plot on the page', async () => {
    const { container } = plot({ mark: 'bar', title: 'Requests per month' })
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('has no accessibility violations with the table announced and not seen', async () => {
    const { container } = plot({ table: 'hidden' })
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('has no accessibility violations when it is empty', async () => {
    const { container } = plot({ series: [], empty: 'No requests in this period' })
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
