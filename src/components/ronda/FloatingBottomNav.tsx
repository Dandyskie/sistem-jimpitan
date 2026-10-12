import React from 'react';
import { Home, Banknote, Clock, Users } from 'lucide-react';

export type PetugasTab = 'beranda' | 'tarikan' | 'riwayat' | 'warga';

interface FloatingBottomNavProps {
  currentTab: PetugasTab;
  onSelectTab: (tab: PetugasTab) => void;
}

const NAV_ITEMS: { id: PetugasTab; label: string; icon: React.ElementType }[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'tarikan', label: 'Tarikan', icon: Banknote },
  { id: 'riwayat', label: 'Riwayat', icon: Clock },
  { id: 'warga', label: 'Warga', icon: Users },
];

/**
 * Bar navigasi mengambang (Floating Bottom Nav) presisi sesuai mobile-reference1.webp
 */
export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto pointer-events-none">
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.12)] p-1.5 flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-50/90 text-red-600 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 active:scale-95'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.8} />
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default FloatingBottomNav;
