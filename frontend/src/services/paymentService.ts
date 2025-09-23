import { authApi } from './authService';
import { KakaoPayReadyRequest, KakaoPayReadyResponse, DonationRequest, DonationResponse } from '../types/payment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 카카오페이 결제 시작 API
export const startKakaoPay = async (request: KakaoPayReadyRequest): Promise<KakaoPayReadyResponse> => {
  try {
    console.log('카카오페이 결제 시작 API 호출:', request);
    
    const response = await authApi.post<KakaoPayReadyResponse>('/api/v1/kakao-pay/ready', request);
    
    console.log('카카오페이 결제 시작 API 응답:', response.data);
    
    // 결제 페이지로 리다이렉트 (결제 정보를 세션 스토리지에 저장)
    if (response.data.isSuccess && response.data.result.next_redirect_pc_url) {
      // 결제 정보를 세션 스토리지에 저장하여 승인 페이지에서 사용
      const paymentInfo = {
        farmUuid: request.farmUuid,
        amount: parseInt(request.totalPrice),
        tid: response.data.result.tid,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem('kakao_pay_info', JSON.stringify(paymentInfo));
      console.log('결제 정보 저장:', paymentInfo);
      
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

// 기부하기 API (현재 버전: farmUuid 사용)
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

// 기부하기 API (이전 버전 - 참고용: farmMemberUuid 사용)
// export const createDonation = async (request: { farmMemberUuid: string; amountKrw: number }): Promise<DonationResponse> => {
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
