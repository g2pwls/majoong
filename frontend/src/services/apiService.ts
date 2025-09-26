// API 서비스 함수들
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getCurrentUserMemberUuid } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-test.majoong.site';

// axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초로 증가 (영수증 처리 시간 고려)
  // Content-Type은 요청 타입에 따라 브라우저가 자동으로 설정하도록 함
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
  farmUuid: string; // 백엔드 API와 일치하도록 추가
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
  month_total_amount?: number;
  purpose_total_amount?: number;
  member_uuid?: string; // 목장 소유자 UUID
  bookmarked?: boolean; // 즐겨찾기 상태
}

// 바로기부용 목장 인터페이스
export interface RecommendFarm {
  farmUuid: string;
  profileImage: string;
  farmName: string;
  totalScore: number;
  address: string;
  description: string;
}

export interface FarmDetail {
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
  createdAt: string;
  monthlyScores: {
    year: number;
    month: number;
    score: number;
  }[];
  horses: {
    horseUuid: string;
    horseUrl: string;
    horseName: string;
    birth: string;
    breed: string;
    gender: string;
  }[];
  bookmarked: boolean;
  ownerName: string;
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
      bookmark?: boolean; // 북마크 상태 추가
      horses?: Array<{
        horseNumber: string;
        horseName: string;
        birth: string;
        breed: string;
        gender: string;
        profileImage: string; // horseUrl 대신 profileImage 사용
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
      bookmarked: farm.bookmark || false, // 북마크 상태 매핑
      horses: (farm.horses || []).map((horse: {
        horseNumber: string;
        horseName: string;
        birth: string;
        breed: string;
        gender: string;
        profileImage: string; // horseUrl 대신 profileImage 사용
      }) => ({
        id: horse.horseNumber,
        farm_id: farm.farmUuid,
        horseNo: horse.horseNumber?.toString() || '',
        hrNm: horse.horseName,
        birthDt: '',
        horse_url: horse.profileImage // profileImage를 horse_url로 매핑
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
export async function getFarm(farmUuid: string): Promise<Farm> {
  try {
    const response = await apiClient.get(`/api/v1/farms/${farmUuid}`);
    
    console.log('농장 상세 API 응답:', response.data);
    
    if (!response.data.isSuccess) {
      throw new Error(`API 호출 실패: ${response.data.message}`);
    }

    const farm = response.data.result;
    console.log('농장 상세 result 데이터:', farm);
    console.log('monthTotalAmount:', farm.monthTotalAmount);
    console.log('purposeTotalAmount:', farm.purposeTotalAmount);
    console.log('모든 키들:', Object.keys(farm));
    
    return {
      id: farm.farmUuid,
      farmUuid: farm.farmUuid,
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
      month_total_amount: farm.monthTotalAmount,
      purpose_total_amount: farm.purposeTotalAmount,
      bookmarked: farm.bookmark || false, // 북마크 상태 추가
      horses: (farm.horses || []).map((horse: {
        horseNumber: string;
        horseName: string;
        birth: string;
        breed: string;
        gender: string;
        profileImage: string;
      }) => ({
        id: horse.horseNumber,
        farm_id: farm.farmUuid,
        horseNo: horse.horseNumber?.toString() || '',
        hrNm: horse.horseName,
        birthDt: '',
        horse_url: horse.profileImage
      }))
    };
  } catch (error) {
    console.error('농장 상세 조회 실패:', error);
    throw error;
  }
}

// 내 목장 조회
export async function getMyFarm(): Promise<Farm> {
  try {
    const response = await apiClient.get('/api/v1/farms/my-farm');
    
    console.log('내 목장 API 응답:', response.data);
    
    if (!response.data.isSuccess) {
      throw new Error(`API 호출 실패: ${response.data.message}`);
    }

    const farm = response.data.result;
    console.log('내 목장 result 데이터:', farm);
    
    return {
      id: farm.farmUuid,
      farmUuid: farm.farmUuid,
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
      month_total_amount: farm.monthTotalAmount,
      purpose_total_amount: farm.purposeTotalAmount,
      member_uuid: getCurrentUserMemberUuid() || undefined, // 현재 사용자의 memberUuid 추가
      horses: (farm.horses || []).map((horse: {
        horseNumber: string;
        horseName: string;
        birth: string;
        breed: string;
        gender: string;
        profileImage: string;
      }) => ({
        id: horse.horseNumber,
        farm_id: farm.farmUuid,
        horseNo: horse.horseNumber?.toString() || '',
        hrNm: horse.horseName,
        birthDt: '',
        horse_url: horse.profileImage
      }))
    };
  } catch (error) {
    console.error('내 목장 조회 실패:', error);
    throw error;
  }
}

// 현재 목장이 내 목장인지 확인
export async function isMyFarm(farmUuid: string): Promise<boolean> {
  try {
    const myFarm = await getMyFarm();
    return myFarm.id === farmUuid;
  } catch (error: unknown) {
    // 404 에러는 기부자가 호출했을 때 발생하는 정상적인 경우
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        console.log('내 목장이 없음 (기부자가 호출했을 때 발생하는 정상적인 경우)');
        return false;
      }
    }
    console.error('내 목장 확인 실패:', error);
    return false;
  }
}

// 말 목록 조회 (키워드 검색 포함)
export async function getHorses(params: {
  horseName?: string;
  page?: number;
  size?: number;
} = {}): Promise<{
  content: Array<{
    horse: Horse;
    farm: Farm;
  }>;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}> {
  try {
    const response = await apiClient.get('/api/v1/farms/horses', {
      params: {
        horseName: params.horseName,
        page: params.page,
        size: params.size,
      },
    });

    if (!response.data.isSuccess) {
      throw new Error(`API 호출 실패: ${response.data.message}`);
    }

    // 백엔드 응답을 프론트엔드 인터페이스에 맞게 변환
    const pageData = response.data.result;
    const horsesWithFarms = pageData.content.map((item: {
      farmUuid: string;
      horseId: number;
      horseNumber: string;
      profileImage: string;
      horseName: string;
      ownerName: string;
      farmName: string;
      countryOfOrigin: string;
      birth: string;
      color: string;
      gender: string;
    }) => ({
      horse: {
        id: item.horseId,
        farm_id: item.farmUuid,
        horseNo: item.horseNumber,
        hrNm: item.horseName,
        birthDt: item.birth,
        sex: item.gender,
        color: item.color,
        horse_url: item.profileImage,
      } as Horse,
      farm: {
        id: item.farmUuid,
        farmUuid: item.farmUuid,
        farm_name: item.farmName,
        name: item.ownerName,
        address: '', // API에서 주소 정보가 없으므로 빈 문자열
        horse_count: 0, // API에서 말 개수 정보가 없으므로 0
        total_score: 0, // API에서 점수 정보가 없으므로 0
        image_url: '', // API에서 농장 이미지 정보가 없으므로 빈 문자열
      } as Farm,
    }));

    return {
      content: horsesWithFarms,
      totalElements: pageData.totalElements,
      totalPages: pageData.totalPages,
      size: pageData.size,
      number: pageData.number,
      first: pageData.first,
      last: pageData.last
    };
  } catch (error) {
    console.error('말 목록 조회 실패:', error);
    throw error;
  }
}

// 즐겨찾기 추가
export async function addFarmBookmark(farmUuid: string): Promise<void> {
  try {
    const response = await apiClient.post(`/api/v1/members/donators/bookmarks/farms/${farmUuid}`);
    
    if (!response.data.isSuccess) {
      throw new Error(`즐겨찾기 추가 실패: ${response.data.message}`);
    }
    
    console.log('즐겨찾기 추가 성공');
  } catch (error) {
    console.error('즐겨찾기 추가 실패:', error);
    throw error;
  }
}

// 즐겨찾기 삭제
export async function removeFarmBookmark(farmUuid: string): Promise<void> {
  try {
    const response = await apiClient.delete(`/api/v1/members/donators/bookmarks/farms/${farmUuid}`);
    
    if (!response.data.isSuccess) {
      throw new Error(`즐겨찾기 삭제 실패: ${response.data.message}`);
    }
    
    console.log('즐겨찾기 삭제 성공');
  } catch (error) {
    console.error('즐겨찾기 삭제 실패:', error);
    throw error;
  }
}

// 즐겨찾기 API 응답 타입 정의
interface BookmarkFarmResponse {
  farmUuid: string;
  farmName: string;
  address: string;
  ownerName: string;
  horseCount: number;
  totalScore: number;
  profileImage: string;
  status: string;
  phoneNumber: string;
  area: string;
  description: string;
  horses?: BookmarkHorseResponse[];
}

interface BookmarkHorseResponse {
  horseNumber: string;
  horseName: string;
  profileImage: string;
}

// 즐겨찾기 목록 조회
export async function getFarmBookmarks(): Promise<Farm[]> {
  try {
    const response = await apiClient.get('/api/v1/members/donators/bookmarks/farms');
    
    if (!response.data.isSuccess) {
      throw new Error(`즐겨찾기 목록 조회 실패: ${response.data.message}`);
    }

    // 즐겨찾기 목록을 Farm 타입으로 변환
    const bookmarks = response.data.result.map((bookmark: BookmarkFarmResponse) => ({
      id: bookmark.farmUuid,
      farm_name: bookmark.farmName,
      address: bookmark.address,
      name: bookmark.ownerName,
      horse_count: bookmark.horseCount,
      total_score: bookmark.totalScore,
      image_url: bookmark.profileImage,
      state: bookmark.status,
      farm_phone: bookmark.phoneNumber,
      area: bookmark.area,
      description: bookmark.description,
      horses: (bookmark.horses || []).map((horse: BookmarkHorseResponse) => ({
        id: horse.horseNumber,
        farm_id: bookmark.farmUuid,
        horseNo: horse.horseNumber?.toString() || '',
        hrNm: horse.horseName,
        birthDt: '',
        horse_url: horse.profileImage
      }))
    }));

    return bookmarks;
  } catch (error) {
    console.error('즐겨찾기 목록 조회 실패:', error);
    throw error;
  }
}

// 특정 농장이 즐겨찾기에 있는지 확인
export async function isFarmBookmarked(farmUuid: string): Promise<boolean> {
  try {
    const bookmarks = await getFarmBookmarks();
    return bookmarks.some(bookmark => bookmark.id === farmUuid);
  } catch (error) {
    console.error('즐겨찾기 확인 실패:', error);
    return false;
  }
}

// 영수증 정산 제출 타입 정의 (백엔드 DTO와 일치)
interface ReceiptSettlementPayload {
  reason: string; // 최대 1000자
  storeInfo: {
    name: string;    // 최대 255자
    address: string; // 최대 255자
    phone: string;   // 최대 15자
  };
  content: string; // 최대 1000자
  items: Array<{
    name: string;      // 최대 255자
    quantity: number;  // 최소 1
    unitPrice: number; // 최소 1
    totalPrice: number; // 최소 1
  }>;
  receiptAmount: number; // 최소 1
  categoryId: number;    // Long 타입 (백엔드에서 Long으로 받음)
  idempotencyKey: string; // 최대 36자
  approvalNumber: string; // 최대 255자
}

interface ReceiptSettlementResponse {
  settlement: {
    released: boolean;
    reason: string;
    farmerWallet: string;
    vaultAddress: string;
    releasedAmount: string;
  };
  withdraw: {
    responseCode: string;
    responseMessage: string;
    rec: Array<{
      transactionUniqueNo: string;
      accountNo: string;
      transactionDate: string;
      transactionType: string;
      transactionTypeName: string;
      transactionAccountNo: string;
    }>;
  };
  burn: {
    burnTxHash: string | null;
    burnSucceeded: boolean;
  };
}

// 중복 요청 방지를 위한 요청 추적 (멱등성 키별로 관리)
const submittingKeys = new Set<string>();

// 영수증 정산 제출
export async function submitReceiptSettlement(
  payload: ReceiptSettlementPayload,
  photoFile: File
): Promise<ReceiptSettlementResponse> {
  // 중복 실행 방지 (멱등성 키별로 관리)
  if (submittingKeys.has(payload.idempotencyKey)) {
    console.log("이미 제출 중인 멱등성 키입니다. 중복 요청을 무시합니다.", payload.idempotencyKey);
    throw new Error("이미 제출 중입니다. 잠시 후 다시 시도해주세요.");
  }

  try {
    submittingKeys.add(payload.idempotencyKey);
    console.log("=== submitReceiptSettlement 시작 ===", { 
      idempotencyKey: payload.idempotencyKey,
      timestamp: new Date().toISOString()
    });

    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    formData.append('photo', photoFile);

    const response = await apiClient.post('/api/v1/settlement-withdraw-burn', formData, {
      // Content-Type은 브라우저가 multipart/form-data와 boundary를 자동으로 설정하도록 함
      timeout: 60000, // 영수증 제출은 60초로 별도 설정 (이미지 처리 시간 고려)
    });

    console.log("=== submitReceiptSettlement 응답 받음 ===", { 
      status: response.status,
      responseData: response.data,
      timestamp: new Date().toISOString()
    });

    // 백엔드에서 SettlementWithdrawBurnResponseDto를 직접 반환하므로 응답 구조가 다름
    // response.data가 직접 SettlementWithdrawBurnResponseDto 객체
    if (response.status !== 200) {
      throw new Error(`정산 제출 실패: HTTP ${response.status}`);
    }

    // 정산 결과 확인
    if (response.data?.settlement?.released === false) {
      throw new Error(`정산 제출 실패: ${response.data.settlement?.reason || '알 수 없는 오류'}`);
    }

    return response.data;
  } catch (error: unknown) {
    console.error('정산 제출 실패:', error);
    
    // 상세한 에러 정보 로깅
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; statusText: string; data: unknown } };
      console.error('응답 에러:', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data
      });
    } else if (error && typeof error === 'object' && 'request' in error) {
      console.error('요청 에러:', (error as { request: unknown }).request);
    } else {
      console.error('기타 에러:', error instanceof Error ? error.message : String(error));
    }
    
