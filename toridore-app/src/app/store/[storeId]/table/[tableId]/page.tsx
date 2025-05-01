'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function CustomerTopPage() {
  const router = useRouter();
  const params = useParams();

  const storeId = params.storeId as string;
  const tableId = params.tableId as string;

  const [storeName, setStoreName] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreName = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('store_name')
        .eq('id', storeId)
        .maybeSingle(); 

        if (error || !data) {
          console.error('⚠️ ストア名の取得に失敗しました', error?.message);
          return;
        }
        
        setStoreName(data.store_name);
    };

    fetchStoreName();
  }, [storeId]);

  const handleStartOrder = async () => {
    await supabase
      .from('tables')
      .update({ status: 'occupied' })
      .eq('id', tableId);

    router.push(`/store/${storeId}/table/${tableId}/order`);
  };

  return (
    <main className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        {storeName ? `ようこそ、${storeName}へ！` : '店舗名を読み込み中...'}
      </h1>
      <p className="mb-8">ご来店ありがとうございます。</p>
      <button
        onClick={handleStartOrder}
        className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
      >
        注文を始める
      </button>
    </main>
  );
}
