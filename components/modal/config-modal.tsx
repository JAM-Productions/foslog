import { useAppStore } from '@/lib/store';
import Modal from './modal';
import { Button } from '../button/button';
import { X } from 'lucide-react';
import LanguageSelector from '../header/language-selector';
import ThemeToggle from '../theme/theme-toggle';
import { useTranslations } from 'next-intl';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useAuth } from '@/lib/auth/auth-provider';
import { useOptionsModalStore } from '@/lib/options-modal-store';
import { useRouter } from '@/i18n/routing';
import { useToastStore } from '@/lib/toast-store';

export default function ConfigModal() {
    const tConfigModal = useTranslations('ConfigModal');
    const tCTA = useTranslations('CTA');
    const tToast = useTranslations('Toast');

    const { isConfigModalOpen, setIsConfigModalOpen } = useAppStore();
    const { user } = useAuth();
    const { showModal, setIsCTALoading, hideModal } = useOptionsModalStore();
    const { showToast } = useToastStore();
    const router = useRouter();

    useBodyScrollLock(isConfigModalOpen);

    const handleDeleteAccount = async () => {
        setIsCTALoading(true);
        try {
            const response = await fetch('/api/user', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            showToast(tToast('accountDeleted'), 'success');
            hideModal();
            setIsConfigModalOpen(false);
            router.push('/');
        } catch (error) {
            showToast(tToast('accountDeleteFailed'), 'error');
        } finally {
            setIsCTALoading(false);
        }
    };

    const handleDeleteAccountClick = () => {
        showModal(
            tConfigModal('deleteAccountTitle'),
            tConfigModal('deleteAccountDescription'),
            tCTA('delete'),
            handleDeleteAccount
        );
    };

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
                    {user && (
                        <div className="flex items-center justify-between border-b pb-2">
                            <span>{tConfigModal('deleteAccount')}</span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteAccountClick}
                            >
                                {tCTA('delete')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
