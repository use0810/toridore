'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

type UnpaidTable = {
  table_id: string;
  table_name: string;
  status: string;
  total_amount: number;
  order_count: number;
};

export default function PaymentsAdminPage() {
  const { storeId } = useParams() as { storeId: string };
  const router = useRouter();
  const [tables, setTables] = useState<UnpaidTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnpaidTables = async () => {
      const { data, error } = await supabase
        .from('unpaid_table_summaries')
        .select('*');

      if (error) {
        console.error('未会計テーブルの取得に失敗:', error.message);
      } else {
        setTables(data);
      }

      setLoading(false);
    };

    fetchUnpaidTables();
  }, []);

  const handleCheckout = (tableId: string) => {
    router.push(`/store/${storeId}/admin/payments/${tableId}`);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">未会計テーブル一覧</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : tables.length === 0 ? (
        <p>未会計のテーブルはありません。</p>
      ) : (
        <ul className="space-y-4">
          {tables.map((table) => (
            <li
              key={table.table_id}
              className="border rounded p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-lg font-semibold">{table.table_name}</p>
                <p className="text-gray-600">
                  合計：¥{table.total_amount} ／ 注文数：{table.order_count}件
                </p>
              </div>
              <button
                onClick={() => handleCheckout(table.table_id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                会計する
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
