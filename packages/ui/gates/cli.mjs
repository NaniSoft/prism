#!/usr/bin/env node
/**
 * The consumer's gate chain. One program, one configuration file, one exit code.
 *
 * A consumer's repository holds data: its roots, its sheet, its pack map, its
 * coverage floors, its destinations it knows are broken. It does not hold the
 * wording of a rule, because a wording held in four places is four rules that will
 * disagree, and the version they disagree at is the version nobody chose.
 *
 *     pnpm prism-gates                       # every gate the configuration names
 *     pnpm prism-gates --gate=links          # one gate
 *     pnpm prism-gates --gate=links --json   # machine-readable, for a test
 *
 * `--json` exists because the assertion that matters about a gate is not that it
 * passed: it is that it went red on a defect it can see. A test cannot watch a
 * human-readable exit code and be sure it saw the failure it planted, so the
 * machine form carries the findings and the coverage the run achieved.
 *
 * **The exit code is the contract.** 0 means every named gate ran and found
 * nothing. 1 means a gate found something. 2 means a gate could not read what it
 * was pointed at, which is a different answer from "clean" and is never reported
 * as 0. A gate that read nothing and exited 0 is the failure this program exists
 * to make impossible, and it is why the coverage floors live in the gates rather
 * than in the consumer's expectations.
 */
import process from 'node:process'
import path from 'node:path'

import { GATE_IDS, GATE_KIT_VERSION, gate, laws } from './index.mjs'
import { CoverageError, readJson } from './run.mjs'

const CONFIG_NAME = 'prism-gates.json'

const flag = (name) => process.argv.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3)
const has = (name) => process.argv.includes(`--${name}`)

async function main() {
  const root = path.resolve(process.cwd())
  const configPath = flag('config') ?? CONFIG_NAME
  const json = has('json')
  const only = flag('gate')

  let config
  try {
    config = readJson(root, configPath)
  } catch (cause) {
    return fail(`error prism-gates: ${cause.message}`)
  }
  if (!config) {
    return fail(
      `error prism-gates: ${path.join(root, configPath)} does not resolve.\n` +
        '  A gate chain with no configuration is a chain that runs nothing, and nothing looks like a pass.\n' +
        '  The configuration holds this repository\'s own data only: its roots, its sheet, its pack map, its\n' +
        '  coverage floors. The laws are not in it, because they are in the package.',
    )
  }

  const named = only ? [only] : (config.gates ?? [])
  if (named.length === 0) {
    return fail(
      `error prism-gates: ${configPath} names no gates, so this run enforced nothing.\n` +
        `  A chain that runs nothing exits the same as a chain that found nothing, which is the answer this\n` +
        `  program exists to stop giving. The kit ships: ${GATE_IDS.join(', ')}.`,
    )
  }

  const results = []
  let findings = 0
  let unreadable = 0

  for (const id of named) {
    const settings = config[id] ?? {}
    try {
      const { run } = await gate(id)
      const result = await run({ root, config: settings })
      findings += result.findings.length
      results.push({ gate: id, law: result.law.id, ok: result.findings.length === 0, findings: result.findings, notes: result.notes, also: (result.also ?? []).map((l) => l.id) })
    } catch (cause) {
      unreadable += 1
      const message =
        cause instanceof CoverageError
          ? `error prism-gates: ${id}: ${cause.message}`
          : `error prism-gates: ${id} could not run: ${cause.stack ?? cause.message}`
      if (json) {
        results.push({ gate: id, ok: false, unreadable: true, findings: [], notes: [message] })
      } else {
        console.error(message)
      }
    }
  }

  if (json) {
    console.log(
      JSON.stringify(
        { gateKit: GATE_KIT_VERSION, laws: laws().map((l) => l.id), results },
        null,
        2,
      ),
    )
    return findings > 0 || unreadable > 0 ? 1 : 0
  }

  for (const result of results) {
    if (result.unreadable) continue
    for (const line of result.notes) console.log(line)
    for (const line of result.findings) console.error(line)
    if (result.findings.length > 0) {
      const law = laws().find((l) => l.id === result.law)
      console.error(`\n${law.title}`)
      console.error(law.message)
      console.error(`  It is here because: ${law.why}`)
    }
  }

  console.log(
    `\nprism-gates: gate kit ${GATE_KIT_VERSION}, ${named.length} gate(s) run, ${findings} finding(s), ` +
      `${unreadable} unreadable`,
  )
  console.log(`prism-gates: the laws this run enforced: ${laws().map((l) => l.id).join(', ')}`)
  console.log(
    'prism-gates: the wording of every law above is in the package you pinned, not in this repository. A change\n' +
      '  to it reaches this repository in one release and cannot be declined here.',
  )

  return findings > 0 || unreadable > 0 ? 1 : 0
}

function fail(message) {
  console.error(message)
  return 2
}

process.exitCode = await main()
