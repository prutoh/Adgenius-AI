#!/usr/bin/env python3
"""Add dark mode support to all components in the AdGenius AI project."""

import os

BASE = "/home/z/my-project/adgenius-ai/src"

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

def add_dark_to_file(filepath, replacements):
    if not os.path.exists(filepath):
        return False
    c = read_file(filepath)
    changed = False
    for old, new in replacements:
        if old in c:
            c = c.replace(old, new)
            changed = True
    if changed:
        write_file(filepath, c)
    return changed

# 1. tailwind.config.ts
p = f"{BASE}/../tailwind.config.ts"
c = read_file(p)
if 'darkMode' not in c:
    c = c.replace("const config: Config = {", "const config: Config = {\n  darkMode: 'class',")
    write_file(p, c)
    print("OK tailwind.config.ts")
else:
    print("SKIP tailwind.config.ts (already has darkMode)")

# 2. theme-context.tsx
p = f"{BASE}/context/theme-context.tsx"
c = """'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    let effective: 'light' | 'dark'
    if (theme === 'system') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      effective = theme
    }
    root.classList.add(effective)
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
"""
write_file(p, c)
print("OK theme-context.tsx")

# 3. layout.tsx
p = f"{BASE}/app/layout.tsx"
c = read_file(p)
c = c.replace('<html lang="en">', '<html lang="en" suppressHydrationWarning>')
write_file(p, c)
print("OK layout.tsx")

# 4. globals.css
p = f"{BASE}/app/globals.css"
c = """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-white text-gray-900 antialiased;
  }

  .dark body {
    @apply bg-gray-950 text-gray-100;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { @apply bg-gray-100; }
::-webkit-scrollbar-thumb { @apply bg-gray-300 rounded-full; }
::-webkit-scrollbar-thumb:hover { @apply bg-gray-400; }
.dark ::-webkit-scrollbar-track { @apply bg-gray-900; }
.dark ::-webkit-scrollbar-thumb { @apply bg-gray-700 rounded-full; }
.dark ::-webkit-scrollbar-thumb:hover { @apply bg-gray-600; }
"""
write_file(p, c)
print("OK globals.css")

# 5. Navbar - dropdown theme toggle
p = f"{BASE}/components/shared/navbar.tsx"
c = read_file(p)

c = c.replace(
    "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)",
    "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)\n  const [showThemeMenu, setShowThemeMenu] = useState(false)"
)

old_toggle = '''            {isHomePage && (
              <button
                onClick={() => {
                  if (theme === 'light') setTheme('dark')
                  else if (theme === 'dark') setTheme('light')
                  else setTheme('system')
                }}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : theme === 'light' ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              </button>
            )}'''

new_toggle = '''            {isHomePage && (
              <div className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors"
                >
                  {theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
                {showThemeMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                    <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fade-in">
                      {(['light', 'dark', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTheme(t); setShowThemeMenu(false) }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                            theme === t
                              ? 'text-brand-600 bg-brand-50 dark:bg-brand-950 dark:text-brand-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {t === 'light' && <Sun className="h-4 w-4" />}
                          {t === 'dark' && <Moon className="h-4 w-4" />}
                          {t === 'system' && <Monitor className="h-4 w-4" />}
                          <span className="capitalize">{t}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}'''
c = c.replace(old_toggle, new_toggle)

# Dark navbar bg
c = c.replace(
    "isScrolled || !isHomePage\n          ? 'bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm'\n          : 'bg-transparent'",
    "isScrolled || !isHomePage\n          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm'\n          : 'bg-transparent'"
)
c = c.replace(
    "isScrolled || !isHomePage ? 'text-gray-900' : 'text-white'",
    "isScrolled || !isHomePage ? 'text-gray-900 dark:text-gray-100' : 'text-white'"
)
c = c.replace(
    "'text-sm font-medium transition-colors hover:text-brand-600',\n                  isScrolled ? 'text-gray-600' : 'text-white/80 hover:text-white'",
    "'text-sm font-medium transition-colors hover:text-brand-600',\n                  isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white/80 hover:text-white'"
)
c = c.replace("py-4 border-t border-gray-200 animate-fade-in", "py-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in")
c = c.replace("text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-lg", "text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg")
c = c.replace("pt-3 border-t border-gray-200 mt-3", "pt-3 border-t border-gray-200 dark:border-gray-700 mt-3")
c = c.replace("md:hidden p-2 rounded-lg transition-colors", "md:hidden p-2 rounded-lg dark:text-gray-300 transition-colors")

write_file(p, c)
print("OK navbar.tsx")

