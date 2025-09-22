'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore, UserRole } from '@/stores';
import { getTokens, getUserRole, debugTokenStatus } from '@/services/authService';

// 탭 컴포넌트들 (추후 구현)
import DonorProfile from '@/components/mypage/DonorProfile';
import DonorSupportHistory from '@/components/mypage/DonorSupportHistory';
import DonorFavoriteFarms from '@/components/mypage/DonorFavoriteFarms';

import FarmerProfile from '@/components/mypage/FarmerProfile';
import FarmerMyFarm from '@/components/mypage/FarmerMyFarm';
import FarmerSupportHistory from '@/components/mypage/FarmerSupportHistory';

import AdminProfile from '@/components/mypage/AdminProfile';
import AdminReportHistory from '@/components/mypage/AdminReportHistory';


interface TabConfig {
  id: string;
  label: string;
  component: React.ComponentType<Record<string, unknown>>;
}

export default function MyPage() {
  const router = useRouter();
  const { 
    userRole, 
    farmerInfo, 
    donatorInfo, 
    isLoading, 
    loadUserData, 
    setError 
  } = useAuthStore();
  const { activeTab, setActiveTab } = useUIStore();

  useEffect(() => {
    const initializeUserData = async () => {
      try {
        // 토큰 상태 디버깅
        debugTokenStatus();
        
        // 로그인 상태 확인
        const tokens = getTokens();
        if (!tokens.accessToken && !tokens.tempAccessToken) {
          console.log('❌ 로그인 토큰이 없음, 로그인 페이지로 이동');
          router.push('/login');
          return;
        }

        // 사용자 역할 확인
        const role = getUserRole();
        if (!role) {
          console.error('사용자 역할을 찾을 수 없습니다.');
          router.push('/login');
          return;
        }

        console.log('✅ 사용자 역할 확인:', role);
        
        // Zustand 스토어에서 사용자 데이터 로드
        await loadUserData();
      } catch (error) {
        console.error('사용자 데이터 로드 오류:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      }
    };

    initializeUserData();
  }, [router, loadUserData, setError]);

  // 역할별 탭 설정
  const getTabsByRole = (role: UserRole): TabConfig[] => {
    switch (role) {
      case 'DONATOR':
        return [
          { id: 'profile', label: '회원 정보', component: DonorProfile },
          { id: 'support', label: '후원 내역', component: DonorSupportHistory },
          { id: 'favorites', label: '즐겨찾는 농장', component: DonorFavoriteFarms },
        ];
      case 'FARMER':
        return [
          { id: 'profile', label: '회원 정보', component: FarmerProfile },
          { id: 'farm', label: '나의 목장', component: FarmerMyFarm },
          { id: 'support', label: '후원 내역', component: FarmerSupportHistory },
        ];
      case 'ADMIN':
        return [
          { id: 'profile', label: '회원 정보', component: AdminProfile },
          { id: 'reports', label: '신고 내역', component: AdminReportHistory },
        ];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const tabs = getTabsByRole(userRole);
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <p className="mt-2 text-gray-600">
            {userRole === 'DONATOR' && '기부자'}
            {userRole === 'FARMER' && '목장주'}
            {userRole === 'ADMIN' && '관리자'}
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-lg shadow">
          {ActiveComponent && (() => {
            // 사용자 역할에 따라 적절한 props 전달
            if (userRole === 'FARMER') {
              return <ActiveComponent farmerInfo={farmerInfo} userRole={userRole} />;
            } else if (userRole === 'DONATOR') {
              return <ActiveComponent donatorInfo={donatorInfo} userRole={userRole} />;
            } else {
              return <ActiveComponent userRole={userRole} />;
            }
          })()}
        </div>
      </div>
    </div>
  );
}
