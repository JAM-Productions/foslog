import { getUserListMetadata, getUserMediaListData } from '@/app/actions/user';
import { BackButton } from '@/components/button/back-button';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ListHeader } from '@/components/list/list-header.tsx';
import { ListMediaContent } from '@/components/list/list-media-content';
import { Metadata } from 'next';

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
}: {
    params: Promise<{ userId: string; listId: string }>;
}) {
    const { userId, listId } = await params;

    const t = await getTranslations('ListPage');

    let listData: Awaited<ReturnType<typeof getUserMediaListData>>;
    try {
        listData = await getUserMediaListData(userId, listId);
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
                <div className="mb-6">
                    <BackButton />
                </div>
                <ListHeader
                    listName={listData.name}
                    /* listImage={listData.image} */
                    itemCount={listData.mediaItems.length}
                    type={listData.type}
                    listUser={listData.user}
                />
                <ListMediaContent
                    listId={listId}
                    mediaItems={listData.mediaItems}
                    listUser={listData.user}
                />
            </div>
        </div>
    );
}
