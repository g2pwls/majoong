import { authApi } from './authService';
import { KakaoPayReadyRequest, KakaoPayReadyResponse } from '../types/payment';

// 카카오페이 결제 시작 API
export const startKakaoPay = async (request: KakaoPayReadyRequest): Promise<KakaoPayReadyResponse> => {
  try {
    console.log('카카오페이 결제 시작 API 호출:', request);
    
    const response = await authApi.post<KakaoPayReadyResponse>('/api/v1/kakao-pay/ready', request);
    
    console.log('카카오페이 결제 시작 API 응답:', response.data);
    
    // 결제 페이지로 리다이렉트 (모바일/PC 환경 분리)
    if (response.data.isSuccess) {
      // 결제 정보를 세션 스토리지에 저장하여 승인 페이지에서 사용
      const paymentInfo = {
        farmUuid: request.farmUuid,
        amount: parseInt(request.totalPrice),
        tid: response.data.result.tid,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem('kakao_pay_info', JSON.stringify(paymentInfo));
      console.log('결제 정보 저장:', paymentInfo);
      
      // 모바일 환경 감지
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile && response.data.result.next_redirect_mobile_url) {
        console.log('모바일 환경: 모바일 결제 페이지로 이동');
        window.open(response.data.result.next_redirect_mobile_url, '_blank');
      } else if (response.data.result.next_redirect_pc_url) {
        console.log('PC 환경: PC 결제 페이지로 이동');
        window.open(response.data.result.next_redirect_pc_url, '_blank');
      } else {
        console.error('결제 페이지 URL을 찾을 수 없습니다.');
      }
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

// 기부하기 API는 백엔드에서 카카오페이 승인과 함께 자동 처리됨
// 따라서 프론트엔드에서는 별도로 호출하지 않음
