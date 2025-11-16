import { Card } from '@/components/ui/card';

export default function MediaCardSkeleton() {
    return (
        <Card>
            <div className="p-0">
                {/* Image Skeleton */}
                <div className="bg-muted relative aspect-[2/3] animate-pulse rounded-t-lg"></div>

                {/* Content Skeleton */}
                <div className="p-4">
                    <div className="space-y-2">
                        {/* Title Skeleton */}
                        <div className="bg-muted h-5 w-3/4 animate-pulse rounded"></div>

                        {/* Creator Skeleton */}
                        <div className="bg-muted h-4 w-1/2 animate-pulse rounded"></div>

                        {/* Genres Skeleton */}
                        <div className="flex flex-wrap gap-1 pt-1">
                            <div className="bg-secondary h-5 w-12 animate-pulse rounded"></div>
                            <div className="bg-secondary h-5 w-16 animate-pulse rounded"></div>
                        </div>

                        {/* Rating and Reviews Skeleton */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="bg-muted h-4 w-20 animate-pulse rounded"></div>
                            <div className="bg-muted h-4 w-12 animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
