/**
 * A section heading that has content under it is aligned left, in every Block.
 *
 * **The rule is `SectionHeading`'s own, and it is not this file's.** That
 * Component's documentation says: "`center` is right for a band that is only a
 * heading, and `left` is right for a section with content under it, where a
 * centred title above a left-aligned list reads as two unrelated pieces." So
 * nothing here decides anything. This file holds the one question every Block that
 * opens with a heading has to answer the same way, because a Block that answers it
 * differently is not expressing a preference, it is inheriting a default.
 *
 * **Why one file for every Block, which is the same reason
 * `card-title-headings.test.tsx` is one file for six.** Ten files with one case
 * each would let the eleventh Block answer this question differently and still
 * pass, and that is precisely the failure: the list *is* the assertion, so a new
 * Block has to be added here to be checked at all.
 *
 * **The defect it was written for, and where it was visible.** `FeatureGrid01` and
 * `Pricing01` each rendered a centred heading over a grid of cards, and they were
 * the only two of ten that did. Neither had a stated reason, so neither had made a
 * decision. It was invisible in this repository, which previews one Block at a time
 * and so never put a centred title next to a left-aligned one. It was visible in
 * the consumer: the Nexus landing is composed from seven of these Blocks and put
 * two centred section titles among five left ones, and the page's rhythm read as an
 * accident. A page's composition belongs to the consumer, but a consumer cannot
 * correct one Block's alignment without restyling a catalogue item, which the
 * no-override-path rule does not allow. So the answer has to be the same in every
 * Block rather than something a consumer works around per page.
 *
 * **The two exceptions are stated, and both are the rule rather than a carve-out.**
 * `Cta01` draws no `SectionHeading` at all: it renders a centred title on a filled
 * primary panel with two actions and nothing under it, which is the case `center`
 * exists for. `Hero01` takes an `align` of its own because its two forms differ: a
 * centred hero is a band that is only a heading, and the two-column form puts its
 * figure beside the copy rather than under it, so it has content beside the heading
 * and not below it. Both are asserted, because an exception that is not asserted is
 * an exception that grows.
 *
 * **How alignment is read.** From the class list on the element that wraps the
 * heading, which is where `SectionHeading` puts the decision: `items-start` with
 * `text-left` for left, `items-center` with `text-center` for centre. jsdom applies
 * no stylesheet, so the classes are the evidence rather than a computed value. The
 * assertion is that the two pairs travel together, because reading only one of them
 * would pass a heading that centres its box and left-aligns its text.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { About01 } from '../src/blocks/about-01'
import { Awards01 } from '../src/blocks/awards-01'
import { Backdrop01 } from '../src/blocks/backdrop-01'
import { Bento01 } from '../src/blocks/bento-01'
import { Careers01 } from '../src/blocks/careers-01'
import { CaseStudies01 } from '../src/blocks/case-studies-01'
import { CaseStudy01 } from '../src/blocks/case-study-01'
import { Changelog01 } from '../src/blocks/changelog-01'
import { CodeSample01 } from '../src/blocks/code-sample-01'
import { Community01 } from '../src/blocks/community-01'
import { Compare01 } from '../src/blocks/compare-01'
import { Compliance01 } from '../src/blocks/compliance-01'
import { Consent01 } from '../src/blocks/consent-01'
import { Contact01 } from '../src/blocks/contact-01'
import { ContentGrid01 } from '../src/blocks/content-grid-01'
import { Cta01 } from '../src/blocks/cta-01'
import { Download01 } from '../src/blocks/download-01'
import { Faq01 } from '../src/blocks/faq-01'
import { FeatureGrid01 } from '../src/blocks/feature-grid-01'
import { FeatureRows01 } from '../src/blocks/feature-rows-01'
import { Feedback01 } from '../src/blocks/feedback-01'
import { FieldMap01 } from '../src/blocks/field-map-01'
import { Gallery01 } from '../src/blocks/gallery-01'
import { Help01 } from '../src/blocks/help-01'
import { Hero03 } from '../src/blocks/hero-03'
import { Industries01 } from '../src/blocks/industries-01'
import { Integration01 } from '../src/blocks/integration-01'
import { LogoCloud01 } from '../src/blocks/logo-cloud-01'
import { LogoStrip01 } from '../src/blocks/logo-strip-01'
import { MemberList01 } from '../src/blocks/member-list-01'
import { MilestoneTimeline01 } from '../src/blocks/milestone-timeline-01'
import { Newsletter01 } from '../src/blocks/newsletter-01'
import { NoteGrid01 } from '../src/blocks/note-grid-01'
import { Offer01 } from '../src/blocks/offer-01'
import { Pricing01 } from '../src/blocks/pricing-01'
import { PricingCompare01 } from '../src/blocks/pricing-compare-01'
import { ProcessFlow01 } from '../src/blocks/process-flow-01'
import { ProcessRail01 } from '../src/blocks/process-rail-01'
import { ProductGrid01 } from '../src/blocks/product-grid-01'
import { RateCard01 } from '../src/blocks/rate-card-01'
import { ResourceList01 } from '../src/blocks/resource-list-01'
import { Services01 } from '../src/blocks/services-01'
import { StackGrid01 } from '../src/blocks/stack-grid-01'
import { Stats01 } from '../src/blocks/stats-01'
import { StatusLedger01 } from '../src/blocks/status-ledger-01'
import { Story01 } from '../src/blocks/story-01'
import { Team01 } from '../src/blocks/team-01'
import { Testimonial01 } from '../src/blocks/testimonial-01'
import { Trend01 } from '../src/blocks/trend-01'
import { Waitlist01 } from '../src/blocks/waitlist-01'
import { ActivityFeed01 } from '../src/blocks/activity-feed-01'
import { AddressBook01 } from '../src/blocks/address-book-01'
import { AuditLog01 } from '../src/blocks/audit-log-01'
import { Calendar01 } from '../src/blocks/calendar-01'
import { ChartGroup01 } from '../src/blocks/chart-group-01'
import { Dashboard01 } from '../src/blocks/dashboard-01'
import { Directory01 } from '../src/blocks/directory-01'
import { Gantt01 } from '../src/blocks/gantt-01'
import { Handoff01 } from '../src/blocks/handoff-01'
import { Inbox01 } from '../src/blocks/inbox-01'
import { Intake01 } from '../src/blocks/intake-01'
import { IssueDetail01 } from '../src/blocks/issue-detail-01'
import { IssueList01 } from '../src/blocks/issue-list-01'
import { Kanban01 } from '../src/blocks/kanban-01'
import { Leaderboard01 } from '../src/blocks/leaderboard-01'
import { NotificationCenter01 } from '../src/blocks/notification-center-01'
import { Onboarding01 } from '../src/blocks/onboarding-01'
import { OpsChecklist01 } from '../src/blocks/ops-checklist-01'
import { PermissionMatrix01 } from '../src/blocks/permission-matrix-01'
import { Project01 } from '../src/blocks/project-01'
import { ProjectDashboard01 } from '../src/blocks/project-dashboard-01'
import { ProjectList01 } from '../src/blocks/project-list-01'
import { Retention01 } from '../src/blocks/retention-01'
import { SettingsIntegrations01 } from '../src/blocks/settings-integrations-01'
import { SettingsMembers01 } from '../src/blocks/settings-members-01'
import { SettingsNotifications01 } from '../src/blocks/settings-notifications-01'
import { SettingsSecurity01 } from '../src/blocks/settings-security-01'
import { Todo01 } from '../src/blocks/todo-01'
import { UserProfile01 } from '../src/blocks/user-profile-01'
import { AcceptInvite01 } from '../src/blocks/accept-invite-01'
import { Account01 } from '../src/blocks/account-01'
import { BillingSource01 } from '../src/blocks/billing-source-01'
import { Bundle01 } from '../src/blocks/bundle-01'
import { Capacity01 } from '../src/blocks/capacity-01'
import { Delivery01 } from '../src/blocks/delivery-01'
import { ForgotPassword01 } from '../src/blocks/forgot-password-01'
import { History01 } from '../src/blocks/history-01'
import { InviteUser01 } from '../src/blocks/invite-user-01'
import { Login01 } from '../src/blocks/login-01'
import { MagicLink01 } from '../src/blocks/magic-link-01'
import { Offering01 } from '../src/blocks/offering-01'
import { OfferingCategories01 } from '../src/blocks/offering-categories-01'
import { OfferingList01 } from '../src/blocks/offering-list-01'
import { Passkey01 } from '../src/blocks/passkey-01'
import { Provisioning01 } from '../src/blocks/provisioning-01'
import { QuickView01 } from '../src/blocks/quick-view-01'
import { ResetPassword01 } from '../src/blocks/reset-password-01'
import { Shortlist01 } from '../src/blocks/shortlist-01'
import { Signup01 } from '../src/blocks/signup-01'
import { SpecTable01 } from '../src/blocks/spec-table-01'
import { Summary01 } from '../src/blocks/summary-01'
import { TwoFactor01 } from '../src/blocks/two-factor-01'
import { VerifyEmail01 } from '../src/blocks/verify-email-01'
import { AboutPage } from '../src/pages/about-page'
import { CareersPage } from '../src/pages/careers-page'
import { ChangelogPage } from '../src/pages/changelog-page'
import { ContactPage } from '../src/pages/contact-page'
import { LegalPage } from '../src/pages/legal-page'
import { OnboardingPage } from '../src/pages/onboarding-page'
import { PricingPage } from '../src/pages/pricing-page'
import { SearchPage } from '../src/pages/search-page'
import { StatusPage } from '../src/pages/status-page'
import { SignalField } from '../src/components/ui/signal-field'

/** The heading every fixture shares, so one query finds one heading in each render. */
const TITLE = 'Section heading'

