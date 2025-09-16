// src/components/farm/report/HorseImageUpload.tsx
"use client";

import { useState } from "react";

type HorseImageUploadProps = {
  horseNo: string;
  hrNm: string;
  imageData: Record<string, Record<string, string>>;
  onImageUpload: (horseNo: string, imageType: string, file: File) => void;
  onImageSwap?: (horseNo: string, fromType: string, toType: string) => void;
};

export default function HorseImageUpload({ 
  horseNo, 
  hrNm, 
  imageData, 
  onImageUpload,
  onImageSwap
}: HorseImageUploadProps) {
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [dragOverType, setDragOverType] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, view: string) => {
    if (imageData[horseNo]?.[view]) {
      setDraggedType(view);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent, view: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverType(view);
  };

  const handleDragLeave = () => {
    setDragOverType(null);
  };

  const handleDrop = (e: React.DragEvent, targetView: string) => {
    e.preventDefault();
    setDragOverType(null);
    
    if (draggedType && draggedType !== targetView && onImageSwap) {
      onImageSwap(horseNo, draggedType, targetView);
    }
    setDraggedType(null);
  };

  const handleFileDrop = (e: React.DragEvent, view: string) => {
    e.preventDefault();
    setDragOverType(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onImageUpload(horseNo, view, files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, view: string) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(horseNo, view, e.target.files[0]);
    }
  };

  return (
    <div className="border p-4 rounded-lg bg-gray-100 mb-4">
      <h3 className="text-lg font-semibold">{hrNm} ({horseNo})</h3>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {["front", "side", "back"].map((view) => (
          <div key={view} className="flex flex-col items-center">
            <div
              className={`w-70 h-50 bg-gray-300 border-dashed border-2 flex items-center justify-center cursor-pointer transition-all ${
                dragOverType === view ? 'border-blue-500 bg-blue-50' : ''
              } ${imageData[horseNo]?.[view] ? 'border-solid' : ''}`}
              style={{
                backgroundImage: `url(${imageData[horseNo]?.[view] || ''})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
              onClick={() => document.getElementById(`file-${horseNo}-${view}`)?.click()}
              draggable={!!imageData[horseNo]?.[view]}
              onDragStart={(e) => handleDragStart(e, view)}
              onDragOver={(e) => handleDragOver(e, view)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                if (e.dataTransfer.files.length > 0) {
                  handleFileDrop(e, view);
                } else {
                  handleDrop(e, view);
                }
              }}
            >
              {!imageData[horseNo]?.[view] && (
                <div className="text-center">
                  <span className="text-xs text-gray-600 block">클릭 또는 드래그하여</span>
                  <span className="text-xs text-gray-600 block">업로드</span>
                </div>
              )}
            </div>
            <input
              id={`file-${horseNo}-${view}`}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInput(e, view)}
              className="mt-2 hidden"
            />
            <label className="text-sm mt-2">{view === "front" ? "전면" : view === "side" ? "측면" : "후면"}</label>
          </div>
        ))}
      </div>

      {/* 상단 3뷰 검사 버튼 (우하단 정렬) */}
      <div className="mt-3 flex justify-end">
        <button className="px-4 py-2 bg-gray-200 rounded">검사</button>
      </div>

      {/* Barn Image Upload */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">마구간</label>
        <div
          className={`w-full h-60 bg-gray-300 border-dashed border-2 flex items-center justify-center cursor-pointer transition-all ${
            dragOverType === 'barn' ? 'border-blue-500 bg-blue-50' : ''
          } ${imageData[horseNo]?.barn ? 'border-solid' : ''}`}
          style={{
            backgroundImage: `url(${imageData[horseNo]?.barn || ''})`,
            backgroundSize: 'cover',
          }}
          onClick={() => document.getElementById(`file-${horseNo}-barn`)?.click()}
          onDragOver={(e) => handleDragOver(e, 'barn')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleFileDrop(e, 'barn')}
        >
          {!imageData[horseNo]?.barn && (
            <div className="text-center">
              <span className="text-sm text-gray-600 block">클릭 또는 드래그하여</span>
              <span className="text-sm text-gray-600 block">업로드</span>
            </div>
          )}
        </div>
        <input
          id={`file-${horseNo}-barn`}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileInput(e, 'barn')}
          className="mt-2 hidden"
        />
        <div className="mt-3 flex justify-end">
          <button className="px-4 py-2 bg-gray-200 rounded">검사</button>
        </div>
      </div>

      {/* Special Remarks */}
      <div className="mt-6">
        <label className="block text-sm font-medium">특이사항 (수정 불가)</label>
        <textarea className="mt-1 block w-full h-30 rounded-md border-2 border-gray-300" />

      </div>

      {/* Submit Button */}
<button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg ml-auto block">
  제출
</button>

    </div>
  );
}
