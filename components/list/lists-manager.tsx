'use client';

import { useState } from 'react';
import { CheckCheck, Square, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ListType } from '@prisma/client';

import { Button } from '../button/button';
import { CreateListButton } from './create-list-button';
import { ListCard } from './list-card';
import { useAuth } from '@/lib/auth/auth-provider';
import { useOptionsModalStore } from '@/lib/options-modal-store';
import { useToastStore } from '@/lib/toast-store';
import { useRouter } from '@/i18n/navigation';
import { SafeMediaList } from '@/lib/types';

export interface ListsManagerProps {
    lists: SafeMediaList[];
    userId: string;
    userName: string;
}

export function ListsManager({ lists, userId, userName }: ListsManagerProps) {
    const t = useTranslations('ListsPage');
    const tCTA = useTranslations('CTA');
    const tToast = useTranslations('Toast');

    const { user: currentUser } = useAuth();
    const { showModal, setIsCTALoading, hideModal } = useOptionsModalStore();
    const { showToast } = useToastStore();
    const router = useRouter();

    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const isOwner = currentUser?.id === userId;
    // The bookmark list cannot be deleted, so it never counts as deletable.
    const hasDeletableLists = lists.some(
        (list) => list.type !== ListType.BOOKMARK
    );

    const toggleSelected = (listId: string) => {
        setSelectedIds((prev) =>
            prev.includes(listId)
                ? prev.filter((id) => id !== listId)
                : [...prev, listId]
        );
    };

    const stopSelecting = () => {
        setIsSelecting(false);
        setSelectedIds([]);
    };

    const deletableIds = lists
        .filter((list) => list.type !== ListType.BOOKMARK)
        .map((list) => list.id);
    const areAllSelected =
        deletableIds.length > 0 && selectedIds.length === deletableIds.length;

    const selectAll = () => setSelectedIds(deletableIds);
    const deselectAll = () => setSelectedIds([]);

    const deleteSelectedLists = async () => {
        setIsCTALoading(true);
        try {
            const results = await Promise.all(
                selectedIds.map((listId) =>
                    fetch(`/api/list/${listId}`, { method: 'DELETE' })
                )
            );

            const failed = results.filter((response) => !response.ok).length;

            if (failed === selectedIds.length) {
                throw new Error('Failed to delete the selected lists');
            }

            showToast(
                failed > 0
                    ? tToast('listsPartiallyDeleted', { count: failed })
                    : tToast('listsDeleted', { count: selectedIds.length }),
                failed > 0 ? 'info' : 'success'
            );
            stopSelecting();
            router.refresh();
        } catch (error) {
            console.error('Failed to delete lists:', error);
            showToast(tToast('listsDeleteFailed'), 'error');
        } finally {
            setIsCTALoading(false);
            hideModal();
        }
    };

    const confirmDelete = () => {
        showModal(
            t('deleteListsTitle', { count: selectedIds.length }),
            t('deleteListsDescription'),
            tCTA('delete'),
            deleteSelectedLists
        );
    };

    return (
        <>
            <div className="mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold">
                    {t('title', { name: userName })}
                </h1>
                {isOwner && (
                    <div className="mt-4 flex gap-2 overflow-x-auto">
                        {isSelecting ? (
                            <>
                                <Button
                                    className="shrink-0"
                                    size="sm"
                                    variant="outline"
                                    disabled={areAllSelected}
                                    onClick={selectAll}
                                    aria-label={t('selectAll')}
                                    title={t('selectAll')}
                                    data-testid="select-all-lists-button"
                                >
                                    <CheckCheck className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        {t('selectAll')}
                                    </span>
                                </Button>
                                <Button
                                    className="shrink-0"
                                    size="sm"
                                    variant="outline"
                                    disabled={selectedIds.length === 0}
                                    onClick={deselectAll}
                                    aria-label={t('deselectAll')}
                                    title={t('deselectAll')}
                                    data-testid="deselect-all-lists-button"
                                >
                                    <Square className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">
                                        {t('deselectAll')}
                                    </span>
                                </Button>
                                <Button
                                    className="shrink-0"
                                    size="sm"
                                    variant="outline"
                                    onClick={stopSelecting}
                                    data-testid="cancel-delete-lists-button"
                                >
                                    {tCTA('cancel')}
                                </Button>
                                <Button
                                    className="shrink-0"
                                    size="sm"
                                    variant="destructive"
                                    disabled={selectedIds.length === 0}
                                    onClick={confirmDelete}
                                    data-testid="confirm-delete-lists-button"
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    {t('deleteSelected', {
                                        count: selectedIds.length,
                                    })}
                                </Button>
                            </>
                        ) : (
                            <>
                                <CreateListButton userId={userId} />
                                {hasDeletableLists && (
                                    <Button
                                        className="shrink-0"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsSelecting(true)}
                                        aria-label={t('deleteLists')}
                                        data-testid="start-delete-lists-button"
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        {t('deleteLists')}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {lists.length === 0 ? (
                <p className="text-muted-foreground">{t('noLists')}</p>
            ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
                    {lists.map((list) => (
                        <ListCard
                            key={list.id}
                            list={list}
                            userId={userId}
                            isSelecting={isSelecting}
                            isSelected={selectedIds.includes(list.id)}
                            onToggleSelect={() => toggleSelected(list.id)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
