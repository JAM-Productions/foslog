'use client';

import { useAppStore } from '@/lib/store';
import { useTranslations } from 'next-intl';

const MediaTypeFilter = () => {
    const t = useTranslations('MediaTypes');
    const { selectedMediaType, setSelectedMediaType } = useAppStore();

    const mediaTypes = [
        { value: 'all', label: t('all'), icon: '🔍' },
        { value: 'film', label: t('films'), icon: '🎬' },
        { value: 'series', label: t('series'), icon: '📺' },
        { value: 'game', label: t('games'), icon: '🎮' },
        { value: 'book', label: t('books'), icon: '📚' },
        { value: 'music', label: t('music'), icon: '🎵' },
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
                    <span className="sm:mr-1.5">{type.icon}</span>
                    {type.label}
                </button>
            ))}
        </div>
    );
};

export default MediaTypeFilter;
