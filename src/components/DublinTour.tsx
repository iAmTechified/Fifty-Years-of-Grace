'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const stops = [
  {
    id: 1,
    title: "St Stephen's Green",
    desc: "Former battlefield of the 1916 Irish Rebellion — now a beloved city park.",
    x: 10, y: 10,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Dublin_Stephen%27s_Green-44_edit.jpg/1280px-Dublin_Stephen%27s_Green-44_edit.jpg"
  },
  {
    id: 2,
    title: "Grafton Street",
    desc: "Dublin's premier shopping street on the Southside — vibrant and unmissable.",
    x: 30, y: 15,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Grafton_St%2C_Dublin.jpg/1280px-Grafton_St%2C_Dublin.jpg"
  },
  {
    id: 3,
    title: "Exchequer Street",
    desc: "Live like a local in the very heart of Dublin's most spirited neighbourhood.",
    x: 55, y: 12,
    img: "/dublin-tour/stop10.png"
  },
  {
    id: 4,
    title: "Powerscourt Townhouse",
    desc: "A stunning Georgian mansion transformed into an elegant antique courtyard.",
    x: 75, y: 22,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Dublin_-_Powerscourt_House%2C_Dublin_-_2025-09-27_01-29-25_001.jpeg/1280px-Dublin_-_Powerscourt_House%2C_Dublin_-_2025-09-27_01-29-25_001.jpeg"
  },
  {
    id: 5,
    title: "Trinity College",
    desc: "Ireland's oldest university — home to the Book of Kells and technically still the Queen's College.",
    x: 85, y: 40,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/The_entrance_of_the_historic_Trinity_College_%28Unsplash%29.jpg/1280px-The_entrance_of_the_historic_Trinity_College_%28Unsplash%29.jpg"
  },
  {
    id: 6,
    title: "Bank of Ireland",
    desc: "Originally a government building, famously built with no windows to avoid the window tax!",
    x: 65, y: 55,
    img: "/dublin-tour/stop3.jpg"
  },
  {
    id: 7,
    title: "The Spire",
    desc: "A Monument of Light built to mark the new millennium. Its shape will surprise you.",
    x: 45, y: 50,
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/E4324-Spire-of-Dublin.jpg/1280px-E4324-Spire-of-Dublin.jpg"
  },
  {
    id: 8,
    title: "Henry Street",
    desc: "Northside Dublin's beloved shopping street — the perfect counterpart to Grafton Street.",
    x: 20, y: 65,
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Henry_Street.jpg"
  },
  {
    id: 9,
    title: "Ha'penny Bridge",
    desc: "Built by the constructors of the Titanic — once cost half a penny to cross.",
    x: 35, y: 85,
    img: "/dublin-tour/stop6.jpg"
  },
  {
    id: 10,
    title: "Temple Bar",
    desc: "Dublin's famous cobblestone quarter — derelict zone turned colourful cultural landmark.",
    x: 65, y: 90,
    img: "/dublin-tour/stop9.jpg"
  }
];