/**
 * The class pair a Block rendered its heading at.
 *
 * Read off the heading's parent, which is the element `SectionHeading` aligns, and
 * returned as a pair rather than as a single value because the two halves are two
 * decisions: a heading can centre its box and set its text flush left, and that is
 * a third arrangement nobody has asked for.
 */
function alignmentOf(): { items: string; text: string } {
  const heading = screen.getByRole('heading', { name: TITLE })
  const wrapper = heading.parentElement!
  const items = /items-(start|center)\b/.exec(wrapper.className)?.[1] ?? ''
  const text = /\btext-(left|center)\b/.exec(wrapper.className)?.[1] ?? ''
  return { items, text }
}

const LEFT = { items: 'start', text: 'left' }
const CENTRE = { items: 'center', text: 'center' }

/**
 * Every Block that opens with a section heading, in one array.
 *
 * `align` is the arrangement the Block is expected to render its heading at, and
 * `rendersUnderneath` is whether the Block draws content below that heading, which
 * is what decides the answer rather than the Block's own taste. The two columns are
 * separate on purpose: a reader can see at a glance that the Blocks expected to
 * centre are the two with nothing underneath, and that is the rule rather than a
 * preference list.
 *
 * Adding a Block means adding a row. A row that expects `CENTRE` while
 * `rendersUnderneath` is true is a finding, and that is the whole mechanism.
 */
