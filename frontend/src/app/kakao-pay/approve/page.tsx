"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getDonatorFarmHorses, addHorseToCollection, type PostDonationHorseInfo } from "@/services/postDonationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

function KakaoPayApproveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [horses, setHorses] = useState<PostDonationHorseInfo[]>([]);
  const [selectedHorse, setSelectedHorse] = useState<PostDonationHorseInfo | null>(null);
  const [farmUuid, setFarmUuid] = useState<string>('');
  const [showHorseSelection, setShowHorseSelection] = useState(false);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState<string>('');

  useEffect(() => {
    const handlePaymentApproval = async () => {
      try {
        // URL에서 pg_token 파라미터 확인
        const pgToken = searchParams.get('pg_token');
        
        console.log('카카오페이 승인 페이지 접근:', { 
          pgToken,
          allParams: Object.fromEntries(searchParams.entries())
        });
        
        if (!pgToken) {
          setStatus('error');
          setMessage('결제 승인 정보가 없습니다.');
          return;
        }

        // 백엔드에서 결제 승인과 기부를 모두 처리하므로
        // 프론트엔드에서는 성공 결과만 표시하면 됨
        console.log('결제 및 기부가 백엔드에서 처리됨');
        
        setStatus('success');
        setMessage('결제 및 기부가 성공적으로 완료되었습니다!');
        
        // 저장된 결제 정보에서 원래 페이지 URL과 farmUuid 가져오기
        const paymentInfoStr = sessionStorage.getItem('kakao_pay_info');
        if (paymentInfoStr) {
          try {
            const paymentInfo = JSON.parse(paymentInfoStr);
            if (paymentInfo.farmUuid) {
              setFarmUuid(paymentInfo.farmUuid);
              // 말 목록 조회
              try {
                const horseList = await getDonatorFarmHorses(paymentInfo.farmUuid);
                setHorses(horseList);
                setShowHorseSelection(true);
              } catch (error) {
                console.error('말 목록 조회 실패:', error);
              }
            }
          } catch (error) {
            console.error('결제 정보 파싱 오류:', error);
          }
        }
        
      } catch (error) {
        console.error('결제 승인 처리 오류:', error);
        setStatus('error');
        setMessage('결제 처리 중 오류가 발생했습니다.');
      }
    };

    handlePaymentApproval();
  }, [searchParams, router]);

  const handleHorseSelect = (horse: PostDonationHorseInfo) => {
    setSelectedHorse(horse);
  };

  const handleComplete = async (skipCollection: boolean = false) => {
    try {
      // 말을 선택했고 건너뛰기가 아닌 경우에만 컬렉션에 추가
      if (selectedHorse && !skipCollection) {
        setIsAddingToCollection(true);
        setCollectionMessage('말을 컬렉션에 추가하고 있습니다...');
        
        try {
          await addHorseToCollection(selectedHorse.horseNumber, farmUuid);
          setCollectionMessage('말이 컬렉션에 성공적으로 추가되었습니다!');
          
          // 성공 메시지를 잠시 표시
          setTimeout(() => {
            proceedToClose();
          }, 1500);
        } catch (error) {
          console.error('컬렉션 추가 실패:', error);
          setCollectionMessage('컬렉션 추가에 실패했습니다. 계속 진행합니다.');
          
          // 에러 메시지를 잠시 표시 후 계속 진행
          setTimeout(() => {
            proceedToClose();
          }, 2000);
        }
      } else {
        proceedToClose();
      }
    } catch (error) {
      console.error('완료 처리 중 오류:', error);
      proceedToClose();
    }
  };

  const proceedToClose = () => {
    setIsAddingToCollection(false);
    
    // 세션 스토리지 정리
    sessionStorage.removeItem('kakao_pay_info');
    
    // 부모 창으로 메시지 전송 후 창 닫기
    if (typeof window !== 'undefined') {
      if (window.opener) {
        window.opener.postMessage({
          type: 'PAYMENT_SUCCESS',
          selectedHorse: selectedHorse
        }, '*');
        window.close();
      } else {
        // 일반 창이라면 직접 리다이렉트
        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
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
            
            {showHorseSelection && horses.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  컬렉션에 추가할 말을 선택해주세요
                </h3>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto p-2">
                  {horses.map((horse, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all ${
                        selectedHorse?.horseNumber === horse.horseNumber 
                          ? 'border-2 border-blue-500 bg-blue-50' 
                          : 'hover:shadow-md border-2 border-transparent'
                      }`}
                      onClick={() => handleHorseSelect(horse)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={horse.profileImage || '/horses/default.jpg'}
                              alt={horse.horseName || '말'}
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-semibold text-gray-900">{horse.horseName}</h4>
                            <p className="text-sm text-gray-600">{horse.breed} • {horse.gender}</p>
                            <p className="text-xs text-gray-500">생년: {horse.birth}</p>
                          </div>
                          {selectedHorse?.horseNumber === horse.horseNumber && (
                            <div className="text-blue-500">✓</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {isAddingToCollection ? (
                  <div className="mt-6">
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">{collectionMessage}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 flex gap-3">
                    <Button
                      onClick={() => handleComplete(false)}
                      disabled={!selectedHorse}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      컬렉션에 추가하고 완료
                    </Button>
                    <Button
                      onClick={() => handleComplete(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      건너뛰기
                    </Button>
                  </div>
                )}
              </div>
            ) : showHorseSelection && horses.length === 0 ? (
              <div className="mt-6">
                <p className="text-gray-600 mb-4">이 농장에는 등록된 말이 없습니다.</p>
                <Button
                  onClick={() => handleComplete(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  완료
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <Button
                  onClick={() => handleComplete(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  완료
                </Button>
              </div>
            )}
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

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">로딩 중...</h2>
        <p className="text-gray-600">결제 정보를 확인하고 있습니다.</p>
      </div>
    </div>
  );
}

export default function KakaoPayApprovePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KakaoPayApproveContent />
    </Suspense>
  );
}