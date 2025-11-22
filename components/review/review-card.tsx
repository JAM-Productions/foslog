import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReview } from '@/lib/types';
import { User } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export function ReviewCard({ review }: { review: SafeReview }) {
    const { user } = review;
    const locale = useLocale();

    const formatDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Link href={`/review/${review.id}`}>
            <Card className="p-4 transition-opacity duration-200 hover:opacity-80 sm:p-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <div className="flex flex-row items-center gap-3 sm:gap-4">
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
                        <div className="flex-1">
                            <p className="text-base font-bold">{user.name}</p>
                            <RatingDisplay rating={review.rating} />
                        </div>
                    </div>

                    <p className="text-muted-foreground text-sm sm:text-base">
                        {formatDate(review.createdAt)}
                    </p>
                </div>
                <p className="mt-3 text-base leading-relaxed sm:mt-4">
                    {review.review}
                </p>
            </Card>
        </Link>
    );
}
