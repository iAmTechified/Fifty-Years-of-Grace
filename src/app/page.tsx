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
import Footer from '@/components/Footer';
import RsvpModal from '@/components/RsvpModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0E0E10]">
      <FloatingNav />
      <ScrollProgress />
      <RsvpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <section id="hero">
        <Hero isModalOpen={isModalOpen} onOpenModal={() => setIsModalOpen(true)} />
      </section>

      <div className="h-screen w-full" />

      {/* <div className="relative z-10 bg-[#0E0E10]"> */}
      <section id="dedication">
        <Dedication />
      </section>
      <section id="story">
        <Story />
      </section>
      {/* </div> */}

      <section id="celebration">
        <Celebration onOpenModal={() => setIsModalOpen(true)} />
      </section>

      <section id="moments">
        <Moments />
      </section>

      <section id="gifting">
        <Gifting />
      </section>

      <Footer />
    </main>
  );
}
