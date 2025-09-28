"use client";

import React from 'react';

interface FlipperCard {
  id: string;
  title: string;
  price: string;
  image: string;
  actions?: Array<{
    label: string;
    href: string;
    onClick?: () => void;
  }>;
}

interface FlipperProps {
  cards?: FlipperCard[];
}

const Flipper: React.FC<FlipperProps> = ({ 
  cards = [
    {
      id: '1',
      title: 'Little\nBonsai',
      price: '$79',
      image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=600&q=80',
      actions: [
        { label: 'Add to cart', href: '#' },
        { label: 'View detail', href: '#' }
      ]
    },
    {
      id: '2',
      title: 'Tropical\nLeaf',
      price: '$35',
      image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=600&q=80',
      actions: [
        { label: 'Add to cart', href: '#' }
      ]
    },
    {
      id: '3',
      title: 'Marijuana\nChill',
      price: '$155',
      image: 'https://images.unsplash.com/photo-1525945518069-b924046d1385?auto=format&fit=crop&w=600&q=80',
      actions: [
        { label: 'Add to cart', href: '#' }
      ]
    }
  ]
}) => {
  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;600&display=swap');
        
        .flipper-container {
          font-family: 'Oswald', sans-serif;
          background-color: #212121;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .flipper-section {
          width: 90%;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .flipper-row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
          min-height: 100vh;
          justify-content: center;
        }
        
        .flipper-card {
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
        
        .flipper-card:hover .flipper-cover .flipper-price {
          transform: translateZ(60px);
        }
        
        .flipper-card:hover .flipper-card-back a {
          transform: translateZ(-60px) rotatey(-180deg);
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
          font-size: 3em;
          transform: translateZ(0px);
          margin: 0;
          line-height: 1.2;
          white-space: pre-line;
        }
        
        .flipper-price {
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
        
        .flipper-card-back {
          position: absolute;
          height: 100%;
          width: 100%;
          background: #0b0f08;
          transform-style: preserve-3d;
          transition: ease all 2.3s;
          transform: translateZ(-1px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 20px;
        }
        
        .flipper-card-back a {
          transform-style: preserve-3d;
          transition: ease transform 2.3s, ease background .5s;
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
        }
        
        .flipper-card-back a:hover {
          background-color: white;
          color: #0b0f08;
        }
        
        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .flipper-row {
            flex-direction: column;
            align-items: center;
          }
          
          .flipper-card {
            max-width: 100%;
            width: 100%;
          }
          
          .flipper-cover h1 {
            font-size: 2.5em;
            bottom: 45px;
            left: 30px;
          }
          
          .flipper-price {
            font-size: 1.8em;
            top: 45px;
            right: 30px;
          }
        }
        
        @media (max-width: 480px) {
          .flipper-cover h1 {
            font-size: 2em;
            bottom: 35px;
            left: 20px;
          }
          
          .flipper-price {
            font-size: 1.5em;
            top: 35px;
            right: 20px;
          }
        }
      `}</style>
      
      <div className="flipper-container">
        <section className="flipper-section">
          <div className="flipper-row">
            {cards.map((card) => (
              <div key={card.id} className="flipper-card">
                <div 
                  className="flipper-cover" 
                  style={{ 
                    backgroundImage: `url('${card.image}')` 
                  }}
                >
                  <h1>{card.title}</h1>
                  <span className="flipper-price">{card.price}</span>
                  <div className="flipper-card-back">
                    {card.actions?.map((action, index) => (
                      <a
                        key={index}
                        href={action.href}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Flipper;
