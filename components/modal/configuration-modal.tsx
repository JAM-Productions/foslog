'use client';

import { useAppStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import Modal from '@/components/modal/modal';
import { useTheme } from '@/components/theme/theme-provider';
import { Sun, Moon, Monitor, GlobeIcon } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

const locales = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ca', name: 'Català' },
] as const;

export default function ConfigurationModal() {
    const tConfigModal = useTranslations('ConfigurationModal');
    const tThemeToggle = useTranslations('ThemeToggle');

    const { isConfigModalOpen, setIsConfigModalOpen } = useAppStore();
    const { theme, setTheme } = useTheme();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const themes = [
        { value: 'light', label: tThemeToggle('light'), icon: Sun },
        { value: 'dark', label: tThemeToggle('dark'), icon: Moon },
        { value: 'system', label: tThemeToggle('system'), icon: Monitor },
    ] as const;

    const handleCloseModal = () => {
        setIsConfigModalOpen(false);
    };

    const handleLocaleChange = (newLocale: string) => {
        try {
            window.localStorage.setItem('preferredLocale', newLocale);
        } catch (error) {
            console.error('Failed to set preferred locale:', error);
        }
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <Modal
            isOpen={isConfigModalOpen}
            onClose={handleCloseModal}
            title={tConfigModal('title')}
            description={tConfigModal('description')}
            maxWidth="lg"
        >
            <div className="w-full space-y-6">
                {/* Theme Section */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">
                        {tConfigModal('themeSection')}
                    </h3>
                    <div className="space-y-2">
                        {themes.map((themeOption) => (
                            <button
                                key={themeOption.value}
                                onClick={() => setTheme(themeOption.value)}
                                className={[
                                    'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                                    theme === themeOption.value &&
                                        'bg-accent text-accent-foreground border-primary',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                <themeOption.icon className="h-5 w-5" />
                                <span className="flex-1">
                                    {themeOption.label}
                                </span>
                                {theme === themeOption.value && (
                                    <div className="h-2 w-2 rounded-full bg-current" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language Section */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">
                        {tConfigModal('languageSection')}
                    </h3>
                    <div className="space-y-2">
                        {locales.map((localeOption) => (
                            <button
                                key={localeOption.code}
                                onClick={() =>
                                    handleLocaleChange(localeOption.code)
                                }
                                className={[
                                    'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                                    locale === localeOption.code &&
                                        'bg-accent text-accent-foreground border-primary',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                <GlobeIcon className="h-5 w-5" />
                                <span className="flex-1">
                                    {localeOption.name}
                                </span>
                                {locale === localeOption.code && (
                                    <div className="h-2 w-2 rounded-full bg-current" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
