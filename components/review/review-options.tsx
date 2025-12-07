'use client';

import { Button } from '@/components/button/button';
import { Pencil, Share2, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { Toast } from '@/components/toast/toast';

interface ReviewOptionsProps {
    isOwner: boolean;
    variant?: 'mobile' | 'desktop';
    reviewId: string;
}

export function ReviewOptions({
    isOwner,
    variant = 'mobile',
    reviewId,
}: ReviewOptionsProps) {
    const tCTA = useTranslations('CTA');
    const t = useTranslations('ReviewPage');
    const { showToast, toastMessage, show, hide } = useToast();

    const handleShare = async () => {
        const url = `/review/${reviewId}`;
        const text = t('shareText');
        if (navigator.share) {
            try {
                await navigator.share({
                    title: text,
                    url: url,
                });
            } catch (error) {
                console.error(t('errors.shareFailed'), error);
                show(t('errors.shareFailed'));
            }
        } else {
            try {
                await navigator.clipboard.writeText(
                    `${window.location.origin}${url}`,
                );
                show(t('clipboardSuccess'));
            } catch (error) {
                console.error(t('errors.clipboardFailed'), error);
                show(t('errors.clipboardFailed'));
            }
        }
    };

    const isMobile = variant === 'mobile';
    const buttonClassName = isMobile
        ? 'flex w-full items-center gap-1.5 sm:w-auto'
        : 'flex w-full items-center gap-1.5';

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
            <Toast
                message={toastMessage}
                show={showToast}
                onClose={hide}
            />
        </>
    );
}
