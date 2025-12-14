'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// --- TYPES ---
interface Wish {
    id: string;
    name: string;
    message: string;
}

interface GalleryImage {
    id: number;
    src: string;
    alt: string;
    rotation: number;
    scale: number;
    type: 'throwback' | 'recent';
}

// --- DATA ---
const INITIAL_WISHES: Wish[] = [
    { id: '1', name: 'Chisom', message: 'Happy 50th! You are a beacon of grace.' },
    { id: '2', name: 'Tunde & Fam', message: 'Wishing you overflowing joy today.' },
    { id: '3', name: 'Adaora', message: 'To a timeless soul, happy birthday!' },
];

const GALLERY_IMAGES: GalleryImage[] = [
    { id: 1, src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop', alt: 'Portrait', rotation: -2, scale: 1, type: 'recent' },
    { id: 2, src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=800&auto=format&fit=crop', alt: 'Throwback', rotation: 3, scale: 0.95, type: 'throwback' },
    { id: 3, src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', alt: 'Candid', rotation: -1, scale: 1.05, type: 'recent' },
    { id: 4, src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop', alt: 'Smile', rotation: 2, scale: 0.9, type: 'recent' },
    { id: 5, src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop', alt: 'Vintage', rotation: -3, scale: 1, type: 'throwback' },
];

export default function Moments() {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { margin: "-10% 0px -10% 0px", once: true });
    const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
    const [showPrompt, setShowPrompt] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [hasPrompted, setHasPrompted] = useState(false);

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

    const handleOpenModal = () => {
        setShowPrompt(false);
        setShowModal(true);
    };

    const handleDismissPrompt = () => {
        setShowPrompt(false);
    };

    const handleAddWish = (name: string, message: string) => {
        const newWish: Wish = {
            id: Date.now().toString(),
            name,
            message,
        };
        setWishes(prev => [newWish, ...prev]);
        setShowModal(false);
        // Simulate email
        console.log('Email sent to celebrant:', newWish);
    };

    return (
        <section
            ref={containerRef}
            className="relative w-full min-h-screen py-32 bg-[#0E0E10] text-[#F6F3EE] overflow-hidden"
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
                            {GALLERY_IMAGES.map((img, i) => (
                                <motion.div
                                    key={img.id}
                                    className={`relative w-full h-full overflow-hidden rounded-sm filter grayscale-[30%] hover:grayscale-0 transition-all duration-700 ease-out 
                                    ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                                    ${i === 1 ? 'md:mt-8 md:-ml-4' : ''}
                                    ${i === 2 ? 'md:mt-16 md:ml-4' : ''}
                                    ${i === 3 ? 'md:-mt-8 md:ml-8' : ''}
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
                                </motion.div>
                            ))}
                        </div>

                        {/* Gallery CTA */}
                        <div className="mt-12 text-center lg:text-left">
                            <button className="text-sm font-sans tracking-[0.2em] uppercase text-[#C7A24B] hover:text-[#F6F3EE] transition-colors duration-300 border-b border-[#C7A24B]/30 hover:border-[#F6F3EE] pb-1">
                                View Full Gallery
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

                    <div className="space-y-6 relative">
                        <AnimatePresence mode='popLayout'>
                            {wishes.map((wish, i) => (
                                <motion.div
                                    key={wish.id}
                                    layout
                                    initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        filter: 'blur(0px)',
                                        borderColor: ["rgba(199, 162, 75, 0.5)", "rgba(246, 243, 238, 0.1)"],
                                        transition: {
                                            borderColor: { duration: 1, ease: "easeOut" },
                                            default: { duration: 0.8 }
                                        }
                                    }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                    className={`bg-[#F6F3EE]/[0.03] backdrop-blur-sm p-6 border border-[#F6F3EE]/10 rounded-sm
                                    ${i % 2 === 0 ? 'ml-0' : 'ml-4 md:ml-12'} 
                                `}
                                >
                                    <p className="font-sans text-[#F6F3EE]/90 text-lg leading-relaxed mb-4 font-light">
                                        "{wish.message}"
                                    </p>
                                    <p className="font-serif italic text-[#C7A24B] text-sm text-right">
                                        — {wish.name}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Add Button (always visible manual trigger) */}
                        <motion.button
                            onClick={handleOpenModal}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-8 flex items-center gap-3 text-[#F6F3EE]/60 hover:text-[#C7A24B] transition-colors group text-sm font-light mx-auto lg:mx-0"
                        >
                            <span className="w-8 h-8 rounded-full border border-[#F6F3EE]/20 flex items-center justify-center group-hover:border-[#C7A24B] transition-colors">
                                +
                            </span>
                            Leave a Birthday Note
                        </motion.button>
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
                                onClick={handleOpenModal}
                                className="flex-1 bg-[#C7A24B] text-[#0E0E10] py-2 px-4 text-sm font-semibold hover:bg-[#D4B56A] transition-colors"
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
                {showModal && (
                    <WishFormModal onClose={() => setShowModal(false)} onSubmit={handleAddWish} />
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
                className="relative w-full max-w-lg bg-[#141416] border border-[#F6F3EE]/10 p-8 md:p-12 shadow-2xl"
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
                            className="w-full bg-[#0E0E10] border-b border-[#F6F3EE]/20 focus:border-[#C7A24B] text-[#F6F3EE] py-3 text-lg outline-none transition-colors placeholder:text-[#F6F3EE]/20"
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#C7A24B] mb-2">Your Wish</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-[#0E0E10] border-b border-[#F6F3EE]/20 focus:border-[#C7A24B] text-[#F6F3EE] py-3 text-lg outline-none transition-colors min-h-[120px] resize-none placeholder:text-[#F6F3EE]/20"
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
                            className="bg-[#C7A24B] text-[#0E0E10] py-3 px-8 text-sm font-bold uppercase tracking-widest hover:bg-[#D4B56A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Note'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
