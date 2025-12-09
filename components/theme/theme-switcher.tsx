'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/button/button';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeSwitcher() {
    const { setTheme, theme } = useTheme();
    const t = useTranslations('Theme');

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
            >
                <Sun className="mr-2 h-4 w-4" />
                {t('light')}
            </Button>
            <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
            >
                <Moon className="mr-2 h-4 w-4" />
                {t('dark')}
            </Button>
            <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="flex-1"
            >
                <Laptop className="mr-2 h-4 w-4" />
                {t('system')}
            </Button>
        </div>
    );
}
