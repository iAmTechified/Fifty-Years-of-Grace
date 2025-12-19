'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';

const storyData = [
    {
        id: 1,
        text: "She moves with a quiet grace, a presence that doesn't demand attention but naturally commands it.",
        highlight: "grace",
        imageColor: "from-[#1a1a1a] to-[#2a2a2a]", // Placeholder for image
        image: "./Mrs. Obele Akinniranye.jpg",
        title: "Mrs. Obele Akinniranye"
    },
    {
        id: 2,
        text: "In every room she enters, warmth follows—a testament to a heart that has learned the art of giving.",
        highlight: "giving",
        imageColor: "from-[#2a2a2a] to-[#3a3a3a]",
        image: "./Mrs. Obele Akinniranye Portrait.jpg",
        title: "Mrs. Obele Akinniranye"
    },
    {
        id: 3,
        text: "Challenges haven't hardened her; they've only revealed the diamond-strength of her spirit.",
        highlight: "strength",
        imageColor: "from-[#3a3a3a] to-[#4a4a4a]",
        image: "./Mrs. Obele Akinniranye Full shot.jpg",
        title: "Mrs. Obele Akinniranye"
    },
    {
        id: 4,
        text: "Fifty years of weaving stories, not just for herself, but for everyone lucky enough to be part of her tapestry.",
        highlight: "tapestry",
        imageColor: "from-[#3a3a3a] to-[#4a4a4a]",
        image: "./Mrs. Obele Akinniranye Full shot 2.jpg",
        title: "Mrs. Obele Akinniranye"
    }
];

const StoryBlock = ({ item, index, setIndex }: { item: typeof storyData[0], index: number, setIndex: (i: number) => void }) => {
    const ref = useRef<HTMLDivElement>(null);

    // Check when element is in center of view
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Create a value that peaks when the element is in the center of the viewport
    // roughly 0.5 scrollYProgress typically means center if container matches viewport, 
    // but in a long scroll flow, we often use specific offsets. 
    // Let's use simpler Intersection logic via onViewportEnter/onUpdate if we want strict index tracking,
    // OR use raw scroll progress to drive opacity/blur.

    // We want the text to be visible when snapped (centered) but fade out quickly as it scrolls past
    // to avoid overlapping/clutter with the next item or the sticky header.
    // Range focused around 0.5 (center).
    const opacity = useTransform(scrollYProgress, [0.2, 0.45, 0.55, 0.8], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0.2, 0.45, 0.55, 0.8], [0.85, 1, 1, 0.85]);
    const blur = useTransform(scrollYProgress, [0.2, 0.45, 0.55, 0.8], [8, 0, 0, 8]);

    // We use a listener to update the global index state for the image container
    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Trigger image change when text is near the center
            if (latest > 0.4 && latest < 0.6) {
                setIndex(index);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, index, setIndex]);

    return (
        <motion.div
            ref={ref}
            style={{ opacity, scale, filter: useMotionTemplate`blur(${blur}px)` }}
            className="h-full flex flex-col items-center justify-between md:justify-center max-w-lg mx-auto p-8 pt-15"
        >
            <div className='md:hidden h-full w-full'></div>
            <p className="h-[60%] md:h-auto text-xl md:text-4xl leading-relaxed font-sans font-light text-[#F6F3EE]/90">
                {item.text.split(" ").map((word, i) => {
                    const isHighlight = word.toLowerCase().includes(item.highlight.toLowerCase());
                    return (
                        <span key={i} className={isHighlight ? "italic text-[#C7A24B]" : ""}>
                            {word}{" "}
                        </span>
                    );
                })}
            </p>
        </motion.div>
    );
};

export default function Story() {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLElement>(null);

    // Mouse Interaction for 3D Tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth) - 0.5;
        const y = (clientY / innerHeight) - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]); // Tilt L/R
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]); // Tilt U/D

    // Spring physics for smooth mouse follow
    const springConfig = { damping: 25, stiffness: 150 };
    const springRotateX = useSpring(rotateX, springConfig);
    const springRotateY = useSpring(rotateY, springConfig);

    // Dynamic Snap Logic
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Engage mandatory snap ONLY when we are deep inside the section (e.g., 0 to 1)
            // But to allow exit, we might want to be looser near edges.
            // Actually, simply toggling it when >= 0 and <= 1 is what provides the "modal" feel.
            // Exiting happens because when you scroll past 1, this fires and removes the class.
            const html = document.documentElement;
            if (latest >= 0.05 && latest <= 0.95) {
                html.classList.add('snap-mandatory');
            } else {
                html.classList.remove('snap-mandatory');
            }
        });
        return () => {
            document.documentElement.classList.remove('snap-mandatory');
            unsubscribe();
        };
    }, [scrollYProgress]);

    return (
        <section
            ref={containerRef}
            className="relative w-full bg-[#140309] text-[#F6F3EE]"
            onMouseMove={handleMouseMove}
        >

            {/* Introductory Title (Optional/Subtle) */}
            <div className="w-full text-center py-12 md:py-24 opacity-30 uppercase tracking-[0.3em] text-xs font-serif">
                Her Story
            </div>
            <div className="relative w-full flex flex-col md:flex-row items-start">
                {/* LEFT: Sticky Image Container */}
                <div className="flex w-full md:w-1/2 h-[45vh] md:h-screen sticky top-[15vh] md:top-0 self-start items-center justify-center p-3 md:p-12 z-20">

                    {/* Perspective Context */}
                    <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
                        <motion.div
                            style={{
                                rotateX: springRotateX,
                                rotateY: springRotateY,
                                transformStyle: "preserve-3d"
                            }}
                            className="relative w-auto h-full md:h-auto md:w-full aspect-[4/5] max-w-md max-h-full"
                        >
                            {/* Image Transitions */}
                            <div className="relative w-full h-full rounded-sm overflow-hidden shadow-2xl bg-[#1a1a1a]">
                                {storyData.map((story, index) => (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: index === activeIndex ? 1 : 0,
                                            scale: index === activeIndex ? 1 : 1.1,
                                            zIndex: index === activeIndex ? 10 : 0
                                        }}
                                        transition={{ duration: index === activeIndex ? 1.5 : 0.5, ease: "easeInOut" }}
                                        className={`absolute inset-0 bg-gradient-to-br ${story.imageColor}`}
                                    >
                                        {/* Placeholder visual noise/texture */}
                                        <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                                        />

                                        {/* Image */}
                                        <img
                                            src={story.image}
                                            alt={story.title}
                                            className="absolute inset-0 w-full h-full object-cover object-top"
                                            loading="eager" // Ensure images load immediately
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Subtle Shadow/Reflection */}
                            <div className="absolute -bottom-10 left-10 right-10 h-10 bg-black/50 blur-xl rounded-[50%]" />
                        </motion.div>
                    </div>
                </div>

                {/* RIGHT: Scrollable Text Column */}
                <div className="w-full md:w-1/2 relative z-10">
                    {storyData.map((item, index) => (
                        <div
                            key={item.id}
                            className="h-screen w-full flex items-center justify-center snap-end md:snap-center snap-always relative pb-0"
                        >
                            <StoryBlock
                                item={item}
                                index={index}
                                setIndex={setActiveIndex}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Exit Zone - non-snapping area to release scroll */}
            <div className="h-[20vh] w-full snap-align-none" />
        </section>
    );
}
