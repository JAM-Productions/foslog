export default function Loading() {
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-card h-10 w-24 animate-pulse rounded-lg"></div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-12">
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="flex md:flex-col">
                            <div className="bg-muted relative aspect-[2/3] w-32 shrink-0 animate-pulse rounded-l-lg rounded-r-none md:w-full md:rounded-t-lg md:rounded-b-none"></div>

                            <div className="bg-card flex w-full flex-col rounded-l-none rounded-r-lg border border-l-0 shadow-sm md:rounded-t-none md:rounded-b-lg md:border-t-0 md:border-l">
                                <div className="flex flex-1 flex-col gap-2 p-4 sm:gap-3 sm:p-5">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="from-primary/0 via-primary/50 to-primary/0 h-px flex-1 bg-gradient-to-r" />
                                            <div className="bg-muted h-3 w-16 animate-pulse rounded"></div>
                                            <div className="from-primary/0 via-primary/50 to-primary/0 h-px flex-1 bg-gradient-to-r" />
                                        </div>
                                        <div className="bg-muted h-5 w-full animate-pulse rounded sm:h-6"></div>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        <div className="bg-muted h-5 w-12 animate-pulse rounded"></div>
                                        <div className="bg-muted h-5 w-16 animate-pulse rounded"></div>
                                    </div>

                                    <div className="mt-auto flex items-center gap-3">
                                        <div className="bg-muted h-4 w-12 animate-pulse rounded"></div>
                                        <div className="bg-muted ml-auto h-4 w-16 animate-pulse rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-8 lg:col-span-7">
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

                            <div className="mt-8 mb-8 lg:mb-10">
                                <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-muted h-8 w-32 animate-pulse rounded sm:h-9"></div>
                                        <div className="bg-muted h-6 w-12 animate-pulse rounded"></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="bg-card rounded-lg border p-4 shadow-sm sm:p-6"
                                        >
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-full"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-muted h-4 w-24 animate-pulse rounded"></div>
                                                        <div className="bg-muted h-3 w-20 animate-pulse rounded"></div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
                                                        <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8 sm:mb-12 lg:mb-16">
                                <div className="bg-muted mb-4 h-8 w-48 animate-pulse rounded sm:mb-6 sm:h-9"></div>
                                <div className="bg-card rounded-lg border p-4 shadow-sm sm:p-6 lg:p-8">
                                    <div className="space-y-4">
                                        <div className="bg-muted h-32 w-full animate-pulse rounded-md"></div>
                                        <div className="flex">
                                            <div className="bg-muted h-10 w-24 animate-pulse rounded-md"></div>
                                        </div>
                                    </div>
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
