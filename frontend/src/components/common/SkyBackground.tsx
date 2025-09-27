'use client';

import React from 'react';

interface SkyBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function SkyBackground({ children, className = '' }: SkyBackgroundProps) {
  return (
    <div className={`sky-background-container ${className}`}>
      <div className="clouds">
        <div className="clouds-1"></div>
        <div className="clouds-3"></div>
      </div>
      
      <div className="content">
        {children}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css?family=Oswald');

        /* Animation & keyframes */
        @keyframes clouds-loop-1 {
          to { background-position: -1000px 0; }
        }

        @keyframes clouds-loop-2 {
          to { background-position: -1000px 0; }
        }

        @keyframes clouds-loop-3 {
          to { background-position: -1579px 0; }
        }

        .sky-background-container {
          font-family: 'Oswald', sans-serif;
          height: 50vh;
          padding: 0;
          margin: 0;
          background: linear-gradient(#8FD9FB, #82C8E5);
          text-align: center;
          vertical-align: middle;
          position: relative;
          overflow: hidden;
        }

        .sky-background-container.h-screen {
          height: 100vh !important;
        }

        .content {
          position: relative;
          z-index: 10;
        }
          
        .clouds {
          opacity: 0.9;
          pointer-events: none;
          position: absolute;
          overflow: hidden;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
        }  
          
        .clouds-1,
        .clouds-2,
        .clouds-3 {
          background-repeat: repeat-x;
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 500px;
        }

        .clouds-1 {
          background-image: url('https://s.cdpn.io/15514/clouds_2.png');
          animation: clouds-loop-1 20s infinite linear;
        }

        .clouds-2 {
          background-image: url('https://s.cdpn.io/15514/clouds_1.png');
          animation: clouds-loop-2 15s infinite linear;
        }

        .clouds-3 {
          background-image: url('https://s.cdpn.io/15514/clouds_3.png');
          animation: clouds-loop-3 17s infinite linear;
        }
      `}</style>
    </div>
  );
}
