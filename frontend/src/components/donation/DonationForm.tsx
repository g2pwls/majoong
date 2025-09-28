"use client";

import { Button } from "@/components/ui/button";
import DonationAmountSelector from "./DonationAmountSelector";
import PaymentMethodSelector from "./PaymentMethodSelector";
import DonationConfirmationModal from "./DonationConfirmationModal";

interface Farm {
  id?: string;
  farm_name?: string;
  farmName?: string;
  total_score?: number;
  totalScore?: number;
  name?: string;
  address: string;
  image_url?: string;
  profileImage?: string;
  farmUuid?: string;
}

interface DonationFormProps {
  selectedAmount: number;
  customAmount: string;
  showAmountWarning: boolean;
  isCustomInputActive: boolean;
  paymentMethod: 'kakao';
  showConfirmPopup: boolean;
  selectedFarm: Farm | null;
  onAmountSelect: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
  onCustomInputClick: () => void;
  onCustomInputBlur: () => void;
  onCustomInputKeyDown: (e: React.KeyboardEvent) => void;
  onPaymentMethodChange: (method: 'kakao') => void;
  onDonateClick: () => void;
  onConfirmDonation: () => void;
  onCloseConfirmPopup: () => void;
  formatAmount: (amount: number) => string;
}

export default function DonationForm({
  selectedAmount,
  customAmount,
  showAmountWarning,
  isCustomInputActive,
  paymentMethod,
  showConfirmPopup,
  selectedFarm,
  onAmountSelect,
  onCustomAmountChange,
  onCustomInputClick,
  onCustomInputBlur,
  onCustomInputKeyDown,
  onPaymentMethodChange,
  onDonateClick,
  onConfirmDonation,
  onCloseConfirmPopup,
  formatAmount,
}: DonationFormProps) {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">후원 금액</h3>
      
      <DonationAmountSelector
        selectedAmount={selectedAmount}
        onAmountSelect={onAmountSelect}
        onCustomAmountChange={onCustomAmountChange}
        onCustomInputClick={onCustomInputClick}
        onCustomInputBlur={onCustomInputBlur}
        onCustomInputKeyDown={onCustomInputKeyDown}
        customAmount={customAmount}
        showAmountWarning={showAmountWarning}
        isCustomInputActive={isCustomInputActive}
        formatAmount={formatAmount}
      />

      <PaymentMethodSelector
        paymentMethod={paymentMethod}
        onPaymentMethodChange={onPaymentMethodChange}
      />

      {/* 기부하기 버튼 */}
      <div className="pt-2">
        <Button
          onClick={onDonateClick}
          className="w-full h-12 bg-green-500 hover:bg-green-600 text-white text-xl font-semibold"
          disabled={selectedAmount <= 0 || !selectedFarm}
        >
          기부하기
        </Button>
      </div>

      {/* 기부 확인 모달 */}
      <DonationConfirmationModal
        isOpen={showConfirmPopup}
        onClose={onCloseConfirmPopup}
        onConfirm={onConfirmDonation}
        farmName={selectedFarm?.farmName || selectedFarm?.farm_name || ""}
        amount={selectedAmount}
        formatAmount={formatAmount}
      />
    </div>
  );
}
