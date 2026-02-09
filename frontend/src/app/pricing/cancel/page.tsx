'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  return (
    <div className="max-w-lg mx-auto p-6 text-center space-y-6 pt-24">
      <XCircle className="w-16 h-16 text-slate-400 mx-auto" />
      <h1 className="text-3xl font-bold text-slate-900">Payment Cancelled</h1>
      <p className="text-slate-600">
        No worries — you weren&apos;t charged. You can upgrade anytime.
      </p>
      <Link href="/pricing">
        <Button variant="outline" className="px-8">
          Back to Pricing
        </Button>
      </Link>
    </div>
  );
}
