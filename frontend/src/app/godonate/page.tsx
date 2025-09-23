"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { startKakaoPay } from "@/services/paymentService";

interface FarmData {
  id: string;
  farm_name: string;
  total_score: number;
  name: string;
  address: string;
  farm_phone: string;
  area: number;
  horse_count: number;
  image_url: string;
}

const predefinedAmounts = [1000, 5000, 10000, 30000, 50000];

export default function GoDonatePage() {
  const [topFarms, setTopFarms] = useState<FarmData[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showAmountWarning, setShowAmountWarning] = useState(false);
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [donationType, setDonationType] = useState<'one-time' | 'recurring'>('one-time');
  const [paymentMethod, setPaymentMethod] = useState<'kakao' | 'bank'>('kakao');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  useEffect(() => {
    const fetchTopFarms = async () => {
      try {
        const response = await fetch('/receipt/farms/all');
        if (response.ok) {
          const data = await response.json();
          // 신뢰도 순으로 정렬하고 상위 5개 선택
          const sortedFarms = data.sort((a: FarmData, b: FarmData) => b.total_score - a.total_score);
          const top5 = sortedFarms.slice(0, 5);
          setTopFarms(top5);
          if (top5.length > 0) {
            setSelectedFarm(top5[0]);
          }
        }
      } catch (error) {
        console.error("농장 정보를 가져오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopFarms();
  }, []);

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
      // 1000 단위로 자동 내림
      const rounded = Math.floor(numValue / 1000) * 1000;
      setSelectedAmount(rounded);
      
      // 1000원 단위로 딱 떨어지지 않는 경우 경고 표시
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

  const handleDonationTypeChange = (type: 'one-time' | 'recurring') => {
    if (type === 'recurring') {
      alert('정기 후원 기능은 추후 구현될 예정입니다.');
      return;
    }
    setDonationType(type);
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
      
      if (!selectedFarm || selectedAmount <= 0) {
        alert('기부 정보가 올바르지 않습니다.');
        return;
      }

      // 카카오페이 결제 시작 API 호출
      await startKakaoPay({
        totalPrice: selectedAmount.toString(),
        farmUuid: selectedFarm.id
      });

      console.log('카카오페이 결제 시작:', { 
        farmName: selectedFarm.farm_name, 
        amount: selectedAmount,
        farmUuid: selectedFarm.id 
      });
    } catch (error) {
      console.error('카카오페이 결제 시작 오류:', error);
      alert('결제 시작에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDonate = () => {
    if (selectedAmount > 0 && selectedFarm) {
      setShowConfirmModal(true);
    } else {
      alert("기부 금액을 선택해주세요.");
    }
  };

  const handleConfirmDonate = () => {
    // TODO: 실제 기부 처리 로직 구현
    console.log(`${selectedFarm?.farm_name}에 ${formatAmount(selectedAmount)}원 기부 완료`);
    setShowConfirmModal(false);
    // 기부 완료 후 처리 (예: 성공 페이지로 이동)
  };

  const handleCancelDonate = () => {
    setShowConfirmModal(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % topFarms.length);
    setSelectedFarm(topFarms[(currentSlide + 1) % topFarms.length]);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + topFarms.length) % topFarms.length);
    setSelectedFarm(topFarms[(currentSlide - 1 + topFarms.length) % topFarms.length]);
  };

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

  if (!topFarms.length) {
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
        {/* 헤더 */}
        <div className="mb-6 flex flex-row">
          <div className="flex items-centermb-4 flex flex-col">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">바로기부</h1>
            <div className="w-37 h-1 bg-gray-300"></div>
          </div>
          <p className="text-lg text-gray-600 ml-5">
            말리부가 선정한 신뢰도 TOP5 농장에 바로 기부해 보세요!
          </p>
        </div>

        {/* 기부 폼 */}
        <Card className="bg-white border border-gray-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽: 농장 캐러셀 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-0">농장 선택</h2>
              
              {/* 3D 원형 캐러셀 컨테이너 */}
              <div className="relative h-[400px] flex items-center justify-center mb-0" style={{ perspective: '1000px' }}>
                {/* 회전하는 3D 원형 컨테이너 */}
                <div
                  className="absolute w-full h-full transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `rotateY(${-currentSlide * (360 / topFarms.length)}deg)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* 3D 원형 배치된 카드들 */}
                  {topFarms.map((farm, index) => {
                    const angle = (index * 360) / topFarms.length; // 각 카드의 원형 위치 각도
                    const radius = 200; // 3D 원의 반지름
                    
                    // 현재 슬라이드 기준으로 상대적 위치 계산
                    let relativeIndex = index - currentSlide;
                    if (relativeIndex > topFarms.length / 2) {
                      relativeIndex -= topFarms.length;
                    } else if (relativeIndex < -topFarms.length / 2) {
                      relativeIndex += topFarms.length;
                    }
                    
                    const absRelativeIndex = Math.abs(relativeIndex);
                    
                    // 카드 크기와 투명도 설정
                    let scale = 0.8;
                    let opacity = 1;
                    let zIndex = 10;
                    
                    if (absRelativeIndex === 0) { // 중앙 카드
                      scale = 0.85;
                      opacity = 1;
                      zIndex = 10;
                    } else if (absRelativeIndex === 1) { // 양쪽 카드
                      scale = 0.8;
                      opacity = 0.8;
                      zIndex = 9;
                    } else if (absRelativeIndex === 2) { // 뒤쪽 카드
                      scale = 0.6;
                      opacity = 0.6;
                      zIndex = 8;
                    } else { // 숨겨진 카드
                      scale = 0.4;
                      opacity = 0;
                      zIndex = 1;
                    }
                    
                    return (
                      <div
                        key={farm.id}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out"
                        style={{
                          transform: `rotateY(${angle}deg) translateZ(${radius}px) scale(${scale})`,
                          zIndex: zIndex,
                          opacity: opacity,
                          pointerEvents: absRelativeIndex > 2 ? 'none' : 'auto',
                          backfaceVisibility: 'hidden',
                        }}
                        onClick={() => {
                          setCurrentSlide(index);
                          setSelectedFarm(farm);
                        }}
                      >
                        <div 
                          className={`relative w-64 h-85 rounded-lg overflow-hidden shadow-lg cursor-pointer ${
                            absRelativeIndex === 0 
                              ? 'ring-4 ring-green-500 ring-opacity-50' 
                              : 'border-2 border-gray-200'
                          }`}
                        >
                          <Image
                            src={farm.image_url}
                            alt={`${farm.farm_name} 프로필 이미지`}
                            width={256}
                            height={160}
                            className="w-full h-40 object-cover"
                          />
                          
                          {/* 카드 내용 */}
                          <div className="p-3 bg-white flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{farm.farm_name}</h3>
                            <div className="text-sm text-gray-600 space-y-1 flex-grow">
                              <p>신뢰도: {farm.total_score}°C</p>
                              <p>농장주: {farm.name}</p>
                              <p className="truncate">주소: {farm.address}</p>
                            </div>
                            
                            {/* 자세히 버튼 */}
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <Link 
                                href={`/support/${farm.id}`}
                                className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                목장 구경가기
                              </Link>
                            </div>
                          </div>
                          
                          {/* 선택 표시 */}
                          {absRelativeIndex === 0 && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                              ✓
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 캐러셀 네비게이션 버튼 */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={prevSlide}
                  className="bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg border"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg border"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              {/* 캐러셀 인디케이터 */}
              <div className="flex justify-center space-x-2">
                {topFarms.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                      setSelectedFarm(topFarms[index]);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-green-500' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 오른쪽: 후원 정보 */}
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-900">후원 정보</h3>
              
              {/* 후원 방법 선택 */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">후원 방법</h4>
                <div className="flex space-x-4">
                  <Button
                    variant={donationType === 'one-time' ? "default" : "outline"}
                    onClick={() => handleDonationTypeChange('one-time')}
                    className={`px-6 py-3 ${
                      donationType === 'one-time'
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    일시 후원
                  </Button>
                  <Button
                    variant={donationType === 'recurring' ? "default" : "outline"}
                    onClick={() => handleDonationTypeChange('recurring')}
                    className={`px-6 py-3 ${
                      donationType === 'recurring'
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    정기 후원
                  </Button>
                </div>
              </div>

              {/* 후원 금액 선택 */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">후원 금액</h4>
              
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
                {/* 직접 입력 버튼 또는 입력창 */}
                {isCustomInputActive ? (
                  <div className="relative h-12">
                  <Input
                    type="text"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                      onBlur={handleCustomInputBlur}
                      onKeyDown={handleCustomInputKeyDown}
                      placeholder="금액 입력"
                      className="h-12 text-center font-medium"
                      autoFocus
                    />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleCustomInputClick}
                    className={`h-12 ${
                      selectedAmount > 0 && !predefinedAmounts.includes(selectedAmount)
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {customAmount ? `${formatAmount(selectedAmount)}원` : "직접 입력"}
                  </Button>
                )}
                </div>

              {/* 1000원 단위로 딱 떨어지지 않는 경우 안내 문구 */}
              {showAmountWarning && (
                <div className="flex justify-center mb-2">
                  <span className="text-orange-600 text-sm">
                    1,000원 단위로 기부됩니다.
                  </span>
              </div>
              )}

              {/* 기부 금액 표시 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">기부 금액:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {selectedAmount > 0 ? formatAmount(selectedAmount) : "0"}원
                  </span>
                </div>
              </div>

              </div>

              {/* 결제 정보 */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">결제 정보</h3>
                
                {/* 결제 수단 선택 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800">결제 수단</h4>
                  <div className="flex space-x-4">
                    <Button
                      variant={paymentMethod === 'kakao' ? "default" : "outline"}
                      onClick={() => handlePaymentMethodChange('kakao')}
                      className={`px-6 py-3 ${
                        paymentMethod === 'kakao'
                          ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      카카오페이
                    </Button>
                    <Button
                      variant={paymentMethod === 'bank' ? "default" : "outline"}
                      onClick={() => handlePaymentMethodChange('bank')}
                      className={`px-6 py-3 ${
                        paymentMethod === 'bank'
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      무통장입금
                    </Button>
                </div>
              </div>

              {/* 기부하기 버튼 */}
                <div className="flex justify-center pt-4">
                <Button
                    onClick={handleDonateClick}
                    className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 text-xl font-semibold"
                  disabled={selectedAmount <= 0 || !selectedFarm}
                >
                  기부하기
                </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 기부 확인 팝업 */}
      {showConfirmPopup && selectedFarm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmPopup(false)}
        >
          <div 
            className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">기부 확인</h3>
            <p className="text-gray-600 mb-6 text-center">
              <span className="font-medium text-gray-900">{selectedFarm.farm_name}</span>에<br/>
              <span className="font-medium text-green-600">{formatAmount(selectedAmount)}원</span>을 기부하시겠습니까?
            </p>
            <div className="flex space-x-4 justify-end">
                <Button
                onClick={() => setShowConfirmPopup(false)}
                  variant="outline"
                className="px-6 py-2"
                >
                  취소
                </Button>
                <Button
                onClick={handleConfirmDonation}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
                >
                확인
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
