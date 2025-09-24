'use client';

import React, { useEffect } from 'react';
import type { VaultHistoryDto } from '@/types/user';

interface ReceiptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: VaultHistoryDto | null;
}

export default function ReceiptDetailModal({ 
  isOpen, 
  onClose, 
  receiptData 
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
          <h2 className="text-xl font-semibold text-gray-900">영수증 증빙 상세 정보</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      영수증 증빙 ID
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      #{receiptData.receiptHistoryId}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      거래 유형
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      정산
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사용 금액
                    </label>
                    <p className="text-2xl font-bold text-red-600">
                      {formatAmount(receiptData.donationToken)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MARON
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCoin(receiptData.donationToken)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사용일시
                    </label>
                    <p className="text-gray-900">
                      {formatDate(receiptData.donationDate)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      거래 후 잔액
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatAmount(receiptData.balance / 100)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상태
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ 계좌 출금 완료
                    </span>
                  </div>
                </div>
              </div>

              {/* 거래 해시 */}
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거래 해시 (Transaction Hash)
                </label>
                <div className="flex items-center space-x-2">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${receiptData.txHash}#eventlog`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 font-mono text-sm break-all flex-1 bg-gray-50 p-3 rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    {receiptData.txHash}
                  </a>
                  <button
                    onClick={() => copyToClipboard(receiptData.txHash)}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    복사
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  클릭하면 Etherscan에서 블록체인 거래를 확인할 수 있습니다
                </p>
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
