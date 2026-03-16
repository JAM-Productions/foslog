'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/button/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAppStore } from '@/lib/store';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface CreateReviewButtonProps {
    variant?: 'nav' | 'fab';
}

export function CreateReviewButton({ variant = 'nav' }: CreateReviewButtonProps) {
    const tCTA = useTranslations('CTA');
    const { user } = useAuth();
    const { setIsReviewModalOpen } = useAppStore();
    const router = useRouter();

    const handleClick = () => {
        if (!user) {
            router.push('/login');
        } else {
            setIsReviewModalOpen(true);
        }
    };

    if (variant === 'fab') {
        return (
            <Button
                onClick={handleClick}
                className="fixed right-6 bottom-6 z-40 h-14 w-14 rounded-full shadow-lg sm:hidden"
                size="icon"
                aria-label={tCTA('addNewReview')}
            >
                <Plus className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Button
            onClick={handleClick}
            variant="default"
            size="sm"
            className="hidden items-center gap-2 sm:flex"
        >
            <Plus className="h-4 w-4" />
            <span>{tCTA('addNewReview')}</span>
        </Button>
    );
}
