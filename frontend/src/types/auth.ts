// 인증 관련 타입 정의

export interface LoginResponse {
  signUp: boolean;
  accessToken: string;
  refreshToken: string;
  tempAccessToken: string;
  memberUuid: string;
  email: string;
}

export interface SignupCompleteRequest {
  role: string;
  name: string;
  email: string;
  farmName: string;
  businessNum: string;
  openingAt: string;
}

export interface SignupCompleteResponse {
  success: boolean;
  message: string;
}
