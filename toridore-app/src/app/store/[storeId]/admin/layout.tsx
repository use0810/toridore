'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { storeId } = useParams();

  return (
    <div>
      <nav className="flex gap-4 p-4 border-b">
        <Link href={`/store/${storeId}/admin`}>ダッシュボード</Link>
        <Link href={`/store/${storeId}/admin/orders`}>注文</Link>
        <Link href={`/store/${storeId}/admin/payments`}>支払い</Link>
        <Link href={`/store/${storeId}/admin/menus`}>メニュー</Link>
        <Link href={`/store/${storeId}/admin/tables`}>テーブル</Link>
      </nav>
      <div className="p-4">{children}</div>
    </div>
  );
}
