'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import supabase from '@/lib/supabase';

const fallbackImage = `${process.env.NEXT_PUBLIC_SUPABASE_MENUS_IMAGE_URL}camera.webp`;


interface ImageUploadFieldProps {
  initialUrl?: string | null;
  storeId: string;
  menuId: string;
  onUploaded: (url: string) => void;
}

export default function ImageUploadField({
  initialUrl = null,
  storeId,
  menuId,
  onUploaded,
}: ImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: 'image/webp',
    });

    const fileName = `${menuId || 'temp'}.webp`;
    const folderPath = `${storeId}/menus`;
    const filePath = `${folderPath}/${fileName}`;

    const finalFile = new File([compressedFile], fileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    const { error: uploadError } = await supabase.storage
      .from('menus-images')
      .upload(filePath, finalFile, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.error('画像アップロードエラー:', uploadError);
      alert('画像のアップロードに失敗しました');
      return;
    }

    const { data: urlData } = supabase.storage
      .from('menus-images')
      .getPublicUrl(filePath);

    onUploaded(urlData.publicUrl);

  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-md p-4 text-center transition relative ${
        dragging ? 'bg-blue-50 border-blue-400' : 'border-gray-300 hover:bg-gray-50'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <label htmlFor="image-upload" className="cursor-pointer block">
        <p className="font-medium">画像（必須）</p>
        <p className="text-gray-500 text-sm mt-1">
          ドラッグまたは <span className="underline text-blue-600">クリック</span> で選択
        </p>
        <p className="text-xs text-gray-400 mt-1">
          ※画像は毎回上書き保存されます。
        </p>

        {previewUrl && (
          <Image
            src={previewUrl || fallbackImage}
            alt="プレビュー"
            className="mx-auto mt-3 rounded-md object-cover"
            width={128}
            height={128}
          />
        )}
      </label>

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
