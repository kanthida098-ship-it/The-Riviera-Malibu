import React from 'react';
import { Link } from 'react-router-dom';
import { UnitListing } from '../types';
import { Bed, Maximize, Building2, Tag } from 'lucide-react';

interface UnitCardProps {
  unit: UnitListing;
  onInquire: (unit: UnitListing) => void;
  getImageUrl: (path: string) => string;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, onInquire, getImageUrl }) => {
  return (
    <div className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      <Link to={`/unit/${unit.id}`} className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl(unit.images[0])}
          alt={unit.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${unit.type === 'sale'
              ? 'bg-gold-600 text-white'
              : 'bg-blue-600 text-white'
            }`}>
            {unit.type === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/90 text-neutral-800 backdrop-blur-sm">
            {unit.status}
          </span>
        </div>
      </Link>
      <div className="p-5 flex-grow">
        <div className="mb-4">
          <Link to={`/unit/${unit.id}`}>
            <h3 className="text-xl font-serif text-neutral-900 hover:text-gold-600 transition-colors mb-1">{unit.title}</h3>
          </Link>
          <p className="text-gold-700 font-bold text-lg">{unit.price}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-neutral-600 text-sm">
            <Maximize size={16} className="text-gold-500" />
            <span>{unit.size}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600 text-sm">
            <Building2 size={16} className="text-gold-500" />
            <span>Floor {unit.floor}</span>
          </div>
        </div>

        <Link
          to={`/unit/${unit.id}`}
          className="w-full py-3 bg-neutral-900 text-white rounded-lg hover:bg-gold-700 transition-colors font-medium tracking-wide block text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};
