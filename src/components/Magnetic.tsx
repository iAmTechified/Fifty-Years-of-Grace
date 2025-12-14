'use client';

import { useRef, useState, useEffect } from 'react';

export default function Magnetic({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const mouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { width, height, left, top } = ref.current!.getBoundingClientRect();
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);
            setPosition({ x, y });
        };

        const mouseLeave = () => {
            setPosition({ x: 0, y: 0 });
        };

        const element = ref.current;
        if (element) {
            element.addEventListener('mousemove', mouseMove);
            element.addEventListener('mouseleave', mouseLeave);
        }

        return () => {
            if (element) {
                element.removeEventListener('mousemove', mouseMove);
                element.removeEventListener('mouseleave', mouseLeave);
            }
        };
    }, []);

    const { x, y } = position;
    return (
        <div
            ref={ref}
            className="relative"
            style={{ transform: `translate(${x * 0.1}px, ${y * 0.1}px)`, transition: 'transform 0.1s ease-out' }}
        >
            {children}
        </div>
    );
}
