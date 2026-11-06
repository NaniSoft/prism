/**
 * The raster icon set, generated from the one mark.
 *
 * `src/app/icon.svg` is the drawn source of truth for the favicon: the navy
 * chip, the white beam and the blue refraction, in vector form, served to every
 * browser that accepts an SVG icon. Two surfaces still want rasters, and no
 * build step of this site paints one:
 *
 * - Safari's tab falls back to a monogram without a `.ico`, because it does not
 *   read the SVG icon link. `public/favicon.ico` answers the `/favicon.ico`
 *   request every browser makes before it looks at any link.
 * - A home-screen install and the apple touch surface want PNGs at named sizes,
 *   referenced from `app/manifest.ts` and the apple-touch link in the layout.
 *
 * This script rasterizes the SVG itself rather than restating its geometry, so
 * a mark edited in the SVG is a mark the rasters can be regenerated from with
 * `node scripts/gen-icons.mjs` and there is no second copy of the beam to keep
 * in step. The parser reads exactly the shapes the file draws: one rounded
 * rect, stroke-only `M/L` paths with round caps, and one filled triangle. A
 * shape it does not recognise is an error rather than a silent gap, because an
 * icon that quietly dropped a ray would be a mark nobody noticed changing.
 *
 * The files are committed, like the e2e baselines, because `public/` is served
 * as-is and the generation is deterministic: the same SVG produces the same
 * bytes on every machine, now and at the next mark change.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { deflateSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SVG_PATH = path.join(SITE, 'src', 'app', 'icon.svg')
const OUT_DIR = path.join(SITE, 'public')

/* -------------------------------------------------------------------------- */
/* The SVG, read into shapes                                                   */
/* -------------------------------------------------------------------------- */

const HEX = /^#([0-9a-f]{6})$/i

function hexToRgb(value, where) {
  const match = HEX.exec(value?.trim() ?? '')
  if (!match) throw new Error(`gen-icons: ${where}: cannot read the colour '${value}'`)
  const n = Number.parseInt(match[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * The mark's own shapes: one chip rect, stroked line segments with round caps,
 * one filled triangle. The order is draw order, so the last shape covering a
 * point wins, exactly as the SVG paints.
 */
function parseMark(svg) {
  const chip = /<rect\b[^>]*\/>/.exec(svg)?.[0]
  if (chip === undefined) throw new Error('gen-icons: the mark holds no <rect>, so there is no chip to raster')
  const rx = Number.parseFloat(/rx="([\d.]+)"/.exec(chip)?.[1] ?? '')
  if (!Number.isFinite(rx)) throw new Error('gen-icons: the chip rect carries no rx')

  const shapes = []
  for (const element of svg.matchAll(/<path\b[^>]*\/>/g)) {
    const tag = element[0]
    const d = /d="([^"]+)"/.exec(tag)?.[1]
    if (d === undefined) throw new Error('gen-icons: a <path> carries no d, so there is nothing to draw')
    const numbers = d.match(/-?[\d.]+/g)?.map(Number) ?? []
    const commands = d.match(/[MLZ]/g) ?? []
    const stroke = /stroke="([^"]+)"/.exec(tag)?.[1]
    const width = Number.parseFloat(/stroke-width="([\d.]+)"/.exec(tag)?.[1] ?? '')
    const fill = /fill="([^"]+)"/.exec(tag)?.[1]

    // `stroke="none"` is how the SVG says "filled only": a value present in the
    // attribute and absent from the painting, so it is read as no stroke rather
    // than as a colour named none.
    if (stroke !== undefined && stroke !== 'none') {
      if (commands.join('') !== 'ML' || numbers.length !== 4) {
        throw new Error(`gen-icons: the stroked path '${d}' is not one line segment, and this parser draws no other stroke`)
      }
      if (!Number.isFinite(width)) throw new Error(`gen-icons: the stroked path '${d}' carries no stroke-width`)
      shapes.push({
        kind: 'segment',
        from: [numbers[0], numbers[1]],
        to: [numbers[2], numbers[3]],
        half: width / 2,
        color: hexToRgb(stroke, `the path '${d}'`),
      })
    } else {
      if (commands.join('') !== 'MLLZ' || numbers.length !== 6) {
        throw new Error(`gen-icons: the filled path '${d}' is not one triangle, and this parser fills no other shape`)
      }
      shapes.push({
        kind: 'triangle',
        points: [
          [numbers[0], numbers[1]],
          [numbers[2], numbers[3]],
          [numbers[4], numbers[5]],
        ],
        color: hexToRgb(fill ?? 'none', `the path '${d}'`),
      })
    }
  }
  if (shapes.length === 0) throw new Error('gen-icons: the mark holds no <path>, so the chip would raster alone')

  return { chip: { rx, color: hexToRgb(/fill="([^"]+)"/.exec(chip)?.[1], 'the chip rect') }, shapes }
}

/* -------------------------------------------------------------------------- */
/* Rasterization                                                               */
/* -------------------------------------------------------------------------- */

