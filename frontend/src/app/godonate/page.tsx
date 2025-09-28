"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { startKakaoPay } from "@/services/paymentService";
import { getRecommendFarms, RecommendFarm } from "@/services/apiService";
import DonationSection from "@/components/donation/DonationSection";
import FarmSlider from "@/components/ui/FarmSlider";
import Breadcrumbs from "@/components/common/Breadcrumb";
import LoginRequiredModal from "@/components/donation/LoginRequiredModal";
import Toast from "@/components/ui/Toast";
import { getTokens } from "@/services/authService";

// Farm 인터페이스는 apiService에서 import하여 사용


export default function GoDonatePage() {
  const [recommendFarms, setRecommendFarms] = useState<RecommendFarm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<RecommendFarm | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAmountWarning, setShowAmountWarning] = useState(false);
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'kakao'>('kakao');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toastMessages, setToastMessages] = useState<Array<{id: string, message: string, timestamp: number}>>([]);

  useEffect(() => {
    const fetchRecommendFarms = async () => {
      try {
        console.log('추천 목장 조회 시작');
        const farms = await getRecommendFarms();
        console.log('추천 목장 조회 성공:', farms);
        
        setRecommendFarms(farms);
      } catch (error) {
        console.error("추천 목장 정보를 가져오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendFarms();
  }, []);

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
      
      if (!selectedFarm || selectedAmount <= 0) {
        alert('기부 정보가 올바르지 않습니다.');
        return;
      }

      // 카카오페이 결제 시작 API 호출
      await startKakaoPay({
        totalPrice: selectedAmount.toString(),
        farmUuid: selectedFarm.farmUuid
      });

      console.log('카카오페이 결제 시작:', { 
        farmName: selectedFarm.farmName, 
        amount: selectedAmount,
        farmUuid: selectedFarm.farmUuid 
      });
    } catch (error) {
      console.error('카카오페이 결제 시작 오류:', error);
      alert('결제 시작에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 랜덤 목장 선택 함수
  const handleRandomSelect = () => {
    if (recommendFarms.length > 0) {
      const randomIndex = Math.floor(Math.random() * recommendFarms.length);
      const randomFarm = recommendFarms[randomIndex];
      setSelectedFarm(randomFarm);
      
      // 토스트 알림 추가
      const newToast = {
        id: Date.now().toString(),
        message: "새로운 목장이 선택되었습니다",
        timestamp: Date.now()
      };
      setToastMessages(prev => [...prev, newToast]);
      
      console.log('랜덤 선택된 농장:', randomFarm.farmName);
    }
  };

  // 토스트 제거 함수
  const handleRemoveToast = (id: string) => {
    setToastMessages(prev => prev.filter(toast => toast.id !== id));
  };

  // 미사용 함수들 제거됨 - 현재 handleConfirmDonation으로 대체됨


  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showConfirmModal) {
        setShowConfirmModal(false);
      }
    };

    if (showConfirmModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showConfirmModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!recommendFarms.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">추천 목장 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div>
      {/* 메인 컨텐츠 */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* 브레드크럼 */}
        <div className="pt-4 pb-3">
          <Breadcrumbs items={[
            { label: '바로기부' }
          ]} />
        </div>
        
        {/* 헤더 */}
        <div className="mb-6 flex flex-row">
          <div className="flex items-center mb-4 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">바로기부</h1>
            <div className="w-29 h-0.5 bg-gray-300"></div>
          </div>
        </div>
                          
        {/* 목장 선택과 후원 정보 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 목장 선택 섹션 */}
            <div className="space-y-6">
            {/* 목장 선택 헤더 */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">목장 선택</h2>
              <Button
                onClick={handleRandomSelect}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Shuffle className="h-4 w-4" />
                랜덤 선택
              </Button>
            </div>

            {/* 목장 슬라이더 */}
            <FarmSlider
              farms={recommendFarms}
              selectedFarm={selectedFarm}
              onFarmSelect={setSelectedFarm}
            />
            </div>

          {/* 후원 정보 섹션 */}
          <DonationSection
            selectedAmount={selectedAmount}
            customAmount={customAmount}
            showAmountWarning={showAmountWarning}
            isCustomInputActive={isCustomInputActive}
            paymentMethod={paymentMethod}
            showConfirmPopup={showConfirmPopup}
            selectedFarm={selectedFarm}
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
      <LoginRequiredModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* 토스트 알림 */}
      <Toast
        messages={toastMessages}
        onRemove={handleRemoveToast}
        duration={2000}
      />
    </div>
  );
}
