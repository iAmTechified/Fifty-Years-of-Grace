'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { addBirthdayNote, getBirthdayNotes, getGalleryMedia } from '@/lib/firebase-services';
import { BirthdayNote, MediaItem } from '@/lib/types';

// --- TYPES ---
// --- TYPES ---
interface Wish {
    id: string;
    name: string;
    message: string;
}

interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    rotation: number;
    scale: number;
    type: 'throwback' | 'recent';
}

// --- DATA ---
// --- DATA ---
const FALLBACK_IMAGES: GalleryImage[] = [
    { id: 'f1', src: './Mrs. Obele Akinniranye Close Up Shot.jpg', alt: 'Mrs. Obele Akinniranye Throwback Photo', rotation: -2, scale: 1, type: 'throwback' },
    { id: 'f2', src: './Mrs. Obele Akinniranye selfie.jpg', alt: 'Mr. Obele Akinniranye Throwback Photo', rotation: 3, scale: 0.95, type: 'throwback' },
    { id: 'f3', src: './Mrs. Obele Akinniranye selfie 2.jpg', alt: 'Mrs. Obele Akinniranye Throwback Photo', rotation: -1, scale: 1.05, type: 'throwback' },
    { id: 'f4', src: './Mrs. Obele Akinniranye selfie 3.jpg', alt: 'Mr. Obele Akinniranye Throwback Photo', rotation: 2, scale: 0.9, type: 'throwback' },
    { id: 'f5', src: './Mrs. Obele Akinniranye smiling selfie.jpg', alt: 'Mrs. Obele Akinniranye Throwback Photo', rotation: -3, scale: 1, type: 'throwback' },
];

