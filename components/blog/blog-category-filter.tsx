'use client';

import { useTranslations } from 'next-intl';

interface BlogCategoryFilterProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

const categories = [
    'all',
    'releases',
    'films',
    'series',
    'games',
    'books',
    'music',
];

export default function BlogCategoryFilter({
    activeCategory,
    onCategoryChange,
}: BlogCategoryFilterProps) {
    const t = useTranslations('BlogPage.categories');

    return (
        <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        activeCategory === category
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    type="button"
                >
                    {t(category)}
                </button>
            ))}
        </div>
    );
}
