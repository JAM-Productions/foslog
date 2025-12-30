'use client';

import { Button } from '@/components/button/button';
import { Toast } from '@/components/toast/toast';
import { useToast } from '@/hooks/useToast';
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
    const { toast, showToast, hideToast } = useToast();

    const isMobile = variant === 'mobile';
    const buttonClassName = isMobile
        ? 'flex w-full items-center gap-1.5 sm:w-auto'
        : 'flex w-full items-center gap-1.5';

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/review/${reviewId}`;

        // Check if we're on mobile and Web Share API is available
        if (navigator.share && /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
            try {
                await navigator.share({
                    title: 'Review',
                    url: shareUrl,
                });
            } catch (error) {
                // User cancelled share or error occurred
                // Fallback to copy
                if ((error as Error).name !== 'AbortError') {
                    copyToClipboard(shareUrl);
                }
            }
        } else {
            // Desktop: copy to clipboard and show toast
            copyToClipboard(shareUrl);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast(tToast('linkCopied'), 'success');
        } catch {
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
            {toast.isVisible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </>
    );
}
