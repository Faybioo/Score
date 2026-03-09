export interface User {
  id: string;
  email: string;
  name: string;
  role: 'fan' | 'admin';
}

export interface TravelPackage {
  match?: {
    city: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
  };
  flight: {
    arrival: { code: string };
    departure: { code: string };
    airline: string;
  };
  hotel: {
    name: string;
    location: string;
  };
  totalPrice: number;
}

export interface SavedItinerary {
  id: string;
  name: string;
  package: TravelPackage;
  savedAt: string;
}

export interface AppContextType {
  user: User | null;
  login: (email: string, password: string, role: 'fan' | 'admin') => Promise<void>;
  logout: () => void;
  
  savedItineraries?: SavedItinerary[];
  saveItinerary?: (pkg: TravelPackage, name?: string) => void;
  deleteItinerary?: (id: string) => void;
  renameItinerary?: (id: string, newName: string) => void;
}