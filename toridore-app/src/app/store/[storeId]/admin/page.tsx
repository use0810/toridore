"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function AdminDashboardPage() {
  const [todayOrderCount, setTodayOrderCount] = useState<number | null>(null);
  const [monthlySales, setMonthlySales] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 今日の注文数
      const { count, error: orderError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('order_date', new Date().toISOString().slice(0, 10));

      if (orderError) {
        console.error('注文数取得エラー:', orderError);
      } else {
        setTodayOrderCount(count ?? 0);
      }

      // 今月の売上
      const { data: salesData, error: salesError } = await supabase
        .from('payments')
        .select('amount')
        .gte('paid_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (salesError) {
        console.error('売上取得エラー:', salesError);
      } else {
        const total = (salesData || []).reduce((sum, p) => sum + p.amount, 0);
        setMonthlySales(total);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <section className="mb-8">
        <p className="text-gray-700 mb-4">
          現在の営業状況や管理機能のサマリーを確認できます。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border rounded p-4 shadow">
            <p className="text-sm text-gray-500 mb-1">今日の注文数</p>
            <p className="text-xl font-bold">
              {todayOrderCount !== null ? `${todayOrderCount} 件` : '-- 件'}
            </p>
          </div>

          <div className="border rounded p-4 shadow">
            <p className="text-sm text-gray-500 mb-1">今月の売上</p>
            <p className="text-xl font-bold">
              {monthlySales !== null ? `¥${monthlySales.toLocaleString()}` : '-- 円'}
            </p>
          </div>
        </div>
      </section>

      <section className="text-sm text-gray-500">
        <p>※ この画面は管理用のダッシュボードです。上部のナビゲーションから各セクションにアクセスできます。</p>
      </section>
    </main>
  );
}
