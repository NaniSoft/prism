---
Type: grilling
Status: open
Labels: wayfinder:grilling, ready-for-human
Blocked by: 12, 13
---

## Question

What does `@nanisoft/prism-llms` contain, and how is it generated so it can't drift?

- Contents: `llms.txt`, per-component MD, blocks/pages catalog MD, theme/token MD.
- Generation source: prism-ui types/source vs docs MDX — which is authoritative for what.
- Build integration: turbo task graph; when regenerated; is there a CI gate on drift?
- Consumption: served at the site root, backing store for the MCP server, `npx`-fetchable?

Output: a written spec the package is built against.
