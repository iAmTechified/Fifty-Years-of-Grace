import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full bg-[#0E0E10] py-12 border-t border-white/5 relative z-10">
            <div className="container mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">

                <div className="text-sm font-sans tracking-wide">
                    &copy; {new Date().getFullYear()} Obele. All rights reserved.
                </div>

                <div className="flex items-center gap-8">
                    <span className="text-xs uppercase tracking-widest font-light text-white/60">Designed with Grace</span>
                </div>

            </div>
        </footer>
    );
}
