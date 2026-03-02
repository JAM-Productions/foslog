'use client';

import { useRouter } from '@/i18n/navigation';
import { MediaType } from '@/lib/store';
import { Bookmark, Trash2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '../button/button';
import { useAuth } from '@/lib/auth/auth-provider';

export interface ListTableFormatProps {
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
}

export function ListTableFormat({
    mediaItems,
    isOwner,
    openDeleteModal,
}: ListTableFormatProps) {
    const tLP = useTranslations('ListPage');
    const tMediaType = useTranslations('MediaTypes');
    const router = useRouter();
    const { user: currentUser } = useAuth();

    return (
        <table className="w-full">
            <thead>
                <tr className="border-b">
                    <th className="px-2 py-3 text-left text-sm font-semibold">
                        {tLP('name')}
                    </th>
                    <th className="px-2 py-3 text-left text-sm font-semibold">
                        {tLP('yearReleased')}
                    </th>
                    <th className="px-2 py-3 text-left text-sm font-semibold">
                        {tLP('type')}
                    </th>
                    <th className="px-2 py-3 text-left text-sm font-semibold">
                        {tLP('dateAdded')}
                    </th>
                    {isOwner && <th className="w-16"></th>}
                </tr>
            </thead>
            <tbody>
                {mediaItems.length === 0 ? (
                    <tr>
                        <td
                            colSpan={isOwner ? 5 : 4}
                            className="py-12 text-center"
                        >
                            <p className="text-muted-foreground mb-4">
                                {tLP('emptyList')}
                            </p>
                            {isOwner && (
                                <Button onClick={() => router.push('/')}>
                                    {tLP('searchMedia')}
                                </Button>
                            )}
                        </td>
                    </tr>
                ) : (
                    mediaItems.map(({ media, createdAt }) => (
                        <tr
                            key={media.id}
                            className="hover:bg-muted/50 border-b transition-colors"
                        >
                            <td className="px-2 py-3">
                                <div className="flex items-center gap-3">
                                    <button
                                        className="cursor-pointer"
                                        aria-label={media.title}
                                        onClick={() => {
                                            router.push(`/media/${media.id}`);
                                        }}
                                    >
                                        {media.poster ? (
                                            <img
                                                src={media.poster}
                                                alt={media.title}
                                                className="h-20 w-14 rounded-sm object-cover transition-opacity duration-200 hover:opacity-85"
                                            />
                                        ) : (
                                            <div className="bg-muted flex h-20 w-14 items-center justify-center rounded-sm">
                                                <span className="text-foreground text-sm font-bold">
                                                    {media.title
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                    <div className="max-w-xs">
                                        <p
                                            className="line-clamp-1 cursor-pointer font-semibold hover:underline"
                                            onClick={() => {
                                                router.push(
                                                    `/media/${media.id}`
                                                );
                                            }}
                                        >
                                            {media.title}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-2 py-3 text-sm capitalize">
                                {media.year ? media.year : tLP('unknown')}
                            </td>
                            <td className="px-2 py-3 text-sm capitalize">
                                {tMediaType(media.type)}
                            </td>
                            <td className="px-2 py-3 text-sm">
                                {new Date(createdAt).toLocaleDateString()}
                            </td>
                            {isOwner && (
                                <td className="px-2 py-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            openDeleteModal(
                                                media.id,
                                                media.title
                                            )
                                        }
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}
