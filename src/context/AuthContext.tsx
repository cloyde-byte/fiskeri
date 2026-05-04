import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, CatchLog } from '../types';

interface AuthContextType {
  user: User | null;
  catches: CatchLog[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addCatch: (catchData: Omit<CatchLog, 'id' | 'userId'>) => void;
  toggleFavoriteSpot: (spotId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USER: User = {
  id: 'demo',
  name: 'Demo Fisker',
  email: 'demo@fiskeri.dk',
  avatar: '🎣',
  catchCount: 3,
  favoriteSpots: ['limfjorden-hvalpsund', 'arresoe'],
  hasFisketegn: true,
  fisketegnExpiry: '2026-12-31',
  joinedDate: '2025-03-15',
};

const DEMO_CATCHES: CatchLog[] = [
  {
    id: 'c1',
    userId: 'demo',
    fishId: 'havørred',
    fishName: 'Havørred',
    weight: 1.8,
    length: 52,
    date: '2026-04-20',
    spotName: 'Køge Bugt',
    released: true,
    notes: 'Smuk fisk på Toby 20g',
  },
  {
    id: 'c2',
    userId: 'demo',
    fishId: 'gedde',
    fishName: 'Gedde',
    weight: 3.2,
    length: 70,
    date: '2026-04-15',
    spotName: 'Arresø',
    released: true,
    notes: 'Gummifisk langs sivranden',
  },
  {
    id: 'c3',
    userId: 'demo',
    fishId: 'makrel',
    fishName: 'Makrel',
    length: 32,
    date: '2026-04-10',
    spotName: 'Hirtshals',
    released: false,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [catches, setCatches] = useState<CatchLog[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('fiskeri_user');
    const savedCatches = localStorage.getItem('fiskeri_catches');
    if (saved) setUser(JSON.parse(saved));
    if (savedCatches) setCatches(JSON.parse(savedCatches));
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Demo login: accept any credentials or demo@fiskeri.dk
    const loggedIn = { ...DEMO_USER, email };
    setUser(loggedIn);
    setCatches(DEMO_CATCHES);
    localStorage.setItem('fiskeri_user', JSON.stringify(loggedIn));
    localStorage.setItem('fiskeri_catches', JSON.stringify(DEMO_CATCHES));
    return true;
  };

  const register = async (name: string, email: string, _password: string): Promise<boolean> => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: '🎣',
      catchCount: 0,
      favoriteSpots: [],
      hasFisketegn: false,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    setCatches([]);
    localStorage.setItem('fiskeri_user', JSON.stringify(newUser));
    localStorage.setItem('fiskeri_catches', JSON.stringify([]));
    return true;
  };

  const logout = () => {
    setUser(null);
    setCatches([]);
    localStorage.removeItem('fiskeri_user');
    localStorage.removeItem('fiskeri_catches');
  };

  const addCatch = (catchData: Omit<CatchLog, 'id' | 'userId'>) => {
    if (!user) return;
    const newCatch: CatchLog = {
      ...catchData,
      id: Date.now().toString(),
      userId: user.id,
    };
    const updated = [newCatch, ...catches];
    setCatches(updated);
    localStorage.setItem('fiskeri_catches', JSON.stringify(updated));
    const updatedUser = { ...user, catchCount: user.catchCount + 1 };
    setUser(updatedUser);
    localStorage.setItem('fiskeri_user', JSON.stringify(updatedUser));
  };

  const toggleFavoriteSpot = (spotId: string) => {
    if (!user) return;
    const favs = user.favoriteSpots.includes(spotId)
      ? user.favoriteSpots.filter(id => id !== spotId)
      : [...user.favoriteSpots, spotId];
    const updatedUser = { ...user, favoriteSpots: favs };
    setUser(updatedUser);
    localStorage.setItem('fiskeri_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, catches, login, register, logout, addCatch, toggleFavoriteSpot }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
