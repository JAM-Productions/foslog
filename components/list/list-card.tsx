'use client';

import { useRouter } from '@/i18n/navigation';
import { SafeMediaList } from '@/lib/types';
import { ListType } from '@prisma/client';
import { Bookmark, Check, Library } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export interface ListCardProps {
    list: SafeMediaList;
    userId: string;
    /** Turns the card into a selection target instead of a link. */
    isSelecting?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

export function ListCard({
    list,
    userId,
    isSelecting = false,
    isSelected = false,
    onToggleSelect,
}: ListCardProps) {
    const router = useRouter();
    const t = useTranslations('ProfilePage');

    const isBookmark = list.type === ListType.BOOKMARK;
    const displayName = isBookmark ? t('bookmarked') : list.name;
    // The bookmark list cannot be deleted, so it is never selectable.
    const isSelectable = isSelecting && !isBookmark;

    const handleClick = () => {
        if (isSelecting) {
            if (isSelectable) onToggleSelect?.();
            return;
        }
        router.push(`/profile/${userId}/list/${list.id}`);
    };
    const goToList = handleClick;

    return (
        <div
            className={`group flex w-full items-center gap-4 sm:w-auto sm:flex-col sm:items-start sm:gap-1 ${
                isSelecting && !isSelectable ? 'opacity-50' : ''
            }`}
        >
            <button
                type="button"
                className={`ring-ring ring-offset-background relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-offset-2 transition group-has-[button:hover]:opacity-80 group-has-[button:hover]:ring-2 sm:h-24 sm:w-24 ${
                    isSelected ? 'ring-primary ring-2' : ''
                } ${isBookmark ? 'bg-green-700' : 'bg-muted border'}`}
                aria-label={displayName}
                aria-pressed={isSelectable ? isSelected : undefined}
                disabled={isSelecting && !isSelectable}
                data-testid={
                    isBookmark ? 'bookmark-list-button' : 'media-list-button'
                }
                onClick={goToList}
            >
                {isSelectable && (
                    <span
                        className={`absolute top-1 left-1 z-10 flex h-5 w-5 items-center justify-center rounded-sm border ${
                            isSelected
                                ? 'bg-primary border-primary'
                                : 'bg-background/80 border-input'
                        }`}
                        data-testid={`list-checkbox-${list.id}`}
                        data-checked={isSelected}
                    >
                        {isSelected && (
                            <Check
                                className="text-primary-foreground h-4 w-4"
                                strokeWidth={3}
                            />
                        )}
                    </span>
                )}
                {isBookmark ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <Bookmark className="h-5 w-5 fill-green-500 text-green-500 sm:h-7 sm:w-7" />
                    </div>
                ) : list.image ? (
                    <Image
                        src={list.image}
                        alt={displayName}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Library className="h-5 w-5 text-gray-400 sm:h-7 sm:w-7" />
                    </div>
                )}
            </button>
            <button
                type="button"
                data-testid={
                    isBookmark
                        ? 'bookmark-list-name-button'
                        : 'media-list-name-button'
                }
                disabled={isSelecting && !isSelectable}
                className="flex min-w-0 flex-1 cursor-pointer flex-col text-left sm:w-24 sm:flex-none"
                onClick={goToList}
            >
                <span className="text-foreground truncate group-has-[button:hover]:underline sm:text-sm">
                    {displayName}
                </span>
                <span className="text-muted-foreground text-sm sm:text-xs">
                    {t('itemsCount', { count: list.totalItems })}
                </span>
            </button>
        </div>
    );
}
