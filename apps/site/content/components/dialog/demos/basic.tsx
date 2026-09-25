'use client';

import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Dialog, DialogBackdrop, DialogClose, DialogDescription, DialogPopup, DialogPortal, DialogTitle, DialogTrigger, DialogViewport } from '@nanisoft/prism-ui/components/dialog';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function DialogDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge variant="info">Synthetic release</Badge>
        <Text variant="secondary">The dialog previews an application-owned decision.</Text>
      </div>
      <Dialog>
        <DialogTrigger className="prism-button prism-button--primary prism-button--md">Publish release</DialogTrigger>
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <DialogPopup>
              <DialogClose />
              <DialogTitle>Publish this catalog release?</DialogTitle>
              <DialogDescription>This synthetic preview marks the release ready for review. It does not publish files or change package data.</DialogDescription>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <DialogClose className="prism-button prism-button--secondary prism-button--md" aria-label="Cancel">Cancel</DialogClose>
                <DialogClose className="prism-button prism-button--primary prism-button--md" aria-label="Publish synthetic release">Publish preview</DialogClose>
              </div>
            </DialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
