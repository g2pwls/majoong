// 농장 관련 API 서비스 함수

import { Farm, FarmUpdateRequest, FarmUpdateResponse, Horse } from '@/types/farm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// 토큰을 로컬 스토리지에서 가져오기
const getAuthHeaders = (): Record<string, string> => {
  const accessToken = localStorage.getItem('accessToken');
  return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
};

export class FarmService {
  // 농장 정보 조회
  static async getFarm(farmUuid: string): Promise<Farm> {
    const response = await fetch(`${API_BASE_URL}/api/v1/farms/${farmUuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farm: ${response.status}`);
    }

    const baseResponse = await response.json();
    
    if (!baseResponse.isSuccess) {
      throw new Error(`API 호출 실패: ${baseResponse.message}`);
    }

    const farm = baseResponse.result;
    return {
      id: farm.farmUuid,
      farm_name: farm.farmName,
      address: farm.address,
      name: farm.ownerName,
      horse_count: farm.horseCount,
      total_score: farm.totalScore,
      image_url: farm.profileImage,
      farm_phone: farm.phoneNumber,
      area: farm.area,
      description: farm.description,
    };
  }

  // 농장 정보 수정
  static async updateFarm(farmUuid: string, farmData: FarmUpdateRequest): Promise<FarmUpdateResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/farms/${farmUuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(farmData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update farm: ${response.status}`);
    }

    const baseResponse = await response.json();
    
    if (!baseResponse.isSuccess) {
      throw new Error(`API 호출 실패: ${baseResponse.message}`);
    }

    return baseResponse.result;
  }

  // 농장 이미지 업로드
  static async uploadFarmImage(farmUuid: string, imageFile: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/api/v1/farms/${farmUuid}/image`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload farm image: ${response.status}`);
    }

    const baseResponse = await response.json();
    
    if (!baseResponse.isSuccess) {
      throw new Error(`API 호출 실패: ${baseResponse.message}`);
    }

    return baseResponse.result;
  }

  // 농장의 말 목록 조회
  static async getHorses(farmUuid: string): Promise<Horse[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/horse/${farmUuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch horses: ${response.status}`);
    }

    const baseResponse = await response.json();
    
    if (!baseResponse.isSuccess) {
      throw new Error(`API 호출 실패: ${baseResponse.message}`);
    }

    const data = baseResponse.result;
    
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

