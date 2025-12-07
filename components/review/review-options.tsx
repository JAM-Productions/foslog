'use client';

import { Button } from '@/components/button/button';
import { Toast } from '@/components/toast/toast';
import { useShare } from '@/hooks/use-share';
import { Pencil, Share2, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReviewOptionsProps {
    isOwner: boolean;
    variant?: 'mobile' | 'desktop';
}

export function ReviewOptions({
    isOwner,
    variant = 'mobile',
}: ReviewOptionsProps) {
    const tCTA = useTranslations('CTA');
    const t = useTranslations('ReviewPage');
    const tToast = useTranslations('Toast');
    const { isCopied, share } = useShare();

    const isMobile = variant === 'mobile';
    const buttonClassName = isMobile
        ? 'flex w-full items-center gap-1.5 sm:w-auto'
        : 'flex w-full items-center gap-1.5';

    const handleShare = () => {
        share(t('shareReview'));
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
            <Toast message={tToast('linkCopied')} show={isCopied} />
        </>
    );
}
