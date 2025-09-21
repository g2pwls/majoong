'use client';

import React, { useState, useEffect } from 'react';
import { getDonationHistory } from '@/services/userService';
import type { DonationHistoryRequest, DonationHistoryResponse } from '@/types/user';

interface SupportRecord {
  id: string;
  farmName: string;
  farmUuid: string;
  amount: number;
  coin: number;
  donationDate: string;
  status: string;
  message?: string;
}

export default function DonorSupportHistory() {
  const [supportHistory, setSupportHistory] = useState<SupportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCoin, setTotalCoin] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  
  // 날짜 필터 상태
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // 리스트 영역 로딩 상태 (전체 컴포넌트와 분리)
  const [isListLoading, setIsListLoading] = useState(false);

  const fetchDonationHistory = async (page: number = 0, isInitialLoad: boolean = false) => {
    try {
      // 초기 로드는 전체 로딩, 그 외에는 리스트만 로딩
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsListLoading(true);
      }
      setError(null);
      
      const params: DonationHistoryRequest = {
        page,
        size: pageSize,
      };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response: DonationHistoryResponse = await getDonationHistory(params);
      
      if (response.isSuccess && response.result) {
        setSupportHistory(response.result.donationHistory.content);
        setTotalCoin(response.result.totalCoin);
        setTotalAmount(response.result.totalAmount);
        setTotalPages(response.result.donationHistory.totalPages);
        setTotalElements(response.result.donationHistory.totalElements);
        setCurrentPage(page);
      } else {
        setError('기부내역을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('기부내역 조회 오류:', error);
      setError('기부내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsListLoading(false);
      }
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시에만 초기 데이터 로드
    fetchDonationHistory(0, true);
  }, []); // 의존성 배열을 빈 배열로 변경

  const handleDateFilter = () => {
    fetchDonationHistory(0, false); // 리스트만 로딩
  };

  const handlePageChange = (page: number) => {
    fetchDonationHistory(page, false); // 리스트만 로딩
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">완료</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">대기중</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">취소</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatCoin = (coin: number) => {
    return new Intl.NumberFormat('ko-KR').format(coin) + ' 코인';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const handleVisitFarm = (farmUuid: string) => {
    window.open(`/support/${farmUuid}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">오류가 발생했습니다</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button 
            onClick={() => fetchDonationHistory(currentPage)} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">후원 내역</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>총 기부금: <strong>{formatAmount(totalAmount)}</strong></span>
          <span>총 코인: <strong>{formatCoin(totalCoin)}</strong></span>
        </div>
      </div>

      {/* 날짜 필터 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">시작일:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">종료일:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <button
            onClick={handleDateFilter}
            className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            조회
          </button>
          <button
            onClick={clearDateFilter}
            className="px-4 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>
      
      {/* 리스트 영역 로딩 인디케이터 */}
      {isListLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      )}

      {/* 리스트 컨텐츠 */}
      {!isListLoading && (
        <>
          {supportHistory.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">후원 내역이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">아직 후원한 농장이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supportHistory.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{record.farmName}</h3>
                        <button
                          onClick={() => handleVisitFarm(record.farmUuid)}
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          농장 보기
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">후원일: {formatDate(record.donationDate)}</p>
                      {record.message && (
                        <p className="text-sm text-gray-600 mt-1">{record.message}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatAmount(record.amount)}</p>
                      <p className="text-sm text-blue-600">{formatCoin(record.coin)}</p>
                      <div className="mt-1">
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              첫 페이지
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            {/* 페이지 번호들 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium border rounded-md ${
                    currentPage === pageNum
                      ? 'text-blue-600 bg-blue-50 border-blue-300'
                      : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              마지막 페이지
            </button>
          </nav>
        </div>
      )}

      {/* 페이지 정보 */}
      {totalElements > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {totalElements}개 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}개 표시
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              후원 내역 안내
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>모든 후원은 블록체인에 기록되며, 투명하게 관리됩니다. 거래 해시를 통해 블록체인에서 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
