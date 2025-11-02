export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Section Skeleton */}
            <div className="mb-12">
                <div className="mb-2 h-8 w-1/2 animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="bg-card h-24 animate-pulse rounded-lg border p-4"></div>
                <div className="bg-card h-24 animate-pulse rounded-lg border p-4"></div>
                <div className="bg-card h-24 animate-pulse rounded-lg border p-4"></div>
            </div>

            {/* Media Grid Skeleton */}
            <div className="mb-8">
                {/* Section Header Skeleton */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-lg bg-muted"></div>
                    <div>
                        <div className="mb-2 h-6 w-48 animate-pulse rounded bg-muted"></div>
                        <div className="h-4 w-64 animate-pulse rounded bg-muted"></div>
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-card h-64 animate-pulse rounded-lg"
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
