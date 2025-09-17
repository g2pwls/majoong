'use client';

import React, { useState, useEffect } from 'react';

interface SupportRecord {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  transactionHash?: string;
  message?: string;
}

export default function FarmerSupportHistory() {
  const [supportHistory, setSupportHistory] = useState<SupportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalReceived, setTotalReceived] = useState(0);

  useEffect(() => {
    // TODO: 실제 API에서 농장주가 받은 후원 내역을 가져와야 함
    // 현재는 임시 데이터 사용
    const mockData: SupportRecord[] = [
      {
        id: '1',
        donorName: '김기부',
        amount: 100000,
        date: '2024-01-15',
        status: 'completed',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        message: '건강한 가축 키우시는 모습 응원합니다!'
      },
      {
        id: '2',
        donorName: '이후원',
        amount: 50000,
        date: '2024-01-10',
        status: 'completed',
        transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
        message: '지속가능한 농업 화이팅!'
      },
      {
        id: '3',
        donorName: '박사랑',
        amount: 200000,
        date: '2024-01-05',
        status: 'completed',
        transactionHash: '0x9876543210fedcba9876543210fedcba98765432',
        message: '좋은 일 하고 계시네요. 응원합니다!'
      },
      {
        id: '4',
        donorName: '최희망',
        amount: 75000,
        date: '2024-01-03',
        status: 'pending'
      }
    ];
    
    setSupportHistory(mockData);
    
    // 총 후원금 계산
    const total = mockData
      .filter(record => record.status === 'completed')
      .reduce((sum, record) => sum + record.amount, 0);
    setTotalReceived(total);
    
    setIsLoading(false);
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
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

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">후원 내역</h2>
      
      {/* 총 후원금 요약 */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">총 후원금</h3>
            <p className="text-3xl font-bold text-blue-600">{formatAmount(totalReceived)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">완료된 후원</p>
            <p className="text-2xl font-semibold text-gray-900">
              {supportHistory.filter(record => record.status === 'completed').length}건
            </p>
          </div>
        </div>
      </div>
      
      {supportHistory.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">후원 내역이 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">아직 받은 후원이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {supportHistory.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{record.donorName}님</h3>
                    {getStatusBadge(record.status)}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">후원일: {formatDate(record.date)}</p>
                  {record.message && (
                    <div className="bg-gray-50 p-3 rounded-md mb-2">
                      <p className="text-sm text-gray-700 italic">&ldquo;{record.message}&rdquo;</p>
                    </div>
                  )}
                  {record.transactionHash && (
                    <p className="text-xs text-gray-400 font-mono">
                      TX: {record.transactionHash.slice(0, 20)}...
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatAmount(record.amount)}</p>
                  {record.status === 'completed' && (
                    <p className="text-xs text-green-600 mt-1">✓ 지갑에 입금됨</p>
                  )}
                  {record.status === 'pending' && (
                    <p className="text-xs text-yellow-600 mt-1">⏳ 처리 대기중</p>
                  )}
                </div>
              </div>
            </div>
          ))}
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
              <p>모든 후원은 블록체인에 기록되며, 완료된 후원은 자동으로 지갑에 입금됩니다. 후원자분들의 따뜻한 메시지도 함께 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
