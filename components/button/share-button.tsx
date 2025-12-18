'use client';

import { useToast } from '@/hooks/use-toast';
import { Button, ButtonProps } from '@/components/button/button';
import { useTranslations } from 'next-intl';

interface ShareButtonProps extends ButtonProps {
    children: React.ReactNode;
}

export function ShareButton({ children, ...props }: ShareButtonProps) {
    const { showToast } = useToast();
    const t = useTranslations('Toast');

    const handleShare = async () => {
        const url = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: document.title,
                    url: url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                showToast(t('urlCopied'));
            }
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    return (
        <Button
            {...props}
            onClick={handleShare}
            aria-label="Share"
        >
            {children}
        </Button>
    );
}
