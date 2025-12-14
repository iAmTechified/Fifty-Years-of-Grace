"use client";

import React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Map progress (0-1) to a vertical distance in pixels for the star to travel
    // Let's say the track is 300px tall.
    const TRACK_HEIGHT = 400;
    const y = useTransform(scaleX, [0, 1], [0, TRACK_HEIGHT]);

    return (
        <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center justify-center gap-4">
            {/* Top Decor */}
            <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-white/20" />

            <div className="relative w-4 flex items-center justify-center" style={{ height: TRACK_HEIGHT }}>
                {/* Background Track */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 bg-white/10 rounded-full" />

                {/* Active Track (optional, maybe gold fill?) */}
                <motion.div
                    className="absolute left-1/2 top-0 w-[1px] -translate-x-1/2 bg-accent opacity-70 origin-top"
                    style={{ height: y }}
                />

                {/* Moving Star */}
                <motion.div
                    className="absolute -left -translate-x-1/2"
                    style={{ y, top: -8, transform: "rotate(30deg)" }} // -8 to center the star (approx 16px size) on the starting point
                >
                    <div className="relative">
                        <div className="relative w-4 h-4 text-accent drop-shadow-[0_0_10px_rgba(199,162,75,0.8)]">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                            </svg>
                        </div>
                        {/* Inner Glow */}
                        <div className="absolute inset-0 bg-accent rounded-full blur-md opacity-50" />
                    </div>
                </motion.div>
            </div>

            {/* Bottom Decor */}
            <div className="w-[1px] h-8 bg-gradient-to-t from-transparent to-white/20" />
        </div>
    );
}
