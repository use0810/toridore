import { useEffect } from 'react';
import supabase from '@/lib/supabase';


type Params = {
  storeId: string;
  onNewOrderId: (orderId: number) => void;
};

export function useOrderRealtimeSync({ storeId, onNewOrderId }: Params) {
  useEffect(() => {
    if (!storeId) {
      console.warn('[useOrderRealtimeSync] ⚠️ storeId が未定義です');
      return;
    }

    console.log('[useOrderRealtimeSync] ✅ リアルタイム購読開始:', storeId);

    const channel = supabase
      .channel(`orders_realtime_${storeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const orderId = payload.new.id;
          console.log('[useOrderRealtimeSync] 🔔 新規注文検知:', orderId);
          onNewOrderId(orderId);
        }
      )
      .subscribe();

    return () => {
      console.log('[useOrderRealtimeSync] 🔌 購読解除:', storeId);
      supabase.removeChannel(channel);
    };
  }, [storeId, onNewOrderId]);
}
