export default function Loading() {
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-card h-10 w-24 animate-pulse rounded-lg"></div>
                </div>

                <div className="mb-6 sm:mb-8">
                    <div className="bg-card rounded-lg border p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-muted h-10 w-10 flex-shrink-0 animate-pulse rounded-lg"></div>

                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="bg-muted h-3 w-20 animate-pulse rounded sm:h-4"></div>
                                <div className="bg-muted h-5 w-48 animate-pulse rounded sm:h-6"></div>
                            </div>

                            <div className="bg-muted h-6 w-16 animate-pulse rounded sm:h-7 sm:w-20"></div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <div className="bg-card rounded-lg border p-4 sm:p-6">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                            <div className="flex flex-row items-center gap-3 sm:gap-4">
                                <div className="bg-muted h-10 w-10 animate-pulse rounded-full"></div>

                                <div className="flex-1 space-y-2">
                                    <div className="bg-muted h-4 w-32 animate-pulse rounded"></div>
                                    <div className="bg-muted h-4 w-24 animate-pulse rounded"></div>
                                </div>
                            </div>

                            <div className="bg-muted h-4 w-32 animate-pulse rounded"></div>
                        </div>

                        <div className="mt-3 space-y-2 sm:mt-4">
                            <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                            <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                            <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                            <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
