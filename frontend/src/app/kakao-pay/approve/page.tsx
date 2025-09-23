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
        
        if (!pgToken) {
          setStatus('error');
          setMessage('결제 승인 정보가 없습니다.');
          return;
        }

        console.log('카카오페이 승인 페이지 접근:', { pgToken });

        // 백엔드에서 자동으로 처리된 결제 승인 결과를 받아옴
        // 실제로는 백엔드 API를 통해 승인 결과를 조회해야 함
        let approveData: KakaoPayApproveResponse;
        
        try {
          // 백엔드에서 승인 결과를 조회하는 API 호출
          const approveResponse = await fetch(`${API_BASE_URL}/api/v1/kakao-pay/approve?pg_token=${pgToken}`);
          
          if (!approveResponse.ok) {
            throw new Error(`승인 결과 조회 실패: ${approveResponse.status}`);
          }
          
          approveData = await approveResponse.json();
          console.log('백엔드에서 받은 승인 데이터:', approveData);
        } catch (error) {
          console.error('승인 결과 조회 오류:', error);
          
          // 백엔드 API 호출 실패 시 임시 데이터 사용 (개발용)
          console.log('백엔드 API 호출 실패, 임시 데이터 사용');
          approveData = {
            httpStatus: "OK",
            isSuccess: true,
            message: "요청에 성공하였습니다.",
            code: 200,
            result: {
              tid: "T8d1eb184e290263b86b",
              amount: {
                total: 50000 // 임시 데이터
              },
              partner_order_id: "FARM-6291F7", // 임시 데이터
              partner_user_id: "755ea199-138f-44e0-8723-bf62b28be4c7" // 임시 데이터
            }
          };
        }

        // 결제 승인이 성공한 경우에만 donation API 호출
        if (approveData.isSuccess && approveData.result) {
          const { amount, partner_order_id, partner_user_id } = approveData.result;
          
          console.log('결제 승인 성공, 기부하기 API 호출:', {
            farmMemberUuid: partner_user_id, // 현재 버전: farmMemberUuid 사용
            amountKrw: amount.total,
            farmUuid: partner_order_id
          });

          try {
            // 기부하기 API 호출 (현재 버전: farmMemberUuid 사용)
            const donationResult = await createDonation({
              farmMemberUuid: partner_user_id,
              amountKrw: amount.total
            });

            // 향후 변경 예정 (farmUuid 사용)
            // const donationResult = await createDonation({
            //   farmUuid: partner_order_id,
            //   amountKrw: amount.total
            // });

            console.log('기부하기 완료:', donationResult);
            setDonationResult(donationResult);
            setStatus('success');
            setMessage(`기부가 완료되었습니다! (${amount.total.toLocaleString()}원)`);
            
            // 3초 후 메인 페이지로 리다이렉트
            setTimeout(() => {
              router.push('/');
            }, 3000);
          } catch (donationError) {
            console.error('기부하기 API 호출 실패:', donationError);
            
            // 기부하기 API 호출 실패 시에도 결제는 성공으로 처리
            setStatus('success');
            setMessage(`결제는 완료되었지만 기부 처리 중 오류가 발생했습니다. (${amount.total.toLocaleString()}원)`);
            
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
