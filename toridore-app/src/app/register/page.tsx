'use client';

import { translateAuthError } from '@/lib/manager/translateError';
import storeSupabase from '@/lib/storeSupabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('メールアドレスとパスワードを入力してください。');
      setLoading(false);
      return;
    }

    try {
      const {data, error } = await storeSupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          // emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      console.log('✅ signUp response:', data);
      console.log('⚠️ signUp error:', error);
      // await storeSupabase.auth.signOut();
      console.log('🧼 セッションを signUp 直後に手動でクリアしました');

      if (error) {
        setErrorMsg(translateAuthError(error.message));
      } else {
        setSuccessMsg('仮登録が完了しました！確認メールをご確認ください。');
        setTimeout(() => {
          router.push('/login');
        }, 3000); // 3秒後に自動遷移
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrorMsg(translateAuthError(e.message));
      } else {
        setErrorMsg('不明なエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">新規登録</h1>

      {errorMsg && <p className="text-red-500 mb-4 text-sm">{errorMsg}</p>}
      {successMsg && <p className="text-green-600 mb-4 text-sm">{successMsg}</p>}

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
        autoComplete="new-password"
      />
      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? '登録中…' : '登録'}
      </button>
    </main>
  );
}
