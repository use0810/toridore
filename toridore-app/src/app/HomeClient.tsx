'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import getCurrentUser from '@/lib/session';
import storeSupabase from '@/lib/storeSupabase';

export function HomeClient() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const user = await getCurrentUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: store, error } = await storeSupabase
        .from('stores')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('店舗情報取得エラー', error.message);
        router.replace('/onboard');
        return;
      }

      if (store) {
        router.replace(`/store/${store.id}/admin`);
      } else {
        router.replace('/onboard');
      }
    };

    check();
  }, [router]);

  return <p className="text-center p-10">リダイレクト中です…</p>;
}
