import supabase from '@/lib/supabase';

const ARCHIVE_AFTER_DAYS = 3;
const MAX_COMPLETED = 50;

export async function autoArchiveCompletedOrders(storeId: string) {
  const now = new Date();

  const { data: completedOrders, error } = await supabase
    .from('orders')
    .select('id, created_at')
    .eq('status', 'completed')
    .eq('store_id', storeId)
    .order('created_at', { ascending: true });

  if (error || !completedOrders) {
    console.error('❌ アーカイブ対象の取得に失敗:', error?.message);
    return;
  }

  const toArchive: number[] = [];

  // 1. 3日以上前の注文を抽出
  completedOrders.forEach((order) => {
    const created = new Date(order.created_at);
    const daysPassed = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (daysPassed >= ARCHIVE_AFTER_DAYS) {
      toArchive.push(order.id);
    }
  });

  // 2. 50件を超えている場合、古い順に追加でアーカイブ
  const remaining = completedOrders.filter(o => !toArchive.includes(o.id));
  const overflowCount = completedOrders.length - toArchive.length - MAX_COMPLETED;

  if (overflowCount > 0) {
    const overflow = remaining.slice(0, overflowCount).map(o => o.id);
    toArchive.push(...overflow);
  }

  const uniqueIds = [...new Set(toArchive)];

  if (uniqueIds.length > 0) {
    const { error: archiveError } = await supabase
      .from('orders')
      .update({ status: 'archived' })
      .in('id', uniqueIds);

    if (archiveError) {
      console.error('❌ アーカイブ処理に失敗:', archiveError.message);
    } else {
      console.log(`📦 ${uniqueIds.length}件の注文をアーカイブしました`);
    }
  }
}
