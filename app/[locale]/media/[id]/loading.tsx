export default function Loading() {
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                {/* Header with Back Button Skeleton */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-card h-10 w-24 animate-pulse rounded-lg"></div>
                </div>

                {/* Media Details Section Skeleton */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <div className="bg-card flex animate-pulse items-start gap-4 rounded-lg border p-4 md:gap-6">
                        <div className="bg-muted h-52 w-36 flex-shrink-0 animate-pulse rounded-lg"></div>
                        <div className="flex-1">
                            <div className="bg-muted mb-2 h-7 w-3/4 animate-pulse rounded"></div>
                            <div className="bg-muted mb-4 h-5 w-1/2 animate-pulse rounded"></div>
                            <div className="bg-muted h-20 w-full animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section Skeleton */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="bg-muted h-8 w-48 animate-pulse rounded"></div>
                    </div>
                    <div className="bg-card border-border h-24 animate-pulse rounded-lg border py-6 text-center sm:py-8"></div>
                </div>

                {/* Review Form Section Skeleton */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <div className="bg-muted mb-4 h-8 w-40 animate-pulse rounded sm:mb-6"></div>
                    <div className="bg-card border-border rounded-lg border p-4 sm:p-6 lg:p-8">
                        <div className="bg-muted h-32 w-full animate-pulse rounded"></div>
                        <div className="bg-primary mt-4 h-10 w-32 animate-pulse rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
