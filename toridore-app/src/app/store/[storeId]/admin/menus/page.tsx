"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/lib/supabase";
import Link from "next/link";

type Menu = {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
};

export default function MenuListPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("id, name, price, is_available")
        .eq("store_id", storeId)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("メニュー取得エラー:", error.message);
      } else {
        setMenus(data || []);
      }
      setLoading(false);
    };

    if (storeId) fetchMenus();
  }, [storeId]);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">メニュー一覧</h1>
        <Link
          href={`/store/${storeId}/admin/menus/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ＋ 新規追加
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : menus.length === 0 ? (
        <p className="text-gray-500">メニューが登録されていません。</p>
      ) : (
        <ul className="space-y-2">
          {menus.map((menu) => (
            <li
              key={menu.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{menu.name}</p>
                <p className="text-sm text-gray-600">{menu.price}円</p>
              </div>
              <div className="text-right space-y-1">
                {menu.is_available ? (
                  <span className="text-green-600 text-sm block">販売中</span>
                ) : (
                  <span className="text-red-500 text-sm block">非表示</span>
                )}
                <Link
                  href={`/store/${storeId}/admin/menus/${menu.id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  編集する
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}