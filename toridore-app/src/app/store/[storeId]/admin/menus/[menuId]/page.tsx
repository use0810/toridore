'use client';

import MenuForm from '@/components/menu/MenuForm';
import supabase from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditMenuPage() {
  const router = useRouter();
  const { menuId, storeId } = useParams<{ menuId: string; storeId: string }>();
  interface Menu {
    id: string;
    name: string;
    description?: string;
    price: number;
    is_available: boolean;
    image_url: string;
    // Add other fields as needed
  }

  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId || !menuId) return;

    const fetchMenu = async () => {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('id', menuId)
        .maybeSingle();

      if (error) {
        console.error('❌ メニュー取得エラー:', error);
      } else {
        setMenu(data);
      }

      setLoading(false);
    };

    fetchMenu();
  }, [menuId, storeId]);

  if (!storeId || !menuId) {
    return <p className="p-6">情報が不足しています</p>;
  }

  if (loading) {
    return <p className="p-6">読み込み中...</p>;
  }

  if (!menu) {
    return <p className="p-6">メニューが見つかりませんでした。</p>;
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">メニューを編集</h1>
      <MenuForm
        initialData={menu}
        storeId={storeId}
        onSave={() => router.push(`/store/${storeId}/admin/menus`)}
        onCancel={() => router.back()} 
      />
    </main>
  );
}
