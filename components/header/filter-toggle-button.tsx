'use client';

import { ListFilterPlus } from 'lucide-react';

interface FilterToggleButtonProps {
    isFilterExpanded: boolean;
    onToggle: () => void;
}

export function FilterToggleButton({
    isFilterExpanded,
    onToggle,
}: FilterToggleButtonProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="hover:bg-accent cursor-pointer rounded-md p-2 transition-colors"
            aria-label={isFilterExpanded ? 'Collapse filter' : 'Expand filter'}
            title={isFilterExpanded ? 'Collapse filter' : 'Expand filter'}
        >
            <ListFilterPlus
                className={`${isFilterExpanded ? 'text-primary' : ''} h-5 w-5`}
            />
        </button>
    );
}
