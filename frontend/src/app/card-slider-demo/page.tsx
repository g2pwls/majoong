'use client';

import React from 'react';
import CardSlider from '@/components/ui/CardSlider';

// 샘플 데이터 - 로컬 이미지 사용 예시
const sampleCards = [
  {
    id: '1',
    image: '/https://www.6666ranch.com/wp-content/uploads/BS-6666-51.jpg', // public/images/slider/ 폴더에 이미지 파일 넣기
    name: 'Highlands',
    location: 'Scotland',
    description: 'The mountains are calling'
  },
  {
    id: '2',
    image: 'https://media.istockphoto.com/id/177000853/photo/horses-on-the-farm.jpg?s=612x612&w=0&k=20&c=ypbIjJNQCu02sgwt6HJ_aKd111V1UiULsG6KOVgqvZg=',
    name: 'Machu Pichu',
    location: 'Peru',
    description: 'Adventure is never far away'
  },
  {
    id: '3',
    image: '/images/slider/chamonix.jpg',
    name: 'Chamonix',
    location: 'France',
    description: 'Let your dreams come true'
  },
  {
    id: '4',
    image: '/images/slider/santorini.jpg',
    name: 'Santorini',
    location: 'Greece',
    description: 'Where the sun meets the sea'
  },
  {
    id: '5',
    image: '/images/slider/kyoto.jpg',
    name: 'Kyoto',
    location: 'Japan',
    description: 'Ancient traditions, modern beauty'
  }
];

export default function CardSliderDemoPage() {
  return (
    <div className="min-h-screen">
      <CardSlider cards={sampleCards} />
    </div>
  );
}
