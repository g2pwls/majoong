'use client';

import React, { useState, useEffect } from 'react';
import { getAccountHistory } from '@/services/userService';
import type { AccountHistoryResponse } from '@/types/user';

interface AccountHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountHistoryModal({ isOpen, onClose }: AccountHistoryModalProps) {
  const [accountHistory, setAccountHistory] = useState<AccountHistoryResponse['result'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 계좌 내역 조회
  const fetchAccountHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('계좌 내역 조회 시작');
      
      const response = await getAccountHistory();
      
      if (response.isSuccess) {
        setAccountHistory(response.result);
        console.log('계좌 내역 조회 성공:', response.result);
      } else {
        setError(response.message || '계좌 내역을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('계좌 내역 조회 오류:', error);
      setError('계좌 내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 열릴 때 데이터 조회
  useEffect(() => {
    if (isOpen) {
      fetchAccountHistory();
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // 모달 열릴 때 스크롤 차단
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset'; // 모달 닫힐 때 스크롤 복원
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // 금액 포맷팅
  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0원';
    return new Intl.NumberFormat('ko-KR').format(numAmount) + '원';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 min-h-screen w-full"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">계좌 거래 내역</h2>
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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">계좌 내역을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">조회 실패</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchAccountHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : accountHistory ? (
            <div className="space-y-6">
              {/* 잔액 정보 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                <h3 className="text-sm font-medium text-green-800 mb-2">계좌 잔액</h3>
                <p className="text-3xl font-bold text-green-900">{formatAmount(accountHistory.balance)}</p>
              </div>

              {/* 거래 내역 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">거래 내역</h3>
                
                {accountHistory.transactions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">거래 내역이 없습니다</h4>
                    <p className="text-gray-600">아직 계좌 거래 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              거래일시
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              거래유형
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              금액
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              잔액
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              상세내용
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* 실제 거래 내역이 있을 때 표시할 예정 */}
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              거래 내역이 없습니다.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* 안내 메시지 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">계좌 거래 내역 안내</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• 후원금 정산 및 출금 내역을 확인할 수 있습니다.</li>
                      <li>• 거래 내역은 실시간으로 업데이트됩니다.</li>
                      <li>• 자세한 내역은 각 거래를 클릭하여 확인하세요.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
