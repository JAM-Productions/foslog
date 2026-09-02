'use client';

import { Button } from '../button/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useCreateListModalStore } from '@/lib/create-list-modal-store';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface CreateListButtonProps {
    /** Owner of the profile/list being viewed. */
    userId: string;
}

export function CreateListButton({ userId }: CreateListButtonProps) {
    const t = useTranslations('ProfilePage');
    const { user: currentUser } = useAuth();
    const { showModal } = useCreateListModalStore();

    if (currentUser?.id !== userId) {
        return null;
    }

    return (
        <Button
            className="shrink-0"
            size="sm"
            variant="outline"
            data-testid="create-list-button"
            aria-label={t('createList')}
            onClick={showModal}
        >
            <Plus className="mr-2 h-4 w-4" />
            {t('createList')}
        </Button>
    );
}
