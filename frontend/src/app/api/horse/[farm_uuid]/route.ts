import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ------- 타입 -------
export type Horse = {
  id: number;
  farm_id: string;
  horseNo: string;        // 반드시 문자열! (선행 0 유지)
  hrNm: string;
  birthDt: string;      // YYYY-MM-DD
  sex?: string;
  color?: string;
  breed?: string;
  prdCty?: string;
  rcCnt?: number;
  fstCnt?: number;
  sndCnt?: number;
  amt?: number;
  discardDt?: string | null;
  fdebutDt?: string | null;
  lchulDt?: string | null;
  horse_url?: string;         // 카드에 쓰는 이미지
};

// ------- 메모리 저장소 (farm_uuid 별) -------
const store: Record<string, Horse[]> = {};

// 초기 데이터 주입 헬퍼
function ensureSeed(farm_uuid: string) {
  if (store[farm_uuid]) return;

  if (farm_uuid === "1111-2222-3333-4444") {
    store[farm_uuid] = [
      {
        id: 1,
        farm_id: "1111-2222-3333-4444",
        horseNo: "0038020",
        hrNm: "청담도끼",
        birthDt: "20140517",
        sex: "거",
        color: "밤색",
        breed: "더러브렛",
        prdCty: "미국",
        rcCnt: 39,
        fstCnt: 18,
        sndCnt: 7,
        amt: 3095000000,
        discardDt: "20220803",
        fdebutDt: "20160924",
        lchulDt: "20220626",
        horse_url: "/horses/mal.png",
      },
      {
        id: 2,
        farm_id: "1111-2222-3333-4444",
        horseNo: "0038024",
        hrNm: "허리케인러너",
        birthDt: "20140314",
        sex: "거",
        color: "밤색",
        breed: "더러브렛",
        prdCty: "미국",
        rcCnt: 8,
        fstCnt: 0,
        sndCnt: 2,
        amt: 25500000,
        discardDt: "20190910",
        fdebutDt: "20170210",
        lchulDt: "20190419",
        horse_url: "/horses/mal1.jpg",
      },
      {
        id: 3,
        farm_id: "1111-2222-3333-4444",
        horseNo: "0038025",
        hrNm: "아임유어파더",
        birthDt: "20140206",
        sex: "수",
        color: "갈색",
        breed: "더러브렛",
        prdCty: "미국",
        rcCnt: 14,
        fstCnt: 6,
        sndCnt: 3,
        amt: 724040000,
        discardDt: "20181017",
        fdebutDt: "20160807",
        lchulDt: "20180729",
        horse_url: "/horses/mal2.jpg",
      },
      {
        id: 4,
        farm_id: "1111-2222-3333-4444",
        horseNo: "0038021",
        hrNm: "경주불패",
        birthDt: "20140419",
        sex: "거",
        color: "흑갈색",
        breed: "더러브렛",
        prdCty: "미국",
        rcCnt: 6,
        fstCnt: 2,
        sndCnt: 2,
        amt: 102150000,
        discardDt: "20180308",
        fdebutDt: "20170319",
        lchulDt: "20170924",
        horse_url: "/horses/mal3.jpg",
      },
      {
        id: 5,
        farm_id: "1111-2222-3333-4444",
        horseNo: "0038027",
        hrNm: "킹칸타로스",
        birthDt: "20140222",
        sex: "거",
        color: "밤색",
        breed: "더러브렛",
        prdCty: "미국",
        rcCnt: 4,
        fstCnt: 0,
        sndCnt: 0,
        amt: 0,
        discardDt: "20170720",
        fdebutDt: "20161007",
        lchulDt: "20170714",
        horse_url: "/horses/mal4.jpg",
      },
    ];
  }
}

// ------- GET: 말 목록 -------
export async function GET(
  _req: Request,
  { params }: { params: { farm_uuid: string } }
) {
  ensureSeed(params.farm_uuid);
  
  // 만약 해당 farm_uuid에 말 데이터가 없다면, 404 에러를 반환
  if (!store[params.farm_uuid]) {
    return NextResponse.json({ error: `No horses found for farm ${params.farm_uuid}` }, { status: 404 });
  }

  return NextResponse.json(store[params.farm_uuid]);
}

// ------- POST: 말 추가/업sert(마번 중복 시 교체) -------
export async function POST(
  req: Request,
  { params }: { params: { farm_uuid: string } }
) {
  ensureSeed(params.farm_uuid);

  const body = (await req.json()) as Partial<Horse>;
  // 최소 입력 검증
  if (!body?.horseNo || !body?.hrNm) {
    return NextResponse.json(
      { message: "horseNo(문자열)와 hrNm은 필수입니다." },
      { status: 400 }
    );
  }

  // horseNo를 문자열로 강제(선행 0 유지)
  const horseNo = String(body.horseNo);

  // 기존 말 찾기
  const list = store[params.farm_uuid];
  const idx = list.findIndex((h) => h.horseNo === horseNo);

  const next: Horse = {
    id: idx >= 0 ? list[idx].id : Math.max(0, ...list.map((h) => h.id)) + 1,
    farm_id: params.farm_uuid,
    horseNo,
    hrNm: body.hrNm!,
    birthDt: body.birthDt ?? "",
    sex: body.sex,
    color: body.color,
    breed: body.breed,
    prdCty: body.prdCty,
    rcCnt: body.rcCnt ?? 0,
    fstCnt: body.fstCnt ?? 0,
    sndCnt: body.sndCnt ?? 0,
    amt: body.amt ?? 0,
    discardDt: body.discardDt ?? null,
    fdebutDt: body.fdebutDt ?? null,
    lchulDt: body.lchulDt ?? null,
    horse_url: body.horse_url,
  };

  if (idx >= 0) list[idx] = next;
  else list.push(next);

  return NextResponse.json(next, { status: idx >= 0 ? 200 : 201 });
}
