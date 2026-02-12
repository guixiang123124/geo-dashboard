'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SchwabCallbackPage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const authCode = searchParams.get('code');
    if (authCode) {
      setCode(authCode);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Schwab OAuth Callback</h1>
        {code ? (
          <div>
            <p className="text-green-600 font-medium mb-2">✅ Authorization received</p>
            <p className="text-sm text-slate-500 break-all">Code: {code}</p>
          </div>
        ) : (
          <p className="text-slate-600">Waiting for authorization...</p>
        )}
        <p className="text-xs text-slate-400 mt-4">Status: 200 OK</p>
      </div>
    </div>
  );
}
