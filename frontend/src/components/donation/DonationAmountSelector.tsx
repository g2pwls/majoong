"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DonationAmountSelectorProps {
  selectedAmount: number;
  onAmountSelect: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
  onCustomInputClick: () => void;
  onCustomInputBlur: () => void;
  onCustomInputKeyDown: (e: React.KeyboardEvent) => void;
  customAmount: string;
  showAmountWarning: boolean;
  isCustomInputActive: boolean;
  formatAmount: (amount: number) => string;
}

const predefinedAmounts = [1000, 5000, 10000, 30000, 50000];

export default function DonationAmountSelector({
  selectedAmount,
  onAmountSelect,
  onCustomAmountChange,
  onCustomInputClick,
  onCustomInputBlur,
  onCustomInputKeyDown,
  customAmount,
  showAmountWarning,
  isCustomInputActive,
  formatAmount,
}: DonationAmountSelectorProps) {
  return (
    <div className="space-y-4">
      {/* 미리 정의된 금액 버튼들 */}
      <div className="grid grid-cols-3 gap-3">
        {predefinedAmounts.map((amount) => (
          <Button
            key={amount}
            variant={selectedAmount === amount ? "default" : "outline"}
            onClick={() => onAmountSelect(amount)}
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
              onChange={(e) => onCustomAmountChange(e.target.value)}
              onBlur={onCustomInputBlur}
              onKeyDown={onCustomInputKeyDown}
              placeholder="금액 입력"
              className="h-12 text-center font-medium"
              autoFocus
            />
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={onCustomInputClick}
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

      {/* 100원 단위로 딱 떨어지지 않는 경우 안내 문구 */}
      {showAmountWarning && (
        <div className="flex justify-center mb-2">
          <span className="text-orange-600 text-sm">
            100원 단위로 기부됩니다.
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
  );
}
