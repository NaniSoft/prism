'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { cn } from '../../lib/utils'

/**
 * One panel on the inner axis of a section, and the panel it holds.
 *
 * The axis is nested rather than parallel because the inner axis belongs to the
 * section it sits in: a reader who has chosen a section and then an inner panel is
 * in one place, and the two are announced as two axes inside it rather than as two
 * sets of tabs on a page.
 */
export type NestedTabPanel = {
  /** The panel's stable key. */
  value: string
  /** The tab's visible name. */
  label: React.ReactNode
  /** The panel's own content. */
  content?: React.ReactNode
}

/**
 * One section on the outer axis, and the inner axis inside it.
 *
 * `panels` is required and may be empty, because a section with no inner axis is a
 * real shape: it is a page-level switch between subjects where one of them has
 * nothing to subdivide, and a type that required an inner axis would force that
 * caller to invent one. An empty `panels` draws the section as a plain panel and no
 * inner tab list at all, which is the honest drawing rather than an empty strip of
 * tabs.
 */
export type NestedTabSection = {
  /** The section's stable key. */
  value: string
  /** The tab's visible name. */
  label: React.ReactNode
  /** One line under the section's name, for a reader who has arrived at it. */
  description?: React.ReactNode
  /** The inner axis, in the order a reader should meet it. */
  panels?: readonly NestedTabPanel[]
  /**
   * The inner panel shown when the reader first arrives at this section.
   *
   * Optional and defaulted to the first panel rather than required, because the
   * ordinary case is the first panel and a caller who has to write it is a caller
   * writing the same value twice. The cost of the default is that a caller who
   * reorders `panels` has changed what a reader sees on arrival, which is the same
   * property `Tabs` has and is not this Component's to fix.
   */
  defaultPanel?: string
}

/**
 * The props a NestedTabs accepts.
 *
 * Two axes, two controlled values and two callbacks, and no state of its own beyond
 * what it has to hold to make the two agree. The reason there is no combined value
 * is that the two axes change for different reasons and at different times: a reader
 * who changes the inner panel has not chosen a different section, and a Component
 * that reported the pair as one thing would call that a section change and reset a
 * rail for a reader who only moved a tab.
 */
