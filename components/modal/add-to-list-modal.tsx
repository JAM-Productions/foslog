'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Modal from './modal';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAddToListModalStore } from '@/lib/add-to-list-modal-store';
import { useToastStore } from '@/lib/toast-store';
import { useRouter } from '@/i18n/navigation';
import { ListRow, type ListEntry } from '@/components/modal/list-row';

import { ListType } from '@prisma/client';

/** Placeholder shown until the user bookmarks something for the first time. */
const emptyBookmarkEntry: ListEntry = {
    id: '',
    name: '',
    image: undefined,
    type: ListType.BOOKMARK,
    totalItems: 0,
    containsMedia: false,
};

export default function AddToListModal() {
    const t = useTranslations('AddToListModal');
    const tCTA = useTranslations('CTA');
    const tToast = useTranslations('Toast');
    const tProfile = useTranslations('ProfilePage');

    const { isModalOpen, mediaId, mediaTitle, hideModal } =
        useAddToListModalStore();
    const { showToast } = useToastStore();
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const [bookmark, setBookmark] = useState<ListEntry>(emptyBookmarkEntry);
    const [lists, setLists] = useState<ListEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [query, setQuery] = useState('');
    const [pendingIds, setPendingIds] = useState<string[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    useBodyScrollLock(isModalOpen);

    const bookmarkLabel = tProfile('bookmarked');

    const fetchLists = useCallback(async () => {
        setIsLoading(true);
        setLoadFailed(false);
        try {
            const response = await fetch(
                `/api/list?mediaId=${encodeURIComponent(mediaId)}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch lists');
            }

            const data = (await response.json()) as {
                bookmark: ListEntry | null;
                lists: ListEntry[];
            };

            setBookmark(data.bookmark ?? emptyBookmarkEntry);
            setLists(data.lists);
        } catch (error) {
            console.error('Error fetching lists:', error);
            setLoadFailed(true);
        } finally {
            setIsLoading(false);
        }
    }, [mediaId]);

    useEffect(() => {
        if (!isModalOpen || !mediaId) return;
        fetchLists();
    }, [isModalOpen, mediaId, fetchLists]);

    const handleClose = () => {
        hideModal();
        setQuery('');
        setLists([]);
        setBookmark(emptyBookmarkEntry);
        setIsLoading(true);
        setLoadFailed(false);
        setPendingIds([]);
        if (hasChanges) {
            router.refresh();
            setHasChanges(false);
        }
    };

    /** The bookmark placeholder has no id yet, so it has no page to open. */
    const canNavigate = (entry: ListEntry) => Boolean(currentUser && entry.id);

    const handleNavigate = (entry: ListEntry) => {
        if (!canNavigate(entry) || !currentUser) return;
        handleClose();
        router.push(`/profile/${currentUser.id}/list/${entry.id}`);
    };

    const applyToggle = (entry: ListEntry, added: boolean): ListEntry => ({
        ...entry,
        containsMedia: added,
        totalItems: Math.max(0, entry.totalItems + (added ? 1 : -1)),
    });

    const toggleEntry = async (entry: ListEntry, isBookmark: boolean) => {
        const key = isBookmark ? 'bookmark' : entry.id;
        if (pendingIds.includes(key)) return;

        const added = !entry.containsMedia;
        setPendingIds((prev) => [...prev, key]);

        const update = (next: ListEntry) => {
            if (isBookmark) {
                setBookmark(next);
            } else {
                setLists((prev) =>
                    prev.map((item) => (item.id === next.id ? next : item))
                );
            }
        };

        update(applyToggle(entry, added));

        try {
            const response = isBookmark
                ? await fetch(`/api/media/${mediaId}/bookmark`, {
                      method: added ? 'POST' : 'DELETE',
                  })
                : await fetch('/api/list', {
                      method: added ? 'PUT' : 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ mediaId, listId: entry.id }),
                  });

            if (!response.ok) {
                throw new Error('Failed to toggle list membership');
            }

            setHasChanges(true);
        } catch (error) {
            console.error('Error updating list:', error);
            update(entry);
            showToast(tToast('toggleListFailed'), 'error');
        } finally {
            setPendingIds((prev) => prev.filter((id) => id !== key));
        }
    };

    const normalizedQuery = query.trim().toLowerCase();

    const filteredLists = useMemo(
        () =>
            normalizedQuery
                ? lists.filter((list) =>
                      list.name.toLowerCase().includes(normalizedQuery)
                  )
                : lists,
        [lists, normalizedQuery]
    );

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="flex min-h-0 w-full flex-1 flex-col sm:h-[32rem] sm:flex-none">
                <div className="relative mb-6 flex w-full flex-col items-center justify-between text-center">
                    <h1
                        id="modal-title"
                        className="text-2xl font-semibold"
                    >
                        {t('title')}
                    </h1>
                    {mediaTitle && (
                        <p className="text-muted-foreground mt-1 text-sm">
                            {mediaTitle}
                        </p>
                    )}
                    <Button
                        className="absolute right-0"
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        aria-label={tCTA('close')}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="relative mb-4">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        aria-label={t('searchPlaceholder')}
                        className="pl-9"
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-4 py-2"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-accent h-10 w-10 animate-pulse rounded-md" />
                                    <div className="bg-accent h-4 w-32 animate-pulse" />
                                </div>
                                <div className="bg-accent h-9 w-24 animate-pulse rounded-md" />
                            </div>
                        ))}
                    </div>
                ) : loadFailed ? (
                    <p className="text-muted-foreground py-4">
                        {t('loadError')}
                    </p>
                ) : (
                    <>
                        <div className="border-b pb-2">
                            <ListRow
                                entry={bookmark}
                                label={bookmarkLabel}
                                isPending={pendingIds.includes('bookmark')}
                                onToggle={() => toggleEntry(bookmark, true)}
                                onNavigate={
                                    canNavigate(bookmark)
                                        ? () => handleNavigate(bookmark)
                                        : undefined
                                }
                            />
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto pt-2 pr-3">
                            {filteredLists.length === 0 ? (
                                <p className="text-muted-foreground py-4">
                                    {normalizedQuery
                                        ? t('noResults')
                                        : t('noLists')}
                                </p>
                            ) : (
                                filteredLists.map((list) => (
                                    <ListRow
                                        key={list.id}
                                        entry={list}
                                        label={list.name}
                                        isPending={pendingIds.includes(list.id)}
                                        onToggle={() =>
                                            toggleEntry(list, false)
                                        }
                                        onNavigate={
                                            canNavigate(list)
                                                ? () => handleNavigate(list)
                                                : undefined
                                        }
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
