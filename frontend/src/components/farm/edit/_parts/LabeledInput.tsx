// src/components/farm/panels/_parts/LabeledInput.tsx
"use client";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

export default function LabeledInput({ label, className, ...props }: Props) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-sm text-neutral-600">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10"
      />
    </label>
  );
}
