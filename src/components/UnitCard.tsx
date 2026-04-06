import React from 'react';
import { UnitListing } from '../types';
import { Bed, Maximize, Building2, Tag } from 'lucide-react';

interface UnitCardProps {
  unit: UnitListing;
  onInquire: (unit: UnitListing) => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, onInquire }) => {
  return (
    <div className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={unit.images[0]}
          alt={unit.unitType}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            unit.type === 'sale' ? 'bg-gold-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {unit.type === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/90 text-neutral-800 backdrop-blur-sm">
            {unit.status}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-serif text-neutral-900">{unit.unitType}</h3>
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
          <div className="flex items-center gap-2 text-neutral-600 text-sm col-span-2">
            <Tag size={16} className="text-gold-500" />
            <span>{unit.view}</span>
          </div>
        </div>
        
        <button
          onClick={() => onInquire(unit)}
          className="w-full py-3 bg-neutral-900 text-white rounded-lg hover:bg-gold-700 transition-colors font-medium tracking-wide"
        >
          Inquire Now
        </button>
      </div>
    </div>
  );
};
