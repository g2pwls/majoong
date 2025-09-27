"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PaymentMethodSelectorProps {
  paymentMethod: 'kakao';
  onPaymentMethodChange: (method: 'kakao') => void;
}

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="pt-6 border-t border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">결제 수단</h3>
      
      {/* 결제 수단 선택 - 금액 버튼과 동일한 그리드 시스템 사용 */}
      <div className="grid grid-cols-3 gap-3">
        <div></div>
        <div></div>
        <Button
          variant={paymentMethod === 'kakao' ? 'default' : 'outline'}
          onClick={() => onPaymentMethodChange('kakao')}
          className={`h-12 flex items-center justify-center gap-2 ${
            paymentMethod === 'kakao'
              ? 'text-black'
              : 'border-[#fee500] text-[#fee500] hover:bg-[#fee500]/10'
          } transition-colors`}
          style={{
            backgroundColor: paymentMethod === 'kakao' ? '#fee500' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (paymentMethod === 'kakao') {
              e.currentTarget.style.backgroundColor = '#fdd835';
            }
          }}
          onMouseLeave={(e) => {
            if (paymentMethod === 'kakao') {
              e.currentTarget.style.backgroundColor = '#fee500';
            }
          }}
        >
          <Image
            src="/images/payment/KakaoPay_Logo.png"
            alt="카카오페이"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-sm font-medium">카카오페이</span>
        </Button>
      </div>
    </div>
  );
}
