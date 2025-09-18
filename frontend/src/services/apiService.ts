// API 서비스 함수들
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// 토큰을 로컬 스토리지에서 가져오기
const getAuthHeaders = (): Record<string, string> => {
  const accessToken = localStorage.getItem('accessToken');
  return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
};

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
  const searchParams = new URLSearchParams();
  
  if (params.farmName) {
    searchParams.append('farmName', params.farmName);
  }
  if (params.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  if (params.size !== undefined) {
    searchParams.append('size', params.size.toString());
  }

  const url = `${API_BASE_URL}/api/v1/farms?${searchParams.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  const baseResponse = await response.json();
  
  // BaseResponse에서 result 필드 추출
  if (!baseResponse.isSuccess) {
    throw new Error(`API 호출 실패: ${baseResponse.message}`);
  }

  // 백엔드 응답을 프론트엔드 인터페이스에 맞게 변환
  const pageData = baseResponse.result;
  const farms: Farm[] = pageData.content.map((farm: any) => ({
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
    horses: (farm.horses || []).map((horse: any) => ({
      id: horse.horseNumber,
      farm_id: farm.farmUuid,
      horseNo: horse.horseNumber?.toString() || '',
      hrNm: horse.horseName,
      birthDt: '',
      horse_url: horse.profileImage
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
}

// 농장 상세 조회
export async function getFarm(farmId: string): Promise<Farm> {
  const url = `${API_BASE_URL}/api/v1/farms/${farmId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  const baseResponse = await response.json();
  console.log('농장 상세 API 응답:', baseResponse);
  
  if (!baseResponse.isSuccess) {
    throw new Error(`API 호출 실패: ${baseResponse.message}`);
  }

  const farm = baseResponse.result;
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
    horses: (farm.horses || []).map((horse: any) => ({
      id: horse.horseNumber,
      farm_id: farm.farmUuid,
      horseNo: horse.horseNumber?.toString() || '',
      hrNm: horse.horseName,
      birthDt: '',
      horse_url: horse.profileImage
    }))
  };
}

// 농장의 말 목록 조회 (현재는 농장 목록에서 함께 반환되므로 별도 호출 불필요)
export async function getHorses(farmId: string): Promise<Horse[]> {
  // 백엔드에서 농장 목록 조회 시 말 정보도 함께 반환하므로
  // 별도의 API 호출이 필요하지 않습니다.
  // 이 함수는 호환성을 위해 유지하지만 빈 배열을 반환합니다.
  return [];
}
