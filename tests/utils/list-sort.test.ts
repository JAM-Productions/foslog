import { describe, expect, it } from 'vitest';

import { getListSortState } from '@/utils/list-sort';

describe('list-sort utils', () => {
    it('maps the release date state to the next sort cycle', () => {
        expect(getListSortState('year-desc')).toEqual({
            yearDirection: 'desc',
            yearNextSort: 'year-asc',
            addedDirection: 'none',
            addedNextSort: 'added-asc',
        });

        expect(getListSortState('year-asc')).toEqual({
            yearDirection: 'asc',
            yearNextSort: null,
            addedDirection: 'none',
            addedNextSort: 'added-asc',
        });

        expect(getListSortState('')).toEqual({
            yearDirection: 'none',
            yearNextSort: 'year-desc',
            addedDirection: 'desc',
            addedNextSort: 'added-asc',
        });
    });

    it('keeps the date-added state consistent with default ordering', () => {
        expect(getListSortState('added-asc')).toEqual({
            yearDirection: 'none',
            yearNextSort: 'year-desc',
            addedDirection: 'asc',
            addedNextSort: null,
        });
    });
});
