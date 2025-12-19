'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface RsvpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { useState } from 'react';
import { submitRSVP, validateAccessCode } from '@/lib/firebase-services';

interface RsvpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RsvpModal({ isOpen, onClose }: RsvpModalProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async () => {
        setStatus('loading');
        setErrorMessage('');

        try {

            // 2. Submit RSVP
            await submitRSVP({
                fullName: formData.fullName,
                email: formData.email,
                attending: true, // Default to true for this flow
                guestsCount: 1, // Default to 1
                dietaryRestrictions: '',
                specialRequests: '',
                approval_status: "pending"
            });

            // 3. Send Confirmation Email
            await fetch('/api/send-rsvp-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    fullName: formData.fullName,
                    guestsCount: 1
                })
            });

            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData({ fullName: '', email: '' });
            }, 2000);

        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 1. PARENT OVERLAY: Handles fixed position, z-index, and centering */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-auto"
                    >
                        {/* 2. THE MODAL */}
                        <motion.div
                            layoutId="modal-container"
                            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside modal
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
                            className="w-[90vw] max-w-[480px] bg-[#140309] border border-[#C7A24B]/30 p-10 shadow-2xl overflow-hidden rounded-xl relative"
                        >
                            <div className="flex flex-col gap-8 font-sans text-[#F6F3EE] relative z-20">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-serif text-3xl text-[#C7A24B] italic">RSVP</h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                                        className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-[#C7A24B] transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>

                                {status === 'success' ? (
                                    <div className="py-10 text-center">
                                        <p className="text-xl font-serif text-[#C7A24B] mb-2">Thank You</p>
                                        <p className="text-sm opacity-60">Your request has been received.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-3 group/input">
                                            <label className="text-[10px] uppercase tracking-wider opacity-60 group-focus-within/input:text-[#C7A24B] transition-colors">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="bg-transparent border-b border-[#F6F3EE]/10 py-2 text-sm focus:outline-none focus:border-[#C7A24B] transition-colors placeholder:text-[#F6F3EE]/10"
                                                placeholder="Enter your name"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-3 group/input">
                                            <label className="text-[10px] uppercase tracking-wider opacity-60 group-focus-within/input:text-[#C7A24B] transition-colors">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-transparent border-b border-[#F6F3EE]/10 py-2 text-sm focus:outline-none focus:border-[#C7A24B] transition-colors placeholder:text-[#F6F3EE]/10"
                                                placeholder="name@example.com"
                                            />
                                        </div>


                                        {status === 'error' && (
                                            <p className="text-red-400 text-xs">{errorMessage}</p>
                                        )}

                                        <button
                                            onClick={handleSubmit}
                                            disabled={status === 'loading'}
                                            className="mt-4 py-4 w-full bg-[#C7A24B] text-[#140309] uppercase text-[11px] tracking-[0.2em] font-medium hover:bg-[#F6F3EE] transition-colors duration-300 disabled:opacity-50"
                                        >
                                            {status === 'loading' ? 'Processing...' : 'Submit Request'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grain-overlay pointer-events-none absolute inset-0 z-0 opacity-[0.05]" />
                        </motion.div>
                    </motion.div>

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] pointer-events-auto"
                    />
                </>
            )}
        </AnimatePresence>
    );
}
