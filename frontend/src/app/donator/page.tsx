'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Star, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Users,
  Gift,
  BarChart3,
  Clock,
  CheckCircle
} from "lucide-react";
import { getDonatorInfo, getFavoriteFarms, getDonationHistory } from "@/services/userService";
import { isDonator } from "@/services/authService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  address: string;
  profileImage: string;
  totalScore: number;
  horseCount: number;
  monthTotalAmount: number;
  purposeTotalAmount: number;
}

interface DonationHistory {
  donationHistoryId: number;
  farmUuid: string;
  farmName: string;
  donationToken: number;
  donationDate: string;
  profileImage?: string;
}

export default function DonatorPage() {
  const router = useRouter();
  const [donatorInfo, setDonatorInfo] = useState<DonatorInfo | null>(null);
  const [favoriteFarms, setFavoriteFarms] = useState<FavoriteFarm[]>([]);
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 기부자 권한 확인
  useEffect(() => {
    if (!isDonator()) {
      router.push('/login');
      return;
    }
  }, [router]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [donatorResponse, favoritesResponse, donationsResponse] = await Promise.all([
          getDonatorInfo(),
          getFavoriteFarms(),
          getDonationHistory({ page: 0, size: 10 })
        ]);

        if (donatorResponse.isSuccess) {
          setDonatorInfo(donatorResponse.result);
        }

        if (favoritesResponse.isSuccess) {
          setFavoriteFarms(favoritesResponse.result);
        }

        if (donationsResponse.isSuccess) {
          setDonationHistory(donationsResponse.result.donationHistory.content);
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <p className="text-lg md:text-xl">
                이번 달에도 말들이 건강히 지내고 있어요!
            </p>
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
                    {formatCurrency(donationHistory.reduce((sum, donation) => sum + donation.donationToken, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 py-0">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">기부 횟수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {donationHistory.length}회
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
                  <p className="text-sm font-medium text-gray-600">즐겨찾기 목장</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {favoriteFarms.length}개
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 즐겨찾기 목장 섹션 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">즐겨찾기 목장</h2>
            <button
              onClick={() => window.location.href = '/mypage'}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteFarms
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 3)
                  .map((farm) => (
                  <Card key={farm.farmUuid} className="hover:shadow-lg transition-shadow py-0">
                    <CardContent className="p-0">
                      <div className="aspect-video relative">
                        <Image
                          src={farm.profileImage || "/horses/mal.png"}
                          alt={farm.farmName}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                        <div className="absolute top-3 right-3">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                            <span className="text-sm font-medium text-gray-700">
                              {farm.totalScore}점
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{farm.farmName}</h3>
                        <div className="space-y-2 text-sm text-gray-600">

                        </div>
                        <div className="mt-4">
                          <Link href={`/support/${farm.farmUuid}`}>
                            <Button className="w-full" variant="outline">
                              목장 상세보기
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
