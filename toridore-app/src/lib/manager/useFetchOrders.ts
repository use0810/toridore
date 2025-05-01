import { OrderDetail } from "@/types/orders";
import { useCallback, useEffect, useState } from "react";
import supabase from "../supabase";

export function useFetchOrders(storeId: string) {
  const [orders, setOrders] = useState<Record<number, OrderDetail[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('order_details_view')
      .select('*')
      .eq('store_id', storeId)
      .in('status', ['pending', 'completed']);

    if (error) {
      console.error('❌ 注文の取得に失敗:', error.message);
      return;
    }

    // グループ化（order_idごとにまとめる）
    const grouped = data.reduce((acc, cur) => {
      const key = cur.order_id;
      acc[key] = acc[key] || [];
      acc[key].push(cur);
      return acc;
    }, {} as Record<number, OrderDetail[]>);

    setOrders(grouped);
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    void fetchAllOrders();
  }, [fetchAllOrders]);

  return { orders, setOrders, loading, fetchAllOrders };
}
