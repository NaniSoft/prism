# Changesets

This directory holds the changesets that declare a release. Add one for every
pull request that changes a published package:

```sh
pnpm changeset
```

The conventions the changeset must follow are in `CONTRIBUTING.md`. Validate a
changeset locally with:

```sh
pnpm changeset:validate
```

`@nanisoft/prism-tokens` and `@nanisoft/prism-ui` are a linked pair and always
share a version. `@nanisoft/prism-llms` and `@nanisoft/prism-mcp-server` version
independently. `@nanisoft/site` is private and is never versioned or tagged.

The version pull request is opened by `.github/workflows/release.yml` on a push
to `main`. Publishing is a separate, manual, environment-gated run of
`.github/workflows/publish.yml`.
