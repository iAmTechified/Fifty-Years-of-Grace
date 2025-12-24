'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import confetti from 'canvas-confetti';
import CustomCursor from './CustomCursor';
import Magnetic from './Magnetic';

const bgImages = [
    '/Mrs. Obele Akinniranye Portrait.jpg',
    '/Mrs. Obele Akinniranye Full shot 2.jpg',
    '/Mrs. Obele Akinniranye Full shot.jpg',
    '/Mrs. Obele Akinniranye Mid shot.jpg',
    '/Mrs. Obele Akinniranye selfie.jpg',
    '/Mrs. Obele Akinniranye smiling selfie.jpg'
];

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
            className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[#0a0104]/80 backdrop-blur-md border border-[#C7A24B]/30 text-[#C7A24B] group overflow-hidden"
            aria-label="RSVP"
        >
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
            <span className="relative z-10 font-serif italic text-lg">RSVP</span>
            <div className="absolute inset-0 bg-[#C7A24B] rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out -z-0 opacity-10" />
        </button>
    </Magnetic>
);

export default function Hero({ isModalOpen, onOpenModal }: { isModalOpen: boolean, onOpenModal: () => void }) {
    const [mounted, setMounted] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
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

    // Background slideshow
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Confetti Effect
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current) {
            const myConfetti = confetti.create(canvasRef.current, {
                resize: true,
                useWorker: true
            });

            // Fire confetti matching the text reveal (approx 1.2s delay)
            const fire = () => {
                const duration = 3000;
                const end = Date.now() + duration;

                // Frame loop for a continuous but short "fountain" or just simple bursts
                // Let's do a few specific bursts for a cleaner look under the text

                // Burst 1
                setTimeout(() => {
                    myConfetti({
                        particleCount: 100,
                        spread: 100,
                        origin: { y: 0.5 },
                        colors: ['#C7A24B', '#F6F3EE', '#ffffff'],
                        startVelocity: 30,
                        gravity: 0.8,
                        scalar: 1,
                    });
                }, 1500); // Matches the text reveal roughly

                // Burst 2
                setTimeout(() => {
                    myConfetti({
                        particleCount: 50,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#C7A24B', '#F6F3EE'],
                    });
                    myConfetti({
                        particleCount: 50,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#C7A24B', '#F6F3EE'],
                    });
                }, 2000);
            };

            fire();

            return () => {
                myConfetti.reset();
            }
        }
    }, []);

    return (
        <section ref={containerRef} className="fixed inset-0 h-screen w-full overflow-hidden bg-[#140309] text-[#F6F3EE] z-0">

            {/* Background Slideshow */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentBgIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.3, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full bg-cover bg-center"
                        style={{
                            backgroundImage: `url('${bgImages[currentBgIndex]}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "top",
                            filter: 'grayscale(0.3) brightness(0.7)'
                        }}
                    />
                </AnimatePresence>
                {/* Gradient Overlay for better text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#140309] via-[#140309]/50 to-transparent opacity-90" />
            </div>

            {/* Cinematic Fog/Grain */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen">
                <svg className='w-full h-full opacity-30' xmlns="http://www.w3.org/2000/svg">
                    <filter id='fog-filter'>
                        <feTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='3' stitchTiles='stitch' />
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" />
                    </filter>
                    <rect width='100%' height='100%' filter='url(#fog-filter)' />
                </svg>
            </div>
            <div className="grain-overlay pointer-events-none absolute inset-0 z-10 opacity-[0.04] mix-blend-overlay" />

            {/* Confetti - Layered under text (z-15) but above bg */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-[15]"
            />

            <CustomCursor />

            {/* Main Content */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-8 md:p-12 pointer-events-none">

                <motion.div
                    style={{ scale: titleScale, opacity: titleOpacity }}
                    className="flex flex-col items-center justify-center text-center mt-10 md:mt-0 z-10"
                >
                    {/* "50" with Gold Texture */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                        className="font-serif relative z-10"
                    >
                        <div className='relative border border-green-500/0'>
                            {/* "She's" */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="absolute top-20 md:top-[5rem] lg:top-[6rem] -left-[8] font-better shadow-md text-[#db7d02] text-2xl md:text-3xl lg:text-4xl z-20 transform -rotate-12 self-start md:self-auto"
                            >
                                She&apos;s
                            </motion.div>
                            <div
                                className="h-auto font-libre italic text-[15rem] md:text-[18rem] lg:text-[22rem] font-bold text-transparent bg-clip-text flex flex-row gap-0 items-end"
                                style={{
                                    backgroundImage: "url('/gold-texture.png')",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))"
                                }}
                            >

                                <span>5</span> <span className='text-[10rem] md:text-[14rem] lg:text-[18rem] -ml-[3rem] md:-ml-[4rem]'>0</span>
                            </div>
                            {/* "Sweet & Gifted" */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1.2 }}
                                className="absolute bottom-10 md:bottom-[3rem] lg:bottom-[4rem] -right-20 md:-right-20 lg:-right-20 shadow-md text-left font-better text-[#db7d02] text-2xl md:text-3xl lg:text-4xl z-20"
                            >
                                Sweet <br /> & Gifted
                            </motion.div>
                        </div>
                    </motion.div>

                </motion.div>

                {/* Subheadline/Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute top-32 left-8 md:left-12 flex items-start pointer-events-auto"
                >
                    <div className="w-[1px] h-12 bg-[#C7A24B]/50 mr-4" />
                    <p className="font-sans text-xs md:text-sm font-light tracking-[0.05em] leading-relaxed text-[#F6F3EE]/80 max-w-[200px]">
                        An invitation to honor, reflect, and celebrate.
                    </p>
                </motion.div>

                {/* CTA & Countdown */}
                <div className="absolute bottom-8 right-8 md:right-12 flex flex-col items-end pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8, duration: 1 }}
                    >
                        <Countdown />
                    </motion.div>

                    <div>
                        <AnimatePresence>
                            {!isSticky && !isModalOpen && (
                                <motion.div
                                    layoutId="modal-container"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <CTAButton onClick={onOpenModal} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>

            {/* FIXED CTA (Portaled to Body) */}
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
