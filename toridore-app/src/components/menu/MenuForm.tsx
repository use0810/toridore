'use client';

import { useEffect, useState } from 'react';
import MenuTextFields from './MenuTextFields';
import MenuAvailabilityToggle from './MenuAvailabilityToggle';
import ImageUploadField from './ImageUploadField';
import supabase from '@/lib/supabase';


type Props = {
  initialData?: {
    id: string;
    name: string;
    price: number;
    description?: string;
    is_available: boolean;
    image_url: string;
  };
  storeId: string;
  onSave?: () => void;
  onCancel?: () => void;
};

export default function MenuForm({ initialData, storeId, onSave, onCancel }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [description, setDescription] = useState(initialData?.description || '');
  const [isAvailable, setIsAvailable] = useState(initialData?.is_available ?? true);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialData?.image_url || null);

  useEffect(() => {
    setUploadedUrl(initialData?.image_url || null);
  }, [initialData?.image_url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!initialData && !uploadedUrl) {
      alert('画像は必須です。');
      setLoading(false);
      return;
    }

    const payload = {
      store_id: storeId,
      name,
      price,
      description,
      is_available: isAvailable,
      image_url: uploadedUrl,
    };

    let result;
    if (initialData) {
      result = await supabase.from('menus').update(payload).eq('id', initialData.id);
    } else {
      result = await supabase.from('menus').insert(payload);
    }

    if (result.error) {
      alert(`保存に失敗しました: ${result.error.message}`);
    } else {
      alert('保存しました！');
      onSave?.();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MenuTextFields
        name={name}
        price={price}
        description={description}
        onChangeName={setName}
        onChangePrice={setPrice}
        onChangeDescription={setDescription}
      />

      <ImageUploadField
        storeId={storeId}
        menuId={initialData?.id || ''}
        initialUrl={uploadedUrl || null}
        onUploaded={setUploadedUrl}
      />

      <MenuAvailabilityToggle
        isAvailable={isAvailable}
        onToggle={setIsAvailable}
      />

      <div className="flex gap-4">
      <button
        type="button"
        onClick={onCancel}
        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
      >
        戻る
      </button>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? '保存中...' : '保存'}
      </button>
    </div>
    </form>
  );
}