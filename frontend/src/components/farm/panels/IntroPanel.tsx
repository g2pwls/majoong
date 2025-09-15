"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link from next/link
import HorseRegistrySection from "@/components/farm/edit/HorseRegistrySection";

type Horse = {
  id?: string | number;
  horseNo: string;
  hrNm?: string;
  birthDt?: string;
  breed?: string;
  sex?: string;
  image?: string;
};

export default function IntroPanel({ farm }: { farm: any }) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [deadlineText, setDeadlineText] = useState<string>("");

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
          hrNm: h.hrNm,
          birthDt:
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

    // Calculate the deadline (Sunday) and show the countdown
    const getDeadlineText = () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, etc.
      const daysUntilSunday = (7 - dayOfWeek) % 7; // Days until next Sunday

      const deadlineDate = new Date(today);
      deadlineDate.setDate(today.getDate() + daysUntilSunday); // Set to next Sunday
      const openDate = new Date(deadlineDate);
      openDate.setDate(deadlineDate.getDate() - 2); // Friday (open day)

      // Only show the countdown on Friday, Saturday, or Sunday
      if (today >= openDate && today <= deadlineDate) {
        const daysLeft = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        switch (daysLeft) {
          case 2:
            setDeadlineText("마감일 D-2");
            break;
          case 1:
            setDeadlineText("마감일 D-1");
            break;
          case 0:
            setDeadlineText("마감일 D-Day");
            break;
          default:
            setDeadlineText("");
            break;
        }
      }
    };

    getDeadlineText();

    return () => {
      alive = false;
    };
  }, [farm?.farm_uuid, farm?.id]);

  return (
    <section id="panel-intro" className="flex flex-col items-end">
      <div className="flex flex-row">
        {/* Countdown Text */}
        {deadlineText && (
          <div className="mr-4 mb-2 text-sm text-gray-600">
            {deadlineText}
          </div>
        )}

        {/* Reporting Button with Link */}
        <Link
          href={`/support/${farm?.farm_uuid ?? farm?.id}/report`} // Link to the report page
        >
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            목장 운영 보고하기
          </button>
        </Link>
      </div>
      
      {/* Horse registry section */}
      <HorseRegistrySection horses={horses} farmUuid={farm?.farm_uuid ?? farm?.id} />
    </section>
  );
}
