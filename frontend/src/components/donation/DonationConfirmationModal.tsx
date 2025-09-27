"use client";

import { Button } from "@/components/ui/button";

interface DonationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  farmName: string;
  amount: number;
  formatAmount: (amount: number) => string;
}

export default function DonationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  farmName,
  amount,
  formatAmount,
}: DonationConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">기부 확인</h3>
        <p className="text-gray-600 mb-6 text-center">
          <span className="font-medium text-gray-900">{farmName}</span>에<br/>
          <span className="font-medium text-green-600">{formatAmount(amount)}원</span>을 기부하시겠습니까?
        </p>
        <div className="flex space-x-4 justify-center">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6 py-2"
          >
            취소
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
