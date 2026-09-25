'use client';

// PageHeader is only needed by the docs/section index. Keep it out of the
// landing's client boundary: the landing imports DisplayTitle and icons from
// prism-client, while a client boundary includes every static import it
// re-exports.

export { PageHeader } from '@nanisoft/prism-ui/blocks/page-header';
