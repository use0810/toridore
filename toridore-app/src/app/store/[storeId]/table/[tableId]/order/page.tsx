'use client';

import Toast from '@/components/Toast';
import { useCartStore } from '@/lib/customer/store/cartStore';
import supabase from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type MenuItem = {
  updated_at: Date;
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string | null;
  is_available: boolean;
};

export default function MenuListPage() {
  const { storeId, tableId } = useParams();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error';
  } | null>(null);

  const totalCount = useCartStore((state) => state.totalCount());
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchMenus = async () => {
      if (!storeId) return;
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_available', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('メニュー取得エラー:', error.message);
      } else {
        setMenus(data || []);
      }
      setLoading(false);
    };

    if (storeId) fetchMenus();
  }, [storeId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={2500}
          onClose={() => setToast(null)}
        />
      )}

      <main className="p-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">メニュー一覧</h1>

        {loading ? (
          <p>読み込み中...</p>
        ) : menus.length === 0 ? (
          <p>現在、表示できるメニューがありません。</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {menus.map((item: MenuItem) => {
              const quantity = quantities[item.id] || 0;

              const increase = () => {
                setQuantities((prev) => ({ ...prev, [item.id]: quantity + 1 }));
              };

              const decrease = () => {
                if (quantity > 0) {
                  setQuantities((prev) => ({ ...prev, [item.id]: quantity - 1 }));
                }
              };

              const handleAdd = () => {
                if (quantity === 0) {
                  showToast('数量を選んでください', 'error');
                  return;
                }
                addItem(item.id, quantity);
                setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
                showToast(`${item.name}を${quantity}個追加しました！`, 'success');
              };

              return (
                <div key={item.id} className="border rounded p-4 shadow">
                  <Image
                    src={`${item.image_url}?v=${item.updated_at}`}
                    alt={item.name}
                    width={300}
                    height={200}
                    className="w-full object-cover rounded mb-2"
                    style={{ height: 'auto' }}
                  />
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                  <p className="text-right font-bold mb-2">{item.price}円</p>

                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={decrease}
                      className="px-3 py-1 bg-gray-300 rounded text-lg"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{quantity}</span>
                    <button
                      onClick={increase}
                      className="px-3 py-1 bg-gray-300 rounded text-lg"
                    >
                      ＋
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={quantity === 0}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-300"
                  >
                    追加する
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Link
          href={`/store/${storeId}/table/${tableId}/cart`}
          className="relative px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg flex items-center"
        >
          🛒 カートを見る
          {totalCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalCount}
            </span>
          )}
        </Link>
      </footer>
    </>
  );
}
