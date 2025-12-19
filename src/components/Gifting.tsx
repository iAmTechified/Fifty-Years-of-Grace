'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { recordTransaction } from '@/lib/firebase-services';

// Types
type GiftOption = {
    id: string;
    title: string;
    description: string;
    value: string;
    symbol?: string; // Optional abstract symbol/icon placeholder
};

const GIFT_OPTIONS: GiftOption[] = [
    {
        id: '1',
        title: 'A Toast Together',
        description: 'A bottle of fine vintage champagne to share.',
        value: '$150',
        symbol: '🥂',
    },
    {
        id: '2',
        title: 'The Spa Retreat',
        description: 'A moment of serenity and relaxation.',
        value: '$300',
        symbol: '🌿',
    },
    {
        id: '3',
        title: 'Evening of Jazz',
        description: 'Tickets to an intimate live performance.',
        value: '$200',
        symbol: '🎷',
    },
    {
        id: '4',
        title: 'Culinary Journey',
        description: 'A private dining experience for two.',
        value: '$500',
        symbol: '🍽️',
    },
    {
        id: '5',
        title: 'The Great Escape',
        description: 'Contribution towards a weekend getaway.',
        value: '$1,000',
        symbol: '✈️',
    },
    {
        id: '6',
        title: 'Custom Gesture',
        description: 'A gift of your own choosing.',
        value: 'Open',
        symbol: '🎁',
    },
];

export default function Gifting() {
    const [selectedGift, setSelectedGift] = useState<GiftOption | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectGift = (gift: GiftOption) => {
        setSelectedGift(gift);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedGift(null), 500); // Clear after animation
    };

    return (
        <section className="relative w-full py-32 px-6 md:px-12 bg-[#F6F3EE] text-[#0E0E10] overflow-hidden">
            {/* Background Texture/Grain (Optional) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl md:text-6xl font-serif text-[#0E0E10] mb-6"
                    >
                        With Gratitude
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-lg md:text-xl font-sans text-[#0E0E10]/60 max-w-2xl mx-auto"
                    >
                        For those who wish to give, your kindness is sincerely appreciated.
                    </motion.p>
                </div>

                {/* Gift Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {GIFT_OPTIONS.map((gift, index) => (
                        <GiftCard
                            key={gift.id}
                            gift={gift}
                            index={index}
                            onSelect={() => handleSelectGift(gift)}
                        />
                    ))}
                </div>
            </div>

            {/* Modal - Rendered via Portal ideally, but simplified here for now */}
            <AnimatePresence>
                {isModalOpen && selectedGift && (
                    <GiftModal
                        gift={selectedGift}
                        onClose={closeModal}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}

// --- Sub-components ---

function GiftCard({ gift, index, onSelect }: { gift: GiftOption; index: number; onSelect: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
            }}
            viewport={{ once: true }}
            className="group relative flex flex-col items-center text-center p-10 bg-white border border-[#0E0E10]/5 rounded-sm hover:border-[#C7A24B]/40 transition-colors duration-500 cursor-pointer"
            onClick={onSelect}
            data-cursor-text="Gift"
            whileHover={{ y: -5, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)" }}
        >
            {/* Symbol */}
            <div className="mb-6 text-4xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 grayscale group-hover:grayscale-0">
                {gift.symbol}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-serif mb-3 text-[#0E0E10] group-hover:text-[#C7A24B] transition-colors duration-300">
                {gift.title}
            </h3>

            {/* Description */}
            <p className="text-sm font-sans text-[#0E0E10]/60 mb-6 leading-relaxed">
                {gift.description}
            </p>

            {/* Value */}
            <div className="mt-auto mb-6">
                <span className="font-serif text-lg text-[#0E0E10] opacity-80 border-b border-[#C7A24B]/30 pb-1">
                    {gift.value}
                </span>
            </div>

            {/* CTA (Hidden until hover) */}
            <div className="absolute bottom-8 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                <span className="text-xs uppercase tracking-widest font-sans font-medium text-[#C7A24B]">
                    Gift This
                </span>
            </div>
        </motion.div>
    );
}

function GiftModal({ gift, onClose }: { gift: GiftOption; onClose: () => void }) {
    // Prevent scrolling when modal is open
    // In a real app, use a hook for body scroll locking

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await recordTransaction({
                donorName: formData.name,
                email: formData.email,
                amount: gift.value === 'Open' ? 0 : parseInt(gift.value.replace(/\D/g, '')), // Basic parsing
                currency: 'USD',
                message: `Gifted: ${gift.title}`,
                reference: `REF-${Date.now()}`, // Simulated reference
                status: 'pending' // In real app, this would depend on payment gateway
            });

            alert(`Thank you, ${formData.name}! You will be redirected to payment for ${gift.title}.`);
            onClose();
        } catch (error) {
            console.error("Transaction error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-50 bg-[#0E0E10]/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-[#F6F3EE] w-full max-w-lg p-10 md:p-14 relative shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-[#0E0E10]/40 hover:text-[#C7A24B] transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Modal Header */}
                    <div className="text-center mb-10">
                        <span className="block text-xs uppercase tracking-widest text-[#0E0E10]/40 mb-3">Request to Gift</span>
                        <h3 className="text-3xl font-serif text-[#0E0E10] mb-2">{gift.title}</h3>
                        <p className="text-[#C7A24B] font-serif text-xl">{gift.value}</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-1">
                            <label className="block text-xs uppercase tracking-wider text-[#0E0E10]/50 ml-1">Your Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white border-b border-[#0E0E10]/20 p-3 text-[#0E0E10] font-sans focus:outline-none focus:border-[#C7A24B] transition-colors"
                                placeholder="First & Last Name"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs uppercase tracking-wider text-[#0E0E10]/50 ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white border-b border-[#0E0E10]/20 p-3 text-[#0E0E10] font-sans focus:outline-none focus:border-[#C7A24B] transition-colors"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs uppercase tracking-wider text-[#0E0E10]/50 ml-1">Phone (Optional)</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-white border-b border-[#0E0E10]/20 p-3 text-[#0E0E10] font-sans focus:outline-none focus:border-[#C7A24B] transition-colors"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 text-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative inline-flex items-center justify-center px-8 py-3 bg-[#0E0E10] text-[#F6F3EE] font-sans uppercase tracking-widest text-xs hover:bg-[#C7A24B] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className={clsx("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}>
                                    Request to Gift
                                </span>
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </button>
                            <p className="mt-4 text-[10px] text-[#0E0E10]/30 flex items-center justify-center gap-1.5 font-sans">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Securely Processed
                            </p>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </>
    );
}
