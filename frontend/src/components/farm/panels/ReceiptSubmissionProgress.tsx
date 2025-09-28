'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ReceiptSubmissionProgressProps {
  isVisible: boolean;
  onComplete: () => void;
  isApiComplete?: boolean; // API 호출 완료 상태
}

export default function ReceiptSubmissionProgress({ isVisible, onComplete, isApiComplete = false }: ReceiptSubmissionProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasStarted = useRef(false);

  const steps = [
    { message: '제출 중입니다', duration: 5000 }, // 4초
    { message: '정산 중입니다', duration: 5000 }, // 4초
    { message: '출금 중입니다', duration: 5000 }, // 4초
    { message: '완료 되었습니다', duration: 1000 }, // 1초
  ];

  useEffect(() => {
    if (!isVisible || hasStarted.current) return;
    hasStarted.current = true;

    const processSubmission = async () => {
      let totalProgress = 0;
      const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

      for (let i = 0; i < steps.length - 1; i++) { // 마지막 단계 제외
        setCurrentStep(i);
        
        const step = steps[i];
        const stepProgress = (step.duration / totalDuration) * 100;
        
        // 각 단계별로 부드럽게 진행률 증가
        for (let j = 0; j <= 100; j += 2) {
          await new Promise(resolve => setTimeout(resolve, step.duration / 50));
          setProgress(totalProgress + (stepProgress * j / 100));
        }
        
        totalProgress += stepProgress;
      }

      // API 완료되지 않았으면 99%에서 멈춤
      if (!isApiComplete) {
        setProgress(99);
        // API 완료를 기다리지 않고 15초 후 자동 완료
        setTimeout(() => {
          setCurrentStep(steps.length - 1);
          setProgress(100);
          setTimeout(() => {
            onComplete();
          }, 1000);
        }, 1000); // 1초 후 자동으로 완료 단계로 이동
      }
    };

    processSubmission();
  }, [isVisible, onComplete]);

  // API 완료 상태 감지하여 즉시 완료 단계로 이동
  useEffect(() => {
    if (isApiComplete && isVisible) {
      // 즉시 완료 단계로 이동
      setCurrentStep(steps.length - 1);
      setProgress(100);
      
      // 1초 후 완료 처리
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [isApiComplete, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-8">
          <div className="text-center space-y-6">
            {/* 제목 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                영수증 제출
              </h2>
              <p className="text-gray-600">
                영수증을 처리하고 있습니다. 잠시만 기다려주세요.
              </p>
            </div>

            {/* 스피너 */}
            <div className="flex justify-center">
              {currentStep < steps.length - 1 ? (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              ) : (
                <div className="text-6xl">✅</div>
              )}
            </div>

            {/* 현재 단계 메시지 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {steps[currentStep]?.message || '처리 중...'}
              </h3>
              <p className="text-sm text-gray-500">
                {currentStep < steps.length - 1 
                  ? '잠시만 기다려주세요. 처리 완료 후 자동으로 이동합니다.'
                  : '처리가 완료되었습니다!'
                }
              </p>
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>

            {/* 진행률 퍼센트 */}
            <div className="text-sm text-gray-600">
              {Math.round(Math.min(progress, 100))}% 완료
            </div>

            {/* 단계 표시 */}
            <div className="flex justify-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index <= currentStep 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
