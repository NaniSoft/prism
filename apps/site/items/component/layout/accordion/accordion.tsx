'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@nanisoft/prism-ui/components/accordion'

/** An accordion with one panel open and the rest available on demand. */
export default function AccordionDemo() {
  return (
    <Accordion defaultValue={['shipping']} className="max-w-measure-narrow">
      <AccordionItem value="shipping">
        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
        <AccordionContent>
          Orders leave the warehouse within one working day and arrive in two to
          five, depending on the region.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>What is the return window?</AccordionTrigger>
        <AccordionContent>
          Return anything unused within thirty days for a full refund.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="support">
        <AccordionTrigger>How do I reach support?</AccordionTrigger>
        <AccordionContent>
          Reply to any order email, or write to support and include the order
          number.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
