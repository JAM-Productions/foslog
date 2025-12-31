'use client';

import { Button } from '@/components/button/button';
import { useToastStore } from '@/lib/toast-store';
import { Pencil, Share2, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReviewOptionsProps {
    reviewId: string;
    isOwner: boolean;
    variant?: 'mobile' | 'desktop';
}

export function ReviewOptions({
    reviewId,
    isOwner,
    variant = 'mobile',
}: ReviewOptionsProps) {
    const tCTA = useTranslations('CTA');
    const t = useTranslations('ReviewPage');
    const tToast = useTranslations('Toast');
    const { showToast } = useToastStore();

    const isMobile = variant === 'mobile';
    const buttonClassName = isMobile
        ? 'flex w-full items-center gap-1.5 sm:w-auto'
        : 'flex w-full items-center gap-1.5';

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/review/${reviewId}`;

        // Check if Web Share API is available (primarily on mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t('shareTitle'),
                    url: shareUrl,
                });
            } catch (error) {
                // User cancelled share or error occurred
                // Fallback to copy on error (but not on user cancel)
                if ((error as Error).name !== 'AbortError') {
                    copyToClipboard(shareUrl);
                }
            }
        } else {
            // Desktop or browsers without Web Share API: copy to clipboard
            copyToClipboard(shareUrl);
        }
    };

    const copyToClipboard = async (text: string) => {
        // Check for secure context and clipboard API availability
        const hasWindow = typeof window !== 'undefined';
        const isSecure = hasWindow && window.isSecureContext;
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

    return (
        <>
            {variant === 'desktop' && (
                <span className="text-foreground text-2xl font-bold sm:text-3xl">
                    {t('options')}
                </span>
            )}
            {isOwner && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className={buttonClassName}
                    >
                        <Pencil className="h-4 w-4" />
                        <span>{tCTA('edit')}</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className={buttonClassName}
                    >
                        <Trash className="h-4 w-4" />
                        <span>{tCTA('delete')}</span>
                    </Button>
                </>
            )}
            <Button
                variant="outline"
                size="sm"
                className={buttonClassName}
                onClick={handleShare}
            >
                <Share2 className="h-4 w-4" />
                <span>{tCTA('share')}</span>
            </Button>
        </>
    );
}
