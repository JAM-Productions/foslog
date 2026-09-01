import { getAllUserLists, getUserProfile } from '@/app/actions/user';
import { BackButton } from '@/components/button/back-button';
import { ListsManager } from '@/components/list/lists-manager';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ userId: string; locale: string }>;
}): Promise<Metadata> {
    const { userId, locale } = await params;
    const user = await getUserProfile(userId);
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.ListsPage',
    });

    if (!user) {
        return {
            title: t('userNotFound'),
        };
    }

    return {
        title: t('listsTitle', { name: user.name }),
        description: t('listsDescription', { name: user.name }),
    };
}

export default async function ListsPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const t = await getTranslations('ListsPage');

    let user: Awaited<ReturnType<typeof getUserProfile>>,
        lists: Awaited<ReturnType<typeof getAllUserLists>>;
    try {
        [user, lists] = await Promise.all([
            getUserProfile(userId),
            getAllUserLists(userId),
        ]);
    } catch (error) {
        console.error(
            `[ListsPage] Failed to load lists for userId: ${userId}`,
            error
        );
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-500">{t('loadError')}</div>
            </div>
        );
    }

    if (!user) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                    <BackButton />
                </div>

                <ListsManager
                    lists={lists}
                    userId={userId}
                    userName={user.name}
                />
            </div>
        </div>
    );
}
