export default function Loading() {
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-card h-10 w-24 animate-pulse rounded-lg"></div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-6">
                    <div className="sm:col-span-3">
                        <div className="flex gap-3 sm:flex-col">
                            <div className="bg-muted relative aspect-[2/3] w-32 shrink-0 animate-pulse rounded-lg sm:w-full"></div>

                            <div className="bg-card w-full rounded-lg border shadow-sm">
                                <div className="flex flex-col gap-2 p-4 sm:gap-3 sm:p-5">
                                    <div className="space-y-1">
                                        <div className="bg-muted h-3 w-20 animate-pulse rounded sm:h-4"></div>
                                        <div className="bg-muted h-5 w-full animate-pulse rounded sm:h-6"></div>
                                    </div>
                                    <div className="bg-muted h-6 w-16 animate-pulse rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-9 lg:col-span-7">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="bg-muted h-8 w-32 animate-pulse rounded sm:h-9"></div>

                            <div className="bg-card rounded-lg border p-4 shadow-sm sm:p-6">
                                <div className="flex flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="bg-muted h-10 w-10 animate-pulse rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="bg-muted h-4 w-24 animate-pulse rounded"></div>
                                            <div className="bg-muted h-4 w-20 animate-pulse rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-col gap-1 sm:mt-4">
                                    <div className="bg-muted h-4 w-32 animate-pulse rounded"></div>
                                    <div className="mt-1 space-y-2">
                                        <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                                        <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                                        <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:hidden">
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <div className="bg-card h-9 w-full animate-pulse rounded-md border sm:w-24"></div>
                                    <div className="bg-card h-9 w-full animate-pulse rounded-md border sm:w-24"></div>
                                    <div className="bg-card h-9 w-full animate-pulse rounded-md border sm:w-24"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:col-span-2 lg:block">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="bg-muted h-8 w-24 animate-pulse rounded"></div>
                            <div className="bg-card h-9 w-full animate-pulse rounded-md border"></div>
                            <div className="bg-card h-9 w-full animate-pulse rounded-md border"></div>
                            <div className="bg-card h-9 w-full animate-pulse rounded-md border"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
