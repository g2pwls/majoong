"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone"; // Import useDropzone from react-dropzone

export default function HorseInfoPanel({
  farm_uuid,
  onHorseRegistered,
}: {
  farm_uuid: string;
  onHorseRegistered: (horseData: any) => void;
}) {
  // 상태 관리
  const [horseNo, setHorseNo] = useState(""); // 마번 상태 관리
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null); // 업로드한 파일 상태 관리
  const [filePreview, setFilePreview] = useState<string | null>(null); // 파일 미리보기 상태 관리
  const [isFetchComplete, setIsFetchComplete] = useState(false); // 마번 조회 완료 여부

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

    const serviceKey = process.env.NEXT_PUBLIC_HORSE_API_SERVICE_KEY; // 인증키
    
    if (!serviceKey) {
      setError("API 서비스 키가 설정되지 않았습니다.");
      setLoading(false);
      return;
    }
    
    const pageNo = 1; // 페이지 번호
    const numOfRows = 10; // 한 페이지에 결과 수 (필요한 만큼 조정)

    try {
      const response = await fetch(
        `http://apis.data.go.kr/B551015/API42/totalHorseInfo?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&hr_no=${horseNo}`
      );
      const data = await response.text(); // XML 데이터를 텍스트로 받음
      const parsedData = parseXML(data); // XML 데이터를 파싱

      if (parsedData) {
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

  // 말 등록하기
  const registerHorse = () => {
    if (profileData && filePreview) {
      const horseData = {
        id: `${profileData.horseNo}-${Date.now()}`, // 리스트 렌더링용 key
        horseNo: profileData.horseNo, // 중복 체크용
        image: filePreview,
        hrNm: profileData.hrNm,
        birthDt: profileData.birthDt,
        breed: profileData.breed,
        sex: profileData.sex,
      };
      onHorseRegistered(horseData); // 상위 컴포넌트로 등록된 말 정보 전달
    }
  };

  return (
    <section className="border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 말 프로필 업로드 (드롭존 적용) */}
        <div
          {...getRootProps()}
          className={`aspect-[5/3] w-full rounded-lg border bg-gray-100 p-4 flex items-center justify-center relative overflow-hidden cursor-pointer ${
            isDragActive ? "ring-2 ring-blue-300" : ""
          }`}
          aria-label="말 프로필 업로드"
        >
          <input {...getInputProps()} />
          {filePreview ? (
            <img
              src={filePreview}
              alt="Selected file preview"
              className="w-full h-full object-contain rounded-lg transition-all duration-300 ease-in-out"
            />
          ) : (
            <button
              type="button"
              className="rounded-lg border bg-white px-4 py-2 text-sm shadow hover:shadow-md"
              onClick={(e) => e.preventDefault()} // 클릭은 상위 dropzone에서 처리
            >
              말 프로필 업로드 (드래그 앤 드랍 또는 클릭)
            </button>
          )}
        </div>

        {/* 말 정보 입력 */}
        <div className="flex gap-3 items-center">
          <label className="flex items-center flex-row gap-4">
            <span className="text-sm text-neutral-600">마번 조회:</span>
            <input
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="마번을 입력하세요"
              value={horseNo}
              onChange={(e) => setHorseNo(e.target.value)} // 마번 상태 변경
            />
          </label>

          {/* 조회 버튼 */}
          <button
            onClick={fetchHorseInfo}
            className="w-auto rounded-lg bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            조회
          </button>
        </div>
      </div>

      {/* API 결과 출력 */}
      <div className="mt-6">
        {loading && <p>로딩 중...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {profileData && (
          <div className="bg-gray-100 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="font-semibold col-span-full">말 프로필</h3>

            {/* 첫 번째 열 */}
            <div>
              <p className="mb-2">
                <strong>마번:</strong> {profileData.horseNo}
              </p>
              <p className="mb-2">
                <strong>마명:</strong> {profileData.hrNm}
              </p>
              <p className="mb-2">
                <strong>출생일:</strong> {profileData.birthDt}
              </p>
              <p className="mb-2">
                <strong>성별:</strong> {profileData.sex}
              </p>
              <p className="mb-2">
                <strong>모색:</strong> {profileData.color}
              </p>
              <p className="mb-2">
                <strong>품종:</strong> {profileData.breed}
              </p>
              <p className="mb-2">
                <strong>생산국:</strong> {profileData.prdCty}
              </p>
            </div>

            {/* 두 번째 열 */}
            <div>
              <p className="mb-2">
                <strong>출추횟수:</strong> {profileData.rcCnt}
              </p>
              <p className="mb-2">
                <strong>일착횟수:</strong> {profileData.fstCnt}
              </p>
              <p className="mb-2">
                <strong>이착횟수:</strong> {profileData.sndCnt}
              </p>
              <p className="mb-2">
                <strong>상금:</strong> {profileData.amt}
              </p>
              <p className="mb-2">
                <strong>경주마불용일:</strong> {profileData.discardDt}
              </p>
              <p className="mb-2">
                <strong>최초출주일:</strong> {profileData.fdebutDt}
              </p>
              <p className="mb-2">
                <strong>최종출주일:</strong> {profileData.lchulDt}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 하단 액션 영역: 선택 파일 표시 + 제거 + 추가하기 */}
      <div className="mt-6 flex items-center justify-between">
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
            className={`rounded-2xl px-4 py-2 text-white hover:opacity-90 ${
              isButtonDisabled ? "bg-gray-500" : "bg-neutral-900"
            }`}
            disabled={isButtonDisabled} // 버튼 비활성화 처리
            onClick={registerHorse} // 말 등록
          >
            추가하기
          </button>
        </div>
      </div>
    </section>
  );
}
