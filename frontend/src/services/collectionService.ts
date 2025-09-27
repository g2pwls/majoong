import { authApi } from './authService';

// 컬렉션 아이템 타입
export interface CollectionItem {
  farmName: string;
  horseNumber: string;
  horseName: string;
  profileImage: string;
  birth: string;
  raceCount: string;
  gender: string;
  breed: string;
  totalPrize: string;
  firstRaceDate: string | null;
  lastRaceDate: string | null;
}

// 컬렉션 조회 API 응답 타입
export interface CollectionResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    count: number;
    dtos: CollectionItem[];
  };
}

// 컬렉션 조회
export const getCollection = async (): Promise<CollectionItem[]> => {
  try {
    console.log('컬렉션 조회 시작');
    
    const response = await authApi.get<CollectionResponse>(`/api/v1/members/donators/collections`);
    
    console.log('컬렉션 조회 응답:', response.data);
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result.dtos;
    } else {
      throw new Error(response.data.message || '컬렉션 조회에 실패했습니다.');
    }
  } catch (error: unknown) {
    console.error('컬렉션 조회 오류:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { 
        response?: { 
          data?: unknown; 
          status?: number; 
          statusText?: string 
        } 
      };
      console.error('에러 응답:', {
        data: axiosError.response?.data,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText
      });
    }
    
    throw error;
  }
};
