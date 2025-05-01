'use client';

type ModalProps = {
  title?: string;
  message: string;
  cancelText?: string;
  confirmDisabled?: boolean; 
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
};

export default function Modal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'はい',
  cancelText = 'いいえ',
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[rgba(255,255,255,0.6)] backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full border border-gray-200">
        {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
        <p className="mb-4 whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
