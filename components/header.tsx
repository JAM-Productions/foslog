import Image from 'next/image';
import MediaTypeFilter from '@/components/media-type-filter';
import ThemeToggle from '@/components/theme-toggle';
import UserMenu from '@/components/user-menu';
import SearchBar from '@/components/search-bar';

export default function Header() {
    return (
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center">
                            <Image
                                src="/favicon.svg"
                                alt="Foslog"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Foslog
                        </span>
                    </div>

                    {/* Search */}
                    <div className="mx-8 hidden max-w-md flex-1 md:flex">
                        <SearchBar />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="pb-4 md:hidden">
                    <SearchBar />
                </div>

                {/* Media Type Filter */}
                <div className="pb-4">
                    <MediaTypeFilter />
                </div>
            </div>
        </header>
    );
}
