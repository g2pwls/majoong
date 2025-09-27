'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">
            기부를 하려면 로그인이 필요합니다.<br />
            로그인 페이지로 이동하시겠습니까?
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleLogin}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              로그인하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
