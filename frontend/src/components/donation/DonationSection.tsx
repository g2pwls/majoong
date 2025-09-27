"use client";

import { Card } from "@/components/ui/card";
import DonationForm from "./DonationForm";

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

interface DonationSectionProps {
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

export default function DonationSection({
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
}: DonationSectionProps) {
  return (
    <Card className="bg-white border border-gray-200 p-8">
      <DonationForm
        selectedAmount={selectedAmount}
        customAmount={customAmount}
        showAmountWarning={showAmountWarning}
        isCustomInputActive={isCustomInputActive}
        paymentMethod={paymentMethod}
        showConfirmPopup={showConfirmPopup}
        selectedFarm={selectedFarm}
        onAmountSelect={onAmountSelect}
        onCustomAmountChange={onCustomAmountChange}
        onCustomInputClick={onCustomInputClick}
        onCustomInputBlur={onCustomInputBlur}
        onCustomInputKeyDown={onCustomInputKeyDown}
        onPaymentMethodChange={onPaymentMethodChange}
        onDonateClick={onDonateClick}
        onConfirmDonation={onConfirmDonation}
        onCloseConfirmPopup={onCloseConfirmPopup}
        formatAmount={formatAmount}
      />
    </Card>
  );
}
