"use client";

import React from 'react';

interface FlipperCard {
  id: string;
  title: string;
  score: string;
  image: string;
  backDescription?: string;
  backAddress?: string;
}

interface FlipperProps {
  cards?: FlipperCard[];
}

const Flipper: React.FC<FlipperProps> = ({ 
  cards = [
    {
      id: '1',
      title: 'Little\nBonsai',
      score: '38.2℃',
      image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=600&q=80',
      backDescription: 'Little\nBonsai',
      backAddress: 'Premium\nQuality'
    },
    {
      id: '2',
      title: 'Tropical\nLeaf',
      score: '38.2℃',
      image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=600&q=80',
      backDescription: 'Tropical\nLeaf',
      backAddress: 'Natural\nFresh'
    },
    {
      id: '3',
      title: 'Marijuana\nChill',
      score: '38.2℃',
      image: 'https://images.unsplash.com/photo-1525945518069-b924046d1385?auto=format&fit=crop&w=600&q=80',
      backDescription: 'Marijuana\nChill',
      backAddress: 'Pure\nEssence'
    }
  ]
}) => {
  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;600&display=swap');
        
        .flipper-container {
          font-family: 'Oswald', sans-serif;
          background-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .flipper-section {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
          justify-content: center;
        }
        
        .flipper-card {
          position: relative;
          height: 300px;
          width: 450px;
          margin: 10px 0;
          transition: ease all 2.3s;
          perspective: 1200px;
        }
        
        .flipper-card:hover .flipper-cover {
          transform: rotateX(0deg) rotateY(-180deg);
        }
        
        .flipper-card:hover .flipper-cover:before {
          transform: translateZ(30px);
        }
        
        .flipper-card:hover .flipper-cover:after {
          background-color: black;
        }
        
        .flipper-card:hover .flipper-cover h1 {
          transform: translateZ(100px);
        }
        
        .flipper-card:hover .flipper-cover .flipper-score {
          transform: translateZ(60px);
        }
        
        
        .flipper-card:hover .flipper-card-back-description {
          transform: translateZ(80px);
        }
        
        .flipper-card:hover .flipper-card-back-address {
          transform: translateZ(100px);
        }
        
        .flipper-cover {
          position: absolute;
          height: 100%;
          width: 100%;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          backface-visibility: hidden;
        }
        
        .flipper-cover:before {
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
        
        .flipper-cover:after {
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
        
        .flipper-cover h1 {
          font-weight: 600;
          position: absolute;
          bottom: 55px;
          left: 50px;
          color: white;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          z-index: 3;
          font-size: 1.5em;
          transform: translateZ(0px);
          margin: 0;
          line-height: 1.2;
          white-space: pre-line;
          backface-visibility: hidden;
        }
        
        .flipper-score {
          font-weight: 200;
          position: absolute;
          top: 55px;
          right: 50px;
          color: white;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          z-index: 4;
          font-size: 1.6em;
          transform: translateZ(0px);
          backface-visibility: hidden;
        }
        
        .flipper-card-back {
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
          gap: 40px;
          backface-visibility: hidden;
        }
        
        .flipper-card-back-description {
          font-weight: normal;
          color: white;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          z-index: 3;
          font-size: 1rem;
          transform: translateZ(0px);
          margin: 0;
          line-height: 1.2;
          white-space: pre-line;
          text-align: center;
          margin-bottom: 10px;
          padding: 0 20px;
          max-width: 100%;
          word-wrap: break-word;
          backface-visibility: hidden;
        }
        
        
        .flipper-card-back-address {
          font-weight: normal;
          color: #ffd700;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          z-index: 3;
          font-size: 1rem;
          transform: translateZ(0px);
          margin: 0;
          line-height: 1.2;
          white-space: pre-line;
          text-align: center;
          margin-bottom: 20px;
          padding: 0 20px;
          max-width: 100%;
          word-wrap: break-word;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
          backface-visibility: hidden;
        }
        
        
        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .flipper-section {
            flex-direction: column;
            align-items: center;
          }
          
          .flipper-card {
            height: 240px;
            width: 360px;
          }
          
          .flipper-cover h1 {
            font-size: 1.5em;
            bottom: 45px;
            left: 30px;
          }
          
          .flipper-score {
            font-size: 1.4em;
            top: 45px;
            right: 30px;
          }
          
          .flipper-card-back-description {
            font-size: 1rem;
            padding: 0 15px;
          }
          
          
          .flipper-card-back-address {
            font-size: 1rem;
            padding: 0 15px;
          }
        }
        
        @media (max-width: 480px) {
          .flipper-card {
            height: 180px;
            width: 270px;
          }
          
          .flipper-cover h1 {
            font-size: 1.5em;
            bottom: 35px;
            left: 20px;
          }
          
          .flipper-score {
            font-size: 1.2em;
            top: 35px;
            right: 20px;
          }
          
          .flipper-card-back-description {
            font-size: 1rem;
            padding: 0 10px;
          }
          
          
          .flipper-card-back-address {
            font-size: 1rem;
            padding: 0 10px;
          }
        }
        
        .flipper-instruction {
          text-align: center;
          margin-top: 16px;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
      
      <div className="flipper-container">
        <section className="flipper-section">
          {cards.map((card) => (
            <div key={card.id}>
              <div className="flipper-card">
                <div 
                  className="flipper-cover" 
                  style={{ 
                    backgroundImage: `url('${card.image}')` 
                  }}
                >
                  <h1>{card.title}</h1>
                  <span className="flipper-score">{card.score}</span>
                  <div className="flipper-card-back">
                    {card.backDescription && (
                      <h2 className="flipper-card-back-description">{card.backDescription}</h2>
                    )}
                    {card.backAddress && (
                      <div className="flipper-card-back-address">{card.backAddress}</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flipper-instruction">
                마우스를 올리면 뒤집어서 상세 정보를 확인할 수 있습니다
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
};

export default Flipper;
