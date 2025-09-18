// 농장 관련 타입 정의

export interface Farm {
  id: string;
  farm_name: string;
  total_score: number;
  image_url?: string;
  name?: string;
  address?: string;
  farm_phone?: string;
  area?: number | string;
  horse_count?: number;
  description?: string; // 목장 소개
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
}

export interface HorseDetailResult {
  horseNumber: number;
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

