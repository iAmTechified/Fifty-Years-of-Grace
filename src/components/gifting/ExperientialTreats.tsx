'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
// For demo purposes using built-in SVGs and simple state.

// Types for options
const TREAT_TYPES = [
    { id: 'spa', label: 'Spa Day', locations: ['Local Luxury Spa', 'Wellness Retreat', 'At-Home Massage'] },
    { id: 'dining', label: 'Fine Dining', locations: ['Michelin Star Experience', 'Sunset Dinner', 'Private Chef'] },
    { id: 'vacation', label: 'Getaway', locations: ['Maldives', 'Paris', 'Santorini', 'Kyoto'] },
    { id: 'custom', label: 'Custom Surprise', locations: ['Something Special'] }
];

export default function ExperientialTreats() {
    const [selectedTreat, setSelectedTreat] = useState(TREAT_TYPES[0].id);
    const [selectedLocation, setSelectedLocation] = useState(TREAT_TYPES[0].locations[0]);
    const [isCustomizing, setIsCustomizing] = useState(false);

    const handleProceed = () => {
        // Here you would integrate with payment or messaging
        alert(`Request to treat Obele to a ${TREAT_TYPES.find(t => t.id === selectedTreat)?.label} at/in ${selectedLocation}!`);
    };

    return (
        <section className="relative w-full py-32 px-6 md:px-12 bg-[#F6F3EE] text-[#140309] overflow-hidden flex flex-col items-center">
            <div className="max-w-5xl mx-auto w-full z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-serif text-[#140309] mb-4">Curated Experiences</h2>
                    <p className="text-lg font-sans text-[#140309]/50">Gift a memory that lasts a lifetime.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Visual Side */}
                    <div className="relative h-[500px] w-full bg-[#140309]/5 rounded-xl overflow-hidden shadow-2xl">
                        {/* Dynamic Image based on selection - simplified with a placeholder for now */}
                        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
                            style={{
                                backgroundImage: selectedTreat === 'vacation' ? 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80)' :
                                    selectedTreat === 'dining' ? 'url(https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&w=800&q=80)' :
                                        selectedTreat === 'spa' ? 'url(https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80)' :
                                            'url(https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80)'
                            }}
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-8 left-8 text-white z-10">
                            <h3 className="text-3xl font-serif">{TREAT_TYPES.find(t => t.id === selectedTreat)?.label}</h3>
                            <p className="text-sm font-sans opacity-80 mt-1">{selectedLocation}</p>
                        </div>
                    </div>

                    {/* Interactive Side */}
                    <div className="space-y-10">
                        <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm border border-[#140309]/5">
                            <div className="flex items-center gap-4 text-xl md:text-2xl font-serif text-[#140309] mb-8 flex-wrap">
                                <span>I want to treat Obele to a</span>
                                <div className="relative inline-block group">
                                    <select
                                        className="appearance-none bg-transparent border-b-2 border-[#C7A24B] text-[#C7A24B] font-serif cursor-pointer focus:outline-none pr-8 py-1"
                                        value={selectedTreat}
                                        onChange={(e) => {
                                            setSelectedTreat(e.target.value);
                                            setSelectedLocation(TREAT_TYPES.find(t => t.id === e.target.value)?.locations[0] || '');
                                        }}
                                    >
                                        {TREAT_TYPES.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#C7A24B]">▼</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm font-sans text-[#140309]/60 mb-8 flex-wrap">
                                <span>Preference / Location:</span>
                                <div className="relative inline-block w-full md:w-auto">
                                    <select
                                        className="w-full md:w-auto appearance-none bg-[#F6F3EE] rounded px-4 py-2 text-[#140309] font-sans cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C7A24B]"
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                    >
                                        {TREAT_TYPES.find(t => t.id === selectedTreat)?.locations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-[#140309]/10">
                                <button
                                    onClick={handleProceed}
                                    className="w-full py-4 bg-[#140309] text-[#F6F3EE] uppercase tracking-widest text-xs hover:bg-[#C7A24B] transition-colors duration-500"
                                >
                                    Make this Happen
                                </button>
                                <p className="text-center text-[10px] text-[#140309]/40 mt-3">
                                    You'll be guided to complete the contribution.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
