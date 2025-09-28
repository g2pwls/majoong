'use client';

import React from 'react';
import HologramCard from './HologramCard';

interface HorseCard {
  id: string;
  name: string;
  farmName: string;
  description: string;
  imageUrl: string;
  breed: string;
  gender: string;
  birthYear: string;
  raceCount: number;
  totalPrize: string;
}

interface HologramCardCollectionProps {
  cards?: HorseCard[];
  title?: string;
  className?: string;
}

const defaultCards: HorseCard[] = [
  {
    id: '1',
    name: '천둥마',
    farmName: '스타목장',
    description: '빛의 속도로 달리는 전설의 말',
    imageUrl: 'https://i.imgur.com/t1TBwxw.jpg',
    breed: '아라비안',
    gender: '수컷',
    birthYear: '2018',
    raceCount: 15,
    totalPrize: '₩500,000,000'
  },
  {
    id: '2',
    name: '바람의 왕자',
    farmName: '드림팜',
    description: '바람을 타고 달리는 우아한 말',
    imageUrl: 'https://i.imgur.com/t1TBwxw.jpg',
    breed: '영국산',
    gender: '수컷',
    birthYear: '2019',
    raceCount: 12,
    totalPrize: '₩350,000,000'
  },
  {
    id: '3',
    name: '달빛 여신',
    farmName: '문라이트 목장',
    description: '달빛 아래에서 빛나는 아름다운 말',
    imageUrl: 'https://i.imgur.com/t1TBwxw.jpg',
    breed: '아라비안',
    gender: '암컷',
    birthYear: '2017',
    raceCount: 18,
    totalPrize: '₩750,000,000'
  },
  {
    id: '4',
    name: '불꽃의 전사',
    farmName: '파이어 스테이블',
    description: '불꽃처럼 뜨거운 승부욕을 가진 말',
    imageUrl: 'https://i.imgur.com/t1TBwxw.jpg',
    breed: '미국산',
    gender: '수컷',
    birthYear: '2020',
    raceCount: 8,
    totalPrize: '₩200,000,000'
  },
  {
    id: '5',
    name: '별의 수호자',
    farmName: '스타가드 목장',
    description: '별빛을 따라 달리는 신비로운 말',
    imageUrl: 'https://i.imgur.com/t1TBwxw.jpg',
    breed: '영국산',
    gender: '암컷',
    birthYear: '2016',
    raceCount: 22,
    totalPrize: '₩1,200,000,000'
  },
  {
    id: '6',
    name: '황금의 제왕',
    farmName: '골든 크라운',
    description: '황금빛 갈기를 가진 위대한 말',
    imageUrl: 'https://i.imgur.com/t1TBwxw.jpg',
    breed: '아라비안',
    gender: '수컷',
    birthYear: '2015',
    raceCount: 25,
    totalPrize: '₩1,500,000,000'
  }
];

export default function HologramCardCollection({ 
  cards = defaultCards, 
  title = "말 카드 컬렉션",
  className = "" 
}: HologramCardCollectionProps) {
  return (
    <div className={`hologram-collection ${className}`}>
      <h1 className="collection-title">{title}</h1>
      
      <div className="cards-grid">
        {cards.map((card) => (
          <HologramCard
            key={card.id}
            imageUrl={card.imageUrl}
            title={card.name}
            subtitle={`${card.breed} • ${card.gender} • ${card.birthYear}년생`}
            description={`${card.farmName} | 경주 ${card.raceCount}회 | 상금 ${card.totalPrize}`}
            onClick={() => {
              console.log(`Clicked on ${card.name} from ${card.farmName}`);
              // 여기에 카드 상세 정보 모달이나 페이지 이동 로직 추가 가능
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .hologram-collection {
          min-height: 100vh;
          background: linear-gradient(135deg, #333844 0%, #2a2f3a 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
          font-family: "Heebo", sans-serif;
        }

        .collection-title {
          font-size: 2.5rem;
          font-weight: 300;
          margin-bottom: 20px;
          background: linear-gradient(45deg, #00e7ff, #ff00e7, #ffe759);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(0, 231, 255, 0.5);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 0;
          justify-items: center;
        }

        /* 반응형 그리드 */
        @media (max-width: 1200px) {
          .cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
          }
        }

        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
          }
          
          .collection-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .cards-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .collection-title {
            font-size: 1.5rem;
          }
        }

        /* 스크롤 애니메이션 */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hologram-collection {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
