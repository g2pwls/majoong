// GPS 좌표 변환 및 거리 계산 유틸리티


/**
 * 두 GPS 좌표 간의 거리를 계산 (Haversine 공식)
 * @param lat1 첫 번째 지점의 위도
 * @param lon1 첫 번째 지점의 경도
 * @param lat2 두 번째 지점의 위도
 * @param lon2 두 번째 지점의 경도
 * @returns 거리 (미터)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 지구 반지름 (미터)
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * 각도를 라디안으로 변환
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 이미지 촬영 날짜 검증 (이번 주의 금요일, 토요일, 일요일 여부 확인)
 * @param imageDate 이미지의 촬영 날짜
 * @returns 검증 결과
 */
export function validateImageDate(imageDate: Date): {
  isValid: boolean;
  message: string;
} {
  const dayOfWeek = imageDate.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = dayNames[dayOfWeek];
  const imageDateStr = imageDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // 현재 날짜
  const now = new Date();
  const isFutureDate = imageDate > now;
  
  // 이번 주의 금요일, 토요일, 일요일인지 확인
  const isThisWeekend = isThisWeekFridaySaturdaySunday(imageDate, now);
  
  let message = '';
  if (isFutureDate) {
    message = `❌ 촬영 날짜 검증 실패! ${imageDateStr} (${dayName})는 미래 날짜입니다.`;
  } else if (isThisWeekend) {
    message = `✅ 촬영 날짜 검증 성공! ${imageDateStr} (${dayName}) 촬영된 사진입니다. (이번 주 주말)`;
  } else {
    message = `❌ 촬영 날짜 검증 실패! ${imageDateStr} (${dayName})는 이번 주 주말이 아닙니다. (이번 주 금요일, 토요일, 일요일만 허용)`;
  }
  
  return {
    isValid: isThisWeekend && !isFutureDate,
    message
  };
}

/**
 * 해당 날짜가 이번 주의 금요일, 토요일, 일요일인지 확인
 * @param targetDate 확인할 날짜
 * @param currentDate 현재 날짜 (기본값: new Date())
 * @returns 이번 주 주말 여부
 */
function isThisWeekFridaySaturdaySunday(targetDate: Date, currentDate: Date = new Date()): boolean {
  // 현재 날짜의 주 시작일 (월요일) 계산
  const currentWeekStart = new Date(currentDate);
  currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // 월요일로 설정
  currentWeekStart.setHours(0, 0, 0, 0);
  
  // 현재 날짜의 주 종료일 (일요일) 계산
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // 일요일로 설정
  currentWeekEnd.setHours(23, 59, 59, 999);
  
  // 대상 날짜가 이번 주 범위에 있는지 확인
  const isInThisWeek = targetDate >= currentWeekStart && targetDate <= currentWeekEnd;
  
  // 이번 주 범위에 있고, 금요일(5), 토요일(6), 일요일(0) 중 하나인지 확인
  const dayOfWeek = targetDate.getDay();
  const isWeekendDay = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
  
  return isInThisWeek && isWeekendDay;
}

/**
 * GPS 위치 검증
 * @param imageLat 이미지의 위도
 * @param imageLon 이미지의 경도
 * @param farmLat 농장의 위도
 * @param farmLon 농장의 경도
 * @param tolerance 허용 오차 (미터, 기본값: 1000m)
 * @param farmName 농장 이름 (선택사항)
 * @returns 검증 결과
 */
export function validateGpsLocation(
  imageLat: number,
  imageLon: number,
  farmLat: number,
  farmLon: number,
  tolerance: number = 1000,
  farmName?: string
): {
  isValid: boolean;
  distance: number;
  message: string;
} {
  const distance = calculateDistance(imageLat, imageLon, farmLat, farmLon);
  const isValid = distance <= tolerance;
  
  const farmDisplayName = farmName || '목장';
  
  let message = '';
  if (isValid) {
    message = `✅ 위치 검증 성공! ${farmDisplayName}과의 거리: ${Math.round(distance)}m`;
  } else {
    message = `❌ 위치 검증 실패! ${farmDisplayName}과의 거리: ${Math.round(distance)}m (허용 범위: ${tolerance}m)`;
  }
  
  return {
    isValid,
    distance,
    message
  };
}

/**
 * EXIF 데이터에서 GPS 정보 추출
 * @param exifData EXIF 데이터 객체
 * @returns GPS 좌표 또는 null
 */
export function extractGpsFromExif(exifData: any): { lat: number; lon: number } | null {
  try {
    console.log('EXIF 데이터:', exifData);
    console.log('EXIF 데이터 키들:', Object.keys(exifData));
    
    // GPS 섹션 찾기
    let gps = exifData.GPS;
    
    // GPS 섹션이 없으면 다른 방법으로 찾기
    if (!gps) {
      console.log('GPS 섹션을 찾을 수 없음, 다른 방법으로 시도...');
      
      // GPS 관련 키들 찾기
      const gpsKeys = Object.keys(exifData).filter(key => 
        key.includes('GPS') || key.includes('gps') || key.includes('Latitude') || key.includes('Longitude')
      );
      console.log('GPS 관련 키들:', gpsKeys);
      
      // GPS 데이터가 직접 EXIF에 있는지 확인
      if (exifData.GPSLatitude && exifData.GPSLongitude) {
        gps = {
          GPSLatitude: exifData.GPSLatitude,
          GPSLongitude: exifData.GPSLongitude,
          GPSLatitudeRef: exifData.GPSLatitudeRef,
          GPSLongitudeRef: exifData.GPSLongitudeRef
        };
        console.log('직접 GPS 데이터 발견:', gps);
      }
    }
    
    if (!gps) {
      console.log('GPS 데이터가 없습니다.');
      return null;
    }
    
    console.log('GPS 데이터:', gps);
    console.log('GPS 데이터 키들:', Object.keys(gps));
    
    // GPS 좌표가 배열 형태로 있는지 확인
    if (!gps.GPSLatitude || !gps.GPSLongitude || !gps.GPSLatitudeRef || !gps.GPSLongitudeRef) {
      console.log('GPS 좌표 데이터가 불완전합니다:', {
        GPSLatitude: gps.GPSLatitude,
        GPSLongitude: gps.GPSLongitude,
        GPSLatitudeRef: gps.GPSLatitudeRef,
        GPSLongitudeRef: gps.GPSLongitudeRef
      });
      return null;
    }
    
    // GPS 좌표를 십진도로 변환
    const lat = convertDMSToDD(gps.GPSLatitude, gps.GPSLatitudeRef);
    const lon = convertDMSToDD(gps.GPSLongitude, gps.GPSLongitudeRef);
    
    console.log('변환된 좌표:', { lat, lon });
    
    return { lat, lon };
  } catch (error) {
    console.error('GPS 정보 추출 중 오류:', error);
    return null;
  }
}

/**
 * DMS 배열을 십진도로 변환
 */
function convertDMSToDD(dms: number[], ref: string): number {
  let dd = dms[0] + dms[1] / 60 + dms[2] / (60 * 60);
  if (ref === "S" || ref === "W") {
    dd = dd * -1;
  }
  return dd;
}