const HEADINGS: Array<{
  item: string
  /** Whether the Block draws anything below its section heading. */
  rendersUnderneath: boolean
  align: typeof LEFT
  render: () => React.ReactElement
}> = [
  {
    item: 'FeatureGrid01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <FeatureGrid01
        title={TITLE}
        variant="bare"
        features={[{ title: 'First item', body: 'A sentence about it.' }]}
      />
    ),
  },
  {
    item: 'Pricing01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Pricing01
        title={TITLE}
        plans={[{ id: 'first', name: 'First plan', price: '$0', features: ['One line'], action: { label: 'Choose', href: '/choose' } }]}
      />
    ),
  },
  {
    item: 'NoteGrid01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <NoteGrid01 title={TITLE} notes={[{ title: 'First point', body: 'A sentence about it.' }]} />
    ),
  },
  {
    item: 'StackGrid01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <StackGrid01 title={TITLE} parts={[{ name: 'Bedrock', role: 'The data lake' }]} />
    ),
  },
  {
    item: 'StatusLedger01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <StatusLedger01
        title={TITLE}
        rows={[{ name: 'First row', status: 'live', statusLabel: 'Available' }]}
      />
    ),
  },
  {
    item: 'ProductGrid01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ProductGrid01
        title={TITLE}
        products={[{ id: 'first', name: 'First product', tagline: 'What it is.', href: '/first' }]}
      />
    ),
  },
  {
    item: 'LogoStrip01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => <LogoStrip01 title={TITLE} items={['One short phrase']} label="A named strip" />,
  },
  {
    item: 'ProcessRail01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ProcessRail01
        title={TITLE}
        steps={[
          { name: 'First step', description: 'What happens there.' },
          { name: 'Second step', description: 'What happens there.' },
        ]}
      />
    ),
  },
  {
    item: 'ProcessFlow01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ProcessFlow01
        title={TITLE}
        stages={[
          { name: 'First stage', description: 'What happens there.' },
          { name: 'Second stage', description: 'What happens there.' },
        ]}
      />
    ),
  },
  {
    item: 'Stats01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => <Stats01 title={TITLE} stats={[{ key: 'one', label: 'One label', value: '1' }]} />,
  },
  {
    item: 'About01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <About01
        title={TITLE}
        statement="One sentence."
        principles={[{ id: 'first', title: 'First principle', body: 'A sentence about it.' }]}
      />
    ),
  },
  {
    item: 'Story01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Story01
        title={TITLE}
        milestones={[
          { id: 'first', at: '2023', title: 'First milestone', body: 'A sentence about it.' },
        ]}
      />
    ),
  },
  {
    item: 'CaseStudies01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <CaseStudies01
        title={TITLE}
        studies={[{ id: 'first', customer: 'First customer', summary: 'A sentence about it.' }]}
      />
    ),
  },
  {
    item: 'Careers01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Careers01
        title={TITLE}
        roles={[{ id: 'first', title: 'First role', team: 'One team', location: 'One place' }]}
      />
    ),
  },
  {
    item: 'Industries01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Industries01
        title={TITLE}
        industries={[{ id: 'first', name: 'First sector', problem: 'A sentence about it.' }]}
      />
    ),
  },
  {
    item: 'Services01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Services01
        title={TITLE}
        services={[{ id: 'first', title: 'First service', body: 'A sentence about it.' }]}
      />
    ),
  },

  /*
   * The 2026-09 roster expansion, added to this file rather than beside it.
   *
   * The header above says why: the list is the assertion, so a Block that is not
   * in it is a Block whose heading alignment nothing checks. Forty-two new Blocks
   * arrived in one effort, and every one of them that opens with a heading is a
   * row here, all of them `LEFT`, because every one of them draws content under
   * its heading.
   *
   * Four of the expansion's Blocks are deliberately absent, and each absence is a
   * decision rather than an oversight. `Hero02` is the `Hero01` exception: its
   * figure sits beside the copy, not under the heading. `Showcase01` and
   * `TrustStrip01` draw no `SectionHeading` of their own, because a showcase
   * names one product rather than a set and a trust strip is a band of marks with
   * no heading above it. `Cta01` was already here and is asserted below.
   */
  {
    item: 'Hero03',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Hero03
        title={TITLE}
        points={[{ title: 'First point', body: 'A sentence about it.' }]}
        proof={[{ label: 'One label', value: '1' }]}
      />
    ),
  },
  {
    item: 'FeatureRows01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <FeatureRows01
        title={TITLE}
        rows={[{ title: 'First row', body: 'A sentence about it.' }]}
      />
    ),
  },
  {
    item: 'Bento01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Bento01 title={TITLE} cells={[{ id: 'first', span: 'md', title: 'First cell' }]} />
    ),
  },
  {
    item: 'PricingCompare01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <PricingCompare01
        title={TITLE}
        plans={[{ id: 'first', name: 'First plan', price: { amount: 0, currency: 'GBP' } }]}
        groups={[
          { title: 'First group', features: [{ id: 'one', label: 'First feature', values: [true] }] },
        ]}
        labels={{ included: 'Included', excluded: 'Not included' }}
      />
    ),
  },
  {
    item: 'Compare01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Compare01
        title={TITLE}
        left={{ name: 'First', points: [{ label: 'One', value: 'A value' }] }}
        right={{ name: 'Second', points: [{ label: 'One', value: 'A value' }] }}
      />
    ),
  },
  {
    item: 'RateCard01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <RateCard01
        title={TITLE}
        unit="One unit"
        labels={{ tier: 'Tier', included: 'Included', overage: 'Overage' }}
        rates={[{ id: 'first', tier: 'First tier', amount: { amount: 1, currency: 'GBP' } }]}
      />
    ),
  },
  {
    item: 'Offer01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Offer01 title={TITLE} terms="Ends on the last day of the month." />
    ),
  },
  {
    item: 'Faq01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Faq01
        title={TITLE}
        questions={[{ id: 'first', question: 'First question?', answer: 'An answer.' }]}
      />
    ),
  },
  {
    item: 'Testimonial01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Testimonial01
        title={TITLE}
        quotes={[{ id: 'first', quote: 'A sentence about it.', name: 'A person' }]}
      />
    ),
  },
  {
    item: 'LogoCloud01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <LogoCloud01 title={TITLE} label="A named grid" logos={[{ id: 'first', name: 'First mark', src: '/mark.svg' }]} />
    ),
  },
  {
    item: 'Awards01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Awards01
        title={TITLE}
        awards={[
          { id: 'first', body: 'The work', organisation: 'The body', year: '2026' },
        ]}
      />
    ),
  },
  {
    item: 'Compliance01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Compliance01
        title={TITLE}
        columns={{
          claim: 'Claim',
          standard: 'Standard',
          scope: 'Scope',
          reviewedAt: 'Reviewed',
          state: 'State',
          evidence: 'Evidence',
        }}
        rows={[{ id: 'first', claim: 'A claim', standard: 'A standard' }]}
      />
    ),
  },
  {
    item: 'Team01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Team01 title={TITLE} people={[{ id: 'first', name: 'A person', role: 'A role' }]} />
    ),
  },
  {
    item: 'MemberList01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <MemberList01 title={TITLE} members={[{ id: 'first', name: 'A person' }]} />
    ),
  },
  {
    item: 'CaseStudy01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <CaseStudy01
        title={TITLE}
        customer="A customer"
        summary="A sentence about it."
        results={[]}
      />
    ),
  },
  {
    item: 'ContentGrid01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ContentGrid01
        title={TITLE}
        entries={[{ id: 'first', title: 'First entry', summary: 'A sentence about it.' }]}
      />
    ),
  },
  {
    item: 'ResourceList01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ResourceList01
        title={TITLE}
        columns={[{ id: 'name', header: 'Document' }]}
        resources={[{ id: 'first', name: 'First document', kind: 'A kind' }]}
      />
    ),
  },
  {
    item: 'Changelog01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Changelog01
        title={TITLE}
        releases={[
          {
            id: 'r1',
            version: '1.0.0',
            entries: [{ id: 'e1', kind: 'added', title: 'First record' }],
          },
        ]}
      />
    ),
  },
  {
    item: 'CodeSample01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => <CodeSample01 title={TITLE} code={'const a = 1'} />,
  },
  {
    item: 'Gallery01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Gallery01
        title={TITLE}
        items={[{ id: 'first', src: '/one.png', alt: 'One image' }]}
        labels={{ zoom: 'Image size', previous: 'Previous', next: 'Next', close: 'Close' }}
      />
    ),
  },
  {
    item: 'Download01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Download01
        title={TITLE}
        files={[
          { id: 'first', name: 'artifact.zip', href: '/a.zip', hrefLabel: 'Download the archive' },
        ]}
      />
    ),
  },
  {
    item: 'Newsletter01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Newsletter01
        title={TITLE}
        label="Email address"
        consent="One email a month, and every note has an unsubscribe link."
        submitLabel="Subscribe"
        onSubmit={() => {}}
      />
    ),
  },
  {
    item: 'Waitlist01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Waitlist01
        title={TITLE}
        label="Email address"
        consent="One email a month, and your address is never sold."
        submitLabel="Take a place"
        onSubmit={() => {}}
      />
    ),
  },
  {
    item: 'Feedback01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Feedback01
        title={TITLE}
        scale={[{ id: 'first', label: 'Blocked', value: 1 }]}
        scaleLabel="How is it going?"
        submitLabel="Send"
        onSubmit={() => {}}
      />
    ),
  },
  {
    item: 'Contact01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Contact01
        title={TITLE}
        groups={[{ fields: [{ key: 'name', kind: 'Input', label: 'Your name', required: true }] }]}
        submitLabel="Send"
        onSubmit={() => {}}
      />
    ),
  },
  {
    item: 'Consent01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Consent01
        title={TITLE}
        body="Two cookies, and refusing turns off exactly one of them."
        acceptLabel="Accept"
        rejectLabel="Refuse"
        settingsLabel="Choose which cookies"
        onAccept={() => {}}
        onReject={() => {}}
        policyHref="/legal/cookies"
        policyLabel="Read the cookie policy"
      />
    ),
  },
  {
    item: 'Help01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Help01
        title={TITLE}
        value=""
        onValueChange={() => {}}
        label="Search the help centre"
        clearLabel="Clear the search"
        categories={[
          {
            id: 'first',
            title: 'First category',
            articles: [
              { id: 'first', title: 'First article', href: '/first', hrefLabel: 'Read this article' },
            ],
          },
        ]}
        empty="Nothing here matches that."
      />
    ),
  },
  {
    item: 'Backdrop01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Backdrop01 title={TITLE} field="drift" label="A field of marks" figure={<SignalField />}>
        <p>One sentence.</p>
      </Backdrop01>
    ),
  },
  {
    item: 'Trend01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Trend01 title={TITLE} items={[{ key: 'first', label: 'First row', value: '1' }]} />
    ),
  },
  {
    item: 'FieldMap01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <FieldMap01
        title={TITLE}
        sourceLabel="First system"
        targetLabel="Second system"
        columns={[{ id: 'state', header: 'State' }]}
        rows={[{ id: 'first', source: 'first_field', target: 'second_field' }]}
        stateLabel={(state) => state}
        requiredLabel={(required) => (required ? 'Required' : 'Optional')}
        unmappedLabel="No counterpart yet"
      />
    ),
  },
  {
    item: 'MilestoneTimeline01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <MilestoneTimeline01
        title={TITLE}
        milestones={[
          { id: 'first', at: '2026', title: 'First milestone', body: 'A sentence about it.' },
        ]}
      />
    ),
  },
  {
    item: 'Integration01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Integration01
        title={TITLE}
        integrations={[{ id: 'first', name: 'First system', capability: 'What it does.' }]}
        stateLabel={(state) => state}
      />
    ),
  },
  {
    item: 'Community01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Community01
        title={TITLE}
        spaces={[
          {
            id: 'first',
            name: 'First space',
            description: 'A sentence about it.',
            href: '/first',
            hrefLabel: 'Join it',
          },
        ]}
      />
    ),
  },

  /* The operate tier: thirty Blocks for the screen where somebody does a job.
   * Every one of them that opens with a heading draws content under it, so every
   * one of them is a row here and every one is LEFT. The header above is why
   * they are in this file and not beside it: a Block that is not listed is a
   * Block whose heading alignment nothing checks. */
  {
    item: 'ActivityFeed01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ActivityFeed01
        title={TITLE}
        events={[{ id: 'first', actor: 'A person', action: 'did a thing', at: '2026-09-30' }]}
        empty="Nothing has happened yet."
      />
    ),
  },
  {
    item: 'AddressBook01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <AddressBook01
        title={TITLE}
        value=""
        onValueChange={() => {}}
        label="Search the address book"
        clearLabel="Clear the search"
        records={[{ id: 'first', name: 'First record', lines: ['One line'] }]}
        empty="No record matches that."
      />
    ),
  },
  {
    item: 'AuditLog01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <AuditLog01
        title={TITLE}
        columns={[{ id: 'change', header: 'What changed' }]}
        entries={[
          { id: 'first', at: '2026-09-30', actor: 'A person', target: 'A setting', change: 'A change' },
        ]}
        empty="Nothing has changed yet."
      />
    ),
  },
  {
    item: 'Calendar01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Calendar01
        title={TITLE}
        previousLabel="The month before"
        nextLabel="The month after"
        label="Scheduled work"
        items={[{ id: 'first', date: '2026-10-02', label: 'First item' }]}
        overflowLabel={(count) => `${count} more on this day`}
      />
    ),
  },
  {
    item: 'ChartGroup01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ChartGroup01 title={TITLE} cards={[{ id: 'first', title: 'First panel', figure: <p>One sentence.</p> }]} />
    ),
  },
  {
    item: 'Dashboard01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Dashboard01
        title={TITLE}
        metrics={[{ key: 'one', label: 'One label', value: '1' }]}
        panels={[{ id: 'first', title: 'First panel', children: <p>One sentence.</p> }]}
      />
    ),
  },
  {
    item: 'Directory01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Directory01
        title={TITLE}
        value=""
        onValueChange={() => {}}
        label="Search the directory"
        clearLabel="Clear the search"
        categories={[
          {
            id: 'first',
            title: 'First category',
            members: [{ id: 'first', name: 'First member', href: '/first', hrefLabel: 'Go there' }],
          },
        ]}
        empty="Nothing matches that."
      />
    ),
  },
  {
    item: 'Gantt01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Gantt01
        title={TITLE}
        label="A schedule of one task"
        tasks={[{ id: 'first', name: 'First task', start: '2026-09-01', end: '2026-09-08' }]}
        scaleLabel={(unit, index) => `${unit} ${index}`}
        empty="Nothing is planned."
      />
    ),
  },
  {
    item: 'Handoff01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Handoff01 title={TITLE} from={{ name: 'A person' }} to={{ name: 'Another person' }} empty="Nothing to hand over." />
    ),
  },
  {
    item: 'Inbox01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Inbox01
        title={TITLE}
        columns={[{ id: 'subject', header: 'What is waiting' }]}
        items={[{ id: 'first', subject: 'First item' }]}
        empty="Nothing is waiting."
      />
    ),
  },
  {
    item: 'Intake01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Intake01
        title={TITLE}
        items={[{ id: 'first', source: 'a.feed', subject: 'First subject', at: '2026-01-01' }]}
        empty="Nothing has arrived."
      />
    ),
  },
  {
    item: 'IssueList01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <IssueList01
        title={TITLE}
        columns={[{ id: 'title', header: 'What is wrong' }]}
        issues={[{ id: 'first', key: 'NX-1', title: 'First issue', state: 'open' }]}
        empty="Nothing is carrying."
      />
    ),
  },
  {
    item: 'Kanban01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Kanban01
        title={TITLE}
        columns={[{ id: 'now', label: 'Now', cards: [{ id: 'first', title: 'First card' }] }]}
      />
    ),
  },
  {
    item: 'Leaderboard01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Leaderboard01
        title={TITLE}
        unit="runs"
        entries={[{ id: 'first', name: 'First entry', value: 1, valueLabel: ({ value }) => `${value} runs` }]}
        empty="Nothing has run yet."
      />
    ),
  },
  {
    item: 'NotificationCenter01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <NotificationCenter01
        title={TITLE}
        unreadLabel="Unread"
        notifications={[{ id: 'first', title: 'First notification', at: '2026-09-30' }]}
        empty="Nothing has arrived yet."
      />
    ),
  },
  {
    item: 'Onboarding01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Onboarding01
        title={TITLE}
        progressLabel={(done, total) => `${done} of ${total}`}
        empty="Nothing is set up."
        steps={[
          { id: 'first', name: 'First step', state: 'done', stateLabel: 'Done' },
          { id: 'second', name: 'Second step', state: 'current', stateLabel: 'Now' },
        ]}
      />
    ),
  },
  {
    item: 'OpsChecklist01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <OpsChecklist01
        title={TITLE}
        groups={[
          { id: 'first', title: 'First group', checks: [{ id: 'first', name: 'First check' }] },
        ]}
        empty="Nothing checked."
      />
    ),
  },
  {
    item: 'PermissionMatrix01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <PermissionMatrix01
        title={TITLE}
        columns={[{ id: 'first', header: 'First role' }]}
        roles={[{ id: 'first', name: 'First role' }]}
        groups={[
          {
            title: 'First group',
            permissions: [{ id: 'one', label: 'One permission', values: [true] }],
          },
        ]}
        valueLabel={(allowed) => (allowed ? 'Granted' : 'Refused')}
        legend={{ allowed: 'Granted', denied: 'Refused', conditional: 'Conditional' }}
      />
    ),
  },
  {
    item: 'ProjectDashboard01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ProjectDashboard01
        name={TITLE}
        panels={[{ id: 'first', title: 'First panel', children: 'One thing in the panel.' }]}
      />
    ),
  },
  {
    item: 'ProjectList01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ProjectList01
        title={TITLE}
        empty="Nothing is running."
        projects={[{ id: 'first', name: 'First project', state: 'active', stateLabel: 'Running' }]}
      />
    ),
  },
  {
    item: 'Retention01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Retention01
        title={TITLE}
        columns={[{ id: 'subject', header: 'What is kept' }]}
        rows={[{ id: 'first', subject: 'A thing', periodLabel: (days) => `${days} days` }]}
        empty="Nothing scheduled."
      />
    ),
  },
  {
    item: 'SettingsIntegrations01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <SettingsIntegrations01
        title={TITLE}
        integrations={[
          { id: 'first', name: 'First system', capability: 'What it does.', state: 'connected', stateLabel: 'Connected' },
        ]}
        empty="Nothing connected yet."
      />
    ),
  },
  {
    item: 'SettingsMembers01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <SettingsMembers01
        title={TITLE}
        members={[{ id: 'first', name: 'A person', role: 'member' }]}
        empty="Nobody else is here yet."
      />
    ),
  },
  {
    item: 'SettingsNotifications01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <SettingsNotifications01
        title={TITLE}
        channels={[{ id: 'first', name: 'Email', events: [{ id: 'one', label: 'One event', on: true }] }]}
        empty="Nothing here yet."
      />
    ),
  },
  {
    item: 'SettingsSecurity01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <SettingsSecurity01
        title={TITLE}
        methods={[{ id: 'first', name: 'A passkey', state: 'enabled', stateLabel: 'In use' }]}
        empty="No way in yet."
      />
    ),
  },
  {
    item: 'Todo01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Todo01
        title={TITLE}
        tasks={[{ id: 'first', title: 'First task', done: true }]}
        empty="Nothing to do."
        progressLabel={(done, total) => `${done} of ${total}`}
      />
    ),
  },
  {
    item: 'UserProfile01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => <UserProfile01 name={TITLE} />,
  },
  {
    item: 'Project01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Project01
        name={TITLE}
        state="active"
        stateLabel={(state) => state}
        progress={40}
        progressLabel={(value) => `${value} per cent`}
        figures={[{ label: 'One label', value: '1' }]}
        stages={[
          { id: 'first', name: 'First stage', state: 'done', stateLabel: 'Done' },
          { id: 'second', name: 'Second stage', state: 'current', stateLabel: 'Now' },
        ]}
      />
    ),
  },
  {
    item: 'IssueDetail01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <IssueDetail01 issue={{ key: 'NX-1', title: TITLE, state: 'open', stateLabel: 'Open' }} />
    ),
  },

  /* The translated tier: twenty-four Blocks that take a storefront pattern and
   * state it in NaniSoft's terms. Every one that opens with a heading draws a form,
   * a table, a list or a state region under it, so every one is a row here and
   * every one is LEFT. The one absence is QuickView01, which composes no Section at
   * all: Section is a max-w-6xl column with the page vertical padding, and putting
   * that inside a panel of at most max-w-lg is a page layout applied to a 400px
   * box. Lightbox and SearchDialog are absent for the same reason. */
  {
    item: 'AcceptInvite01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <AcceptInvite01
        title={TITLE}
        workspace={{ name: 'Nexus Estate' }}
        role={{ name: 'Maintainer' }}
        secret={{ label: 'Choose a secret', revealLabel: 'Show the secret', hideLabel: 'Hide the secret' }}
        submitLabel="Accept and set the secret"
        decline={{ label: 'Decline this invitation', onDecline: () => {} }}
        onSubmit={() => {}}
      />
    ),
  },
  {
    item: 'Account01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => <Account01 name={TITLE} kind="customer" />,
  },
  {
    item: 'BillingSource01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <BillingSource01
        title={TITLE}
        sources={[{ id: 'first', name: 'Corporate card', kind: 'card' }]}
        empty="Nothing on file."
      />
    ),
  },
  {
    item: 'Bundle01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Bundle01
        title={TITLE}
        items={[{ id: 'first', name: 'First item', quantity: 2 }]}
        summary={[{ id: 'due', label: 'Due', value: 'GBP 96.00' }]}
        empty="Nothing selected."
      />
    ),
  },
  {
    item: 'Capacity01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Capacity01
        title={TITLE}
        columns={[
          { id: 'resource', header: 'Resource' },
          { id: 'remaining', header: 'Remaining' },
          { id: 'state', header: 'Standing' },
        ]}
        rows={[
          {
            id: 'first',
            resource: 'First resource',
            committed: 8,
            limit: 10,
            remaining: 2,
            unit: 'nodes',
            unitLabel: (unit, value) => `${value} ${unit}`,
            state: 'tight',
            stateLabel: 'Nearly full',
          },
        ]}
        empty="Nothing on this estate."
      />
    ),
  },
  {
    item: 'Delivery01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Delivery01
        title={TITLE}
        item={{ name: 'First item' }}
        stages={[
          { id: 'first', name: 'First stage', state: 'done', stateLabel: 'Done' },
          { id: 'second', name: 'Second stage', state: 'current', stateLabel: 'Now' },
        ]}
      />
    ),
  },
  {
    item: 'ForgotPassword01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ForgotPassword01
        title={TITLE}
        description="A sentence about it."
        identifier={{ label: 'Email address' }}
        submitLabel="Send the link"
        onSubmit={() => {}}
      />
    ),
  },
  {
    item: 'History01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <History01
        title={TITLE}
        columns={[{ id: 'reference', header: 'Reference' }]}
        entries={[
          {
            id: 'first',
            at: '2026-09-30',
            reference: 'NX-1',
            kind: 'A kind',
            amount: { amount: 1, currency: 'GBP' },
            state: 'settled',
            stateLabel: 'Settled',
          },
        ]}
        empty="Nothing was charged."
      />
    ),
  },
  {
    item: 'InviteUser01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <InviteUser01
        title={TITLE}
        identifier={{ label: 'Their email address' }}
        role={{ label: 'What they can do', options: [{ id: 'reader', label: 'Reader' }] }}
        submitLabel="Send the invitation"
        onSubmit={() => {}}
      />
    ),
  },
  {
    item: 'Login01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Login01
        title={TITLE}
        onSubmit={() => {}}
        identifier={{ label: 'Work email' }}
        secret={{
          label: 'Secret phrase',
          revealLabel: 'Show the secret phrase',
          hideLabel: 'Hide the secret phrase',
        }}
        submitLabel="Sign in"
      />
    ),
  },
  {
    item: 'MagicLink01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <MagicLink01
        title={TITLE}
        description="A link is on its way to the address below."
        onSubmit={() => {}}
        identifier={{ label: 'Work email' }}
        submitLabel="Post the link"
      />
    ),
  },
  {
    item: 'Offering01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => <Offering01 name={TITLE} />,
  },
  {
    item: 'OfferingCategories01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <OfferingCategories01
        title={TITLE}
        categories={[{ id: 'first', name: 'First kind', description: 'A sentence about it.' }]}
        empty="Nothing here matches that."
      />
    ),
  },
  {
    item: 'OfferingList01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <OfferingList01
        title={TITLE}
        offerings={[{ id: 'first', name: 'First capability' }]}
        empty="Nothing here matches that."
      />
    ),
  },
  {
    item: 'Passkey01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Passkey01
        title={TITLE}
        authenticators={[{ id: 'phone', name: 'The phone in my coat pocket' }]}
        empty="No credentials registered."
      />
    ),
  },
  {
    item: 'Provisioning01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Provisioning01
        title={TITLE}
        steps={[
          { id: 'first', name: 'First step', fields: [{ key: 'name', label: 'Name', kind: 'Input', required: true }] },
          { id: 'second', name: 'Second step', fields: [] },
        ]}
        backLabel="Back"
        nextLabel="Continue"
        confirmLabel="Create it"
        onConfirm={() => {}}
      />
    ),
  },
  {
    item: 'ResetPassword01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ResetPassword01
        title={TITLE}
        secret={{ label: 'New secret', revealLabel: 'Show the secret', hideLabel: 'Hide the secret' }}
        confirm={{ label: 'Type it again' }}
        submitLabel="Save the new secret"
        onSubmit={() => {}}
      />
    ),
  },
  {
    item: 'Shortlist01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Shortlist01 title={TITLE} items={[{ id: 'first', name: 'SFTP ingest' }]} empty="Nothing here." />
    ),
  },
  {
    item: 'Signup01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Signup01
        title={TITLE}
        onSubmit={() => {}}
        groups={[{ fields: [{ key: 'email', kind: 'Input', label: 'Work email', required: true }] }]}
        password={{
          label: 'Secret phrase',
          revealLabel: 'Show the secret phrase',
          hideLabel: 'Hide the secret phrase',
        }}
        submitLabel="Create the account"
      />
    ),
  },
  {
    item: 'SpecTable01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <SpecTable01
        title={TITLE}
        columns={[{ id: 'label', header: 'What is measured' }]}
        groups={[{ title: 'First group', rows: [{ id: 'first', label: 'First measure', value: '1' }] }]}
        empty="Nothing measured."
      />
    ),
  },
  {
    item: 'Summary01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <Summary01
        title={TITLE}
        columns={[
          { id: 'line', header: 'Capability' },
          { id: 'state', header: 'State' },
          { id: 'amount', header: 'Amount' },
        ]}
        lines={[
          { id: 'first', label: 'First line', value: '4 included', state: 'included', stateLabel: 'In the plan' },
        ]}
        totalLabel="Due today"
        total={{ amount: 240, currency: 'GBP' }}
        empty="Nothing listed."
      />
    ),
  },
  {
    item: 'TwoFactor01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <TwoFactor01
        title={TITLE}
        description="The six digits are in the message we sent."
        code={{ label: 'The six digits', length: 6, value: '', onValueChange: () => {} }}
        onSubmit={() => {}}
        submitLabel="Verify"
      />
    ),
  },
  {
    item: 'VerifyEmail01',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <VerifyEmail01
        title={TITLE}
        description="A sentence about it."
        target={{ identifier: 'ops@nexus.example' }}
        status={{ state: 'pending', message: 'A sentence about it.', stateLabel: 'Nothing yet' }}
        resendLabel="Send it again"
        resentLabel="Sending it now"
        onResend={() => {}}
      />
    ),
  },

  /* The ten Pages the 2026-09 expansion added, and the one live surface it
   * refused a row for.
   *
   * `ErrorPage` is absent and `NotFoundPage` is already absent, and both are
   * absent for one reason: neither draws a `SectionHeading`. Each owns its own
   * `Heading` pair, because the code is the h1 and the sentence is the h2, and a
   * fixture asserting an alignment those Pages do not choose would be asserting
   * something that is not there.
   *
   * `ToolLedger01` is absent for a different reason and it is the only Item in
   * the roster with no heading at all. It composes no `Section` and no
   * `SectionHeading`, because it is the panel a consumer places inside a region
   * they have already named, so `alignmentOf()` would throw looking for a
   * heading that is not there. A row asserting a heading it does not draw would
   * be a false pass, which is the one thing this file must not contain. */
  {
    item: 'AboutPage',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <AboutPage
        title={TITLE}
        statement="One sentence."
        principles={[{ id: 'first', title: 'First principle', body: 'A sentence about it.' }]}
      />
    ),
  },
  {
    item: 'CareersPage',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <CareersPage
        title={TITLE}
        roles={[{ id: 'first', title: 'First role', team: 'One team', location: 'One place' }]}
        empty="Nothing is open this week."
      />
    ),
  },
  {
    item: 'ChangelogPage',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ChangelogPage
        title={TITLE}
        releases={[
          { id: 'r1', version: '1.0.0', entries: [{ id: 'e1', kind: 'added', title: 'First record' }] },
        ]}
        empty="Nothing has been published yet."
      />
    ),
  },
  {
    item: 'ContactPage',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <ContactPage
        title={TITLE}
        form={{ title: 'Write to the desk' }}
        fields={[{ id: 'name', label: 'Name', type: 'text', required: true }]}
        onSubmit={() => {}}
        submitLabel="Send"
      />
    ),
  },
  {
    item: 'LegalPage',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <LegalPage
        title={TITLE}
        documentsLabel="Legal documents"
        documents={[{ id: 'first', title: 'First document' }]}
        body={<p>One sentence.</p>}
      />
    ),
  },
  {
    item: 'OnboardingPage',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <OnboardingPage
        title={TITLE}
        steps={[{ id: 'first', name: 'First step', state: 'done', stateLabel: 'Done' }]}
        progressLabel={(done, total) => `${done} of ${total}`}
        empty="Nothing is set up."
      />
    ),
  },
  {
    item: 'PricingPage',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <PricingPage
        title={TITLE}
        plans={[{ id: 'first', name: 'First plan', price: { amount: 0, currency: 'GBP' } }]}
      />
    ),
  },
  {
    item: 'SearchPage',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <SearchPage
        title={TITLE}
        value=""
        onValueChange={() => {}}
        label="Search the handbook"
        clearLabel="Clear the handbook search"
        results={[{ id: 'first', group: 'Handbook', title: 'First document', href: '/first' }]}
        empty="Nothing matches that."
      />
    ),
  },
  {
    item: 'StatusPage',
    rendersUnderneath: true,
    align: LEFT,
    render: () => (
      <StatusPage
        title={TITLE}
        overall={{ state: 'operational', label: 'All services operational' }}
        services={[{ id: 'first', name: 'First service', state: 'ok', stateLabel: 'Running normally' }]}
        incidentsLabel="Recent incidents"
        empty="Nothing has happened."
      />
    ),
  },
]

