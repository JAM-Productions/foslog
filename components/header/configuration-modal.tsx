'use client';

import { Modal } from '@/components/modal/modal';
import { useTranslations } from 'next-intl';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { LocaleSwitcher } from '@/components/header/locale-switcher';

interface ConfigurationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ConfigurationModal({
    isOpen,
    onClose,
}: ConfigurationModalProps) {
    const t = useTranslations('Header');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('settings')}
        >
            <div className="space-y-4">
                <div>
                    <h3 className="mb-2 text-lg font-medium">
                        {t('theme')}
                    </h3>
                    <ThemeSwitcher />
                </div>
                <div>
                    <h3 className="mb-2 text-lg font-medium">
                        {t('language')}
                    </h3>
                    <LocaleSwitcher />
                </div>
            </div>
        </Modal>
    );
}
