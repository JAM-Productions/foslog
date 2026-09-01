import {
    getOtherUserLists,
    getUserListMetadata,
    getUserMediaListData,
} from '@/app/actions/user';
import { BackButton } from '@/components/button/back-button';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ListMediaContent } from '@/components/list/list-media-content';
import { ListMediaFilters } from '@/components/list/list-media-filters';
import { ListOptions } from '@/components/list/list-options';
import { ListShareButton } from '@/components/list/list-share-button';
import { Metadata } from 'next';
import { ListHeader } from '@/components/list/list-header';
import { OtherLists } from '@/components/list/other-lists';
import Pagination from '@/components/pagination/pagination';
import { LIST_MEDIA_PAGE_SIZE } from '@/lib/constants';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ userId: string; listId: string; locale: string }>;
}): Promise<Metadata> {
    const { listId, locale } = await params;
    const listItem = await getUserListMetadata(listId);
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.ListPage',
    });

    if (!listItem) {
        return {
            title: t('listNotFound'),
        };
    }

    return {
        title: t('listTitle', {
            title: listItem.name,
        }),
        description: t('listDescription', {
            title: listItem.name,
            user: listItem.user.name,
        }),
    };
}

export default async function ListPage({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string; listId: string }>;
    searchParams: Promise<{
        page?: string;
        search?: string;
        type?: string;
        sort?: string;
    }>;
}) {
    const { userId, listId } = await params;
    const { page, search, type, sort } = await searchParams;
    const currentPage = Number(page) || 1;
    const query = search?.trim() ?? '';
    const mediaType = type && type !== 'all' ? type : '';
    const currentSort = sort ?? '';

    const t = await getTranslations('ListPage');

    let listData: Awaited<ReturnType<typeof getUserMediaListData>>,
        otherLists: Awaited<ReturnType<typeof getOtherUserLists>>;
    try {
        [listData, otherLists] = await Promise.all([
            getUserMediaListData(
                userId,
                listId,
                currentPage,
                LIST_MEDIA_PAGE_SIZE,
                query,
                mediaType,
                currentSort
            ),
            getOtherUserLists(userId, listId),
        ]);
    } catch (error) {
        console.error(
            `[ListPage] Failed to load list data for userId: ${userId}, listId: ${listId}`,
            error
        );
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-500">{t('loadError')}</div>
            </div>
        );
    }

    if (!listData) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <BackButton />
                    {/* No `overflow` here: it would clip the options dropdown,
                        which is positioned absolutely inside this row. */}
                    <div className="flex gap-2">
                        <ListShareButton
                            listId={listData.id}
                            listName={listData.name}
                            type={listData.type}
                            isPublic={listData.isPublic}
                            userId={userId}
                        />
                        <ListOptions
                            list={{
                                id: listData.id,
                                name: listData.name,
                                description: listData.description,
                                image: listData.image,
                                type: listData.type,
                                isPublic: listData.isPublic,
                            }}
                            userId={userId}
                        />
                    </div>
                </div>
                <ListHeader
                    listName={listData.name}
                    listImage={listData.image}
                    itemCount={listData.totalItems}
                    type={listData.type}
                    listUser={listData.user}
                />
                {/* `totalItems` ignores the filters, so the controls stay put
                    when a search returns nothing and only disappear on a
                    genuinely empty list. */}
                {listData.totalItems > 0 && <ListMediaFilters />}
                <ListMediaContent
                    listId={listId}
                    mediaItems={listData.mediaItems}
                    listUser={listData.user}
                    isFiltered={Boolean(query || mediaType)}
                    sort={currentSort}
                    hasItems={listData.totalItems > 0}
                />

                {listData.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination
                            currentPage={listData.currentPage}
                            totalPages={listData.totalPages}
                        />
                    </div>
                )}
                <OtherLists
                    lists={otherLists.lists}
                    total={otherLists.total}
                    userId={userId}
                />
            </div>
        </div>
    );
}
