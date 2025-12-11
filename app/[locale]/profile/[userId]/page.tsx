import {
    getUserProfile,
    getUserReviews,
    getUserStats,
} from '@/app/actions/user';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileReviewList } from '@/components/profile/profile-review-list';
import { BackButton } from '@/components/button/back-button';
import Pagination from '@/components/pagination/pagination';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ userId: string }>;
}): Promise<Metadata> {
    const { userId } = await params;
    const user = await getUserProfile(userId);

    if (!user) {
        return {
            title: 'User Not Found',
        };
    }

    return {
        title: `${user.name} - Profile`,
        description: `Check out ${user.name}'s profile and reviews on Foslog.`,
    };
}

export default async function ProfilePage({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { userId } = await params;
    const { page } = await searchParams;
    const currentPage = Number(page) || 1;
    const pageSize = 12;

    let user: Awaited<ReturnType<typeof getUserProfile>>,
        reviewsData: Awaited<ReturnType<typeof getUserReviews>>,
        stats: Awaited<ReturnType<typeof getUserStats>>;
    try {
        [user, reviewsData, stats] = await Promise.all([
            getUserProfile(userId),
            getUserReviews(userId, currentPage, pageSize),
            getUserStats(userId),
        ]);
    } catch (error) {
        console.error(`[ProfilePage] Failed to load profile for userId: ${userId}`, error);
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-500">
                    An error occurred while loading the profile. Please try again later.
                </div>
            </div>
        );
    }

    if (!user) {
        notFound();
    }

    const t = await getTranslations('ProfilePage');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                    <BackButton />
                </div>
                <ProfileHeader
                    user={user}
                    stats={stats}
                />

                <div className="mb-6 flex items-center justify-between border-b">
                    <h2 className="mb-4 text-xl font-bold">
                        {t('latestReviews')}
                    </h2>
                    <span className="text-muted-foreground text-sm">
                        Total: {reviewsData.total}
                    </span>
                </div>

                <ProfileReviewList reviews={reviewsData.reviews} />

                {reviewsData.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination
                            currentPage={reviewsData.currentPage}
                            totalPages={reviewsData.totalPages}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
