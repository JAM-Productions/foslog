import { getFeedReviews } from '@/app/actions/feed';
import { BackButton } from '@/components/button/back-button';
import { FeedEmptyState } from '@/components/feed/feed-empty-state';
import { FeedFilterTabs } from '@/components/feed/feed-filter-tabs';
import { FeedList } from '@/components/feed/feed-list';
import Pagination from '@/components/pagination/pagination';
import { FeedFilter } from '@/lib/types';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.FeedPage',
    });

    return {
        title: t('title'),
        description: t('description'),
    };
}

export default async function FeedPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; filter?: string }>;
}) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const filter: FeedFilter =
        params.filter === 'following' ? 'following' : 'all';
    const t = await getTranslations('FeedPage');

    let feed: Awaited<ReturnType<typeof getFeedReviews>>;
    try {
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || '';
        const isMobile =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                userAgent
            );
        const pageSize = isMobile ? 8 : 12;
        feed = await getFeedReviews(currentPage, pageSize, filter);
    } catch (error) {
        console.error('[FeedPage] Failed to load the feed', error);
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-500">{t('loadError')}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                    <BackButton />
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>

                <div className="mb-6">
                    <FeedFilterTabs selectedFilter={filter} />
                </div>

                {feed.reviews.length === 0 ? (
                    <FeedEmptyState filter={filter} />
                ) : (
                    <FeedList reviews={feed.reviews} />
                )}

                {feed.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination
                            currentPage={feed.currentPage}
                            totalPages={feed.totalPages}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
