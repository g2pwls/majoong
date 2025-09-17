'use client';

import React, { useState, useEffect } from 'react';

interface SupportRecord {
  id: string;
  farmName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  transactionHash?: string;
}

export default function DonorSupportHistory() {
  const [supportHistory, setSupportHistory] = useState<SupportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API에서 후원 내역을 가져와야 함
    // 현재는 임시 데이터 사용
    const mockData: SupportRecord[] = [
      {
        id: '1',
        farmName: '행복한 목장',
        amount: 100000,
        date: '2024-01-15',
        status: 'completed',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12'
      },
      {
        id: '2',
        farmName: '사랑의 농장',
        amount: 50000,
        date: '2024-01-10',
        status: 'completed',
        transactionHash: '0x1234567890abcdef1234567890abcdef12345678'
      },
      {
        id: '3',
        farmName: '희망의 목장',
        amount: 200000,
        date: '2024-01-05',
        status: 'pending'
      }
    ];
    
    setSupportHistory(mockData);
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
                  <h3 className="text-lg font-medium text-gray-900">{record.farmName}</h3>
                  <p className="text-sm text-gray-500">후원일: {formatDate(record.date)}</p>
                  {record.transactionHash && (
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      TX: {record.transactionHash.slice(0, 20)}...
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatAmount(record.amount)}</p>
                  <div className="mt-1">
                    {getStatusBadge(record.status)}
                  </div>
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
              <p>모든 후원은 블록체인에 기록되며, 투명하게 관리됩니다. 거래 해시를 통해 블록체인에서 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
