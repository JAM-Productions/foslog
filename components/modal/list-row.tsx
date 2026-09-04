'use client';

import Image from 'next/image';
import { Bookmark, Check, Library, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ListType } from '@prisma/client';

import { Button } from '@/components/button/button';

export interface ListEntry {
    id: string;
    name: string;
    image?: string;
    type: ListType;
    totalItems: number;
    containsMedia: boolean;
}

interface ListRowProps {
    entry: ListEntry;
    label: string;
    isPending: boolean;
    onToggle: () => void;
    /** When given, the list name and image open the list page. */
    onNavigate?: () => void;
}

export function ListRow({
    entry,
    label,
    isPending,
    onToggle,
    onNavigate,
}: ListRowProps) {
    const t = useTranslations('AddToListModal');
    const isBookmark = entry.type === ListType.BOOKMARK;
    const rowKey = isBookmark ? 'bookmark' : entry.id;

    return (
        <div
            className="flex items-center justify-between gap-4 py-2"
            data-testid={`list-row-${rowKey}`}
        >
            <button
                type="button"
                className="group flex min-w-0 cursor-pointer items-center gap-3 text-left disabled:cursor-default"
                disabled={!onNavigate}
                onClick={onNavigate}
                data-testid={`navigate-${rowKey}`}
                aria-label={label}
            >
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md ${
                        isBookmark ? 'bg-green-700' : 'bg-muted border'
                    } ${onNavigate ? 'group-hover:opacity-80' : ''}`}
                >
                    {isBookmark ? (
                        <Bookmark className="h-5 w-5 fill-green-500 text-green-500" />
                    ) : entry.image ? (
                        <Image
                            src={entry.image}
                            alt={label}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                            unoptimized
                        />
                    ) : (
                        <Library className="h-5 w-5 text-gray-400" />
                    )}
                </div>
                <div className="flex min-w-0 flex-col">
                    <span
                        className={`truncate ${onNavigate ? 'group-hover:underline' : ''}`}
                    >
                        {label}
                    </span>
                    <span className="text-muted-foreground text-sm">
                        {t('itemsCount', { count: entry.totalItems })}
                    </span>
                </div>
            </button>
            <Button
                size="sm"
                variant={entry.containsMedia ? 'secondary' : 'outline'}
                disabled={isPending}
                onClick={onToggle}
                data-testid={`toggle-${rowKey}`}
                aria-pressed={entry.containsMedia}
            >
                {entry.containsMedia ? (
                    <>
                        <Check className="mr-2 h-4 w-4" />
                        {t('added')}
                    </>
                ) : (
                    <>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('add')}
                    </>
                )}
            </Button>
        </div>
    );
}
