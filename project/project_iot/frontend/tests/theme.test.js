import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8")

function initialize(savedTheme, storageBlocked = false) {
  const script = html.match(/<script id="theme-init">([\s\S]*?)<\/script>/)?.[1]
  assert.ok(script, "Theme initialization must run in the head before the app")
  assert.ok(html.indexOf('id="theme-init"') < html.indexOf("</head>"))
  const root = { dataset: {} }
  const meta = { content: "#0d1418" }
  runInNewContext(script, {
    document: { documentElement: root, querySelector: () => meta },
    localStorage: {
      getItem(key) {
        assert.equal(key, "smart-environment-theme")
        if (storageBlocked) throw new Error("Storage unavailable")
        return savedTheme
      },
    },
  })
  return { theme: root.dataset.theme, color: meta.content }
}

test("defaults to dark without a saved preference", () => {
  assert.deepEqual(initialize(null), { theme: "dark", color: "#0d1418" })
})

test("restores the saved light or dark theme before rendering the app", () => {
  assert.deepEqual(initialize("light"), { theme: "light", color: "#f3f6f7" })
  assert.equal(initialize("dark").theme, "dark")
})

test("invalid or inaccessible storage still opens in dark mode", () => {
  assert.equal(initialize("system").theme, "dark")
  assert.equal(initialize(null, true).theme, "dark")
})
