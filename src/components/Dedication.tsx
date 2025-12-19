'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const Sparkle = ({ delay, x, y, size = 2 }: { delay: number, x: string, y: string, size?: number }) => (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
            scale: [0, 1.2, 0],
            opacity: [0, 0.8, 0],
        }}
        transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
            delay: delay,
            ease: "easeInOut"
        }}
        className="absolute bg-[#C7A24B] rounded-full blur-[1px]"
        style={{
            width: size,
            height: size,
            left: x,
            top: y,
            boxShadow: `0 0 ${size * 2}px ${size}px rgba(199, 162, 75, 0.3)`
        }}
    />
);

const FireworkCluster = () => {
    // Generate static random positions for hydration consistency
    const sparkles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: `${10 + Math.random() * 80}%`,
        y: `${10 + Math.random() * 80}%`,
        delay: Math.random() * 5,
        size: 2 + Math.random() * 3
    }));

    return (
        <div className="absolute inset-0 w-full h-full">
            {sparkles.map((s) => (
                <Sparkle key={s.id} {...s} />
            ))}
            {/* Center glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#C7A24B] rounded-full blur-[80px] opacity-10 animate-pulse" />
        </div>
    );
};

const TextReveal = ({ children, delay = 0, className = "" }: { children: string, delay?: number, className?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-20% 0px -20% 0px", once: true });

    // Split text into words
    const words = children.split(" ");

    return (
        <p ref={ref} className={`flex flex-wrap ${className}`}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ filter: "blur(12px)", opacity: 0.1, color: "#666666" }}
                    animate={isInView ? {
                        filter: "blur(0px)",
                        opacity: 1,
                        color: "#F6F3EE"
                    } : {}}
                    transition={{
                        duration: 1.2,
                        delay: delay + (i * 0.15), // Stagger effect
                        ease: [0.2, 0.65, 0.3, 0.9],
                    }}
                    className="mr-[0.25em] inline-block relative"
                >
                    {word}
                </motion.span>
            ))}
        </p>
    );
};

export default function Dedication() {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "start start"]
    });

    // Animate border radius from rounded (100px) to straight (0px)
    const topRadius = useTransform(scrollYProgress, [0, 0.3], [100, 0]);

    return (
        <motion.section
            ref={containerRef}
            style={{ borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius }}
            className="relative w-full min-h-[50vh] h-screen md:h-[80vh] py-3 md:py-6 bg-[#140309] text-[#F6F3EE] overflow-hidden z-20"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

                {/* Left Column - Visual Subject (Fireworks/Sparkles) */}
                <div className="md:col-span-4 h-[250px] md:h-[600px] relative flex items-center justify-center scale-150">
                    {/* Container for the effect - moves subtly with scroll maybe? */}
                    <div className="relative w-full h-full max-w-[400px] mx-auto opacity-60">
                        <FireworkCluster />
                        {/* Secondary cluster slightly offset for depth */}
                        <div className="absolute inset-0 scale-75 rotate-45 opacity-50">
                            <FireworkCluster />
                        </div>
                    </div>
                </div>

                {/* Right Column - Text Content */}
                <div className="ml-2 md:-ml-10 lg:-ml-16 md:col-span-8 flex flex-col justify-center items-start md:items-end text-left md:text-right space-y-1 md:space-y-2 pl-0 md:pl-12">

                    {/* Block 1 */}
                    <div className="w-full md:max-w-2xl">
                        <TextReveal delay={0} className="font-bold text-xl md:text-2xl lg:text-2xl font-sans leading-tight">
                            This is a birthday to be celebrated.
                        </TextReveal>
                    </div>

                    {/* Block 2 */}
                    <div className="w-full md:max-w-2xl">
                        <TextReveal delay={0.5} className="text-lg md:text-xl lg:text-xl font-sans font-light leading-relaxed tracking-wide">
                            Fifty years, not just counted, but enjoyed — through laughter, connection, and the quiet joy of being surrounded by those who matter most.
                        </TextReveal>
                    </div>

                    {/* Block 3 */}
                    <div className="w-full md:max-w-2xl">
                        <TextReveal delay={1.5} className="text-primary text-base md:text-lg lg:text-lg font-serif text-[#C7A24B] italic leading-tight">
                            Today, we celebrate her and the golden moment she stands in.
                        </TextReveal>
                    </div>

                </div>

            </div>

            {/* Bottom Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#140309] to-transparent pointer-events-none z-10" />

        </motion.section>
    );
}