/** A point's distance to one line segment, caps included. */
function distanceToSegment(x, y, from, to) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const along = dx * dx + dy * dy
  const t = along === 0 ? 0 : Math.max(0, Math.min(1, ((x - from[0]) * dx + (y - from[1]) * dy) / along))
  const px = from[0] + t * dx
  const py = from[1] + t * dy
  return Math.hypot(x - px, y - py)
}

/** Whether a point sits inside one triangle, by the sign of its three edges. */
function insideTriangle(x, y, points) {
  let sign = 0
  for (let i = 0; i < 3; i++) {
    const [ax, ay] = points[i]
    const [bx, by] = points[(i + 1) % 3]
    const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax)
    if (cross === 0) continue
    const next = cross > 0 ? 1 : -1
    if (sign === 0) sign = next
    else if (sign !== next) return false
  }
  return true
}

/**
 * The colour at one point of the viewBox, or null off the chip.
 *
 * Draw order decides: a shape later in the file paints over an earlier one, and
 * the chip is beneath everything because the rect is first in the file.
 */
function colorAt(mark, size, x, y) {
  const rx = mark.chip.rx
  const cx = Math.min(Math.max(x, rx), size - rx)
  const cy = Math.min(Math.max(y, rx), size - rx)
  if ((x - cx) ** 2 + (y - cy) ** 2 > rx * rx) return null
  let color = mark.chip.color
  for (const shape of mark.shapes) {
    if (shape.kind === 'segment') {
      if (distanceToSegment(x, y, shape.from, shape.to) <= shape.half) color = shape.color
    } else if (insideTriangle(x, y, shape.points)) {
      color = shape.color
    }
  }
  return color
}

/** One square RGBA raster of the mark, supersampled `samples` per pixel edge. */
function rasterize(mark, size, samples = 4) {
  const out = Buffer.alloc(size * size * 4)
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0
      let g = 0
      let b = 0
      let covered = 0
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const x = ((px + (sx + 0.5) / samples) / size) * 32
          const y = ((py + (sy + 0.5) / samples) / size) * 32
          const color = colorAt(mark, 32, x, y)
          if (color) {
            r += color[0]
            g += color[1]
            b += color[2]
            covered++
          }
        }
      }
      const total = samples * samples
      const at = (py * size + px) * 4
      out[at] = Math.round(r / total)
      out[at + 1] = Math.round(g / total)
      out[at + 2] = Math.round(b / total)
      out[at + 3] = Math.round((covered / total) * 255)
    }
  }
  return out
}

/* -------------------------------------------------------------------------- */
/* PNG and ICO containers                                                      */
/* -------------------------------------------------------------------------- */

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'latin1')
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

/** One PNG, RGBA, no interlace: the one form every consumer of these files reads. */
function encodePng(size, rgba) {
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    rgba.subarray(y * size * 4, (y + 1) * size * 4).copy(raw, y * (size * 4 + 1) + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/** One ICO holding PNG entries, the form Windows Vista and every later browser reads. */
function encodeIco(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(entries.length, 4)
  const directory = Buffer.alloc(16 * entries.length)
  let offset = header.length + directory.length
  entries.forEach((entry, index) => {
    const at = index * 16
    directory[at] = entry.size >= 256 ? 0 : entry.size
    directory[at + 1] = entry.size >= 256 ? 0 : entry.size
    directory.writeUInt16LE(1, at + 4) // colour planes
    directory.writeUInt16LE(32, at + 6) // bits per pixel
    directory.writeUInt32LE(entry.png.length, at + 8)
    directory.writeUInt32LE(offset, at + 12)
    offset += entry.png.length
  })
  return Buffer.concat([header, directory, ...entries.map((entry) => entry.png)])
}

/* -------------------------------------------------------------------------- */
/* Generation                                                                  */
/* -------------------------------------------------------------------------- */

const mark = parseMark(await readFile(SVG_PATH, 'utf8'))

/** The sizes each surface names, and the file each becomes. */
const FILES = [
  {
    file: 'favicon.ico',
    encode: (rasters) =>
      encodeIco(rasters.map(([size, rgba]) => ({ size, png: encodePng(size, rgba) }))),
    sizes: [16, 32, 48],
  },
  { file: 'apple-touch-icon.png', encode: (rasters) => encodePng(180, rasters[0][1]), sizes: [180] },
  { file: 'icon-192.png', encode: (rasters) => encodePng(192, rasters[0][1]), sizes: [192] },
  { file: 'icon-512.png', encode: (rasters) => encodePng(512, rasters[0][1]), sizes: [512] },
]

await mkdir(OUT_DIR, { recursive: true })
for (const { file, sizes, encode } of FILES) {
  const rasters = sizes.map((size) => [size, rasterize(mark, size)])
  await writeFile(path.join(OUT_DIR, file), encode(rasters))
  console.log(`gen-icons: wrote public/${file} (${sizes.join(', ')})`)
}
