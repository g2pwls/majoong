// src/components/farm/report/HorseImageUpload.tsx
"use client";

import { useState } from "react";
import { parse } from "exifr";
import { validateImageDate } from "@/lib/gpsUtils";

type HorseImageUploadProps = {
  horseNo: string;
  hrNm: string;
  farmUuid: string;
  imageData: Record<string, Record<string, string>>;
  onImageUpload: (horseNo: string, imageType: string, file: File) => void;
  onImageSwap?: (horseNo: string, fromType: string, toType: string) => void;
};

type VerificationResult = {
  isValid: boolean;
  distance: number;
  message: string;
  farmCoordinates?: { lat: number; lon: number };
  imageCoordinates?: { lat: number; lon: number };
  dateValidation?: {
    isValid: boolean;
    message: string;
  };
};

export default function HorseImageUpload({ 
  horseNo, 
  hrNm, 
  farmUuid,
  imageData, 
  onImageUpload,
  onImageSwap
}: HorseImageUploadProps) {
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [dragOverType, setDragOverType] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult>>({});
  const [isVerifying, setIsVerifying] = useState<Record<string, boolean>>({});
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [originalFiles, setOriginalFiles] = useState<Record<string, Record<string, File>>>({});

  // 모든 이미지가 업로드되고 검증되었는지 확인
  const isAllImagesValidated = () => {
    const imageTypes = ['front', 'side', 'back', 'barn'];
    const uploadedImages = imageTypes.filter(type => imageData[horseNo]?.[type]);
    
    // 업로드된 이미지가 없으면 false
    if (uploadedImages.length === 0) return false;
    
    // 모든 업로드된 이미지가 검증되었고 성공했는지 확인
    return uploadedImages.every(type => 
      verificationResults[type]?.isValid === true
    );
  };

  // 업로드된 이미지 개수 확인 (전체 검사 버튼용)
  const getUploadedImageCount = () => {
    const imageTypes = ['front', 'side', 'back'];
    return imageTypes.filter(type => imageData[horseNo]?.[type]).length;
  };

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
      const file = files[0];
      
      // 원본 파일 저장
      setOriginalFiles(prev => ({
        ...prev,
        [horseNo]: {
          ...prev[horseNo],
          [view]: file
        }
      }));
      
      onImageUpload(horseNo, view, file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, view: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 원본 파일 저장
      setOriginalFiles(prev => ({
        ...prev,
        [horseNo]: {
          ...prev[horseNo],
          [view]: file
        }
      }));
      
      onImageUpload(horseNo, view, file);
    }
  };

  // EXIF 데이터에서 GPS 정보와 날짜 정보 추출
  const extractImageData = async (file: File): Promise<{ lat: number; lon: number; date: Date } | null> => {
    try {
      console.log('이미지 파일에서 메타데이터 추출 시작:', file.name, '파일 크기:', file.size);
      
      // exifr을 사용하여 EXIF 데이터 추출
      const exifData = await parse(file, { 
        gps: true,
        exif: true,
        iptc: true,
        icc: true,
        jfif: true,
        ihdr: true
      });
      
      console.log('추출된 EXIF 데이터:', exifData);
      
      if (!exifData) {
        console.log('EXIF 데이터가 없습니다.');
        return null;
      }
      
      // GPS 좌표와 날짜 정보 확인
      if (exifData.latitude && exifData.longitude && exifData.DateTimeOriginal) {
        console.log('GPS 좌표와 날짜 발견:', {
          latitude: exifData.latitude,
          longitude: exifData.longitude,
          dateTime: exifData.DateTimeOriginal
        });
        
        return {
          lat: exifData.latitude,
          lon: exifData.longitude,
          date: new Date(exifData.DateTimeOriginal)
        };
      }
      
      console.log('GPS 좌표 또는 날짜 정보가 없습니다.');
      return null;
      
    } catch (error) {
      console.error('메타데이터 추출 중 오류:', error);
      return null;
    }
  };

  // GPS 위치 검증
  const verifyLocation = async (imageType: string) => {
    const originalFile = originalFiles[horseNo]?.[imageType];
    if (!originalFile) {
      alert(`${imageType} 이미지가 없습니다.`);
      return;
    }

     try {
       setIsVerifying(prev => ({ ...prev, [imageType]: true }));
       console.log(`${imageType} 이미지 검증 시작`);
       console.log('원본 파일:', originalFile);

      // 원본 파일에서 직접 메타데이터 추출
      const imageData = await extractImageData(originalFile);
      console.log(`${imageType} 이미지에서 추출된 메타데이터:`, imageData);
      
      if (!imageData) {
        console.log(`${imageType} 이미지에서 메타데이터를 찾을 수 없음`);
        setVerificationResults(prev => ({
          ...prev,
          [imageType]: {
            isValid: false,
            distance: 0,
            message: "❌ 이미지에서 메타데이터를 찾을 수 없습니다."
          }
        }));
        return;
      }

      // 날짜 검증
      const dateValidation = validateImageDate(imageData.date);
      console.log(`${imageType} 이미지 날짜 검증 결과:`, dateValidation);

      // 서버에 위치 검증 요청
      const verifyResponse = await fetch('/api/verify-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          farmUuid,
          imageLat: imageData.lat,
          imageLon: imageData.lon,
          tolerance: 1000 // 1km 허용 오차
        }),
      });

      const result = await verifyResponse.json();
      
      if (result.success) {
        // 위치 검증과 날짜 검증 결과를 결합
        const combinedResult = {
          ...result.result,
          dateValidation,
          isValid: result.result.isValid && dateValidation.isValid,
          message: `${result.result.message}\n${dateValidation.message}`
        };
        
        setVerificationResults(prev => ({
          ...prev,
          [imageType]: combinedResult
        }));
      } else {
        setVerificationResults(prev => ({
          ...prev,
          [imageType]: {
            isValid: false,
            distance: 0,
            message: `❌ 위치 검증 실패: ${result.error}\n${dateValidation.message}`,
            dateValidation
          }
        }));
      }
    } catch (error) {
      console.error('위치 검증 오류:', error);
      setVerificationResults(prev => ({
        ...prev,
        [imageType]: {
          isValid: false,
          distance: 0,
          message: "❌ 위치 검증 중 오류가 발생했습니다."
        }
      }));
     } finally {
       setIsVerifying(prev => ({ ...prev, [imageType]: false }));
     }
  };

  // 모든 이미지 검증
  const verifyAllImages = async () => {
    setIsVerifyingAll(true);
    try {
      const imageTypes = ['front', 'side', 'back', 'barn'];
      const promises = imageTypes
        .filter(type => imageData[horseNo]?.[type])
        .map(type => verifyLocation(type));
      
      await Promise.all(promises);
    } finally {
      setIsVerifyingAll(false);
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
              } ${imageData[horseNo]?.[view] ? 'border-solid' : ''} ${
                verificationResults[view]?.isValid ? 'border-green-500' : 
                verificationResults[view]?.isValid === false ? 'border-red-500' : ''
              }`}
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
            <label className="text-sm mt-2">{view === "front" ? "전면" : view === "side" ? "좌측" : "우측"}</label>
            
             {/* 검증 결과 표시 */}
             {verificationResults[view] && (
               <div className={`text-xs mt-1 p-2 rounded ${
                 verificationResults[view].isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
               }`}>
                 <div className="whitespace-pre-line">{verificationResults[view].message}</div>
               </div>
             )}
          </div>
        ))}
      </div>

       {/* 상단 3뷰 검사 버튼 */}
       <div className="mt-3 flex justify-end">
         <button 
           onClick={() => verifyAllImages()}
           disabled={isVerifyingAll || getUploadedImageCount() === 0}
           className={`px-4 py-2 rounded disabled:bg-gray-400 ${
             getUploadedImageCount() === 0 
               ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
               : getUploadedImageCount() === 3 
                 ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                 : 'bg-gray-400 text-gray-600 cursor-not-allowed'
           }`}
         >
           {isVerifyingAll ? '검사 중...' : `전체 검사 (${getUploadedImageCount()}/3)`}
         </button>
       </div>

      {/* Barn Image Upload */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">마구간</label>
        <div
          className={`w-full h-60 bg-gray-300 border-dashed border-2 flex items-center justify-center cursor-pointer transition-all ${
            dragOverType === 'barn' ? 'border-blue-500 bg-blue-50' : ''
          } ${imageData[horseNo]?.barn ? 'border-solid' : ''} ${
            verificationResults['barn']?.isValid ? 'border-green-500' : 
            verificationResults['barn']?.isValid === false ? 'border-red-500' : ''
          }`}
          style={{
            backgroundImage: `url(${imageData[horseNo]?.barn || ''})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
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
        
         {/* 마구간 검증 결과 표시 */}
         {verificationResults['barn'] && (
           <div className={`text-xs mt-2 p-2 rounded ${
             verificationResults['barn'].isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
           }`}>
             <div className="whitespace-pre-line">{verificationResults['barn'].message}</div>
           </div>
         )}
        
         <div className="mt-3 flex justify-end">
           <button 
             onClick={() => verifyLocation('barn')}
             disabled={isVerifying['barn'] || !imageData[horseNo]?.barn}
             className="px-4 py-2 bg-gray-200 rounded disabled:bg-gray-400 text-gray-500"
           >
             {isVerifying['barn'] ? '검사 중...' : '마구간 검사'}
           </button>
         </div>
      </div>

      {/* Special Remarks */}
      <div className="mt-6">
        <label className="block text-sm font-medium">특이사항 (수정 불가)</label>
        <textarea className="mt-1 block w-full h-30 rounded-md border-2 border-gray-300" />

      </div>

       {/* Submit Button */}
       <button 
         className={`mt-6 px-4 py-2 rounded-lg ml-auto block ${
           isAllImagesValidated() 
             ? 'bg-blue-600 text-white hover:bg-blue-700' 
             : 'bg-gray-400 text-gray-200 cursor-not-allowed'
         }`}
         disabled={!isAllImagesValidated()}
         onClick={() => {
           if (isAllImagesValidated()) {
             alert('제출되었습니다!');
           }
         }}
       >
         {isAllImagesValidated() ? '제출' : '모든 이미지 검증 필요'}
       </button>

    </div>
  );
}
