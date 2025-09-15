// 인증 관련 API 서비스
import { SignInRequest, SignInResponse, UserInfo } from '@/types/auth';

export const authService = {
  // 카카오 로그인
  signIn: async (request: SignInRequest): Promise<SignInResponse> => {
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '로그인 처리 실패');
    }

    return response.json();
  },

  // 토큰 저장
  saveTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  // 사용자 정보 저장
  saveUserInfo: (memberUuid: string, email: string) => {
    const userInfo: UserInfo = {
      memberUuid,
      email
    };
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  },

  // 토큰 가져오기
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  // 사용자 정보 가져오기
  getUserInfo: (): UserInfo | null => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
  }
};
