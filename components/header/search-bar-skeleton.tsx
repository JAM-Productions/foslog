import { Search, CornerDownRight } from 'lucide-react';
import { Skeleton } from '@/components/skeleton';

const SearchBarSkeleton = () => {
    return (
        <div className="flex w-full gap-2">
            <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Skeleton className="border-input h-10 w-full rounded-lg border" />
            </div>
            <div className="hover:bg-accent rounded-md p-2 transition-colors">
                <CornerDownRight className="text-muted-foreground h-5 w-5" />
            </div>
        </div>
    );
};

export default SearchBarSkeleton;
