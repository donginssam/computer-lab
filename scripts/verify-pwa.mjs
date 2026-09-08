import { access, readFile, readdir } from "node:fs/promises"
import { join } from "node:path"

const dist = new URL("../dist/", import.meta.url)
const requiredFiles = [
  "index.html",
  "404.html",
  "manifest.webmanifest",
  "sw.js",
  "pwa-192x192.png",
  "pwa-512x512.png",
  "maskable-icon-512x512.png",
  "apple-touch-icon-180x180.png",
  "screenshot-wide.png",
  "screenshot-narrow.png",
]

/** Reads width/height straight out of a PNG's IHDR chunk. */
async function pngSize(url) {
  const head = await readFile(url)
  return `${head.readUInt32BE(16)}x${head.readUInt32BE(20)}`
}

await Promise.all(requiredFiles.map(file => access(new URL(file, dist))))

const manifest = JSON.parse(await readFile(new URL("manifest.webmanifest", dist), "utf8"))
const index = await readFile(new URL("index.html", dist), "utf8")
const fallback = await readFile(new URL("404.html", dist), "utf8")
const worker = await readFile(new URL("sw.js", dist), "utf8")

if (manifest.name !== "동인쌤의 컴퓨터실" || manifest.display !== "standalone") {
  throw new Error("PWA manifest metadata is incomplete")
}

for (const size of ["192x192", "512x512"]) {
  if (!manifest.icons?.some(icon => icon.sizes === size)) {
    throw new Error(`PWA manifest is missing the ${size} icon`)
  }
}

if (!manifest.icons?.some(icon => icon.purpose === "maskable")) {
  throw new Error("PWA manifest is missing a maskable icon")
}

// Chrome only offers the richer install UI when both form factors are covered.
const shots = manifest.screenshots ?? []
if (!shots.some(shot => shot.form_factor === "wide")) {
  throw new Error('PWA manifest needs a screenshot with form_factor "wide" for desktop install')
}
if (!shots.some(shot => shot.form_factor !== "wide")) {
  throw new Error('PWA manifest needs a screenshot without form_factor "wide" for mobile install')
}
for (const shot of shots) {
  const actual = await pngSize(new URL(shot.src, dist))
  if (actual !== shot.sizes) {
    throw new Error(`PWA screenshot ${shot.src} is ${actual} but the manifest says ${shot.sizes}`)
  }
}

const manifestHref = index.match(/<link[^>]+rel="manifest"[^>]+href="([^"]+)"/)?.[1]
if (!manifestHref?.endsWith("manifest.webmanifest")) {
  throw new Error("PWA manifest is missing from index.html")
}

const publicBase = manifestHref.slice(0, -"manifest.webmanifest".length)
if (manifest.start_url !== publicBase || manifest.scope !== publicBase) {
  throw new Error(`PWA scope does not match the public base path: ${publicBase}`)
}

const assetNames = await readdir(new URL("assets/", dist))
const scripts = await Promise.all(
  assetNames
    .filter(file => file.endsWith(".js"))
    .map(file => readFile(new URL(`assets/${file}`, dist), "utf8")),
)

if (!scripts.some(script => script.includes(`${publicBase}sw.js`))) {
  throw new Error(`Service worker registration does not use the public base path: ${publicBase}`)
}

for (const asset of ["index.html", "manifest.webmanifest", "pwa-192x192.png", "pwa-512x512.png"]) {
  if (!worker.includes(`url:${JSON.stringify(asset)}`)) {
    throw new Error(`Service worker does not precache ${asset}`)
  }
}

if (index !== fallback) {
  throw new Error("404.html must match index.html for GitHub Pages SPA fallback")
}

console.log(
  `PWA verified: ${join("dist", "manifest.webmanifest")} and ${requiredFiles.length} assets`,
)
