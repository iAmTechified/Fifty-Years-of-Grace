'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [cursorText, setCursorText] = useState('');

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        let rafId: number;
        let mouseX = -100;
        let mouseY = -100;

        // Smooth follow variables
        let currentX = -100;
        let currentY = -100;
        const speed = 0.15; // The "drag" feel

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            const target = e.target as HTMLElement;
            // Check for pointer cursor or specific data attribute
            const isPointer = window.getComputedStyle(target).cursor === 'pointer';
            // Check for custom cursor text
            const text = target.getAttribute('data-cursor-text') || target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text') || '';

            setIsHovering(isPointer || !!text);
            setCursorText(text);
        };

        const animate = () => {
            // Linear interpolation for smooth movement
            currentX += (mouseX - currentX) * speed;
            currentY += (mouseY - currentY) * speed;

            if (cursor) {
                cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            }

            rafId = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', onMouseMove);
        rafId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className={`custom-cursor fixed pointer-events-none z-[9999] flex items-center justify-center text-[10px] tracking-widest font-sans uppercase text-[#C7A24B] transition-all duration-300 ease-out will-change-transform ${isHovering ? 'w-32 h-32 bg-transparent border border-[#C7A24B] mix-blend-normal backdrop-blur-sm' : 'w-12 h-12 bg-[#F6F3EE] mix-blend-difference scale-150'}`}
            style={{ left: 0, top: 0 }} // Position handling done in JS
        >
            <span className={`transition-opacity duration-300 ${cursorText ? 'opacity-100' : 'opacity-0'}`}>
                {cursorText}
            </span>
        </div>
    );
}
