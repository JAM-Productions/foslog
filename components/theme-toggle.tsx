'use client';

import { useRef, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
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
                            className={[
                                'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-2 text-left text-sm first:rounded-t-lg last:rounded-b-lg',
                                theme === themeOption.value &&
                                    'bg-accent text-accent-foreground',
                            ]
                                .filter(Boolean)
                                .join(' ')}
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

export default ThemeToggle;
