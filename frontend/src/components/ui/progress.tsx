'use client';

import * as React from 'react';

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
}

export function Progress({ value = 0, max = 100, className = '' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className="h-full bg-violet-600 transition-all rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
