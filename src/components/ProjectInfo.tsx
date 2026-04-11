import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ZoomIn, ZoomOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectInfoProps {
  getImageUrl: (path: string) => string;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ getImageUrl }) => {
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const constraintsRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 pb-20 pt-20">
      <div className="w-full">
        {/* Featured Blogs (1-3) with Background */}
        <div 
          className="relative mb-10 overflow-hidden p-8 md:p-16"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0360074225.firebasestorage.app/o/images%2F1775790787699_XLO98IXXZ7644V7RDVBAY15Jybt40r4rluf.avif?alt=media&token=a3c79e40-4e3a-4976-9f7e-9a4c8b8c7003')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="relative z-10 space-y-10">
            {[
              {
                id: 'blog1',
                title: 'Welcome to The Riviera Malibu',
                desc: 'A luxury high-rise condominium located in one of Pratumnak’s most desirable areas, just minutes from the beach and Pattaya city.\n\nThe Riviera Malibu offers 275 fully furnished residences, many with stunning sea views across Jomtien and Pattaya Bay. Inspired by the iconic Malibu lifestyle, the development combines privacy, elegance, and world-class design.\n\nResidents enjoy an exceptional range of facilities, including sky pools, fitness center, sauna and onsen, private cinema, bowling alley, golf simulator, sky lounges, and 24-hour security. Smart home features and premium finishes ensure modern comfort throughout.\n\nDeveloped by the award-winning Riviera Group, this project delivers a true luxury living experience in one of Pattaya’s prime locations.',
                images: ['S__18235398.jpg', 'S__18235397.jpg']
              },
              {
                id: 'blog2',
                title: 'Your Facilities',
                desc: '🚀 High-speed residence lifts\n🔐 24-hour security & CCTV\n💳 Key card access control\n📶 Wi-Fi in all public areas\n🌿 Sky gardens & terraces throughout the project\n🏋️ Fully equipped cardio & weights fitness gym\n🏛️ Grand and spacious lobby\n🏊 18th floor sky pool (20m), large jacuzzi, kids pool & additional 18m infinity pool\n🧺 Full laundry & housekeeping services\n🍽️ All-day restaurant & bar with room service\n🎬 15-seat private luxury cinema\n⛳ 2 professional golf simulator rooms\n🏓 Table tennis room\n🧖 Onsen facilities with lockers, separate male & female sauna/steam rooms & Zen lounge\n🌇 29th floor resident lounge with arcade room, sky terrace & garden area\n🧸 Large kids club & separate arcade games room\n🎳 2 full-size entertainment bowling alleys with lounge\n🌅 Rooftop infinity pool & sunset relaxation garden\n🚐 Free shuttle service (arranged by juristic management)\n📦 Short & long-term storage facilities',
                images: ['ห้องนั่งเล่นสุดหรูและสนามกอล์ฟจำลอง.png', 'บรรยากาศโบว์ลิ่งแนวต่างๆ.png']
              }
            ].map((blog) => (
              <div key={blog.id} className="w-full space-y-4">
                <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight">{blog.title}</h2>
                <div className="text-neutral-300 text-sm md:text-base leading-relaxed space-y-3 whitespace-pre-line max-w-4xl">
                  {blog.desc}
                </div>
                
                {blog.images && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {blog.images.map((img) => (
                      <div 
                        key={img}
                        className="relative group cursor-zoom-in rounded-xl overflow-hidden shadow-lg border border-neutral-100"
                        onClick={() => {
                          setZoomImage(getImageUrl(img));
                          setZoomLevel(1);
                        }}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={blog.title}
                          className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.03]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Remaining Gallery Images */}
        <div 
          className="relative space-y-8 border-t border-neutral-800 pt-10 pb-24 px-6 md:px-16"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0360074225.firebasestorage.app/o/images%2F1775790787699_XLO98IXXZ7644V7RDVBAY15Jybt40r4rluf.avif?alt=media&token=a3c79e40-4e3a-4976-9f7e-9a4c8b8c7003')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-5xl font-serif text-white">Project Highlights</h3>
          </div>
          
          {Array.from({ length: 61 }, (_, i) => {
            const num = (i + 5).toString().padStart(4, '0');
            const path = `Info${num}.jpg`;
            return (
              <div 
                key={path} 
                className="relative group cursor-zoom-in bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800" 
                onClick={() => {
                  setZoomImage(getImageUrl(path));
                  setZoomLevel(1);
                }}
              >
                <img
                  src={getImageUrl(path)}
                  onError={(e) => {
                    // Hide broken images if they don't exist in storage
                    (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                  }}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  alt={`Project Info ${num}`}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 right-6 p-3 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={24} />
                </div>
                
                {/* Mobile indicator */}
                <div className="absolute bottom-4 right-4 md:hidden p-2 bg-black/30 backdrop-blur-sm rounded-lg text-white text-[10px] uppercase tracking-widest font-bold">
                  Tap to zoom
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-md"
          >
            {/* Fixed Zoom buttons at screen corner */}
            <div className="fixed top-6 right-6 flex gap-3 z-[1010]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(prev => Math.max(1, prev - 0.2));
                }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10"
                title="Zoom Out"
              >
                <ZoomOut size={28} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(prev => prev + 0.2);
                }}
                className="bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10"
                title="Zoom In"
              >
                <ZoomIn size={28} />
              </button>

              <button
                onClick={() => setZoomImage(null)}
                className="bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10"
                title="Close"
              >
                <X size={28} />
              </button>
            </div>

            {/* Image container */}
            <div ref={constraintsRef} className="relative z-10 flex items-center justify-center w-full h-full overflow-hidden p-4" onClick={() => setZoomImage(null)}>
              <motion.img
                key={`${zoomImage}-${zoomLevel}`}
                src={zoomImage || ''}
                alt="Zoom"
                initial={{ x: 0, y: 0 }}
                animate={{ scale: zoomLevel }}
                drag={zoomLevel > 1}
                dragConstraints={{
                  left: -800 * zoomLevel,
                  right: 800 * zoomLevel,
                  top: -800 * zoomLevel,
                  bottom: 800 * zoomLevel
                }}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                className={`max-h-full max-w-full object-contain pointer-events-auto ${zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onClick={(e) => e.stopPropagation()}
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
