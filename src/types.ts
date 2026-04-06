export interface UnitListing {
  id: string;
  type: 'sale' | 'rent';
  unitType: string;
  size: string;
  floor: number;
  price: string;
  view: string;
  status: 'available' | 'reserved' | 'sold';
  images: string[];
}

export interface ProjectInfo {
  name: string;
  location: string;
  developer: string;
  totalUnits: number;
  completionDate: string;
  facilities: string[];
  highlights: string[];
}
