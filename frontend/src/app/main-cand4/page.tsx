'use client';

import React, { useEffect, useState } from 'react';
import InfiniteCarousel from '@/components/ui/InfiniteCarousel';
import { getHorses, Horse } from '@/services/apiService';

const MainCand4Page: React.FC = () => {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);

  // 말 데이터 가져오기
  useEffect(() => {
    const fetchHorses = async () => {
      try {
        setLoading(true);
        const response = await getHorses({
          page: 0,
          size: 20 // 더 많은 말 데이터 가져오기
        });
        
        const horseList = response.content.map(item => item.horse);
        setHorses(horseList);
      } catch (error) {
        console.error('말 데이터를 가져오는데 실패했습니다:', error);
        setHorses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHorses();
  }, []);

  // 첫 번째 슬라이더용 이미지 데이터 (기존 데모 데이터)
  const slider1Items = [
    {
      id: '1',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_1.png',
      alt: 'Slider 1 Image 1'
    },
    {
      id: '2',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_2.png',
      alt: 'Slider 1 Image 2'
    },
    {
      id: '3',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_3.png',
      alt: 'Slider 1 Image 3'
    },
    {
      id: '4',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_4.png',
      alt: 'Slider 1 Image 4'
    },
    {
      id: '5',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_5.png',
      alt: 'Slider 1 Image 5'
    },
    {
      id: '6',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_6.png',
      alt: 'Slider 1 Image 6'
    },
    {
      id: '7',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_7.png',
      alt: 'Slider 1 Image 7'
    },
    {
      id: '8',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_8.png',
      alt: 'Slider 1 Image 8'
    },
    {
      id: '9',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_9.png',
      alt: 'Slider 1 Image 9'
    },
    {
      id: '10',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider1_10.png',
      alt: 'Slider 1 Image 10'
    }
  ];

  // 두 번째 슬라이더용 이미지 데이터
  const slider2Items = [
    {
      id: '1',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider2_1.png',
      alt: 'Slider 2 Image 1'
    },
    {
      id: '2',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider2_2.png',
      alt: 'Slider 2 Image 2'
    },
    {
      id: '3',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider2_3.png',
      alt: 'Slider 2 Image 3'
    },
    {
      id: '4',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider2_4.png',
      alt: 'Slider 2 Image 4'
    },
    {
      id: '5',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider2_5.png',
      alt: 'Slider 2 Image 5'
    },
    {
      id: '6',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider2_6.png',
      alt: 'Slider 2 Image 6'
    },
    {
      id: '7',
      src: 'https://raw.githubusercontent.com/HoanghoDev/youtube_v2/main/auto_slider/images/slider2_7.png',
      alt: 'Slider 2 Image 7'
    }
  ];

  // 말 이름 캐러셀용 데이터 (텍스트만)
  const horseNameItems = horses.map((horse, index) => ({
    id: horse.id.toString(),
    src: '', // 이미지 없음
    alt: horse.hrNm,
    text: horse.hrNm, // 말 이름
    farmId: horse.farm_id
  }));

  // 말 사진 캐러셀용 데이터
  const horseImageItems = horses.map((horse, index) => ({
    id: horse.id.toString(),
    src: horse.horse_url || `https://via.placeholder.com/200x200/4D3A2C/FFFFFF?text=${encodeURIComponent(horse.hrNm)}`,
    alt: horse.hrNm,
    text: horse.hrNm,
    farmId: horse.farm_id
  }));

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#4D3A2C',
        color: 'white',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #D3CAB8',
          borderTop: '3px solid #4D3A2C',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>말 데이터를 불러오는 중...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", "Roboto", "Helvetica Neue", Arial, sans-serif;
          background: #4D3A2C;
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }

        .container {
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          gap: 60px;
          align-items: center;
          justify-content: center;
        }

        .title {
          color: white;
          font-size: 2.5rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
        }

        .subtitle {
          color: #D3CAB8;
          font-size: 1.2rem;
          text-align: center;
          margin-bottom: 40px;
        }

        .slider-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .slider-section {
          margin-bottom: 80px;
        }

        .slider-label {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }

        .slider-description {
          color: #D3CAB8;
          font-size: 1rem;
          margin-bottom: 30px;
          text-align: center;
        }
      `}</style>

      <div className="container">
        <div>
          <h1 className="title">말 정보 카루셀</h1>
          <p className="subtitle">API에서 가져온 실제 말 데이터</p>
        </div>

        {/* 말 이름 캐러셀 */}
        <div className="slider-section">
          <h2 className="slider-label">말 이름 목록</h2>
          <p className="slider-description">등록된 말들의 이름을 확인해보세요</p>
          <div className="slider-container">
            {horseNameItems.length > 0 ? (
              <InfiniteCarousel
                items={horseNameItems}
                width={200}
                height={60}
                reverse={false}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#D3CAB8', 
                padding: '40px',
                backgroundColor: '#6B4E3D',
                borderRadius: '8px'
              }}>
                말 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 말 사진 캐러셀 */}
        <div className="slider-section">
          <h2 className="slider-label">말 사진 갤러리</h2>
          <p className="slider-description">말들의 사진을 둘러보세요</p>
          <div className="slider-container">
            {horseImageItems.length > 0 ? (
              <InfiniteCarousel
                items={horseImageItems}
                width={200}
                height={200}
                reverse={true}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#D3CAB8', 
                padding: '40px',
                backgroundColor: '#6B4E3D',
                borderRadius: '8px'
              }}>
                말 사진이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 사용법 안내 */}
        <div style={{ textAlign: 'center', color: '#D3CAB8', maxWidth: '600px' }}>
          <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '1.5rem' }}>
            사용법
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>• 마우스를 올리면 애니메이션이 일시정지됩니다</li>
            <li style={{ marginBottom: '10px' }}>• 개별 이미지에 마우스를 올리면 컬러로 변경됩니다</li>
            <li style={{ marginBottom: '10px' }}>• 양쪽 끝에서 페이드 효과가 적용됩니다</li>
            <li style={{ marginBottom: '10px' }}>• 무한 루프로 끊김 없이 스크롤됩니다</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MainCand4Page;
