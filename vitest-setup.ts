import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

beforeEach(() => {
    const portal = document.createElement('div');
    portal.id = 'portal';
    document.body.appendChild(portal);
    vi.clearAllMocks();
});
