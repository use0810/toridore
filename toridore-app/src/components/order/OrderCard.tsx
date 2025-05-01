'use client';

import { OrderDetail } from '@/types/orders';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

type Props = {
  orderId: number;
  details: OrderDetail[];
  onComplete?: (orderId: number) => void;
  onMarkAsPending?: (orderId: number) => void;  // 完了状態から戻すための関数
};

export default function OrderCard({ orderId, details, onComplete, onMarkAsPending }: Props) {
  const storeId = details[0]?.store_id;
  const router = useRouter();

  const handleMarkAsPending = (orderId: number) => {
    console.log(`注文 ${orderId} の状態を「注文一覧」に戻します`);  // コンソールで出力
    if (onMarkAsPending) {
      onMarkAsPending(orderId);
    }
  };

  return (
    <div className="border rounded p-4 shadow relative bg-white">
      <button
        onClick={() => router.push(`/store/${storeId}/admin/orders/${orderId}`)}
        className="absolute top-2 right-2 text-xs text-gray-500 hover:text-gray-700 underline"
      >
        編集
      </button>

      <p className="font-semibold mb-2">
        注文番号: {details[0].order_code}（テーブル: {details[0].table_name}）
      </p>

      <p className="text-sm text-gray-500 mb-2">
        日時: {dayjs(details[0].created_at).format('M/D HH:mm')}
      </p>

      <ul className="pl-5 list-disc text-sm mb-4 marker:text-gray-400">
        {details.map((item, index) => (
          <li key={index}>
            {item.menu_name} × {item.quantity}
          </li>
        ))}
      </ul>

      {onComplete && (
        <button
          onClick={() => onComplete(orderId)}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          完了する
        </button>
      )}

      {onMarkAsPending && (
        <button
          onClick={() => handleMarkAsPending(orderId)}  // 完了から戻す（コンソールで確認）
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-2"
        >
          注文一覧に戻す
        </button>
      )}
    </div>
  );
}
