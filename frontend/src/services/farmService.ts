// 농장 관련 API 서비스 함수

import { Farm, FarmUpdateRequest, FarmUpdateResponse, Horse, HorseDetailResponse, MonthlyReportResponse } from '@/types/farm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// 토큰을 로컬 스토리지에서 가져오기
const getAuthHeaders = (): Record<string, string> => {
  const accessToken = localStorage.getItem('accessToken');
  console.log('Access token exists:', !!accessToken);
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

  // 농장의 말 목록 조회 (농장 상세 정보에서 말 목록 추출)
  static async getHorses(farmUuid: string): Promise<Horse[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/farms/${farmUuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farm detail: ${response.status}`);
    }

    const baseResponse = await response.json();
    
    if (!baseResponse.isSuccess) {
      throw new Error(`API 호출 실패: ${baseResponse.message}`);
    }

    const farmData = baseResponse.result;
    const horses = farmData.horses || [];
    
    // FarmHorseDetailResponseDto를 Horse 타입으로 변환
    return horses.map((h: any) => ({
      id: h.horseUuid,
      horseNo: h.horseUuid, // horseUuid를 horseNo로 사용
      hrNm: h.horseName,
      birthDt: h.birth,
      breed: h.breed,
      sex: h.gender,
      image: h.horseUrl,
    }));
  }

  // 농장 위치 조회 (위도/경도)
  static async getFarmLocation(farmUuid: string): Promise<{ latitude: number; longitude: number }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/farms/${farmUuid}/location`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farm location: ${response.status}`);
    }

    const baseResponse = await response.json();
    
    if (!baseResponse.isSuccess) {
      throw new Error(`API 호출 실패: ${baseResponse.message}`);
    }

    return baseResponse.result;
  }

  // 말 정보 등록
  static async registerHorse(horseData: {
    farmUuid: string;
    horseNumber: number;
    horseName: string;
    birth: string;
    gender: string;
    color: string;
    breed: string;
    countryOfOrigin: string;
    raceCount: number;
    firstPlaceCount: number;
    secondPlaceCount: number;
    totalPrize: number;
    retiredDate?: string;
    firstRaceDate?: string;
    lastRaceDate?: string;
    profileImage?: File;
  }): Promise<void> {
    const formData = new FormData();
    
    // 기본 정보 추가
    formData.append('farmUuid', horseData.farmUuid);
    formData.append('horseNumber', horseData.horseNumber.toString());
    formData.append('horseName', horseData.horseName);
    formData.append('birth', horseData.birth);
    formData.append('gender', horseData.gender);
    formData.append('color', horseData.color);
    formData.append('breed', horseData.breed);
    formData.append('countryOfOrigin', horseData.countryOfOrigin);
    formData.append('raceCount', horseData.raceCount.toString());
    formData.append('firstPlaceCount', horseData.firstPlaceCount.toString());
    formData.append('secondPlaceCount', horseData.secondPlaceCount.toString());
    formData.append('totalPrize', horseData.totalPrize.toString());
    
    // 선택적 필드 추가
    if (horseData.retiredDate) {
      formData.append('retiredDate', horseData.retiredDate);
    }
    if (horseData.firstRaceDate) {
      formData.append('firstRaceDate', horseData.firstRaceDate);
    }
    if (horseData.lastRaceDate) {
      formData.append('lastRaceDate', horseData.lastRaceDate);
    }
    if (horseData.profileImage) {
      formData.append('profileImage', horseData.profileImage);
    }

    console.log('Registering horse with data:', {
      farmUuid: horseData.farmUuid,
      horseNumber: horseData.horseNumber,
      horseName: horseData.horseName,
      hasProfileImage: !!horseData.profileImage
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/members/farmers/my-farm/horses`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Content-Type을 명시적으로 설정하지 않음 (FormData가 자동으로 설정)
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to register horse: ${response.status} - ${errorText}`);
    }

    const baseResponse = await response.json();
    console.log('API response:', baseResponse);
    
    if (!baseResponse.isSuccess) {
      throw new Error(`API 호출 실패: ${baseResponse.message}`);
    }
  }

  // 말 상세 정보 조회
  static async getHorseDetail(farmUuid: string, horseNumber: number, year: number, month: number): Promise<HorseDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/farms/${farmUuid}/horses/${horseNumber}?year=${year}&month=${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch horse detail: ${response.status}`);
    }

    const baseResponse = await response.json();
    
    if (!baseResponse.isSuccess) {
      throw new Error(`API 호출 실패: ${baseResponse.message}`);
    }

    return baseResponse;
  }

  // 월간 보고서 조회
  static async getMonthlyReports(farmUuid: string, year: number): Promise<MonthlyReportResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/farms/${farmUuid}/monthly-reports?year=${year}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch monthly reports: ${response.status}`);
    }

    const baseResponse = await response.json();
    
    if (!baseResponse.isSuccess) {
      throw new Error(`API 호출 실패: ${baseResponse.message}`);
    }

    return baseResponse;
  }
}

