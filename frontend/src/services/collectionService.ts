import { authApi } from './authService';

// 컬렉션 조회
export const getCollection = async (farmUuid: string): Promise<any[]> => {
  try {
    console.log('컬렉션 조회 시작:', farmUuid);
    
    const response = await authApi.get(`/api/v1/members/donators/collections?farmUuid=${farmUuid}`);
    
    console.log('컬렉션 조회 응답:', response.data);
    
    if (response.data.isSuccess && response.data.result) {
      return response.data.result;
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
