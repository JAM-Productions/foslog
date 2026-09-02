'use client';

import { usePathname, useRouter } from 'next/navigation';

import { listSortIcons, type ListSortDirection } from '@/utils/list-sort';

export type { ListSortDirection, ListSortState } from '@/utils/list-sort';
export { getListSortState } from '@/utils/list-sort';

export interface ListSortButtonProps {
    /** Arrow shown for the column's current state. */
    direction: ListSortDirection;
    /** Sort value to apply on click; `null` restores the default order. */
    nextSort: string | null;
    label: string;
    testId: string;
    /** Renders the button as a labelled chip, for the mobile layout. */
    text?: string;
}

export function ListSortButton({
    direction,
    nextSort,
    label,
    testId,
    text,
}: ListSortButtonProps) {
    const router = useRouter();
    const pathname = usePathname();

    const Icon = listSortIcons[direction];
    const isActive = direction !== 'none';

    const handleClick = () => {
        const params = new URLSearchParams(window.location.search);

        if (nextSort) {
            params.set('sort', nextSort);
        } else {
            params.delete('sort');
        }
        // Reordering invalidates the current page.
        params.delete('page');

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    };

    const chipClasses = text
        ? `min-w-0 shrink gap-1.5 rounded-md border px-3 py-1.5 text-sm ${
              isActive ? 'border-primary' : 'border-input'
          }`
        : 'ml-1 align-middle';

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={label}
            title={label}
            data-testid={testId}
            data-direction={direction}
            className={`hover:text-foreground inline-flex cursor-pointer items-center transition-colors ${chipClasses} ${
                isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
        >
            {text && <span className="truncate">{text}</span>}
            <Icon className="h-4 w-4 shrink-0" />
        </button>
    );
}
