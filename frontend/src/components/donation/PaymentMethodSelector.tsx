"use client";

import { Button } from "@/components/ui/button";

interface PaymentMethodSelectorProps {
  paymentMethod: 'kakao';
  onPaymentMethodChange: (method: 'kakao') => void;
}

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-6 pt-6 border-t border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900">결제 수단</h3>
      
      {/* 결제 수단 선택 */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="default"
            className="h-12 bg-yellow-400 hover:bg-yellow-500 text-white cursor-default"
            disabled
          >
            카카오페이
          </Button>
        </div>
      </div>
    </div>
  );
}
