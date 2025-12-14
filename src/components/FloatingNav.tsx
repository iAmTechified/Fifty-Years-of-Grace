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

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 max-w-fit">
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "relative flex items-center justify-center gap-1",
                    "rounded-full backdrop-blur-xl",
                    "px-2 py-2 shadow-2xl overflow-hidden transition-colors duration-300",
                    activeTab === "gifting"
                        ? "border border-black/10 bg-[#F6F3EE]/25"
                        : "border border-white/10 bg-white/2"
                )}
            >
                {/* Edge Glow Effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-300"
                    style={{
                        opacity: opacitySpring,
                        background: useTransform(
                            [springX, springY],
                            ([x, y]) => `radial-gradient(150px circle at ${x}px ${y}px, ${activeTab === "gifting" ? "rgba(0,0,0,0.1)" : "rgba(199, 162, 75, 0.1)"}, transparent 60%)`
                        ),
                        mixBlendMode: activeTab === "gifting" ? "multiply" : "screen"
                    }}
                />

                {/* Inner Glow/Border Mask for sharper gold edges */}
                <motion.div
                    className="absolute inset-[1px] rounded-full z-0 bg-transparent pointer-events-none"
                />

                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const isGifting = activeTab === "gifting";

                    return (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={cn(
                                "relative px-4 py-2 text-sm font-medium transition-colors duration-300 z-10",
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
            </motion.div>
        </div>
    );
}
