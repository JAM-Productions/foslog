import { useEffect, useState } from 'react';

export const useScrollDirection = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Expand when near the top (< 50px)
            if (currentScrollY < 50) {
                setIsCollapsed(false);
            } 
            // Collapse when scrolling down beyond 100px
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsCollapsed(true);
            } 
            // Expand when scrolling up AND we're below 100px threshold
            else if (currentScrollY < lastScrollY && currentScrollY < 100) {
                setIsCollapsed(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return isCollapsed;
};
