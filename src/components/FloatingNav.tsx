"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", id: "hero" },
    { name: "Dedication", id: "dedication" },
    { name: "Story", id: "story" },
    { name: "Celebration", id: "celebration" },
    { name: "Moments", id: "moments" },
    { name: "Gifting", id: "gifting" },
];

export default function FloatingNav() {
    const [activeTab, setActiveTab] = useState("hero");
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out the mouse movement for the glow effect
    const springConfig = { damping: 25, stiffness: 700 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const opacity = useMotionValue(0);
    const opacitySpring = useSpring(opacity, { damping: 30, stiffness: 200 });

    useEffect(() => {
        const handleScroll = () => {
            const sections = navItems.map(item => document.getElementById(item.id));
            const scrollPosition = window.scrollY + window.innerHeight / 1.5;

            let currentSection = "hero";
            for (const section of sections) {
                if (section && section.offsetTop <= scrollPosition) {
                    currentSection = section.id;
                }
            }
            setActiveTab(currentSection);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
        opacity.set(1);
    };

    const handleMouseLeave = () => {
        opacity.set(0);
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop,
                behavior: "smooth",
            });
        }
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const navContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="fixed top-8 right-0 mr-5 md:left-1/2 md:-translate-x-1/2 z-50 w-[auto] md:w-auto md:max-w-fit">
            <motion.div
                layout
                ref={navContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "relative flex md:justify-center items-stretch md:items-center gap-1",
                    "rounded-2xl md:rounded-full backdrop-blur-xl",
                    "px-2 py-2 shadow-2xl transition-colors duration-300",
                    isExpanded ? "flex-col" : "flex-row items-center",
                    "md:flex-row", // Always row on desktop
                    activeTab === "gifting"
                        ? "border border-black/10 bg-[#F6F3EE]/25"
                        : "border border-white/10 bg-white/2"
                )}
            >
                {/* Edge Glow Effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-2xl md:rounded-full opacity-0 transition-opacity duration-300"
                    style={{
                        opacity: opacitySpring,
                        background: useTransform(
                            [springX, springY],
                            ([x, y]) => `radial-gradient(150px circle at ${x}px ${y}px, ${activeTab === "gifting" ? "rgba(0,0,0,0.1)" : "rgba(199, 162, 75, 0.1)"}, transparent 60%)`
                        ),
                        mixBlendMode: activeTab === "gifting" ? "multiply" : "screen"
                    }}
                />

                {/* Inner Glow/Border Mask */}
                <motion.div
                    className="absolute inset-[1px] rounded-2xl md:rounded-full z-0 bg-transparent pointer-events-none"
                />

                <div className={cn(
                    "flex flex-1",
                    isExpanded ? "flex-col w-full" : "flex-row items-center w-full",
                    "md:flex-row md:w-auto"
                )}>
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const isGifting = activeTab === "gifting";
                        const isVisible = isExpanded || isActive;

                        return (
                            <button
                                key={item.id}
                                data-id={item.id}
                                onClick={() => {
                                    scrollToSection(item.id);
                                    setIsExpanded(false);
                                }}
                                className={cn(
                                    "relative px-4 py-2 text-sm font-medium transition-colors duration-300 z-10 whitespace-nowrap",
                                    !isVisible && "hidden md:block", // Hide inactive items on mobile unless expanded
                                    isExpanded && "w-full text-left rounded-xl", // Full width when vertically expanded
                                    isActive
                                        ? (isGifting ? "text-black" : "text-foreground")
                                        : (isGifting ? "text-black/60 hover:text-black" : "text-foreground/80 hover:text-foreground")
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className={cn(
                                            "absolute inset-0 rounded-full backdrop-blur-md border",
                                            isGifting
                                                ? "border-black/5 bg-black/5"
                                                : "border-white/10 bg-white/5"
                                        )}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <span className={cn(
                                    "relative z-10",
                                    isGifting ? "mix-blend-normal" : "mix-blend-normal"
                                )}>{item.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Mobile Toggle Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "md:hidden relative z-20 p-2 ml-auto text-foreground/80 hover:text-foreground transition-colors",
                        activeTab === "gifting" ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white"
                    )}
                    aria-label="Toggle Menu"
                >
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </motion.div>
                </button>
            </motion.div>
        </div>
    );
}