    // 타임아웃 에러에 대한 특별 처리
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
    }
    
    throw error;
  } finally {
    submittingKeys.delete(payload.idempotencyKey);
  }
}

// 바로기부용 추천 목장 조회
export const getRecommendFarms = async (): Promise<RecommendFarm[]> => {
  try {
    const response = await apiClient.get('/api/v1/farms/recommend');
    
    if (response.status !== 200) {
      throw new Error(`추천 목장 조회 실패: HTTP ${response.status}`);
    }

    return response.data.result || [];
  } catch (error: unknown) {
    console.error('추천 목장 조회 실패:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; statusText: string; data: unknown } };
      console.error('응답 에러:', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data
      });
    }
    
    throw error;
  }
}

// 목장 상세 정보 조회
export const getFarmDetail = async (farmUuid: string): Promise<FarmDetail> => {
  try {
    const response = await apiClient.get(`/api/v1/farms/${farmUuid}`);
    
    if (response.status !== 200) {
      throw new Error(`목장 상세 정보 조회 실패: HTTP ${response.status}`);
    }

    return response.data.result;
  } catch (error: unknown) {
    console.error('목장 상세 정보 조회 실패:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; statusText: string; data: unknown } };
      console.error('응답 에러:', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data
      });
    }
    
    throw error;
  }
}
