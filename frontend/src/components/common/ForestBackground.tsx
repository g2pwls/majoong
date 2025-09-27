"use client";

import React from 'react';

interface ForestBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ForestBackground({ children, className = "" }: ForestBackgroundProps) {
  return (
    <div className={`forest-background-container ${className}`}>
      <div className="frame">
        <div className="layer" id="one"></div>
        <div className="layer" id="two"></div>
        <div className="layer" id="three"></div>
        <div className="layer" id="four"></div>
      </div>
      
      {children && (
        <div className="content">
          {children}
        </div>
      )}

      <style jsx>{`
        body {
          background: #1D1F20;
        }

        .forest-background-container {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100vw;
          height: 50vh;
          overflow: hidden;
          z-index: 1;
        }

        .layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 220px;
          background-color: transparent;
          background-position: 0px bottom;
          background-repeat: repeat-x;
        }

        .frame {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        #one {
          -webkit-filter: blur(2px);
          animation: slide 300s infinite;
          background-size: auto 150px;
          background-image: url('/images/forest-demo/forest-demo-1.png'); 
        }

        #two {
          -webkit-filter: blur(2px);
          animation: slide 200s infinite;
          background-image: url('/images/forest-demo/forest-demo-2.png'); 
        }

        #three {
          -webkit-filter: blur(1px);
          animation: slide 150s infinite;
          background-image: url('/images/forest-demo/forest-demo-3.png'); 
        }

        #four {
          animation: slide 100s infinite;
          background-image: url('/images/forest-demo/forest-demo-4.png'); 
        }

        @keyframes slide {
          0%   { background-position: 0px bottom; }
          100% { background-position: -1000px bottom; }
        }

        .content {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
