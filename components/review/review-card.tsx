'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReview } from '@/lib/types';
import { User, ThumbsUp, ThumbsDown, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-provider';
import { Button } from '../button/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu';
import { useAppStore } from '@/lib/store';

export function ReviewCard({ review }: { review: SafeReview }) {
    const { user } = review;
    const router = useRouter();
    const t = useTranslations('MediaPage');
    const { session, isLoading } = useAuth();
    const isAuthor = !isLoading && session?.user?.id === user.id;
    const { openEditReviewModal, openDeleteReviewModal } = useAppStore();

    return (
        <Card
            className="p-4 transition-opacity duration-200 hover:opacity-80 sm:p-6"
            onClick={() => router.push(`/review/${review.id}`)}
        >
            <div className="flex flex-row items-start gap-3 sm:gap-4">
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/profile/${user.id}`);
                    }}
                    className="transition-opacity hover:opacity-80"
                >
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full"
                            unoptimized
                        />
                    ) : (
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full border">
                            <User className="h-7 w-7" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <p
                        className="text-base font-bold hover:underline"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/profile/${user.id}`);
                        }}
                    >
                        {user.name}
                    </p>
                    <div className="flex items-center gap-2">
                        {review.rating !== undefined &&
                            review.rating !== null && (
                                <RatingDisplay rating={review.rating} />
                            )}
                        {review.liked !== undefined &&
                            review.liked !== null && (
                                <div className="flex items-center gap-1">
                                    {review.liked ? (
                                        <>
                                            <ThumbsUp className="h-4 w-4 text-green-600" />
                                            <span className="text-muted-foreground text-sm">
                                                {t('like')}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <ThumbsDown className="h-4 w-4 text-red-600" />
                                            <span className="text-muted-foreground text-sm">
                                                {t('dislike')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                    </div>
                </div>
                {isAuthor && (
                    <div className="ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                onClick={(e) => e.stopPropagation()}
                                align="end"
                            >
                                <DropdownMenuItem
                                    onClick={() =>
                                        openEditReviewModal(
                                            review as unknown as Review
                                        )
                                    }
                                >
                                    {t('edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        openDeleteReviewModal(review.id)
                                    }
                                >
                                    {t('delete')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
            {review.review && (
                <p className="mt-3 text-base leading-relaxed sm:mt-4">
                    {review.review}
                </p>
            )}
        </Card>
    );
}
