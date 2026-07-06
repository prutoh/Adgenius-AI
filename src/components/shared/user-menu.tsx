'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { User, LogOut, Settings, CreditCard, LayoutDashboard, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { useAuth } from '@/hooks/use-auth'

export function UserMenu() {
  const { profile, user, isLoading, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="h-10 w-20 bg-gray-100 rounded-lg animate-pulse" />
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">
            Get Started
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile?.full_name || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-brand-600" />
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {profile?.full_name || (user?.email?.split('@')[0] ?? 'User')}
        </span>
        <ChevronDown className={cn(
          'h-4 w-4 text-gray-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-fade-in z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <span className={cn(
              'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
              (profile?.plan_id || 'free') === 'free'
                ? 'bg-gray-100 text-gray-600'
                : (profile?.plan_id || 'free') === 'pro'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-purple-100 text-purple-700'
            )}>
              {(profile?.plan_id || 'free').charAt(0).toUpperCase() + (profile?.plan_id || 'free').slice(1)} Plan
            </span>
          </div>

          <div className="py-1">
            <Link
              href="/generate"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Generate
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Dashboard
            </Link>
            {(profile?.plan_id || 'free') === 'free' && (
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Upgrade Plan
              </Link>
            )}
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}