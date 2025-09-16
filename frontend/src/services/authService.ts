import axios from 'axios';
import { LoginResponse, SignupCompleteRequest, SignupCompleteResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
    const response = await authApi.post<any>('/api/v1/auth/sign-in');
    // 백엔드 BaseResponse 형태로 래핑된 응답에서 result 추출
    return response.data.result;
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
    
    const response = await authApi.post<any>('/api/v1/auth/signup-complete', signupData, {
      headers: {
        'Authorization': `Bearer ${tokens.tempAccessToken}`
      }
    });
    
    console.log('signupComplete API 응답:', response.data);
    // 백엔드 BaseResponse 전체를 반환 (isSuccess, message 등 포함)
    return response.data;
  } catch (error: any) {
    console.error('회원가입 완료 API 오류:', error);
    console.error('에러 응답:', error.response?.data);
    console.error('에러 상태:', error.response?.status);
    console.error('에러 헤더:', error.response?.headers);
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
