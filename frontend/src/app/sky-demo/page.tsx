"use client";

import SkyBackground from '@/components/common/SkyBackground';
import ForestBackground from '@/components/common/ForestBackground';

export default function SkyDemoPage() {
  return (
    <SkyBackground>
      <div style={{ paddingTop: '50px', color: '#ffffff' }}>
        <h1 style={{ 
          fontSize: '3em', 
          marginBottom: '20px', 
          textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
        }}>
          안녕 혜진아
        </h1>
        <p style={{ 
          fontSize: '1.2em', 
          textShadow: '0 1px 2px rgba(0,0,0,0.3)' 
        }}>
          여기에 말이 뛰어 놀게 하자
        </p>
      </div>
    </SkyBackground>
  );
}
