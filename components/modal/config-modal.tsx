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
import { useRouter } from '@/i18n/navigation';
import { useToastStore } from '@/lib/toast-store';
import { useState, useEffect } from 'react';
import { Input } from '../input/input';

export default function ConfigModal() {
    const tConfigModal = useTranslations('ConfigModal');
    const tCTA = useTranslations('CTA');
    const tToast = useTranslations('Toast');

    const { isConfigModalOpen, setIsConfigModalOpen } = useAppStore();
    const { user, refetchSession } = useAuth();
    const { showModal, setIsCTALoading, hideModal } = useOptionsModalStore();
    const { showToast } = useToastStore();
    const router = useRouter();

    const [name, setName] = useState(user?.name || '');
    const [isUpdatingName, setIsUpdatingName] = useState(false);

    useEffect(() => {
        setName(user?.name ?? '');
    }, [user?.name]);

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
            console.error('Error deleting account:', error);
        } finally {
            setIsCTALoading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!name || name.trim().length < 2) return;

        setIsUpdatingName(true);
        try {
            const response = await fetch('/api/user', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!response.ok) {
                throw new Error('Failed to update name');
            }

            showToast(tToast('nameUpdated'), 'success');
            refetchSession();
            router.refresh();
        } catch (error) {
            showToast(tToast('nameUpdateFailed'), 'error');
            console.error('Error updating name:', error);
        } finally {
            setIsUpdatingName(false);
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
                        <>
                            <div className="flex flex-col gap-2 border-b pb-4">
                                <label htmlFor="update-name-input">
                                    {tConfigModal('updateName')}
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        id="update-name-input"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder={tConfigModal(
                                            'namePlaceholder'
                                        )}
                                        inputSize="sm"
                                        className="h-9"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleUpdateName}
                                        disabled={
                                            isUpdatingName ||
                                            name.trim() === user.name ||
                                            name.trim().length < 2
                                        }
                                    >
                                        {isUpdatingName ? '...' : tCTA('save')}
                                    </Button>
                                </div>
                            </div>
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
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
