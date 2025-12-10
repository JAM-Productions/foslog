'use client';

import { useRef, useState } from 'react';
import { Sun, Moon, Monitor, ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/button/button';
import { useTheme } from '@/components/theme/theme-provider';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useTranslations } from 'next-intl';

const ThemeToggle = () => {
    const menuRef = useRef<HTMLDivElement>(null);

    const t = useTranslations('ThemeToggle');

    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { value: 'light', label: t('light'), icon: Sun },
        { value: 'dark', label: t('dark'), icon: Moon },
        { value: 'system', label: t('system'), icon: Monitor },
    ] as const;

    const currentTheme = themes.find((t) => t.value === theme);

    useClickOutside(menuRef, isOpen, setIsOpen);

    return (
        <div
            className="relative"
            ref={menuRef}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3"
            >
                {currentTheme && <currentTheme.icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{currentTheme?.label}</span>
                <ChevronDownIcon
                    className={`h-3 w-3 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </Button>

            {isOpen && (
                <div className="bg-card absolute top-12 right-0 z-50 w-40 rounded-lg border shadow-lg">
                    <div className="p-1">
                        {themes.map((themeOption) => (
                            <button
                                key={themeOption.value}
                                onClick={() => {
                                    setTheme(themeOption.value);
                                    setIsOpen(false);
                                }}
                                className={`hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                                    theme === themeOption.value
                                        ? 'bg-accent text-accent-foreground'
                                        : ''
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <themeOption.icon className="h-4 w-4" />
                                    <span>{themeOption.label}</span>
                                </div>
                                {theme === themeOption.value && (
                                    <div className="h-1 w-1 rounded-full bg-current" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;
