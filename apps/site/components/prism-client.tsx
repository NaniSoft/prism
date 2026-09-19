'use client';

// The client boundary for prism-ui surfaces that cannot evaluate in the RSC
// runtime: DisplayTitle destructures `Typography.Title` at module scope and
// PageHeader renders `Typography.*` — with antd's 'use client' directive those
// become client references whose properties are undefined server-side.
// `@ant-design/icons` ships no 'use client' of its own and would crash on
// createContext. Server routes import these through this module; everything
// else in prism-ui (pass-throughs via antd's directive, the structural
// DocsShell/BlogLayout/ComponentDemo blocks) is safe server-side.

export { DisplayTitle } from '@nanisoft/prism-ui/components/display-title';
export { PageHeader } from '@nanisoft/prism-ui/blocks/page-header';
export { CodeOutlined, CopyOutlined, SearchOutlined } from '@nanisoft/prism-ui/icons';
