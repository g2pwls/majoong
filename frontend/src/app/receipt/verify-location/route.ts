import { NextRequest, NextResponse } from "next/server";
import { validateGpsLocation } from "@/lib/gpsUtils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farmUuid, imageLat, imageLon, tolerance = 1000 } = body;

    if (!farmUuid || imageLat === undefined || imageLon === undefined) {
      return NextResponse.json(
        { error: "농장 UUID, 위도, 경도가 필요합니다." },
        { status: 400 }
      );
    }

    // 농장 API에서 농장 데이터 가져오기
    const farmResponse = await fetch(`${request.nextUrl.origin}/receipt/farms/${farmUuid}`);
    if (!farmResponse.ok) {
      return NextResponse.json(
        { error: "농장 정보를 가져올 수 없습니다." },
        { status: 404 }
      );
    }

    const farmData = await farmResponse.json();
    
    if (!farmData.latitude || !farmData.longitude) {
      return NextResponse.json(
        { error: "농장의 좌표 정보가 없습니다." },
        { status: 404 }
      );
    }

    // GPS 위치 검증
    const result = validateGpsLocation(
      imageLat,
      imageLon,
      farmData.latitude,
      farmData.longitude,
      tolerance,
      farmData.farm_name
    );

    return NextResponse.json({
      success: true,
      result: {
        isValid: result.isValid,
        distance: Math.round(result.distance),
        message: result.message,
        farmCoordinates: {
          lat: farmData.latitude,
          lon: farmData.longitude
        },
        imageCoordinates: {
          lat: imageLat,
          lon: imageLon
        },
        farmName: farmData.farm_name
      }
    });

  } catch (error) {
    console.error("위치 검증 API 오류:", error);
    return NextResponse.json(
      { error: "위치 검증 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
