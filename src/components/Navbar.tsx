import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  Info, 
  MessageSquare, 
  Search, 
  X 
} from 'lucide-react';

interface NavbarProps {
  openModal: (id: string) => void;
  scrolledOverride?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ openModal, scrolledOverride }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';
  const effectiveScrolled = scrolledOverride ?? (isHomePage ? scrolled : true);

  const navLinks = [
    { name: 'Project Info', path: '/project-info', type: 'link' },
    { name: 'Available Units', type: 'modal', id: 'units' },
    { name: 'Contact Us', type: 'modal', id: 'contact' },
  ];

  const handleNavAction = (link: any) => {
    if (link.type === 'link') {
      navigate(link.path);
    } else {
      openModal(link.id);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${
      effectiveScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-base font-bold tracking-tight leading-none text-gold-500">
            The Riviera Malibu
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavAction(link)}
              className={`text-sm font-medium uppercase tracking-widest hover:text-gold-500 transition-colors ${
                effectiveScrolled ? 'text-neutral-700' : 'text-white'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => openModal('contact')}
            className="hidden sm:block px-6 py-2 bg-gold-600 text-white rounded-full text-sm font-semibold hover:bg-gold-700 transition-all shadow-lg hover:shadow-gold-200"
          >
            Inquire
          </button>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              effectiveScrolled ? 'text-neutral-900 hover:bg-neutral-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Search size={28} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-neutral-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <button 
                  key={link.name}
                  onClick={() => handleNavAction(link)} 
                  className="flex items-center gap-3 text-neutral-700 font-medium py-2"
                >
                  {link.name === 'Project Info' && <Info size={20} className="text-gold-600" />}
                  {link.name === 'Available Units' && <Building size={20} className="text-gold-600" />}
                  {link.name === 'Contact Us' && <MessageSquare size={20} className="text-gold-600" />}
                  {link.name}
                </button>
              ))}
              <button 
                onClick={() => { openModal('contact'); setIsMobileMenuOpen(false); }} 
                className="w-full py-3 bg-gold-600 text-white rounded-xl font-bold mt-2"
              >
                Inquire Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
