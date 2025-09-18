import axios from 'axios';
import { LoginResponse, SignupCompleteRequest, SignupCompleteResponse } from '@/types/auth';

// 사업자 인증 요청 타입
export interface BusinessVerificationRequest {
  businessNum: string;
  openingDate: string;
  name: string;
  farmName: string;
}

// 사업자 인증 응답 타입
export interface BusinessVerificationResponse {
  isSuccess: boolean;
  message: string;
  data?: {
    verified: boolean;
    businessInfo?: {
      businessNum: string;
      businessName: string;
      representativeName: string;
      openingDate: string;
    };
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 20글자 랜덤 이메일 생성 함수 (개발용 - 배포 시 제거 필요)
const generateRandomEmail = (): string => {
  // 20글자 랜덤 문자열 생성
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `${result}@naver.com`;
};

// 원래 코드 (개발 완료 후 사용):
// const generateRandomId = (): string => {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   for (let i = 0; i < 10; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// };

// axios 인스턴스 생성 (쿠키 포함)
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함
});

// 세션 쿠키 기반 로그인 API 호출
export const signInWithSession = async (): Promise<LoginResponse> => {
  try {
    const response = await authApi.post<{ result: LoginResponse }>('/api/v1/auth/sign-in');
    // 백엔드 BaseResponse 형태로 래핑된 응답에서 result 추출
    const loginResponse = response.data.result;
    
    // 개발용: email을 UUID@naver.com으로 변경 (배포 시 제거 필요)
    const randomEmail = generateRandomEmail();
    loginResponse.email = randomEmail;
    
    console.log('이메일이 랜덤 ID로 변경됨:', randomEmail);
    
    return loginResponse;
    
    // 원래 코드 (개발 완료 후 사용):
    // return response.data.result;
  } catch (error) {
    console.error('세션 기반 로그인 API 오류:', error);
    throw error;
  }
};

// 회원가입 완료 API 호출
export const signupComplete = async (signupData: SignupCompleteRequest): Promise<SignupCompleteResponse> => {
  try {
    console.log('signupComplete API 호출 시작:', signupData);
    
    // tempAccessToken을 Authorization 헤더로 설정
    const tokens = getTokens();
    if (!tokens.tempAccessToken) {
      throw new Error('tempAccessToken이 없습니다. 다시 로그인해주세요.');
    }
    
    const response = await authApi.post<SignupCompleteResponse>('/api/v1/auth/signup-complete', signupData, {
      headers: {
        'Authorization': `Bearer ${tokens.tempAccessToken}`
      }
    });
    
    console.log('signupComplete API 응답:', response.data);
    // 백엔드 BaseResponse 전체를 반환 (isSuccess, message 등 포함)
    return response.data;
  } catch (error: unknown) {
    console.error('회원가입 완료 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};

// 토큰을 로컬 스토리지에 저장
export const saveTokens = (accessToken: string, refreshToken: string, tempAccessToken: string, email?: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('tempAccessToken', tempAccessToken);
  if (email) {
    localStorage.setItem('email', email);
  }
  
  // 로그인 상태 변경 이벤트 발생
  window.dispatchEvent(new Event('authStateChanged'));
};

// 토큰을 로컬 스토리지에서 가져오기
export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    tempAccessToken: localStorage.getItem('tempAccessToken'),
    email: localStorage.getItem('email'),
  };
};

// 토큰 삭제 (로그아웃 시)
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tempAccessToken');
  localStorage.removeItem('email');
  
  // 로그인 상태 변경 이벤트 발생
  window.dispatchEvent(new Event('authStateChanged'));
};

// 사업자 등록번호 인증 API 호출
export const verifyBusiness = async (verificationData: BusinessVerificationRequest): Promise<BusinessVerificationResponse> => {
  try {
    console.log('사업자 인증 API 호출:', verificationData);
    
    const response = await authApi.post<BusinessVerificationResponse>('/api/v1/members/verification', verificationData);
    
    console.log('사업자 인증 API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('사업자 인증 API 오류:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number; headers?: unknown } };
      console.error('에러 응답:', axiosError.response?.data);
      console.error('에러 상태:', axiosError.response?.status);
      console.error('에러 헤더:', axiosError.response?.headers);
    }
    throw error;
  }
};