export default function Moments() {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { margin: "-10% 0px -10% 0px", once: true });

    // State
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(FALLBACK_IMAGES);

    // UI State
    const [showPrompt, setShowPrompt] = useState(false);
    const [showWishModal, setShowWishModal] = useState(false);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
    const [showNoteDetailModal, setShowNoteDetailModal] = useState<Wish | null>(null);
    const [hasPrompted, setHasPrompted] = useState(false);

    // Carousel State
    const [currentWishIndex, setCurrentWishIndex] = useState(0);

    // --- DATA FETCHING ---
    useEffect(() => {
        const loadData = async () => {
            // 1. Fetch Wishes
            const notes = await getBirthdayNotes();
            const validNotes = notes.filter(n => !n.isPrivate);

            const formattedWishes = validNotes.map(note => ({
                id: note.id || Math.random().toString(),
                name: note.authorName,
                message: note.message
            }));

            if (formattedWishes.length > 0) {
                setWishes(formattedWishes);
            } else {
                setWishes([
                    { id: '1', name: 'Chisom', message: 'Happy 50th! You are a beacon of grace.' },
                    { id: '2', name: 'Tunde & Fam', message: 'Wishing you overflowing joy today.' },
                    { id: '3', name: 'Adaora', message: 'To a timeless soul, happy birthday!' },
                ]);
            }

            // 2. Fetch Gallery
            const media = await getGalleryMedia();
            const fetchedImages: GalleryImage[] = media
                .filter(m => m.type === 'image')
                .map((m, i) => ({
                    id: m.id || i.toString(),
                    src: m.url,
                    alt: m.caption || "Gallery Image",
                    rotation: (i % 2 === 0 ? -2 : 2), // Simple alternating rotation
                    scale: 1,
                    type: 'recent'
                }));

            // Merge with placeholders if needed to fill grid (aiming for at least 5 for the layout)
            if (fetchedImages.length < 5) {
                const needed = 5 - fetchedImages.length;
                const placeholders = FALLBACK_IMAGES.slice(0, needed);
                setGalleryImages([...fetchedImages, ...placeholders]);
            } else {
                setGalleryImages(fetchedImages.slice(0, 8)); // Limit to first 8 for display
            }
        };

        loadData();
    }, []);

    // --- CAROUSEL LOGIC ---
    useEffect(() => {
        if (wishes.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentWishIndex(prev => (prev + 1) % wishes.length);
        }, 5000); // 5 seconds per slide

        return () => clearInterval(interval);
    }, [wishes.length]);

    const nextWish = () => {
        setCurrentWishIndex(prev => (prev + 1) % wishes.length);
    };

    const prevWish = () => {
        setCurrentWishIndex(prev => (prev - 1 + wishes.length) % wishes.length);
    };

    // --- WISH TRIGGER LOGIC ---
    useEffect(() => {
        if (isInView && !hasPrompted) {
            const timer = setTimeout(() => {
                // Check session storage if needed, for this demo we just use local component state
                // assuming "session" means this page load for now.
                const alreadyPrompted = sessionStorage.getItem('wishPromptShown');
                if (!alreadyPrompted) {
                    setShowPrompt(true);
                    setHasPrompted(true);
                    sessionStorage.setItem('wishPromptShown', 'true');
                }
            }, 2000); // 2s dwell time
            return () => clearTimeout(timer);
        }
    }, [isInView, hasPrompted]);

    const handleOpenWishForm = () => {
        setShowPrompt(false);
        setShowWishModal(true);
    };

    const handleDismissPrompt = () => {
        setShowPrompt(false);
    };

    const handleAddWish = async (name: string, message: string) => {
        try {
            await addBirthdayNote({
                authorName: name,
                message: message,
                isPrivate: false
            });

            // Optimistically update UI
            const newWish: Wish = {
                id: Date.now().toString(),
                name,
                message,
            };
            setWishes(prev => [newWish, ...prev]);
            setShowWishModal(false);
        } catch (error) {
            console.error("Failed to add note", error);
            // Optionally show error toast
            alert("Could not send note at this time.");
        }
    };

    return (
        <section
            ref={containerRef}
            className="relative w-full min-h-screen py-32 bg-[#140309] text-[#F6F3EE] overflow-hidden"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24">

                {/* --- LEFT: GALLERY CLUSTER --- */}
                <div className="w-full lg:w-3/5 relative min-h-[600px]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ duration: 1 }}
                        className="relative w-full h-full"
                    >
                        {/* Artistic placement of images */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 auto-rows-[200px] md:auto-rows-[300px]">
                            {galleryImages.map((img, i) => (
                                <motion.div
                                    key={img.id}
                                    className={`relative w-full h-full overflow-hidden rounded-md filter grayscale-[30%] hover:grayscale-0 transition-all duration-700 ease-out cursor-pointer
                                    ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                                    ${i === 1 ? 'md:mt-8 md:-ml-4' : ''}
                                    ${i === 2 ? 'md:mt-16 md:ml-4' : ''}
                                    ${i === 3 ? 'md:-mt-8 md:ml-8' : ''}
                                    ${i > 4 ? 'hidden' : ''} 
                                `}
                                    style={{
                                        transform: `rotate(${img.rotation}deg) scale(${img.scale})`,
                                    }}
                                    whileHover={{
                                        scale: 1.02,
                                        rotate: 0,
                                        zIndex: 10
                                    }}
                                    initial={{ opacity: 0, y: 50, rotate: img.rotation * 2 }}
                                    animate={isInView ? { opacity: 1, y: 0, rotate: img.rotation } : {}}
                                    transition={{ duration: 1.2, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                                    onClick={() => setActiveGalleryIndex(i)}
                                >
                                    <img
                                        src={img.src}
                                        alt={img.alt}
                                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                                    />
                                    {img.type === 'throwback' && (
                                        <div className="absolute top-4 left-4 font-sans text-[10px] tracking-widest uppercase bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[#F6F3EE]/80">
                                            Throwback
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ZoomIn className="w-8 h-8 text-white/80" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Gallery CTA */}
                        <div className="mt-12 text-center lg:text-left">
                            <button
                                onClick={() => setActiveGalleryIndex(0)}
                                className="text-sm font-sans tracking-[0.2em] uppercase text-[#C7A24B] hover:text-[#F6F3EE] transition-colors duration-300 border-b border-[#C7A24B]/30 hover:border-[#F6F3EE] pb-1"
                            >
                                View Full Gallery ({galleryImages.length})
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* --- RIGHT: WISHES WALL --- */}
                <div className="w-full lg:w-2/5 flex flex-col relative">
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 1 }}
                        className="font-serif text-3xl md:text-4xl text-[#F6F3EE] mb-12"
                    >
                        Notes & Wishes
                    </motion.h3>

                    <div className="flex flex-col gap-6">
                        {/* Carousel Container */}
                        <div className="relative h-[280px] w-full">
                            <AnimatePresence mode='wait'>
                                {wishes.length > 0 && (
                                    <motion.div
                                        key={currentWishIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5 }}
                                        onClick={() => setShowNoteDetailModal(wishes[currentWishIndex])}
                                        className="absolute inset-0 bg-[#F6F3EE]/[0.03] backdrop-blur-sm p-8 border border-[#F6F3EE]/10 rounded-md cursor-pointer hover:bg-[#F6F3EE]/[0.05] transition-colors"
                                    >
                                        <div className="h-full flex flex-col justify-between">
                                            <p className="font-sans text-[#F6F3EE]/90 text-xl leading-relaxed font-light line-clamp-5">
                                                "{wishes[currentWishIndex].message}"
                                            </p>
                                            <p className="font-serif italic text-[#C7A24B] text-lg text-right mt-4">
                                                — {wishes[currentWishIndex].name}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={prevWish}
                                    className="p-2 border border-[#F6F3EE]/20 rounded-full text-[#F6F3EE]/60 hover:text-[#C7A24B] hover:border-[#C7A24B] transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextWish}
                                    className="p-2 border border-[#F6F3EE]/20 rounded-full text-[#F6F3EE]/60 hover:text-[#C7A24B] hover:border-[#C7A24B] transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <motion.button
                                onClick={handleOpenWishForm}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 text-[#F6F3EE]/60 hover:text-[#C7A24B] transition-colors group text-sm font-light"
                            >
                                <span className="w-8 h-8 rounded-full border border-[#F6F3EE]/20 flex items-center justify-center group-hover:border-[#C7A24B] transition-colors">
                                    +
                                </span>
                                Leave a Birthday Note
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PROMPT MODAL (Slide-up card) --- */}
            <AnimatePresence>
                {showPrompt && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="fixed bottom-8 right-8 z-50 max-w-sm w-full bg-[#1A1A1C] border border-[#F6F3EE]/10 p-6 shadow-2xl rounded-sm"
                    >
                        <p className="font-serif text-xl text-[#F6F3EE] mb-4">
                            Would you like to send Obele a birthday wish?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleOpenWishForm}
                                className="flex-1 bg-[#C7A24B] text-[#140309] py-2 px-4 text-sm font-semibold hover:bg-[#D4B56A] transition-colors"
                            >
                                Yes, I’d love to
                            </button>
                            <button
                                onClick={handleDismissPrompt}
                                className="flex-1 bg-transparent border border-[#F6F3EE]/20 text-[#F6F3EE]/60 py-2 px-4 text-sm hover:text-[#F6F3EE] hover:border-[#F6F3EE] transition-all"
                            >
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- SUBMISSION FORM MODAL --- */}
            <AnimatePresence>
                {showWishModal && (
                    <WishFormModal onClose={() => setShowWishModal(false)} onSubmit={handleAddWish} />
                )}
            </AnimatePresence>

            {/* --- GALLERY MODAL --- */}
            <AnimatePresence>
                {activeGalleryIndex !== null && (
                    <GalleryModal
                        images={galleryImages}
                        initialIndex={activeGalleryIndex}
                        onClose={() => setActiveGalleryIndex(null)}
                    />
                )}
            </AnimatePresence>

            {/* --- NOTE DETAIL MODAL --- */}
            <AnimatePresence>
                {showNoteDetailModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNoteDetailModal(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            layoutId={`note-detail`} // Simple transition for now
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-[#141416] max-h-[80vh] flex flex-col overflow-y-hidden p-8 md:p-12 border border-[#F6F3EE]/10 shadow-2xl"
                        >
                            <button
                                onClick={() => setShowNoteDetailModal(null)}
                                className="absolute top-4 right-4 p-2 text-[#F6F3EE]/50 hover:text-[#F6F3EE]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="text-center max-h-[100%] flex flex-col overflow-y-hidden">
                                <div className="w-16 h-16 mx-auto bg-[#C7A24B]/10 rounded-full flex items-center justify-center text-3xl font-serif text-[#C7A24B] mb-6">
                                    {showNoteDetailModal.name.charAt(0)}
                                </div>
                                <p className="font-sans italic text-lg text-[#F6F3EE] leading-relaxed mb-6 max-h-[100%] overflow-y-auto">
                                    "{showNoteDetailModal.message}"
                                </p>
                                <p className="text-[#C7A24B] text-sm uppercase tracking-widest">
                                    From {showNoteDetailModal.name}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}

// --- SUB-COMPONENTS ---

function WishFormModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (name: string, msg: string) => void }) {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !message) return;

        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit(name, message);
            setIsSubmitting(false);
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-[#140309] border border-[#F6F3EE]/10 p-8 md:p-12 shadow-2xl"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-[#F6F3EE]/40 hover:text-[#F6F3EE] text-xl"
                >✕</button>

                <h3 className="font-serif text-3xl text-[#F6F3EE] mb-2">Send a Birthday Note</h3>
                <p className="font-sans text-[#F6F3EE]/60 text-sm mb-8">Your message will be sent directly to Obele.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#C7A24B] mb-2">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#140309] border-b border-[#F6F3EE]/20 focus:border-[#C7A24B] text-[#F6F3EE] py-3 text-lg outline-none transition-colors placeholder:text-[#F6F3EE]/20"
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#C7A24B] mb-2">Your Wish</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-[#140309] border-b border-[#F6F3EE]/20 focus:border-[#C7A24B] text-[#F6F3EE] py-3 text-lg outline-none transition-colors min-h-[120px] resize-none placeholder:text-[#F6F3EE]/20"
                            placeholder="Write a warm note..."
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[#F6F3EE]/60 hover:text-[#F6F3EE] text-sm uppercase tracking-widest px-6"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#C7A24B] text-[#140309] py-3 px-8 text-sm font-bold uppercase tracking-widest hover:bg-[#D4B56A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Note'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

const GalleryModal = ({ images, initialIndex, onClose }: { images: GalleryImage[], initialIndex: number, onClose: () => void }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const nextImage = () => setCurrentIndex(prev => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex(prev => (prev - 1 + images.length) % images.length);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col pointer-events-auto"
        >
            {/* Header / Close */}
            <div className="flex justify-between items-center p-6 z-20">
                <span className="text-[#F6F3EE]/40 text-sm tracking-widest font-sans uppercase">
                    Gallery {currentIndex + 1} / {images.length}
                </span>
                <button
                    onClick={onClose}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>
            </div>

            {/* Main Image Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden px-4 md:px-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative max-h-[70vh] w-auto max-w-full shadow-2xl"
                    >
                        <img
                            src={images[currentIndex].src}
                            alt={images[currentIndex].alt}
                            className="max-h-[70vh] w-auto object-contain rounded-sm"
                        />
                        <p className="mt-4 text-center text-[#F6F3EE]/60 text-sm font-light italic">
                            {images[currentIndex].alt}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <button
                    onClick={prevImage}
                    className="absolute left-4 md:left-8 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextImage}
                    className="absolute right-4 md:right-8 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Thumbnails Footer */}
            <div className="h-32 w-full border-t border-white/5 bg-black/50 backdrop-blur-md flex items-center justify-center gap-4 px-6 overflow-x-auto z-20">
                {images.map((img, idx) => (
                    <button
                        key={img.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative h-20 w-20 flex-shrink-0 rounded-sm overflow-hidden transition-all duration-300 ${idx === currentIndex
                            ? 'ring-2 ring-[#C7A24B] opacity-100 scale-105'
                            : 'opacity-40 hover:opacity-100 hover:scale-105'
                            }`}
                    >
                        <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </motion.div>
    );
};
