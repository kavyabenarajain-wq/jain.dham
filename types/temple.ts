export interface Temple {
  placeId: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  photoReference?: string;
  sampradaya: 'digambar' | 'shvetambar' | 'sthanakvasi' | 'unknown';
  isOpen?: boolean;
  distance?: number;
  timings?: string;
}
