// API 서비스 함수들
// Next.js API 라우트 사용

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
  latitude: number;
  longitude: number;
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
  // Next.js API 라우트 사용: /api/farms/all
  const url = '/api/farms/all';
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  const farms = await response.json();
  
  // 페이지네이션 처리 (클라이언트 사이드)
  const page = params.page || 0;
  const size = params.size || 10;
  const startIndex = page * size;
  const endIndex = startIndex + size;
  
  let filteredFarms = farms;
  
  // 농장명 필터링
  if (params.farmName) {
    filteredFarms = farms.filter((farm: Farm) => 
      farm.farm_name.toLowerCase().includes(params.farmName!.toLowerCase())
    );
  }
  
  const paginatedFarms = filteredFarms.slice(startIndex, endIndex);
  
  return {
    content: paginatedFarms,
    totalElements: filteredFarms.length,
    totalPages: Math.ceil(filteredFarms.length / size),
    size: size,
    number: page,
    first: page === 0,
    last: endIndex >= filteredFarms.length
  };
}

// 농장 상세 조회
export async function getFarm(farmId: string): Promise<Farm> {
  const url = `/api/farms/${farmId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// 농장의 말 목록 조회
export async function getHorses(farmId: string): Promise<Horse[]> {
  const url = `/api/horse/${farmId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
