// 농장 관련 타입 정의

export interface Farm {
  id: string;
  farmUuid: string; // 백엔드 API와 일치하도록 추가
  farm_name: string;
  total_score: number;
  image_url?: string;
  name?: string;
  address?: string;
  farm_phone?: string;
  area?: number | string;
  horse_count?: number;
  description?: string; // 목장 소개
  month_total_amount?: number; // 이번 달 모금액
  purpose_total_amount?: number; // 목표 모금액
  member_uuid?: string; // 목장 소유자 UUID
  bookmarked?: boolean; // 즐겨찾기 상태
}

export interface FarmUpdateRequest {
  farm_name?: string;
  name?: string;
  address?: string;
  farm_phone?: string;
  area?: number;
  horse_count?: number;
  description?: string;
}

export interface FarmUpdateResponse {
  success: boolean;
  message: string;
  farm?: Farm;
}

// 농장 상세 조회 API 응답 타입
export interface FarmDetailResponse {
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
    area: number;
    description: string;
    monthlyScores: Array<{
      year: number;
      month: number;
      score: number;
    }>;
  };
}

export interface Horse {
  id?: string | number;
  horseNo: string;
  hrNm?: string;
  birthDt?: string;
  breed?: string;
  sex?: string;
  image?: string;
}

// 말 상세 정보 API 응답 타입
export interface WeeklyReport {
  horseReportId: number;
  frontImageUrl: string;
  month: number;
  week: number;
  aiSummary: string;
  uploadedAt?: string;
}

export interface HorseDetailResult {
  horseNumber: string;
  horseName: string;
  farmName: string;
  birth: string;
  gender: string;
  color: string;
  breed: string;
  countryOfOrigin: string;
  raceCount: number;
  firstPlaceCount: number;
  secondPlaceCount: number;
  totalPrize: number;
  retireDate: string;
  firstRaceDate: string;
  lastRaceDate: string;
  horseImageUrl: string;
  weeklyReport: WeeklyReport[];
}

export interface HorseDetailResponse {
  isSuccess: boolean;
  message: string;
  code: number;
  result: HorseDetailResult;
}

// 월간 보고서 API 응답 타입
export interface MonthlyReport {
  reportId: number;
  year: number;
  month: number;
  score: number;
  thumbnail: string;
}

export interface MonthlyReportResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: MonthlyReport[];
}

// 기부금 사용 내역 API 응답 타입
export interface MonthlyDonationUsed {
  year: number;
  month: number;
  amountSpent: number;
}

export interface ReceiptHistory {
  recieptHistoryId: number;
  createdAt: string;
  category: string;
  totalAmount: number;
}

// 기부금 사용 내역 상세 조회 API 응답 타입
export interface ReceiptDetail {
  certificationImageUrl: string;
  storeName: string;
  address: string;
  storeNumber: string;
  transactionAt: string;
  aiSummary: string;
  content: string;
  detailList: ReceiptItem[];
  totalAmount: number;
}

export interface ReceiptItem {
  item: string;
  count: number;
  pricePerItem: number;
  amount: number;
}

export interface ReceiptDetailResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: ReceiptDetail;
}

export interface DonationUsageResponse {
  monthlyDonationUsed: MonthlyDonationUsed[];
  receiptHistory: ReceiptHistory[];
}

// 신뢰도 내역 API 응답 타입
export interface ScoreHistory {
  year: number;
  month: number;
  avgScore: number;
}

export interface ScoreHistoryResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: ScoreHistory[];
}

// 신뢰도 목록 API 응답 타입
export interface ScoreHistoryItem {
  createdAt: string;
  category: string;
  score: number;
  year: number;
  month: number;
  delta: number;
  sourceId: string;
}

export interface ScoreHistoryListResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: ScoreHistoryItem[];
}

// 월간 보고서 상세 조회 API 응답 타입
export interface MonthlyReportDetail {
  reportId: number;
  year: number;
  month: number;
  score: number;
  thumbnail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyReportDetailResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: MonthlyReportDetail;
}

// 농장 정보 등록/수정 API 요청 타입
export interface FarmRegistrationRequest {
  phoneNumber: string;
  address: string;
  openingDate: string; // $date 형식
  area: number; // $double 형식
  description: string;
  profileImage: string; // $binary 형식 (base64 또는 파일)
}

export interface FarmRegistrationResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result?: unknown;
}

