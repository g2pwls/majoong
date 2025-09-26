"use client";

import Image from "next/image";
import { FarmDetail } from "@/services/apiService";

interface FarmDetailCardProps {
  farmDetail: FarmDetail;
}

export default function FarmDetailCard({ farmDetail }: FarmDetailCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
      {/* 이미지와 점수 배지 */}
      <div className="relative">
        <Image
          src={farmDetail.profileImage}
          alt={`${farmDetail.farmName} 프로필 이미지`}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
        
        {/* 신뢰도 점수 배지 */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
          <span className="text-sm font-bold text-gray-800">
            {farmDetail.totalScore.toFixed(1)}°C
          </span>
        </div>
      </div>

      {/* 카드 내용 */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {farmDetail.farmName}
        </h3>
        
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            {farmDetail.description}
          </p>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span>{farmDetail.address}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">👨‍🌾</span>
            <span>{farmDetail.ownerName}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">🐴</span>
            <span>{farmDetail.horseCount}두</span>
          </div>
        </div>
      </div>
    </div>
  );
}
