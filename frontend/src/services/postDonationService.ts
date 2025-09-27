import { authApi } from './authService';

// 기부자 농장 말 정보 타입
export interface PostDonationHorseInfo {
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

// 기부자 농장 말 목록 조회 API 응답 타입
export interface PostDonationHorseResponse {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  code: number;
  result: PostDonationHorseInfo[];
}

// 기부자 농장 말 목록 조회
export const getDonatorFarmHorses = async (farmUuid: string): Promise<PostDonationHorseInfo[]> => {
  try {
    console.log('기부자 농장 말 목록 조회 시작:', farmUuid);
    
    const response = await authApi.get<PostDonationHorseResponse>(`/api/v1/members/donators/farms/${farmUuid}`);
    
    console.log('기부자 농장 말 목록 조회 응답:', response.data);
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
    } else {
      throw new Error(response.data.message || '말 목록 조회에 실패했습니다.');
    }
  } catch (error: unknown) {
    console.error('기부자 농장 말 목록 조회 오류:', error);
    
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

// 컬렉션에 말 추가
export const addHorseToCollection = async (horseNumber: string, farmUuid: string): Promise<void> => {
  try {
    console.log('컬렉션에 말 추가 시작:', { horseNumber, farmUuid });
    
    const response = await authApi.post('/api/v1/members/donators/collections', {
      horseNumber,
      farmUuid
    });
    
    console.log('컬렉션에 말 추가 응답:', response.data);
    
    if (response.data.isSuccess) {
      console.log('말이 컬렉션에 성공적으로 추가되었습니다.');
    } else {
      throw new Error(response.data.message || '말을 컬렉션에 추가하는데 실패했습니다.');
    }
  } catch (error: unknown) {
    console.error('컬렉션에 말 추가 오류:', error);
    
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
