'use client';

import { useRef, useState } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useRouter } from 'next/navigation';

const UserMenu = () => {
    const menuRef = useRef<HTMLDivElement>(null);

    const { user, setUser } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);

    useClickOutside(menuRef, isOpen, setIsOpen);

    const router = useRouter();

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    if (!user) {
        return (
            <div
                className="flex items-center gap-2"
                ref={menuRef}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate('/login')}
                >
                    Log In
                </Button>
                <Button
                    size="sm"
                    onClick={() => handleNavigate('/signup')}
                >
                    Sign Up
                </Button>
            </div>
        );
    }

    return (
        <div
            className="relative"
            ref={menuRef}
        >
            <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2"
            >
                {user.image ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={user.image}
                            alt={user.name}
                            className="h-6 w-6 rounded-full"
                        />
                    </>
                ) : (
                    <User className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{user.name}</span>
            </Button>

            {isOpen && (
                <div className="bg-card absolute top-12 right-0 z-50 w-48 rounded-lg border shadow-lg">
                    <div className="border-b p-3">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-muted-foreground text-sm">
                            {user.email}
                        </p>
                    </div>
                    <div className="p-1">
                        <button className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm">
                            <Settings className="h-4 w-4" />
                            Settings
                        </button>
                        <button
                            onClick={() => {
                                setUser(null);
                                setIsOpen(false);
                            }}
                            className="hover:bg-accent hover:text-accent-foreground text-destructive flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
