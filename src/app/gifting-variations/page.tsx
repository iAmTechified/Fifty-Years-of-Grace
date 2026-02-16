'use client';

import CelebrateWithObele from '@/components/gifting/CelebrateWithObele';
import ExperientialTreats from '@/components/gifting/ExperientialTreats';
import PresenceIsPresent from '@/components/gifting/PresenceIsPresent';
import LegacyCollection from '@/components/gifting/LegacyCollection';
import FloatingNav from '@/components/FloatingNav'; // Assuming this exists from page.tsx check
import Footer from '@/components/Footer'; // Assuming this exists

export default function GiftingVariationsPage() {
    return (
        <main className="min-h-screen bg-[#140309] text-[#F6F3EE]">
            <FloatingNav />

            <div className="pt-32 pb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-serif text-[#C7A24B] mb-4">Gifting Variations</h1>
                <p className="text-xl font-sans opacity-60">Review the different concepts below.</p>
            </div>

            <div className="space-y-32 pb-32">
                <section>
                    <div className="text-center mb-8 opacity-50 text-sm uppercase tracking-widest border-t border-[#F6F3EE]/20 pt-8 mx-auto max-w-md">
                        Option 1: Celebrate with Obele (Minimal & Direct)
                    </div>
                    <CelebrateWithObele />
                </section>

                <section>
                    <div className="text-center mb-8 opacity-50 text-sm uppercase tracking-widest border-t border-[#F6F3EE]/20 pt-8 mx-auto max-w-md">
                        Option 2: Experiential Treats (Visual & Interactive)
                    </div>
                    <ExperientialTreats />
                </section>

                <section>
                    <div className="text-center mb-8 opacity-50 text-sm uppercase tracking-widest border-t border-[#F6F3EE]/20 pt-8 mx-auto max-w-md">
                        Option 3: Presence is Present (Strategic & Elegant)
                    </div>
                    <PresenceIsPresent />
                </section>

                <section>
                    <div className="text-center mb-8 opacity-50 text-sm uppercase tracking-widest border-t border-[#F6F3EE]/20 pt-8 mx-auto max-w-md">
                        Option 4: The Legacy Collection (Another Idea)
                    </div>
                    <LegacyCollection />
                </section>
            </div>

            <Footer />
        </main>
    );
}
