'use client';

import MenuForm from '@/components/menu/MenuForm';
import { useParams, useRouter } from 'next/navigation';

export default function NewMenuPage() {
  const router = useRouter();
  const { storeId } = useParams<{ storeId: string }>();

  if (!storeId) return <p className="p-6">店舗IDが見つかりません</p>;

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">新しいメニューを追加</h1>
      <MenuForm
        storeId={storeId}
        onSave={() => router.push(`/store/${storeId}/admin/menus`)}
        onCancel={() => router.back()} 
      />
    </main>
  );
}
