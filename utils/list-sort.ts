import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export type ListSortDirection = 'none' | 'asc' | 'desc';

export interface ListSortState {
    yearDirection: ListSortDirection;
    yearNextSort: string | null;
    addedDirection: ListSortDirection;
    addedNextSort: string | null;
}

/**
 * Shared by the desktop table headers and the mobile controls so both cycle
 * through exactly the same states.
 *
 * Release date: default -> newest first -> oldest first -> default.
 * Date added: default (newest first) -> oldest first -> default.
 */
export function getListSortState(sort: string): ListSortState {
    return {
        yearDirection:
            sort === 'year-desc'
                ? 'desc'
                : sort === 'year-asc'
                  ? 'asc'
                  : 'none',
        yearNextSort:
            sort === 'year-desc'
                ? 'year-asc'
                : sort === 'year-asc'
                  ? null
                  : 'year-desc',
        addedDirection:
            sort === 'added-asc' ? 'asc' : sort === '' ? 'desc' : 'none',
        addedNextSort: sort === 'added-asc' ? null : 'added-asc',
    };
}

export const listSortIcons = {
    none: ArrowUpDown,
    asc: ArrowUp,
    desc: ArrowDown,
} as const;