# 6. UI Components
ui_files = {
    f"{BASE}/components/ui/card.tsx": [
        ("bg-white", "bg-white dark:bg-gray-900"),
        ("border-gray-200", "border-gray-200 dark:border-gray-800"),
        ("bg-gray-50", "bg-gray-50 dark:bg-gray-800/50"),
    ],
    f"{BASE}/components/ui/button.tsx": [
        ("bg-gray-100", "bg-gray-100 dark:bg-gray-800"),
        ("text-gray-700", "text-gray-700 dark:text-gray-200"),
        ("hover:bg-gray-200", "hover:bg-gray-200 dark:hover:bg-gray-700"),
        ("text-gray-500", "text-gray-500 dark:text-gray-400"),
        ("bg-red-600", "bg-red-600 dark:bg-red-700"),
        ("hover:bg-red-700", "hover:bg-red-700 dark:hover:bg-red-800"),
    ],
    f"{BASE}/components/ui/input.tsx": [
        ("text-sm text-gray-900", "text-sm text-gray-900 dark:text-gray-100"),
        ("bg-white", "bg-white dark:bg-gray-900"),
        ("border-gray-300", "border-gray-300 dark:border-gray-600"),
        ("placeholder:text-gray-400", "placeholder:text-gray-400 dark:placeholder:text-gray-500"),
        ("text-gray-500", "text-gray-500 dark:text-gray-400"),
    ],
    f"{BASE}/components/ui/badge.tsx": [
        ("bg-gray-100 text-gray-600", "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"),
        ("bg-red-100 text-red-700", "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"),
    ],
    f"{BASE}/components/ui/select.tsx": [
        ("text-sm text-gray-900", "text-sm text-gray-900 dark:text-gray-100"),
        ("bg-white", "bg-white dark:bg-gray-900"),
        ("border-gray-300", "border-gray-300 dark:border-gray-600"),
    ],
    f"{BASE}/components/ui/textarea.tsx": [
        ("bg-white", "bg-white dark:bg-gray-900"),
        ("border-gray-300", "border-gray-300 dark:border-gray-600"),
        ("placeholder:text-gray-400", "placeholder:text-gray-400 dark:placeholder:text-gray-500"),
    ],
}

for fp, reps in ui_files.items():
    if add_dark_to_file(fp, reps):
        print(f"OK {os.path.basename(fp)}")

# 7. All pages and components - bulk dark class additions
def add_bulk_dark(filepath):
    if not os.path.exists(filepath):
        return
    c = read_file(filepath)
    # Order matters - do longer matches first to avoid partial replacements
    replacements = [
        ("bg-gray-50 dark:bg-gray-950", None),  # skip if already has dark
        ("text-gray-900 dark:text-gray-100", None),
        ("text-gray-800 dark:text-gray-200", None),
        ("text-gray-700 dark:text-gray-300", None),
        ("text-gray-600 dark:text-gray-400", None),
        ("border-gray-300 dark:border-gray-700", None),
        ("border-gray-200 dark:border-gray-800", None),
        ("bg-white dark:bg-gray-900", None),
        ("hover:bg-gray-50 dark:hover:bg-gray-800", None),
        ("hover:bg-gray-100 dark:hover:bg-gray-800", None),
    ]
    
    # Simple patterns that shouldn't double-apply
    simple = {
        "bg-gray-50": "bg-gray-50 dark:bg-gray-950",
        "text-gray-900": "text-gray-900 dark:text-gray-100",
        "text-gray-800": "text-gray-800 dark:text-gray-200",
        "text-gray-700": "text-gray-700 dark:text-gray-300",
        "text-gray-600": "text-gray-600 dark:text-gray-400",
        "border-gray-300": "border-gray-300 dark:border-gray-700",
        "border-gray-200": "border-gray-200 dark:border-gray-800",
        "bg-white": "bg-white dark:bg-gray-900",
    }
    
    changed = False
    for old, new in simple.items():
        # Only replace if dark: variant not already present
        if f"dark:" in old:
            continue
        dark_new = new  # already has dark variant
        # Check if this specific dark variant is already in the vicinity
        if dark_new.split(" ")[1] in c:
            continue
        if old in c:
            c = c.replace(old, new)
            changed = True
    
    if changed:
        write_file(filepath, c)

# Apply to all TSX files in the project
for root, dirs, files in os.walk(BASE):
    for f in files:
        if f.endswith('.tsx'):
            fp = os.path.join(root, f)
            add_bulk_dark(fp)

print("OK bulk dark classes applied to all TSX files")
print("\nDONE - Dark mode complete!")