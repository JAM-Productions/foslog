export default function Loading() {
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-card h-10 w-24 animate-pulse rounded-lg"></div>
                </div>

                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col items-center gap-7 md:grid md:grid-cols-[1fr_auto] md:items-start">
                        <div className="bg-muted relative mt-2 aspect-[2/3] w-72 flex-shrink-0 animate-pulse rounded-lg md:order-2 md:mt-0"></div>

                        <div className="bg-card w-full self-stretch rounded-lg border p-4 sm:p-6 md:order-1 lg:p-8">
                            <div className="flex flex-col gap-4 sm:gap-6">
                                <div className="flex flex-col gap-2 sm:gap-3">
                                    <div className="bg-muted h-10 w-3/4 animate-pulse rounded lg:h-12"></div>
                                    <div className="flex flex-wrap gap-1">
                                        <div className="bg-muted h-6 w-20 animate-pulse rounded"></div>
                                        <div className="bg-muted h-6 w-16 animate-pulse rounded"></div>
                                        <div className="bg-muted h-6 w-24 animate-pulse rounded"></div>
                                    </div>
                                </div>

                                <div className="flex flex-row items-center gap-3 rounded-lg py-3 sm:gap-4">
                                    <div className="bg-muted h-6 w-32 animate-pulse rounded"></div>

                                    <div className="bg-muted h-5 w-24 animate-pulse rounded"></div>
                                </div>

                                <div>
                                    <div className="bg-muted mb-2 h-6 w-32 animate-pulse rounded sm:mb-3"></div>
                                    <div className="space-y-2">
                                        <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                                        <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                                        <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 flex flex-col sm:mb-12 lg:mb-16">
                    <div className="mb-4 sm:mb-6">
                        <div className="bg-muted h-8 w-32 animate-pulse rounded"></div>
                    </div>

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
