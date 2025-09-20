// 인증 관련 타입 정의

export interface LoginResponse {
  signUp: boolean;
  accessToken: string;
  refreshToken: string;
  tempAccessToken: string;
  memberUuid: string;
  email: string;
  role: string; // 'DONATOR' 또는 'FARMER'
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
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    accessToken: string;
    refreshToken: string;
    tempAccessToken: string;
    memberUuid: string;
    email: string;
    role: string; // 'DONATOR' 또는 'FARMER'
    signUp: boolean;
  };
}

// Refresh Token 요청 타입
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Refresh Token 응답 타입
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tempAccessToken: string;
  memberUuid: string;
  email: string;
  role: string; // 'DONATOR' 또는 'FARMER'
  signUp: boolean;
}
