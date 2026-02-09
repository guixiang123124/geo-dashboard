'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-lg mx-auto p-6 text-center space-y-6 pt-24">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
      <h1 className="text-3xl font-bold text-slate-900">Payment Successful!</h1>
      <p className="text-slate-600">
        Your subscription is now active. You can start using all your plan features immediately.
      </p>
      <Link href="/audit">
        <Button className="bg-violet-600 hover:bg-violet-700 px-8">
          Start a Diagnosis
        </Button>
      </Link>
    </div>
  );
}
