// 인증 관련 타입 정의
export interface SignInRequest {
  oauthId: string;
  oauthProvider: string;
}

export interface SignInResponse {
  memberUuid: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  isSignUp: boolean;
}

export interface UserInfo {
  memberUuid: string;
  email: string;
}
