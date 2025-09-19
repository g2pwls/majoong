"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getFarm, Farm } from "@/services/apiService";

// FarmData 인터페이스는 apiService의 Farm 인터페이스를 사용

const predefinedAmounts = [1000, 5000, 10000, 20000, 30000, 50000];

export default function DonatePage() {
  const params = useParams();
  const farm_uuid = params.farm_uuid as string;
  
  const [farmData, setFarmData] = useState<Farm | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
  };

  const handleCustomAmountChange = (value: string) => {
    // 입력창에는 사용자가 친 그대로 보여주기
    setCustomAmount(value);

    // 콤마 제거 후 숫자 변환
    const numValue = parseInt(value.replace(/,/g, ""), 10);

    if (!isNaN(numValue)) {
      // 1000 단위로 자동 내림
      const rounded = Math.floor(numValue / 1000) * 1000;
      setSelectedAmount(rounded);
    } else {
      setSelectedAmount(0);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  const handleDonate = () => {
    if (selectedAmount > 0) {
      setShowConfirmModal(true);
    } else {
      alert("기부 금액을 선택해주세요.");
    }
  };

  const handleConfirmDonate = () => {
    // TODO: 실제 기부 처리 로직 구현
    console.log(`${formatAmount(selectedAmount)}원 기부 완료`);
    setShowConfirmModal(false);
    // 기부 완료 후 처리 (예: 성공 페이지로 이동)
  };

  const handleCancelDonate = () => {
    setShowConfirmModal(false);
  };

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">기부하기</h1>
          <div className="w-36 h-1 bg-gray-300"></div>
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

            {/* 오른쪽: 금액 선택 */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">금액 선택</h3>
              
              {/* 미리 정의된 금액 버튼들 */}
              <div className="grid grid-cols-3 gap-3">
                {predefinedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    onClick={() => handleAmountSelect(amount)}
                    className={`h-12 ${
                      selectedAmount === amount
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {formatAmount(amount)}원
                  </Button>
                ))}
              </div>

              {/* 직접 입력 */}
              <div className="space-y-2 flex flex-row items-center justify-end mb-0">
                <label className="text-sm font-medium text-gray-700 mr-5">직접 입력</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="금액을 입력하세요"
                    className="flex-1"
                  />
                  <span className="text-gray-600">원</span>
                </div>
              </div>
              <span className="text-gray-600 flex justify-end mb-5">(1000원 단위로 기부 가능)</span>

              {/* 기부 금액 표시 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">기부 금액:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {selectedAmount > 0 ? formatAmount(selectedAmount) : "0"}원
                  </span>
                </div>
              </div>

              {/* 기부하기 버튼 */}
              <div className="flex justify-end">
                <Button
                  onClick={handleDonate}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
                  disabled={selectedAmount <= 0}
                >
                  기부하기
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 기부 확인 모달 */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCancelDonate}
        >
          <div 
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">기부 확인</h3>
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">
                  <span className="font-semibold">{farmData?.farm_name}</span>에
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(selectedAmount)}원
                </p>
                <p className="text-lg text-gray-700 mt-2">기부하시겠습니까?</p>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={handleCancelDonate}
                  variant="outline"
                  className="flex-1 py-3"
                >
                  취소
                </Button>
                <Button
                  onClick={handleConfirmDonate}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3"
                >
                  기부하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
