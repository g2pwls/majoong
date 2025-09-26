// ------------------------------------------------------------------
// src/components/farm/edit/FarmBasicInfoPanel.tsx (updated)
"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Farm } from "@/types/farm";
import { FarmService } from "@/services/farmService";

// 페이지에서 내려주는 최소 팜 타입 (필요한 필드만)
type FarmMinimal = Pick<Farm, 'farm_name' | 'image_url' | 'name' | 'address' | 'farm_phone' | 'area' | 'horse_count' | 'description'>;

export default function FarmBasicInfoPanel({
  farm_uuid,
  farm,
}: {
  farm_uuid: string;
  farm?: FarmMinimal | null;
}) {
  // 대표 사진 파일/미리보기 상태
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // 기본 정보 폼 상태 (상위에서 내려준 farm으로 초기화)
  const [farm_name, setfarm_name] = useState("");
  const [owner_name, setOwner_name] = useState("");
  const [address, setAddress] = useState("");
  const [farm_phone, setfarm_phone] = useState("");
  const [area, setArea] = useState<string>("");
  const [count, setCount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');
    
    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 전화번호 입력 핸들러
  const handlePhoneNumberChange = (value: string) => {
    const formattedValue = formatPhoneNumber(value);
    setfarm_phone(formattedValue);
  };

  useEffect(() => {
    setfarm_name(farm?.farm_name ?? "");
    setOwner_name(farm?.name ?? "");
    setAddress(farm?.address ?? "");
    setfarm_phone(farm?.farm_phone ?? "");
    setArea(typeof farm?.area === "number" ? String(farm!.area) : "");
    setCount(typeof farm?.horse_count === "number" ? String(farm!.horse_count) : "");
    setDescription(farm?.description ?? "");
    // 기존 대표 이미지가 있다면 미리보기로 사용 (선택)
    if (farm?.image_url) {
      setFilePreview(farm.image_url);
    }
  }, [farm]);

  // 드롭존 onDrop
  const onDrop = (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);


  const handleSubmit = async () => {
    try {
      // 필수 필드 검증
      if (!farm_name || !farm_phone || !description) {
        alert('모든 필수 필드를 입력해주세요.');
        return;
      }

      // FormData 생성 (multipart/form-data 형식)
      const formData = new FormData();
      formData.append('farmName', farm_name);
      formData.append('phoneNumber', farm_phone);
      formData.append('description', description);
      
      // 파일이 있으면 추가 (API 스펙에 맞게 'image'로 변경)
      if (file) {
        formData.append('image', file);
      }

      console.log('농장 정보 등록/수정 요청:', {
        farmName: farm_name,
        phoneNumber: farm_phone,
        description: description,
        hasFile: !!file
      });

      // FarmService.registerFarm을 FormData로 호출하도록 수정 필요
      await FarmService.registerFarmWithFormData(formData);

      alert('농장 정보가 성공적으로 수정되었습니다!');
      // 페이지 새로고침 또는 상위 컴포넌트에 업데이트 알림
      window.location.reload();
    } catch (error) {
      console.error('농장 정보 수정 실패:', error);
      alert('농장 정보 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <section className="border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 대표 사진 업로드 (드롭존 적용) */}
        <div
          {...getRootProps()}
          className={`aspect-[5/3] w-full rounded-lg border bg-gray-100 p-4 flex items-center justify-center relative overflow-hidden cursor-pointer ${
            isDragActive ? "ring-2 ring-blue-300" : ""
          }`}
          aria-label="대표 사진 업로드"
        >
          <input {...getInputProps()} />
          {filePreview ? (
            // 서버 이미지 URL 또는 로컬 blob URL 모두 표시
            <Image
              src={filePreview}
              alt="대표 사진 미리보기"
              width={300}
              height={200}
              className="w-full h-full object-contain rounded-lg transition-all duration-300 ease-in-out"
            />
          ) : (
            <button
              type="button"
              className="rounded-lg border bg-white px-4 py-2 text-sm shadow hover:shadow-md"
              onClick={(e) => e.preventDefault()}
            >
              대표 사진 업로드 (드래그 앤 드랍 또는 클릭)
            </button>
          )}
        </div>

        {/* 기본 정보 폼 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">목장명 <span className="text-red-500">*</span></span>
            <input
              className="w-[400px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={farm_name}
              onChange={(e) => setfarm_name(e.target.value)}
              placeholder="예: 제주말농장"
              required
            />
          </label>
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">목장주</span>
            <input
              className="w-[400px] rounded-lg border px-3 py-2 text-sm outline-none bg-gray-100 text-gray-600 cursor-not-allowed"
              value={owner_name}
              readOnly
              placeholder="예: 홍길동"
            />
          </label>
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">위치</span>
            <input
              className="w-[400px] rounded-lg border px-3 py-2 text-sm outline-none bg-gray-100 text-gray-600 cursor-not-allowed"
              value={address}
              readOnly
              placeholder="예: 제주특별자치도 제주시 ..."
            />
          </label>
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">연락처 <span className="text-red-500">*</span></span>
            <input
              className="w-[240px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={farm_phone}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              placeholder="예: 010-0000-0000"
              maxLength={13}
              required
            />
          </label>
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">면적</span>
            <div className="flex items-center">
              <input
                className="w-[120px] rounded-lg border px-3 py-2 text-sm outline-none bg-gray-100 text-gray-600 cursor-not-allowed"
                value={area}
                readOnly
                placeholder="예: 10000"
              />
              <span className="ml-2 text-sm text-gray-600">m²</span>
            </div>
          </label>
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">두수</span>
            <input
              className="w-[120px] rounded-lg border px-3 py-2 text-sm outline-none bg-gray-100 text-gray-600 cursor-not-allowed"
              value={count}
              readOnly
              placeholder="예: 17"
            />
          </label>
        </div>
      </div>

      {/* 목장 소개 섹션 */}
      <div className="mt-6">
        <label className="block">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">목장 소개 <span className="text-red-500">*</span></span>
            <span className="text-xs text-neutral-400">
              {description.length}/500
            </span>
          </div>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="목장에 대한 소개글을 작성해주세요. 예: 저희 목장은 20년 전통의 말 사육 경험을 바탕으로..."
            maxLength={500}
            required
          />
        </label>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          {file ? `선택된 파일: ${file.name}` : "선택된 대표 사진이 없습니다."}
        </div>

        <div className="flex gap-2">
          {file && (
            <button
              type="button"
              className="rounded-2xl border bg-white px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
                setFile(null);
                setFilePreview(farm?.image_url ?? null);
              }}
            >
              사진 제거
            </button>
          )}
          <button
            type="button"
            className="rounded-2xl border bg-neutral-900 px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!farm_uuid}
          >
            목장 정보 수정
          </button>
        </div>
      </div>
    </section>
  );
}

