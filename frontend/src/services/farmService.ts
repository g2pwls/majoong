// 농장 관련 API 서비스 함수

import { Farm, FarmUpdateRequest, FarmUpdateResponse, Horse } from '@/types/farm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export class FarmService {
  // 농장 정보 조회
  static async getFarm(farmUuid: string): Promise<Farm> {
    const response = await fetch(`${API_BASE_URL}/api/farms/${farmUuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farm: ${response.status}`);
    }

    return response.json();
  }

  // 농장 정보 수정
  static async updateFarm(farmUuid: string, farmData: FarmUpdateRequest): Promise<FarmUpdateResponse> {
    const response = await fetch(`${API_BASE_URL}/api/farms/${farmUuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(farmData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update farm: ${response.status}`);
    }

    return response.json();
  }

  // 농장 이미지 업로드
  static async uploadFarmImage(farmUuid: string, imageFile: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/api/farms/${farmUuid}/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload farm image: ${response.status}`);
    }

    return response.json();
  }

  // 농장의 말 목록 조회
  static async getHorses(farmUuid: string): Promise<Horse[]> {
    const response = await fetch(`${API_BASE_URL}/api/horse/${farmUuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch horses: ${response.status}`);
    }

    const data = await response.json();
    
    // 데이터 변환
    return data.map((h: any) => ({
      id: h.id,
      horseNo: String(h.horseNo),
      hrNm: h.hrNm,
      birthDt: typeof h.birthDt === "string" && h.birthDt.length === 8
        ? `${h.birthDt.slice(0, 4)}-${h.birthDt.slice(4, 6)}-${h.birthDt.slice(6, 8)}`
        : h.birthDt,
      breed: h.breed,
      sex: h.sex,
      image: h.horse_url,
    }));
  }
}

