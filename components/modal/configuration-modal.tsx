'use client';

import { useAppStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import Modal from './modal';
import LanguageSelector from '../header/language-selector';
import { ThemeToggle } from '../theme/theme-toggle';

export default function ConfigurationModal() {
    const t = useTranslations('ConfigurationModal');
    const { isConfigurationModalOpen, setIsConfigurationModalOpen } =
        useAppStore();

    const closeModal = () => {
        setIsConfigurationModalOpen(false);
    };

    return (
        <Modal
            isOpen={isConfigurationModalOpen}
            onClose={closeModal}
            title={t('title')}
            description={t('description')}
        >
            <div className="flex w-full flex-col gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-foreground text-sm font-semibold">
                        {t('language')}
                    </span>
                    <LanguageSelector />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-foreground text-sm font-semibold">
                        {t('theme')}
                    </span>
                    <ThemeToggle />
                </div>
            </div>
        </Modal>
    );
}
