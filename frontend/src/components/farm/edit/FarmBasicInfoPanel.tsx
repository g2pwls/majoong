// ------------------------------------------------------------------
// src/components/farm/edit/FarmBasicInfoPanel.tsx (updated)
"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
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
  const [address, setAddress] = useState("");
  const [farm_phone, setfarm_phone] = useState("");
  const [area, setArea] = useState<string>("");
  const [count, setCount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    setfarm_name(farm?.name ?? "");
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
      // 농장 정보 업데이트
      const farmData = {
        farm_name,
        name: farm_name, // 목장주 이름
        address,
        farm_phone,
        area: Number(area) || undefined,
        horse_count: Number(count) || undefined,
        description,
      };

      await FarmService.updateFarm(farm_uuid, farmData);

      // 이미지가 있다면 업로드
      if (file) {
        await FarmService.uploadFarmImage(farm_uuid, file);
      }

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
      {/* 상단에 현재 목장명 표시 (상위에서 내려줌) */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-neutral-500">현재 목장명</span>
        <span className="rounded-full border px-2 py-0.5 text-sm">{farm?.farm_name ?? "-"}</span>
      </div>

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
            <img
              src={filePreview}
              alt="대표 사진 미리보기"
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
            <span className="w-16 text-sm text-neutral-600">목장주:</span>
            <input
              className="w-[400px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={farm_name}
              onChange={(e) => setfarm_name(e.target.value)}
              placeholder="예: 홍길동"
            />
          </label>
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">위치</span>
            <input
              className="w-[400px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="예: 제주특별자치도 제주시 ..."
            />
          </label>
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">연락처</span>
            <input
              className="w-[240px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={farm_phone}
              onChange={(e) => setfarm_phone(e.target.value)}
              placeholder="예: 010-0000-0000"
            />
          </label>
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">면적</span>
            <input
              className="w-[160px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="예: 10000 (㎡)"
              inputMode="numeric"
            />
          </label>
          <label className="flex items-center flex-row gap-5">
            <span className="w-16 text-sm text-neutral-600">두수</span>
            <input
              className="w-[120px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="예: 17"
              inputMode="numeric"
            />
          </label>
        </div>
      </div>

      {/* 목장 소개 섹션 */}
      <div className="mt-6">
        <label className="block">
          <span className="text-sm font-medium text-neutral-600 mb-2 block">목장 소개</span>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="목장에 대한 소개글을 작성해주세요. 예: 저희 목장은 20년 전통의 말 사육 경험을 바탕으로..."
            maxLength={500}
          />
          <div className="mt-1 text-right text-xs text-neutral-400">
            {description.length}/500
          </div>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between">
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
            농장 정보 수정
          </button>
        </div>
      </div>
    </section>
  );
}

