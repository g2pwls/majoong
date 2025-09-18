"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link from next/link
import HorseRegistrySection from "@/components/farm/edit/HorseRegistrySection";
import { Farm } from "@/types/farm";

export default function IntroPanel({ farm }: { farm: Farm }) {
  const [deadlineText, setDeadlineText] = useState<string>("");

  useEffect(() => {
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
  }, []);

  return (
    <section id="panel-intro" className="flex flex-col">
      
      {/* 목장 소개 섹션 */}
      {farm?.description && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">목장 소개</h3>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {farm.description}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-end">
        <div className="flex flex-row">
          {/* Countdown Text */}
          {deadlineText && (
            <div className="mr-4 mb-2 text-sm text-gray-600">
              {deadlineText}
            </div>
          )}

          {/* Reporting Button with Link */}
          <Link
            href={`/support/${farm?.id}/report`} // Link to the report page
          >
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              목장 운영 보고하기
            </button>
          </Link>
        </div>
        
        {/* Horse registry section */}
        <HorseRegistrySection farmUuid={farm?.id || ""} />
      </div>
    </section>
  );
}
