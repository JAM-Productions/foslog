export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Stats Carousel Skeleton */}
            <div className="mb-8 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    {/* Previous button skeleton */}
                    <div className="bg-muted h-9 w-9 animate-pulse rounded-md"></div>

                    {/* Card skeleton */}
                    <div className="bg-card w-full animate-pulse rounded-lg border p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="bg-muted h-4 w-4 animate-pulse rounded"></div>
                            <div className="bg-muted h-4 w-24 animate-pulse rounded"></div>
                        </div>
                        <div className="bg-muted mb-2 h-8 w-16 animate-pulse rounded"></div>
                        <div className="bg-muted h-3 w-32 animate-pulse rounded"></div>
                    </div>

                    {/* Next button skeleton */}
                    <div className="bg-muted h-9 w-9 animate-pulse rounded-md"></div>
                </div>

                {/* Slide indicators skeleton */}
                <div className="flex justify-center gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-muted h-2 w-2 animate-pulse rounded-full"
                        ></div>
                    ))}
                </div>
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
                        <div
                            key={i}
                            className="bg-card h-96 animate-pulse rounded-lg"
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
