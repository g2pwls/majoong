// 사용자 정보 관련 API 서비스 함수

import { authApi } from './authService';
import type { 
  FarmerInfoResponse, 
  DonatorInfoResponse, 
  FavoriteFarmsResponse, 
  DonationHistoryRequest, 
  DonationHistoryResponse, 
  DonationDetailResponse, 
  MyFarmResponse,
  FarmerDonationHistoryRequest,
  FarmerDonationHistoryResponse
} from '@/types/user';

// 목장주 정보 조회 API
export const getFarmerInfo = async (): Promise<FarmerInfoResponse> => {
  try {
    console.log('목장주 정보 조회 API 호출 시작');
    
    const response = await authApi.get<FarmerInfoResponse>('/api/v1/members/farmers');
    
    console.log('목장주 정보 조회 API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('목장주 정보 조회 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 기부자 정보 조회 API
export const getDonatorInfo = async (): Promise<DonatorInfoResponse> => {
  try {
    console.log('기부자 정보 조회 API 호출 시작');
    
    const response = await authApi.get<DonatorInfoResponse>('/api/v1/members/donators');
    
    console.log('기부자 정보 조회 API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('기부자 정보 조회 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 즐겨찾기 농장 조회 API
export const getFavoriteFarms = async (): Promise<FavoriteFarmsResponse> => {
  try {
    console.log('즐겨찾기 농장 조회 API 호출 시작');
    
    const response = await authApi.get<FavoriteFarmsResponse>('/api/v1/members/donators/bookmarks');
    
    console.log('즐겨찾기 농장 조회 API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('즐겨찾기 농장 조회 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 기부내역 조회 API
export const getDonationHistory = async (params: DonationHistoryRequest = {}): Promise<DonationHistoryResponse> => {
  try {
    console.log('기부내역 조회 API 호출 시작:', params);
    
    // 쿼리 파라미터 생성
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `/api/v1/members/donators/donations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await authApi.get<DonationHistoryResponse>(url);
    
    console.log('기부내역 조회 API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('기부내역 조회 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 기부 상세 조회 API
export const getDonationDetail = async (donationHistoryId: number): Promise<DonationDetailResponse> => {
  try {
    console.log('기부 상세 조회 API 호출 시작:', donationHistoryId);
    
    const response = await authApi.get<DonationDetailResponse>(`/api/v1/members/donators/donations/${donationHistoryId}`);
    
    console.log('기부 상세 조회 API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('기부 상세 조회 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 목장주 나의 목장 조회 API
export const getMyFarm = async (): Promise<MyFarmResponse> => {
  try {
    console.log('나의 목장 조회 API 호출 시작');
    
    const response = await authApi.get<MyFarmResponse>('/api/v1/farms/my-farm');
    
    console.log('나의 목장 조회 API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('나의 목장 조회 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 즐겨찾기 삭제 API
export const removeFavoriteFarm = async (farmUuid: string): Promise<{ isSuccess: boolean; message: string }> => {
  try {
    console.log('즐겨찾기 삭제 API 호출 시작:', farmUuid);
    
    const response = await authApi.delete(`/api/v1/members/donators/bookmarks/farms/${farmUuid}`);
    
    console.log('즐겨찾기 삭제 API 응답:', response.data);
    return {
      isSuccess: response.data.isSuccess,
      message: response.data.message
    };
  } catch (error: unknown) {
    console.error('즐겨찾기 삭제 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 목장주 거래내역 조회 API
export const getFarmerDonationHistory = async (
  params: FarmerDonationHistoryRequest = {}
): Promise<FarmerDonationHistoryResponse> => {
  try {
    console.log('목장주 거래내역 조회 API 호출:', params);
    
    // URLSearchParams를 사용하여 쿼리 파라미터 생성
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    
    const queryString = searchParams.toString();
    const url = `/api/v1/members/farmers/donations${queryString ? `?${queryString}` : ''}`;
    
    const response = await authApi.get<FarmerDonationHistoryResponse>(url);
    
    console.log('목장주 거래내역 조회 API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('목장주 거래내역 조회 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};
