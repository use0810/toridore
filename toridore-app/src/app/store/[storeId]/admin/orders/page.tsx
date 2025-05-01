'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import supabase from '@/lib/supabase';
import OrderCard from '@/components/order/OrderCard';
import CompletedOrdersModal from '@/components/order/CompletedOrdersModal';
import { useFetchOrders } from '@/lib/manager/useFetchOrders';
import { useOrderRealtimeSync } from '@/lib/manager/useOrderRealtimeSync';

export default function AdminPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { orders, loading, fetchAllOrders } = useFetchOrders(storeId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  

  const sortedEntries = Object.entries(orders).sort(
    ([, aDetails], [, bDetails]) => {
      const aTime = aDetails[0]?.created_at || '';
      const bTime = bDetails[0]?.created_at || '';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    }
  );

  const pendingOrders = sortedEntries.filter(
    ([, details]) => details[0]?.status !== 'completed'
  );

  const completedOrders = sortedEntries.filter(
    ([, details]) => details[0]?.status === 'completed'
  );

  const completedOrdersObj = Object.fromEntries(completedOrders);

  useOrderRealtimeSync({
  storeId,
  onNewOrderId: async (newOrderId) => {
    console.log('🆕 新しい注文を取得中:', newOrderId);
    await fetchAllOrders(); // ← 既存の取得ロジックを使って全件再取得
  },
});
  
useEffect(() => {
  if (storeId) {
    fetchAllOrders(); // storeId が使えるようになったら初回データを取得
  }
}, [storeId, fetchAllOrders]);

  // 注文を完了にする関数
  const markAsCompleted = async (orderId: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    if (error) {
      console.error(`❌ 注文 ${orderId} の完了処理に失敗:`, error.message);
    } else {
      console.log(`✅ 注文 ${orderId} を完了状態に変更しました`);
      await fetchAllOrders();
    }
  };

  // 完了状態を「注文一覧」に戻す関数
  const markAsPending = async (orderId: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'pending' })
      .eq('id', orderId);

    if (error) {
      console.error(`❌ 注文 ${orderId} の完了処理から戻すに失敗:`, error.message);
    } else {
      console.log(`✅ 注文 ${orderId} を注文一覧に戻しました`);
      await fetchAllOrders();
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-4">注文一覧</h1>
      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : pendingOrders.length === 0 ? (
        <p className="text-gray-500">現在、処理中の注文はありません。</p>
      ) : (
        <ul className="space-y-6">
          {pendingOrders.map(([orderId, details]) => (
            <OrderCard
              key={orderId}
              orderId={Number(orderId)}
              details={details}
              onComplete={markAsCompleted}
            />
          ))}
        </ul>
      )}

      {completedOrders.length > 0 && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gray-700 text-white rounded shadow hover:bg-gray-800"
        >
          完了注文一覧（{completedOrders.length}件）
        </button>
      )}

      {isModalOpen && (
        <CompletedOrdersModal
          orders={completedOrdersObj}
          onClose={() => setIsModalOpen(false)}
          onMarkAsPending={markAsPending}
        />
      )}
    </main>
  );
}