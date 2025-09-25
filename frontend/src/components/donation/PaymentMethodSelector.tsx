"use client";

import { Button } from "@/components/ui/button";

interface PaymentMethodSelectorProps {
  paymentMethod: 'kakao' | 'bank';
  onPaymentMethodChange: (method: 'kakao' | 'bank') => void;
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
        <div className="flex space-x-4">
          <Button
            variant={paymentMethod === 'kakao' ? "default" : "outline"}
            onClick={() => onPaymentMethodChange('kakao')}
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
            onClick={() => onPaymentMethodChange('bank')}
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
    </div>
  );
}
