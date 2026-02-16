'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
// Ensure you have these icons or similar. Utilizing simple SVGs for now.

export default function CelebrateWithObele() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative w-full py-24 px-6 md:px-12 bg-[#F6F3EE] text-[#140309] overflow-hidden flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto text-center z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-serif text-[#140309] mb-8"
        >
          Celebrate with Obele
        </motion.h2>
        
        <motion.p
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.2 }}
           className="text-lg md:text-xl font-sans text-[#140309]/60 max-w-2xl mx-auto mb-12"
        >
          Join in the joyous occasion in a way that resonates with you.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
          onClick={() => setIsModalOpen(true)}
          className="px-10 py-4 bg-[#140309] text-[#F6F3EE] font-serif text-lg rounded-full hover:bg-[#C7A24B] transition-colors duration-300 shadow-lg hover:shadow-xl"
        >
          I'd like to Celebrate
        </motion.button>
      </div>

      <AnimatePresence>
        {isModalOpen && <CelebrationModal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}

function CelebrationModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [method, setMethod] = useState('');

  const reasons = [
    "Because Obele is an inspiration",
    "To honor our friendship",
    "To mark this special milestone",
    "Just because!"
  ];

  const methods = [
    "Send a thoughtful gift",
    "Contribute to a dream",
    "Share a memory",
    "Send a toast (Drink on me)"
  ];

  const handleWhatsapp = () => {
    const text = `Hi Obele! I'd love to celebrate with you. ${reason ? `Reason: ${reason}.` : ''} I'd like to: ${method}.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`; // Add phone number if available
    window.open(url, '_blank');
    onClose();
  };

  return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#140309]/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#F6F3EE] w-full max-w-md p-8 md:p-12 relative shadow-2xl rounded-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#140309]/40 hover:text-[#C7A24B] transition-colors"
                >
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>

                <div className="mb-8 text-center">
                    <h3 className="text-2xl font-serif text-[#140309] mb-2">Join the Celebration</h3>
                    <p className="text-[#140309]/50 text-sm font-sans">Let us know how you'd like to partake.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-[#140309]/50 mb-2">Why are you celebrating?</label>
                        <select 
                            className="w-full bg-white border border-[#140309]/10 p-3 text-[#140309] font-sans focus:outline-none focus:border-[#C7A24B]"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            <option value="" disabled>Select a reason...</option>
                            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-[#140309]/50 mb-2">How would you like to celebrate?</label>
                        <select 
                            className="w-full bg-white border border-[#140309]/10 p-3 text-[#140309] font-sans focus:outline-none focus:border-[#C7A24B]"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                        >
                            <option value="" disabled>Select an option...</option>
                            {methods.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={handleWhatsapp}
                        disabled={!reason || !method}
                        className="w-full py-4 bg-[#140309] text-[#F6F3EE] font-sans uppercase tracking-widest text-xs hover:bg-[#C7A24B] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        Continue to WhatsApp
                    </button>
                </div>
            </motion.div>
        </motion.div>
  );
}
