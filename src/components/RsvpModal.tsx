'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface RsvpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RsvpModal({ isOpen, onClose }: RsvpModalProps) {
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
                            className="w-[90vw] max-w-[480px] bg-[#0E0E10] border border-[#C7A24B]/30 p-10 shadow-2xl overflow-hidden rounded-xl relative"
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

                                <div className="space-y-6">
                                    <div className="flex flex-col gap-3 group/input">
                                        <label className="text-[10px] uppercase tracking-wider opacity-60 group-focus-within/input:text-[#C7A24B] transition-colors">Full Name</label>
                                        <input type="text" className="bg-transparent border-b border-[#F6F3EE]/10 py-2 text-sm focus:outline-none focus:border-[#C7A24B] transition-colors placeholder:text-[#F6F3EE]/10" placeholder="Enter your name" />
                                    </div>

                                    <div className="flex flex-col gap-3 group/input">
                                        <label className="text-[10px] uppercase tracking-wider opacity-60 group-focus-within/input:text-[#C7A24B] transition-colors">Access Code</label>
                                        <input type="password" className="bg-transparent border-b border-[#F6F3EE]/10 py-2 text-sm focus:outline-none focus:border-[#C7A24B] transition-colors placeholder:text-[#F6F3EE]/10" placeholder="• • • • • •" />
                                    </div>
                                </div>

                                <button className="mt-4 py-4 w-full bg-[#C7A24B] text-[#0E0E10] uppercase text-[11px] tracking-[0.2em] font-medium hover:bg-[#F6F3EE] transition-colors duration-300">
                                    Submit Request
                                </button>
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
