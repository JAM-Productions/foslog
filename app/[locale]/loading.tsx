import MediaCardSkeleton from '@/components/media-card-skeleton';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Stats Cards Skeleton */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-card h-28 animate-pulse rounded-lg border p-4"
                    ></div>
                ))}
            </div>

            {/* Media Grid Skeleton */}
            <div className="mb-8">
                {/* Section Header Skeleton */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="bg-muted h-12 w-12 animate-pulse rounded-lg"></div>
                    <div>
                        <div className="bg-muted mb-2 h-6 w-48 animate-pulse rounded"></div>
                        <div className="bg-muted h-4 w-64 animate-pulse rounded"></div>
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <MediaCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
