'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getFarmerDonationHistory } from '@/services/userService';
import type { FarmerDonationHistoryRequest, VaultHistoryDto } from '@/types/user';
import FarmerDonationDetailModal from './FarmerDonationDetailModal';
import AccountHistoryModal from './AccountHistoryModal';
import ReceiptDetailModal from './ReceiptDetailModal';

export default function FarmerSupportHistory() {
  const [donationHistory, setDonationHistory] = useState<VaultHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // 날짜 필터 관련 상태
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // 요약 정보 상태
  const [totalDonation, setTotalDonation] = useState(0);
  const [usedAmount, setUsedAmount] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [farmVaultAddress, setFarmVaultAddress] = useState<string>('');
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<VaultHistoryDto | null>(null);
  const [isAccountHistoryModalOpen, setIsAccountHistoryModalOpen] = useState(false);
  
  // 영수증 증빙 모달 관련 상태
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptData, setSelectedReceiptData] = useState<VaultHistoryDto | null>(null);

  const fetchDonationHistory = useCallback(async (
    page: number = 0, 
    isInitialLoad: boolean = false,
    filterStartDate?: string,
    filterEndDate?: string
  ) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsListLoading(true);
      }
      setError('');

      const params: FarmerDonationHistoryRequest = {
        page,
        size: pageSize,
      };

      // 매개변수로 전달된 날짜를 사용하거나, 없으면 현재 상태값 사용
      const searchStartDate = filterStartDate !== undefined ? filterStartDate : startDate;
      const searchEndDate = filterEndDate !== undefined ? filterEndDate : endDate;

      if (searchStartDate) params.startDate = searchStartDate;
      if (searchEndDate) params.endDate = searchEndDate;

      const response = await getFarmerDonationHistory(params);

      if (response.isSuccess) {
        const { result } = response;
        
        // 후원내역 데이터 설정 (최신순으로 정렬)
        const sortedContent = result.vaultHistoryResponseDtos.content.sort((a, b) => 
          new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime()
        );
        setDonationHistory(sortedContent);
        setTotalPages(result.vaultHistoryResponseDtos.totalPages);
        setTotalElements(result.vaultHistoryResponseDtos.totalElements);
        setCurrentPage(page);
        
        // 요약 정보 설정
        setTotalDonation(result.totalDonation);
        setUsedAmount(result.usedAmount);
        setCurrentBalance(result.currentBalance);
        setFarmVaultAddress(result.farmVaultAddress);
      } else {
        setError('후원내역을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('목장주 후원내역 조회 오류:', error);
      setError('후원내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsListLoading(false);
      }
    }
  }, [pageSize]); // startDate, endDate 의존성 제거

  useEffect(() => {
    // 컴포넌트 마운트 시에만 초기 데이터 로드
    fetchDonationHistory(0, true);
  }, [fetchDonationHistory]);

  const handleDateFilter = () => {
    fetchDonationHistory(0, false, startDate, endDate); // 리스트만 로딩, 현재 날짜 상태 전달
  };

  const handlePageChange = (page: number) => {
    fetchDonationHistory(page, false, startDate, endDate); // 리스트만 로딩, 현재 필터 유지
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    // 초기화 후 즉시 필터 적용 (빈 날짜로)
    fetchDonationHistory(0, false, '', '');
  };

  const handleDonationClick = (donation: VaultHistoryDto) => {
    if (donation.type === 'SETTLEMENT') {
      // 영수증 증빙인 경우 영수증 모달 열기
      handleOpenReceiptModal(donation);
    } else if (donation.type === 'DONATION') {
      // 기부 내역인 경우 기부 상세 모달 열기
      setSelectedDonation(donation);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDonation(null);
  };

  const handleOpenAccountHistory = () => {
    setIsAccountHistoryModalOpen(true);
  };

  const handleCloseAccountHistory = () => {
    setIsAccountHistoryModalOpen(false);
  };

  // 영수증 증빙 모달 핸들러
  const handleOpenReceiptModal = (receiptData: VaultHistoryDto) => {
    setSelectedReceiptData(receiptData);
    setIsReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedReceiptData(null);
  };

  const formatAmount = (donationToken: number) => {
    const amountKrw = donationToken * 100; // 1 MARON = 100 KRW
    return new Intl.NumberFormat('ko-KR').format(amountKrw) + '원';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };


  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DONATION':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">기부</span>;
      case 'SETTLEMENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">정산</span>;
      case 'WITHDRAWAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#D3CAB8', color: '#4D3A2C' }}>출금</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{type}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          {/* 요약 카드 스켈레톤 */}
          <div className="bg-gray-200 rounded-lg h-32 mb-6"></div>
          {/* 필터 스켈레톤 */}
          <div className="bg-gray-200 rounded h-12 mb-4"></div>
          {/* 리스트 스켈레톤 */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">후원내역</h2>
        <button
          onClick={handleOpenAccountHistory}
          className="px-4 py-2 text-white rounded-md transition-colors flex items-center space-x-2"
          style={{ backgroundColor: '#4D3A2C' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d2f24'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4D3A2C'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>계좌 내역 조회</span>
        </button>
      </div>
      
      {/* 요약 정보 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to right, #D3CAB8, #E8DCC6)' }}>
          <h3 className="text-sm font-medium mb-1" style={{ color: '#4D3A2C' }}>누적 후원금</h3>
          <p className="text-2xl font-bold" style={{ color: '#3D2F24' }}>{formatAmount(totalDonation / 100)}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">누적 정산 금액</h3>
          <p className="text-2xl font-bold text-yellow-900">{formatAmount(usedAmount / 100)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-1">현재 잔액</h3>
          <p className="text-2xl font-bold text-green-900">{formatAmount(currentBalance / 100)}</p>
        </div>
      </div>

      {/* 날짜 필터 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">시작일:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm flex-1 min-w-0"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">종료일:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm flex-1 min-w-0"
            />
          </div>
          <div className="flex gap-2 sm:flex-shrink-0">
            <button
              onClick={handleDateFilter}
              disabled={isListLoading}
              className="px-4 py-1 text-white rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
              style={{ backgroundColor: '#4D3A2C' }}
              onMouseEnter={(e) => {
                if (!isListLoading) {
                  e.currentTarget.style.backgroundColor = '#3d2f24';
                }
              }}
              onMouseLeave={(e) => {
                if (!isListLoading) {
                  e.currentTarget.style.backgroundColor = '#4D3A2C';
                }
              }}
            >
              {isListLoading ? '조회 중...' : '조회'}
            </button>
            <button
              onClick={clearDateFilter}
              className="px-4 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors flex-1 sm:flex-initial"
            >
              초기화
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 후원내역 리스트 */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isListLoading && (
          <div className="p-4 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" style={{ color: '#4D3A2C' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              조회 중...
            </div>
          </div>
        )}

        {donationHistory.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">후원내역이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              {startDate || endDate ? '해당 기간에 후원내역이 없습니다.' : '아직 후원내역이 없습니다.'}
            </p>
        </div>
      ) : (
          <div className="overflow-hidden">
            {donationHistory.map((record, index) => (
              <div 
                key={`${record.receiptHistoryId}-${index}`} 
                className={`border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 ${
                  record.type === 'DONATION' || record.type === 'SETTLEMENT' ? 'cursor-pointer transition-colors' : ''
                }`}
                onClick={() => handleDonationClick(record)}
              >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-medium text-gray-900">
                        {record.type === 'SETTLEMENT' 
                          ? (record.donatorName || '영수증 증빙')
                          : `${record.donatorName || '익명의 후원자'}님`
                        }
                      </h3>
                      {getTypeBadge(record.type)}
                  </div>
                    <p className="text-sm text-gray-500 mb-2">후원일시: {formatDate(record.donationDate)}</p>
                    <p className="text-xs text-gray-400 font-mono break-all">
                      TX: {record.txHash}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MARON: {record.donationToken.toLocaleString()} MARON
                    </p>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{formatAmount(record.donationToken)}</p>
                        <p className={`text-xs mt-1 ${record.type === 'SETTLEMENT' ? 'text-red-600' : 'text-green-600'}`}>
                          {record.type === 'SETTLEMENT' ? '✓ 계좌 출금' : '✓ 금고에 입금됨'}
                        </p>
                      </div>
                      {(record.type === 'DONATION' || record.type === 'SETTLEMENT') && (
                        <div style={{ color: '#4D3A2C', opacity: '0.7' }}>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || isListLoading}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || isListLoading}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                총 <span className="font-medium">{totalElements}</span>개 중{' '}
                <span className="font-medium">{currentPage * pageSize + 1}</span>-
                <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> 표시
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || isListLoading}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">이전</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    disabled={isListLoading}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed ${
                      currentPage === i
                        ? 'z-10 text-white'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    style={currentPage === i ? { backgroundColor: '#4D3A2C' } : {}}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || isListLoading}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">다음</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#D3CAB8' }}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" style={{ color: '#4D3A2C' }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium" style={{ color: '#4D3A2C' }}>
              후원내역 안내
            </h3>
            <div className="mt-2 text-sm" style={{ color: '#6B4E3D' }}>
              <p>모든 후원은 블록체인에 기록되며, MARON 토큰으로 후원금이 지급됩니다. (1 MARON = 1,000원)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 기부 상세 모달 */}
      <FarmerDonationDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        donationData={selectedDonation}
        farmVaultAddress={farmVaultAddress}
      />

      {/* 계좌 내역 조회 모달 */}
      <AccountHistoryModal
        isOpen={isAccountHistoryModalOpen}
        onClose={handleCloseAccountHistory}
      />

      {/* 영수증 증빙 상세 모달 */}
      <ReceiptDetailModal
        isOpen={isReceiptModalOpen}
        onClose={handleCloseReceiptModal}
        receiptData={selectedReceiptData}
        farmVaultAddress={farmVaultAddress}
      />
    </div>
  );
}
