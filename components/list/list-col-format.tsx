'use client';

import { useRouter } from '@/i18n/navigation';
import { MediaType } from '@/lib/store';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../button/button';
import { getListSortState, ListSortButton } from './list-sort-button';

export interface ListColFormatProps {
    mediaItems: {
        id: string;
        mediaId: string;
        createdAt: Date;
        media: {
            id: string;
            title: string;
            type: MediaType;
            year?: number;
            poster?: string;
        };
    }[];
    isOwner: boolean;
    openDeleteModal: (mediaId: string, mediaTitle: string) => void;
    /** True while a search is narrowing the list down. */
    isFiltered?: boolean;
    /** Current `sort` search param; empty means the default order. */
    sort?: string;
    /** False only when the list itself is empty, filters aside. */
    hasItems?: boolean;
}

export function ListColFormat({
    mediaItems,
    isOwner,
    openDeleteModal,
    isFiltered = false,
    sort = '',
    hasItems = true,
}: ListColFormatProps) {
    const tLP = useTranslations('ListPage');
    const tMediaType = useTranslations('MediaTypes');
    const router = useRouter();

    const { yearDirection, yearNextSort, addedDirection, addedNextSort } =
        getListSortState(sort);

    if (mediaItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4 text-center">
                    {isFiltered ? tLP('noSearchResults') : tLP('emptyList')}
                </p>
                {isOwner && !isFiltered && (
                    <Button onClick={() => router.push('/')}>
                        {tLP('searchMedia')}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {hasItems && (
                <div className="mb-2 flex items-center gap-2">
                    <ListSortButton
                        direction={yearDirection}
                        nextSort={yearNextSort}
                        label={tLP('sortByYearReleased')}
                        text={tLP('yearReleasedShort')}
                        testId="sort-year-released-mobile"
                    />
                    <ListSortButton
                        direction={addedDirection}
                        nextSort={addedNextSort}
                        label={tLP('sortByDateAdded')}
                        text={tLP('dateAddedShort')}
                        testId="sort-date-added-mobile"
                    />
                </div>
            )}
            {mediaItems.map(({ media, createdAt }) => (
                <div
                    key={media.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center justify-between gap-3 rounded-lg transition-colors"
                    onClick={() => router.push(`/media/${media.id}`)}
                >
                    {media.poster ? (
                        <img
                            src={media.poster}
                            alt={media.title}
                            className="h-28 w-[76px] rounded-sm object-cover"
                        />
                    ) : (
                        <div className="bg-muted flex h-28 w-[76px] items-center justify-center rounded-sm">
                            <span className="text-foreground text-sm font-bold">
                                {media.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="flex flex-1 gap-3">
                        <div className="flex flex-col justify-center gap-1">
                            <p className="line-clamp-2 text-base leading-tight font-semibold">
                                {media.title}
                            </p>
                            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                <span className="capitalize">
                                    {tMediaType(media.type)}
                                </span>
                                {media.year && (
                                    <>
                                        <span>·</span>
                                        <span>{media.year}</span>
                                    </>
                                )}
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {tLP('addedDate', {
                                    date: new Date(
                                        createdAt
                                    ).toLocaleDateString(),
                                })}
                            </p>
                        </div>
                    </div>
                    {isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            data-testid="delete-media-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(media.id, media.title);
                            }}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}
