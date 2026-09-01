'use client';

import { useRef, useState } from 'react';
import { Globe, Lock, Pencil, Settings, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ListType } from '@prisma/client';

import { Button } from '../button/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useCreateListModalStore } from '@/lib/create-list-modal-store';
import { useOptionsModalStore } from '@/lib/options-modal-store';
import { useToastStore } from '@/lib/toast-store';
import { useRouter } from '@/i18n/navigation';

export interface ListOptionsProps {
    list: {
        id: string;
        name: string;
        description?: string;
        image?: string;
        type: ListType;
        isPublic: boolean;
    };
    /** Owner of the list. */
    userId: string;
}

export function ListOptions({ list, userId }: ListOptionsProps) {
    const t = useTranslations('ListPage');
    const tCTA = useTranslations('CTA');
    const tToast = useTranslations('Toast');

    const { user: currentUser } = useAuth();
    const { showEditModal } = useCreateListModalStore();
    const { showModal, setIsCTALoading, hideModal } = useOptionsModalStore();
    const { showToast } = useToastStore();
    const router = useRouter();

    const menuRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
    const [optimisticVisibility, setOptimisticVisibility] = useState<{
        listId: string;
        from: boolean;
        to: boolean;
    } | null>(null);

    useClickOutside(menuRef, isOpen, setIsOpen);

    if (
        optimisticVisibility &&
        (optimisticVisibility.listId !== list.id ||
            optimisticVisibility.from !== list.isPublic)
    ) {
        setOptimisticVisibility(null);
    }

    const isPublic = optimisticVisibility
        ? optimisticVisibility.to
        : list.isPublic;

    // Bookmark lists are managed by the app, so they cannot be edited.
    if (currentUser?.id !== userId || list.type === ListType.BOOKMARK) {
        return null;
    }

    const deleteList = async () => {
        setIsCTALoading(true);
        try {
            const response = await fetch(`/api/list/${list.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete list');
            }

            showToast(tToast('listDeleted'), 'success');
            hideModal();
            router.push(`/profile/${userId}`);
        } catch (error) {
            console.error('Failed to delete list:', error);
            showToast(tToast('listDeleteFailed'), 'error');
            hideModal();
        } finally {
            setIsCTALoading(false);
        }
    };

    const toggleVisibility = async () => {
        if (isUpdatingVisibility) return;

        const nextIsPublic = !isPublic;
        setOptimisticVisibility({
            listId: list.id,
            from: list.isPublic,
            to: nextIsPublic,
        });
        setIsUpdatingVisibility(true);
        try {
            const response = await fetch(`/api/list/${list.id}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: nextIsPublic }),
            });

            if (!response.ok) {
                throw new Error('Failed to update list visibility');
            }

            showToast(
                tToast(nextIsPublic ? 'listMadePublic' : 'listMadePrivate'),
                'success'
            );
            router.refresh();
        } catch (error) {
            console.error('Failed to update list visibility:', error);
            setOptimisticVisibility(null);
            showToast(tToast('listVisibilityFailed'), 'error');
        } finally {
            setIsUpdatingVisibility(false);
        }
    };

    const handleEdit = () => {
        setIsOpen(false);
        showEditModal({
            id: list.id,
            name: list.name,
            description: list.description,
            image: list.image,
        });
    };

    const handleDelete = () => {
        setIsOpen(false);
        showModal(
            t('deleteListTitle', { name: list.name }),
            t('deleteListDescription'),
            tCTA('delete'),
            deleteList
        );
    };

    return (
        <div
            className="relative"
            ref={menuRef}
        >
            <Button
                variant="outline"
                className="h-auto"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t('listOptions')}
                aria-expanded={isOpen}
                data-testid="list-options-button"
            >
                <span className="flex h-6 items-center">
                    <Settings className="h-5 w-5" />
                </span>
                <span className="hidden sm:ml-2 sm:inline">
                    {t('listOptions')}
                </span>
            </Button>

            {isOpen && (
                <div className="bg-card absolute top-12 right-0 z-30 w-48 rounded-lg border shadow-lg">
                    <div className="p-1">
                        <button
                            className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-base disabled:pointer-events-none disabled:opacity-50"
                            onClick={toggleVisibility}
                            disabled={isUpdatingVisibility}
                            data-testid="toggle-visibility-option"
                            data-public={isPublic}
                        >
                            {isPublic ? (
                                <Lock className="h-4 w-4" />
                            ) : (
                                <Globe className="h-4 w-4" />
                            )}
                            {isPublic ? t('makePrivate') : t('makePublic')}
                        </button>
                        <button
                            className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-base"
                            onClick={handleEdit}
                            data-testid="edit-list-option"
                        >
                            <Pencil className="h-4 w-4" />
                            {t('editList')}
                        </button>
                        <button
                            className="hover:bg-accent hover:text-accent-foreground text-destructive flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-base"
                            onClick={handleDelete}
                            data-testid="delete-list-option"
                        >
                            <Trash className="h-4 w-4" />
                            {t('deleteList')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
