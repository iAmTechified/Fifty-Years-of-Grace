'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import CustomCursor from './CustomCursor';
import Magnetic from './Magnetic';

const CountdownDigit = ({ digit }: { digit: string }) => {
    return (
        <div className="relative h-6 w-4 overflow-hidden inline-block">
            <AnimatePresence mode='popLayout'>
                <motion.span
                    key={digit}
                    initial={{ y: '100%', filter: 'blur(5px)', opacity: 0 }}
                    animate={{ y: '0%', filter: 'blur(0px)', opacity: 1 }}
                    exit={{ y: '-100%', filter: 'blur(5px)', opacity: 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 flex items-center justify-center font-sans font-light"
                >
                    {digit}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

    useEffect(() => {
        const target = new Date('2026-06-01T00:00:00');
        const interval = setInterval(() => {
            const now = new Date();
            const difference = target.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({
                    days: days.toString().padStart(2, '0'),
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0'),
                    seconds: seconds.toString().padStart(2, '0')
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex gap-4 items-center text-[#F6F3EE]/60 text-xs tracking-widest uppercase mb-4">
            <div className="flex flex-col items-center">
                <div className="flex">
                    {timeLeft.days.split('').map((d, i) => <CountdownDigit key={`d-${i}`} digit={d} />)}
                </div>
                <span className="text-[10px] mt-1 opacity-50">Days</span>
            </div>
            <span className="mb-4">:</span>
            <div className="flex flex-col items-center">
                <div className="flex">
                    {timeLeft.hours.split('').map((d, i) => <CountdownDigit key={`h-${i}`} digit={d} />)}
                </div>
                <span className="text-[10px] mt-1 opacity-50">Hrs</span>
            </div>
            <span className="mb-4">:</span>
            <div className="flex flex-col items-center">
                <div className="flex">
                    {timeLeft.minutes.split('').map((d, i) => <CountdownDigit key={`m-${i}`} digit={d} />)}
                </div>
                <span className="text-[10px] mt-1 opacity-50">Mins</span>
            </div>
            <span className="mb-4">:</span>
            <div className="flex flex-col items-center">
                <div className="flex">
                    {timeLeft.seconds.split('').map((d, i) => <CountdownDigit key={`s-${i}`} digit={d} />)}
                </div>
                <span className="text-[10px] mt-1 opacity-50">Secs</span>
            </div>
        </div>
    );
};

const CTAButton = ({ onClick }: { onClick: () => void }) => (
    <Magnetic>
        <button
            onClick={onClick}
            className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[#1A1A1E]/80 backdrop-blur-md border border-[#C7A24B]/30 text-[#C7A24B] group overflow-hidden"
            aria-label="RSVP"
        >
            {/* Rotating Text Ring */}
            <motion.div
                className="absolute inset-0 w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full fill-[currentColor] p-1">
                    <defs>
                        <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                    </defs>
                    <text fontSize="11" className="font-mono uppercase tracking-[0.3em]">
                        <textPath href="#circlePath" startOffset="0%">
                            Request Invitation • Request Invitation •
                        </textPath>
                    </text>
                </svg>
            </motion.div>

            {/* Center Text */}
            <span className="relative z-10 font-serif italic text-lg">RSVP</span>

            {/* Hover Fill */}
            <div className="absolute inset-0 bg-[#C7A24B] rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out -z-0 opacity-10" />
        </button>
    </Magnetic>
);

export default function Hero({ isModalOpen, onOpenModal }: { isModalOpen: boolean, onOpenModal: () => void }) {
    const [mounted, setMounted] = useState(false);
    // const [isModalOpen, setIsModalOpen] = useState(false); // NOW USING PROPS
    const [isSticky, setIsSticky] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsSticky(latest > 50);
    });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
    const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const headlineFirst = "Fifty Years";
    const headlineSecond = "of Grace";
    const subheadline = "An invitation to honor, reflect, and celebrate.";

    return (
        <section ref={containerRef} className="fixed inset-0 h-screen w-full overflow-hidden bg-[#0E0E10] text-[#F6F3EE] z-0">

            {/* Cinematic Fog */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen">
                <svg className='w-full h-full opacity-30' xmlns="http://www.w3.org/2000/svg">
                    <filter id='fog-filter'>
                        <feTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='3' stitchTiles='stitch' />
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" />
                    </filter>
                    <rect width='100%' height='100%' filter='url(#fog-filter)' />
                </svg>
            </div>

            {/* Texture Overlay */}
            <div className="grain-overlay pointer-events-none absolute inset-0 z-10 opacity-[0.04] mix-blend-overlay" />

            {/* Ambient Light */}
            <div
                className={`absolute top-[-20%] left-[20%] w-[60vw] h-[60vw] bg-[#C7A24B] rounded-full blur-[180px] opacity-[0.02] animate-pulse-slow pointer-events-none z-0 transition-opacity duration-[3000ms] ${mounted ? 'opacity-[0.02]' : 'opacity-0'}`}
            />

            <CustomCursor />

            {/* --- LAYOUT GRID --- */}
            <div className="relative z-20 w-full h-full grid grid-cols-12 grid-rows-6 p-8 md:p-12 mix-blend-screen pointer-events-none">

                {/* 1. Sub-headline */}
                <div className="col-span-12 md:col-span-4 row-start-2 flex items-start pointer-events-auto">
                    <div className={`transition-all duration-[2000ms] ease-out delay-[800ms] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        <div className="w-8 h-[1px] bg-[#C7A24B]/50 mb-4" />
                        <p className="font-sans text-xs md:text-sm font-light tracking-[0.05em] leading-relaxed text-[#F6F3EE]/60 max-w-[240px]">
                            {subheadline}
                        </p>
                    </div>
                </div>

                {/* 2. Main Headline (Scaling on Scroll) */}
                <div className="col-span-12 row-start-3 row-span-3 flex flex-col items-center justify-center text-center perspective-[1000px]">
                    <motion.div style={{ scale: titleScale, opacity: titleOpacity }} className="origin-center">
                        <h1 className="font-serif text-7xl md:text-9xl lg:text-[10rem] leading-[0.9] tracking-tight relative mb-8">
                            {/* First Line */}
                            <span className="block overflow-hidden relative">
                                <span className="block">
                                    {headlineFirst.split('').map((char, index) => (
                                        <span
                                            key={`l1-${index}`}
                                            className={`inline-block transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${char === ' ' ? 'w-[0.2em]' : ''} ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'}`}
                                            style={{ transitionDelay: `${200 + index * 40}ms` }}
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </span>
                            </span>

                            {/* Second Line */}
                            <span className="block overflow-hidden relative">
                                <span className="block italic font-light text-[#C7A24B] opacity-90 translate-x-4 md:translate-x-12">
                                    {headlineSecond.split('').map((char, index) => (
                                        <span
                                            key={`l2-${index}`}
                                            className={`inline-block transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${char === ' ' ? 'w-[0.2em]' : ''} ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'}`}
                                            style={{ transitionDelay: `${600 + index * 40}ms` }}
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </span>
                            </span>
                        </h1>
                    </motion.div>
                </div>

                {/* 3. CTA & Countdown */}
                <div className="col-span-12 row-start-6 -mt-10 flex flex-col items-center md:items-end justify-end pointer-events-auto relative">

                    <div className={`transition-all duration-[1000ms] ease-out delay-[1500ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <Countdown />
                    </div>

                    {/* Inline Button location (Under countdown) */}
                    <div className="relative h-24 w-24 md:mr-4">
                        <AnimatePresence>
                            {!isSticky && !isModalOpen && (
                                <motion.div
                                    layoutId="modal-container"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute inset-0"
                                >
                                    <CTAButton onClick={onOpenModal} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

            </div>

            {/* FIXED CTA (Portaled to Body) - Modal removed from here */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isSticky && !isModalOpen && (
                        <motion.div
                            className="fixed bottom-8 right-8 z-[100] pointer-events-auto"
                            layoutId="modal-container"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <CTAButton onClick={onOpenModal} />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

        </section>
    );
}
