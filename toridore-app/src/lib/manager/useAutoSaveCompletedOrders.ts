import supabase from '@/lib/supabase';
import { useCallback, useEffect } from 'react';
import { useOrderStore } from '@/lib/manager/orderStore';

const STORAGE_KEY = 'unsavedCompletedOrders';

/**
 * 完了済み注文を自動保存し、localStorageで保険も効かせるフック（Zustand版）
 */
export function useAutoSaveCompletedOrders() {
  const {
    completedOrderIds,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    addCompletedOrderId,
  } = useOrderStore();

  const saveCompletedOrders = useCallback(
    async (orderIds: number[]) => {
      if (orderIds.length === 0) return;

      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .in('id', orderIds);

      if (error) {
        console.error('❌ 保存失敗:', error.message);
      } else {
        console.log('✅ 保存成功:', orderIds);
        setHasUnsavedChanges(false);
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    [setHasUnsavedChanges]
  );

  // ローカルキャッシュ復元
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const ids = JSON.parse(raw) as number[];
      if (Array.isArray(ids) && ids.length > 0) {
        ids.forEach((id) => addCompletedOrderId(id));
        setHasUnsavedChanges(true);
        console.log('🪄 ローカルキャッシュから未保存注文を復元しました');
      }
    } catch (e) {
      console.warn('⚠️ localStorageの復元に失敗:', e);
    }
  }, [addCompletedOrderId, setHasUnsavedChanges]);

  // 差分あれば保存
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    try {
      const ids = Array.from(completedOrderIds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.warn('⚠️ localStorage保存エラー:', e);
    }
  }, [completedOrderIds, hasUnsavedChanges]);

  // 変更後5秒間なにもなければ保存
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      saveCompletedOrders(Array.from(completedOrderIds));
    }, 5000);

    return () => clearTimeout(timer);
  }, [completedOrderIds, hasUnsavedChanges, saveCompletedOrders]);

  // 定期保存（60秒ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        saveCompletedOrders(Array.from(completedOrderIds));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [completedOrderIds, hasUnsavedChanges, saveCompletedOrders]);

  // ページ離脱時の保険保存
  useEffect(() => {
    const beforeUnload = () => {
      if (hasUnsavedChanges) {
        saveCompletedOrders(Array.from(completedOrderIds));
      }
    };

    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [completedOrderIds, hasUnsavedChanges, saveCompletedOrders]);
}
