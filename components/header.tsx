'use client';

import { useState } from 'react';
import {
    Search,
    Sun,
    Moon,
    Monitor,
    User,
    LogOut,
    Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const MediaTypeFilter = () => {
    const { selectedMediaType, setSelectedMediaType } = useAppStore();

    const mediaTypes = [
        { value: 'all', label: 'All', icon: '🔍' },
        { value: 'film', label: 'Films', icon: '🎬' },
        { value: 'series', label: 'Series', icon: '📺' },
        { value: 'game', label: 'Games', icon: '🎮' },
        { value: 'book', label: 'Books', icon: '📚' },
        { value: 'music', label: 'Music', icon: '🎵' },
    ] as const;

    return (
        <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
            {mediaTypes.map((type) => (
                <button
                    key={type.value}
                    onClick={() => setSelectedMediaType(type.value)}
                    className={cn(
                        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        selectedMediaType === type.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                >
                    <span className="mr-1.5">{type.icon}</span>
                    {type.label}
                </button>
            ))}
        </div>
    );
};

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ] as const;

    const currentTheme = themes.find((t) => t.value === theme);

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
                <div className="bg-card absolute top-12 right-0 z-50 w-32 rounded-lg border shadow-lg">
                    {themes.map((themeOption) => (
                        <button
                            key={themeOption.value}
                            onClick={() => {
                                setTheme(themeOption.value);
                                setIsOpen(false);
                            }}
                            className={cn(
                                'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-2 text-left text-sm first:rounded-t-lg last:rounded-b-lg',
                                theme === themeOption.value &&
                                    'bg-accent text-accent-foreground'
                            )}
                        >
                            <themeOption.icon className="h-4 w-4" />
                            {themeOption.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const UserMenu = () => {
    const { user, setUser } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                >
                    Log In
                </Button>
                <Button size="sm">Sign Up</Button>
            </div>
        );
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2"
            >
                {user.image ? (
                    <img
                        src={user.image}
                        alt={user.name}
                        className="h-6 w-6 rounded-full"
                    />
                ) : (
                    <User className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{user.name}</span>
            </Button>

            {isOpen && (
                <div className="bg-card absolute top-12 right-0 z-50 w-48 rounded-lg border shadow-lg">
                    <div className="border-b p-3">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-muted-foreground text-sm">
                            {user.email}
                        </p>
                    </div>
                    <div className="p-1">
                        <button className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm">
                            <Settings className="h-4 w-4" />
                            Settings
                        </button>
                        <button
                            onClick={() => {
                                setUser(null);
                                setIsOpen(false);
                            }}
                            className="hover:bg-accent hover:text-accent-foreground text-destructive flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SearchBar = () => {
    const { searchQuery, setSearchQuery } = useAppStore();

    return (
        <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <input
                type="text"
                placeholder="Search films, books, games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-input focus:ring-ring w-full rounded-lg border py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:outline-none"
            />
        </div>
    );
};

export default function Header() {
    return (
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center">
                            <Image
                                src="/favicon.svg"
                                alt="Foslog"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Foslog
                        </span>
                    </div>

                    {/* Search */}
                    <div className="mx-8 hidden max-w-md flex-1 md:flex">
                        <SearchBar />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="pb-4 md:hidden">
                    <SearchBar />
                </div>

                {/* Media Type Filter */}
                <div className="pb-4">
                    <MediaTypeFilter />
                </div>
            </div>
        </header>
    );
}
