// app/api/ocr/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // 대용량 바디/이미지 처리를 위해 Node 런타임 권장

type OcrRequestBody = {
  data: string;          // 헤더 없는 순수 base64
  format?: 'jpg' | 'jpeg' | 'png' | 'webp';
  filename?: string;
  lang?: 'ko' | 'eng' | string; // 복수언어 "kor+eng" 같은 건 Document OCR이 아니라 Tesseract용 표기라 보통 'ko' 권장
};

interface BoundingPoly {
  vertices: Array<{ x?: number; y?: number }>;
}

interface Field {
  boundingPoly?: BoundingPoly;
  inferText: string;
}

function sortFieldsByReadingOrder(fields: Field[]) {
  // boundingPoly 기준으로 위→아래, 좌→우 정렬 (간단 버전)
  const getCenter = (fp: Field) => {
    const vs = fp?.boundingPoly?.vertices ?? [];
    const xs = vs.map((v) => v.x ?? 0);
    const ys = vs.map((v) => v.y ?? 0);
    const cx = xs.reduce((a: number, b: number) => a + b, 0) / (xs.length || 1);
    const cy = ys.reduce((a: number, b: number) => a + b, 0) / (ys.length || 1);
    return { cx, cy };
  };

  return [...fields].sort((a, b) => {
    const { cx: ax, cy: ay } = getCenter(a);
    const { cx: bx, cy: by } = getCenter(b);
    // 줄 단위가 조금 띄워져 있으면 y 우선, 같은 줄이면 x
    if (Math.abs(ay - by) > 10) return ay - by;
    return ax - bx;
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log("OCR API 호출됨 - URL:", req.url);
    console.log("OCR API 호출됨 - Headers:", Object.fromEntries(req.headers.entries()));
    
    const { data, format = 'jpg', filename = 'upload', lang = 'ko' } =
      (await req.json()) as OcrRequestBody;

    console.log("요청 데이터:", { format, filename, lang, dataLength: data?.length });

    if (!data) {
      console.log("이미지 데이터 없음");
      return NextResponse.json({ error: 'NO_IMAGE_DATA' }, { status: 400 });
    }

    console.log("환경 변수 확인:", {
      CLOVA_OCR_INVOKE_URL: process.env.CLOVA_OCR_INVOKE_URL ? '설정됨' : '설정되지 않음',
      CLOVA_OCR_SECRET: process.env.CLOVA_OCR_SECRET ? '설정됨' : '설정되지 않음',
      NODE_ENV: process.env.NODE_ENV
    });

    // CLOVA OCR 환경 변수가 없으면 에러 반환
    if (!process.env.CLOVA_OCR_INVOKE_URL || !process.env.CLOVA_OCR_SECRET) {
      console.log("CLOVA OCR 환경 변수가 설정되지 않음");
      return NextResponse.json({ 
        error: 'CLOVA_OCR_NOT_CONFIGURED', 
        detail: 'CLOVA OCR API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.' 
      }, { status: 500 });
    }

    console.log("실제 CLOVA OCR 호출 - URL:", process.env.CLOVA_OCR_INVOKE_URL);

    const body = {
      version: 'V2',
      requestId: `req-${Date.now()}`,
      timestamp: Date.now(),
      lang, // 'ko' 권장
      images: [
        {
          format: format === 'jpeg' ? 'jpg' : format,
          name: filename,
          data, // base64 (dataURL 헤더 제거된 순수 값)
        },
      ],
    };

    console.log("CLOVA OCR 요청 바디:", { ...body, images: [{ ...body.images[0], data: body.images[0].data.substring(0, 100) + '...' }] });

    const r = await fetch(process.env.CLOVA_OCR_INVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OCR-SECRET': process.env.CLOVA_OCR_SECRET,
      },
      body: JSON.stringify(body),
    });

    console.log("CLOVA OCR 응답 상태:", r.status, r.statusText);
    console.log("CLOVA OCR 응답 헤더:", Object.fromEntries(r.headers.entries()));

    const text = await r.text();
    console.log("CLOVA OCR 응답 텍스트:", text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    
    if (!r.ok) {
      // CLOVA 측 에러를 그대로 프록시
      console.log("CLOVA OCR 에러 발생:", text);
      return NextResponse.json({ error: 'CLOVA_ERROR', detail: text }, { status: r.status });
    }

    const json = JSON.parse(text);
    const fields = json?.images?.[0]?.fields ?? [];
    const ordered = sortFieldsByReadingOrder(fields);

    // 줄바꿈 감지 개선: y 간격이 벌어지면 개행
    let lines = '';
    let prevCy = -9999;
    for (const f of ordered) {
      const vs = f?.boundingPoly?.vertices ?? [];
      const cy = vs.reduce((a: number, v) => a + (v?.y ?? 0), 0) / (vs.length || 1);
      if (Math.abs(cy - prevCy) > 18) {
        // 새 줄로 판단
        if (lines) lines += '\n';
        lines += f.inferText;
      } else {
        lines += (lines.endsWith('\n') || lines.length === 0 ? '' : ' ') + f.inferText;
      }
      prevCy = cy;
    }

    return NextResponse.json({
      text: lines || '',
      fields: ordered,   // 필요 시 프런트에서 하이라이트/좌표 표시용
      raw: json,         // 디버깅용(운영에선 제거 가능)
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: 'INTERNAL', detail: errorMessage },
      { status: 500 },
    );
  }
}
