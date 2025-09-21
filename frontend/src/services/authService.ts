import axios from 'axios';
import { LoginResponse, SignupCompleteRequest, SignupCompleteResponse, RefreshTokenRequest, RefreshTokenResponse } from '@/types/auth';

// 사업자 인증 요청 타입
export interface BusinessVerificationRequest {
  businessNum: string;
  openingDate: string;
  name: string;
  farmName: string;
}

// 사업자 인증 응답 타입
export interface BusinessVerificationResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    verified: boolean;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 원본 이메일 + 현재 월일시분초 기반 이메일 생성 함수 (개발용 - 배포 시 제거 필요)
const generateTimestampEmail = (originalEmail: string): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  // 월일시분초 문자열 생성 (예: "1203153045")
  const timestamp = month + day + hour + minute + second;
  
  // 원본 이메일에서 @ 앞부분 추출
  const emailPrefix = originalEmail.split('@')[0];
  
  // 최대 30자 제한: @naver.com(10자) + 이메일접두사 + 타임스탬프(최대 20자)
  const maxPrefixLength = 30 - 10 - timestamp.length; // 30자 - @naver.com(10자) - 타임스탬프(10자)
  const truncatedPrefix = emailPrefix.substring(0, Math.max(0, maxPrefixLength));
  
  return `${truncatedPrefix}${timestamp}@naver.com`;
};

// 토큰을 로컬 스토리지에서 가져오기 (인터셉터에서 사용하기 위해 먼저 정의)
export const getTokens = () => {
  const getValidToken = (key: string) => {
    const value = localStorage.getItem(key);
    // null, 'null', 빈 문자열 모두 유효하지 않은 것으로 처리
    return value && value !== 'null' && value !== '' ? value : null;
  };

  return {
    accessToken: getValidToken('accessToken'),
    refreshToken: getValidToken('refreshToken'),
    tempAccessToken: getValidToken('tempAccessToken'),
    email: getValidToken('email'),
    role: getValidToken('role'),
  };
};

// axios 인스턴스 생성 (쿠키 포함)
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함
});

// 요청 인터셉터: 모든 요청에 Authorization 헤더 자동 추가
authApi.interceptors.request.use(
  (config) => {
    const tokens = getTokens();
    
    console.log('🔍 Request Interceptor - 토큰 상태:', {
      accessToken: tokens.accessToken ? `${tokens.accessToken.substring(0, 20)}...` : 'null',
      tempAccessToken: tokens.tempAccessToken ? `${tokens.tempAccessToken.substring(0, 20)}...` : 'null',
      role: tokens.role
    });
    
    // accessToken이 있으면 우선 사용 (회원가입 완료 후)
    if (tokens.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      console.log('🔑 Request Interceptor - accessToken 사용');
    } else if (tokens.tempAccessToken) {
      // accessToken이 없을 때만 tempAccessToken 사용 (회원가입 완료 전)
      config.headers.Authorization = `Bearer ${tokens.tempAccessToken}`;
      console.log('🔑 Request Interceptor - tempAccessToken 사용');
    } else {
      console.log('❌ Request Interceptor - 사용할 토큰이 없음');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 토큰 갱신 시도
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const tokens = getTokens();
        if (tokens.refreshToken) {
          const newTokens = await refreshAccessToken(tokens.refreshToken);
          saveTokens(
            newTokens.accessToken,
            newTokens.refreshToken,
            newTokens.tempAccessToken,
            newTokens.email,
            newTokens.role
          );
          
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 세션 쿠키 기반 로그인 API 호출
export const signInWithSession = async (): Promise<LoginResponse> => {
  try {
    const response = await authApi.post<{ result: LoginResponse }>('/api/v1/auth/sign-in');
    // 백엔드 BaseResponse 형태로 래핑된 응답에서 result 추출
    const loginResponse = response.data.result;
    
    // 신규 회원과 기존 회원 구분 처리
    if (loginResponse.signUp) {
      // 신규 회원: 함수로 생성한 이메일 사용 (개발용 - 배포 시 제거 필요)
      const timestampEmail = generateTimestampEmail(loginResponse.email);
      loginResponse.email = timestampEmail;
      console.log('신규 회원 - 이메일이 함수 생성으로 변경됨:', timestampEmail, '원본:', response.data.result.email);
    } else {
      // 기존 회원: 원본 이메일을 로그인 ID로 사용
      console.log('기존 회원 - 원본 이메일을 로그인 ID로 사용:', loginResponse.email);
    }
    
    return loginResponse;
  } catch (error) {
    console.error('세션 기반 로그인 API 오류:', error);
    throw error;
  }
};

// 회원가입 완료 API 호출
export const signupComplete = async (signupData: SignupCompleteRequest): Promise<SignupCompleteResponse> => {
  try {
    console.log('signupComplete API 호출 시작:', signupData);
    
    // tempAccessToken이 있는지 확인 (인터셉터에서 자동으로 헤더에 추가됨)
    const tokens = getTokens();
    if (!tokens.tempAccessToken) {
      throw new Error('tempAccessToken이 없습니다. 다시 로그인해주세요.');
    }
    
    const response = await authApi.post<SignupCompleteResponse>('/api/v1/auth/signup-complete', signupData);
    
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

// Refresh Token으로 새로운 액세스 토큰 발급
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  try {
    console.log('Refresh Token API 호출 시작');
    
    const requestData: RefreshTokenRequest = {
      refreshToken: refreshToken
    };
    
    const response = await authApi.post<RefreshTokenResponse>('/api/v1/auth/token/refresh', requestData);
    
    console.log('Refresh Token API 응답:', response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('Refresh Token API 오류:', error);
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
export const saveTokens = (accessToken: string, refreshToken: string, tempAccessToken: string, email?: string, role?: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // tempAccessToken이 빈 문자열이면 제거, 아니면 저장
  if (tempAccessToken && tempAccessToken !== '') {
    localStorage.setItem('tempAccessToken', tempAccessToken);
  } else {
    localStorage.removeItem('tempAccessToken');
  }
  
  if (email) {
    localStorage.setItem('email', email);
  }
  if (role) {
    localStorage.setItem('role', role);
  }
  
  console.log('🔑 토큰 저장 완료:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasTempAccessToken: !!(tempAccessToken && tempAccessToken !== ''),
    email,
    role
  });
  
  // 로그인 상태 변경 이벤트 발생
  window.dispatchEvent(new Event('authStateChanged'));
};


// 토큰 삭제 (로그아웃 시)
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tempAccessToken');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  
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


// 토큰 상태 디버깅 함수
export const debugTokenStatus = () => {
  const tokens = getTokens();
  console.log('🔍 현재 토큰 상태:', {
    accessToken: tokens.accessToken ? `${tokens.accessToken.substring(0, 20)}...` : 'null',
    refreshToken: tokens.refreshToken ? `${tokens.refreshToken.substring(0, 20)}...` : 'null',
    tempAccessToken: tokens.tempAccessToken ? `${tokens.tempAccessToken.substring(0, 20)}...` : 'null',
    email: tokens.email || 'null',
    role: tokens.role || 'null'
  });
};

// 사용자 role 확인 유틸리티 함수들
export const isFarmer = (): boolean => {
  const tokens = getTokens();
  return tokens.role === 'FARMER';
};

export const isDonator = (): boolean => {
  const tokens = getTokens();
  return tokens.role === 'DONATOR';
};

export const getUserRole = (): string | null => {
  const tokens = getTokens();
  return tokens.role;
};