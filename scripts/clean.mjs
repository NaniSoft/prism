/**
 * Cross-platform clean. `rm -rf` is not available on Windows, which is where this
 * repo is developed, so the deletion logic lives here instead of in a shell script.
 */
import { rm, stat } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const TARGETS = [
  'packages/tokens/dist',
  'packages/ui/dist',
  'apps/site/.next',
  'apps/site/node_modules/.cache',
]

/** Next binds 3000 and walks upward if taken. */
const DEV_PORTS = [3000, 3001, 3002, 3003, 3004]

const FORCE = process.argv.includes('--force')

const exists = async (p) => {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

const inUse = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' })
    const done = (result) => {
      socket.destroy()
      resolve(result)
    }
    socket.setTimeout(300)
    socket.once('connect', () => done(true))
    socket.once('timeout', () => done(false))
    socket.once('error', () => done(false))
  })

/**
 * Deleting apps/site/.next while `next dev` is running makes Next lose its dev
 * directory: it logs "The directory ... was deleted", restarts, and exits.
 *
 * A stale .next/dev left by a crashed server looks identical on disk, so pair the
 * directory check with an actual listening socket — otherwise clean would refuse
 * in exactly the situation you most want it to work.
 */
const live = []
for (const port of DEV_PORTS) {
  if (await inUse(port)) live.push(port)
}

if (!FORCE && live.length) {
  console.error(
    `A dev server is listening on port ${live.join(', ')}.\n` +
      'Cleaning apps/site/.next now will make it crash and restart.\n' +
      'Stop it first, or run: pnpm run clean --force',
  )
  process.exit(1)
}

for (const target of TARGETS) {
  // Windows locks files held by a running dev server; retry, then warn rather
  // than aborting the whole clean.
  try {
    await rm(path.join(ROOT, target), {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    })
    console.log(`removed ${target}`)
  } catch (cause) {
    console.warn(`skipped ${target}: ${cause.code ?? cause.message}`)
    console.warn('  (stop any running dev server and retry)')
  }
}
