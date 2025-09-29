'use client';

import { useRef, useState } from 'react';
import { User, LogOut, Settings, SquareUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const UserMenu = () => {
    const tCTA = useTranslations('CTA');

    const menuUserRef = useRef<HTMLDivElement>(null);
    const menuNotUserRef = useRef<HTMLDivElement>(null);

    const { user, setUser } = useAppStore();
    const [isNotUserOpen, setIsNotUserOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);

    useClickOutside(menuNotUserRef, isNotUserOpen, setIsNotUserOpen);
    useClickOutside(menuUserRef, isUserOpen, setIsUserOpen);

    const router = useRouter();

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    if (!user) {
        return (
            <div
                className="relative flex items-center gap-2"
                ref={menuNotUserRef}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative block sm:hidden"
                    onClick={() => setIsNotUserOpen(!isNotUserOpen)}
                >
                    <SquareUser />
                </Button>
                <div className="hidden sm:inline">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNavigate('/login')}
                        >
                            {tCTA('signIn')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleNavigate('/signup')}
                        >
                            {tCTA('signUp')}
                        </Button>
                    </div>
                </div>
                {isNotUserOpen && (
                    <div className="bg-card absolute top-12 right-0 z-50 w-48 rounded-lg border shadow-lg">
                        <div className="p-1">
                            <button
                                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
                                onClick={() => {
                                    router.push('/login');
                                    setIsNotUserOpen(false);
                                }}
                            >
                                {tCTA('signIn')}
                            </button>
                            <button
                                onClick={() => {
                                    router.push('/signup');
                                    setIsNotUserOpen(false);
                                }}
                                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
                            >
                                {tCTA('signUp')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className="relative"
            ref={menuUserRef}
        >
            <Button
                variant="ghost"
                onClick={() => setIsUserOpen(!isUserOpen)}
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

            {isUserOpen && (
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
                            {tCTA('settings')}
                        </button>
                        <button
                            onClick={() => {
                                setUser(null);
                                setIsUserOpen(false);
                            }}
                            className="hover:bg-accent hover:text-accent-foreground text-destructive flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            {tCTA('signOut')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
