// API 서비스 함수들
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Farm {
  id: string;
  farm_name: string;
  address: string;
  name: string;
  horse_count: number;
  total_score: number;
  image_url: string;
  state?: "우수" | "양호" | "보통" | "미흡";
  horse_url?: (string | undefined)[];
  horses?: Horse[];
  latitude?: number;
  longitude?: number;
  farm_phone?: string;
  area?: number | string;
  description?: string;
}

export interface Horse {
  id: number;
  farm_id: string;
  horseNo: string;
  hrNm: string;
  birthDt: string;
  sex?: string;
  color?: string;
  breed?: string;
  prdCty?: string;
  rcCnt?: number;
  fstCnt?: number;
  sndCnt?: number;
  amt?: number;
  discardDt?: string | null;
  fdebutDt?: string | null;
  lchulDt?: string | null;
  horse_url?: string;
}

export interface FarmListResponse {
  content: Farm[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 농장 목록 조회
export async function getFarms(params: {
  farmName?: string;
  page?: number;
  size?: number;
} = {}): Promise<FarmListResponse> {
  try {
    const response = await apiClient.get('/api/v1/farms', {
      params: {
        farmName: params.farmName,
        page: params.page,
        size: params.size,
      },
    });

    // BaseResponse에서 result 필드 추출
    if (!response.data.isSuccess) {
      throw new Error(`API 호출 실패: ${response.data.message}`);
    }

    // 백엔드 응답을 프론트엔드 인터페이스에 맞게 변환
    const pageData = response.data.result;
    const farms: Farm[] = pageData.content.map((farm: {
      farmUuid: string;
      farmName: string;
      address: string;
      ownerName: string;
      horseCount: number;
      totalScore: number;
      profileImage: string;
      status: string;
      phoneNumber: string;
      area: number;
      description: string;
      horses?: Array<{
        horseNumber: number;
        horseName: string;
        birth: string;
        breed: string;
        gender: string;
        horseUrl: string;
      }>;
    }) => ({
      id: farm.farmUuid,
      farm_name: farm.farmName,
      address: farm.address,
      name: farm.ownerName,
      horse_count: farm.horseCount,
      total_score: farm.totalScore,
      image_url: farm.profileImage,
      state: farm.status,
      farm_phone: farm.phoneNumber,
      area: farm.area,
      description: farm.description,
      horses: (farm.horses || []).map((horse: {
        horseNumber: number;
        horseName: string;
        birth: string;
        breed: string;
        gender: string;
        horseUrl: string;
      }) => ({
        id: horse.horseNumber,
        farm_id: farm.farmUuid,
        horseNo: horse.horseNumber?.toString() || '',
        hrNm: horse.horseName,
        birthDt: '',
        horse_url: horse.horseUrl
      }))
    }));

    return {
      content: farms,
      totalElements: pageData.totalElements,
      totalPages: pageData.totalPages,
      size: pageData.size,
      number: pageData.number,
      first: pageData.first,
      last: pageData.last
    };
  } catch (error) {
    console.error('농장 목록 조회 실패:', error);
    throw error;
  }
}

// 농장 상세 조회
export async function getFarm(farmId: string): Promise<Farm> {
  try {
    const response = await apiClient.get(`/api/v1/farms/${farmId}`);
    
    console.log('농장 상세 API 응답:', response.data);
    
    if (!response.data.isSuccess) {
      throw new Error(`API 호출 실패: ${response.data.message}`);
    }

    const farm = response.data.result;
    console.log('농장 상세 result 데이터:', farm);
    
    return {
      id: farm.farmUuid,
      farm_name: farm.farmName,
      address: farm.address,
      name: farm.ownerName,
      horse_count: farm.horseCount,
      total_score: farm.totalScore,
      image_url: farm.profileImage,
      state: farm.status,
      farm_phone: farm.phoneNumber,
      area: farm.area,
      description: farm.description,
      horses: (farm.horses || []).map((horse: {
        horseNumber: number;
        horseName: string;
        birth: string;
        breed: string;
        gender: string;
        horseUrl: string;
      }) => ({
        id: horse.horseNumber,
        farm_id: farm.farmUuid,
        horseNo: horse.horseNumber?.toString() || '',
        hrNm: horse.horseName,
        birthDt: '',
        horse_url: horse.horseUrl
      }))
    };
  } catch (error) {
    console.error('농장 상세 조회 실패:', error);
    throw error;
  }
}

// 농장의 말 목록 조회 (현재는 농장 목록에서 함께 반환되므로 별도 호출 불필요)
export async function getHorses(): Promise<Horse[]> {
  try {
    // 백엔드에서 농장 목록 조회 시 말 정보도 함께 반환하므로
    // 별도의 API 호출이 필요하지 않습니다.
    // 이 함수는 호환성을 위해 유지하지만 빈 배열을 반환합니다.
    console.log('getHorses 호출됨 - 빈 배열 반환 (농장 상세 조회에서 말 정보 포함)');
    return [];
  } catch (error) {
    console.error('말 목록 조회 실패:', error);
    throw error;
  }
}
