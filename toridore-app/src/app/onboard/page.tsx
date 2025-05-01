'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import checkUserStore from '@/lib/manager/checkUserStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  store_name: z.string().min(1, '店舗名は必須です'),
  contact_name: z.string().min(1, '担当者名は必須です'),
  contact_name_kana: z.string().min(1, '担当者名（ふりがな）は必須です'),
  phone_number: z.string().regex(/^\d{2,4}-\d{2,4}-\d{3,4}$/, '電話番号はハイフン区切りで入力してください（半角）'),
  postal_code: z.string().regex(/^\d{3}-\d{4}$/, '郵便番号は 000-0000 形式で入力してください（半角）'),
  prefecture: z.string().min(1, '都道府県を選択してください'),
  city: z.string().min(1, '市区町村は必須です'),
  street: z.string().min(1, '丁目・番地は必須です'),
  building: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardForm() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  useEffect(() => {
    const load = async () => {
      const { user, store } = await checkUserStore();
      if (!user) {
        router.replace('/login');
        return;
      }
      if (store) {
        router.replace(`/store/${store.id}/admin`);
        return;
      }
      setAuthUser(user);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading || !authUser) return <p className="text-center p-10">読み込み中です…</p>;

  const handleFetchAddress = async () => {
    const raw = (document.querySelector('input[name="postal_code"]') as HTMLInputElement)?.value ?? '';
  
    // 半角数字＋ハイフン形式に変換
    const postalCode = raw
      .replace(/[ー−―]/g, '-') // 全角ハイフンを半角に
      .replace(/[^\d-]/g, '')   // 数字とハイフン以外除去
      .replace(/(\d{3})(\d{4})/, '$1-$2') // ハイフン補完（例：1234567 → 123-4567）
  
    if (!/^\d{3}-\d{4}$/.test(postalCode)) {
      alert(`郵便番号を正しい形式で入力してください（例：123-4567）\n※入力: ${raw}`);
      return;
    }
  
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode.replace('-', '')}`);
    const json = await res.json();
  
    if (json.results && json.results.length > 0) {
      const result = json.results[0];
      setValue('prefecture', result.address1);
      setValue('city', `${result.address2}${result.address3}`);
    } else {
      alert('住所が見つかりませんでした。郵便番号を確認してください。');
    }
  };

  const onSubmit = async (data: FormValues) => {
    const insertData = {
      ...data,
      email: authUser.email!,
      auth_user_id: authUser.id!,
    };

    const { data: inserted, error } = await supabase
      .from('stores')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('店舗登録失敗:', error);
      alert(`登録に失敗しました。\n理由: ${error.message}`);
      return;
    }

    router.push(`/store/${inserted.id}/admin`);
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <p className="mb-6 text-gray-600">
        サービスご利用にあたり、店舗の基本情報をご登録ください。
      </p>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-gray-700">店舗名</label>
          <input
            {...register('store_name')}
            className="mt-1 w-full border rounded p-2"
            placeholder="例：○○ストア"
            autoComplete="organization"
          />
          {errors.store_name && <p className="text-sm text-red-600">{errors.store_name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">担当者名（漢字）</label>
            <input
              {...register('contact_name')}
              className="mt-1 w-full border rounded p-2"
              placeholder="例：山田 太郎"
              autoComplete="name"
            />
            {errors.contact_name && <p className="text-sm text-red-600">{errors.contact_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">担当者名（ふりがな）</label>
            <input {...register('contact_name_kana')} className="mt-1 w-full border rounded p-2" placeholder="例：やまだ たろう" />
            {errors.contact_name_kana && <p className="text-sm text-red-600">{errors.contact_name_kana.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">電話番号</label>
          <input
            {...register('phone_number')}
            className="mt-1 w-full border rounded p-2"
            placeholder="例：0120-123-456"
            autoComplete="tel"
          />
          {errors.phone_number && <p className="text-sm text-red-600">{errors.phone_number.message}</p>}
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">郵便番号</label>
            <input
              {...register('postal_code')}
              className="mt-1 w-full border rounded p-2"
              placeholder="例：100-0001"
              autoComplete="postal-code"
            />
          </div>
          <button
            type="button"
            className="h-[38px] px-4 rounded bg-blue-600 text-white text-sm"
            onClick={handleFetchAddress}
          >
            住所自動入力
          </button>
        </div>
        {errors.postal_code && (
          <p className="mt-1 text-sm text-red-600">{errors.postal_code.message}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">都道府県</label>
            <select
              {...register('prefecture')}
              className="mt-1 w-full border rounded p-2"
              autoComplete="address-level1"
              defaultValue=""
            >
              <option value="" disabled>選択してください</option>
              <option>北海道</option><option>青森県</option><option>岩手県</option><option>宮城県</option><option>秋田県</option>
              <option>山形県</option><option>福島県</option><option>茨城県</option><option>栃木県</option><option>群馬県</option>
              <option>埼玉県</option><option>千葉県</option><option>東京都</option><option>神奈川県</option><option>新潟県</option>
              <option>富山県</option><option>石川県</option><option>福井県</option><option>山梨県</option><option>長野県</option>
              <option>岐阜県</option><option>静岡県</option><option>愛知県</option><option>三重県</option><option>滋賀県</option>
              <option>京都府</option><option>大阪府</option><option>兵庫県</option><option>奈良県</option><option>和歌山県</option>
              <option>鳥取県</option><option>島根県</option><option>岡山県</option><option>広島県</option><option>山口県</option>
              <option>徳島県</option><option>香川県</option><option>愛媛県</option><option>高知県</option><option>福岡県</option>
              <option>佐賀県</option><option>長崎県</option><option>熊本県</option><option>大分県</option><option>宮崎県</option>
              <option>鹿児島県</option><option>沖縄県</option>
            </select>
            {errors.prefecture && <p className="text-sm text-red-600">{errors.prefecture.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">市区町村</label>
            <input
              {...register('city')}
              className="mt-1 w-full border rounded p-2"
              placeholder="例：新宿区西新宿"
              autoComplete="address-level2"
            />
            {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">丁目・番地</label>
          <input
            {...register('street')}
            className="mt-1 w-full border rounded p-2"
            placeholder="例：１ー１１ー１１"
            autoComplete="street-address"
          />
          {errors.street && <p className="text-sm text-red-600">{errors.street.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">建物名・部屋番号</label>
          <input
            {...register('building')}
            className="mt-1 w-full border rounded p-2"
            placeholder="例：○○ビル 1F"
            autoComplete="address-line1"
          />
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-green-600 text-white font-semibold py-2 rounded">
            登録する
          </button>
        </div>
      </form>
    </main>
  );
}
