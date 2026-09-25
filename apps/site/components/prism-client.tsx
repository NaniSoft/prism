'use client';

// The client boundary for prism-ui surfaces that cannot evaluate in the RSC
// runtime: DisplayTitle destructures `Typography.Title` at module scope and
// `@ant-design/icons` ships no 'use client' of its own and would crash on
// createContext. Server routes import these through this module; everything
// else in prism-ui (pass-throughs via antd's directive, the structural
// DocsShell/BlogLayout/ComponentDemo blocks) is safe server-side.
//
// PageHeader lives in page-header-client.tsx so its Divider/Typography block
// stays out of the landing route's client graph.

export { DisplayTitle } from '@nanisoft/prism-ui/components/display-title';
export { CodeOutlined, CopyOutlined, SearchOutlined } from '@nanisoft/prism-ui/icons';
