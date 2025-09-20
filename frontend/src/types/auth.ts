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

// 목장주 정보 조회 API 응답 타입
export interface FarmerInfoResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    role: string; // "farmer" (소문자)
    nameString: string;
    email: string;
    walletAddress: string;
    businessNum: string;
    farmName: string;
  };
}

// 기부자 정보 조회 API 응답 타입
export interface DonatorInfoResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    role: string; // "donator" (소문자)
    nameString: string;
    email: string;
    walletAddress: string;
  };
}
