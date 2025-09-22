import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearTokens } from '@/services/authService';
import { getFarmerInfo, getDonatorInfo } from '@/services/userService';

export type UserRole = 'FARMER' | 'DONATOR' | 'ADMIN';

interface FarmerInfo {
  role: string;
  nameString: string;
  email: string;
  walletAddress: string;
  businessNum: string;
  farmName: string;
}

interface DonatorInfo {
  role: string;
  nameString: string;
  email: string;
  walletAddress: string;
}

interface AuthState {
  // 상태
  isLoggedIn: boolean;
  userRole: UserRole | null;
  farmerInfo: FarmerInfo | null;
  donatorInfo: DonatorInfo | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  login: (role: UserRole) => void;
  logout: () => void;
  setUserInfo: (farmerInfo?: FarmerInfo, donatorInfo?: DonatorInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadUserData: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isLoggedIn: false,
      userRole: null,
      farmerInfo: null,
      donatorInfo: null,
      isLoading: false,
      error: null,

      // 액션들
      login: (role: UserRole) => {
        set({ 
          isLoggedIn: true, 
          userRole: role,
          error: null 
        });
      },

      logout: () => {
        clearTokens();
        set({
          isLoggedIn: false,
          userRole: null,
          farmerInfo: null,
          donatorInfo: null,
          error: null
        });
      },

      setUserInfo: (farmerInfo, donatorInfo) => {
        set({ 
          farmerInfo: farmerInfo || null, 
          donatorInfo: donatorInfo || null 
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      loadUserData: async () => {
        const { userRole } = get();
        
        if (!userRole) {
          set({ error: '사용자 역할을 찾을 수 없습니다.' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          if (userRole === 'FARMER') {
            const farmerData = await getFarmerInfo();
            set({ 
              farmerInfo: farmerData.result,
              isLoading: false 
            });
          } else if (userRole === 'DONATOR') {
            const donatorData = await getDonatorInfo();
            set({ 
              donatorInfo: donatorData.result,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('사용자 데이터 로드 오류:', error);
          set({ 
            error: '사용자 정보를 불러오는데 실패했습니다.',
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        userRole: state.userRole,
        farmerInfo: state.farmerInfo,
        donatorInfo: state.donatorInfo,
      }),
    }
  )
);
