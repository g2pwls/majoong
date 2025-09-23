// src/components/farm/report/DonationProofUpload.tsx
"use client";

import { useState } from "react";

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
      businessNumber?: string;
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
    };
  } | null>(null);
  const [certificationError, setCertificationError] = useState<string | null>(null);

  // --- 사용 금액 관련 상태 ---
  const [usedAmount, setUsedAmount] = useState<string>("");

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
      const errorMessage = e instanceof Error ? e.message : "추출 중 오류가 발생했어요.";
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
      const errorMessage = e instanceof Error ? e.message : "종합 검증 중 오류가 발생했어요.";
      setCertificationError(errorMessage);
    } finally {
      setCertificationVerifying(false);
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
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          제출
        </button>
      </div>
    </div>
  );
}
