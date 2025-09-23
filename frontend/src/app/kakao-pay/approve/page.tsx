"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createDonation } from "@/services/paymentService";
import { KakaoPayApproveResponse } from "@/types/payment";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function KakaoPayApprovePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [donationResult, setDonationResult] = useState<any>(null);

  useEffect(() => {
    const handlePaymentApproval = async () => {
      try {
        // URL에서 pg_token 파라미터 확인
        const pgToken = searchParams.get('pg_token');
        
        // 세션 스토리지에서 결제 정보 가져오기 (Fallback용)
        let paymentInfo = null;
        try {
          const storedInfo = sessionStorage.getItem('kakao_pay_info');
          if (storedInfo) {
            paymentInfo = JSON.parse(storedInfo);
            // 10분 이내의 정보만 유효
            if (Date.now() - paymentInfo.timestamp > 10 * 60 * 1000) {
              paymentInfo = null;
              sessionStorage.removeItem('kakao_pay_info');
            }
          }
        } catch (error) {
          console.error('세션 스토리지에서 결제 정보 읽기 실패:', error);
        }
        
        console.log('카카오페이 승인 페이지 접근:', { 
          pgToken,
          paymentInfo,
          allParams: Object.fromEntries(searchParams.entries())
        });
        
        if (!pgToken) {
          setStatus('error');
          setMessage('결제 승인 정보가 없습니다.');
          return;
        }

        // 백엔드에서 자동으로 처리된 결제 승인 결과를 받아옴
        let approveData: KakaoPayApproveResponse;
        
        try {
          // 백엔드에서 승인 결과를 조회하는 API 호출
          console.log('백엔드 승인 결과 조회 시작:', `${API_BASE_URL}/api/v1/kakao-pay/approve?pg_token=${pgToken}`);
          
          const approveResponse = await fetch(`${API_BASE_URL}/api/v1/kakao-pay/approve?pg_token=${pgToken}`);
          
          console.log('백엔드 응답 상태:', approveResponse.status, approveResponse.statusText);
          
          if (!approveResponse.ok) {
            const errorText = await approveResponse.text();
            console.error('백엔드 에러 응답:', errorText);
            throw new Error(`승인 결과 조회 실패: ${approveResponse.status} - ${errorText}`);
          }
          
          approveData = await approveResponse.json();
          console.log('백엔드에서 받은 승인 데이터:', approveData);
        } catch (error) {
          console.error('승인 결과 조회 오류:', error);
          
          // 백엔드 API 호출 실패 시 세션 스토리지에서 받은 데이터 사용 (Fallback)
          console.log('백엔드 API 호출 실패, 세션 스토리지 데이터 사용');
          
          if (!paymentInfo) {
            setStatus('error');
            setMessage('결제 정보를 찾을 수 없습니다. 다시 시도해주세요.');
            return;
          }
          
          approveData = {
            httpStatus: "OK",
            isSuccess: true,
            message: "요청에 성공하였습니다.",
            code: 200,
            result: {
              tid: paymentInfo.tid || `TEMP-${Date.now()}`, // 저장된 TID 또는 임시 TID
              amount: {
                total: paymentInfo.amount // 세션에서 받은 실제 금액
              },
              partner_order_id: paymentInfo.farmUuid, // 세션에서 받은 실제 farmUuid
              partner_user_id: "temp-user-id" // 임시 사용자 ID
            }
          };
          
          console.log('세션 스토리지로 생성된 승인 데이터:', approveData);
        }

        // 결제 승인이 성공한 경우에만 donation API 호출
        if (approveData.isSuccess && approveData.result) {
          const { amount, partner_order_id, partner_user_id } = approveData.result;
          
          console.log('결제 승인 성공, 기부하기 API 호출:', {
            farmUuid: partner_order_id, // 현재 버전: farmUuid 사용
            amountKrw: amount.total,
            partner_user_id: partner_user_id
          });

          try {
            // 기부하기 API 호출 (현재 버전: farmUuid 사용)
            const donationResult = await createDonation({
              farmUuid: partner_order_id,
              amountKrw: amount.total
            });
            
            console.log('기부하기 완료:', donationResult);
            setDonationResult(donationResult);
            setStatus('success');
            setMessage(`기부가 완료되었습니다! (${amount.total.toLocaleString()}원)`);
            
            // 세션 스토리지 정리
            sessionStorage.removeItem('kakao_pay_info');
            
            // 3초 후 메인 페이지로 리다이렉트
            setTimeout(() => {
              router.push('/');
            }, 3000);
          } catch (donationError) {
            console.error('기부하기 API 호출 실패:', donationError);
            
            // 기부하기 API 호출 실패 시에도 결제는 성공으로 처리
            setStatus('success');
            setMessage(`결제는 완료되었지만 기부 처리 중 오류가 발생했습니다. (${amount.total.toLocaleString()}원)`);
            
            // 세션 스토리지 정리
            sessionStorage.removeItem('kakao_pay_info');
            
            // 3초 후 메인 페이지로 리다이렉트
            setTimeout(() => {
              router.push('/');
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage('결제 승인에 실패했습니다.');
        }
      } catch (error) {
        console.error('결제 승인 처리 오류:', error);
        setStatus('error');
        setMessage('결제 처리 중 오류가 발생했습니다.');
      }
    };

    handlePaymentApproval();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">결제 처리 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">기부 완료!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {donationResult && (
              <div className="bg-gray-50 p-4 rounded-lg text-left text-sm">
                <p><strong>트랜잭션 해시:</strong></p>
                <p className="text-xs text-gray-500 break-all">{donationResult.result?.txHash}</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">3초 후 메인 페이지로 이동합니다.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">처리 실패</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              메인 페이지로 이동
            </button>
          </>
        )}
      </div>
    </div>
  );
}
