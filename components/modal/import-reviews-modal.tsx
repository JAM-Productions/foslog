'use client';

import { useTranslations } from 'next-intl';
import Modal from './modal';
import { useRouter } from '@/i18n/navigation';
import { useImportReviewsModalStore } from '@/lib/import-reviews-modal-store';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useState } from 'react';
import { Button } from '../button/button';
import { XIcon, UploadCloudIcon } from 'lucide-react';
import Papa from 'papaparse';

type TabType = 'letterboxd' | 'steam' | 'goodreads';

export default function ImportReviewsModal() {
    const t = useTranslations('ImportReviewsModal');
    const router = useRouter();
    const { isModalOpen, hideModal } = useImportReviewsModalStore();
    const [activeTab, setActiveTab] = useState<TabType>('letterboxd');

    // Feature state
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);

    useBodyScrollLock(isModalOpen);

    const handleClose = () => {
        if (isImporting) return; // Prevent closing while importing
        hideModal();
        // Reset state after a short delay so the animation finishes first
        setTimeout(() => {
            setActiveTab('letterboxd');
            setFile(null);
            setIsParsing(false);
            setIsImporting(false);
            setProgress({ current: 0, total: 0 });
            setImportError(null);
            setImportSuccess(false);
        }, 300);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setImportError(null);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            setImportError(null);
        }
    };

    const processCSV = () => {
        if (!file) return;

        setIsParsing(true);
        setImportError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                setIsParsing(false);
                const rows = results.data;

                if (!rows || rows.length === 0) {
                    setImportError(t('letterboxd.noValidRows'));
                    return;
                }

                setIsImporting(true);
                setProgress({ current: 0, total: rows.length });

                // Process sequentially
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i] as any;

                    try {
                        const response = await fetch(
                            '/api/reviews/import/letterboxd',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(row),
                            }
                        );

                        if (!response.ok) {
                            const errorData = await response.json();
                            console.error(
                                'Error importing row',
                                i,
                                errorData.error
                            );
                        }
                    } catch (error) {
                        console.error('Network error importing row', i, error);
                    }

                    setProgress({ current: i + 1, total: rows.length });
                }

                setIsImporting(false);
                setImportSuccess(true);
                router.refresh();
            },
            error: (error) => {
                setIsParsing(false);
                setImportError(`Failed to parse CSV: ${error.message}`);
            },
        });
    };

    const renderLetterboxdTab = () => {
        const remainingSeconds = progress.total - progress.current;
        const remainingMinutes = Math.floor(remainingSeconds / 60);
        const remainingTimeText =
            remainingMinutes > 0
                ? `${remainingMinutes}m ${remainingSeconds % 60}s`
                : `${remainingSeconds}s`;

        return (
            <div className="animate-in fade-in zoom-in-95 flex h-full flex-1 flex-col gap-6 duration-200">
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <h4 className="mb-2 font-semibold">
                        {t('letterboxd.instructionsTitle')}
                    </h4>
                    <ol className="text-muted-foreground ml-1 list-inside list-decimal space-y-1">
                        <li>{t('letterboxd.step1')}</li>
                        <li>{t('letterboxd.step2')}</li>
                        <li>{t('letterboxd.step3')}</li>
                        <li>{t('letterboxd.step4')}</li>
                    </ol>
                </div>

                {!importSuccess && (
                    <div className="flex flex-1 flex-col gap-4">
                        <label
                            htmlFor="csv-upload"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors duration-200 ${
                                isDragging || file
                                    ? 'border-primary/50 bg-primary/5'
                                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                            } ${isImporting ? 'pointer-events-none cursor-not-allowed opacity-50' : ''} `}
                        >
                            <div className="flex flex-col items-center justify-center px-4 pt-5 pb-6 text-center">
                                <UploadCloudIcon className="text-muted-foreground mb-3 h-8 w-8" />
                                {file ? (
                                    <p className="text-primary text-sm font-medium break-all">
                                        {file.name}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        {t('letterboxd.dragAndDrop')}
                                    </p>
                                )}
                            </div>
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isImporting || isParsing}
                            />
                        </label>

                        {importError && (
                            <p className="text-sm font-medium text-red-500">
                                {importError}
                            </p>
                        )}

                        <div className="mt-auto w-full pt-4">
                            <Button
                                className="w-full"
                                disabled={!file || isParsing || isImporting}
                                onClick={processCSV}
                            >
                                {isImporting || isParsing
                                    ? t('letterboxd.importing')
                                    : t('importProfileButton')}
                            </Button>
                        </div>
                    </div>
                )}

                {isImporting && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                {t('letterboxd.uploading', {
                                    current: progress.current,
                                    total: progress.total,
                                })}
                            </span>
                            <span className="font-medium">
                                {Math.round(
                                    (progress.current / progress.total) * 100
                                )}
                                %
                            </span>
                        </div>
                        <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                            <div
                                className="bg-primary h-full transition-all duration-300 ease-out"
                                style={{
                                    width: `${(progress.current / progress.total) * 100}%`,
                                }}
                            />
                        </div>
                        <div className="text-muted-foreground mt-1 text-center text-xs">
                            {t('letterboxd.estimatedTime', {
                                time: remainingTimeText,
                            })}
                        </div>
                    </div>
                )}

                {importSuccess && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 rounded-lg bg-green-500/10 p-4 text-center text-green-600 dark:text-green-400">
                        <p className="font-medium">
                            {t('letterboxd.completed')}
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const renderComingSoonTab = (tab: TabType) => (
        <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center py-12 text-center duration-200">
            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl opacity-50">
                    {tab === 'steam' ? '🎮' : '📚'}
                </span>
            </div>
            <h3 className="mb-2 text-lg font-semibold">{t(`tabs.${tab}`)}</h3>
            <p className="text-muted-foreground">{t('comingSoon')}</p>
        </div>
    );

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="flex h-full w-full flex-col">
                <div className="relative mb-6 flex w-full flex-col items-center justify-between text-center">
                    <h1
                        id="modal-title"
                        className="text-2xl font-semibold"
                    >
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground mx-auto mt-2 max-w-[90%] text-sm">
                        {t('description')}
                    </p>
                    <Button
                        className="absolute right-0"
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        disabled={isImporting}
                        aria-label="Close"
                    >
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>

                <div className="mb-2 flex flex-1 flex-col">
                    <div className="mb-6 flex h-10 w-full items-center justify-start rounded-none border-b bg-transparent p-0">
                        {(
                            ['letterboxd', 'goodreads', 'steam'] as TabType[]
                        ).map((tab) => (
                            <button
                                key={tab}
                                onClick={() =>
                                    !isImporting && setActiveTab(tab)
                                }
                                disabled={isImporting}
                                className={`relative h-10 px-4 text-sm font-medium transition-colors ${
                                    activeTab === tab
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                } ${isImporting ? 'cursor-not-allowed opacity-50' : ''} `}
                            >
                                {t(`tabs.${tab}`)}
                                {activeTab === tab && (
                                    <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-1 flex-col">
                        {activeTab === 'letterboxd' && renderLetterboxdTab()}
                        {activeTab === 'steam' && renderComingSoonTab('steam')}
                        {activeTab === 'goodreads' &&
                            renderComingSoonTab('goodreads')}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
