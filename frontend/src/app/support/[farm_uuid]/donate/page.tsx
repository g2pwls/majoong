"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFarmDetail, FarmDetail } from "@/services/apiService";
import { startKakaoPay } from "@/services/paymentService";
import { getTokens } from "@/services/authService";
import DonationSection from "@/components/donation/DonationSection";
import Breadcrumbs from "@/components/common/Breadcrumb";
import LoginRequiredModal from "@/components/donation/LoginRequiredModal";
import Image from "next/image";

// FarmData 인터페이스는 apiService의 Farm 인터페이스를 사용


export default function DonatePage() {
  const params = useParams();
  const router = useRouter();
  const farm_uuid = params.farm_uuid as string;
  
  const [farmDetail, setFarmDetail] = useState<FarmDetail | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAmountWarning, setShowAmountWarning] = useState(false);
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'kakao'>('kakao');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchFarmDetail = async () => {
      try {
        const data = await getFarmDetail(farm_uuid);
        setFarmDetail(data);
      } catch (error) {
        console.error("농장 정보를 가져오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (farm_uuid) {
      fetchFarmDetail();
    }
  }, [farm_uuid]);

  // 카카오페이 결제 완료 후 메시지 리스너
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        console.log('결제 완료 메시지 수신:', event.data);
        
        if (event.data.selectedHorse) {
          console.log('선택된 말이 컬렉션에 추가되었습니다:', event.data.selectedHorse);
          // 선택된 말은 이미 카카오페이 승인 페이지에서 컬렉션에 추가되었음
        }
        
        // 리다이렉트 URL이 있으면 해당 페이지로 이동, 없으면 새로고침
        if (event.data.redirectTo) {
          window.location.href = event.data.redirectTo;
        } else {
          window.location.reload();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showConfirmModal) {
        setShowConfirmModal(false);
      }
    };

    if (showConfirmModal) {
      document.addEventListener('keydown', handleEscape);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showConfirmModal]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    setShowAmountWarning(false);
    setIsCustomInputActive(false);
  };

  const handleCustomAmountChange = (value: string) => {
    // 입력창에는 사용자가 친 그대로 보여주기
    setCustomAmount(value);

    // 콤마 제거 후 숫자 변환
    const numValue = parseInt(value.replace(/,/g, ""), 10);

    if (!isNaN(numValue)) {
      // 100 단위로 자동 내림
      const rounded = Math.floor(numValue / 100) * 100;
      setSelectedAmount(rounded);
      
      // 100원 단위로 딱 떨어지지 않는 경우 경고 표시
      setShowAmountWarning(numValue > 0 && numValue !== rounded);
    } else {
      setSelectedAmount(0);
      setShowAmountWarning(false);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  const handleCustomInputClick = () => {
    setIsCustomInputActive(true);
    setSelectedAmount(0);
    setCustomAmount("");
    setShowAmountWarning(false);
  };

  const handleCustomInputBlur = () => {
    // 입력이 완료되면 버튼 모드로 돌아감
    if (customAmount === "") {
      setIsCustomInputActive(false);
    }
  };

  const handleCustomInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsCustomInputActive(false);
    }
    if (e.key === 'Escape') {
      setCustomAmount("");
      setIsCustomInputActive(false);
      setShowAmountWarning(false);
    }
  };


  const handlePaymentMethodChange = (method: 'kakao') => {
    setPaymentMethod(method);
  };

  const handleDonateClick = () => {
    // 로그인 상태 확인
    const tokens = getTokens();
    if (!tokens.accessToken) {
      setShowLoginModal(true);
      return;
    }

    if (selectedAmount > 0) {
      setShowConfirmPopup(true);
    } else {
      alert('후원 금액을 선택해주세요.');
    }
  };

  const handleConfirmDonation = async () => {
    try {
      setShowConfirmPopup(false);
      
      if (!farmDetail || selectedAmount <= 0) {
        alert('기부 정보가 올바르지 않습니다.');
        return;
      }

      // 카카오페이 결제 시작 API 호출
      await startKakaoPay({
        totalPrice: selectedAmount.toString(),
        farmUuid: farmDetail.farmUuid
      });

      console.log('카카오페이 결제 시작:', { 
        farmName: farmDetail.farmName, 
        amount: selectedAmount,
        farmUuid: farmDetail.farmUuid 
      });
    } catch (error) {
      console.error('카카오페이 결제 시작 오류:', error);
      alert('결제 시작에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 미사용 함수들 제거됨 - 현재 handleConfirmDonation으로 대체됨

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderBottomColor: '#4D3A2C' }}></div>
          <div className="text-lg text-gray-600">목장 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!farmDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">농장 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div>
      {/* 메인 컨텐츠 */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-15">
        {/* 브레드크럼 */}
        <div className="pt-4 pb-3">
          <Breadcrumbs items={[
            { label: '목장후원', href: '/support' },
            { label: farmDetail?.farmName || '농장', href: `/support/${farm_uuid}` },
            { label: '기부하기' }
          ]} />
        </div>

        <div className="mb-6 flex flex-row">
          <div className="flex items-center mb-4 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">기부하기</h1>
            <div className="w-29 h-0.5 bg-gray-300"></div>
          </div>
        </div>
              
         {/* 목장 정보와 후원 정보 섹션 */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* 목장 정보 섹션 */}
           <div className="space-y-6">
             {/* 목장 정보 헤더 */}
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-semibold text-gray-900">목장 정보</h2>
             </div>

             {/* 목장 사진 카드 */}
             <div className="relative mx-4">
               <div 
                 className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                 onClick={() => router.push(`/support/${farmDetail.farmUuid}`)}
               >
                 <Image
                   src={farmDetail.profileImage}
                   alt={farmDetail.farmName}
                   fill
                   className="object-cover transition-transform duration-300 hover:scale-105"
                   sizes="(max-width: 768px) 100vw, 50vw"
                 />
                 {/* 신뢰도 점수 오버레이 - 왼쪽 상단 */}
                 <div className="absolute top-4 left-4 bg-black/70 text-yellow-400 px-3 py-2 rounded-full text-sm font-semibold">
                   {farmDetail.totalScore.toFixed(1)}℃
                 </div>
                 {/* 목장명 오버레이 - 왼쪽 하단 */}
                 <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-lg font-semibold">
                   {farmDetail.farmName}
                 </div>
               </div>
             </div>

             {/* 목장 설명 카드 - 바로기부 페이지 스타일 */}
             <div className="mt-[-1rem] mx-4 p-4 bg-white/95 rounded-lg shadow-lg min-h-[6rem]">
               {/* 주소 */}
               <div className="flex items-start gap-2 mb-3">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="#666" className="mt-0.5 flex-shrink-0">
                   <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                 </svg>
                 <span className="text-gray-600 text-sm">{farmDetail.address}</span>
               </div>
               
               {/* 목장 설명 */}
               {farmDetail.description && (
                 <div className="text-gray-700 text-sm leading-relaxed">
                   {farmDetail.description}
                 </div>
               )}
             </div>
           </div>

          {/* 후원 정보 섹션 */}
          <DonationSection
            selectedAmount={selectedAmount}
            customAmount={customAmount}
            showAmountWarning={showAmountWarning}
            isCustomInputActive={isCustomInputActive}
            paymentMethod={paymentMethod}
            showConfirmPopup={showConfirmPopup}
            selectedFarm={{
              id: farmDetail.farmUuid,
              farm_name: farmDetail.farmName,
              farmName: farmDetail.farmName,
              total_score: farmDetail.totalScore,
              totalScore: farmDetail.totalScore,
              image_url: farmDetail.profileImage,
              profileImage: farmDetail.profileImage,
              address: farmDetail.address,
              farmUuid: farmDetail.farmUuid
            }}
            onAmountSelect={handleAmountSelect}
            onCustomAmountChange={handleCustomAmountChange}
            onCustomInputClick={handleCustomInputClick}
            onCustomInputBlur={handleCustomInputBlur}
            onCustomInputKeyDown={handleCustomInputKeyDown}
            onPaymentMethodChange={handlePaymentMethodChange}
            onDonateClick={handleDonateClick}
            onConfirmDonation={handleConfirmDonation}
            onCloseConfirmPopup={() => setShowConfirmPopup(false)}
            formatAmount={formatAmount}
                />
              </div>
            </div>

      {/* 로그인 필요 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                로그인이 필요합니다
              </h3>
              <p className="text-gray-600 mb-6">
                로그인하여 목장에 기부해보세요.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push('/login');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  로그인하기
                </button>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* 로그인 필요 모달 */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
