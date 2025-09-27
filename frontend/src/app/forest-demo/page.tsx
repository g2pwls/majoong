"use client";

import React from 'react';
import ForestBackground from '@/components/common/ForestBackground';

export default function ForestDemoPage() {
  return (
    <ForestBackground>
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Forest Demo</h1>
        <p className="text-lg">숲 배경 애니메이션 데모 페이지입니다.</p>
      </div>
    </ForestBackground>
  );
}