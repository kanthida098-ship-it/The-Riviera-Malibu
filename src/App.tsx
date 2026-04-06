/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Twitter
} from 'lucide-react';
import { Modal } from './components/Modal';
import { UnitCard } from './components/UnitCard';
import { UnitListing } from './types';

const MOCK_UNITS: UnitListing[] = [
  {
    id: '1',
    type: 'sale',
    unitType: '1 Bedroom Luxury',
    size: '35 SQM',
    floor: 12,
    price: '฿4,500,000',
    view: 'Sea View (Koh Lan)',
    status: 'available',
    images: ['https://picsum.photos/seed/malibu1/800/600']
  },
  {
    id: '2',
    type: 'rent',
    unitType: '2 Bedroom Duplex',
    size: '110 SQM',
    floor: 15,
    price: '฿45,000/mo',
    view: 'Panoramic Pattaya Bay',
    status: 'available',
    images: ['https://picsum.photos/seed/malibu2/800/600']
  },
  {
    id: '3',
    type: 'sale',
    unitType: '3 Bedroom Sky Home',
    size: '125 SQM',
    floor: 27,
    price: '฿18,900,000',
    view: 'Sunset View',
    status: 'available',
    images: ['https://picsum.photos/seed/malibu3/800/600']
  },
  {
    id: '4',
    type: 'rent',
    unitType: '1 Bedroom Studio',
    size: '27 SQM',
    floor: 8,
    price: '฿18,000/mo',
    view: 'City View',
    status: 'available',
    images: ['https://picsum.photos/seed/malibu4/800/600']
  },
  {
    id: '5',
    type: 'sale',
    unitType: 'Penthouse Residence',
    size: '191 SQM',
    floor: 26,
    price: '฿35,000,000',
    view: '360° Ocean View',
    status: 'available',
    images: ['https://picsum.photos/seed/malibu5/800/600']
  },
  {
    id: '6',
    type: 'rent',
    unitType: '2 Bedroom Corner',
    size: '75 SQM',
    floor: 19,
    price: '฿32,000/mo',
    view: 'Jomtien Sea View',
    status: 'available',
    images: ['https://picsum.photos/seed/malibu6/800/600']
  }
];

export default function App() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openModal = (id: string) => setActiveModal(id);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-6'
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
            <button onClick={() => openModal('project')} className={`text-sm font-medium uppercase tracking-widest hover:text-gold-500 transition-colors ${scrolled ? 'text-neutral-700' : 'text-white'}`}>Project Info</button>
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
          <img 
            src="https://picsum.photos/seed/malibu-hero/1920/1080" 
            alt="The Riviera Malibu" 
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
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
              </ul>
            </div>
            
            <div>
              <h4 className="font-serif text-xl mb-6">Contact</h4>
              <ul className="space-y-4 text-neutral-400">
                <li className="flex items-center gap-3"><Phone size={18} className="text-gold-500" /> +66 81 234 5678</li>
                <li className="flex items-center gap-3"><Mail size={18} className="text-gold-500" /> info@malibu-agent.com</li>
                <li className="flex items-center gap-3"><MapPin size={18} className="text-gold-500" /> Pratumnak Soi 5, Pattaya</li>
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <img 
              src="https://picsum.photos/seed/project-info/800/600" 
              alt="Project" 
              className="rounded-xl shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-gold-800">The Riviera Malibu & Residences</h3>
              <p className="text-neutral-600 leading-relaxed">
                Developed by The Riviera Group, Pattaya's No.1 leading High-Rise Luxury Award Winning Property Developer. 
                The project is an iconic landmark designed to stand out with modern yet sophisticated features.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-neutral-700"><ChevronRight size={16} className="text-gold-500" /> 275 Luxury Fully Furnished Residences</li>
                <li className="flex items-center gap-2 text-neutral-700"><ChevronRight size={16} className="text-gold-500" /> 30 Storeys High-Rise</li>
                <li className="flex items-center gap-2 text-neutral-700"><ChevronRight size={16} className="text-gold-500" /> Located in Pratumnak Soi 5</li>
                <li className="flex items-center gap-2 text-neutral-700"><ChevronRight size={16} className="text-gold-500" /> Completion: December 2026</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-serif border-b border-gold-100 pb-2">Premium Facilities</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "18th Floor Sky Pool", "30th Floor Rooftop Pool", "Sunset Bar", 
                "15 Seater Cinema", "Golf Simulators", "Full Onsen Facility",
                "Bowling Alleys", "Fitness Gym", "Kids Club", "Arcade Room",
                "Shuttle Minivan", "24H Security & CCTV"
              ].map((fac, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-neutral-600 bg-gold-50/50 p-3 rounded-lg">
                  <Star size={14} className="text-gold-500" />
                  {fac}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 text-white p-8 rounded-xl">
            <h4 className="text-xl font-serif mb-4 text-gold-400 italic">"Reach for the Sky, Live Life to the Max"</h4>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Most residences enjoy sea views, many with wide ranging views covering both Jomtien and Pattaya due to the unique Peninsula coast line. 
              Smart home technology included: Dimmable mood lighting, USB portals, High-speed fibre optic, and AC remote control via mobile app.
            </p>
          </div>
        </div>
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
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
              />
            </div>
            <select className="px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20">
              <option>All Types</option>
              <option>For Sale</option>
              <option>For Rent</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_UNITS.map(unit => (
              <UnitCard 
                key={unit.id} 
                unit={unit} 
                onInquire={(u) => {
                  console.log('Inquiring about:', u);
                  openModal('contact');
                }} 
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
              <p className="text-neutral-600">
                Our team of experts is ready to help you find your dream home at The Riviera Malibu. 
                Schedule a private viewing or request more information today.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center text-gold-600">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Call Us</p>
                  <p className="text-lg font-medium">+66 81 234 5678</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center text-gold-600">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Line ID</p>
                  <p className="text-lg font-medium">@malibu_agent</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center text-gold-600">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Email</p>
                  <p className="text-lg font-medium">sales@malibu-agent.com</p>
                </div>
              </div>
            </div>
          </div>

          <form className="space-y-4 bg-gold-50 p-8 rounded-2xl border border-gold-100">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Full Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Email Address</label>
              <input type="email" className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Phone Number</label>
              <input type="tel" className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all" placeholder="+66..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">Message</label>
              <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all" placeholder="I'm interested in a 2 bedroom unit on a high floor..."></textarea>
            </div>
            <button className="w-full py-4 bg-gold-600 text-white rounded-lg font-bold hover:bg-gold-700 transition-all shadow-lg shadow-gold-200/50">
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
    </div>
  );
}
