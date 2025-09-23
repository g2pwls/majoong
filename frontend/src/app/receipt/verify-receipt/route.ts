import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { category, extractedText, usedAmount, certificationImage } = await request.json();

    console.log("API 요청 데이터:", { 
      category, 
      extractedTextLength: extractedText?.length, 
      usedAmount, 
      hasCertificationImage: !!certificationImage 
    });

    if (!category || !extractedText || !usedAmount) {
      return NextResponse.json(
        { error: "카테고리, 추출된 텍스트, 사용 금액이 필요합니다." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("NEXT_PUBLIC_OPENAI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_URL) {
      console.error("NEXT_PUBLIC_OPENAI_API_URL이 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "OpenAI API URL이 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // OpenAI API 호출
    const openaiResponse = await fetch(process.env.OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `당신은 기부금 증빙 검증 전문가입니다. 

선택된 카테고리와 영수증에서 추출된 상품 목록의 연관성, 사용자가 입력한 금액과 영수증의 총 금액 일치성, 그리고 인증 사진의 적절성을 종합적으로 판단해야 합니다.

카테고리별 연관 상품 예시:
- 사료/영양: 사료, 비타민, 영양제, 곡물, 건초, 보조사료, 미네랄, 칼슘제 등
- 발굽 관리: 발굽 관리 도구, 발굽약, 발굽 연마기, 발굽 보호제, 발굽 치료제 등
- 의료/건강: 의료용품, 약품, 주사기, 소독제, 체온계, 청진기, 붕대, 연고 등
- 시설: 울타리, 마구간, 창고, 급수기, 사료통, 도구, 건축자재, 전기용품 등
- 운동/재활: 운동기구, 재활용품, 마사지 도구, 물리치료 용품, 안장, 고삐 등
- 수송: 연료, 차량 부품, 타이어, 정비용품, 운송비, 주차비 등

영수증에서 추출해야 할 정보:
1. 가게 정보: 상호명, 주소, 전화번호
2. 구매 상품: 각 상품의 이름, 수량, 단가, 금액
3. 결제 정보: 총 금액, 결제 방법, 결제일시
4. 기타: 영수증 번호, 할인 정보 등

판단 기준:
1. 추출된 텍스트에서 상품명, 브랜드명, 품목명 등을 찾아보세요
2. 선택된 카테고리와 연관성이 있는 상품이 포함되어 있는지 확인하세요
3. 영수증에서 총 금액, 합계, 총액 등의 숫자를 찾아보세요
4. 사용자가 입력한 금액과 영수증의 총 금액이 일치하는지 확인하세요 (소액 차이는 허용)
5. 인증 사진 검증 (매우 중요):
   - 인증 사진이 영수증에 명시된 상품들과 직접적으로 관련이 있는지 확인
   - 사진에서 영수증의 상품들이 실제로 사용되는 모습이 보이는지 확인
   - 사진이 영수증의 구매 목적과 일치하는지 확인 (예: 사료 구매 → 말이 사료를 먹는 모습)
   - 사진이 단순히 영수증을 찍은 것이 아니라 실제 사용 증빙인지 확인
   - 인증 사진이 영수증과 전혀 관련이 없거나 일반적인 사진이면 부적격으로 판단
6. 다음 3가지 조건을 모두 만족해야 "적격":
   - 카테고리 연관성: 선택된 카테고리와 영수증 상품의 연관성
   - 금액 일치성: 입력한 금액과 영수증 총 금액의 일치성
   - 인증 사진 연관성: 인증 사진이 영수증 상품의 실제 사용을 보여주는지
7. 위 3가지 중 하나라도 만족하지 않으면 "부적격"으로 판단하세요
8. 판단 근거를 간단히 설명해주세요

중요: 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트나 설명은 포함하지 마세요.

{
  "result": "적격" 또는 "부적격",
  "reason": "판단 근거 설명 (카테고리 연관성, 금액 일치성, 인증사진 연관성 포함)",
  "matchedItems": ["연관된 상품명들"],
  "receiptAmount": "영수증에서 추출된 총 금액",
  "amountMatch": true 또는 false,
  "storeInfo": {
    "name": "가게 이름",
    "address": "가게 주소",
    "phone": "전화번호",
  },
  "items": [
    {
      "name": "상품명",
      "quantity": "수량",
      "unitPrice": "단가",
      "totalPrice": "금액"
    }
  ],
  "paymentInfo": {
    "totalAmount": "총 금액",
    "paymentMethod": "결제 방법",
    "paymentDate": "결제일시",
    "receiptNumber": "영수증 번호"
  }
}`
          },
          {
            role: "user",
            content: `선택된 카테고리: ${category}
            
사용자가 입력한 금액: ${usedAmount}원

추출된 영수증 텍스트:
${extractedText}

${certificationImage ? `인증 사진: 제공됨 (이미지 데이터 길이: ${certificationImage.length}자)
- 이 인증 사진이 영수증에 명시된 상품들의 실제 사용을 보여주는지 분석해주세요
- 사진에서 영수증의 상품들이 실제로 사용되는 모습이 보이는지 확인해주세요
- 사진이 영수증의 구매 목적과 일치하는지 검증해주세요` : '인증 사진: 제공되지 않음'}

위 정보를 바탕으로 다음 3가지 조건을 모두 만족하는지 엄격하게 검증해주세요:
1. 카테고리 연관성: 선택된 카테고리와 영수증 상품의 연관성
2. 금액 일치성: 입력한 금액과 영수증 총 금액의 일치성  
3. 인증 사진 연관성: 인증 사진이 영수증 상품의 실제 사용을 보여주는지

모든 조건을 만족해야 "적격", 하나라도 만족하지 않으면 "부적격"으로 판단해주세요.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API 오류: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI 응답을 파싱할 수 없습니다.");
    }

    // 개발 환경에서 디버깅을 위한 로그
    console.log("OpenAI 응답 원본:", content);
    console.log("응답 길이:", content.length);

    // JSON 응답 파싱 시도
    try {
      // 먼저 content에서 JSON 부분만 추출 시도
      let jsonContent = content;
      
      // JSON이 ```json ... ``` 형태로 감싸져 있는 경우 처리
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
        console.log("JSON 코드 블록에서 추출:", jsonContent);
      }
      
      // JSON이 ``` ... ``` 형태로 감싸져 있는 경우 처리
      const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch && !jsonMatch) {
        jsonContent = codeMatch[1];
        console.log("코드 블록에서 추출:", jsonContent);
      }
      
      // JSON이 { ... } 형태로 감싸져 있는 경우 처리
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch && !jsonMatch && !codeMatch) {
        jsonContent = braceMatch[0];
        console.log("중괄호에서 추출:", jsonContent);
      }
      
      // JSON 파싱 시도
      const parsedResult = JSON.parse(jsonContent);
      console.log("파싱된 결과:", parsedResult);
      
      // 필수 필드가 있는지 확인
      if (parsedResult.result && parsedResult.reason) {
        console.log("JSON 파싱 성공, 정상 응답 반환");
        return NextResponse.json(parsedResult);
      } else {
        throw new Error("필수 필드가 누락됨");
      }
    } catch (parseError) {
      console.log("JSON 파싱 실패, 텍스트에서 정보 추출:", parseError);
      console.log("원본 content:", content);
      
      // 금액 정보 추출 시도 (더 정확한 패턴)
      const amountPatterns = [
        /(\d{1,3}(?:,\d{3})*)\s*원/g,
        /총\s*금액[:\s]*(\d{1,3}(?:,\d{3})*)/gi,
        /합계[:\s]*(\d{1,3}(?:,\d{3})*)/gi,
        /총액[:\s]*(\d{1,3}(?:,\d{3})*)/gi
      ];
      
      let receiptAmount = null;
      for (const pattern of amountPatterns) {
        const match = content.match(pattern);
        if (match) {
          receiptAmount = match[1] || match[0].replace(/[^\d,]/g, '');
          break;
        }
      }
      
      // 연관 상품 추출 시도 (더 정확한 패턴)
      const itemPatterns = [
        /연관된 상품[:\s]*([^.\n]+)/i,
        /매칭된 상품[:\s]*([^.\n]+)/i,
        /관련 상품[:\s]*([^.\n]+)/i,
        /상품명[:\s]*([^.\n]+)/i
      ];
      
      let matchedItems = [];
      for (const pattern of itemPatterns) {
        const match = content.match(pattern);
        if (match) {
          matchedItems = match[1].split(/[,，;；]/).map((item: string) => item.trim()).filter((item: string) => item);
          break;
        }
      }
      
      // 금액 일치 여부 추출 시도 (더 정확한 패턴)
      const amountMatchResult = content.includes("금액 일치") || 
                               content.includes("일치") || 
                               content.includes("동일") ||
                               content.includes("같음");
      
      // 인증 사진 연관성 추출 시도 (사용하지 않으므로 제거)
      const photoUnrelatedResult = content.includes("인증 사진") && 
                                  (content.includes("관련 없음") || content.includes("연관성 없음") || content.includes("부적격"));
      
      // 텍스트에서 정보 추출 - 더 엄격한 판단
      let result = "부적격"; // 기본값을 부적격으로 설정
      
      // 적격 조건: 모든 조건이 만족되어야 함
      if (content.includes("적격") && 
          !content.includes("부적격") && 
          !photoUnrelatedResult) {
        result = "적격";
      }
      
      // 명시적으로 부적격이 언급된 경우
      if (content.includes("부적격") || photoUnrelatedResult) {
        result = "부적격";
      }
      
      // 가게 정보 추출 시도
      const storeNameMatch = content.match(/(?:상호|가게|업체)[:\s]*([^\n]+)/i);
      const addressMatch = content.match(/(?:주소|소재지)[:\s]*([^\n]+)/i);
      const phoneMatch = content.match(/(?:전화|연락처|TEL)[:\s]*([0-9-+\s]+)/i);
      
      // 상품 정보 추출 시도 (간단한 패턴)
      const itemsMatch = content.match(/(?:상품|품목|구매내역)[:\s]*([\s\S]*?)(?:\n\n|\n총|$)/i);
      let items = [];
      if (itemsMatch) {
        const itemsText = itemsMatch[1];
        const itemLines = itemsText.split('\n').filter((line: string) => line.trim());
        items = itemLines.map((line: string) => {
          const parts = line.trim().split(/\s+/);
          return {
            name: parts[0] || "상품명",
            quantity: parts[1] || "1",
            unitPrice: parts[2] || "0",
            totalPrice: parts[3] || "0"
          };
        });
      }
      
      // 결제 정보 추출 시도
      const paymentMethodMatch = content.match(/(?:결제|지불)[:\s]*(현금|카드|계좌이체|무통장입금)/i);
      const paymentDateMatch = content.match(/(?:결제일|구매일|영수증일)[:\s]*([0-9-/\s:]+)/i);
      const receiptNumberMatch = content.match(/(?:영수증번호|거래번호)[:\s]*([0-9-]+)/i);
      
      console.log("추출된 정보:", { 
        result, 
        receiptAmount, 
        matchedItems, 
        amountMatchResult,
        storeInfo: {
          name: storeNameMatch?.[1]?.trim(),
          address: addressMatch?.[1]?.trim(),
          phone: phoneMatch?.[1]?.trim(),
        },
        items,
        paymentInfo: {
          totalAmount: receiptAmount,
          paymentMethod: paymentMethodMatch?.[1]?.trim(),
          paymentDate: paymentDateMatch?.[1]?.trim(),
          receiptNumber: receiptNumberMatch?.[1]?.trim()
        }
      });
      
      return NextResponse.json({
        result,
        reason: content,
        matchedItems,
        receiptAmount,
        amountMatch: amountMatchResult,
        storeInfo: {
          name: storeNameMatch?.[1]?.trim() || null,
          address: addressMatch?.[1]?.trim() || null,
          phone: phoneMatch?.[1]?.trim() || null,
        },
        items: items.length > 0 ? items : null,
        paymentInfo: {
          totalAmount: receiptAmount,
          paymentMethod: paymentMethodMatch?.[1]?.trim() || null,
          paymentDate: paymentDateMatch?.[1]?.trim() || null,
          receiptNumber: receiptNumberMatch?.[1]?.trim() || null
        }
      });
    }

  } catch (error) {
    console.error("영수증 검증 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `영수증 검증 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}
