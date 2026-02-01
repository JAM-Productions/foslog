'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = (event: MediaQueryListEvent) =>
            setMatches(event.matches);

        // Set the initial value
        setMatches(mediaQuery.matches);

        // Add event listener for changes
        mediaQuery.addEventListener('change', handler);

        // Clean up event listener on unmount
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return matches;
}
