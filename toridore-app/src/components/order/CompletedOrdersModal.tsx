'use client';

import { OrderDetail } from '@/types/orders';
import OrderCard from './OrderCard';

type Props = {
  orders: Record<number, OrderDetail[]>;
  onClose: () => void;
  onMarkAsPending?: (orderId: number) => void; // 追加: 完了から戻すための関数
  children?: React.ReactNode;
};

export default function CompletedOrdersModal({ orders, onClose, onMarkAsPending, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-start">
      <div
        className={`
          flex flex-col w-full max-w-3xl h-full bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300
        `}
      >
        {/* モーダル上部バー */}
        <div
          className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 p-4 border-b flex justify-center items-center cursor-pointer"
          onClick={onClose}
        >
          <h2 className="text-lg font-semibold text-center text-gray-800">
            ✅ 完了した注文一覧（タップで閉じる）
          </h2>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(orders).map(([orderId, details]) => (
            <div key={orderId}>
              <OrderCard
                orderId={Number(orderId)}
                details={details}
                onMarkAsPending={onMarkAsPending}  // ここで渡す
              />
            </div>
          ))}
        </div>

        {/* children の内容を表示 */}
        {children}
      </div>
    </div>
  );
}
