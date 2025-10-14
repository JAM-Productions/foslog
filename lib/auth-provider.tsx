'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, type Session, type User } from '@/lib/auth-client';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(isPending);
    }, [isPending]);

    const value = {
        session: session || null,
        user: session?.user || null,
        isLoading,
        isAuthenticated: !!session?.user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
