import { authApi } from './authService';
import { KakaoPayReadyRequest, KakaoPayReadyResponse } from '../types/payment';

// 모바일 환경 감지 함수
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // User Agent로 모바일 감지
  const isMobileUA = mobileRegex.test(userAgent);
  
  // 화면 크기로도 감지 (768px 이하를 모바일로 간주)
  const isMobileScreen = window.innerWidth <= 768;
  
  // 터치 스크린 감지
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUA || (isMobileScreen && isTouchDevice);
};

// 카카오페이 결제 시작 API
export const startKakaoPay = async (request: KakaoPayReadyRequest): Promise<KakaoPayReadyResponse> => {
  try {
    console.log('카카오페이 결제 시작 API 호출:', request);
    
    const response = await authApi.post<KakaoPayReadyResponse>('/api/v1/kakao-pay/ready', request);
    
    console.log('카카오페이 결제 시작 API 응답:', response.data);
    
    // 결제 페이지로 리다이렉트 (결제 정보를 세션 스토리지에 저장)
    if (response.data.isSuccess && response.data.result) {
      // 결제 정보를 세션 스토리지에 저장하여 승인 페이지에서 사용
      const paymentInfo = {
        farmUuid: request.farmUuid,
        amount: parseInt(request.totalPrice),
        tid: response.data.result.tid,
        timestamp: Date.now(),
        returnUrl: window.location.href // 현재 페이지 URL 저장
      };
      
      sessionStorage.setItem('kakao_pay_info', JSON.stringify(paymentInfo));
      console.log('결제 정보 저장:', paymentInfo);
      
      // 모바일/PC 환경에 따라 적절한 URL 선택
      const isMobile = isMobileDevice();
      const redirectUrl = isMobile 
        ? response.data.result.next_redirect_mobile_url 
        : response.data.result.next_redirect_pc_url;
      
      console.log(`${isMobile ? '모바일' : 'PC'} 환경 감지, 리다이렉트 URL:`, redirectUrl);
      
      if (redirectUrl) {
        window.open(redirectUrl, '_blank');
      } else {
        throw new Error('결제 URL이 제공되지 않았습니다.');
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
