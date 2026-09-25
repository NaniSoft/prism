'use client';

import { Dialog, DialogBackdrop, DialogClose, DialogDescription, DialogPopup, DialogPortal, DialogTitle, DialogTrigger, DialogViewport } from '@nanisoft/prism-ui/components/dialog';

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger className="prism-button prism-button--secondary">Open dialog</DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport>
          <DialogPopup>
            <DialogClose />
            <DialogTitle>Publish this theme?</DialogTitle>
            <DialogDescription>The pack and mode become the defaults for the current site. You can change them later.</DialogDescription>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <DialogClose className="prism-button prism-button--secondary">Cancel</DialogClose>
              <DialogClose className="prism-button prism-button--primary">Publish</DialogClose>
            </div>
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  );
}
