import { useAppStore } from '@/lib/store';
import Modal from './modal';
import { Button } from '../button/button';
import { X, Upload, Trash, User as UserIcon } from 'lucide-react';
import LanguageSelector from '../header/language-selector';
import ThemeToggle from '../theme/theme-toggle';
import { useTranslations } from 'next-intl';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useAuth } from '@/lib/auth/auth-provider';
import { useOptionsModalStore } from '@/lib/options-modal-store';
import { useRouter } from '@/i18n/navigation';
import { useToastStore } from '@/lib/toast-store';
import { useState, useEffect, useRef } from 'react';
import { Input } from '../input/input';
import Image from 'next/image';

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
    const [isUpdatingImage, setIsUpdatingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            await Promise.all([refetchSession(), router.refresh()]);
        } catch (error) {
            showToast(tToast('nameUpdateFailed'), 'error');
            console.error('Error updating name:', error);
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const base64Image = canvas.toDataURL('image/jpeg', 0.7);
                updateUserImage(base64Image);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const updateUserImage = async (base64Image: string | null) => {
        setIsUpdatingImage(true);
        try {
            const response = await fetch('/api/user', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) {
                throw new Error('Failed to update image');
            }

            showToast(tToast('imageUpdated'), 'success');
            await Promise.all([refetchSession(), router.refresh()]);
        } catch (error) {
            showToast(tToast('imageUpdateFailed'), 'error');
            console.error('Error updating image:', error);
        } finally {
            setIsUpdatingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
                            <div className="flex flex-col gap-4 border-b pb-4">
                                <div className="flex flex-col gap-2">
                                    <label>
                                        {tConfigModal('profilePicture')}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-16 w-16 overflow-hidden rounded-full border">
                                            {user.image ? (
                                                <Image
                                                    src={user.image}
                                                    alt={user.name || 'User'}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                    <UserIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                disabled={isUpdatingImage}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                {tConfigModal('upload')}
                                            </Button>
                                            {user.image && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        updateUserImage(null)
                                                    }
                                                    disabled={isUpdatingImage}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    {tConfigModal('remove')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
