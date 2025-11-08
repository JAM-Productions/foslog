import { useEffect, useState, useRef } from 'react';

export const useScrollDirection = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const difference = currentScrollY - lastScrollY.current;

                    // Only react to meaningful scroll changes (more than 5px)
                    if (Math.abs(difference) < 5) {
                        ticking.current = false;
                        return;
                    }

                    // Expand when near the top (< 50px)
                    if (currentScrollY < 50) {
                        setIsCollapsed(false);
                    }
                    // Collapse when scrolling down beyond 100px
                    else if (difference > 0 && currentScrollY > 100) {
                        setIsCollapsed(true);
                    }
                    // Expand when scrolling up significantly (to avoid flicker)
                    else if (difference < -10 && currentScrollY < 100) {
                        setIsCollapsed(false);
                    }

                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                });

                ticking.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []); // Empty dependency array - only set up once

    return isCollapsed;
};
