// 기부자 정보 조회 타입
export interface DonatorInfoResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    role: string;
    nameString: string;
    email: string;
    walletAddress: string;
    // coin 필드는 실제 API 응답에 없음
    profileImage?: string;
  };
}

// 목장주 정보 조회 타입
export interface FarmerInfoResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    role: string;
    nameString: string;
    email: string;
    walletAddress: string;
    businessNum: string;
    farmName: string;
    farmVaultAddress: string;
    // 기존 타입 정의와 실제 API 응답이 다름
    profileImage?: string;
    phoneNumber?: string;
    openingAt?: string;
  };
}

// 즐겨찾기 목록 조회 타입
export interface FavoriteFarmsResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    farmUuid: string;
    farmName: string;
    imageUrl: string;
  }[];
}

// 기부내역 조회 요청 타입
export interface DonationHistoryRequest {
  page?: number;
  size?: number;
  startDate?: string; // YYYY-MM-DD 형식
  endDate?: string; // YYYY-MM-DD 형식
}

// 기부내역 조회 응답 타입
export interface DonationHistoryResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    totalAmount: number;
    totalCoin: number;
    donationHistory: {
      content: {
        donationHistoryId: number;
        farmUuid: string;
        farmName: string;
        donationToken: number;
        donationDate: string;
        profileImage?: string;
      }[];
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

// 기부 상세 조회 응답 타입
export interface DonationDetailResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    donatorName: string;
    farmName: string;
    donationToken: number;
    donationDate: string;
    donatorWalletAddress: string;
    farmWalletAddress: string;
    txHash: string;
    receiptId: string;
    imageUrl?: string; // 선택적 필드로 추가
  };
}

// 나의 목장 조회 응답 타입
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
    purposeTotalAmount: number;
    month_total_amount: number;
    purpose_total_amount: number;
    area: number;
    description: string;
    monthlyScores: unknown[]; // Changed from any[]
    horses: unknown[]; // Changed from any[]
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
  type: 'DONATION' | 'WITHDRAWAL' | 'OTHER' | 'SETTLEMENT';
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
    farmVaultAddress: string;
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

// 목장 등록 관련 타입
export interface FarmRegistrationRequest {
  phoneNumber: string;
  address: string;
  openingDate: string; // YYYY-MM-DD 형식
  area: string;
  description: string;
  profileImage: File | null;
}

export interface FarmRegistrationResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: string; // 목장 UUID (예: "FARM-2F40B1")
}

// 계좌 거래 내역 타입
export interface AccountTransaction {
  date: string; // YYYYMMDD 형식
  time: string; // HHMMSS 형식
  amount: string; // 거래 금액
  afterBalance: string; // 거래 후 잔액
}

// 계좌 내역 조회 응답 타입
export interface AccountHistoryResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    balance: string; // 잔액
    transactions: AccountTransaction[]; // 거래 내역
  };
}

// 목장 정보 수정 관련 타입
export interface FarmUpdateRequest {
  farmName: string;
  phoneNumber: string;
  image: File | null;
  description: string;
}

export interface FarmUpdateResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: null;
}