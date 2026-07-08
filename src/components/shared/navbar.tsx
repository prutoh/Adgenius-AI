'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/helpers'
import { APP_NAME } from '@/lib/utils/constants'
import { UserMenu } from './user-menu'
import { Menu, X, Sparkles, Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from '@/context/theme-context'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false)
  const pathname = usePathname()
  const themeDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close theme dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isHomePage = pathname === '/'

  const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
  ]

  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ]

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || !isHomePage
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition-colors">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className={cn(
              'font-bold text-lg transition-colors',
              isScrolled || !isHomePage ? 'text-gray-900 dark:text-gray-100' : 'text-white'
            )}>
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {isHomePage && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400',
                  isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white/80 hover:text-white'
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isHomePage && (
              <div className="relative" ref={themeDropdownRef}>
                <button
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isScrolled || !isHomePage
                      ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-white/80 hover:bg-white/10'
                  )}
                >
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : theme === 'light' ? <Sun className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </button>

                {isThemeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 dark:border-gray-700 py-1 animate-fade-in z-50">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTheme(option.value)
                          setIsThemeDropdownOpen(false)
                        }}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors',
                          theme === option.value
                            ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-700'
                        )}
                      >
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                        {theme === option.value && (
                          <Check className="h-4 w-4 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'md:hidden p-2 rounded-lg dark:text-gray-300 transition-colors',
              isScrolled || !isHomePage
                ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'text-white hover:bg-white/10'
            )}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 dark:border-gray-700 animate-fade-in">
            <div className="flex flex-col gap-3">
              {isHomePage && navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {/* Mobile Theme Toggle */}
              <div className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        theme === option.value
                          ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <option.icon className="h-3.5 w-3.5" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 dark:border-gray-700 mt-3">
                <UserMenu />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}