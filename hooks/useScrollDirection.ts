import { useEffect, useState } from 'react';

export const useScrollDirection = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Expand when near the top (< 50px)
            // Collapse when scrolling down beyond 100px
            // Expand when scrolling back up
            if (currentScrollY < 50) {
                setIsCollapsed(false);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsCollapsed(true);
            } else if (currentScrollY < lastScrollY) {
                setIsCollapsed(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return isCollapsed;
};
