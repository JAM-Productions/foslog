import { useAppStore } from '@/lib/store';
import Modal from './modal';
import { Button } from '../button/button';
import { X } from 'lucide-react';
import LanguageSelector from '../header/language-selector';
import ThemeToggle from '../theme/theme-toggle';
import { useTranslations } from 'next-intl';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export default function ConfigModal() {
    const tConfigModal = useTranslations('ConfigModal');

    const { isConfigModalOpen, setIsConfigModalOpen } = useAppStore();

    useBodyScrollLock(isConfigModalOpen);

    return (
        <Modal isModalOpen={isConfigModalOpen}>
            <div className="flex w-full flex-col">
                <div className="relative mb-10 flex w-full flex-col items-center justify-between text-center">
                    <h1
                        id="modal-title"
                        className="text-2xl font-semibold"
                    >
                        {tConfigModal('settings')}
                    </h1>
                    <Button
                        className="absolute right-0"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsConfigModalOpen(false)}
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div className="mb-2 space-y-8">
                    <div className="flex items-center justify-between border-b pb-2">
                        <span>{tConfigModal('language')}</span>
                        <LanguageSelector />
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                        <span>{tConfigModal('theme')}</span>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
