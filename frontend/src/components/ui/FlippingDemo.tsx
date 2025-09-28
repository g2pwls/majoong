"use client";

import { useEffect, useState } from 'react';
import { getRecommendFarms, RecommendFarm } from '@/services/apiService';

const FlippingDemo = () => {
  const [farms, setFarms] = useState<RecommendFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);

  useEffect(() => {
    // Google Fonts 로드
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@200;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // 목장 데이터 로드
    loadFarms();

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const loadFarms = async () => {
    try {
      console.log('추천 목장 조회 시작');
      const farms = await getRecommendFarms();
      console.log('추천 목장 조회 성공:', farms);
      
      setFarms(farms.slice(0, 3)); // 최대 3개만 표시
    } catch (error) {
      console.error('목장 데이터 로드 실패:', error);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmSelect = (farmUuid: string) => {
    setSelectedFarm(selectedFarm === farmUuid ? null : farmUuid);
  };

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;600&display=swap');
        
        .flipping-demo {
          font-family: 'Oswald', sans-serif;
          background-color: #212121;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .flipping-demo section {
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .flipping-demo .row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
          min-height: 100vh;
          justify-content: center;
        }
        
        .flipping-demo .card {
          position: relative;
          height: 400px;
          width: 100%;
          max-width: 350px;
          margin: 10px 0;
          transition: ease all 2.3s;
          perspective: 1200px;
          flex: 1;
          min-width: 280px;
        }
        
        .flipping-demo .card:hover .cover {
          transform: rotateX(0deg) rotateY(-180deg);
        }
        
        .flipping-demo .card:hover .cover:before {
          transform: translateZ(30px);
        }
        
        .flipping-demo .card:hover .cover:after {
          background-color: black;
        }
        
        .flipping-demo .card:hover .cover h1 {
          transform: translateZ(100px);
        }
        
        .flipping-demo .card:hover .cover .price {
          transform: translateZ(60px);
        }
        
        .flipping-demo .card:hover .cover a {
          transform: translateZ(-60px) rotatey(-180deg);
          opacity: 1;
          visibility: visible;
        }
        
        .flipping-demo .cover {
          position: absolute;
          height: 100%;
          width: 100%;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }
        
        .flipping-demo .cover:before {
          content: '';
          position: absolute;
          border: 5px solid rgba(255,255,255,.5);
          box-shadow: 0 0 12px rgba(0,0,0,.3); 
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          z-index: 2;
          transition: ease all 2.3s;
          transform-style: preserve-3d;
          transform: translateZ(0px);
        }
        
        .flipping-demo .cover:after {
          content: '';
          position: absolute;
          top: 0px;
          left: 0px;
          right: 0px;
          bottom: 0px;
          z-index: 2;
          transition: ease all 1.3s;
          background: rgba(0,0,0,.4);
        }
        
        .flipping-demo .cover {
          background-image: var(--farm-image);
        }
        
        .flipping-demo .cover h1 {
          font-weight: 600;
          position: absolute;
          bottom: 55px;
          left: 50px;
          color: white;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          z-index: 3;
          font-size: 3em;
          transform: translateZ(0px);
          margin: 0;
          line-height: 1.2;
        }
        
        .flipping-demo .cover .price {
          font-weight: 200;
          position: absolute;
          top: 55px;
          right: 50px;
          color: white;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          z-index: 4;
          font-size: 2em;
          transform: translateZ(0px);
        }
        
        .flipping-demo .card-back {
          position: absolute;
          height: 100%;
          width: 100%;
          background: #0b0f08;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          transform: translateZ(-1px) rotateY(180deg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 20px;
          backface-visibility: hidden;
        }
        
        .flipping-demo .card-back a {
          transform-style: preserve-3d;
          transition: ease transform 2.3s, ease background .5s, ease opacity 2.3s, ease visibility 2.3s;
          transform: translateZ(-1px) rotatey(-180deg);
          background: transparent;
          border: 1px solid white;
          font-weight: 200;
          font-size: 1.3em;
          color: white;
          padding: 14px 32px;
          outline: none;
          text-decoration: none;
          cursor: pointer;
          display: inline-block;
          text-align: center;
          min-width: 150px;
          opacity: 0;
          visibility: hidden;
        }
        
        .flipping-demo .card-back a:hover {
          background-color: white;
          color: #0b0f08;
        }
        
        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .flipping-demo .row {
            flex-direction: column;
            align-items: center;
          }
          
          .flipping-demo .card {
            max-width: 100%;
            width: 100%;
          }
          
          .flipping-demo .cover h1 {
            font-size: 2.5em;
            bottom: 45px;
            left: 30px;
          }
          
          .flipping-demo .cover .price {
            font-size: 1.8em;
            top: 45px;
            right: 30px;
          }
        }
        
        @media (max-width: 480px) {
          .flipping-demo .cover h1 {
            font-size: 2em;
            bottom: 35px;
            left: 20px;
          }
          
          .flipping-demo .cover .price {
            font-size: 1.5em;
            top: 35px;
            right: 20px;
          }
        }
      `}</style>
      
      <div className="flipping-demo">
        <section>
          <div className="row">
            {loading ? (
              <div style={{ color: 'white', fontSize: '2em', textAlign: 'center' }}>
                목장 정보를 불러오는 중...
              </div>
            ) : (
              farms.map((farm, index) => (
                <div key={farm.farmUuid} className="card">
                  <div 
                    className="cover" 
                    style={{ 
                      '--farm-image': `url('${farm.profileImage || '/images/default-farm.jpg'}')` 
                    } as React.CSSProperties}
                  >
                    <h1>{farm.farmName}</h1>
                    <span className="price">신뢰도: {farm.totalScore}점</span>
                    <div style={{
                      position: 'absolute',
                      bottom: '30px',
                      left: '50px',
                      color: 'white',
                      fontSize: '0.9em',
                      opacity: 0.9,
                      zIndex: 3
                    }}>
                      🏠 {farm.address}
                    </div>
                    <div className="card-back">
                      <div style={{ 
                        padding: '20px', 
                        color: 'white', 
                        textAlign: 'center',
                        lineHeight: '1.6',
                        marginBottom: '20px'
                      }}>
                        <p style={{ marginBottom: '15px', fontSize: '1.1em' }}>
                          {farm.description}
                        </p>
                      </div>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleFarmSelect(farm.farmUuid);
                        }}
                        style={{
                          backgroundColor: selectedFarm === farm.farmUuid ? '#4CAF50' : 'transparent',
                          color: selectedFarm === farm.farmUuid ? '#0b0f08' : 'white'
                        }}
                      >
                        {selectedFarm === farm.farmUuid ? '✓ 선택됨' : '선택하기'}
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default FlippingDemo;
