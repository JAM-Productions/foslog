'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReview } from '@/lib/types';
import { User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function ReviewCard({ review }: { review: SafeReview }) {
    const { user } = review;
    const router = useRouter();

    return (
        <Card
            className="cursor-pointer p-4 transition-opacity duration-200 hover:opacity-80 sm:p-6"
            onClick={() => router.push(`/review/${review.id}`)}
        >
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

            <p className="mt-3 text-base leading-relaxed sm:mt-4">
                {review.review}
            </p>
        </Card>
    );
}
