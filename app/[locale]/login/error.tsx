'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container mx-auto flex h-full max-w-lg items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Login Failed</CardTitle>
                    <CardDescription>
                        An unexpected error occurred during login. Please try
                        again.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">{error.message}</p>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={reset}
                        variant="outline"
                    >
                        Try again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
