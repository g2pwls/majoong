import { create } from 'zustand';

interface UIState {
  // 모달 상태
  isModalOpen: boolean;
  modalType: string | null;
  modalData: any;

  // 네비게이션 상태
  isNavbarOpen: boolean;
  activeTab: string;
  selectedTab: string;

  // 폼 상태
  formData: Record<string, any>;
  formErrors: Record<string, string>;

  // 로딩 상태
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;

  // 액션
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  setNavbarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSelectedTab: (tab: string) => void;
  setFormData: (data: Record<string, any>) => void;
  updateFormData: (key: string, value: any) => void;
  setFormError: (key: string, error: string) => void;
  clearFormErrors: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  reset: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // 초기 상태
  isModalOpen: false,
  modalType: null,
  modalData: null,
  isNavbarOpen: false,
  activeTab: 'profile',
  selectedTab: 'intro',
  formData: {},
  formErrors: {},
  globalLoading: false,
  loadingStates: {},

  // 액션들
  openModal: (type: string, data?: any) => {
    set({
      isModalOpen: true,
      modalType: type,
      modalData: data,
    });
  },

  closeModal: () => {
    set({
      isModalOpen: false,
      modalType: null,
      modalData: null,
    });
  },

  setNavbarOpen: (open: boolean) => {
    set({ isNavbarOpen: open });
  },

  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
  },

  setSelectedTab: (tab: string) => {
    set({ selectedTab: tab });
  },

  setFormData: (data: Record<string, any>) => {
    set({ formData: data });
  },

  updateFormData: (key: string, value: any) => {
    const { formData } = get();
    set({
      formData: {
        ...formData,
        [key]: value,
      },
    });
  },

  setFormError: (key: string, error: string) => {
    const { formErrors } = get();
    set({
      formErrors: {
        ...formErrors,
        [key]: error,
      },
    });
  },

  clearFormErrors: () => {
    set({ formErrors: {} });
  },

  setGlobalLoading: (loading: boolean) => {
    set({ globalLoading: loading });
  },

  setLoadingState: (key: string, loading: boolean) => {
    const { loadingStates } = get();
    set({
      loadingStates: {
        ...loadingStates,
        [key]: loading,
      },
    });
  },

  reset: () => {
    set({
      isModalOpen: false,
      modalType: null,
      modalData: null,
      isNavbarOpen: false,
      activeTab: 'profile',
      selectedTab: 'intro',
      formData: {},
      formErrors: {},
      globalLoading: false,
      loadingStates: {},
    });
  },
}));
