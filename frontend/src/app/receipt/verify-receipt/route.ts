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

판단 기준:
1. 추출된 텍스트에서 상품명, 브랜드명, 품목명 등을 찾아보세요
2. 선택된 카테고리와 연관성이 있는 상품이 포함되어 있는지 확인하세요
3. 영수증에서 총 금액, 합계, 총액 등의 숫자를 찾아보세요
4. 사용자가 입력한 금액과 영수증의 총 금액이 일치하는지 확인하세요 (소액 차이는 허용)
5. 인증 사진이 제공된 경우, 영수증과 관련된 실제 사용 증빙인지 확인하세요
6. 카테고리 연관성, 금액 일치성, 인증 사진 연관성을 모두 만족하면 "적격", 하나라도 만족하지 않으면 "부적격"으로 판단하세요
7. 판단 근거를 간단히 설명해주세요

응답 형식:
{
  "result": "적격" 또는 "부적격",
  "reason": "판단 근거 설명 (카테고리 연관성, 금액 일치성, 인증사진 연관성 포함)",
  "matchedItems": ["연관된 상품명들"],
  "receiptAmount": "영수증에서 추출된 총 금액",
  "amountMatch": true 또는 false
}`
          },
          {
            role: "user",
            content: `선택된 카테고리: ${category}
            
사용자가 입력한 금액: ${usedAmount}원

추출된 영수증 텍스트:
${extractedText}

${certificationImage ? `인증 사진: 제공됨 (이미지 데이터 길이: ${certificationImage.length}자)` : '인증 사진: 제공되지 않음'}

위 정보를 바탕으로 종합적으로 적격/부적격을 판단해주세요.`
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

    // JSON 응답 파싱 시도
    try {
      const parsedResult = JSON.parse(content);
      return NextResponse.json(parsedResult);
    } catch {
      // JSON 파싱 실패 시 텍스트에서 정보 추출
      const result = content.includes("적격") ? "적격" : "부적격";
      return NextResponse.json({
        result,
        reason: content,
        matchedItems: []
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
