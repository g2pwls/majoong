"use client";

import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone"; // Import useDropzone from react-dropzone
import Image from "next/image";
import { FarmService } from "@/services/farmService";
import { Horse } from "@/types/farm";

interface HorseProfileData {
  horseNo: string | null;
  hrNm: string | null;
  sex: string | null;
  birthDt: string | null;
  color: string | null;
  breed: string | null;
  prdCty: string | null;
  rcCnt: string | null;
  fstCnt: string | null;
  sndCnt: string | null;
  amt: string | null;
  discardDt: string | null;
  fdebutDt: string | null;
  lchulDt: string | null;
}

interface RegisteredHorse {
  id: string;
  horseNo: string;
  image: string;
  hrNm: string;
  birthDt: string;
  breed: string;
  sex: string;
}

export default function HorseInfoPanel({
  farm_uuid,
  onHorseRegistered,
}: {
  farm_uuid: string;
  onHorseRegistered: (horseData: RegisteredHorse) => void;
}) {
  // 상태 관리
  const [horseNo, setHorseNo] = useState(""); // 마번 상태 관리
  const [profileData, setProfileData] = useState<HorseProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null); // 업로드한 파일 상태 관리
  const [filePreview, setFilePreview] = useState<string | null>(null); // 파일 미리보기 상태 관리
  const [isFetchComplete, setIsFetchComplete] = useState(false); // 마번 조회 완료 여부
  const [registeredHorses, setRegisteredHorses] = useState<Horse[]>([]); // 등록된 말 목록
  const [deleteConfirmHorse, setDeleteConfirmHorse] = useState<Horse | null>(null); // 삭제 확인할 말
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 중 상태

  // 등록된 말 목록 가져오기
  const fetchRegisteredHorses = useCallback(async () => {
    try {
      console.log('등록된 말 목록 조회 시작:', farm_uuid);
      const horses = await FarmService.getHorses(farm_uuid);
      console.log('등록된 말 목록 조회 성공:', horses);
      setRegisteredHorses(horses);
    } catch (err) {
      console.error('등록된 말 목록 조회 실패:', err);
    }
  }, [farm_uuid]);

  // 컴포넌트 마운트 시 등록된 말 목록 가져오기
  useEffect(() => {
    if (farm_uuid) {
      fetchRegisteredHorses();
    }
  }, [farm_uuid, fetchRegisteredHorses]);


  // 중복 마번 검증 함수
  const isHorseNumberDuplicate = useCallback((horseNumber: string): boolean => {
    const isDuplicate = registeredHorses.some(horse => {
      return horse.horseNo === horseNumber;
    });
    
    console.log('중복 검증:', {
      입력된마번: horseNumber,
      등록된말목록: registeredHorses.map(h => h.horseNo),
      중복여부: isDuplicate
    });
    
    return isDuplicate;
  }, [registeredHorses]);

  // 등록된 말 목록이 변경될 때마다 중복 검증 재실행
  useEffect(() => {
    if (profileData && profileData.horseNo) {
      if (isHorseNumberDuplicate(profileData.horseNo)) {
        setError("이미 등록되어 있는 말입니다.");
        setIsFetchComplete(false);
      }
    }
  }, [registeredHorses, profileData, isHorseNumberDuplicate]);

  // XML 파싱 함수
  const parseXML = (xmlString: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    const response = xmlDoc.getElementsByTagName("item");

    if (response.length > 0) {
      const horse = response[0];
      return {
        horseNo: horse.getElementsByTagName("hrNo")[0]?.textContent,
        hrNm: horse.getElementsByTagName("hrNm")[0]?.textContent,
        sex: horse.getElementsByTagName("sex")[0]?.textContent,
        birthDt: horse.getElementsByTagName("birthDt")[0]?.textContent,
        color: horse.getElementsByTagName("color")[0]?.textContent,
        breed: horse.getElementsByTagName("breed")[0]?.textContent,
        prdCty: horse.getElementsByTagName("prdCty")[0]?.textContent,
        rcCnt: horse.getElementsByTagName("rcCnt")[0]?.textContent,
        fstCnt: horse.getElementsByTagName("fstCnt")[0]?.textContent,
        sndCnt: horse.getElementsByTagName("sndCnt")[0]?.textContent,
        amt: horse.getElementsByTagName("amt")[0]?.textContent,
        discardDt: horse.getElementsByTagName("discardDt")[0]?.textContent,
        fdebutDt: horse.getElementsByTagName("fdebutDt")[0]?.textContent,
        lchulDt: horse.getElementsByTagName("lchulDt")[0]?.textContent,
      };
    } else {
      return null;
    }
  };

  // 마번 조회 함수
  const fetchHorseInfo = async () => {
    if (!horseNo) return; // 마번이 없으면 요청하지 않음
    setLoading(true);
    setError("");
    setIsFetchComplete(false); // 조회 시작 시 버튼 비활성화

    const serviceKey = process.env.HORSE_API_SERVICE_KEY; // 인증키
    
    if (!serviceKey) {
      setError("API 서비스 키가 설정되지 않았습니다.");
      setLoading(false);
      return;
    }
    
    const pageNo = 1; // 페이지 번호
    const numOfRows = 10; // 한 페이지에 결과 수 (필요한 만큼 조정)

    try {
      const response = await fetch(
        `https://apis.data.go.kr/B551015/API42/totalHorseInfo?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&hr_no=${horseNo}`
      );
      const data = await response.text(); // XML 데이터를 텍스트로 받음
      const parsedData = parseXML(data); // XML 데이터를 파싱

      if (parsedData) {
        // 중복 마번 검증
        if (isHorseNumberDuplicate(parsedData.horseNo || '')) {
          setError("이미 등록되어 있는 말입니다.");
          setIsFetchComplete(false);
          return;
        }
        
        setProfileData(parsedData); // 응답 데이터 저장
        setIsFetchComplete(true); // 마번 조회 완료
      } else {
        setError("마번 조회에 실패했습니다.");
        setIsFetchComplete(false);
      }
    } catch (err) {
      console.error(err); // 오류 로그 출력
      setError("API 호출 오류가 발생했습니다.");
      setIsFetchComplete(false);
    } finally {
      setLoading(false);
    }
  };

  // Dropzone 사용을 위한 파일 처리 (FarmBasicInfoPanel과 동일한 패턴)
  const onDrop = (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    if (filePreview) URL.revokeObjectURL(filePreview); // 기존 미리보기 URL 정리
    setFile(f);
    setFilePreview(URL.createObjectURL(f)); // 새 미리보기 URL 생성
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }, // 이미지 파일만 업로드 가능
    multiple: false,
  });

  // 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  // "추가하기" 버튼 활성화 조건
  const isButtonDisabled = !file || !horseNo || !isFetchComplete; // 파일과 마번 조회가 완료되어야만 활성화

  // 말 삭제하기
  const deleteHorse = async (horse: Horse) => {
    try {
      setIsDeleting(true);
      setError("");

      // horseNo 그대로 사용
      const horseNumber = horse.horseNo;
      
      console.log('말 삭제 시작:', {
        farmUuid: farm_uuid,
        horseNumber: horseNumber,
        horseName: horse.hrNm
      });

      await FarmService.deleteHorse(farm_uuid, horseNumber);

      // 성공 시 목록 새로고침
      await fetchRegisteredHorses();
      
      // 삭제 확인 모달 닫기
      setDeleteConfirmHorse(null);

      console.log('말 삭제 성공');
    } catch (err) {
      console.error("말 삭제 실패:", err);
      setError(err instanceof Error ? err.message : "말 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 말 등록하기
  const registerHorse = async () => {
    // 필수 필드 검증
    if (!file) {
      setError("말 프로필 사진을 업로드해주세요.");
      return;
    }
    
    if (!profileData || !profileData.horseNo || !profileData.hrNm || !profileData.birthDt || !profileData.breed || !profileData.sex) {
      setError("마번 조회를 먼저 완료해주세요.");
      return;
    }

    // 등록 전 중복 검증 (추가 안전장치)
    if (isHorseNumberDuplicate(profileData.horseNo)) {
      setError("이미 등록되어 있는 말입니다.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 날짜 형식 변환 함수
      const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return '';
        // YYYYMMDD 형식을 YYYY-MM-DD로 변환
        if (dateStr.length === 8) {
          return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        }
        return dateStr;
      };

      // API에 전달할 데이터 준비
      const horseData = {
        farmUuid: farm_uuid,
        horseNumber: profileData.horseNo,
        horseName: profileData.hrNm,
        birth: formatDate(profileData.birthDt),
        gender: profileData.sex,
        color: profileData.color && profileData.color !== "-" ? profileData.color : null,
        breed: profileData.breed,
        countryOfOrigin: profileData.prdCty && profileData.prdCty !== "-" ? profileData.prdCty : null,
        raceCount: profileData.rcCnt && profileData.rcCnt !== "-" ? parseInt(profileData.rcCnt) : null,
        firstPlaceCount: profileData.fstCnt && profileData.fstCnt !== "-" ? parseInt(profileData.fstCnt) : null,
        secondPlaceCount: profileData.sndCnt && profileData.sndCnt !== "-" ? parseInt(profileData.sndCnt) : null,
        totalPrize: profileData.amt && profileData.amt !== "-" ? parseInt(profileData.amt) : null,
        retiredDate: profileData.discardDt && profileData.discardDt !== "-" ? formatDate(profileData.discardDt) : null,
        firstRaceDate: profileData.fdebutDt && profileData.fdebutDt !== "-" ? formatDate(profileData.fdebutDt) : null,
        lastRaceDate: profileData.lchulDt && profileData.lchulDt !== "-" ? formatDate(profileData.lchulDt) : null,
        profileImage: file,
      };

      console.log('말 등록 데이터:', {
        farmUuid: horseData.farmUuid,
        horseNumber: horseData.horseNumber,
        horseName: horseData.horseName,
        hasProfileImage: !!horseData.profileImage,
        profileImageName: horseData.profileImage?.name,
        profileImageSize: horseData.profileImage?.size
      });

      // API 호출
      await FarmService.registerHorse(horseData);

        // 성공 시 상위 컴포넌트에 알림
        const registeredHorseData = {
          id: `${profileData.horseNo}-${Date.now()}`,
          horseNo: profileData.horseNo,
          image: filePreview || '',
          hrNm: profileData.hrNm,
          birthDt: profileData.birthDt,
          breed: profileData.breed,
          sex: profileData.sex,
        };
        onHorseRegistered(registeredHorseData);

        // 등록된 말 목록 새로고침
        await fetchRegisteredHorses();

        // 폼 초기화
        setHorseNo("");
        setProfileData(null);
        setFile(null);
        setFilePreview(null);
        setIsFetchComplete(false);

      } catch (err) {
        console.error("말 등록 실패:", err);
        setError(err instanceof Error ? err.message : "말 등록에 실패했습니다.");
      } finally {
        setLoading(false);
      }
  };

  return (
    <section className="border bg-white p-6 shadow-sm">

      {/* 에러 메시지 */}
      {error && (
        <div className={`mb-6 p-3 rounded-lg ${
          error.includes('이미 등록되어 있는 말') 
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="font-medium">{error}</p>
          {error.includes('이미 등록되어 있는 말') && (
            <p className="text-sm mt-1">다른 마번을 입력하거나 기존 말을 삭제 후 다시 등록해주세요.</p>
          )}
        </div>
      )}


      {/* 말 프로필과 조회 결과를 나란히 표시 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 말 프로필 업로드 (드롭존 적용) */}
        <div
          {...getRootProps()}
          className={`aspect-[4/3.5] w-full rounded-lg border bg-gray-100 p-4 flex items-center justify-center relative overflow-hidden cursor-pointer ${
            isDragActive ? "ring-2 ring-blue-300" : ""
          }`}
          aria-label="말 프로필 업로드"
        >
          <input {...getInputProps()} />
          {filePreview ? (
            <Image
              src={filePreview}
              alt="Selected file preview"
              width={300}
              height={180}
              className="w-full h-full object-contain rounded-lg transition-all duration-300 ease-in-out"
            />
          ) : (
            <button
              type="button"
              className="rounded-lg border bg-white px-4 py-2 text-sm shadow hover:shadow-md"
              onClick={(e) => e.preventDefault()} // 클릭은 상위 dropzone에서 처리
            >
              <div className="text-center">
                <div>말 프로필 업로드</div>
                <div className="text-xs text-gray-500">(드래그 앤 드랍 또는 클릭)</div>
              </div>
            </button>
          )}
        </div>

        {/* 마번 조회 결과 */}
        <div className="flex flex-col justify-center lg:col-span-2">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <h3 className="font-semibold text-lg">마번 조회</h3>
              <div className="flex gap-2 items-center">
                <input
                  className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 w-32 ml-5"
                  placeholder="마번 입력"
                  value={horseNo}
                  onChange={(e) => setHorseNo(e.target.value)}
                />
                <button
                  onClick={fetchHorseInfo}
                  disabled={loading}
                  className="rounded-lg bg-[#7d6149] text-white px-4 py-2 text-sm hover:bg-[#91745A] focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "조회 중..." : "조회"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm">
                    <strong>마번:</strong> {profileData?.horseNo || "-"}
                  </p>
                  <p className="text-sm">
                    <strong>마명:</strong> {profileData?.hrNm || "-"}
                  </p>
                </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm">
                  <strong>출생일:</strong> {profileData?.birthDt || "-"}
                </p>
                <p className="text-sm">
                  <strong>성별:</strong> {profileData?.sex || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm">
                  <strong>모색:</strong> {profileData?.color || "-"}
                </p>
                <p className="text-sm">
                  <strong>품종:</strong> {profileData?.breed || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm">
                  <strong>생산국:</strong> {profileData?.prdCty || "-"}
                </p>
                <p className="text-sm">
                  <strong>출추 횟수:</strong> {profileData?.rcCnt || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm">
                  <strong>일착 횟수:</strong> {profileData?.fstCnt || "-"}
                </p>
                <p className="text-sm">
                  <strong>이착 횟수:</strong> {profileData?.sndCnt || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm">
                  <strong>상금:</strong> {profileData?.amt || "-"}
                </p>
                <p className="text-sm">
                  <strong>경주마 불용일:</strong> {profileData?.discardDt || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm">
                  <strong>최초 출주일:</strong> {profileData?.fdebutDt || "-"}
                </p>
                <p className="text-sm">
                  <strong>최종 출주일:</strong> {profileData?.lchulDt || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 액션 영역: 선택 파일 표시 + 제거 + 추가하기 */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          {file ? `선택된 파일: ${file.name}` : "선택된 프로필 사진이 없습니다."}
        </div>

        <div className="flex gap-2">
          {file && (
            <button
              type="button"
              className="rounded-2xl border bg-white px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                if (filePreview) URL.revokeObjectURL(filePreview);
                setFile(null);
                setFilePreview(null);
              }}
            >
              사진 제거
            </button>
          )}
          <button
            className={`rounded-2xl px-4 py-2 text-white bg-[#7d6149] hover:opacity-90 ${
              isButtonDisabled || loading ? "bg-[#7d6149]" : "bg-neutral-900"
            }`}
            disabled={isButtonDisabled || loading} // 버튼 비활성화 처리
            onClick={registerHorse} // 말 등록
          >
            {loading ? "등록 중..." : "추가하기"}
          </button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteConfirmHorse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">말 삭제 확인</h3>
            <p className="text-gray-600 mb-6">
              정말로 <span className="font-medium">마번 {deleteConfirmHorse.horseNo}</span>
              {deleteConfirmHorse.hrNm && <span> ({deleteConfirmHorse.hrNm})</span>} 말을 삭제하시겠습니까?
              <br />
              <span className="text-red-600 text-sm">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmHorse(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={() => deleteHorse(deleteConfirmHorse)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
