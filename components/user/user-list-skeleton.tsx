const UserListSkeleton = () => {
    return (
        <div className="mt-4">
            <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between border-b pb-2"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-accent h-10 w-10 animate-pulse rounded-full" />
                            <div className="bg-accent h-4 w-32 animate-pulse" />
                        </div>
                        <div className="bg-accent h-9 w-20 animate-pulse rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserListSkeleton;
