'use client';

import React, { useEffect } from 'react';
import type { VaultHistoryDto } from '@/types/user';

interface FarmerDonationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationData: VaultHistoryDto | null;
  farmVaultAddress?: string;
}

export default function FarmerDonationDetailModal({ isOpen, onClose, donationData, farmVaultAddress }: FarmerDonationDetailModalProps) {
  
  const formatAmount = (donationToken: number) => {
    const amount = donationToken * 100; // 마론 1개 = 100원
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

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // 모달이 열릴 때 body 스크롤 제어
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 text-center">기부 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="모달 닫기"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {donationData ? (
            <div className="space-y-6">
              {/* 기부(DONATION) 유형 레이아웃 */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">기부일시</label>
                    <p className="text-gray-900">{formatDate(donationData.donationDate)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">기부자</label>
                    <p className="text-gray-900">
                      {donationData.donatorName || '익명의 후원자'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">기부 금액</label>
                    <p className="text-xl font-bold text-green-600">{formatAmount(donationData.donationToken)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">기부 코인</label>
                    <p className="text-gray-900">{formatCoin(donationData.donationToken)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">거래 유형</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      기부
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">현재 잔액</label>
                    <p className="text-gray-900">{formatAmount(donationData.balance / 100)}</p>
                  </div>
                </div>

                {farmVaultAddress && (
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">목장 금고 주소</label>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://sepolia.etherscan.io/token/0x7d961fee8b404296a45e141874feb1ca955ef816?a=${farmVaultAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-mono text-sm break-all flex-1 bg-gray-50 p-3 rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                      >
                        {farmVaultAddress}
                      </a>
                      <button
                        onClick={() => copyToClipboard(farmVaultAddress)}
                        className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                        title="복사"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      클릭하면 Etherscan에서 목장 금고를 확인할 수 있습니다
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">거래 해시</label>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${donationData.txHash}#eventlog`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 font-mono text-sm break-all flex-1 bg-gray-50 p-3 rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      {donationData.txHash}
                    </a>
                    <button
                      onClick={() => copyToClipboard(donationData.txHash)}
                      className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                      title="복사"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    클릭하면 Etherscan에서 블록체인 거래를 확인할 수 있습니다
                  </p>
                </div>
              </div>

              {/* 안내 메시지 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      기부 정보 안내
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>이 기부는 블록체인에 기록되었으며, MARON 토큰으로 지급되었습니다. (1 MARON = 100원)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">상세 정보가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">선택된 기부의 상세 정보를 찾을 수 없습니다.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
