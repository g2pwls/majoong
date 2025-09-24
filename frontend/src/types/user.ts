// 기부자 정보 조회 타입
export interface DonatorInfoResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    name: string;
    email: string;
    walletAddress: string;
    profileImage?: string;
    coin: number;
  };
}

// 목장주 정보 조회 타입
export interface FarmerInfoResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    name: string;
    email: string;
    walletAddress: string;
    profileImage?: string;
    phoneNumber: string;
    farmName: string;
    businessNum: string;
    openingAt: string; // 개업일자
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
    profileImage: string;
    totalScore: number;
    address: string;
    description: string;
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
    content: {
      donationHistoryId: number;
      farmUuid: string;
      farmName: string;
      donationToken: number;
      donationDate: string;
      profileImage: string;
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

// 목장 등록 관련 타입
export interface FarmRegistrationRequest {
  phoneNumber: string;
  address: string;
  openingDate: string; // YYYY-MM-DD 형식
  area: number;
  description: string;
  profileImage: File | null;
}

export interface FarmRegistrationResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: string; // 농장 UUID (예: "FARM-2F40B1")
}

// 계좌 내역 조회 응답 타입
export interface AccountHistoryResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    balance: string; // 잔액
    transactions: unknown[]; // 거래 내역 (현재는 빈 배열)
  };
}