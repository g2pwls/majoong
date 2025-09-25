"use client";

import Image from "next/image";
import Link from "next/link";

interface FarmCardProps {
  farmUuid: string;
  profileImage: string;
  farmName: string;
  totalScore: number;
  address: string;
  description: string;
  onSelect?: () => void;
  isSelected?: boolean;
}

export default function FarmCard({
  farmUuid,
  profileImage,
  farmName,
  totalScore,
  address,
  description,
  onSelect,
  isSelected = false,
}: FarmCardProps) {
  return (
    <div 
      className={`relative bg-white border rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl h-[340px] ${
        isSelected 
          ? 'ring-4 ring-green-500 ring-opacity-50 border-green-200' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* 이미지와 점수 배지 */}
      <div className="relative">
        <Image
          src={profileImage}
          alt={`${farmName} 프로필 이미지`}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
        
        {/* 신뢰도 점수 배지 */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
          <span className="text-sm font-bold text-gray-800">
            {totalScore.toFixed(1)}°C
          </span>
        </div>
      </div>

      {/* 카드 내용 */}
      <div className="p-4 flex flex-col h-full">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {farmName}
        </h3>
        
        <div className="space-y-2 mb-4 flex-grow">
          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            📍 {address}
          </p>
        </div>
        
        {/* 자세히 보기 버튼 */}
        <div className="flex justify-end mt-auto">
          <Link 
            href={`/support/${farmUuid}`}
            className="inline-flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            자세히 보기
          </Link>
        </div>
      </div>

      {/* 선택 표시 */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
          ✓
        </div>
      )}
    </div>
  );
}
