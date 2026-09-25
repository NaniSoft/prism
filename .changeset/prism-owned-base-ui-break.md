---
"@nanisoft/prism-tokens": major
"@nanisoft/prism-ui": major
"@nanisoft/prism-llms": major
"@nanisoft/prism-mcp-server": major
---

Replace the retired upstream component layer with Prism-owned source. Prism now
ships a curated components → blocks → pages catalog backed internally by Base UI
and plain CSS; themes expose pure primitives, semantics, and CSS variables; and
consumers install only React plus `@nanisoft/prism-ui`.

This is a clean breaking release. Remove imports of the retired runtime,
migrate to the curated catalog, and regenerate the docs/corpus after upgrading.
The Prism MCP now answers the complete owned surface and treats Base UI as
internal metadata rather than a second consumer API.
