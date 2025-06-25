'use client'

import { useState } from 'react'
import { Search, Sun, Moon, Monitor, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const MediaTypeFilter = () => {
  const { selectedMediaType, setSelectedMediaType } = useAppStore()

  const mediaTypes = [
    { value: 'all', label: 'All', icon: '🔍' },
    { value: 'film', label: 'Films', icon: '🎬' },
    { value: 'series', label: 'Series', icon: '📺' },
    { value: 'game', label: 'Games', icon: '🎮' },
    { value: 'book', label: 'Books', icon: '📚' },
    { value: 'music', label: 'Music', icon: '🎵' },
  ] as const

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {mediaTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => setSelectedMediaType(type.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            selectedMediaType === type.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <span className="mr-1.5">{type.icon}</span>
          {type.label}
        </button>
      ))}
    </div>
  )
}

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  const currentTheme = themes.find(t => t.value === theme)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {currentTheme && <currentTheme.icon className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-32 bg-card border rounded-lg shadow-lg z-50">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => {
                setTheme(themeOption.value)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent hover:text-accent-foreground first:rounded-t-lg last:rounded-b-lg",
                theme === themeOption.value && "bg-accent text-accent-foreground"
              )}
            >
              <themeOption.icon className="h-4 w-4" />
              {themeOption.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const UserMenu = () => {
  const { user, setUser } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Log In
        </Button>
        <Button size="sm">
          Sign Up
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {user.image ? (
          <img src={user.image} alt={user.name} className="w-6 h-6 rounded-full" />
        ) : (
          <User className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{user.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-48 bg-card border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="p-1">
            <button className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent hover:text-accent-foreground rounded-md">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={() => {
                setUser(null)
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent hover:text-accent-foreground rounded-md text-destructive"
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

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useAppStore()

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <input
        type="text"
        placeholder="Search films, books, games..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      />
    </div>
  )
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/favicon.svg"
                alt="Foslog"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">Foslog</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>

        {/* Media Type Filter */}
        <div className="pb-4">
          <MediaTypeFilter />
        </div>
      </div>
    </header>
  )
}
