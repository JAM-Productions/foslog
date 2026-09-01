import { ListCardSkeleton } from '@/components/list/list-preview-row-skeleton';
import { Skeleton } from '@/components/skeleton';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back button skeleton */}
            <div className="mb-6">
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            {/* Title row skeleton */}
            <div className="mb-6 flex items-center justify-between gap-4 border-b">
                <Skeleton className="mb-4 h-8 w-56" />
                <Skeleton className="mb-4 h-9 w-32 rounded-md" />
            </div>

            {/* Lists skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                    <ListCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
}
