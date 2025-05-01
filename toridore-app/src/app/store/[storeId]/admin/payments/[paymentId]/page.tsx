'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

type OrderItem = {
  order_id: number;
  menu_name: string;
  quantity: number;
  total_price: number;
  table_name: string;
};

export default function PaymentDetailPage() {
  const { storeId, paymentId } = useParams() as {
    storeId: string;
    paymentId: string;
  };
  const router = useRouter();

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableName, setTableName] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);

  useEffect(() => {
    const fetchUnpaidOrderDetails = async () => {
      // `payment_orders` に未登録の注文だけ取得（＝未会計の注文）
      const { data, error } = await supabase.rpc('get_unpaid_order_details_by_table_id', {
        target_table_id: paymentId,
      });

      if (error) {
        console.error('注文詳細の取得に失敗:', error.message);
      } else {
        setOrderItems(data);
        if (data.length > 0) {
          setTableName(data[0].table_name);
          const sum = data.reduce(
           (acc: number, item: OrderItem) => acc + item.total_price,
           0
         );
          setTotalAmount(sum);
        }
      }

      setLoading(false);
    };

    if (storeId && paymentId) {
      fetchUnpaidOrderDetails();
    }
  }, [storeId, paymentId]);

  const handleConfirmPayment = async () => {
    const confirm = window.confirm('この注文を会計済みにしますか？');
    if (!confirm) return;


    // ✅ 2. paymentレコードを作成（修正済み）
    const { data: payment, error: insertError } = await supabase
    .from('payments')
    .insert({
      store_id: storeId,
      amount: totalAmount,
      method: 'cash', // 仮で「現金」指定
      paid_at: new Date(),
    })
    .select()
    .single();

    if (insertError || !payment) {
      alert('会計の登録に失敗しました');
      return;
    }

    // ✅ 3. payment_ordersに未会計の注文を紐づける
    const unpaidOrderIds = [...new Set(orderItems.map((item) => item.order_id))];

    const { error: linkError } = await supabase
      .from('payment_orders')
      .insert(unpaidOrderIds.map((order_id) => ({
        payment_id: payment.id,
        order_id,
      })));

    if (linkError) {
      alert('注文との紐づけに失敗しました');
      return;
    }

    // ✅ 4. テーブルのステータスをopenに戻す
    await supabase
      .from('tables')
      .update({ status: 'open' })
      .eq('id', paymentId);

    // ✅ 5. ordersのステータスを「paid」に更新
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .in('id', unpaidOrderIds);

    alert('会計が完了しました！');
    router.push(`/store/${storeId}/admin/payments`);
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">テーブル「{tableName}」の会計</h1>

      {loading ? (
  <p>読み込み中...</p>
) : orderItems.length === 0 ? (
  <p>未会計の注文がありません。</p>
) : (
  <div>
    <ul className="mb-4">
      {orderItems.map((item, idx) => (
        <li key={idx} className="flex justify-between py-1 border-b">
          <span>
            {item.menu_name} × {item.quantity}
          </span>
          <span>¥{item.total_price}</span>
        </li>
      ))}
    </ul>
    <p className="text-right font-bold text-lg mb-4">合計：¥{totalAmount}</p>

    {/* 預り金入力欄 */}
    <div className="mb-4">
      <label htmlFor="receivedAmount" className="block mb-1 font-medium">
        預り金（円）
      </label>
      <input
        id="receivedAmount"
        type="number"
        value={receivedAmount}
        onChange={(e) => setReceivedAmount(Number(e.target.value))}
        className="w-full border rounded p-2"
        placeholder="お客様から受け取った金額を入力"
      />
    </div>

    {/* お釣り表示 */}
    <p className="text-right font-bold mb-4">
      お釣り： ¥{Math.max(receivedAmount - totalAmount, 0)}
    </p>

    {/* 会計ボタン（不足時は非活性） */}
    <button
      onClick={handleConfirmPayment}
      className={`w-full py-2 rounded text-white ${
        receivedAmount >= totalAmount ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
      }`}
      disabled={receivedAmount < totalAmount}
    >
      会計を完了する
    </button>
  </div>
)}
    </main>
  );
}
