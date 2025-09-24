// 사용자 정보 관련 타입 정의

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

// 즐겨찾기 농장 조회 API 응답 타입
export interface FavoriteFarmsResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: Array<{
    farmName: string;
    farmUuid: string;
  }>;
}

// 기부내역 조회 API 요청 타입
export interface DonationHistoryRequest {
  page?: number;
  size?: number;
  startDate?: string; // YYYY-MM-DD 형식
  endDate?: string;   // YYYY-MM-DD 형식
}

// 기부내역 조회 API 응답 타입
export interface DonationHistoryResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    totalCoin: number;
    totalAmount: number;
    donationHistory: {
      content: Array<{
        donationHistoryId: number;
        farmUuid: string;
        donationDate: string;
        farmName: string;
        donationToken: number;
      }>;
      pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
          empty: boolean;
          unsorted: boolean;
          sorted: boolean;
        };
        offset: number;
        unpaged: boolean;
        paged: boolean;
      };
      totalElements: number;
      totalPages: number;
      last: boolean;
      size: number;
      number: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      numberOfElements: number;
      first: boolean;
      empty: boolean;
    };
  };
}

// 기부 상세 조회 API 응답 타입
export interface DonationDetailResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    imageUrl: string;
    donationDate: string;
    donatorWalletAddress: string;
    farmWalletAddress: string;
    donationToken: number;
    txHash: string;
    farmName: string;
  };
}

// 목장주 나의 목장 조회 응답
export interface MyFarmResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    farmUuid: string;
    farmName: string;
    profileImage: string;
    totalScore: number;
    address: string;
    phoneNumber: string;
    horseCount: number;
    monthTotalAmount: number;
    area: number;
    description: string;
    monthlyScores: unknown[]; // 향후 구체적인 타입 정의 필요
    horses: unknown[]; // 향후 구체적인 타입 정의 필요
    ownerName: string;
  };
}

// 목장주 거래내역 조회 관련 타입
export interface FarmerDonationHistoryRequest {
  page?: number;
  size?: number;
  startDate?: string; // YYYY-MM-DD 형식
  endDate?: string; // YYYY-MM-DD 형식
}

export interface VaultHistoryDto {
  donatorName: string | null;
  donationToken: number;
  donationAmount: number;
  donationDate: string; // ISO 날짜 형식
  txHash: string;
  balance: number;
  type: 'DONATION' | 'WITHDRAWAL' | 'OTHER';
  receiptHistoryId: number;
}

export interface FarmerDonationHistoryResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    totalDonation: number;
    usedAmount: number;
    currentBalance: number;
    vaultHistoryResponseDtos: {
      content: VaultHistoryDto[];
      pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
          empty: boolean;
          unsorted: boolean;
          sorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
      };
      totalElements: number;
      totalPages: number;
      last: boolean;
      size: number;
      number: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      numberOfElements: number;
      first: boolean;
      empty: boolean;
    };
  };
}
