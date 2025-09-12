// src/compents/farm/edit/HorseRegistrySection.tsx
"use client";

type Horse = {
  id?: string | number;
  horseNo: string;
  name?: string;
  birthDate?: string;
  breed?: string;
  sex?: string;
  image?: string;
};

type Props = {
  horses: Horse[];
};

export default function HorseRegistrySection({ horses }: Props) {
  return (
    <section>
      <h2 className="mt-6 text-lg font-semibold">등록된 말</h2>
      {horses.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {horses.map((horse) => (
            <div
              key={horse.id ?? horse.horseNo}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {horse.image ? (
                <img
                  src={horse.image}
                  alt={horse.name ?? "말 이미지"}
                  className="w-full h-48 object-cover bg-gray-50"
                />
              ) : (
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                  이미지 없음
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">{horse.name}</h4>
                </div>
                <p className="text-sm text-gray-500">마번: {horse.horseNo}</p>
                {horse.birthDate && (
                  <p className="text-sm text-gray-500">생년월일: {horse.birthDate}</p>
                )}
                {horse.breed && (
                  <p className="text-sm text-gray-500">품종: {horse.breed}</p>
                )}
                {horse.sex && (
                  <p className="text-sm text-gray-500">성별: {horse.sex}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


