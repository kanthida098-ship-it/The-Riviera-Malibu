/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import emailjs from 'emailjs-com';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link,
  useLocation
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
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/unit/:id" element={<UnitDetails getImageUrl={getImageUrl} />} />
        <Route path="/" element={<MainSite getImageUrl={getImageUrl} imageMap={imageMap} units={units} />} />
      </Routes>
    </Router>
  );
}

function MainSite({ getImageUrl, imageMap, units }: { getImageUrl: (path: string) => string, imageMap: any, units: UnitListing[] }) {
  const [selectedUnit, setSelectedUnit] = useState<UnitListing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');

  const handleInquire = (unit: UnitListing) => {
    setSelectedUnit(unit);
    setCurrentImageIndex(0);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    emailjs.send(
      'service_contact',
      'template_krbblyu',
      {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        message: e.target.message.value,
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

  const openModal = (id: string) => setActiveModal(id);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-6'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className={scrolled ? 'text-gold-600' : 'text-white'} size={32} />
            <div className="flex flex-col">
              <span className={`font-serif text-xl font-bold tracking-tight leading-none ${scrolled ? 'text-neutral-900' : 'text-white'}`}>
                MALIBU
              </span>
              <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${scrolled ? 'text-gold-600' : 'text-gold-300'}`}>
                RESIDENCES
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setShowModal(true)} className={`text-sm font-medium uppercase tracking-widest hover:text-gold-500 transition-colors ${scrolled ? 'text-neutral-700' : 'text-white'}`}>Project Info</button>
            <button onClick={() => openModal('units')} className={`text-sm font-medium uppercase tracking-widest hover:text-gold-500 transition-colors ${scrolled ? 'text-neutral-700' : 'text-white'}`}>Available Units</button>
            <button onClick={() => openModal('contact')} className={`text-sm font-medium uppercase tracking-widest hover:text-gold-500 transition-colors ${scrolled ? 'text-neutral-700' : 'text-white'}`}>Contact Us</button>
          </div>

          <button
            onClick={() => openModal('contact')}
            className="px-6 py-2 bg-gold-600 text-white rounded-full text-sm font-semibold hover:bg-gold-700 transition-all shadow-lg hover:shadow-gold-200"
          >
            Inquire
          </button>
        </div>
      </nav>

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
                View Listings <ChevronRight size={20} />
              </button>
              <button
                onClick={() => openModal('project')}
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
                <Building className="text-gold-500" size={32} />
                <span className="font-serif text-2xl font-bold tracking-tight">MALIBU AGENT</span>
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
      <Modal
        isOpen={activeModal === 'project'}
        onClose={closeModal}
        title="Project Information"
      >
        <img
          src={getImageUrl("Info0002.jpg")}
          alt="Project"
          className="rounded-xl shadow-lg"
          referrerPolicy="no-referrer"
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'units'}
        onClose={closeModal}
        title="Available Units (Sale & Rent)"
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search unit type, view, or price..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
              />
            </div>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              <option>All Types</option>
              <option>For Sale</option>
              <option>For Rent</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.length > 0 ? filteredUnits.map(unit => (
              <UnitCard
                key={unit.id}
                unit={unit}
                getImageUrl={getImageUrl}
                onInquire={(u) => {
                  handleInquire(u);
                  console.log('Inquiring about:', u);
                }}
              />
            )) : (
              <div className="col-span-full py-20 text-center text-neutral-500">
                <p>No units found matching your criteria.</p>
              </div>
            )}
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
              <p className="text-neutral-600">
                Our team of experts is ready to help you find your dream home at The Riviera Malibu & Residences.
                Schedule a private viewing or request more information today.
              </p>
              <img
                src={getImageUrl("IMG_0307.jpg")}
                alt="Luxury property"
                className="w-full h-56 object-cover rounded-2xl mt-6 shadow-lg"
              />
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Content */}
          <div className="relative z-10 max-w-5xl w-full mx-4">

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-14 right-0 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10 z-20"
              title="Close"
            >
              <X size={24} />
            </button>

            {/* Scroll vertical like document */}
            <div className="max-h-[85vh] overflow-y-auto space-y-6 pr-2">
              {/* Show Info0002 to Info0065 */}
              {Array.from({ length: 64 }, (_, i) => {
                const num = (i + 2).toString().padStart(4, '0');
                const path = `Info${num}.jpg`;
                return (
                  <div key={path} className="relative group cursor-zoom-in" onClick={() => {
                    setZoomImage(getImageUrl(path));
                    setZoomLevel(1);
                  }}>
                    <img
                      src={getImageUrl(path)}
                      onError={(e) => {
                        // Hide broken images if they don't exist in storage
                        (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                      }}
                      className="w-full rounded-lg shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
                      alt={`Project Info ${num}`}
                    />
                    <div className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn size={20} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Caption */}
            <div className="mt-6 text-center text-white">
              <h3 className="text-2xl font-serif tracking-wide">
                The Riviera Malibu
              </h3>
              <p className="text-neutral-300 text-sm mt-1">
                Luxury beachfront living in Pattaya
              </p>
            </div>

          </div>
        </div>
      )}
      {selectedUnit && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
          onClick={() => setSelectedUnit(null)}
        >

          {/* ปุ่มปิด */}
          <button
            onClick={() => setSelectedUnit(null)}
            className="absolute top-6 right-6 text-white text-3xl z-[10000]"
          >
            ✕
          </button>

          {/* ปุ่มซ้าย */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((prev) =>
                prev === 0 ? selectedUnit.images.length - 1 : prev - 1
              );
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 px-4 py-3 rounded-full text-white text-3xl z-[10000] transition-all hover:scale-110"
          >
            ‹
          </button>
          {/* รูป */}
          <img
            src={getImageUrl(selectedUnit.images[currentImageIndex])}
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            referrerPolicy="no-referrer"
          />

          {/* ปุ่มขวา */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((prev) =>
                prev === selectedUnit.images.length - 1 ? 0 : prev + 1
              );
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 px-4 py-3 rounded-full text-white text-3xl z-[10000] transition-all hover:scale-110"
          >
            ›
          </button>
        </div>
      )}

      {zoomImage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">

          {/* Background */}
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
            onClick={() => setZoomImage(null)}
          />

          {/* 🔥 Fixed Zoom buttons at screen corner */}
          <div className="fixed top-6 right-6 flex gap-3 z-[1010]">
            {/* Zoom Out */}
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

            {/* Zoom In */}
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

            {/* Close Zoom */}
            <button
              onClick={() => setZoomImage(null)}
              className="bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl border border-white/10"
              title="Close"
            >
              <X size={28} />
            </button>
          </div>

          {/* Image container */}
          <div className="relative z-10 flex flex-col items-center pointer-events-none">
            {/* Image */}
            <img
              src={zoomImage}
              alt="Zoom"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-300 pointer-events-auto"
            />
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">

            <h2 className="text-2xl font-serif text-gold-700 mb-3">
              Inquiry Sent
            </h2>

            <p className="text-neutral-600 mb-6">
              Our agent will contact you shortly.
            </p>

            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition"
            >
              Close
            </button>

          </div>

        </div>
      )}
    </div >
  );
}
