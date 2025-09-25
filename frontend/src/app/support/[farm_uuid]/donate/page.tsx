"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFarm, Farm } from "@/services/apiService";
import { startKakaoPay } from "@/services/paymentService";
import DonationForm from "@/components/donation/DonationForm";

// FarmData 인터페이스는 apiService의 Farm 인터페이스를 사용


export default function DonatePage() {
  const params = useParams();
  const farm_uuid = params.farm_uuid as string;
  
  const [farmData, setFarmData] = useState<Farm | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showAmountWarning, setShowAmountWarning] = useState(false);
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'kakao' | 'bank'>('kakao');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        const data = await getFarm(farm_uuid);
        setFarmData(data);
      } catch (error) {
        console.error("농장 정보를 가져오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (farm_uuid) {
      fetchFarmData();
    }
  }, [farm_uuid]);

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
    setShowCustomInput(false);
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
    setShowCustomInput(false);
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


  const handlePaymentMethodChange = (method: 'kakao' | 'bank') => {
    if (method === 'bank') {
      alert('무통장입금 기능은 추후 구현될 예정입니다.');
      return;
    }
    setPaymentMethod(method);
  };

  const handleDonateClick = () => {
    if (selectedAmount > 0) {
      setShowConfirmPopup(true);
    } else {
      alert('후원 금액을 선택해주세요.');
    }
  };

  const handleConfirmDonation = async () => {
    try {
      setShowConfirmPopup(false);
      
      if (!farmData || selectedAmount <= 0) {
        alert('기부 정보가 올바르지 않습니다.');
        return;
      }

      // 카카오페이 결제 시작 API 호출
      await startKakaoPay({
        totalPrice: selectedAmount.toString(),
        farmUuid: farmData.id
      });

      console.log('카카오페이 결제 시작:', { 
        farmName: farmData.farm_name, 
        amount: selectedAmount,
        farmUuid: farmData.id 
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
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!farmData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">농장 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div>
      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-row">
          <div className="flex items-centermb-4 flex flex-col">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">기부하기</h1>
            <div className="w-37 h-1 bg-gray-300"></div>
          </div>
        </div>

        {/* 기부 폼 */}
        <Card className="bg-white border border-gray-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽: 농장 정보 */}
            <div className="space-y-6">
              <div className="flex flex-row">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {farmData.farm_name}
                </h2>
                <div className="text-xl text-gray-600 ml-3">
                  {farmData.total_score}°C
                </div>
              </div>
              
              <div className="relative">
                <Image
                  src={farmData.image_url}
                  alt={`${farmData.farm_name} 프로필 이미지`}
                  width={400}
                  height={300}
                  className="w-100 h-64 object-cover rounded-lg"
                />
              </div>
            </div>

            {/* 오른쪽: 후원 정보 */}
            <DonationForm
              selectedAmount={selectedAmount}
              customAmount={customAmount}
              showAmountWarning={showAmountWarning}
              isCustomInputActive={isCustomInputActive}
              paymentMethod={paymentMethod}
              showConfirmPopup={showConfirmPopup}
              selectedFarm={farmData}
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
        </Card>
      </div>
    </div>
  );
}
