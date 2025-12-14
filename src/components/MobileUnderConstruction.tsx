import React from "react";

export default function MobileUnderConstruction() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0E0E10] px-6 text-center text-[#F6F3EE]">
            <div className="relative mb-8">
                <div className="absolute -inset-4 rounded-full bg-[#C7A24B]/5 blur-xl"></div>
                <h1 className="relative font-serif text-4xl font-light tracking-wide text-[#F6F3EE] md:text-5xl">
                    Under Construction
                </h1>
            </div>

            <div className="mb-8 h-px w-24 bg-gradient-to-r from-transparent via-[#C7A24B] to-transparent opacity-50"></div>

            <p className="max-w-md font-sans text-base font-light leading-relaxed text-[#F6F3EE]/60">
                We are currently crafting a premium experience optimized for larger screens.
                Please visit us on a desktop or laptop to fully explore the celebration.
            </p>

            <div className="mt-12 flex items-center justify-center gap-2 text-xs font-light tracking-[0.2em] text-[#C7A24B] opacity-80">
                <span className="h-px w-8 bg-[#C7A24B]"></span>
                <span>COMING SOON</span>
                <span className="h-px w-8 bg-[#C7A24B]"></span>
            </div>
        </div>
    );
}
