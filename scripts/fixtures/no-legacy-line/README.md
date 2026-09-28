# Fixture cases

Every directory here is a case the gate is driven over. A case is a partial
tree copied over `template/`, which is a minimal tree that satisfies all 55
configured roots so a case isolates one rule rather than 55.

`template/` also carries the base64 case with no directory of its own. Its
`pnpm-lock.yaml` gives `picocolors` a `sha512-` integrity whose base64 payload
literally contains the four characters a package-specifier pattern admits
(`antd`). That is the point of reading the lockfile as a graph: the template
passes, and a grep over the same file would not.
