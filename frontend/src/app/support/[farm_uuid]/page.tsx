// src/app/farms/[farm_uuid]/page.tsx
import FarmDetailClient from "./FarmDetailClient";

export default async function FarmDetailPage({ params }: { params: Promise<{ farm_uuid: string }> }) {
  const { farm_uuid } = await params;
  return <FarmDetailClient farm_uuid={farm_uuid} />;
}
