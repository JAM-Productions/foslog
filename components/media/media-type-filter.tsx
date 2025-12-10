'use client';

import { Book, Clapperboard, Gamepad2, Music, Search, Tv } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const MediaTypeFilter = () => {
    const t = useTranslations('MediaTypes');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedMediaType = searchParams.get('type') || 'all';

    const handleTypeChange = (type: string) => {
        const params = new URLSearchParams(window.location.search);

        if (type === 'all') {
            params.delete('type');
        } else {
            params.set('type', type);
        }

        params.delete('page');

        const newUrl = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;

        router.push(newUrl);
    };

    const mediaTypes = [
        { value: 'all', label: t('all'), Icon: Search },
        { value: 'film', label: t('films'), Icon: Clapperboard },
        { value: 'series', label: t('series'), Icon: Tv },
        { value: 'game', label: t('games'), Icon: Gamepad2 },
        { value: 'book', label: t('books'), Icon: Book },
        { value: 'music', label: t('music'), Icon: Music },
    ] as const;

    return (
        <div className="bg-muted flex items-center gap-1 overflow-x-auto rounded-lg p-1">
            {mediaTypes.map((type) => (
                <button
                    key={type.value}
                    onClick={() => handleTypeChange(type.value)}
                    className={[
                        'flex cursor-pointer flex-col items-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:flex-row',
                        selectedMediaType === type.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-primary hover:text-foreground hover:bg-background/50',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <type.Icon className="h-4 w-4 sm:mr-1.5" />
                    {type.label}
                </button>
            ))}
        </div>
    );
};

export default MediaTypeFilter;
