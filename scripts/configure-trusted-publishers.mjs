/**
 * Add the npm trusted publisher to every published package, in one command.
 *
 * The release lane publishes over OIDC and carries no long-lived token, so every
 * package needs a trusted publisher configured against this repository. Doing that
 * by hand is four sign-ins and twenty form fields, and the four entries drift: a
 * repository name spelled two ways on two packages is a publish that works for one
 * and 404s for the other, which is exactly the failure this lane is built to avoid.
 *
 * **This script cannot be run by an agent, and that is npm's decision, not a
 * limitation here.** Configuring a trusted publisher grants a CI identity write
 * access to a package, so npm refuses bypass-2FA tokens for the endpoint outright:
 *
 *     Granular access tokens that bypass two-factor authentication may not perform
 *     this action.
 *
 * Two things are therefore needed and neither alone is enough, which was
 * established by running this with a one-time password present and still being
 * refused: a token that does not bypass 2FA, so a session token from `npm login`
 * rather than a granular automation token, and the `npm-otp` code from the same
 * authenticator. npm rejects the token first, so a correct code changes nothing on
 * its own and the error message is identical either way.
 *
 * So the last step of a release is a human at a keyboard, once, and this script
 * exists so that the human runs one command rather than twenty clicks. If the token
 * in `~/.npmrc` is a granular automation token, the shortest path is npmjs.com
 * rather than `npm login`: sign in as the package owner, open each of the four
 * packages, and enter the values under `CLAIMS` below.
 *
 * Run it locally, from the repository root:
 *
 *     $env:NPM_OTP = (the code from your authenticator)
 *     node scripts/configure-trusted-publishers.mjs
 *
 * The code is read from the environment and never printed, never logged and never
 * written to disk. The script refuses to run without one, because a request with no
 * otp is answered with a 2FA polling payload rather than an error, and a script that
 * reports success while polling for a code nobody supplied is a gate that cannot
 * fail.
 *
 * To see what is configured rather than change it:
 *
 *     node scripts/configure-trusted-publishers.mjs --list
 *
 * Read-only mode uses the same token and will be refused the same way, because npm
 * treats reading package governance as governance. Use the npm website for that.
 */

/** The four packages, in the order they are published. */
const PACKAGES = [
  '@nanisoft/prism-ui',
  '@nanisoft/prism-tokens',
  '@nanisoft/prism-llms',
  '@nanisoft/prism-mcp-server',
]

/**
 * The claims every package is configured with, and the only values that matter.
 *
 * `repository` is `owner/name` in one string, not two fields, and it names the
 * GitHub repository. `workflow_ref.file` is the workflow filename and must match
 * the file that actually publishes, so a rename of `publish.yml` silently breaks
 * every package at once. `environment` must match the GitHub environment the job
 * runs in, and is optional on npm but not here: the repository has an `npm-publish`
 * environment, and naming it is what puts the job behind a reviewer if one is
 * configured.
 *
 * `createPackage` is the permission to publish a new version. It deliberately does
 * not include `createStagedPackage`, which would let the lane publish into npm's
 * staging queue for a maintainer to approve: this repository publishes directly and
 * gates on its own environments, and a second gate nobody reads is not a gate.
 */
const CLAIMS = {
  type: 'github',
  claims: {
    repository: 'NaniSoft/prism',
    workflow_ref: { file: 'publish.yml' },
    environment: 'npm-publish',
  },
  permissions: ['createPackage'],
}

const REGISTRY = 'https://registry.npmjs.org'
const OTP = process.env.NPM_OTP?.trim()
const listOnly = process.argv.includes('--list')

/** The token from the user's own npm configuration, never from an environment. */
async function token() {
  const { readFile } = await import('node:fs/promises')
  const os = await import('node:os')
  const path = await import('node:path')
  const file = path.join(os.homedir(), '.npmrc')
  let text
  try {
    text = await readFile(file, 'utf8')
  } catch {
    throw new Error(`no ~/.npmrc at ${file}; sign in with npm first`)
  }
  const found = /(?:^|\n)\s*\/\/registry\.npmjs\.org\/:_authToken\s*=\s*(\S+)/.exec(text)
  if (!found) throw new Error('no registry auth token in ~/.npmrc; this script never takes a token as an argument')
  return found[1]
}

if (!listOnly && !OTP) {
  console.error('configure-trusted-publishers: no one-time password.')
  console.error('')
  console.error('  npm refuses this endpoint without an interactive 2FA challenge, so the code')
  console.error('  has to come from your authenticator and cannot be supplied by a tool.')
  console.error('')
  console.error('    $env:NPM_OTP = <the code>')
  console.error('    node scripts/configure-trusted-publishers.mjs')
  console.error('')
  console.error('  Or configure the four packages by hand on npmjs.com, and the values are in')
  console.error('  this file: repository NaniSoft/prism, workflow publish.yml, environment')
  console.error('  npm-publish, permission createPackage.')
  process.exit(1)
}

const bearer = await token()
const failures = []

for (const name of PACKAGES) {
  const url = `${REGISTRY}/-/package/${name.replace('/', '%2F')}/trust`
  const headers = { authorization: `Bearer ${bearer}`, accept: 'application/json' }
  if (!listOnly) {
    headers['content-type'] = 'application/json'
    headers['npm-otp'] = OTP
  }
  const response = await fetch(url, {
    method: listOnly ? 'GET' : 'POST',
    headers,
    ...(listOnly ? {} : { body: JSON.stringify([CLAIMS]) }),
  })
  const text = await response.text()
  const ok = response.ok
  if (!ok) failures.push(name)
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}  HTTP ${response.status}${text.trim() ? `  ${text.slice(0, 200).replace(/\s+/g, ' ')}` : ''}`)
}

console.log('')
if (failures.length > 0) {
  console.log(`trusted publishers: ${failures.length} of ${PACKAGES.length} failed`)
  console.log('')
  console.log('  A 403 naming a bypass-2FA token is the expected answer from an automation')
  console.log('  token, and it is not something to work around: it is npm refusing to let a')
  console.log('  non-interactive credential grant a CI identity write access to a package.')
  console.log('')
  console.log('  Both conditions are needed and neither is optional, which was established by')
  console.log('  running this with a one-time password present and still being refused:')
  console.log('')
  console.log('    1. a token that does not bypass 2FA, so a session token from `npm login`')
  console.log('       rather than a granular automation token, and')
  console.log('    2. the `npm-otp` code, from the same authenticator.')
  console.log('')
  console.log('  With only the code, the 403 is identical, because npm rejects the token first.')
  console.log('  So the shortest path is npmjs.com: sign in as the package owner, open each of')
  console.log('  the four packages, and add the values in this file under CLAIMS.')
  process.exit(1)
}
console.log(`trusted publishers: ${PACKAGES.length} of ${PACKAGES.length} configured`)
