'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTokens, getUserRole } from '@/services/authService';
import { getMyFarm } from '@/services/userService';
import { MyFarmResponse } from '@/types/user';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [myFarmData, setMyFarmData] = useState<MyFarmResponse['result'] | null>(null);

  useEffect(() => {
    const checkAuthorizationAndLoadFarm = async () => {
      const tokens = getTokens();
      const userRole = getUserRole();
      
      // 로그인하지 않은 경우 또는 목장주가 아닌 경우
      if (!tokens.accessToken || userRole !== 'FARMER') {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // 목장 정보 가져오기
        const response = await getMyFarm();
        if (response.isSuccess && response.result) {
          setMyFarmData(response.result);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('목장 정보 조회 오류:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorizationAndLoadFarm();
  }, []);


  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 권한이 없는 경우
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600 mb-8">
            이 페이지는 목장주 계정으로만 접근할 수 있습니다.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인하기
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full sm:w-auto bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors ml-0 sm:ml-3"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 목장 정보가 없는 경우
  if (!myFarmData?.farmUuid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            목장 정보를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-8">
            목장 등록을 먼저 완료해주세요.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/farm/register')}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              목장 등록하기
            </button>
            <button
              onClick={() => router.push('/mypage')}
              className="w-full sm:w-auto bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors ml-0 sm:ml-3"
            >
              마이페이지로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard farmData={myFarmData} />;
}
