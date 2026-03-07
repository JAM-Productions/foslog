'use client';

import { useRouter } from '@/i18n/navigation';
import { ListType } from '@prisma/client';
import { Bookmark, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export interface ListHeaderProps {
    listName: string;
    /* listImage?: string; */
    itemCount: number;
    type: ListType;
    listUser: {
        id: string;
        name: string;
        image?: string;
    };
}

export function ListHeader({
    listName,
    /* listImage, */
    itemCount,
    type,
    listUser,
}: ListHeaderProps) {
    const t = useTranslations('ProfilePage');
    const tLP = useTranslations('ListPage');
    const router = useRouter();
    const displayName = type === ListType.BOOKMARK ? t('bookmarked') : listName;

    return (
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:gap-4">
            {type === ListType.BOOKMARK && (
                <div className="flex h-48 w-48 items-center justify-center self-center rounded-lg bg-green-700 sm:self-auto">
                    <Bookmark className="h-12 w-12 fill-green-500 text-green-500" />
                </div>
            )}
            <div className="flex flex-col justify-normal gap-1 sm:h-48">
                <div className="flex flex-col justify-center sm:flex-1">
                    <p className="text-sm font-semibold">{tLP('list')}</p>
                    <h1 className="text-3xl font-bold sm:text-5xl">
                        {displayName}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            router.push(`/profile/${listUser.id}`);
                        }}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                        aria-label={t('viewProfile', { name: listUser.name })}
                    >
                        {listUser.image ? (
                            <Image
                                src={listUser.image}
                                alt={listUser.name}
                                width={40}
                                height={40}
                                className="h-7 w-7 rounded-full"
                                unoptimized
                            />
                        ) : (
                            <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full border">
                                <User className="h-4 w-4" />
                            </div>
                        )}
                    </button>
                    <p
                        className="cursor-pointer text-sm hover:underline"
                        onClick={() => {
                            router.push(`/profile/${listUser.id}`);
                        }}
                    >
                        {listUser.name}
                    </p>
                    <span className="text-sm">·</span>
                    <span className="text-sm">
                        {tLP('itemsAdded', { count: itemCount })}
                    </span>
                </div>
            </div>
        </div>
    );
}
