'use client';

import React, { useState, useEffect } from 'react';

interface ReportRecord {
  id: string;
  reporterName: string;
  reportedType: 'user' | 'farm' | 'content';
  reportedTarget: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

export default function AdminReportHistory() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // TODO: 실제 API에서 신고 내역을 가져와야 함
    // 현재는 임시 데이터 사용
    const mockData: ReportRecord[] = [
      {
        id: '1',
        reporterName: '김신고',
        reportedType: 'farm',
        reportedTarget: '행복한 목장',
        reason: '부적절한 내용',
        description: '농장 설명에 부적절한 내용이 포함되어 있습니다.',
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-15 10:30:00'
      },
      {
        id: '2',
        reporterName: '이제보',
        reportedType: 'user',
        reportedTarget: '박사용자',
        reason: '스팸/도배',
        description: '지속적으로 스팸성 댓글을 작성하고 있습니다.',
        status: 'investigating',
        priority: 'high',
        createdAt: '2024-01-14 15:20:00',
        updatedAt: '2024-01-15 09:15:00',
        adminNote: '관련 증거 수집 중'
      },
      {
        id: '3',
        reporterName: '최관심',
        reportedType: 'content',
        reportedTarget: '후원 댓글',
        reason: '욕설/비방',
        description: '다른 사용자에 대한 욕설이 포함된 댓글입니다.',
        status: 'resolved',
        priority: 'low',
        createdAt: '2024-01-13 14:45:00',
        updatedAt: '2024-01-14 11:30:00',
        adminNote: '해당 댓글 삭제 및 사용자 경고 조치 완료'
      }
    ];
    
    setReports(mockData);
    setIsLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">대기중</span>;
      case 'investigating':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">조사중</span>;
      case 'resolved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">해결됨</span>;
      case 'dismissed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">기각됨</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">긴급</span>;
      case 'high':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">높음</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">보통</span>;
      case 'low':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">낮음</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{priority}</span>;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'user':
        return '사용자';
      case 'farm':
        return '농장';
      case 'content':
        return '콘텐츠';
      default:
        return type;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('ko-KR');
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    setIsProcessing(true);
    // TODO: 실제 API 호출
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: newStatus as 'pending' | 'investigating' | 'resolved' | 'dismissed', updatedAt: new Date().toISOString() }
        : report
    ));
    setIsProcessing(false);
  };

  const handleAddNote = async (reportId: string) => {
    if (!adminNote.trim()) return;
    
    setIsProcessing(true);
    // TODO: 실제 API 호출
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, adminNote, updatedAt: new Date().toISOString() }
        : report
    ));
    setAdminNote('');
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">신고 내역</h2>
      
      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-yellow-600">대기중</p>
            <p className="text-2xl font-bold text-yellow-900">
              {reports.filter(r => r.status === 'pending').length}
            </p>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-blue-600">조사중</p>
            <p className="text-2xl font-bold text-blue-900">
              {reports.filter(r => r.status === 'investigating').length}
            </p>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-green-600">해결됨</p>
            <p className="text-2xl font-bold text-green-900">
              {reports.filter(r => r.status === 'resolved').length}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">기각됨</p>
            <p className="text-2xl font-bold text-gray-900">
              {reports.filter(r => r.status === 'dismissed').length}
            </p>
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">신고 내역이 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">처리할 신고가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getReportTypeLabel(report.reportedType)} 신고
                    </h3>
                    {getStatusBadge(report.status)}
                    {getPriorityBadge(report.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    신고자: {report.reporterName} | 대상: {report.reportedTarget}
                  </p>
                  <p className="text-sm text-gray-500">
                    신고일: {formatDateTime(report.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">신고 사유: {report.reason}</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {report.description}
                </p>
              </div>

              {report.adminNote && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">관리자 메모:</p>
                  <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                    {report.adminNote}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                {report.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(report.id, 'investigating')}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      조사 시작
                    </button>
                    <button
                      onClick={() => handleStatusChange(report.id, 'dismissed')}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                      기각
                    </button>
                  </>
                )}
                {report.status === 'investigating' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(report.id, 'resolved')}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      해결 완료
                    </button>
                    <button
                      onClick={() => handleStatusChange(report.id, 'dismissed')}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                      기각
                    </button>
                  </>
                )}
                <div className="flex-1"></div>
                <span className="text-xs text-gray-500">
                  마지막 수정: {formatDateTime(report.updatedAt)}
                </span>
              </div>

              {/* 관리자 메모 추가 */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="관리자 메모를 입력하세요..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleAddNote(report.id)}
                    disabled={isProcessing || !adminNote.trim()}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    메모 추가
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-red-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              신고 처리 안내
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>신고 처리는 신중하게 진행해주세요. 모든 조치 사항은 기록되며, 사용자에게 영향을 줄 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
