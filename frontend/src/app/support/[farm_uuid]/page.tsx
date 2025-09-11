// src/app/farms/[farm_uuid]/page.tsx
import FarmDetailClient from "./FarmDetailClient";

export default function FarmDetailPage({ params }: { params: { farm_uuid: string } }) {
  return <FarmDetailClient farm_uuid={params.farm_uuid} />;
}
