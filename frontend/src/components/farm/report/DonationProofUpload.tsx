// src/components/farm/report/DonationProofUpload.tsx
"use client";

import { useState, useEffect } from "react";
import { submitReceiptSettlement } from "../../../services/apiService";

type DonationProofUploadProps = {
  farmUuid: string;
  donationData: Record<string, Record<string, string>>; // { [farmUuid]: { receipt?: string, certification?: string, ... } }
  onImageUpload: (farmUuid: string, category: string, file: File) => void;
  onImageSwap?: (farmUuid: string, fromCategory: string, toCategory: string) => void;
};

const categories = [
  { key: "feed", label: "사료/영양" },
  { key: "hoof", label: "발굽 관리" },
  { key: "medical", label: "의료/건강" },
  { key: "facility", label: "시설" },
  { key: "exercise", label: "운동/재활" },
  { key: "transport", label: "수송" }
];

export default function DonationProofUpload({
  farmUuid,
  donationData,
  onImageUpload,
  onImageSwap
}: DonationProofUploadProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [dragOverType, setDragOverType] = useState<string | null>(null);

  // --- OCR 관련 상태 ---
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");


  // --- 인증 사진 검증 관련 상태 ---
  const [certificationVerifying, setCertificationVerifying] = useState(false);
  const [certificationResult, setCertificationResult] = useState<{
    result: string;
    reason: string;
    matchedItems: string[];
    receiptAmount?: string;
    amountMatch?: boolean;
    storeInfo?: {
      name?: string;
      address?: string;
      phone?: string;
    };
    items?: Array<{
      name: string;
      quantity: string;
      unitPrice: string;
      totalPrice: string;
    }>;
    paymentInfo?: {
      totalAmount?: string;
      paymentMethod?: string;
      paymentDate?: string;
      receiptNumber?: string;
      approvalNumber?: string;
    };
  } | null>(null);
  const [certificationError, setCertificationError] = useState<string | null>(null);

  // --- 사용 금액 관련 상태 ---
  const [usedAmount, setUsedAmount] = useState<string>("");

  // --- 제출 관련 상태 ---
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 컴포넌트 렌더링 추적
  useEffect(() => {
    console.log("=== DonationProofUpload 컴포넌트 렌더링됨 ===", { 
      farmUuid, 
      submitting,
      timestamp: new Date().toISOString()
    });
  });

  const handleDragStart = (e: React.DragEvent, type: string) => {
    if (donationData[farmUuid]?.[type]) {
      setDraggedType(type);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverType(type);
  };

  const handleDragLeave = () => {
    setDragOverType(null);
  };

  const handleDrop = (e: React.DragEvent, targetType: string) => {
    e.preventDefault();
    setDragOverType(null);

    if (draggedType && draggedType !== targetType && onImageSwap) {
      onImageSwap(farmUuid, draggedType, targetType);
    }
    setDraggedType(null);
  };

  const handleFileDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOverType(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onImageUpload(farmUuid, type, files[0]);
      // 새 이미지 업로드 시 이전 OCR 결과와 검증 결과 초기화
      if (type === "receipt") {
        setExtractedText("");
        setExtractError(null);
      } else if (type === "certification") {
        setCertificationResult(null);
        setCertificationError(null);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(farmUuid, type, e.target.files[0]);
      if (type === "receipt") {
        setExtractedText("");
        setExtractError(null);
      } else if (type === "certification") {
        setCertificationResult(null);
        setCertificationError(null);
      }
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
    // 카테고리 변경 시 검증 결과 초기화
    setCertificationResult(null);
    setCertificationError(null);
  };

  // ---- 유틸: URL → base64 + 포맷 추정 ----
  async function urlToBase64AndFormat(imageUrl: string): Promise<{ base64: string; format: 'png' | 'jpg' | 'jpeg' | 'webp' }> {
    // dataURL로 이미 들어온 경우
    if (imageUrl.startsWith("data:")) {
      const [header, b64] = imageUrl.split(",");
      const m = /data:image\/(\w+);base64/.exec(header || "");
      const fmt = (m?.[1] || "jpg").toLowerCase() as 'png' | 'jpg' | 'jpeg' | 'webp';
      return { base64: b64, format: fmt === "jpeg" ? "jpg" : fmt };
    }

    const res = await fetch(imageUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("이미지를 불러올 수 없어요.");
    const ct = res.headers.get("content-type") || "";
    const blob = await res.blob();

    // Blob -> base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        resolve(dataUrl.split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    let fmt: "png" | "jpg" | "jpeg" | "webp" = "jpg";
    if (ct.includes("png")) fmt = "png";
    else if (ct.includes("webp")) fmt = "webp";
    else if (ct.includes("jpeg")) fmt = "jpg";

    return { base64, format: fmt };
  }

  // ---- OCR 실행 ----
  const handleExtractReceipt = async () => {
    try {
      setExtracting(true);
      setExtractError(null);
      setExtractedText("");

      const receiptUrl = donationData[farmUuid]?.receipt;
      if (!receiptUrl) {
        setExtractError("영수증 이미지를 먼저 업로드하세요.");
        setExtracting(false);
        return;
      }

      console.log("OCR 요청 시작:", { farmUuid, receiptUrl });
      
      const { base64, format } = await urlToBase64AndFormat(receiptUrl);
      console.log("Base64 변환 완료:", { format, base64Length: base64.length });

      const requestBody = {
        filename: "receipt",
        format,
        data: base64,
        lang: "ko",
      };
      console.log("OCR 요청 데이터:", { ...requestBody, data: base64.substring(0, 100) + "..." });

      const res = await fetch("/receipt/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000), // 30초 타임아웃
      });

      console.log("OCR 응답 상태:", res.status, res.statusText);

      const json = await res.json();
      console.log("OCR 응답 데이터:", json);

      if (!res.ok) {
        throw new Error(json?.detail || json?.error || "OCR 실패");
      }

      setExtractedText(json?.text || "(추출된 텍스트가 없습니다)");
    } catch (e: unknown) {
      console.error("OCR 에러:", e);
      let errorMessage = "추출 중 오류가 발생했어요.";
      
      if (e instanceof Error) {
        if (e.name === 'TimeoutError' || e.message.includes('timeout')) {
          errorMessage = "OCR 처리 시간이 초과되었습니다. 이미지 크기를 줄이거나 다시 시도해주세요.";
        } else {
          errorMessage = e.message;
        }
      }
      
      setExtractError(errorMessage);
    } finally {
      setExtracting(false);
    }
  };


  // ---- 인증 사진 종합 검증 실행 ----
  const handleVerifyCertification = async () => {
    try {
      setCertificationVerifying(true);
      setCertificationError(null);
      setCertificationResult(null);

      if (!selectedCategory) {
        setCertificationError("카테고리를 먼저 선택하세요.");
        setCertificationVerifying(false);
        return;
      }

      if (!extractedText) {
        setCertificationError("먼저 영수증에서 텍스트를 추출하세요.");
        setCertificationVerifying(false);
        return;
      }

      if (!usedAmount || isNaN(Number(usedAmount.replace(/,/g, "")))) {
        setCertificationError("사용 금액을 올바르게 입력하세요.");
        setCertificationVerifying(false);
        return;
      }

      const certificationUrl = donationData[farmUuid]?.certification;
      if (!certificationUrl) {
        setCertificationError("인증 사진을 먼저 업로드하세요.");
        setCertificationVerifying(false);
        return;
      }

      console.log("인증 사진 종합 검증 요청 시작:", { 
        category: selectedCategory, 
        extractedText, 
        usedAmount: usedAmount.replace(/,/g, ""),
        certificationUrl 
      });

      // 인증 사진을 base64로 변환
      const { base64: certificationBase64 } = await urlToBase64AndFormat(certificationUrl);

      const res = await fetch("/receipt/verify-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          extractedText: extractedText,
          usedAmount: usedAmount.replace(/,/g, ""),
          certificationImage: certificationBase64,
        }),
        signal: AbortSignal.timeout(60000), // 60초 타임아웃 (GPT 처리 시간 고려)
      });

      console.log("인증 사진 검증 응답 상태:", res.status, res.statusText);

      const json = await res.json();
      console.log("인증 사진 검증 응답 데이터:", json);
      console.log("응답 상태:", res.status, res.statusText);

      if (!res.ok) {
        console.error("검증 API 에러:", json);
        throw new Error(json?.error || "인증 사진 검증 실패");
      }

      // 응답 데이터 검증
      if (!json.result) {
        console.warn("응답에 result 필드가 없음:", json);
        json.result = "부적격";
      }
      
      if (!json.reason) {
        console.warn("응답에 reason 필드가 없음:", json);
        json.reason = "검증 결과를 가져올 수 없습니다.";
      }

      console.log("최종 검증 결과:", json);
      setCertificationResult(json);
    } catch (e: unknown) {
      console.error("인증 사진 검증 에러:", e);
      let errorMessage = "종합 검증 중 오류가 발생했어요.";
      
      if (e instanceof Error) {
        if (e.name === 'TimeoutError' || e.message.includes('timeout')) {
          errorMessage = "검증 처리 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.";
        } else {
          errorMessage = e.message;
        }
      }
      
      setCertificationError(errorMessage);
    } finally {
      setCertificationVerifying(false);
    }
  };

  // ---- 제출 처리 ----
  const handleSubmit = async () => {
    console.log("=== handleSubmit 호출됨 ===", { submitting, timestamp: new Date().toISOString() });
    
    // 중복 실행 방지
    if (submitting) {
      console.log("이미 제출 중입니다. 중복 요청을 무시합니다.");
      return;
    }

    try {
      console.log("setSubmitting(true) 호출");
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // 필수 데이터 검증
      if (!selectedCategory) {
        setSubmitError("카테고리를 선택해주세요.");
        setSubmitting(false);
        return;
      }

      if (!donationData[farmUuid]?.receipt) {
        setSubmitError("영수증 사진을 업로드해주세요.");
        setSubmitting(false);
        return;
      }

      if (!donationData[farmUuid]?.certification) {
        setSubmitError("인증 사진을 업로드해주세요.");
        setSubmitting(false);
        return;
      }

      if (!usedAmount || isNaN(Number(usedAmount.replace(/,/g, "")))) {
        setSubmitError("사용 금액을 올바르게 입력해주세요.");
        setSubmitting(false);
        return;
      }

      if (!extractedText) {
        setSubmitError("영수증에서 텍스트를 먼저 추출해주세요.");
        setSubmitting(false);
        return;
      }

      if (!certificationResult) {
        setSubmitError("인증 사진 검증을 먼저 완료해주세요.");
        setSubmitting(false);
        return;
      }

      if (certificationResult.result !== "적격") {
        setSubmitError("인증 사진 검증이 통과되지 않았습니다. 검증 결과를 확인해주세요.");
        setSubmitting(false);
        return;
      }

      console.log("제출 요청 시작:", { 
        farmUuid, 
        category: selectedCategory, 
        usedAmount: usedAmount.replace(/,/g, ""),
        extractedText,
        certificationResult
      });

      // 카테고리 ID 매핑
      const getCategoryId = (category: string): number => {
        const categoryMap: { [key: string]: number } = {
          "feed": 1,      // 사료/영양
          "hoof": 2,      // 발굽 관리
          "medical": 3,   // 의료/건강
          "facility": 4,  // 시설
          "exercise": 5,  // 운동/재활
          "transport": 6  // 수송
        };
        return categoryMap[category] || 1;
      };

      // 중복 방지 키 생성 (백엔드 제한: 최대 36자)
      const generateIdempotencyKey = (): string => {
        // 더 고유한 키 생성을 위해 타임스탬프 + 랜덤 + UUID 조합
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 6);
        const uuid = crypto.randomUUID().replace(/-/g, '').substr(0, 8);
        const key = `receipt_${timestamp}_${random}_${uuid}`;
        
        // 36자 제한 확인
        if (key.length > 36) {
          return `receipt_${timestamp}_${random}_${uuid.substring(0, 36 - `receipt_${timestamp}_${random}_`.length)}`;
        }
        return key;
      };

      // 멱등성 키 생성
      const idempotencyKey = generateIdempotencyKey();
      console.log("생성된 멱등성 키:", idempotencyKey, "길이:", idempotencyKey.length);

      // 백엔드 API 요구사항에 맞는 데이터 구성 (타입 및 유효성 검증 강화)
      const reason = (certificationResult.reason || "기부금 증빙 정산").substring(0, 1000); // 최대 1000자
      const storeName = (certificationResult.storeInfo?.name || "가게명").substring(0, 255); // 최대 255자
      const storeAddress = (certificationResult.storeInfo?.address || "주소").substring(0, 255); // 최대 255자
      const storePhone = (certificationResult.storeInfo?.phone || "전화번호").substring(0, 15); // 최대 15자
      const content = `카테고리: ${selectedCategory}, 사용금액: ${usedAmount}원`.substring(0, 1000); // 최대 1000자
      
      const items = certificationResult.items ? certificationResult.items.map(item => ({
        name: (item.name || "상품명").substring(0, 255), // 최대 255자
        quantity: Math.max(1, parseInt(item.quantity) || 1), // 최소 1
        unitPrice: Math.max(1, parseInt(item.unitPrice) || 0), // 최소 1
        totalPrice: Math.max(1, parseInt(item.totalPrice) || 0) // 최소 1
      })) : [{
        name: (certificationResult.matchedItems?.[0] || "상품명").substring(0, 255),
        quantity: 1,
        unitPrice: Math.max(1, parseInt(usedAmount.replace(/,/g, ""))),
        totalPrice: Math.max(1, parseInt(usedAmount.replace(/,/g, "")))
      }];
      
      const receiptAmount = Math.max(1, parseInt(usedAmount.replace(/,/g, ""))); // 최소 1
      const categoryId = Number(getCategoryId(selectedCategory)); // Long 타입으로 명시적 변환
      const approvalNumber = (certificationResult.paymentInfo?.approvalNumber || 
        `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`).substring(0, 255); // 최대 255자
      
      const payload = {
        reason: reason,
        storeInfo: {
          name: storeName,
          address: storeAddress,
          phone: storePhone
        },
        content: content,
        items: items,
        receiptAmount: receiptAmount,
        categoryId: categoryId,
        idempotencyKey: idempotencyKey,
        approvalNumber: approvalNumber,
      };

      console.log("API 요청 payload:", payload);
      
      // 데이터 유효성 검증
      console.log("=== 데이터 유효성 검증 ===");
      console.log("reason:", payload.reason, "길이:", payload.reason?.length);
      console.log("storeInfo:", payload.storeInfo);
      console.log("content:", payload.content, "길이:", payload.content?.length);
      console.log("items:", payload.items, "개수:", payload.items?.length);
      console.log("receiptAmount:", payload.receiptAmount, "타입:", typeof payload.receiptAmount);
      console.log("categoryId:", payload.categoryId, "타입:", typeof payload.categoryId, "값:", payload.categoryId);
      console.log("idempotencyKey:", payload.idempotencyKey, "길이:", payload.idempotencyKey?.length);
      console.log("approvalNumber:", payload.approvalNumber, "길이:", payload.approvalNumber?.length);
      
      // 백엔드로 보낼 JSON 데이터를 콘솔에 출력
      console.log("=== 백엔드로 보낼 JSON 데이터 ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("=== FormData 구성 ===");
      console.log("payload:", JSON.stringify(payload));
      console.log("photo: File 객체 (certification 이미지)");
      console.log("================================");
      
      console.log("=== API 호출 시작 ===", { timestamp: new Date().toISOString() });

      // 인증사진을 File 객체로 변환
      let photoFile: File;
      try {
        const certificationImage = donationData[farmUuid].certification;
        if (!certificationImage) {
          throw new Error("인증사진이 없습니다.");
        }
        const response = await fetch(certificationImage);
        const blob = await response.blob();
        
        // MIME 타입에 따라 적절한 확장자 결정
        let extension = 'jpg'; // 기본값
        if (blob.type === 'image/png') {
          extension = 'png';
        } else if (blob.type === 'image/jpeg' || blob.type === 'image/jpg') {
          extension = 'jpg';
        } else if (blob.type === 'image/webp') {
          extension = 'webp';
        } else if (blob.type === 'image/gif') {
          extension = 'gif';
        }
        
        // 이미지 압축 (최대 1MB로 제한)
        let compressedBlob = blob;
        if (blob.size > 1024 * 1024) { // 1MB 초과시 압축
          console.log(`이미지 크기: ${(blob.size / 1024).toFixed(2)}KB, 압축 중...`);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          await new Promise((resolve) => {
            img.onload = () => {
              // 최대 크기를 1024px로 제한
              const maxSize = 1024;
              let { width, height } = img;
              
              if (width > height) {
                if (width > maxSize) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              ctx?.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob((compressed) => {
                if (compressed) {
                  compressedBlob = compressed;
                  console.log(`압축 완료: ${(compressed.size / 1024).toFixed(2)}KB`);
                }
                resolve(void 0);
              }, 'image/jpeg', 0.8); // JPEG 품질 80%
            };
            img.src = URL.createObjectURL(blob);
          });
        }
        
        photoFile = new File([compressedBlob], `certification.${extension}`, { type: compressedBlob.type });
        console.log(`인증사진 파일 생성: certification.${extension}, MIME 타입: ${compressedBlob.type}, 크기: ${(compressedBlob.size / 1024).toFixed(2)}KB`);
      } catch (error) {
        console.warn("인증사진 변환 실패:", error);
        throw new Error("인증사진을 처리할 수 없습니다.");
      }

      // apiService를 통한 정산 제출
      console.log("=== apiService를 통한 정산 제출 시작 ===", { 
        timestamp: new Date().toISOString()
      });
      
      const result = await submitReceiptSettlement(payload, photoFile);
      
      setSubmitSuccess(true);
      console.log("제출 성공:", result);
      
      // 성공 메시지 표시
      if (result?.settlement?.released) {
        console.log("정산 성공:", result.settlement);
      }
    } catch (e: unknown) {
      console.error("제출 에러:", e);
      
      let errorMessage = "제출 중 오류가 발생했어요.";
      
      // 409 Conflict 오류 처리
      if (e && typeof e === 'object' && 'response' in e) {
        const axiosError = e as { response?: { status: number; data: { message: string } } };
        if (axiosError.response?.status === 409) {
          const backendMessage = axiosError.response.data?.message || "";
          
          if (backendMessage.includes("이미 처리된 증빙")) {
            errorMessage = "이미 처리된 영수증입니다. 다른 영수증을 사용해주세요.";
          } else if (backendMessage.includes("이미 사용했던 영수증")) {
            errorMessage = "이미 사용된 영수증입니다. 새로운 영수증을 업로드해주세요.";
          } else {
            errorMessage = "중복된 영수증입니다. 다른 영수증을 사용해주세요.";
          }
        } else if (axiosError.response?.status === 400) {
          errorMessage = "입력 정보를 다시 확인해주세요.";
        } else if (axiosError.response?.status === 401) {
          errorMessage = "로그인이 필요합니다. 다시 로그인해주세요.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "접근 권한이 없습니다.";
        } else if (axiosError.response?.status && axiosError.response.status >= 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
      } else if (e instanceof Error) {
        // 타임아웃 에러에 대한 특별 처리
        if (e.message.includes('timeout') || e.message.includes('시간이 초과')) {
          errorMessage = "요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.";
        } else {
          errorMessage = e.message;
        }
      }
      
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg bg-gray-100 mb-4">
      <h3 className="text-lg font-semibold mb-4">기부금 증빙 업로드</h3>

      {/* 카테고리 드롭다운 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">카테고리</label>
        <div className="relative">
          <button
            type="button"
            className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="block truncate">
              {selectedCategory ? categories.find(cat => cat.key === selectedCategory)?.label : "카테고리를 선택하세요"}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {categories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  onClick={() => handleCategorySelect(category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* 영수증 사진 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">영수증 사진</label>
        <div
          className={`w-full h-60 bg-gray-300 border-dashed border-2 flex items-center justify-center cursor-pointer transition-all relative ${
            dragOverType === 'receipt' ? 'border-blue-500 bg-blue-50' : ''
          } ${donationData[farmUuid]?.receipt ? 'border-solid' : ''}`}
          style={{
            backgroundImage: `url(${donationData[farmUuid]?.receipt || ''})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          onClick={() => document.getElementById(`file-${farmUuid}-receipt`)?.click()}
          draggable={!!donationData[farmUuid]?.receipt}
          onDragStart={(e) => handleDragStart(e, 'receipt')}
          onDragOver={(e) => handleDragOver(e, 'receipt')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            if (e.dataTransfer.files.length > 0) {
              handleFileDrop(e, 'receipt');
            } else {
              handleDrop(e, 'receipt');
            }
          }}
        >
          {!donationData[farmUuid]?.receipt && (
            <div className="text-center">
              <span className="text-sm text-gray-600 block">클릭 또는 드래그하여 업로드</span>
            </div>
          )}
        </div>
        <input
          id={`file-${farmUuid}-receipt`}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileInput(e, 'receipt')}
          className="mt-2 hidden"
        />

        {/* 사용 금액 입력 */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">사용 금액</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={usedAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                setUsedAmount(formattedValue);
                // 금액 변경 시 검증 결과 초기화
                setCertificationResult(null);
                setCertificationError(null);
              }}
              placeholder="사용한 금액을 입력하세요"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-600">원</span>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="mt-3 flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            onClick={handleExtractReceipt}
            disabled={extracting}
          >
            {extracting ? "추출 중..." : "추출"}
          </button>
        </div>

        {/* 추출 결과 출력 영역 */}
        {(extracting || extractError || extractedText) && (
          <div className="mt-4">
            {extracting && <p className="text-sm text-gray-600">영수증에서 글자를 추출하는 중입니다…</p>}
            {extractError && <p className="text-sm text-red-600">에러: {extractError}</p>}
            {extractedText && (
              <>
                <h4 className="text-sm font-semibold mb-2">추출된 글</h4>
                <pre className="whitespace-pre-wrap bg-white border rounded p-3 text-sm">
                  {extractedText}
                </pre>
              </>
            )}
          </div>
        )}
      </div>

      {/* 인증 사진 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">인증 사진</label>
        <div
          className={`w-full h-60 bg-gray-300 border-dashed border-2 flex items-center justify-center cursor-pointer transition-all relative ${
            dragOverType === 'certification' ? 'border-blue-500 bg-blue-50' : ''
          } ${donationData[farmUuid]?.certification ? 'border-solid' : ''}`}
          style={{
            backgroundImage: `url(${donationData[farmUuid]?.certification || ''})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          onClick={() => document.getElementById(`file-${farmUuid}-certification`)?.click()}
          draggable={!!donationData[farmUuid]?.certification}
          onDragStart={(e) => handleDragStart(e, 'certification')}
          onDragOver={(e) => handleDragOver(e, 'certification')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            if (e.dataTransfer.files.length > 0) {
              handleFileDrop(e, 'certification');
            } else {
              handleDrop(e, 'certification');
            }
          }}
        >
          {!donationData[farmUuid]?.certification && (
            <div className="text-center">
              <span className="text-sm text-gray-600 block">클릭 또는 드래그하여 업로드</span>
            </div>
          )}
        </div>
        <input
          id={`file-${farmUuid}-certification`}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileInput(e, 'certification')}
          className="mt-2 hidden"
        />
        <div className="mt-3 flex justify-end">
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
            onClick={handleVerifyCertification}
            disabled={certificationVerifying || !selectedCategory || !extractedText || !usedAmount || !donationData[farmUuid]?.certification}
          >
            {certificationVerifying ? "검사 중..." : "검사"}
          </button>
        </div>

        {/* 인증 사진 검증 결과 표시 */}
        {(certificationVerifying || certificationError || certificationResult) && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <h4 className="text-lg font-bold mb-4">검증 결과</h4>
            {certificationVerifying && <p className="text-sm text-gray-600">GPT가 영수증과 인증사진을 종합 검증하는 중입니다…</p>}
            {certificationError && <p className="text-sm text-red-600">에러: {certificationError}</p>}
            {certificationResult && (
              <div className="space-y-4">
                {/* 결과 배지 */}
                <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  certificationResult.result === "적격" 
                    ? "bg-green-100 text-gray-900" 
                    : "bg-red-100 text-gray-900"
                }`}>
                  {certificationResult.result}
                </div>

                {/* 검증 이유 */}
                <p className="text-sm text-gray-700 leading-relaxed">
                  {(() => {
                    try {
                      // JSON 형태의 문자열인지 확인
                      if (certificationResult.reason.includes('{') && certificationResult.reason.includes('}')) {
                        // JSON이 ```json ... ``` 형태로 감싸져 있는 경우 처리
                        const jsonMatch = certificationResult.reason.match(/```json\s*([\s\S]*?)\s*```/);
                        if (jsonMatch) {
                          const parsed = JSON.parse(jsonMatch[1]);
                          return parsed.reason || parsed.detail || certificationResult.reason;
                        }
                        
                        // JSON이 ``` ... ``` 형태로 감싸져 있는 경우 처리
                        const codeMatch = certificationResult.reason.match(/```\s*([\s\S]*?)\s*```/);
                        if (codeMatch) {
                          const parsed = JSON.parse(codeMatch[1]);
                          return parsed.reason || parsed.detail || certificationResult.reason;
                        }
                        
                        // JSON이 { ... } 형태로 감싸져 있는 경우 처리
                        const braceMatch = certificationResult.reason.match(/\{[\s\S]*\}/);
                        if (braceMatch) {
                          const parsed = JSON.parse(braceMatch[0]);
                          return parsed.reason || parsed.detail || certificationResult.reason;
                        }
                        
                        // 전체 문자열이 JSON인 경우
                        const parsed = JSON.parse(certificationResult.reason);
                        return parsed.reason || parsed.detail || certificationResult.reason;
                      }
                      return certificationResult.reason;
                    } catch (error) {
                      console.log("reason 파싱 실패:", error);
                      return certificationResult.reason;
                    }
                  })()}
                </p>
                
                {/* 금액 정보 표시 */}
                {(certificationResult.receiptAmount || certificationResult.amountMatch !== undefined) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">입력한 금액:</p>
                        <p className="font-bold text-lg text-gray-900">{usedAmount}원</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">영수증 금액:</p>
                        <p className="font-bold text-lg text-gray-900">{certificationResult.receiptAmount || "추출 실패"}</p>
                      </div>
                    </div>
                    {certificationResult.amountMatch !== undefined && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                          certificationResult.amountMatch 
                            ? "bg-green-100 text-gray-900" 
                            : "bg-red-100 text-gray-900"
                        }`}>
                          {certificationResult.amountMatch ? "금액 일치" : "금액 불일치"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 연관 상품 표시 */}
                {certificationResult.matchedItems && certificationResult.matchedItems.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">연관된 상품:</p>
                    <div className="flex flex-wrap gap-2">
                      {certificationResult.matchedItems.map((item, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-blue-100 text-gray-900 font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 영수증 상세 정보 표시 */}
                {(certificationResult.storeInfo || certificationResult.items || certificationResult.paymentInfo) && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-lg font-semibold mb-4 text-gray-800">영수증 상세 정보</h5>
                    
                    {/* 가게 정보 */}
                    {certificationResult.storeInfo && (
                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">가게 정보</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {certificationResult.storeInfo.name && (
                            <div>
                              <span className="text-gray-600">상호명:</span>
                              <span className="ml-2 font-medium">{certificationResult.storeInfo.name}</span>
                            </div>
                          )}
                          {certificationResult.storeInfo.address && (
                            <div>
                              <span className="text-gray-600">주소:</span>
                              <span className="ml-2 font-medium">{certificationResult.storeInfo.address}</span>
                            </div>
                          )}
                          {certificationResult.storeInfo.phone && (
                            <div>
                              <span className="text-gray-600">전화번호:</span>
                              <span className="ml-2 font-medium">{certificationResult.storeInfo.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 구매 상품 목록 */}
                    {certificationResult.items && certificationResult.items.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">구매 상품</h6>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-3 py-2 text-left">상품명</th>
                                <th className="border border-gray-300 px-3 py-2 text-center">수량</th>
                                <th className="border border-gray-300 px-3 py-2 text-right">단가</th>
                                <th className="border border-gray-300 px-3 py-2 text-right">금액</th>
                              </tr>
                            </thead>
                            <tbody>
                              {certificationResult.items.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-3 py-2">{item.name}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                                  <td className="border border-gray-300 px-3 py-2 text-right">{item.unitPrice}원</td>
                                  <td className="border border-gray-300 px-3 py-2 text-right font-medium">{item.totalPrice}원</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 결제 정보 */}
                    {certificationResult.paymentInfo && (
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-2">결제 정보</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {certificationResult.paymentInfo.totalAmount && (
                            <div>
                              <span className="text-gray-600">총 금액:</span>
                              <span className="ml-2 font-bold text-lg text-gray-900">{certificationResult.paymentInfo.totalAmount}원</span>
                            </div>
                          )}
                          {certificationResult.paymentInfo.paymentMethod && (
                            <div>
                              <span className="text-gray-600">결제 방법:</span>
                              <span className="ml-2 font-medium">{certificationResult.paymentInfo.paymentMethod}</span>
                            </div>
                          )}
                          {certificationResult.paymentInfo.paymentDate && (
                            <div>
                              <span className="text-gray-600">결제일시:</span>
                              <span className="ml-2 font-medium">{certificationResult.paymentInfo.paymentDate}</span>
                            </div>
                          )}
                          {certificationResult.paymentInfo.receiptNumber && (
                            <div>
                              <span className="text-gray-600">영수증번호:</span>
                              <span className="ml-2 font-medium">{certificationResult.paymentInfo.receiptNumber}</span>
                            </div>
                          )}
                          {certificationResult.paymentInfo.approvalNumber && (
                            <div>
                              <span className="text-gray-600">승인번호:</span>
                              <span className="ml-2 font-medium">{certificationResult.paymentInfo.approvalNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 특이사항 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">특이사항</label>
        <textarea
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="특이사항을 입력하세요..."
        />
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <button 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={(e) => {
            console.log("=== 제출 버튼 클릭됨 ===", { 
              submitting, 
              timestamp: new Date().toISOString(),
              eventType: e.type,
              target: e.target
            });
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
          disabled={submitting || !selectedCategory || !donationData[farmUuid]?.receipt || !donationData[farmUuid]?.certification || !usedAmount || !extractedText || !certificationResult || certificationResult.result !== "적격"}
        >
          {submitting ? "제출 중..." : "제출"}
        </button>
      </div>

      {/* 제출 결과 표시 */}
      {(submitting || submitError || submitSuccess) && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          {submitting && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">제출 중입니다...</p>
            </div>
          )}
          {submitError && (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">에러: {submitError}</p>
            </div>
          )}
          {submitSuccess && (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-600">제출이 완료되었습니다!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
