'use client';

interface ToastProps {
    message: string;
    show: boolean;
}

export const Toast = ({ message, show }: ToastProps) => {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
            {message}
        </div>
    );
};
