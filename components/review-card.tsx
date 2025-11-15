import { Card } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/rating';
import { SafeReview } from '@/lib/types';
import { User } from 'lucide-react';
import Image from 'next/image';

export function ReviewCard({ review }: { review: SafeReview }) {
    const { user } = review;

    return (
        <Card className="p-4 sm:p-6">
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
