'use client';

import { useRouter } from '@/i18n/navigation';
import { SafeMediaList } from '@/lib/types';
import { useTranslations } from 'next-intl';

import { Button } from '../button/button';
import { CreateListButton } from './create-list-button';
import { ListCard } from './list-card';
import { SeeMoreListsCard } from './see-more-lists-card';

export interface ListPreviewRowProps {
    title: string;
    lists: SafeMediaList[];
    /** Total visible lists, used to decide whether "see more" is needed. */
    total: number;
    userId: string;
    emptyMessage: string;
    withCreateButton?: boolean;
}

export function ListPreviewRow({
    title,
    lists,
    total,
    userId,
    emptyMessage,
    withCreateButton = false,
}: ListPreviewRowProps) {
    const t = useTranslations('ProfilePage');
    const router = useRouter();

    const hasMore = total > lists.length;
    const goToAllLists = () => router.push(`/profile/${userId}/lists`);

    return (
        <div className="mb-6">
            <div className="mb-6 flex items-center justify-between gap-4 border-b">
                <h2 className="mb-4 text-xl font-bold">{title}</h2>
                {withCreateButton && (
                    <div className="mb-4">
                        <CreateListButton userId={userId} />
                    </div>
                )}
            </div>
            {lists.length === 0 ? (
                <p className="text-muted-foreground">{emptyMessage}</p>
            ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
                    {lists.map((list) => (
                        <ListCard
                            key={list.id}
                            list={list}
                            userId={userId}
                        />
                    ))}
                    {hasMore && <SeeMoreListsCard onClick={goToAllLists} />}
                </div>
            )}
            {hasMore && (
                <div className="mt-4 sm:hidden">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        data-testid="see-more-lists-button"
                        onClick={goToAllLists}
                    >
                        {t('seeMore')}
                    </Button>
                </div>
            )}
        </div>
    );
}
