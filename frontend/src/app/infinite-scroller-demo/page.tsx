'use client';

import React from 'react';
import InfiniteScroller from '@/components/ui/InfiniteScroller';

const PORTRAIT_IMAGES = [
  "https://assets.codepen.io/16327/portrait-number-1.png",
  "https://assets.codepen.io/16327/portrait-number-2.png",
  "https://assets.codepen.io/16327/portrait-number-3.png",
  "https://assets.codepen.io/16327/portrait-number-4.png",
  "https://assets.codepen.io/16327/portrait-number-5.png",
];

export default function InfiniteScrollerDemoPage() {
  return (
    <div className="min-h-screen">
      <InfiniteScroller images={PORTRAIT_IMAGES} />
    </div>
  );
}
