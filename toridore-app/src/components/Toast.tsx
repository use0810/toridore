'use client';

import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error'; // デフォルト: success
  duration?: number; // ミリ秒。デフォルト: 2000
  onClose?: () => void; // 表示終了時に呼ばれるコールバック
};

export default function Toast({
  message,
  type = 'success',
  duration = 2000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseStyle =
    'fixed top-4 left-1/2 -translate-x-1/2 text-white py-2 px-4 rounded shadow z-50 transition';
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return <div className={`${baseStyle} ${bgColor}`}>{message}</div>;
}