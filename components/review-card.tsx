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
        <Card className="p-4">
            <div className="flex items-center">
                <Image
                    src={user.image!}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full"
                />
                <div className="ml-4">
                    <p className="font-bold">{user.name}</p>
                    <RatingDisplay rating={review.rating} />
                </div>
            </div>
            <p className="mt-4">{review.review}</p>
        </Card>
    );
}
