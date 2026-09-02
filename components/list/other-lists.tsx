'use client';

import { SafeMediaList } from '@/lib/types';
import { useTranslations } from 'next-intl';

import { ListPreviewRow } from './list-preview-row';

export interface OtherListsProps {
    lists: SafeMediaList[];
    total: number;
    /** Owner of the list currently being viewed. */
    userId: string;
}

export function OtherLists({ lists, total, userId }: OtherListsProps) {
    const t = useTranslations('ListPage');

    return (
        <div className="mt-12">
            <ListPreviewRow
                title={t('otherLists')}
                lists={lists}
                total={total}
                userId={userId}
                emptyMessage={t('noOtherLists')}
            />
        </div>
    );
}
