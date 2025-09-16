import axios from 'axios';
import { LoginResponse, SignupCompleteRequest, SignupCompleteResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-test.majoong.site';

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
    const response = await authApi.post<LoginResponse>('/api/v1/auth/sign-in');
    return response.data;
  } catch (error) {
    console.error('세션 기반 로그인 API 오류:', error);
    throw error;
  }
};

// 회원가입 완료 API 호출
export const signupComplete = async (signupData: SignupCompleteRequest): Promise<SignupCompleteResponse> => {
  try {
    const response = await authApi.post<SignupCompleteResponse>('/api/v1/auth/signup-complete', signupData);
    return response.data;
  } catch (error) {
    console.error('회원가입 완료 API 오류:', error);
    throw error;
  }
};

// 토큰을 로컬 스토리지에 저장
export const saveTokens = (accessToken: string, refreshToken: string, tempAccessToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('tempAccessToken', tempAccessToken);
};

// 토큰을 로컬 스토리지에서 가져오기
export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    tempAccessToken: localStorage.getItem('tempAccessToken'),
  };
};

// 토큰 삭제 (로그아웃 시)
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tempAccessToken');
};
