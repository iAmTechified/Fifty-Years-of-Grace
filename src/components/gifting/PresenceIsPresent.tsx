'use client';

import { motion } from 'framer-motion';

export default function PresenceIsPresent() {
    return (
        <section className="relative w-full py-40 px-6 md:px-12 bg-[#140309] text-[#F6F3EE] flex flex-col items-center justify-center text-center">
            {/* Soft Ambient Light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C7A24B]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-12">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-5xl md:text-7xl font-serif text-[#F6F3EE] leading-tight"
                >
                    Your Presence is <span className="italic text-[#C7A24B]">My Present</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-lg md:text-xl font-sans text-[#F6F3EE]/60 max-w-xl mx-auto"
                >
                    Truly, having you celebrate with me is the greatest gift of all. No other contribution is required or expected.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="pt-8"
                >
                    <a
                        href="https://www.pocketwellapp.com/events/obele-akinniranye-661164"
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#F6F3EE]/40 hover:text-[#C7A24B] transition-colors duration-300 border-b border-transparent hover:border-[#C7A24B] pb-1"
                    >
                        <span>For those who insist</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

// Ensure you replace #wishlist with the actual link or modal trigger.
