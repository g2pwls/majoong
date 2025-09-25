'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTokens, getUserRole } from '@/services/authService';
import { getMyFarm } from '@/services/userService';
import { MyFarmResponse } from '@/types/user';

export default function ShortcutPage() {
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

  const handleNavigation = (path: string) => {
    router.push(path);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            목장주 바로가기
          </h1>
          <p className="text-lg text-gray-600">
            목장 운영에 필요한 주요 기능에 빠르게 접근하세요
          </p>
        </div>

        {/* 바로가기 버튼 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          
          {/* 내 목장 조회 */}
          <button
            onClick={() => handleNavigation(`/support/${myFarmData?.farmUuid}`)}
            className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left border border-gray-200 hover:border-blue-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                내 목장 조회
              </h3>
              <p className="text-gray-600 text-sm">
                목장 정보와 상태를 확인하세요
              </p>
            </div>
          </button>

          {/* 운영 보고 */}
          <button
            onClick={() => handleNavigation(`/support/${myFarmData?.farmUuid}/report`)}
            className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left border border-gray-200 hover:border-green-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                운영 보고
              </h3>
              <p className="text-gray-600 text-sm">
                목장 운영 현황을 보고하고<br />
                후원금 사용 내역을 증빙하세요
              </p>
            </div>
          </button>

          {/* 마이페이지 */}
          <button
            onClick={() => handleNavigation('/mypage')}
            className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left border border-gray-200 hover:border-orange-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                마이페이지
              </h3>
              <p className="text-gray-600 text-sm">
                개인 정보와 설정을 관리하세요
              </p>
            </div>
          </button>

        </div>

        {/* 하단 안내 메시지 */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            각 버튼을 클릭하여 해당 기능으로 바로 이동할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
