export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* back button skeleton */}
            <div className="mb-6">
                <div className="bg-card h-10 w-24 animate-pulse rounded-lg"></div>
            </div>

            {/* header skeleton */}
            <div className="flex animate-pulse flex-col items-start gap-8 sm:flex-row sm:items-end sm:gap-4">
                <div className="bg-muted h-48 w-48 self-center rounded-lg"></div>
                <div className="flex flex-1 flex-col justify-normal gap-1 sm:h-48">
                    <div className="flex flex-col justify-center sm:flex-1">
                        <div className="bg-muted mb-2 h-4 w-10 rounded"></div>
                        <div className="bg-muted h-8 w-72 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-muted flex h-7 w-7 items-center rounded-full"></div>
                        <div className="bg-muted h-4 w-60 rounded"></div>
                    </div>
                </div>
            </div>

            {/* media items skeleton */}
            <div className="mt-9.5">
                {/* mobile list skeleton */}
                <div className="flex flex-col gap-4 lg:hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex animate-pulse items-center gap-3"
                        >
                            <div className="bg-muted h-28 w-[4.75rem] rounded-sm" />
                            <div className="flex-1 space-y-2">
                                <div className="bg-muted h-4 w-3/4 rounded" />
                                <div className="bg-muted h-3 w-1/4 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* desktop table skeleton */}
                <div className="hidden lg:block">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="px-2 py-3">
                                    <div className="bg-muted h-4 w-24 rounded" />
                                </th>
                                <th className="px-2 py-3">
                                    <div className="bg-muted h-4 w-28 rounded" />
                                </th>
                                <th className="px-2 py-3">
                                    <div className="bg-muted h-4 w-24 rounded" />
                                </th>
                                <th className="px-2 py-3">
                                    <div className="bg-muted h-4 w-24 rounded" />
                                </th>
                                <th className="w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr
                                    key={i}
                                    className="animate-pulse border-b"
                                >
                                    <td className="flex items-center gap-3 px-2 py-3">
                                        <div className="bg-muted h-20 w-14 rounded" />
                                        <div className="bg-muted mt-2 h-4 w-40 rounded" />
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="bg-muted h-4 w-12 rounded" />
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="bg-muted h-4 w-12 rounded" />
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="bg-muted h-4 w-12 rounded" />
                                    </td>
                                    <td className="px-2 py-3"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
