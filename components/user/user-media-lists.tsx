'use client';

import { ListPreviewRow } from '@/components/list/list-preview-row';
import { useAuth } from '@/lib/auth/auth-provider';
import { SafeMediaList } from '@/lib/types';
import { useTranslations } from 'next-intl';

export type MediaList = SafeMediaList;

export function UserMediaLists({
    mediaLists,
    total,
    userId,
}: {
    mediaLists: MediaList[];
    total: number;
    userId: string;
}) {
    const t = useTranslations('ProfilePage');
    const { user: currentUser } = useAuth();

    const isOwner = currentUser?.id === userId;

    return (
        <ListPreviewRow
            title={isOwner ? t('yourLibrary') : t('userLibrary')}
            lists={mediaLists}
            total={total}
            userId={userId}
            withCreateButton
            emptyMessage={t('noLists', {
                user: isOwner ? t('you') : t('thisUser'),
            })}
        />
    );
}
