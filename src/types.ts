export interface UnitListing {
  id: string;
  title: string;
  location: string;
  size: string;
  floor: string;
  price: string;
  status: 'available' | 'reserved' | 'sold';
  images: string[];
  bedrooms: number;
  bathrooms: number;
  highlight: string;
  type: 'sale' | 'rent';
  createdAt?: any;
  updatedAt?: any;
}

export interface ImageMetadata {
  id: string;
  url: string;
  name: string;
  size: number;
  contentType: string;
  uploadedAt: any;
  uploadedBy: string;
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
