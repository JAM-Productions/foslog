import { Card } from '@/components/ui/card';
import { RatingDisplay } from '@/components/ui/rating';
import { mockUsers } from '@/lib/mock-data';

export function ReviewCard({ review }: { review: any }) {
    const user = mockUsers.find((user) => user.id === review.userId);

    if (!user) {
        return null;
    }

    return (
        <Card className="p-6 transition-shadow duration-200 hover:shadow-md">
            <div className="flex items-start gap-4">
                <img
                    src={user.image}
                    alt={user.name}
                    className="border-border h-12 w-12 flex-shrink-0 rounded-full border-2"
                />
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-foreground font-semibold">
                            {user.name}
                        </p>
                        <RatingDisplay
                            rating={review.rating}
                            size="sm"
                            showValue={false}
                        />
                    </div>
                    <p className="text-card-foreground leading-relaxed">
                        {review.review}
                    </p>
                </div>
            </div>
        </Card>
    );
}
