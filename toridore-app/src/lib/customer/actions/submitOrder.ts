import supabase from '@/lib/supabase';
import dayjs from 'dayjs'; // npm install dayjs しておいてね

export async function submitOrder({
  tableId,
  cartItems,
}: {
  tableId: string;
  cartItems: {
    id: string;
    quantity: number;
    price: number;
  }[];
}) {
  // 1. テーブル情報から store_id を取得
  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('store_id')
    .eq('id', tableId)
    .single();

  if (!table || tableError) {
    console.error('テーブル情報の取得に失敗しました');
    return { success: false };
  }

  const storeId = table.store_id;
  const today = dayjs().format('YYYY-MM-DD');

  // 2. 今日の日付でその店舗の最大 order_code を取得
  const { data: maxOrder, error: maxError } = await supabase
    .from('orders')
    .select('order_code')
    .eq('store_id', storeId)
    .eq('order_date', today)
    .order('order_code', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    console.error('注文番号取得エラー:', maxError);
    return { success: false };
  }

  const nextOrderCode = (maxOrder?.order_code ?? 0) + 1;

  // 3. orders テーブルに挿入
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      store_id: storeId,
      table_id: tableId,
      order_code: nextOrderCode,
      order_date: today,
      status: 'pending',
    })
    .select()
    .single();

  if (!orderData || orderError) {
    console.error('注文の登録に失敗しました', orderError);
    return { success: false };
  }

  const orderId = orderData.id;

  // 4. order_items を一括挿入
  const { error: itemError } = await supabase.from('order_items').insert(
    cartItems.map((item) => ({
      order_id: orderId,
      menu_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))
  );

  if (itemError) {
    console.error('注文アイテムの登録に失敗しました', itemError);
    return { success: false };
  }

  return { success: true };
}
