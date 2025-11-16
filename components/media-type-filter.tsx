'use client';

import { useAppStore } from '@/lib/store';
import {
    Book,
    Clapperboard,
    Gamepad2,
    Music,
    Search,
    Tv,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const MediaTypeFilter = () => {
    const t = useTranslations('MediaTypes');
    const { selectedMediaType, setSelectedMediaType } = useAppStore();

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
                    onClick={() => setSelectedMediaType(type.value)}
                    className={[
                        'flex flex-col items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-row',
                        selectedMediaType === type.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    <type.Icon className="sm:mr-1.5 h-4 w-4" />
                    {type.label}
                </button>
            ))}
        </div>
    );
};

export default MediaTypeFilter;
