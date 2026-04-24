'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveMediaMetadata, getGalleryMedia } from '@/lib/firebase-services';
import { MediaItem } from '@/lib/types';
import Link from 'next/link';

export default function GalleryPage() {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const items = await getGalleryMedia();
            setMediaItems(items);
        } catch (error) {
            console.error("Error loading gallery:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#140309] text-[#F6F3EE] pt-32 pb-20 px-6">
            {/* Navigation Bar (Simplified) */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto flex justify-between items-center bg-[#140309]/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                <Link href="/" className="font-serif text-sm xs:text-base md:text-lg text-[#C7A24B] whitespace-nowrap mr-8">OBELE @ 50</Link>
                <Link href="/" className="text-[10px] xs:text-xs font-sans uppercase tracking-widest text-[#F6F3EE]/60 hover:text-[#C7A24B] transition-colors">Home</Link>
            </nav>

            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="w-full md:w-auto">
                        <h1 className="font-serif text-4xl xs:text-5xl md:text-7xl mb-4">The Gallery</h1>
                        <p className="text-[#F6F3EE]/60 max-w-xl font-sans font-light text-sm xs:text-base leading-relaxed">
                            A collection of moments, memories, and captured joy.
                            Share your own snapshots to add to this living archive.
                        </p>
                    </div>

                    <div className="w-full md:w-auto pt-4 md:pt-0">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="w-full md:w-auto bg-[#C7A24B] text-[#140309] px-8 py-4 uppercase text-xs tracking-[0.2em] font-bold hover:bg-[#D4B56A] transition-colors"
                        >
                            Upload Photo
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[40vh]">
                        <div className="w-8 h-8 border-2 border-[#C7A24B] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {mediaItems.map((item, index) => (
                            <motion.div
                                key={item.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative aspect-[4/5] overflow-hidden bg-[#1A1A1C] rounded-sm"
                            >
                                {item.type === 'video' ? (
                                    <video src={item.url} muted playsInline loop className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                                ) : (
                                    <img
                                        src={item.url}
                                        alt={item.caption || "Gallery Image"}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                    />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                    {item.caption && (
                                        <p className="font-sans text-sm text-[#F6F3EE] mb-1">{item.caption}</p>
                                    )}
                                    <p className="font-sans text-[10px] uppercase tracking-wider text-[#C7A24B]">
                                        Uploaded by {item.uploadedBy || 'Guest'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Validated/Hardcoded items for demo if empty */}
                        {mediaItems.length === 0 && (
                            <div className="col-span-full py-20 text-center opacity-40">
                                <p className="font-serif text-2xl mb-2">No moments shared yet.</p>
                                <p className="font-sans text-sm">Be the first to upload a memory.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={() => {
                    fetchMedia();
                    setIsUploadModalOpen(false);
                }}
            />
        </main>
    );
}

function UploadModal({ isOpen, onClose, onUploadSuccess }: { isOpen: boolean; onClose: () => void; onUploadSuccess: () => void }) {
    const [caption, setCaption] = useState('');
    const [uploaderName, setUploaderName] = useState('');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-md bg-[#141416] border border-[#F6F3EE]/10 p-8 shadow-2xl"
                    >
                        <h2 className="font-serif text-2xl mb-6 text-[#F6F3EE]">Share a Memory</h2>

                        <div className="space-y-5">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={uploaderName}
                                onChange={(e) => setUploaderName(e.target.value)}
                                className="w-full bg-transparent border-b border-[#F6F3EE]/20 py-2 text-[#F6F3EE] focus:border-[#C7A24B] outline-none placeholder:text-[#F6F3EE]/20"
                                required
                            />

                            <input
                                type="text"
                                placeholder="Caption (Optional)"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full bg-transparent border-b border-[#F6F3EE]/20 py-2 text-[#F6F3EE] focus:border-[#C7A24B] outline-none placeholder:text-[#F6F3EE]/20"
                            />

                            <div className="pt-4">
                                <FirebaseUpload
                                    uploaderName={uploaderName}
                                    caption={caption}
                                    onUploadSuccess={onUploadSuccess}
                                />
                            </div>
                        </div>

                        <button onClick={onClose} className="absolute top-4 right-4 text-[#F6F3EE]/40 hover:text-[#F6F3EE]">
                            ✕
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function FirebaseUpload({ uploaderName, caption, onUploadSuccess }: { uploaderName: string; caption: string; onUploadSuccess: () => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const { uploadMedia, saveMediaMetadata } = require('@/lib/firebase-services');

    const handleUpload = async (file: File) => {
        if (!uploaderName) {
            alert("Please enter your name first.");
            return;
        }

        setIsUploading(true);
        try {
            const url = await uploadMedia(file, (p: number) => setProgress(p));
            await saveMediaMetadata(url, file.type, caption, uploaderName);
            onUploadSuccess();
        } catch (error) {
            console.error(error);
            alert("Upload failed. Please check your connection.");
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div
            className={`
                relative border-2 border-dashed rounded-lg p-10 transition-colors flex flex-col items-center justify-center gap-4
                ${dragActive ? 'border-[#C7A24B] bg-[#C7A24B]/5' : 'border-[#F6F3EE]/20 hover:border-[#C7A24B]'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                disabled={isUploading}
            />

            {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-[#C7A24B] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-[#C7A24B] tracking-[0.2em]">{Math.round(progress)}%</p>
                </div>
            ) : (
                <>
                    <div className="w-12 h-12 bg-[#C7A24B]/10 rounded-full flex items-center justify-center text-[#C7A24B]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.587-1.587a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-[#C7A24B] font-bold text-xs tracking-widest uppercase mb-1">Choose File</p>
                        <p className="text-[#F6F3EE]/40 text-[10px] uppercase tracking-wider">or drag and drop</p>
                    </div>
                </>
            )}
        </div>
    );
}
