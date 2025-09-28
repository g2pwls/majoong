'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Star, 
  Calendar, 
  Gift,
  FileText
} from "lucide-react";
import { getDonatorInfo, getFavoriteFarms, getDonationHistory } from "@/services/userService";
import { isDonator } from "@/services/authService";
import { FarmService } from "@/services/farmService";
import { MonthlyReport } from "@/types/farm";
import { getCollection } from "@/services/collectionService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DonorCollection from "@/components/mypage/DonorCollection";

interface DonatorInfo {
  role: string;
  nameString: string;
  email: string;
  walletAddress: string;
  profileImage?: string;
}

interface FavoriteFarm {
  farmUuid: string;
  farmName: string;
  imageUrl: string;
}


interface FarmNewsletter {
  farmUuid: string;
  farmName: string;
  imageUrl: string;
  latestReport: MonthlyReport | null;
}

export default function DonatorPage() {
  const router = useRouter();
  const [donatorInfo, setDonatorInfo] = useState<DonatorInfo | null>(null);
  const [favoriteFarms, setFavoriteFarms] = useState<FavoriteFarm[]>([]);
  const [farmNewsletters, setFarmNewsletters] = useState<FarmNewsletter[]>([]);
  const [collectionCount, setCollectionCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDonationCount, setTotalDonationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 기부자 권한 확인
  useEffect(() => {
    if (!isDonator()) {
      router.push('/login');
      return;
    }
  }, [router]);

  // 즐겨찾기 목장의 최신 월간 소식지 조회 (랜덤으로 선택된 3개만)
  const fetchFarmNewsletters = async (farms: FavoriteFarm[]) => {
    const newsletters: FarmNewsletter[] = [];
    
    // 위에서 랜덤으로 선택된 3개 목장과 동일하게 처리
    const randomFarms = farms
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    for (const farm of randomFarms) {
      try {
        const currentYear = new Date().getFullYear();
        const response = await FarmService.getMonthlyReports(farm.farmUuid, currentYear);
        
        if (response.isSuccess && response.result && response.result.length > 0) {
          // 최신 월간 보고서 찾기 (년도 내림차순, 월 내림차순)
          const latestReport = response.result.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          })[0];
          
          newsletters.push({
            farmUuid: farm.farmUuid,
            farmName: farm.farmName,
            imageUrl: farm.imageUrl,
            latestReport: latestReport
          });
        } else {
          // 월간 보고서가 없는 경우
          newsletters.push({
            farmUuid: farm.farmUuid,
            farmName: farm.farmName,
            imageUrl: farm.imageUrl,
            latestReport: null
          });
        }
      } catch (error) {
        console.warn(`${farm.farmName} 월간 보고서 조회 실패:`, error);
        // 에러가 발생해도 기본 정보는 추가
        newsletters.push({
          farmUuid: farm.farmUuid,
          farmName: farm.farmName,
          imageUrl: farm.imageUrl,
          latestReport: null
        });
      }
    }
    
    return newsletters;
  };

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [donatorResponse, favoritesResponse, donationsResponse, collectionsResponse] = await Promise.all([
          getDonatorInfo(),
          getFavoriteFarms(),
          getDonationHistory({ page: 0, size: 10 }),
          getCollection()
        ]);

        if (donatorResponse.isSuccess) {
          setDonatorInfo(donatorResponse.result);
        }

        if (favoritesResponse.isSuccess) {
          setFavoriteFarms(favoritesResponse.result);
          
          // 즐겨찾기 목장의 최신 월간 소식지 조회
          const newsletters = await fetchFarmNewsletters(favoritesResponse.result);
          setFarmNewsletters(newsletters);
        }

        if (donationsResponse.isSuccess) {
          setTotalAmount(donationsResponse.result.totalAmount || 0);
          setTotalDonationCount(donationsResponse.result.donationHistory.totalElements || 0);
        }

        // 컬렉션 총 카드 수 계산
        const totalCards = collectionsResponse.reduce((sum, item) => sum + item.cardCount, 0);
        setCollectionCount(totalCards);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatTotalAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: '#4D3A2C' }}></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
        <div className="relative h-64 md:h-110 overflow-hidden">
          <Image
            src="/farm.jpg"
            alt="목장 이미지"
            fill
            className="object-cover"
            priority
          />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-end pr-16 md:pr-60">
          <div className="text-right text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              어서오세요 {donatorInfo?.nameString} 님
            </h1>
            <p className="text-lg md:text-xl mb-10">
                이번 달 퇴역마들의 근황도 살펴보세요!
            </p>
            <div className="flex gap-4 justify-end">
              <Link href="/support">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 text-lg font-semibold">
                  목장 둘러보기
                </Button>
              </Link>
              <Link href="/godonate">
                <Button 
                  className="text-white px-6 py-3 text-lg font-semibold transition-colors"
                  style={{ backgroundColor: '#4D3A2C' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d2f24'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4D3A2C'}
                >
                  바로 기부하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 py-0">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 기부금액</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTotalAmount(totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 py-0">
              <div className="flex items-center">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#D3CAB8' }}>
                  <Gift className="h-6 w-6" style={{ color: '#4D3A2C' }} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">기부 횟수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalDonationCount}회
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 py-0">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">컬렉션</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {collectionCount}장
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 즐겨찾기 목장과 최신 소식 가로 배치 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-5">
          {/* 즐겨찾기 목장 섹션 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">즐겨찾는 목장</h2>
              <button
                onClick={() => window.location.href = '/mypage'}
                className="text-sm font-medium transition-colors"
                style={{ color: '#4D3A2C' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#3d2f24'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#4D3A2C'}
              >
                보러가기 →
              </button>
            </div>
            
            <div className="space-y-4">
              {favoriteFarms.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">즐겨찾기한 목장이 없습니다</p>
                    <Link href="/support">
                      <Button>목장 둘러보기</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {favoriteFarms
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map((farm) => (
                    <Link key={farm.farmUuid} href={`/support/${farm.farmUuid}`}>
                      <Card 
                        className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 py-0 mt-2"
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4D3A2C'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                      >
                        <CardContent className="p-0">
                            <div className="flex">
                              <div className="w-40 h-32 relative flex-shrink-0">
                                {farm.imageUrl && farm.imageUrl.trim() !== '' ? (
                                  <Image
                                    src={farm.imageUrl}
                                    alt={farm.farmName}
                                    fill
                                    className="object-cover rounded-l-lg"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-l-lg">
                                    <span className="text-gray-500 text-sm">이미지 없음</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-5 flex-1">
                                <h3 className="font-semibold text-xl mb-3">{farm.farmName}</h3>
                                <Button className="w-full" variant="outline">
                                  {farm.farmName} 보러가기
                                </Button>
                              </div>
                            </div>
                        </CardContent>
                      </Card>
                    </Link>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* 즐겨찾는 목장의 최신 소식지 섹션 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">즐겨찾는 목장의 최근 소식</h2>
            </div>
            
            <div className="space-y-4">
              {farmNewsletters.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">즐겨찾기한 목장이 없습니다</p>
                    <Link href="/support">
                      <Button>목장 둘러보기</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {farmNewsletters
                    .filter(newsletter => newsletter.latestReport !== null)
                    .slice(0, 3)
                    .map((newsletter) => (
                      <Link key={newsletter.farmUuid} href={`/support/${newsletter.farmUuid}/report/${newsletter.latestReport?.reportId}`}>
                        <Card 
                          className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 py-0 mt-2"
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4D3A2C'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                        >
                          <CardContent className="p-0">
                            <div className="flex">
                              <div className="w-40 h-32 relative flex-shrink-0">
                                {newsletter.latestReport?.thumbnail ? (
                                  <Image
                                    src={newsletter.latestReport.thumbnail}
                                    alt={`${newsletter.farmName} ${newsletter.latestReport.year}년 ${newsletter.latestReport.month}월 소식지`}
                                    fill
                                    className="object-cover rounded-l-lg"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-l-lg">
                                    <span className="text-gray-500 text-sm">이미지 없음</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-5 flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-semibold text-xl">{newsletter.farmName}</h3>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {newsletter.latestReport?.year}년 {newsletter.latestReport?.month}월
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 내 컬렉션 섹션 */}
        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900">내 컬렉션</h2>
            <button
              onClick={() => window.location.href = '/mypage'}
              className="text-sm font-medium transition-colors"
              style={{ color: '#4D3A2C' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#3d2f24'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4D3A2C'}
            >
              전체 보기 →
            </button>
          </div>
          
          <DonorCollection />
        </div>
      </div>
    </div>
  );
}

