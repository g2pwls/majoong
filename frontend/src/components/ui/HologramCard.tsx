'use client';

import React, { useState, useRef } from 'react';

interface HologramCardProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

export default function HologramCard({
  imageUrl = "https://i.imgur.com/t1TBwxw.jpg",
  title,
  subtitle,
  description,
  width = 300,
  height = 420,
  className = "",
  onClick
}: HologramCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const h = rect.height;
    const w = rect.width;
    
    const lp = Math.abs(Math.floor(100 / w * x) - 100);
    const tp = Math.abs(Math.floor(100 / h * y) - 100);
    
    setBackgroundPosition(`${lp}% ${tp}%`);
    setIsActive(true);
  };

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`hologram-card ${isActive ? 'active' : ''} ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          '--bg-position': backgroundPosition
        } as React.CSSProperties}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {title && (
          <div className="card-content">
            <h3 className="card-title">{title}</h3>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
            {description && <p className="card-description">{description}</p>}
          </div>
        )}
      </div>

      <style jsx>{`
        .hologram-card {
          background-color: #211799;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          border-radius: 8px;
          box-shadow: 
            -3px -3px 3px 0 rgba(38, 230, 247, 0.6), 
            3px 3px 3px 0 rgba(247, 89, 228, 0.6), 
            0 0 6px 2px rgba(255, 231, 89, 0.6),
            0 35px 25px -15px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
          display: block;
          margin: 0;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .hologram-card:hover {
          transform: translateY(-5px) scale(1.02);
        }

        .hologram-card:before,
        .hologram-card:after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          top: 0;
          background-image: linear-gradient(
            115deg,
            transparent 0%,
            rgb(0, 231, 255) 30%,
            rgb(255, 0, 231) 70%,
            transparent 100%
          );
          background-position: 0% 0%;
          background-repeat: no-repeat;
          background-size: 300% 300%;
          mix-blend-mode: color-dodge;
          opacity: 0.2;
          z-index: 1;
          animation: holoGradient 15s ease infinite;
        }

        .hologram-card:after {
          background-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/13471/sparkles.gif");
          background-position: center;
          background-size: 180%;
          mix-blend-mode: color-dodge;
          opacity: 1;
          z-index: 2;
          animation: holoSparkle 20s ease infinite;
        }

        .hologram-card.active:before {
          opacity: 1;
          animation: none;
          transition: none;
          background-image: linear-gradient(
            115deg,
            transparent 0%,
            transparent 25%,
            rgba(0, 231, 255, 0.7) 45%,
            rgba(255, 0, 231, 0.7) 55%,
            transparent 70%,
            transparent 100%
          );
          background-position: var(--bg-position);
        }

        .card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.7) 50%,
            transparent 100%
          );
          padding: 20px;
          z-index: 3;
        }

        .card-title {
          color: white;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
        }

        .card-subtitle {
          color: #00e7ff;
          font-size: 14px;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .card-description {
          color: #ccc;
          font-size: 12px;
          margin: 0;
          line-height: 1.4;
        }

        @keyframes holoSparkle {
          0% { opacity: 0; }
          12% { opacity: 1; }
          70% { opacity: 0.5; }
          95% { opacity: 0.2; }
        }

        @keyframes holoGradient {
          3% { opacity: 0; }
          5% { background-position: 0% 0%; }
          7% { opacity: 0.5; }
          9% { background-position: 100% 100%; }
          11% { opacity: 0; }
          50% { 
            opacity: 0; 
            background-position: 100% 100%; 
          }
          55% { opacity: 0.3; }
          70% { 
            opacity: 0; 
            background-position: 0% 0%; 
          }
        }

        /* 반응형 디자인 */
        @media (max-width: 1024px) {
          .hologram-card {
            width: 220px !important;
            height: 308px !important;
            margin: 0;
          }
        }

        @media (max-width: 768px) {
          .hologram-card {
            width: 200px !important;
            height: 280px !important;
            margin: 0;
          }
        }

        @media (max-width: 480px) {
          .hologram-card {
            width: 180px !important;
            height: 252px !important;
            margin: 0;
          }
        }

        /* 마이페이지 탭 내에서의 추가 조정 */
        .hologram-card.compact {
          width: 100% !important;
          max-width: 280px !important;
          height: 392px !important;
          margin: 0 auto;
        }

        @media (min-width: 1024px) {
          .hologram-card.compact {
            width: 100% !important;
            max-width: 200px !important;
            height: 280px !important;
            margin: 0 auto;
          }
        }

        @media (max-width: 1023px) and (min-width: 640px) {
          .hologram-card.compact {
            width: 100% !important;
            max-width: 240px !important;
            height: 336px !important;
            margin: 0 auto;
          }
        }

        @media (max-width: 639px) {
          .hologram-card.compact {
            width: 100% !important;
            max-width: 280px !important;
            height: 392px !important;
            margin: 0 auto;
          }
        }
      `}</style>
    </>
  );
}
