// components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/stores';
import { getTokens, getUserRole } from '@/services/authService';

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, userRole, farmerInfo, donatorInfo, loadUserData } = useAuthStore();
  const { isNavbarOpen, setNavbarOpen } = useUIStore();

  // 사용자 이름 가져오기
  const getUserName = () => {
    if (userRole === 'FARMER' && farmerInfo) {
      return farmerInfo.nameString;
    } else if (userRole === 'DONATOR' && donatorInfo) {
      return donatorInfo.nameString;
    }
    return null;
  };

  const userName = getUserName();

  useEffect(() => {
    // 로그인 상태 및 사용자 데이터 확인
    const checkLoginStatus = async () => {
      const tokens = getTokens();
      const role = getUserRole();
      
      if (tokens.accessToken && role) {
        // 로그인 상태이지만 사용자 데이터가 없으면 로드
        if ((role === 'FARMER' && !farmerInfo) || (role === 'DONATOR' && !donatorInfo)) {
          await loadUserData();
        }
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
  }, [farmerInfo, donatorInfo, loadUserData]);

  const handleLogout = () => {
    const { logout } = useAuthStore.getState();
    logout();
    
    // 커스텀 이벤트 발생 (같은 탭에서 로그인 상태 변경 알림)
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    
    // 메인 페이지로 리다이렉트
    window.location.href = '/';
  };

  // intro 페이지에서는 네브바를 표시하지 않음
  if (pathname === '/intro') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-2 py-3">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            마중
          </Link>

          <ul className="hidden gap-5 sm:flex">
            <li><Link href="/about" className="text-sm hover:opacity-70">소개</Link></li>
            <li><Link href="/support" className="text-sm hover:opacity-70">목장후원</Link></li>
            <li><Link href="/godonate" className="text-sm hover:opacity-70">바로기부</Link></li>
          </ul>
        </div>

        {/* Right: actions */}
        <div className="hidden sm:block">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/mypage"
                className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
              >
                {userName ? `${userName}님` : ''}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded border px-4 py-1 text-sm hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded border px-4 py-1 text-sm hover:bg-gray-50"
            >
              로그인
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden"
          aria-label="Open menu"
          onClick={() => setNavbarOpen(!isNavbarOpen)}
        >
          {/* 햄버거 아이콘 (간단히) */}
          <div className="h-0.5 w-6 bg-black mb-1.5" />
          <div className="h-0.5 w-6 bg-black mb-1.5" />
          <div className="h-0.5 w-6 bg-black" />
        </button>
      </nav>

      {/* Mobile drawer */}
      {isNavbarOpen && (
        <div className="sm:hidden border-t bg-white">
          <ul className="mx-4 my-2 flex flex-col gap-2 py-2">
            <li><Link href="/about" onClick={() => setNavbarOpen(false)}>소개</Link></li>
            <li><Link href="/support" onClick={() => setNavbarOpen(false)}>목장후원</Link></li>
            <li><Link href="/godonate" onClick={() => setNavbarOpen(false)}>바로기부</Link></li>
            <li className="pt-2">
              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/mypage"
                    className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
                    onClick={() => setNavbarOpen(false)}
                  >
                    {userName ? `${userName}님` : ''}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setNavbarOpen(false);
                    }}
                    className="inline-block rounded border px-4 py-1"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-block rounded border px-4 py-1"
                  onClick={() => setNavbarOpen(false)}
                >
                  로그인
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
