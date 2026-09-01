'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FileImage, Trash, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Modal from './modal';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { useAuth } from '@/lib/auth/auth-provider';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useCreateListModalStore } from '@/lib/create-list-modal-store';
import { useToastStore } from '@/lib/toast-store';
import { useRouter } from '@/i18n/navigation';
import {
    MAX_LIST_DESCRIPTION_LENGTH,
    MAX_LIST_IMAGE_LENGTH,
    MAX_LIST_NAME_LENGTH,
    MAX_LISTS_PER_USER,
    MIN_LIST_NAME_LENGTH,
} from '@/lib/constants';
import { compressImageToBase64 } from '@/utils/image-utils';

export default function CreateListModal() {
    const t = useTranslations('CreateListModal');
    const tCTA = useTranslations('CTA');
    const tToast = useTranslations('Toast');

    const { isModalOpen, list, hideModal } = useCreateListModalStore();
    const { showToast } = useToastStore();
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const isEditing = Boolean(list);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useBodyScrollLock(isModalOpen);

    // Seed the form from the list being edited, and clear it for a new one.
    useEffect(() => {
        if (!isModalOpen) return;
        setName(list?.name ?? '');
        setDescription(list?.description ?? '');
        setImage(list?.image ?? null);
    }, [isModalOpen, list]);

    const isNameValid =
        name.trim().length >= MIN_LIST_NAME_LENGTH &&
        name.trim().length <= MAX_LIST_NAME_LENGTH;

    const resetForm = () => {
        setName('');
        setDescription('');
        setImage(null);
        setIsProcessingImage(false);
        setIsCreating(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        if (isCreating) return;
        hideModal();
        resetForm();
    };

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessingImage(true);
        try {
            const base64Image = await compressImageToBase64(file);

            if (base64Image.length > MAX_LIST_IMAGE_LENGTH) {
                showToast(tToast('imageTooLarge'), 'error');
                return;
            }

            setImage(base64Image);
        } catch (error) {
            showToast(tToast('imageUpdateFailed'), 'error');
            console.error('Error processing list image:', error);
        } finally {
            setIsProcessingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!isNameValid || isCreating) return;

        setIsCreating(true);
        try {
            const response = await fetch(
                list ? `/api/list/${list.id}` : '/api/list',
                {
                    method: list ? 'PATCH' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim() || null,
                        image,
                    }),
                }
            );

            // The only 409 this endpoint returns is the per-user list cap, and
            // the generic error would leave the user guessing why it failed.
            if (response.status === 409) {
                showToast(
                    tToast('listLimitReached', { count: MAX_LISTS_PER_USER }),
                    'error'
                );
                setIsCreating(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to save list');
            }

            const data = (await response.json()) as {
                list?: { id: string };
            };

            showToast(
                tToast(isEditing ? 'listUpdated' : 'listCreated'),
                'success'
            );
            hideModal();
            resetForm();

            // Take the user straight into the list they just created; editing
            // happens on the list itself, so a refresh is enough there.
            const newListId = !isEditing && data.list?.id;
            if (newListId && currentUser) {
                router.push(`/profile/${currentUser.id}/list/${newListId}`);
            } else {
                router.refresh();
            }
        } catch (error) {
            showToast(
                tToast(isEditing ? 'listUpdateFailed' : 'listCreateFailed'),
                'error'
            );
            console.error('Error saving list:', error);
            setIsCreating(false);
        }
    };

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="flex w-full flex-col overflow-y-auto">
                <div className="relative mb-10 flex w-full flex-col items-center justify-between text-center">
                    <h1
                        id="modal-title"
                        className="text-2xl font-semibold"
                    >
                        {isEditing ? t('editTitle') : t('title')}
                    </h1>
                    <Button
                        className="absolute right-0"
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        aria-label={tCTA('close')}
                        disabled={isCreating}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="mb-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-2 px-1">
                        <label htmlFor="create-list-name-input">
                            {t('nameLabel')}
                        </label>
                        <Input
                            id="create-list-name-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            maxLength={MAX_LIST_NAME_LENGTH}
                            disabled={isCreating}
                        />
                    </div>

                    <div className="flex flex-col gap-2 px-1">
                        <label>{t('imageLabel')}</label>
                        <div className="flex items-center gap-4">
                            <div className="bg-muted relative h-20 w-20 overflow-hidden rounded-lg border shadow-sm">
                                {image ? (
                                    <Image
                                        src={image}
                                        alt={name || t('imageLabel')}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <FileImage className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    data-testid="create-list-image-input"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={isProcessingImage || isCreating}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {t('upload')}
                                </Button>
                                {image && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleRemoveImage}
                                        disabled={
                                            isProcessingImage || isCreating
                                        }
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        {t('remove')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 px-1">
                        <label htmlFor="create-list-description-input">
                            {t('descriptionLabel')}
                        </label>
                        <textarea
                            id="create-list-description-input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                            maxLength={MAX_LIST_DESCRIPTION_LENGTH}
                            rows={4}
                            disabled={isCreating}
                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border px-4 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="text-muted-foreground text-right text-sm">
                            {description.length}/{MAX_LIST_DESCRIPTION_LENGTH}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isCreating}
                    >
                        {tCTA('cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isNameValid || isCreating}
                    >
                        {isCreating
                            ? '...'
                            : isEditing
                              ? tCTA('save')
                              : tCTA('create')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
