import { authApi } from './authService';
import { KakaoPayReadyRequest, KakaoPayReadyResponse, DonationRequest, DonationResponse } from '../types/payment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 카카오페이 결제 시작 API
export const startKakaoPay = async (request: KakaoPayReadyRequest): Promise<KakaoPayReadyResponse> => {
  try {
    console.log('카카오페이 결제 시작 API 호출:', request);
    
    const response = await authApi.post<KakaoPayReadyResponse>('/api/v1/kakao-pay/ready', request);
    
    console.log('카카오페이 결제 시작 API 응답:', response.data);
    
    // 결제 페이지로 리다이렉트
    if (response.data.isSuccess && response.data.result.next_redirect_pc_url) {
      window.open(response.data.result.next_redirect_pc_url, '_blank');
    }
    
    return response.data;
  } catch (error: unknown) {
    console.error('카카오페이 결제 시작 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 기부하기 API (현재 버전: farmMemberUuid 사용)
export const createDonation = async (request: DonationRequest): Promise<DonationResponse> => {
  try {
    console.log('기부하기 API 호출:', request);
    
    const response = await authApi.post<DonationResponse>('/api/v1/donation', request);
    
    console.log('기부하기 API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('기부하기 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 기부하기 API (향후 변경 예정: farmUuid 사용)
// export const createDonation = async (request: { farmUuid: string; amountKrw: number }): Promise<DonationResponse> => {
//   try {
//     console.log('기부하기 API 호출:', request);
//     
//     const response = await authApi.post<DonationResponse>('/api/v1/donation', request);
//     
//     console.log('기부하기 API 응답:', response.data);
//     return response.data;
//   } catch (error: unknown) {
//     console.error('기부하기 API 오류:', error);
//     if (error && typeof error === 'object' && 'response' in error) {
//       const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
//       console.error('에러 응답:', axiosError.response?.data);
//       console.error('에러 상태:', axiosError.response?.status);
//       console.error('에러 헤더:', axiosError.response?.headers);
//     }
//     throw error;
//   }
// };
