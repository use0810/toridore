'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getCurrentUser from '@/lib/session';
import storeSupabase from '@/lib/storeSupabase';
import type { User } from '@supabase/supabase-js';

type Props = {
 user: User;
};

export default function OnboardForm({  }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // ★型を明示！
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser();

      if (!user) {
        console.warn('ユーザー未ログイン、/login に遷移');
        router.replace('/login');
        return;
      }

      const { data: existing } = await storeSupabase
        .from('stores')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (existing) {
        console.info('既存店舗あり、管理画面に遷移');
        router.replace(`/store/${existing.id}/admin`);
        return;
      }

      setUser(user); // ← OKになる！
      setLoading(false);
    };

    load();
  }, [router]);

  if (loading || !user) return <p className="text-center p-10">読み込み中です…</p>;

  return <OnboardForm user={user} />;
}
