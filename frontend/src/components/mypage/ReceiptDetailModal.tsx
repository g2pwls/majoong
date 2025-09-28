'use client';

import React, { useEffect } from 'react';
import type { VaultHistoryDto } from '@/types/user';

interface ReceiptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: VaultHistoryDto | null;
  farmVaultAddress?: string;
}

export default function ReceiptDetailModal({ 
  isOpen, 
  onClose, 
  receiptData,
  farmVaultAddress 
}: ReceiptDetailModalProps) {

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
                <h2 className="text-xl font-semibold text-gray-900 text-center">영수증 증빙 상세 정보</h2>
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
          {receiptData ? (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      사용일시
                    </label>
                    <p className="text-gray-900">
                      {formatDate(receiptData.donationDate)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      영수증 증빙 ID
                    </label>
                    <p className="text-gray-900">
                      {receiptData.receiptHistoryId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      사용 금액
                    </label>
                    <p className="text-2xl font-bold text-red-600">
                      {formatAmount(receiptData.donationToken)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      사용 코인
                    </label>
                    <p className="text-gray-900">
                      {formatCoin(receiptData.donationToken)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      거래 유형
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      정산
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      현재 잔액
                    </label>
                    <p className="text-gray-900">
                      {formatAmount(receiptData.balance / 100)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 목장 금고 주소 */}
              {farmVaultAddress && (
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    목장 금고 주소
                  </label>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`https://sepolia.etherscan.io/token/0x7d961fee8b404296a45e141874feb1ca955ef816?a=${farmVaultAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 font-mono text-sm break-all flex-1 bg-gray-50 p-3 rounded border transition-colors cursor-pointer"
                      style={{ '--hover-bg': '#D3CAB8', '--hover-border': '#4D3A2C' } as React.CSSProperties}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#D3CAB8';
                        e.currentTarget.style.borderColor = '#4D3A2C';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                    >
                      {farmVaultAddress}
                    </a>
                    <button
                      onClick={() => copyToClipboard(farmVaultAddress)}
                      className="flex-shrink-0"
                      style={{ color: '#4D3A2C' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#3d2f24'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#4D3A2C'}
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

              {/* 거래 해시 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  거래 해시
                </label>
                <div className="flex items-center space-x-2">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${receiptData.txHash}#eventlog`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 font-mono text-sm break-all flex-1 bg-gray-50 p-3 rounded border transition-colors cursor-pointer"
                    style={{ '--hover-bg': '#D3CAB8', '--hover-border': '#4D3A2C' } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#D3CAB8';
                      e.currentTarget.style.borderColor = '#4D3A2C';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    {receiptData.txHash}
                  </a>
                  <button
                    onClick={() => copyToClipboard(receiptData.txHash)}
                    className="flex-shrink-0"
                    style={{ color: '#4D3A2C' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#3d2f24'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#4D3A2C'}
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

              {/* 안내 메시지 */}
              <div className="rounded-lg p-4" style={{ backgroundColor: '#D3CAB8', border: '1px solid #4D3A2C' }}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" style={{ color: '#4D3A2C' }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium" style={{ color: '#4D3A2C' }}>
                      거래 정보 안내
                    </h3>
                    <div className="mt-2 text-sm" style={{ color: '#6B4E3D' }}>
                      <p>이 거래는 블록체인에 기록되었으며, MARON 토큰으로 처리되었습니다. (1 MARON = 100원)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">영수증 증빙 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
