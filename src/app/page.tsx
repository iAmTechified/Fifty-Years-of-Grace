'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import Dedication from '@/components/Dedication';
import Celebration from '@/components/Celebration';
import Story from '@/components/Story';
import Gifting from '@/components/Gifting';
import Moments from '@/components/Moments';
import FloatingNav from '@/components/FloatingNav';
import ScrollProgress from '@/components/ScrollProgress';
import PresenceIsPresent from '@/components/gifting/PresenceIsPresent';
import Footer from '@/components/Footer';
import RsvpModal from '@/components/RsvpModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#140309]">
      <FloatingNav />
      <ScrollProgress />
      <RsvpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <section id="hero" className="w-full">
        <Hero isModalOpen={isModalOpen} onOpenModal={() => setIsModalOpen(true)} />
      </section>

      <div className="h-screen w-full flex-shrink-0" />

      {/* <div className="relative z-10 bg-[#140309]"> */}
      <section id="dedication" className="w-full">
        <Dedication />
      </section>
      <section id="story" className="w-full">
        <Story />
      </section>
      {/* </div> */}

      <section id="celebration" className="w-full">
        <Celebration onOpenModal={() => setIsModalOpen(true)} />
      </section>

      <section id="moments" className="w-full overflow-x-hidden">
        <Moments />
      </section>

      <section id="gifting" className="w-full overflow-x-hidden">
        <PresenceIsPresent />
      </section>

      <Footer />
    </main>
  );
}
