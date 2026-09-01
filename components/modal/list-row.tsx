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
}

export function ListRow({
    entry,
    label,
    isPending,
    onToggle,
}: ListRowProps) {
    const t = useTranslations('AddToListModal');
    const isBookmark = entry.type === ListType.BOOKMARK;

    return (
        <div
            className="flex items-center justify-between gap-4 py-2"
            data-testid={`list-row-${isBookmark ? 'bookmark' : entry.id}`}
        >
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md ${
                        isBookmark ? 'bg-green-700' : 'bg-muted border'
                    }`}
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
                    <span className="truncate">{label}</span>
                    <span className="text-muted-foreground text-sm">
                        {t('itemsCount', { count: entry.totalItems })}
                    </span>
                </div>
            </div>
            <Button
                size="sm"
                variant={entry.containsMedia ? 'secondary' : 'outline'}
                disabled={isPending}
                onClick={onToggle}
                data-testid={`toggle-${isBookmark ? 'bookmark' : entry.id}`}
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