export interface NestedTabsProps {
  /**
   * The sections, in the order a reader should meet them.
   *
   * Required, and the order is a claim rather than a layout: these are peer views of
   * one subject, which is what makes them tabs and not steps. A caller with a
   * *sequence* here wants `Tabs` for a single axis and `FormWizard` for the other,
   * and a nested tab list whose sections must be visited in order is a wizard with
   * the gating left out.
   */
  sections: readonly NestedTabSection[]
  /**
   * The section being shown.
   *
   * Controlled and required rather than defaulted, for the reason every axis in this
   * package is: the caller owns where the reader is, because the caller's own
   * navigation, its address and its analytics all need to know, and a Component that
   * kept its own copy would be a second source of truth about a position.
   */
  value: string
  /** Called when the reader moves to another section. */
  onValueChange: (value: string) => void
  /**
   * The inner panel being shown, within the current section.
   *
   * Controlled and required on the same terms as `value`, and required even though a
   * section may have no panels because the answer has to be about the section the
   * reader is in rather than about the page: a single `panel` prop that the
   * Component reset whenever the section changed would silently discard a reader's
   * choice of inner panel every time they came back to a section, and a control that
   * forgets is worse than one that never offered the choice. Pass the current
   * section's `defaultPanel` when the caller has none.
   */
  panel: string
  /** Called when the reader moves to another inner panel. */
  onPanelChange: (value: string) => void
  /**
   * The accessible name of the outer axis.
   *
   * Required, and the subject's noun rather than this Component's: a page with two
   * nested tab sets is a page where a reader cannot tell which one they are in, and
   * a tab list with no name is announced as "tab list" and nothing else.
   */
  label: string
  /**
   * The accessible name of the inner axis.
   *
   * Required, and required even where a section has no panels, because the name is
   * the difference between a reader being told "General, tab 1 of 3" and being told
   * "tab 1 of 3". The word is the caller's, and it is usually the section's own noun
   * followed by what the axis divides: "Deployment, files".
   */
  panelLabel: string
  /**
   * The words shown where a section's inner axis would be, for a section that has
   * no panels.
   *
   * Optional rather than required, because a section with no inner axis draws its own
   * content and a section that needs a line saying so passes one; the omission is
   * not a gap, it is the section having nothing to say.
   */
  fallback?: React.ReactNode
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * Two tab axes, one inside the other, with a roving tab stop each.
 *
 * **The whole cost of this Component is two tab stops that look like one.** Both
 * axes draw `TabsList`, both are a single Tab stop, both respond to the arrow keys,
 * and they sit on the same screen a few centimetres apart. A reader who tabs onto
 * the outer axis, presses the down arrow and lands in what looks like the same kind
 * of control has to work out from the announcement which axis they are on, and there
 * is no visual cue that tells them: two identically drawn tab lists are two
 * identically drawn tab lists. So both axes are named, and the names are the whole
 * mitigation. That is an honest cost rather than a solved problem, and a caller who
 * finds it confusing in a particular page is being told the truth about their page,
 * not about this Component.
 *
 * **The inner axis moves; the outer axis does not. That is the rule everything else
 * follows from.** Changing the inner panel is a reader refining what they are
 * looking at within a subject they have already chosen, so the outer value is
 * untouched: no callback fires, no rail moves, and a reader who is on "Deployment,
 * files" and switches to "logs" is still on Deployment. The alternative, where the
 * outer axis follows the inner one, is what a naive composition of two `Tabs` roots
 * produces when a caller puts the inner list outside the outer panel, and it is
 * wrong in a way a reader cannot correct: the section they are in changes under
 * them, so the panel they chose is no longer the panel they are reading.
 *
 * **Coming back to a section restores the panel they were on, and that is why
 * `panel` is a single controlled value rather than one per section.** A Component
 * that remembered a panel per section would need a record keyed by section, which is
 * a second piece of state the caller cannot see and cannot put in an address. Here
 * the caller holds one `panel` value and it survives a trip to another section and
 * back, because nothing in this module resets it. The cost is real and stated: if
 * the caller changes `panel` while the reader is on a different section, the value
 * belongs to the section they are on and not the one they left, so a caller driving
 * both axes from one store has to keep them in step. That is one value they already
 * hold, not a new one.
 *
 * **A section with no panels draws no inner axis at all.** An empty tab list is a
 * row of nothing that a reader tabs onto and cannot move within, and a section whose
 * content does not subdivide should look like a section that does not subdivide.
 * `panels` is therefore optional and an empty array is a real shape, which is the
 * reason this is not a type that requires at least one panel: a caller with one
 * subject that happens to have no sub-views would otherwise invent a panel to
 * satisfy it.
 *
 * **`Tabs` is composed twice and redrawn nowhere.** Both axes are the same
 * Component with the same keyboard model, the same roving tab stop and the same
 * announcement behaviour, and a second implementation of a tab axis inside this
 * module would be a third place for the same rule to disagree in. The composition is
 * the outer `Tabs` with the inner one inside its panel, so the inner axis inherits
 * the outer one's DOM position and the two nest the way the reader's understanding
 * nests.
 *
 * **The two axes are announced as two axes, which is the accessibility half of the
 * cost above.** `label` names the outer list and `panelLabel` names the inner one,
 * both through `aria-label` on each `TabsList`, so the reader is told which axis
 * every arrow key and every Tab is currently about. That is the mitigation and it is
 * a mitigation rather than a fix: two names in sequence do not make two identical
 * shapes distinguishable at a glance for a reader scanning rather than listening.
 *
 * **It is a client Component**, because both axes move after the reader acts, and
 * because every one of its value props is a function the caller hands it, which is a
 * client-to-client boundary wherever it is written. What that costs is the price of
 * every client control: a server Component may render one section with its panel
 * already chosen, and what it may not do is let the reader move on either axis.
 */
function NestedTabs({
  sections,
  value,
  onValueChange,
  panel,
  onPanelChange,
  label,
  panelLabel,
  fallback,
  className,
}: NestedTabsProps) {
  const section = sections.find((candidate) => candidate.value === value) ?? sections[0]
  const panels = section?.panels ?? []
  const active = panels.some((candidate) => candidate.value === panel) ? panel : undefined

  return (
    <div data-slot="nested-tabs" className={cn('flex w-full flex-col gap-4', className)}>
      {/*
       * The outer axis, and the whole of it is `Tabs`. Its own value and callback
       * are passed straight through, so the outer axis is the outer axis: nothing
       * here intercepts a section change, filters one, or refuses one.
       */}
      <Tabs value={section?.value} onValueChange={onValueChange} className="w-full">
        <TabsList aria-label={label}>
          {sections.map((candidate) => (
            <TabsTrigger key={candidate.value} value={candidate.value}>
              {candidate.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((candidate) => (
          <TabsContent key={candidate.value} value={candidate.value}>
            <div data-slot="nested-tabs-section" className="flex flex-col gap-4 pt-2">
              {candidate.description === undefined ? null : (
                <p
                  data-slot="nested-tabs-description"
                  className="text-muted-foreground text-sm"
                >
                  {candidate.description}
                </p>
              )}

              {/*
               * The inner axis, and it is `Tabs` again with its own value and its
               * own callback. `panelLabel` names it, so a reader who has pressed Tab
               * off the outer axis is told which of the two they have arrived on. The
               * value passed is the resolved one rather than the caller's raw `panel`,
               * so a caller whose `panel` names something this section does not hold
               * lands on a real panel rather than on a blank one.
               */}
              {panels.length === 0 ? (
                fallback
              ) : (
                <Tabs
                  value={active ?? candidate.defaultPanel ?? panels[0]?.value}
                  onValueChange={onPanelChange}
                  className="w-full"
                >
                  <TabsList aria-label={panelLabel} className="max-w-full overflow-x-auto">
                    {panels.map((inner) => (
                      <TabsTrigger key={inner.value} value={inner.value}>
                        {inner.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {panels.map((inner) => (
                    <TabsContent key={inner.value} value={inner.value}>
                      {inner.content}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export { NestedTabs }
