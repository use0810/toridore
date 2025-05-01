'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

interface OrderItem {
  order_item_id: string | number;
  menu_id: string;
  menu_name: string;
  quantity: number;
  price: number;
  total_price: number;
}

export default function EditOrderPage() {
  const { orderId, storeId } = useParams<{ orderId: string; storeId: string }>();
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLogs, setEditLogs] = useState<
    { editor: string | null; created_at: string; changes: { menu_name: string; quantity: number; price: number }[] }[]
  >([]);
  const [removedItems, setRemovedItems] = useState<OrderItem[]>([]);
  const [menus, setMenus] = useState<{ id: string; name: string; price: number }[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);

  useEffect(() => {
    const fetchOrderItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_details_view')
        .select('order_item_id, menu_id, menu_name, quantity, price, total_price')
        .eq('order_id', Number(orderId));
      if (!error && data) setItems(data);
      setLoading(false);
    };
    if (orderId) void fetchOrderItems();
  }, [orderId]);

  useEffect(() => {
    const fetchEditLogs = async () => {
      const { data, error } = await supabase
        .from('order_edit_logs')
        .select('editor, created_at, changes')
        .eq('order_id', Number(orderId))
        .order('created_at', { ascending: false });
      if (!error && data) setEditLogs(data);
    };
    if (orderId) void fetchEditLogs();
  }, [orderId]);

  useEffect(() => {
    const fetchMenus = async () => {
      const { data } = await supabase
        .from('menus')
        .select('id, name, price')
        .eq('store_id', storeId)
        .eq('is_available', true);
      setMenus(data ?? []);
    };
    if (storeId) void fetchMenus();
  }, [storeId]);

  const handleQuantityChange = (index: number, newQuantity: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQuantity;
      updated[index].total_price = newQuantity * updated[index].price;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const removed = updated.splice(index, 1);
      setRemovedItems((prevRemoved) => [...prevRemoved, ...removed]);
      return updated;
    });
  };

  const handleAddItem = () => {
    const menu = menus.find((m) => m.id === selectedMenuId);
    if (!menu) return;
    setItems((prev) => [
      ...prev,
      {
        order_item_id: `temp-${Date.now()}`,
        menu_id: menu.id,
        menu_name: menu.name,
        quantity: newQuantity,
        price: menu.price,
        total_price: menu.price * newQuantity,
      },
    ]);
  };

  const handleSave = async () => {
    const { error: logError } = await supabase.from('order_edit_logs').insert({
      order_id: Number(orderId),
      changes: items,
    });
    if (logError) return alert('編集ログの保存に失敗しました');

    const deletes = await Promise.all(
      removedItems.map((item) =>
        supabase.from('order_items').delete().eq('id', item.order_item_id)
      )
    );
    if (deletes.some((res) => res.error)) return alert('削除処理に失敗しました');

    const newItems = items.filter((item) => typeof item.order_item_id === 'string');
    const inserts = await Promise.all(
      newItems.map((item) =>
        supabase.from('order_items').insert({
          order_id: Number(orderId),
          menu_id: item.menu_id,
          quantity: item.quantity,
          price: item.price,
        })
      )
    );
    if (inserts.some((res) => res.error)) return alert('追加処理に失敗しました');

    const updates = await Promise.all(
      items
        .filter((item) => typeof item.order_item_id === 'number')
        .map((item) =>
          supabase
            .from('order_items')
            .update({
              quantity: item.quantity,
              total_price: item.quantity * item.price,
            })
            .eq('id', item.order_item_id)
        )
    );
    if (updates.some((res) => res.error)) return alert('一部の更新に失敗しました');

    alert('保存しました！');
    router.back();
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">注文の編集</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          <div className="mb-6 border rounded p-4">
            <h2 className="font-semibold mb-2">メニューを追加</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <select
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                className="border rounded px-3 py-2 w-full sm:w-auto"
              >
                <option value="">-- メニューを選択 --</option>
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}（¥{menu.price}）
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={newQuantity}
                onChange={(e) => setNewQuantity(Number(e.target.value))}
                className="border rounded px-3 py-2 w-24 text-center"
              />
              <button
                onClick={handleAddItem}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={!selectedMenuId}
              >
                追加する
              </button>
            </div>
          </div>

          <ul className="space-y-4 mb-6">
            {items.map((item, index) => (
              <li key={`${item.menu_id}-${index}`} className="border p-4 rounded">
                <p className="font-semibold">{item.menu_name}</p>
                <p>単価: ¥{item.price}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <label className="text-sm">数量：</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                    className="border rounded px-3 py-1 w-24 text-center"
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="ml-auto text-red-600 hover:underline text-sm"
                  >
                    🗑 削除
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center mb-6">
            <button
              className="border px-4 py-2 rounded hover:bg-gray-100"
              onClick={() => router.back()}
            >
              ← 戻る
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              保存する
            </button>
          </div>

          {editLogs.length > 0 && (
            <div className="bg-white border rounded p-4 mb-6">
              <h2 className="font-semibold text-lg mb-3 text-gray-700">編集履歴</h2>
              <ul className="space-y-4 text-sm text-gray-700">
                {editLogs.map((log, index) => (
                  <li key={index} className="border rounded p-3">
                    <div className="text-xs text-gray-500 mb-2">
                      🕒 {new Date(log.created_at).toLocaleString()}
                    </div>
                    <ul className="list-disc pl-5">
                      {log.changes.map((item, i) => (
                        <li key={i}>
                          {item.menu_name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </main>
  );
}