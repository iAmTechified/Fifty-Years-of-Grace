'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveMediaMetadata, getGalleryMedia } from '@/lib/firebase-services';
import { MediaItem } from '@/lib/types';
import Link from 'next/link';
import { UploadDropzone } from '@/lib/uploadthing';

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
        <main className="min-h-screen bg-[#0E0E10] text-[#F6F3EE] pt-32 pb-20 px-6">
            {/* Navigation Bar (Simplified) */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-[#0E0E10]/80 backdrop-blur-md">
                <Link href="/" className="font-serif text-xl md:text-2xl text-[#C7A24B]">OBELE @ 50</Link>
                <div className="flex gap-4">
                    <Link href="/" className="text-sm font-sans uppercase tracking-widest text-[#F6F3EE]/60 hover:text-[#C7A24B] transition-colors">Home</Link>
                </div>
            </nav>

            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h1 className="font-serif text-5xl md:text-7xl mb-4">The Gallery</h1>
                        <p className="text-[#F6F3EE]/60 max-w-xl font-sans font-light">
                            A collection of moments, memories, and captured joy.
                            Share your own snapshots to add to this living archive.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-[#C7A24B] text-[#0E0E10] px-8 py-4 uppercase text-xs tracking-[0.2em] font-bold hover:bg-[#D4B56A] transition-colors"
                    >
                        Upload Photo
                    </button>
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
                                <UploadDropzone
                                    endpoint="imageUploader"
                                    onClientUploadComplete={async (res) => {
                                        // Do something with the response
                                        console.log("Files: ", res);
                                        if (res && res[0]) {
                                            const file = res[0];
                                            await saveMediaMetadata(file.url, file.type || 'image/jpeg', caption, uploaderName);
                                            onUploadSuccess();
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        // Do something with the error.
                                        alert(`ERROR! ${error.message}`);
                                    }}
                                    appearance={{
                                        button: "bg-[#C7A24B] text-[#0E0E10] font-sans font-bold uppercase tracking-widest text-xs hover:bg-[#D4B56A]",
                                        container: "border-2 border-dashed border-[#F6F3EE]/20 rounded-lg p-0 hover:border-[#C7A24B] transition-colors",
                                        label: "text-[#C7A24B] hover:text-[#D4B56A]",
                                        allowedContent: "text-[#F6F3EE]/40"
                                    }}
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
