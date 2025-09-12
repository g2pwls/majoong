// src/components/farm/panels/IntroPanel.tsx
"use client";

import { useEffect, useState } from "react";
import HorseRegistrySection from "@/components/farm/edit/HorseRegistrySection";

type Horse = {
  id?: string | number;
  horseNo: string;
  name?: string;
  birthDate?: string;
  breed?: string;
  sex?: string;
  image?: string;
};

export default function IntroPanel({ farm }: { farm: any }) {
  const [horses, setHorses] = useState<Horse[]>([]);

  useEffect(() => {
    const farmId = farm?.farm_uuid ?? farm?.id;
    if (!farmId) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/horse/${farmId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`Failed to fetch horses: ${res.status}`);
        const data = (await res.json()) as any[];
        if (!alive) return;
        const mapped = data.map((h: any) => ({
          id: h.id,
          horseNo: String(h.horseNo),
          name: h.hrNm,
          birthDate:
            typeof h.birthDt === "string" && h.birthDt.length === 8
              ? `${h.birthDt.slice(0, 4)}-${h.birthDt.slice(4, 6)}-${h.birthDt.slice(6, 8)}`
              : h.birthDt,
          breed: h.breed,
          sex: h.sex,
          image: h.horse_url,
        }));
        setHorses(mapped);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [farm?.farm_uuid, farm?.id]);

  return (
    <section id="panel-intro">
      <div className="mb-6">목장 소개 패널</div>
      <HorseRegistrySection horses={horses} />
    </section>
  );
}
