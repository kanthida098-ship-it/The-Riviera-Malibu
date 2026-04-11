import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from 'emailjs-com';
import { Modal } from './Modal';
import { UnitListing } from '../types';
import { 
  ChevronLeft, 
  ChevronRight,
  MapPin, 
  Maximize, 
  Building2, 
  Tag, 
  Info, 
  Waves, 
  Shield, 
  Star,
  MessageSquare,
  Phone,
  Mail,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UnitDetailsProps {
  getImageUrl: (path: string) => string;
}

export const UnitDetails: React.FC<UnitDetailsProps> = ({ getImageUrl }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<UnitListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const constraintsRef = useRef(null);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const unitDetails = unit ? `
Unit Details:
- Title: ${unit.title}
- Price: ${unit.price}
- Size: ${unit.size}
- Floor: ${unit.floor}
- Type: For ${unit.type}
` : '';

    emailjs.send(
      'service_contact',
      'template_krbblyu',
      {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        message: `Inquiry for Unit: ${unit?.title}\n${unitDetails}\nCustomer Message:\n${e.target.message.value}`,
      },
      'mL6DNKjxsYq8zbpns'
    )
      .then(() => {
        setShowSuccess(true);
        setIsContactModalOpen(false);
        e.target.reset();
      })
      .catch(() => {
        alert('Failed to send message');
      });
  };

  useEffect(() => {
    const fetchUnit = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'units', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUnit({ id: docSnap.id, ...docSnap.data() } as UnitListing);
        }
      } catch (error) {
        console.error("Error fetching unit:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <h2 className="text-2xl font-serif mb-4">Unit not found</h2>
        <Link to="/" className="text-gold-600 hover:underline flex items-center gap-2">
          <ChevronLeft size={20} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 pt-20">
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div 
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl cursor-zoom-in group"
              onClick={() => setShowZoom(true)}
            >
              <img 
                src={getImageUrl(unit.images[activeImage])} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={unit.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${unit.type === 'sale' ? 'bg-gold-600 text-white' : 'bg-blue-600 text-white'}`}>
                  For {unit.type}
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white/90 text-neutral-800 backdrop-blur-sm">
                  {unit.status}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={24} />
              </div>

              {/* Navigation Arrows */}
              {unit.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((prev) => (prev === 0 ? unit.images.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((prev) => (prev === unit.images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {unit.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === index ? 'border-gold-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details & Project Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-serif text-neutral-900 mb-2">{unit.title}</h1>
              <div className="flex items-center gap-2 text-neutral-500 mb-4">
                <MapPin size={18} className="text-gold-500" />
                <span>{unit.location}, Pattaya</span>
              </div>
              <p className="text-3xl font-bold text-gold-700">{unit.price}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 py-8 border-y border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-50 rounded-xl text-gold-600">
                  <Maximize size={24} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Size</p>
                  <p className="font-medium">{unit.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-50 rounded-xl text-gold-600">
                  <Building2 size={24} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Floor</p>
                  <p className="font-medium">Floor {unit.floor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-50 rounded-xl text-gold-600">
                  <Info size={24} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Status</p>
                  <p className="font-medium capitalize">{unit.status}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-serif">Unit Highlights</h3>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                {unit.highlight || "Experience luxury living at its finest in this meticulously designed residence at The Riviera Malibu."}
              </p>
            </div>

            {/* Project Info Section */}
            <div className="bg-neutral-900 text-white p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <Building2 className="text-gold-500" size={28} />
                <h3 className="text-2xl font-serif">Project Overview</h3>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                The Riviera Malibu & Residences is a luxury high-rise condominium located in the heart of Pratumnak Soi 5, Pattaya. 
                Designed with a "Living Life, Famously" concept, it offers world-class facilities and iconic architecture.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Waves size={16} className="text-gold-500" />
                  <span>Sky Infinity Pools</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield size={16} className="text-gold-500" />
                  <span>24/7 Premium Security</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star size={16} className="text-gold-500" />
                  <span>Hollywood Style Lobby</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-gold-500" />
                  <span>5 Min to Beach</span>
                </div>
              </div>
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="w-full py-4 bg-gold-600 text-white rounded-xl font-bold hover:bg-gold-700 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={20} /> Inquire About This Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {showZoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowZoom(false)}
          >
            <div className="fixed top-6 right-6 flex gap-3 z-[110]">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(prev => Math.max(1, prev - 0.2));
                }}
                className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10"
                title="Zoom Out"
              >
                <ZoomOut size={28} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(prev => prev + 0.2);
                }}
                className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10"
                title="Zoom In"
              >
                <ZoomIn size={28} />
              </button>
              <button 
                onClick={() => {
                  setShowZoom(false);
                  setZoomLevel(1);
                }}
                className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10"
                title="Close"
              >
                <X size={28} />
              </button>
            </div>

            <div ref={constraintsRef} className="relative overflow-hidden flex items-center justify-center w-full h-full pointer-events-none">
              <motion.img 
                key={`${activeImage}-${zoomLevel}`}
                src={getImageUrl(unit.images[activeImage])} 
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
                alt="Zoomed"
                referrerPolicy="no-referrer"
              />

              {/* Zoom Modal Navigation Arrows */}
              {unit.images.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((prev) => (prev === 0 ? unit.images.length - 1 : prev - 1));
                      setZoomLevel(1);
                    }}
                    className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10 pointer-events-auto"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((prev) => (prev === unit.images.length - 1 ? 0 : prev + 1));
                      setZoomLevel(1);
                    }}
                    className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10 pointer-events-auto"
                  >
                    <ChevronRight size={32} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 overflow-x-auto max-w-full px-6 py-4 bg-black/50 backdrop-blur-md rounded-2xl">
              {unit.images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(index);
                    setZoomLevel(1);
                  }}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === index ? 'border-gold-500' : 'border-transparent opacity-50'}`}
                >
                  <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Inquire About This Project"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif text-neutral-900 mb-2">{unit.title}</h3>
              <p className="text-gold-700 font-bold text-xl mb-4">{unit.price}</p>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-gold-50 rounded-2xl border border-gold-100">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Maximize size={16} className="text-gold-600" />
                  <span className="text-sm font-medium">{unit.size}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Building2 size={16} className="text-gold-600" />
                  <span className="text-sm font-medium">Floor {unit.floor}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden shadow-lg border border-neutral-100 mt-6">
              <img 
                src={getImageUrl(unit.images[0])} 
                alt={unit.title} 
                className="w-full h-48 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Our team is ready to provide you with all the details, 
              pricing, and a private viewing schedule for this residence.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Phone Number</label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Message</label>
              <textarea
                name="message"
                rows={4}
                placeholder="Write your message..."
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition duration-200"
              />
            </div>
            <button type="submit" className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition duration-200">
              Send Inquiry
            </button>
          </form>
        </div>
      </Modal>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-serif text-gold-700 mb-3">Inquiry Sent</h2>
            <p className="text-neutral-600 mb-6">Our agent will contact you shortly regarding {unit.title}.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
