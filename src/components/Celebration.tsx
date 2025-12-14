'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const schedule = [
    {
        day: "Day One",
        title: "An intimate welcome",
        desc: "An evening of warmth, connection, and quiet celebration as the moment begins."
    },
    {
        day: "Day Two",
        title: "The heart of the celebration",
        desc: "A day filled with joy, shared moments, and the fullness of togetherness."
    },
    {
        day: "Day Three",
        title: "A graceful close",
        desc: "A reflective and joyful conclusion, celebrating the memories made and the season ahead."
    }
];

export default function Celebration() {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-10% 0px -10% 0px", once: true });

    return (
        <section className="relative w-full py-32 md:py-48 bg-[#0E0E10] text-[#F6F3EE] overflow-hidden z-10">

            {/* Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Shared background motif - soft central glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#C7A24B] opacity-[0.03] rounded-full blur-[120px]" />

                {/* Subtle noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            <div ref={ref} className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-24 md:mb-32 space-y-8"
                >
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#F6F3EE]">
                        The Celebration Unfolds
                    </h2>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-px h-12 bg-gradient-to-b from-[#C7A24B]/0 via-[#C7A24B]/40 to-[#C7A24B]/0" />
                        <p className="font-sans text-xs md:text-sm font-light tracking-[0.2em] uppercase text-[#F6F3EE]/60 max-w-md mx-auto">
                            A thoughtfully curated celebration spanning three special days.
                        </p>
                    </div>
                </motion.div>

                {/* Cards Container with Perspective */}
                <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 w-full"
                    style={{ perspective: "1000px" }}
                >
                    {schedule.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, z: -40, y: 20 }}
                            animate={isInView ? { opacity: 1, z: 0, y: 0 } : {}}
                            whileHover={{
                                y: -4,
                                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
                                transition: { duration: 0.5, ease: "easeOut" }
                            }}
                            transition={{
                                duration: 1.4,
                                delay: 0.2 + (i * 0.2),
                                ease: [0.19, 1, 0.22, 1]
                            }}
                            className="group relative flex flex-col items-center text-center p-8 md:p-12 border border-[#F6F3EE]/5 bg-[#F6F3EE]/[0.01] rounded-sm backdrop-blur-[2px] transition-colors duration-700 hover:border-[#C7A24B]/20"
                            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                        >
                            {/* Hover Interaction Effects */}
                            <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-[#C7A24B]/5 to-transparent pointer-events-none"
                            />

                            {/* Content Wrapper */}
                            <div className="relative z-10 flex flex-col items-center gap-6">

                                {/* Background Day Number */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[160px] font-serif text-[#F6F3EE] opacity-[0.02] pointer-events-none select-none leading-none -mt-4 transition-transform duration-1000 group-hover:scale-105">
                                    {i + 1}
                                </div>

                                {/* Label */}
                                <span className="font-sans text-[10px] tracking-[0.25em] text-[#C7A24B] uppercase opacity-80">
                                    {item.day}
                                </span>

                                {/* Title */}
                                <h3 className="font-serif text-2xl md:text-3xl text-[#F6F3EE] leading-tight">
                                    {item.title}
                                </h3>

                                {/* Divider */}
                                <div className="w-8 h-px bg-[#F6F3EE]/10 my-2 group-hover:w-16 group-hover:bg-[#C7A24B]/40 transition-all duration-700" />

                                {/* Mood Description */}
                                <p className="font-sans text-sm font-light leading-relaxed text-[#F6F3EE]/60 max-w-[260px]">
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-24"
                >
                    <button
                        className="group relative px-8 py-4 bg-transparent border border-[#F6F3EE]/20 hover:border-[#C7A24B] transition-colors duration-500 overflow-hidden"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Simple placeholder action or scroll to top
                    >
                        <span className="relative z-10 font-sans text-[11px] tracking-[0.2em] uppercase text-[#F6F3EE] group-hover:text-[#C7A24B] transition-colors duration-300">
                            Request Invitation
                        </span>
                    </button>
                </motion.div>

                {/* Bottom decorative anchor or fade */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0 bg-gradient-to-t from-[#0E0E10] to-transparent pointer-events-none" />

            </div>
        </section>
    );
}
