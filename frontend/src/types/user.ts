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
        id: string;
        farmName: string;
        farmUuid: string;
        amount: number;
        coin: number;
        donationDate: string;
        status: string;
        message?: string;
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

// 향후 추가될 사용자 관련 타입들
// export interface MyFarmResponse { ... }
// export interface SupportReceivedResponse { ... }
// export interface ReportHistoryResponse { ... }
