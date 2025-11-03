import { Card } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/rating';
import { mockUsers } from '@/lib/mock-data';
import { Review } from '@/lib/store';
import Image from 'next/image';

export function ReviewCard({ review }: { review: Review }) {
    const user = mockUsers.find((user) => user.id === review.userId);

    if (!user) {
        return null;
    }

    return (
        <Card className="p-4 sm:p-6">
            <div className="flex flex-row items-center gap-3 sm:gap-4">
                <Image
                    src={user.image!}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full"
                    unoptimized
                />
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
