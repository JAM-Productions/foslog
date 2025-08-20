'use client';

import { useState, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, GlobeIcon } from 'lucide-react';

const locales = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ca', name: 'Català', flag: '🏴' },
] as const;

export default function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('LanguageSelector');

    useClickOutside(dropdownRef, isOpen, setIsOpen);

    const currentLocale = locales.find((l) => l.code === locale) || locales[0];

    const handleLocaleChange = (newLocale: string) => {
        setIsOpen(false);
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3"
                aria-label={t('selectLanguage')}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <GlobeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLocale.name}</span>
                <span className="sm:hidden">
                    {currentLocale.code.toUpperCase()}
                </span>
                <ChevronDownIcon
                    className={`h-3 w-3 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </Button>

            {isOpen && (
                <div
                    className="bg-popover absolute top-full right-0 z-50 mt-1 min-w-[60px] rounded-md border p-1 shadow-md"
                    role="listbox"
                    aria-label={t('languageOptions')}
                >
                    {locales.map((localeOption) => (
                        <button
                            key={localeOption.code}
                            onClick={() =>
                                handleLocaleChange(localeOption.code)
                            }
                            className={`hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                                locale === localeOption.code
                                    ? 'bg-accent text-accent-foreground'
                                    : ''
                            }`}
                            role="option"
                            aria-selected={locale === localeOption.code}
                        >
                            <span>{localeOption.name}</span>
                            {locale === localeOption.code && (
                                <div className="ml-auto h-1 w-1 rounded-full bg-current" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
