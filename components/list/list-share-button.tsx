'use client';

import { Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ListType } from '@prisma/client';

import { Button } from '../button/button';
import { useToastStore } from '@/lib/toast-store';

export interface ListShareButtonProps {
    listId: string;
    listName: string;
    type: ListType;
    isPublic: boolean;
    /** Owner of the list, used to build the shareable link. */
    userId: string;
}

export function ListShareButton({
    listId,
    listName,
    type,
    isPublic,
    userId,
}: ListShareButtonProps) {
    const t = useTranslations('ListPage');
    const tToast = useTranslations('Toast');

    const { showToast } = useToastStore();

    const copyToClipboard = async (text: string) => {
        const isSecure =
            typeof window !== 'undefined' && window.isSecureContext;
        const hasClipboard =
            typeof navigator !== 'undefined' &&
            !!navigator.clipboard &&
            typeof navigator.clipboard.writeText === 'function';

        if (!isSecure || !hasClipboard) {
            console.error(
                'Clipboard access unavailable: requires secure HTTPS context'
            );
            showToast(tToast('copyFailed'), 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            showToast(tToast('linkCopied'), 'success');
        } catch (error) {
            console.error('Failed to copy text to clipboard:', error);
            showToast(tToast('copyFailed'), 'error');
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/profile/${userId}/list/${listId}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: listName, url: shareUrl });
            } catch (error) {
                // Copy as a fallback, but not when the user simply cancelled.
                if ((error as Error).name !== 'AbortError') {
                    copyToClipboard(shareUrl);
                }
            }
        } else {
            copyToClipboard(shareUrl);
        }
    };

    // Only a public list has a link worth passing around, and bookmark lists
    // can never be public.
    if (!isPublic || type === ListType.BOOKMARK) {
        return null;
    }

    return (
        <Button
            className="h-auto shrink-0"
            variant="outline"
            onClick={handleShare}
            aria-label={t('shareList')}
            data-testid="share-list-button"
        >
            <span className="flex h-6 items-center">
                <Share2 className="h-5 w-5" />
            </span>
            <span className="hidden sm:ml-2 sm:inline">{t('shareList')}</span>
        </Button>
    );
}
