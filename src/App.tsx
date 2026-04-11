/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import emailjs from 'emailjs-com';
import { 
  Routes, 
  Route, 
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AdminPanel } from './components/AdminPanel';
import { UnitDetails } from './components/UnitDetails';
import { ProjectInfo } from './components/ProjectInfo';
import { Navbar } from './components/Navbar';

import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Info,
  Search,
  MessageSquare,
  ChevronRight,
  Star,
  Shield,
  Waves,
  Instagram,
  Facebook,
  Twitter,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';
import { Modal } from './components/Modal';
import { UnitCard } from './components/UnitCard';
import { UnitListing } from './types';


export default function App() {
  const [units, setUnits] = useState<UnitListing[]>([]);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [interestedUnit, setInterestedUnit] = useState<UnitListing | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const openModal = (id: string, unit?: UnitListing) => {
    if (unit) setInterestedUnit(unit);
    else if (id === 'contact') setInterestedUnit(null);
    setActiveModal(id);
  };
  const closeModal = () => setActiveModal(null);
  const location = useLocation();

  useEffect(() => {
    closeModal();
  }, [location]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    emailjs.send(
      'service_contact',
      'template_krbblyu',
      {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        message: `${e.target.message.value}${interestedUnit ? `\n\n--- Interested Unit Details ---\nUnit: ${interestedUnit.title}\nPrice: ${interestedUnit.price}\nLocation: ${interestedUnit.location}\nSize: ${interestedUnit.size}\nFloor: ${interestedUnit.floor}` : ''}`,
      },
      'mL6DNKjxsYq8zbpns'
    )
      .then(() => {
        setShowSuccess(true);
        e.target.reset();
      })
      .catch(() => {
        alert('Failed to send message');
      });
  };

  useEffect(() => {
    const q = query(collection(db, 'units'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const u = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnitListing));
      setUnits(u);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'units');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'images'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const map: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.name && data.url) {
          map[data.name] = data.url;
        }
      });
      setImageMap(map);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'images');
    });
    return () => unsubscribe();
  }, []);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const filename = path.startsWith('/') ? path.substring(1) : path;
    
    if (imageMap[filename]) return imageMap[filename];
    
    const bucket = "gen-lang-client-0360074225.firebasestorage.app";
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filename)}?alt=media`;
  };

  return (
    <>
      <Navbar openModal={openModal} />
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/unit/:id" element={<UnitDetails getImageUrl={getImageUrl} />} />
        <Route path="/project-info" element={<ProjectInfo getImageUrl={getImageUrl} />} />
        <Route path="/" element={<MainSite getImageUrl={getImageUrl} imageMap={imageMap} units={units} openModal={openModal} />} />
      </Routes>

      {/* Global Modals */}
      <Modal
        isOpen={activeModal === 'units'}
        onClose={closeModal}
        title="Available Units"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {units.map((unit) => (
              <UnitCard 
                key={unit.id} 
                unit={unit} 
                getImageUrl={getImageUrl} 
                onInquire={(u) => openModal('contact', u)}
              />
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'contact'}
        onClose={closeModal}
        title="Contact Our Agent"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-serif mb-4">Get in Touch</h3>
              <p className="text-neutral-600 mb-6">
                {interestedUnit ? (
                  <>You are inquiring about <span className="font-bold text-gold-600">{interestedUnit.title}</span>. Our team will provide you with full details and availability.</>
                ) : (
                  <>Our team of experts is ready to help you find your dream home at The Riviera Malibu & Residences. Schedule a private viewing or request more information today.</>
                )}
              </p>
              <div className="rounded-xl overflow-hidden shadow-lg border border-neutral-100">
                <img 
                  src={getImageUrl("Background.jpg")} 
                  alt="The Riviera Malibu" 
                  className="w-full h-64 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Phone Number</label>
              <input
                name="phone"
                type="tel"
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

      <Modal
        isOpen={activeModal === 'location'}
        onClose={closeModal}
        title="Project Location"
      >
        <div className="space-y-6">
          <div className="aspect-video bg-neutral-200 rounded-xl overflow-hidden relative">
            {/* Mock Map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="text-red-500 mx-auto mb-2 animate-bounce" />
                <p className="font-serif text-xl">Pratumnak Soi 5, Pattaya</p>
                <p className="text-neutral-500">The Riviera Malibu & Residences</p>
              </div>
            </div>
            <img
              src="https://picsum.photos/seed/map/1200/800?blur=2"
              alt="Map Background"
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-serif">Prime Location</h4>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Conveniently located close to Pattaya Centre, but with enough distance away to provide a private and secure residence.
                Elevated in a quiet location in the highly desirable Soi 5, Pratumnak.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-serif">Nearby Landmarks</h4>
              <ul className="grid grid-cols-2 gap-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Yinyom Beach (5 min)</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Pattaya Park</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Big Buddha Hill</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Bali Hai Pier</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Walking Street</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-gold-500" /> Jomtien Beach</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-serif text-gold-700 mb-3">Inquiry Sent</h2>
            <p className="text-neutral-600 mb-6">Our agent will contact you shortly.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MainSite({ getImageUrl, imageMap, units, openModal }: { getImageUrl: (path: string) => string, imageMap: any, units: UnitListing[], openModal: (id: string) => void }) {
  const navigate = useNavigate();
  const [selectedUnit, setSelectedUnit] = useState<UnitListing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');

  const handleInquire = (unit: UnitListing) => {
    setSelectedUnit(unit);
    setCurrentImageIndex(0);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredUnits = units.filter(unit => {
    const matchesSearch = 
      unit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'All Types' || 
      (filterType === 'For Sale' && unit.type === 'sale') ||
      (filterType === 'For Rent' && unit.type === 'rent');

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={getImageUrl("Background.jpg")} alt="The Riviera Malibu" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-neutral-50" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold-400 uppercase tracking-[0.4em] font-semibold text-sm mb-4 block">
              Living Life, Famously
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-serif mb-8 leading-tight">
              The Riviera Malibu <br />
              <span className="italic">& Residences</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              A Luxury High-Rise Condominium located in the heart of Pratumnak Soi 5.
              Experience the Beverly Hills lifestyle right here in Pattaya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openModal('units')}
                className="px-10 py-4 bg-gold-600 text-white rounded-full font-bold text-lg hover:bg-gold-700 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                Available Units <ChevronRight size={20} />
              </button>
              <button
                onClick={() => navigate('/project-info')}
                className="px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                Project Details <Info size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-4xl font-serif text-gold-600 mb-2">275</p>
              <p className="text-neutral-500 uppercase tracking-widest text-xs font-semibold">Luxury Units</p>
            </div>
            <div>
              <p className="text-4xl font-serif text-gold-600 mb-2">30</p>
              <p className="text-neutral-500 uppercase tracking-widest text-xs font-semibold">Storeys</p>
            </div>
            <div>
              <p className="text-4xl font-serif text-gold-600 mb-2">5 Min</p>
              <p className="text-neutral-500 uppercase tracking-widest text-xs font-semibold">To Beach</p>
            </div>
            <div>
              <p className="text-4xl font-serif text-gold-600 mb-2">2026</p>
              <p className="text-neutral-500 uppercase tracking-widest text-xs font-semibold">Completion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Highlights */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif mb-4">World-Class Facilities</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Waves, title: "Sky Infinity Pools", desc: "Multiple pools on 18th and 30th floors with breathtaking panoramic ocean views." },
              { icon: Shield, title: "Exclusive Privacy", desc: "Highly desirable luxury with just enough privacy to keep the cameras away." },
              { icon: Star, title: "Hollywood Vibes", desc: "Designed to stand out with iconic architecture and sophisticated features." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-lg transition-shadow">
                <item.icon className="text-gold-600 mb-6" size={48} />
                <h3 className="text-2xl font-serif mb-4">{item.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex flex-col">
                  <span className="font-serif text-base font-bold tracking-tight leading-none text-gold-500">
                    The Riviera Malibu
                  </span>
                </div>
              </div>
              <p className="text-neutral-400 max-w-md mb-8 leading-relaxed">
                Your trusted partner for luxury real estate in Pattaya. We specialize in high-end properties and investment opportunities at The Riviera Malibu & Residences.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-gold-600 transition-colors"><Instagram size={20} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-gold-600 transition-colors"><Facebook size={20} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-gold-600 transition-colors"><Twitter size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-xl mb-6">Quick Links</h4>
              <ul className="space-y-4 text-neutral-400">
                <li><button onClick={() => openModal('project')} className="hover:text-gold-400 transition-colors">Project Overview</button></li>
                <li><button onClick={() => openModal('units')} className="hover:text-gold-400 transition-colors">Available Units</button></li>
                <li><button onClick={() => openModal('contact')} className="hover:text-gold-400 transition-colors">Contact Agent</button></li>
                <li><button onClick={() => openModal('location')} className="hover:text-gold-400 transition-colors">Location Map</button></li>
                <li><Link to="/admin" className="hover:text-gold-400 transition-colors">Admin Login</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-neutral-500 text-sm">
            <p>© 2024 The Riviera Malibu Agent. All rights reserved. | Designed for Luxury Living.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
    </div>
  );
}
