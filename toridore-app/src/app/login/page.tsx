'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import LoginForm from './LoginForm';

function LoginPageInner() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';

  return <LoginForm redirectUrl={redirect} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">読み込み中...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
