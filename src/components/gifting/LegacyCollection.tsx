'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LEGACY_PROJECTS = [
    {
        id: '1',
        title: 'The Knowledge Fund',
        subtitle: 'Supporting a library of wisdom',
        image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
        goal: '50 Books',
        progress: '12 Books',
        description: 'Contribute to building a personal library that will inspire generations to come.'
    },
    {
        id: '2',
        title: 'The Explorers Journal',
        subtitle: 'Funding the next adventure',
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
        goal: 'Dream Trip',
        progress: 'Ongoing',
        description: 'Help turn pages in the atlas into memories etched in time.'
    },
    {
        id: '3',
        title: 'The Digital Time Capsule',
        subtitle: 'Gift a memory, not money',
        image: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?auto=format&fit=crop&w=800&q=80',
        goal: '0 Cost',
        progress: 'Invaluable',
        description: 'Upload a video message, a photo from the past, or a letter for the future.',
        action: 'Leave a Memory'
    }
];

export default function LegacyCollection() {
    const [activeProject, setActiveProject] = useState<string | null>(null);

    return (
        <section className="relative w-full py-32 px-6 md:px-12 bg-[#F6F3EE] text-[#140309] overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-xs uppercase tracking-[0.3em] text-[#C7A24B] mb-4 block"
                    >
                        Building a Future
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-serif text-[#140309]"
                    >
                        The Legacy Collection
                    </motion.h2>
                    <p className="mt-6 text-lg text-[#140309]/60 max-w-2xl mx-auto font-sans">
                        Rather than traditional gifts, consider contributing to a chapter of the story yet to be written.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {LEGACY_PROJECTS.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.8 }}
                            className="group relative cursor-pointer"
                            onClick={() => setActiveProject(project.id)}
                        >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#140309]/5">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 z-10" />
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />

                                <div className="absolute inset-0 flex flex-col justify-end p-8 z-20 text-[#F6F3EE]">
                                    <span className="text-[10px] uppercase tracking-widest opacity-80 mb-2">{project.subtitle}</span>
                                    <h3 className="text-3xl font-serif mb-4">{project.title}</h3>

                                    <div className="h-0 overflow-hidden group-hover:h-auto opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                        <p className="text-sm font-sans opacity-90 mb-6 leading-relaxed">
                                            {project.description}
                                        </p>
                                        <button className="text-xs uppercase tracking-widest border-b border-[#C7A24B] text-[#C7A24B] pb-1">
                                            {project.action || 'Contribute'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Simple Modal placeholder */}
            <AnimatePresence>
                {activeProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveProject(null)}
                        className="fixed inset-0 z-50 bg-[#140309]/90 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#F6F3EE] p-12 max-w-lg w-full text-center rounded-sm relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setActiveProject(null)}
                                className="absolute top-4 right-4 p-2 text-[#140309]/50 hover:text-[#C7A24B]"
                            >
                                ✕
                            </button>
                            <h3 className="text-3xl font-serif mb-4 text-[#140309]">
                                {LEGACY_PROJECTS.find(p => p.id === activeProject)?.title}
                            </h3>
                            <p className="text-[#140309]/60 mb-8 font-sans">
                                {LEGACY_PROJECTS.find(p => p.id === activeProject)?.description}
                            </p>
                            <button className="px-8 py-3 bg-[#140309] text-[#F6F3EE] uppercase tracking-widest text-xs hover:bg-[#C7A24B] transition-colors">
                                Proceed to {LEGACY_PROJECTS.find(p => p.id === activeProject)?.action || 'Contribute'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
