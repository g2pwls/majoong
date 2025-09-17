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

