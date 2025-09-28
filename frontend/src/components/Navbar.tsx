// components/Navbar.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { getTokens, clearTokens, getUserRole } from '@/services/authService';
import { getFarmerInfo, getDonatorInfo, getMyFarm } from '@/services/userService';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [farmerFarmUuid, setFarmerFarmUuid] = useState<string | null>(null);
  const [showFarmRegistrationModal, setShowFarmRegistrationModal] = useState(false);

  useEffect(() => {
    // 로그인 상태 및 사용자 이름 확인
    const checkLoginStatus = async () => {
      const tokens = getTokens();
      
      // accessToken이 있으면 로그인 상태 (마중 플랫폼 가입 완료)
      if (tokens.accessToken) {
        setIsLoggedIn(true);
        
        // 사용자 역할에 따라 실제 이름 가져오기
        const role = getUserRole();
        console.log('현재 사용자 역할:', role);
        setUserRole(role);
        if (role === 'FARMER') {
          try {
            // 목장주 개인 정보 가져오기
            const farmerData = await getFarmerInfo();
            console.log('목장주 정보 응답:', farmerData.result);
            setUserName(farmerData.result.nameString);
            
            // 목장주 자신의 목장 정보 가져오기 (farmUuid 포함)
            try {
              const myFarmData = await getMyFarm();
              console.log('내 목장 정보 응답:', myFarmData.result);
              console.log('내 목장 farmUuid:', myFarmData.result.farmUuid);
              setFarmerFarmUuid(myFarmData.result.farmUuid);
            } catch (farmError) {
              console.log('목장 정보 없음 (목장 미등록 상태):', farmError);
              setFarmerFarmUuid(null);
            }
          } catch (error) {
            console.error('목장주 정보 조회 실패:', error);
            setUserName(null);
            setFarmerFarmUuid(null);
          }
        } else if (role === 'DONATOR') {
          try {
            const donatorData = await getDonatorInfo();
            console.log('기부자 정보 응답:', donatorData.result);
            setUserName(donatorData.result.nameString);
          } catch (error) {
            console.error('기부자 정보 조회 실패:', error);
            setUserName(null);
          }
        }
      } else {
        // accessToken이 없으면 로그아웃 상태 (마중 플랫폼 가입 미완료)
        setIsLoggedIn(false);
        setUserName(null);
        setUserRole(null);
        setFarmerFarmUuid(null);
      }
    };

    // 초기 로그인 상태 확인
    checkLoginStatus();

    // 로그인 상태 변경 이벤트 리스너 등록
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시)
    window.addEventListener('storage', handleStorageChange);

    // 커스텀 이벤트 리스너 (같은 탭에서 로그인/로그아웃 시)
    window.addEventListener('authStateChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    clearTokens();
    setIsLoggedIn(false);
    setUserName(null);
    setUserRole(null);
    setFarmerFarmUuid(null);
    // 메인 페이지로 리다이렉트
    window.location.href = '/';
  };

  const handleMyFarmClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (farmerFarmUuid) {
      // 목장이 등록된 경우 목장 상세 페이지로 이동 (클라이언트 사이드 네비게이션)
      router.push(`/support/${farmerFarmUuid}`);
    } else {
      // 목장이 등록되지 않은 경우 모달 표시
      setShowFarmRegistrationModal(true);
    }
  };

  // ESC 키로 모달 닫기
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showFarmRegistrationModal) {
        setShowFarmRegistrationModal(false);
      }
    };

    if (showFarmRegistrationModal) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showFarmRegistrationModal]);

  // 모달이 열릴 때 body 스크롤 제어
  React.useEffect(() => {
    if (showFarmRegistrationModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showFarmRegistrationModal]);

  // intro 페이지에서는 네브바를 표시하지 않음
  if (pathname === '/intro') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-[white/80] backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link 
            href={userRole === 'FARMER' ? '/dashboard' : userRole === 'DONATOR' ? '/donator' : '/'} 
            className="flex items-center gap-2 font-bold text-xl text-black"
          >
            <Image 
              src="/logo.png" 
              alt="마중 로고" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            마중
          </Link>

          <ul className="hidden gap-5 sm:flex">
            <li><Link href="/about" className="text-sm font-bold text-black hover:opacity-70">소개</Link></li>
            <li><Link href="/support" className="text-sm font-bold text-black hover:opacity-70">
              {userRole === 'FARMER' ? '전체목장' : '목장후원'}
            </Link></li>
            {userRole === 'FARMER' && (
              <>
                <li><button onClick={handleMyFarmClick} className="text-sm font-bold text-black hover:opacity-70 cursor-pointer">나의목장</button></li>
                <li><Link href="/mypage" className="text-sm font-bold text-black hover:opacity-70">마이페이지</Link></li>
              </>
            )}
            {userRole !== 'FARMER' && (
              <>
                <li><Link href="/godonate" className="text-sm font-bold text-black hover:opacity-70">바로기부</Link></li>
                <li><Link href="/mypage" className="text-sm font-bold text-black hover:opacity-70">마이페이지</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Right: actions */}
        <div className="hidden sm:block">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/mypage"
                className="text-sm text-black hover:font-semibold cursor-pointer transition-all duration-200"
              >
                {userName ? `${userName}님` : ''}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded border px-4 py-1 text-sm text-black hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded border px-4 py-1 text-sm text-black hover:bg-gray-50"
            >
              로그인
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(v => !v)}
        >
          {/* 햄버거 아이콘 (간단히) */}
          <div className="h-0.5 w-6 bg-black mb-1.5" />
          <div className="h-0.5 w-6 bg-black mb-1.5" />
          <div className="h-0.5 w-6 bg-black" />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden border-t bg-white">
          <ul className="px-4 my-2 flex flex-col gap-2 py-2">
            <li><Link href="/about" onClick={() => setOpen(false)} className="font-bold text-black">소개</Link></li>
            <li><Link href="/support" onClick={() => setOpen(false)} className="font-bold text-black">
              {userRole === 'FARMER' ? '전체목장' : '목장후원'}
            </Link></li>
            {userRole === 'FARMER' && (
              <>
                <li><button onClick={(e) => { handleMyFarmClick(e); setOpen(false); }} className="text-left w-full font-bold text-black">나의목장</button></li>
                <li><Link href="/mypage" onClick={() => setOpen(false)} className="font-bold text-black">마이페이지</Link></li>
              </>
            )}
            {userRole !== 'FARMER' && (
              <>
                <li><Link href="/godonate" onClick={() => setOpen(false)} className="font-bold text-black">바로기부</Link></li>
                <li><Link href="/mypage" onClick={() => setOpen(false)} className="font-bold text-black">마이페이지</Link></li>
              </>
            )}
            <li className="pt-2">
              {isLoggedIn ? (
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-black">
                    {userName ? `${userName}님` : ''}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="rounded border px-4 py-1 text-sm text-black"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center rounded border px-4 py-2 text-black"
                  onClick={() => setOpen(false)}
                >
                  로그인
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}

      {/* 목장 등록 모달 - Portal을 사용하여 body에 직접 렌더링 */}
      {showFarmRegistrationModal && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={() => setShowFarmRegistrationModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                목장을 등록해주세요
              </h3>
              <p className="text-gray-600 mb-6">
                목장 등록 후 이용할 수 있는 메뉴입니다.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowFarmRegistrationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowFarmRegistrationModal(false);
                    router.push('/farm/register');
                  }}
                  className="px-4 py-2 text-white rounded-md transition-colors"
                  style={{ backgroundColor: '#4D3A2C' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d2f24'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4D3A2C'}
                >
                  목장 등록
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
