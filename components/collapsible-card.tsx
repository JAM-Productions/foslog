'use client';

import { ChevronDownIcon } from 'lucide-react';
import { ReactNode, useId, useState } from 'react';

interface CollapsibleCardProps {
    title: string;
    children: ReactNode;
}

/**
 * A card whose body folds away on phones, where tall blocks push the rest of
 * the page out of reach. It starts closed there; from `sm` up the body is
 * always visible and the toggle is gone.
 */
export function CollapsibleCard({ title, children }: CollapsibleCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const contentId = useId();

    return (
        <div className="bg-card text-card-foreground h-full w-full rounded-lg border p-4 shadow-sm">
            <h3 className="font-semibold sm:hidden">
                <button
                    type="button"
                    onClick={() => setIsOpen((open) => !open)}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    className="flex w-full cursor-pointer items-center justify-between gap-2 text-left"
                >
                    <span className="min-w-0">{title}</span>
                    <ChevronDownIcon
                        className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>
            </h3>

            <h3 className="hidden font-semibold sm:block">{title}</h3>

            <div
                id={contentId}
                className={isOpen ? undefined : 'hidden sm:block'}
            >
                {children}
            </div>
        </div>
    );
}
