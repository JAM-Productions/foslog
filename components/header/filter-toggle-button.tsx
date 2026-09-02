'use client';

import { ListFilterPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FilterToggleButtonProps {
    isFilterExpanded: boolean;
    onToggle: () => void;
}

export function FilterToggleButton({
    isFilterExpanded,
    onToggle,
}: FilterToggleButtonProps) {
    const t = useTranslations('ListPage');
    const label = isFilterExpanded ? t('collapseFilter') : t('expandFilter');

    return (
        <button
            type="button"
            onClick={onToggle}
            className="hover:bg-accent cursor-pointer rounded-md p-2 transition-colors"
            aria-label={label}
            title={label}
        >
            <ListFilterPlus
                className={`${isFilterExpanded ? 'text-primary' : ''} h-5 w-5`}
            />
        </button>
    );
}
