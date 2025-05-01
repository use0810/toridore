'use client';

import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { submitOrder } from '@/lib/customer/actions/submitOrder';
import { useCartStore } from '@/lib/customer/store/cartStore';
import supabase from '@/lib/supabase';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

export default function CartPage() {
  const { tableId } = useParams();
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; duration: number } | null>(null);

  const cartItems = items
    .map((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      return menu
        ? {
            ...menu,
            quantity: item.quantity,
            total: menu.price * item.quantity,
          }
        : null;
    })
    .filter(Boolean) as (MenuItem & { quantity: number; total: number })[];

  const total = cartItems.reduce((acc, item) => acc + item.total, 0);

  useEffect(() => {
    const fetchStoreAndMenus = async () => {
      const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('store_id')
        .eq('id', tableId)
        .maybeSingle();

      if (!table || tableError) {
        setLoading(false);
        setToast({ message: 'テーブル情報の取得に失敗しました', type: 'error', duration: 3000 });
        return;
      }

      setStoreId(table.store_id);

      const { data: menusData, error: menuError } = await supabase
        .from('menus')
        .select('id, name, price')
        .eq('store_id', table.store_id);

      if (menusData && !menuError) {
        setMenus(menusData);
      } else {
        setToast({ message: 'メニューの取得に失敗しました', type: 'error', duration: 3000 });
      }

      setLoading(false);
    };

    fetchStoreAndMenus();
  }, [tableId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success', duration: number = 2000) => {
    setToast({ message, type, duration });
  };

  return (
    <main className="p-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">カート内容</h1>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">読み込み中...</p>
      ) : cartItems.length === 0 ? (
        <>
          <p className="mb-6">カートに商品がありません。</p>
          <Link
            href={`/store/${storeId}/table/${tableId}/order`}
            className="block w-full text-center py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            メニュー一覧に戻る
          </Link>
        </>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li key={item.id} className="border p-4 rounded shadow">
                <h2 className="font-semibold">{item.name}</h2>
                <div className="flex justify-between items-center mt-2">
                  <span>数量: {item.quantity}</span>
                  <span>{item.total}円</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <p className="text-xl font-bold">合計: {total}円</p>
          </div>

          <button
            onClick={() => setConfirmOrder(true)}
            className="mt-6 w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? '送信中...' : '注文する'}
          </button>

          <Link
            href={`/store/${storeId}/table/${tableId}/order`}
            className="mt-3 block w-full text-center py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            メニュー一覧に戻る
          </Link>
        </>
      )}

      {confirmOrder && (
        <Modal
          title="注文内容確認"
          message={
            cartItems.map((item) => `${item.name} × ${item.quantity}`).join('\n') +
            `\n合計：${total}円`
          }
          confirmText={submitting ? '送信中...' : '注文する'}
          confirmDisabled={submitting}
          onConfirm={async () => {
            setSubmitting(true);
            const { success } = await submitOrder({
              tableId: tableId as string,
              cartItems: cartItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
              })),
            });

            setSubmitting(false);
            setConfirmOrder(false);

            if (success) {
              clearCart();
              showToast('注文が完了しました！', 'success');
              
              // テーブルの状態を「occupied」に更新
              await supabase
              .from('tables')
              .update({ status: 'occupied' })
              .eq('id', tableId);

              setTimeout(() => {
                router.push(`/store/${storeId}/table/${tableId}/order`);
              }, 2000);
            } else {
              showToast('注文処理に失敗しました。もう一度お試しください', 'error');
            }
          }}
          onCancel={() => setConfirmOrder(false)}
        />
      )}
    </main>
  );
}