describe('a section heading with content under it is aligned left', () => {
  for (const { item, align, render: at } of HEADINGS) {
    it(`${item} aligns its heading and its text together`, () => {
      render(at())
      expect(alignmentOf(), `${item} rendered its heading at the wrong alignment`).toEqual(align)
    })
  }

  it('and every Block that draws content below its heading expects the same answer', () => {
    // The rule stated over the list rather than over a rendering, so a Block cannot
    // be added to this file expecting `CENTRE` while putting a grid underneath it.
    const overContent = HEADINGS.filter((entry) => entry.rendersUnderneath)
    expect(overContent.length).toBe(HEADINGS.length)
    expect([...new Set(overContent.map((entry) => entry.align.text))]).toEqual(['left'])
  })
})

describe('the two Blocks with nothing under their heading', () => {
  it('Cta01 centres its title on the filled panel, which is the case center exists for', () => {
    // It draws no `SectionHeading`: the panel owns its own centred stack, so this
    // asserts the rendered arrangement rather than a prop, because there is no prop
    // and a test that reached for one would be testing a surface that does not exist.
    const { container } = render(<Cta01 title={TITLE} action={{ label: 'Choose', href: '/go' }} />)
    const heading = screen.getByRole('heading', { name: TITLE })
    const panel = container.querySelector('.bg-primary')
    expect(panel, 'the closing band draws no filled panel').toBeTruthy()
    expect(panel?.className).toContain('text-center')
    expect(heading.parentElement?.className).toContain('items-center')
  })

  it('and neither of them is in the list above, which is what keeps the list honest', () => {
    const items = HEADINGS.map((entry) => entry.item)
    expect(items).not.toContain('Cta01')
    expect(items).not.toContain('Hero01')
  })
})
