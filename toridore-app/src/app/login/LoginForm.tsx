'use client';

import { translateAuthError } from '@/lib/manager/translateError';
import storeSupabase from '@/lib/storeSupabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm({ redirectUrl }: { redirectUrl: string }) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('メールアドレスとパスワードを入力してください。');
      setLoading(false);
      return;
    }

    const { error } = await storeSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(translateAuthError(error.message));
      setLoading(false);
      return;
    }

    const safeRedirect = encodeURIComponent(redirectUrl);
    router.push(`/auth/callback?redirect=${safeRedirect}`);
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">ログイン</h1>

      {errorMsg && (
        <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>
      )}

      <input
        type="email"
        name="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        required
        autoComplete="email"
      />
      <input
        type="password"
        name="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-6"
        required
        autoComplete="current-password"
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'ログイン中…' : 'ログイン'}
      </button>

      <p className="text-center text-sm mt-4">
        アカウントをお持ちでない方は{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          新規登録はこちら
        </Link>
      </p>
    </main>
  );
}