export default function DublinTour() {
  const containerRef = useRef<HTMLElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const mapWidth = windowSize.width < 768 ? 1600 : 3000;
  const mapHeight = windowSize.width < 768 ? 2400 : 3000;

  // With map origin perfectly centered in screen via wrapper, we translate map by exact negative coordinates
  // +250 pushes the pin down so the card (which is rendered above the pin) is centered vertically
  const xTransformsBase = stops.map(stop => -(stop.x / 100 * mapWidth));
  const yTransformsBase = stops.map(stop => -(stop.y / 100 * mapHeight) + 250);

  // 14 segments: 1 for start pause, 9 for transitions, 4 for end pause
  const segments = stops.length + 4; 

  const inputPoints = [];
  const outputX = [];
  const outputY = [];

  // Point 0: Scroll = 0. Map is pushed down (+600) so the first card sits below the title
  inputPoints.push(0);
  outputX.push(xTransformsBase[0] || 0);
  outputY.push((yTransformsBase[0] || 0) + 600);

  // Point 1: Scroll = 0.5 / 14. Map has glided up to center. Title fades out during this.
  inputPoints.push(0.5 / segments);
  outputX.push(xTransformsBase[0] || 0);
  outputY.push(yTransformsBase[0] || 0);

  // Point 2: Scroll = 1 / 14. Pause at center before moving to next stop.
  inputPoints.push(1 / segments);
  outputX.push(xTransformsBase[0] || 0);
  outputY.push(yTransformsBase[0] || 0);

  // Points for stops 1 to 9 (indices 1 to 9)
  for (let i = 1; i < stops.length; i++) {
    inputPoints.push((i + 1) / segments);
    outputX.push(xTransformsBase[i] || 0);
    outputY.push(yTransformsBase[i] || 0);
  }

  // End with a long pause on the last stop (stops section from unpinning prematurely)
  inputPoints.push(1);
  outputX.push(xTransformsBase[stops.length - 1] || 0);
  outputY.push(yTransformsBase[stops.length - 1] || 0);

  const rawX = useTransform(scrollYProgress, inputPoints, outputX);
  const rawY = useTransform(scrollYProgress, inputPoints, outputY);

  const springConfig = { damping: 25, stiffness: 100 };
  const mapX = useSpring(rawX, springConfig);
  const mapY = useSpring(rawY, springConfig);

  // Title fades out completely before the map starts moving to stop 2
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5 / segments], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.5 / segments], [0, -100]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const segmentProgress = latest * segments;
      const index = Math.max(0, Math.min(stops.length - 1, Math.round(segmentProgress - 1)));
      setActiveIndex(index);
    });
    return () => unsubscribe();
  }, [scrollYProgress, segments]);

  const pathD = stops.map((stop, i) => {
    const absX = (stop.x / 100) * mapWidth;
    const absY = (stop.y / 100) * mapHeight;
    return `${i === 0 ? 'M' : 'L'} ${absX} ${absY}`;
  }).join(' ');

  return (
    <section ref={containerRef} className="relative w-full h-[800vh] bg-[#140309]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#140309] flex items-center justify-center perspective-[1200px]">
        
        {/* Title Overlay */}
        <motion.div 
          style={{ 
            opacity: titleOpacity,
            y: titleY,
          }}
          className="absolute top-[10vh] md:top-[15vh] left-0 right-0 z-50 pointer-events-none flex flex-col items-center px-4"
        >
          <h2 className="text-[#F6F3EE] font-serif text-4xl md:text-6xl italic tracking-wide">Obele at 50</h2>
          <h3 className="text-[#C7A24B] font-sans text-xl md:text-2xl tracking-widest uppercase mt-4">Exclusive Dublin Tour</h3>
          <p className="text-[#F6F3EE]/60 text-base md:text-lg mt-6 max-w-lg mx-auto font-light leading-relaxed">
            Join Obele Akinniranye for a curated tour through the heart of Dublin — history, charm & wonderful company.
          </p>
        </motion.div>

        {/* 3D Origin Wrapper: places its origin perfectly in the center of the viewport */}
        {windowSize.width > 0 && (
          <div className="w-0 h-0" style={{ transform: "rotateX(55deg)", transformStyle: "preserve-3d" }}>
            
            {/* Map Container moving strictly in X and Y within the rotated plane */}
            <motion.div
              className="absolute top-0 left-0"
              style={{
                width: mapWidth,
                height: mapHeight,
                x: mapX,
                y: mapY,
                transformStyle: "preserve-3d"
              }}
            >
              {/* Infinite Grid Background */}
              <div className="absolute inset-[-4000px] bg-[#1c0812] border border-[#C7A24B]/10 rounded-full shadow-[0_0_150px_rgba(199,162,75,0.05)]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px]"></div>
              </div>

              {/* SVG Connection Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))' }}>
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="#C7A24B" 
                  strokeWidth="4" 
                  strokeDasharray="15, 15" 
                  className="opacity-40" 
                />
              </svg>

              {/* Map Pins / Stops */}
              {stops.map((stop, i) => {
                const isActive = activeIndex === i;
                const isPassed = activeIndex > i;

                return (
                  <div
                    key={stop.id}
                    className="absolute flex flex-col items-center justify-end w-[240px] md:w-[300px] h-auto"
                    style={{
                      left: `${stop.x}%`,
                      top: `${stop.y}%`,
                      transform: 'translate(-50%, -100%) rotateX(-55deg)',
                      transformOrigin: 'bottom center',
                    }}
                  >
                    {/* Pin Card */}
                    <motion.div 
                      animate={{ 
                        scale: isActive ? 1 : 0.85,
                        opacity: isActive ? 1 : 0.3,
                        y: isActive ? -20 : 0,
                        z: isActive ? 50 : 0 // using z pushes the active card physically closer to the camera to solve z-index
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`relative w-full h-auto bg-[#140309] rounded-xl border ${isActive ? 'border-[#C7A24B]' : 'border-[#F6F3EE]/20'} p-4 shadow-2xl flex flex-col`}
                    >
                      <div className="w-full h-[140px] md:h-[160px] shrink-0 bg-[#2a2a2a] rounded-lg mb-4 overflow-hidden relative">
                        <img 
                          src={stop.img} 
                          alt={stop.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/shots/image 1.png'; }} // Fallback
                        />
                        <div className="absolute top-2 left-2 bg-[#140309]/80 backdrop-blur-md px-2 py-1 rounded text-[10px] md:text-xs text-[#C7A24B] font-sans tracking-widest">
                          STOP {stop.id < 10 ? `0${stop.id}` : stop.id}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-[#F6F3EE] font-serif text-lg md:text-xl mb-2 leading-tight">{stop.title}</h4>
                        <p className="text-[#F6F3EE]/70 font-sans text-sm md:text-base leading-relaxed">
                          {stop.desc}
                        </p>
                      </div>
                    </motion.div>

                    {/* Base Marker */}
                    <div className="relative mt-4 flex items-center justify-center">
                      <motion.div 
                        animate={{ scale: isActive ? 1.5 : 1, opacity: isActive ? 1 : 0.5 }}
                        className={`w-4 h-4 rounded-full ${isActive ? 'bg-[#C7A24B]' : (isPassed ? 'bg-[#C7A24B]/50' : 'bg-[#F6F3EE]/30')} shadow-[0_0_20px_rgba(199,162,75,0.5)]`}
                      />
                      {isActive && (
                        <motion.div 
                          animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-[#C7A24B]"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* HUD / Progress indicator */}
        <div className="absolute bottom-8 left-8 z-50 hidden md:flex items-center gap-4">
          <div className="text-[#C7A24B] font-serif text-5xl">
            {activeIndex + 1}<span className="text-[#F6F3EE]/30 text-3xl">/10</span>
          </div>
          <div className="w-px h-10 bg-[#C7A24B]/30" />
          <div className="text-[#F6F3EE]/80 font-sans tracking-widest uppercase text-base">
            {stops[activeIndex]?.title}
          </div>
        </div>
      </div>
    </section>
  );
}
