'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getDonationDetail } from '@/services/userService';
import type { DonationDetailResponse } from '@/types/user';

interface DonationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationHistoryId: number;
}

export default function DonationDetailModal({ isOpen, onClose, donationHistoryId }: DonationDetailModalProps) {
  const [donationDetail, setDonationDetail] = useState<DonationDetailResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonationDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: DonationDetailResponse = await getDonationDetail(donationHistoryId);
      
      if (response.isSuccess && response.result) {
        setDonationDetail(response.result);
      } else {
        setError('기부 상세 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('기부 상세 조회 오류:', error);
      setError('기부 상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [donationHistoryId]);

  useEffect(() => {
    if (isOpen && donationHistoryId) {
      fetchDonationDetail();
    }
  }, [isOpen, donationHistoryId, fetchDonationDetail]);

  const formatAmount = (donationToken: number) => {
    const amount = donationToken * 1000; // 마론 1개 = 1,000원
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatCoin = (donationToken: number) => {
    return new Intl.NumberFormat('ko-KR').format(donationToken) + ' MARON';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: 토스트 메시지 추가
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">기부 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">로딩 중...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">오류가 발생했습니다</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button 
                onClick={fetchDonationDetail}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : donationDetail ? (
            <div className="space-y-6">
              {/* 농장 이미지 */}
              {donationDetail.imageUrl && (
                <div className="text-center">
                  <Image
                    src={donationDetail.imageUrl}
                    alt={donationDetail.farmName}
                    width={192}
                    height={192}
                    className="mx-auto h-48 w-48 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">농장명</label>
                    <p className="text-lg font-semibold text-gray-900">{donationDetail.farmName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">기부일시</label>
                    <p className="text-gray-900">{formatDate(donationDetail.donationDate)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">기부 금액</label>
                    <p className="text-xl font-bold text-blue-600">{formatAmount(donationDetail.donationToken)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">기부 코인</label>
                    <p className="text-lg font-semibold text-green-600">{formatCoin(donationDetail.donationToken)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">기부자 지갑 주소</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                        {donationDetail.donatorWalletAddress}
                      </p>
                      <button
                        onClick={() => copyToClipboard(donationDetail.donatorWalletAddress)}
                        className="text-blue-600 hover:text-blue-800"
                        title="복사"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">농장 지갑 주소</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                        {donationDetail.farmWalletAddress}
                      </p>
                      <button
                        onClick={() => copyToClipboard(donationDetail.farmWalletAddress)}
                        className="text-blue-600 hover:text-blue-800"
                        title="복사"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">거래 해시</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                        {donationDetail.txHash}
                      </p>
                      <button
                        onClick={() => copyToClipboard(donationDetail.txHash)}
                        className="text-blue-600 hover:text-blue-800"
                        title="복사"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 상태 표시 */}
              <div className="text-center pt-4 border-t border-gray-200">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  기부 완료
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
