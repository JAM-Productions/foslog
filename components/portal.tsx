'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const portalRoot =
        typeof document !== 'undefined'
            ? document.body.querySelector('#portal')
            : null;

    if (!portalRoot) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(
                'Portal root element with id "portal" not found in the document. Portal will not be rendered.'
            );
        }
        return null;
    }

    return mounted ? createPortal(<>{children}</>, portalRoot) : null;
};

export default Portal;
