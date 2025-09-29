// src/components/farm/report/HorseImageUpload.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parse } from "exifr";
import { validateImageDate } from "@/lib/gpsUtils";
import { FarmService } from "@/services/farmService";

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
  const router = useRouter();
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [dragOverType, setDragOverType] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult>>({});
  const [isVerifying, setIsVerifying] = useState<Record<string, boolean>>({});
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [originalFiles, setOriginalFiles] = useState<Record<string, Record<string, File>>>({});
  const [farmLocation, setFarmLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [specialRemarks, setSpecialRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 모달 관련 상태
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 모달 표시 함수
  const showModalMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // 성공 모달 닫기 함수
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  // 말 보고서 페이지로 이동
  const goToHorseReport = () => {
    router.push(`/farm/${farmUuid}/horse/${horseNo}`);
  };

  // 목장 위치 조회
  useEffect(() => {
    const fetchFarmLocation = async () => {
      try {
        setIsLoadingLocation(true);
        const location = await FarmService.getFarmLocation(farmUuid);
        setFarmLocation(location);
      } catch (error) {
        console.error('목장 위치 조회 실패:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    if (farmUuid) {
      fetchFarmLocation();
    }
  }, [farmUuid]);

  // 두 지점 간의 거리 계산 (Haversine 공식)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // 거리 (미터)
  };

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
    const imageTypes = ['front', 'side', 'back', 'barn'];
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
      showModalMessage(`${imageType} 이미지가 없습니다.`, 'warning');
      return;
    }

    // 목장 위치가 로드되지 않았으면 대기
    if (!farmLocation) {
      showModalMessage('목장 위치 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'warning');
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

      // 목장 위치와 이미지 위치 거리 계산
      const distance = calculateDistance(
        farmLocation.latitude,
        farmLocation.longitude,
        imageData.lat,
        imageData.lon
      );
      
      console.log('목장 위치:', farmLocation);
      console.log('이미지 위치:', { lat: imageData.lat, lon: imageData.lon });
      console.log('거리:', distance, '미터');

      // 1km(1000m) 허용 오차로 검증
      const isValidLocation = distance <= 1000;

      // 검증 결과 설정
      const isValid = isValidLocation && dateValidation.isValid;
      let message = '';
      
      if (isValid) {
        message = `✅ 위치 및 날짜 검증 성공!\n📍 거리: ${Math.round(distance)}m\n📅 ${dateValidation.message.split('! ')[1]}`;
      } else if (isValidLocation && !dateValidation.isValid) {
        message = `⚠️ 위치는 유효하지만 날짜 검증 실패\n📍 거리: ${Math.round(distance)}m\n📅 ${dateValidation.message}`;
      } else if (!isValidLocation && dateValidation.isValid) {
        message = `⚠️ 날짜는 유효하지만 위치 검증 실패\n📍 거리: ${Math.round(distance)}m (허용 거리: 1000m)\n📅 ${dateValidation.message.split('! ')[1]}`;
      } else {
        message = `❌ 위치 및 날짜 검증 모두 실패\n📍 거리: ${Math.round(distance)}m (허용 거리: 1000m)\n📅 ${dateValidation.message}`;
      }

      setVerificationResults(prev => ({
        ...prev,
        [imageType]: {
          isValid,
          distance: Math.round(distance),
          message,
          farmCoordinates: { lat: farmLocation.latitude, lon: farmLocation.longitude },
          imageCoordinates: { lat: imageData.lat, lon: imageData.lon },
          dateValidation
        }
      }));

      console.log(`${imageType} 이미지 검증 완료:`, {
        isValid,
        distance: Math.round(distance),
        message
      });
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

  // 말 관리 상태 제출
  const handleSubmit = async () => {
    if (!isAllImagesValidated()) {
      showModalMessage('모든 이미지 검증을 완료해주세요.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('말 관리 상태 제출 시작:', {
        farmUuid,
        horseNumber: horseNo,
        specialRemarks
      });

      // 원본 파일들 가져오기
      const horseFiles = originalFiles[horseNo] || {};
      
      await FarmService.uploadHorseManagementStatus(
        farmUuid,
        horseNo,
        {
          frontImage: horseFiles['front'],
          leftSideImage: horseFiles['side'],
          rightSideImage: horseFiles['back'],
          stableImage: horseFiles['barn'],
          content: specialRemarks.trim() || undefined
        }
      );

      // 성공 모달 표시
      setShowSuccessModal(true);
      
      // 제출 후 상태 초기화
      setSpecialRemarks('');
      setVerificationResults({});
      setOriginalFiles(prev => ({
        ...prev,
        [horseNo]: {}
      }));
      
    } catch (error) {
      console.error('말 관리 상태 제출 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '제출 중 오류가 발생했습니다.';
      showModalMessage(`제출 실패: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg bg-gray-100 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{hrNm} ({horseNo})</h3>
        
        {/* 목장 위치 정보 표시 */}
        <div className="text-sm text-gray-700">
          {isLoadingLocation ? (
            <span className="text-blue-600">📍 목장 위치 정보를 불러오는 중...</span>
          ) : farmLocation ? (
            <span className="text-green-600">
              📍 위도 {farmLocation.latitude.toFixed(6)}, 경도 {farmLocation.longitude.toFixed(6)}
            </span>
          ) : (
            <span className="text-red-600">❌ 목장 위치 정보를 불러올 수 없습니다.</span>
          )}
        </div>
      </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
         {["front", "side", "back", "barn"].map((view) => (
           <div key={view} className="flex flex-col items-center">
             <div
               className={`w-full max-w-60 h-40 bg-gray-300 border-dashed border-2 flex items-center justify-center cursor-pointer transition-all ${
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
             <label className="text-sm mt-2">
               {view === "front" ? "전면" : 
                view === "side" ? "좌측" : 
                view === "back" ? "우측" : "마구간"}
             </label>
             
              {/* 검증 결과 표시 */}
              {verificationResults[view] && (
                <div className={`text-xs mt-1 p-2 rounded ${
                  verificationResults[view].isValid 
                    ? 'bg-green-100 text-green-800' 
                    : verificationResults[view].message.includes('⚠️')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className="whitespace-pre-line">{verificationResults[view].message}</div>
                </div>
              )}
           </div>
         ))}
       </div>

        {/* 전체 검사 버튼 */}
        <div className="mt-3 flex justify-end">
          <button 
            onClick={() => verifyAllImages()}
            disabled={isVerifyingAll || getUploadedImageCount() === 0}
            className={`px-4 py-2 rounded disabled:bg-gray-400 ${
              getUploadedImageCount() === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : getUploadedImageCount() === 4 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isVerifyingAll ? '검사 중...' : `전체 검사 (${getUploadedImageCount()}/4)`}
          </button>
        </div>

      {/* Special Remarks */}
      <div className="mt-6">
        <label className="block text-sm font-medium">특이사항</label>
        <textarea 
          className="mt-1 block w-full h-30 rounded-md border-2 border-gray-300 p-2"
          value={specialRemarks}
          onChange={(e) => setSpecialRemarks(e.target.value)}
          placeholder="말의 특이사항이나 관리 상태에 대한 내용을 입력해주세요."
        />
      </div>

       {/* Submit Button */}
       <button 
         className={`mt-6 px-4 py-2 rounded-lg ml-auto block ${
           isAllImagesValidated() && !isSubmitting
             ? 'bg-[#7d6149] text-white hover:bg-[#91745A]' 
             : 'bg-gray-400 text-gray-200 cursor-not-allowed'
         }`}
         disabled={!isAllImagesValidated() || isSubmitting}
         onClick={handleSubmit}
       >
         {isSubmitting ? '제출 중...' : isAllImagesValidated() ? '제출' : '모든 이미지 검증 필요'}
       </button>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              {/* 아이콘 */}
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                modalType === 'success' ? 'bg-green-100' :
                modalType === 'error' ? 'bg-red-100' :
                modalType === 'warning' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                {modalType === 'success' && (
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {modalType === 'error' && (
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {modalType === 'warning' && (
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                {modalType === 'info' && (
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              {/* 메시지 */}
              <h3 className={`text-lg font-medium mb-2 ${
                modalType === 'success' ? 'text-green-900' :
                modalType === 'error' ? 'text-red-900' :
                modalType === 'warning' ? 'text-yellow-900' :
                'text-blue-900'
              }`}>
                {modalType === 'success' ? '성공' :
                 modalType === 'error' ? '오류' :
                 modalType === 'warning' ? '경고' :
                 '알림'}
              </h3>
              
              <p className={`text-sm mb-6 whitespace-pre-line ${
                modalType === 'success' ? 'text-green-700' :
                modalType === 'error' ? 'text-red-700' :
                modalType === 'warning' ? 'text-yellow-700' :
                'text-blue-700'
              }`}>
                {modalMessage}
              </p>
              
              {/* 버튼 */}
              <button
                onClick={closeModal}
                className={`w-full px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  modalType === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                  modalType === 'error' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                  modalType === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
                  'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-white/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              {/* 성공 아이콘 */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* 제목 */}
              <h3 className="text-lg font-medium text-green-900 mb-2">
                제출 완료!
              </h3>
              
              {/* 메시지 */}
              <p className="text-sm text-green-700 mb-6">
                말 관리 상태가 성공적으로 제출되었습니다!<br/>
                주간 보고서가 생성되어 말 상세 페이지에서 확인할 수 있습니다.
              </p>
              
              {/* 버튼들 */}
              <div className="flex space-x-3">
                <button
                  onClick={closeSuccessModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  닫기
                </button>
                <button
                  onClick={goToHorseReport}
                  className="flex-1 px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  보고서 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
