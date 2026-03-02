'use client';

import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-provider';
import { ListType } from '@prisma/client';
import { Bookmark } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface MediaList {
    id: string;
    name: string;
    image?: string;
    type: ListType;
}

export function UserMediaLists({
    mediaLists,
    userId,
}: {
    mediaLists: MediaList[];
    userId: string;
}) {
    const router = useRouter();
    const t = useTranslations('ProfilePage');
    const { user: currentUser } = useAuth();

    const visibleLists = mediaLists.filter(
        (list) =>
            !(list.type === ListType.BOOKMARK && currentUser?.id !== userId)
    );
    return (
        <div className="mb-6">
            <div className="mb-6 flex items-center justify-between border-b">
                <h2 className="mb-4 text-xl font-bold">
                    {currentUser?.id === userId
                        ? t('yourLibrary')
                        : t('userLibrary')}
                </h2>
            </div>
            {visibleLists.length === 0 ? (
                <p className="text-muted-foreground">
                    {t('noLists', {
                        user:
                            currentUser?.id === userId
                                ? t('you')
                                : t('thisUser'),
                    })}
                </p>
            ) : (
                <div className="flex flex-col gap-4 sm:flex-row">
                    {visibleLists.map((list) => (
                        <div key={list.id}>
                            {list.type === ListType.BOOKMARK &&
                                currentUser?.id === userId && (
                                    <div className="flex items-center gap-4 sm:flex-col sm:gap-1">
                                        <button
                                            className="cursor-pointer rounded-lg bg-green-700 p-4 sm:p-6 lg:p-8"
                                            aria-label={t('bookmarked')}
                                            onClick={() =>
                                                router.push(
                                                    `/profile/${userId}/list/${list.id}`
                                                )
                                            }
                                        >
                                            <Bookmark className="h-5 w-5 fill-green-500 text-green-500 sm:h-7 sm:w-7" />
                                        </button>
                                        <span
                                            className="text-foreground cursor-pointer hover:underline sm:text-sm"
                                            onClick={() =>
                                                router.push(
                                                    `/profile/${userId}/list/${list.id}`
                                                )
                                            }
                                        >
                                            {t('bookmarked')}
                                        </span>
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
