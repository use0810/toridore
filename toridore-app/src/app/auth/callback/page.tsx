'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import checkUserStore from '@/lib/manager/checkUserStore';

export default function AuthCallbackPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      const { user, store } = await checkUserStore();
      if (!user) {
        setAuthUser(null);
        setLoading(false);
        return;
      }
      setAuthUser(user);

      if (!store) {
        router.replace('/onboard');
        return;
      }
      router.replace(`/store/${store.id}/admin`);
    };

    fetch();
  }, [router]);

  if (loading) return <p className="p-6">ユーザー確認中...</p>;

  return (
    <div className="p-4 bg-gray-100 rounded">
      {authUser ? (
        <p>👤 ログイン中: {authUser.email}</p>
      ) : (
        <>
          <p className="text-gray-700 mb-2">
            認証エラーが発生しました。お手数ですが、もう一度登録をお願いいたします。
          </p>
          <p className="text-gray-700 mb-4">
            何度も表示される場合は、サポートまでご連絡ください。
          </p>
          <button
            onClick={() => router.replace('/register')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            新規登録ページへ
          </button>
        </>
      )}
    </div>
  );
}
