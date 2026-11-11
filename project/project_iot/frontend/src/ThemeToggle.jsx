import React, { useState } from "react"
import { Icon } from "./components.jsx"

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme === "light" ? "light" : "dark",
  )
  const nextTheme = theme === "dark" ? "light" : "dark"
  const label = nextTheme === "light" ? "Tema claro" : "Tema escuro"

  function toggleTheme() {
    document.documentElement.dataset.theme = nextTheme
    document.querySelector('meta[name="theme-color"]').content =
      nextTheme === "light" ? "#f3f6f7" : "#0d1418"
    try {
      localStorage.setItem("smart-environment-theme", nextTheme)
    } catch {
      // Switching still works for this page when persistence is unavailable.
    }
    setTheme(nextTheme)
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Ativar ${label.toLowerCase()}`}
      title={`Ativar ${label.toLowerCase()}`}
    >
      <Icon name={nextTheme === "light" ? "light" : "moon"} />
    </button>
  )
}
