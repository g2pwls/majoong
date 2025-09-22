import { create } from 'zustand';
import { Farm } from '@/types/farm';

interface FarmState {
  // 상태
  farms: Farm[];
  currentFarm: Farm | null;
  isLoading: boolean;
  error: string | null;
  selectedTab: string;
  searchQuery: string;

  // 액션
  setFarms: (farms: Farm[]) => void;
  setCurrentFarm: (farm: Farm | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useFarmStore = create<FarmState>((set) => ({
  // 초기 상태
  farms: [],
  currentFarm: null,
  isLoading: false,
  error: null,
  selectedTab: 'intro',
  searchQuery: '',

  // 액션들
  setFarms: (farms) => set({ farms }),
  
  setCurrentFarm: (farm) => set({ currentFarm: farm }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  clearError: () => set({ error: null }),
  
  reset: () => set({
    farms: [],
    currentFarm: null,
    isLoading: false,
    error: null,
    selectedTab: 'intro',
    searchQuery: '',
  }),
}));
