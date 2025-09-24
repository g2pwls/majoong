// 농장 관련 API 서비스 함수

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Farm, Horse, HorseDetailResponse, MonthlyReportResponse, DonationUsageResponse, ScoreHistoryResponse, ScoreHistoryListResponse, MonthlyReportDetailResponse, FarmRegistrationRequest, FarmRegistrationResponse, ReceiptDetailResponse } from '@/types/farm';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
console.log(API_BASE_URL)
// axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true, // CORS 문제 해결을 위해 true로 변경
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    console.log('API 요청 상세:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('Access token added to request');
    }
    return config;
  },
  (error) => {
    console.error('요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API 응답 성공:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error 상세:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      stack: error.stack,
      name: error.name
    });
    return Promise.reject(error);
  }
);

export class FarmService {
  // 농장 정보 조회
  static async getFarm(farmUuid: string): Promise<Farm> {
    try {
      const response = await apiClient.get(`/api/v1/farms/${farmUuid}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      const farm = response.data.result;
      return {
        id: farm.farmUuid,
        farmUuid: farm.farmUuid,
        farm_name: farm.farmName,
        address: farm.address,
        name: farm.ownerName,
        horse_count: farm.horseCount,
        total_score: farm.totalScore,
        image_url: farm.profileImage,
        farm_phone: farm.phoneNumber,
        area: farm.area,
        description: farm.description,
        month_total_amount: farm.monthTotalAmount,
        purpose_total_amount: farm.purposeTotalAmount,
      };
    } catch (error) {
      console.error('농장 정보 조회 실패:', error);
      throw error;
    }
  }

  // 농장의 말 목록 조회 (농장 상세 정보에서 말 목록 추출)
  static async getHorses(farmUuid: string): Promise<Horse[]> {
    try {
      const response = await apiClient.get(`/api/v1/farms/${farmUuid}`);
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      const farmData = response.data.result;
      const horses = farmData.horses || [];
      
      // FarmHorseDetailResponseDto를 Horse 타입으로 변환
      return horses.map((h: {
        horseUuid: string;
        horseName: string;
        birth: string;
        breed: string;
        gender: string;
        horseUrl: string;
      }) => ({
        id: h.horseUuid,
        horseNo: h.horseUuid, // horseUuid를 horseNo로 사용
        hrNm: h.horseName,
        birthDt: h.birth,
        breed: h.breed,
        sex: h.gender,
        image: h.horseUrl,
      }));
    } catch (error) {
      console.error('말 목록 조회 실패:', error);
      throw error;
    }
  }

  // 농장 위치 조회 (위도/경도)
  static async getFarmLocation(farmUuid: string): Promise<{ latitude: number; longitude: number }> {
    try {
      const response = await apiClient.get(`/api/v1/farms/${farmUuid}/location`);
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      return response.data.result;
    } catch (error) {
      console.error('농장 위치 조회 실패:', error);
      throw error;
    }
  }

  // 말 정보 등록
  static async registerHorse(horseData: {
    farmUuid: string;
    horseNumber: string;
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
    
    // 기본 정보 추가 (백엔드 DTO 필드명과 정확히 일치)
    formData.append('farmUuid', horseData.farmUuid);
    formData.append('horseNumber', horseData.horseNumber.toString());
    formData.append('horseName', horseData.horseName);
    formData.append('birth', horseData.birth); // YYYY-MM-DD 형식
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

    try {
      console.log('Registering horse with data:', {
        farmUuid: horseData.farmUuid,
        horseNumber: horseData.horseNumber,
        horseName: horseData.horseName,
        hasProfileImage: !!horseData.profileImage,
        profileImageName: horseData.profileImage?.name,
        profileImageSize: horseData.profileImage?.size
      });

      // FormData 내용 확인
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await apiClient.post('/api/v1/members/farmers/my-farm/horses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30초로 늘림
      });

      console.log('Response status:', response.status);
      console.log('API response:', response.data);
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      const errorMessage = error instanceof Error ? error.message : '말 등록 중 오류가 발생했습니다.';
      const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown }; config?: unknown };
      console.error('말 등록 실패:', {
        message: errorMessage,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        config: axiosError.config
      });
      
      // 백엔드에서 보낸 에러 메시지가 있다면 표시
      if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
        const errorData = axiosError.response.data as { message?: string; result?: string };
        console.error('백엔드 에러 상세:', errorData);
        if (errorData.message) {
          throw new Error(`말 등록 실패: ${errorData.message}`);
        }
        if (errorData.result) {
          throw new Error(`말 등록 실패: ${errorData.result}`);
        }
      }
      
      throw error;
    }
  }

  // 말 상세 정보 조회
  static async getHorseDetail(farmUuid: string, horseNumber: string, year: number, month: number): Promise<HorseDetailResponse> {
    try {
      const response = await apiClient.get(`/api/v1/farms/${farmUuid}/horses/${horseNumber}`, {
        params: { year, month },
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('말 상세 정보 조회 실패:', error);
      throw error;
    }
  }

  // 월간 보고서 조회
  static async getMonthlyReports(farmUuid: string, year: number): Promise<MonthlyReportResponse> {
    try {
      console.log('월간 보고서 API 요청:', {
        farmUuid,
        year,
      });

      const response = await apiClient.get(`/api/v1/farms/${farmUuid}/monthly-reports`, {
        params: { year },
      });

      console.log('월간 보고서 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('월간 보고서 조회 실패:', error);
      throw error;
    }
  }

  // 기부금 사용 내역 조회
  static async getDonationUsage(farmUuid: string, year: number, month: number): Promise<DonationUsageResponse> {
    try {
      console.log('기부금 사용 내역 API 요청:', {
        farmUuid,
        year,
        month,
      });

      const response = await apiClient.get(`/api/v1/farms/${farmUuid}/donations/usage`, {
        params: { year, month },
      });

      console.log('기부금 사용 내역 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      return response.data;
    } catch (error) {
      console.error('기부금 사용 내역 조회 실패:', error);
      throw error;
    }
  }


  // 신뢰도 내역 조회
  static async getScoreHistory(farmUuid: string, year: number, month?: number): Promise<ScoreHistoryResponse> {
    try {
      console.log('신뢰도 내역 API 요청:', {
        farmUuid,
        year,
        month,
      });

      const params: { year: number; month?: number } = { year };
      if (month !== undefined) {
        params.month = month;
      }

      const response = await apiClient.get(`/api/v1/farms/${farmUuid}/scores`, {
        params,
      });

      console.log('신뢰도 내역 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      return response.data;
    } catch (error) {
      console.error('신뢰도 내역 조회 실패:', error);
      throw error;
    }
  }

  // 신뢰도 목록 조회
  static async getScoreHistoryList(farmUuid: string, year?: number, month?: number): Promise<ScoreHistoryListResponse> {
    try {
      console.log('신뢰도 목록 API 요청:', {
        farmUuid,
        year,
        month,
      });

      const params: { year?: number; month?: number } = {};
      if (year !== undefined) {
        params.year = year;
      }
      if (month !== undefined) {
        params.month = month;
      }

      const response = await apiClient.get(`/api/v1/farms/${farmUuid}/scores/history`, {
        params,
      });

      console.log('신뢰도 목록 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      return response.data;
    } catch (error) {
      console.error('신뢰도 목록 조회 실패:', error);
      throw error;
    }
  }

  // 월간 보고서 상세 조회
  static async getMonthlyReportDetail(farmUuid: string, reportId: number): Promise<MonthlyReportDetailResponse> {
    try {
      console.log('월간 보고서 상세 API 요청:', {
        farmUuid,
        reportId,
      });

      const response = await apiClient.get(`/api/v1/farms/${farmUuid}/monthly-reports/${reportId}`);

      console.log('월간 보고서 상세 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('월간 보고서 상세 조회 실패:', error);
      throw error;
    }
  }

  // 농장 정보 등록/수정 (FormData 사용)
  static async registerFarmWithFormData(formData: FormData): Promise<FarmRegistrationResponse> {
    try {
      console.log('농장 정보 등록/수정 API 요청 (FormData):', {
        url: '/api/v1/members/farmers/my-farm',
        baseURL: API_BASE_URL
      });

      const response = await apiClient.post('/api/v1/members/farmers/my-farm', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30초로 늘림
      });

      console.log('농장 정보 등록/수정 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      return response.data;
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('농장 정보 등록/수정 실패:', {
        error: error,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      // 더 구체적인 에러 메시지 제공
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('서버에 연결할 수 없습니다. API 서버가 실행 중인지 확인해주세요.');
      } else if (error.response?.status === 404) {
        throw new Error('API 엔드포인트를 찾을 수 없습니다.');
      } else if (error.response?.status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.response?.status === 401) {
        throw new Error('인증이 필요합니다. 로그인을 다시 해주세요.');
      } else if (error.response?.status === 403) {
        throw new Error('권한이 없습니다.');
      } else {
        throw new Error(`요청 처리 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  }

  // 농장 정보 등록/수정 (기존 JSON 방식 - 호환성을 위해 유지)
  static async registerFarm(farmData: FarmRegistrationRequest): Promise<FarmRegistrationResponse> {
    try {
      console.log('농장 정보 등록/수정 API 요청:', {
        url: '/api/v1/members/farmers/my-farm',
        data: farmData,
        baseURL: API_BASE_URL
      });

      const response = await apiClient.post('/api/v1/members/farmers/my-farm', farmData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('농장 정보 등록/수정 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      return response.data;
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('농장 정보 등록/수정 실패:', {
        error: error,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      // 더 구체적인 에러 메시지 제공
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        throw new Error('서버에 연결할 수 없습니다. API 서버가 실행 중인지 확인해주세요.');
      } else if (error.response?.status === 404) {
        throw new Error('API 엔드포인트를 찾을 수 없습니다.');
      } else if (error.response?.status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.response?.status === 401) {
        throw new Error('인증이 필요합니다. 로그인을 다시 해주세요.');
      } else if (error.response?.status === 403) {
        throw new Error('권한이 없습니다.');
      } else {
        throw new Error(`요청 처리 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  }

  // 기부금 사용 내역 상세 조회
  static async getReceiptDetail(farmUuid: string, usageId: number): Promise<ReceiptDetailResponse> {
    try {
      console.log('기부금 사용 내역 상세 API 요청:', {
        farmUuid,
        usageId,
      });

      const response = await apiClient.get(`/api/v1/farms/${farmUuid}/donations/usage/${usageId}`);

      console.log('기부금 사용 내역 상세 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('기부금 사용 내역 상세 조회 실패:', error);
      throw error;
    }
  }

  // 말 관리 상태 업로드
  static async uploadHorseManagementStatus(
    farmUuid: string,
    horseNumber: string,
    data: {
      frontImage?: File;
      leftSideImage?: File;
      rightSideImage?: File;
      stableImage?: File;
      content?: string;
    }
  ): Promise<void> {
    try {
      console.log('말 관리 상태 업로드 API 요청:', {
        farmUuid,
        horseNumber,
        hasFrontImage: !!data.frontImage,
        hasLeftSideImage: !!data.leftSideImage,
        hasRightSideImage: !!data.rightSideImage,
        hasStableImage: !!data.stableImage,
        hasContent: !!data.content
      });

      const formData = new FormData();
      
      if (data.frontImage) {
        formData.append('frontImage', data.frontImage);
      }
      if (data.leftSideImage) {
        formData.append('leftSideImage', data.leftSideImage);
      }
      if (data.rightSideImage) {
        formData.append('rightSideImage', data.rightSideImage);
      }
      if (data.stableImage) {
        formData.append('stableImage', data.stableImage);
      }
      if (data.content) {
        formData.append('content', data.content);
      }

      // 먼저 GET 요청으로 엔드포인트 존재 여부 확인
      try {
        const testResponse = await apiClient.get(`/api/v1/members/farms/${farmUuid}/horses/${horseNumber}`);
        console.log('GET 테스트 응답:', testResponse.status);
      } catch (testError) {
        console.log('GET 테스트 실패:', testError);
      }

      const response = await apiClient.post(
        `/api/v1/members/farms/${farmUuid}/horses/${horseNumber}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30초로 늘림
        }
      );

      console.log('말 관리 상태 업로드 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }
    } catch (error) {
      console.error('말 관리 상태 업로드 실패:', error);
      
      // Axios 에러인 경우 더 자세한 정보 로깅
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: unknown; 
            status?: number; 
            statusText?: string;
            headers?: unknown;
          }; 
          config?: unknown;
          message?: string;
        };
        
        console.error('Axios 에러 상세:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
          message: axiosError.message,
          config: axiosError.config
        });
      }
      
      throw error;
    }
  }

  // 주간 보고서 조회 (말 상세 페이지용)
  static async getHorseWeeklyReports(
    farmUuid: string, 
    horseNumber: string, 
    year?: number, 
    month?: number
  ): Promise<HorseDetailResponse> {
    try {
      console.log('주간 보고서 조회 API 요청:', {
        farmUuid,
        horseNumber,
        year,
        month
      });

      const params: { year?: number; month?: number } = {};
      if (year) params.year = year;
      if (month) params.month = month;

      const response = await apiClient.get(
        `/api/v1/farms/${farmUuid}/horses/${horseNumber}`,
        { params }
      );

      console.log('주간 보고서 조회 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('주간 보고서 조회 실패:', error);
      throw error;
    }
  }

  // 말 주간 보고서 상세 조회
  static async getHorseWeeklyReportDetail(horseNum: number, horseStateId: number) {
    try {
      console.log('말 주간 보고서 상세 조회 API 호출:', {
        horseNum,
        horseStateId
      });

      const response = await apiClient.get(
        `/api/v1/farms/horses/${horseNum}/weekly-reports/${horseStateId}`
      );

      console.log('말 주간 보고서 상세 조회 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('말 주간 보고서 상세 조회 실패:', error);
      throw error;
    }
  }

  // 말 삭제
  static async deleteHorse(farmUuid: string, horseNumber: string): Promise<void> {
    try {
      console.log('말 삭제 API 요청:', {
        farmUuid,
        horseNumber
      });

      const response = await apiClient.delete(
        `/api/v1/members/farmers/my-farm/horses/${horseNumber}`,
        {
          params: { farmUuid }
        }
      );

      console.log('말 삭제 API 응답:', {
        status: response.status,
        data: response.data,
      });
      
      if (!response.data.isSuccess) {
        throw new Error(`API 호출 실패: ${response.data.message}`);
      }
    } catch (error) {
      console.error('말 삭제 실패:', error);
      throw error;
    }
  }
}

