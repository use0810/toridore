'use client';

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import downloadQRCode from '@/lib/manager/downloadQRCode';
import supabase from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

type Table = {
  id: string;
  name: string;
  status: string;
  display_order: number;
};

export default function TableListPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableName, setNewTableName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchTables = useCallback(async () => {
    const { data, error } = await supabase
      .from('tables')
      .select('id, name, status, display_order')
      .eq('store_id', storeId)
      .order('display_order', { ascending: true });

    if (!error && data) setTables(data);
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    if (storeId) fetchTables();
  }, [fetchTables, storeId]);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const maxOrder = tables.length > 0 ? Math.max(...tables.map((t) => t.display_order)) : 0;
    const { error } = await supabase.from('tables').insert({
      name: newTableName,
      store_id: storeId,
      status: 'open',
      display_order: maxOrder + 1,
    });
    if (!error) {
      setNewTableName('');
      fetchTables();
    }
    setCreating(false);
  };

  const handleUpdateTableName = async (id: string) => {
    const { error } = await supabase
      .from('tables')
      .update({ name: editingName })
      .eq('id', id);
    if (!error) {
      setEditingId(null);
      fetchTables();
    }
  };

  const handleDeleteTable = async (id: string) => {
    const ok = confirm('このテーブルを削除しますか？');
    if (!ok) return;
    const { error } = await supabase.from('tables').delete().eq('id', id);
    if (!error) fetchTables();
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tables.findIndex((t) => t.id === active.id);
      const newIndex = over ? tables.findIndex((t) => t.id === over.id) : -1;
      const newOrder = arrayMove(tables, oldIndex, newIndex);
      setTables(newOrder);

      await Promise.all(
        newOrder.map((table, index) =>
          supabase.from('tables').update({ display_order: index }).eq('id', table.id)
        )
      );
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">テーブル一覧</h1>

      <form onSubmit={handleCreateTable} className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="新しいテーブルを追加"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          className="flex-grow border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={creating}
        >
          {creating ? '追加中…' : '追加'}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : tables.length === 0 ? (
        <p className="text-gray-500">テーブルが登録されていません。</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={tables.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {tables.map((table) => (
                <SortableTableItem
                  key={table.id}
                  table={table}
                  isEditing={editingId === table.id}
                  editingName={editingName}
                  setEditingName={setEditingName}
                  setEditingId={setEditingId}
                  handleUpdateTableName={handleUpdateTableName}
                  handleDeleteTable={handleDeleteTable}
                  storeId={storeId}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </main>
  );
}

function SortableTableItem({
  table,
  isEditing,
  editingName,
  setEditingName,
  setEditingId,
  handleUpdateTableName,
  handleDeleteTable,
  storeId,
}: {
  table: Table;
  isEditing: boolean;
  editingName: string;
  setEditingName: (name: string) => void;
  setEditingId: (id: string | null) => void;
  handleUpdateTableName: (id: string) => void;
  handleDeleteTable: (id: string) => void;
  storeId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: table.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} className="border rounded p-3 flex justify-between items-center bg-white">
      <span {...listeners} className="cursor-move text-gray-400 select-none pr-2">≡</span>

      <div className="flex-1 ml-2">
        {isEditing ? (
          <div className="mb-2">
          <input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            className="border p-1 rounded w-full mb-2"
          />
          <div className="text-sm text-gray-600 mb-2">
            ステータス: {table.status === 'open' ? '空席' : '使用中'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateTableName(table.id)}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              保存
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="bg-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-400 transition"
            >
              キャンセル
            </button>
          </div>
        </div>
        ) : (
          <>
            <p className="font-semibold">{table.name}</p>
            <p className="text-sm text-gray-600">
              ステータス: {table.status === 'open' ? '空席' : '使用中'}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 ml-2">
        {!isEditing && (
          <>
            <button
              onClick={() => {
                console.log('編集ボタン押下:', table.id);
                setEditingId(table.id);
                setEditingName(table.name);
              }}
              className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow-sm transition"
            >
              テーブル名変更
            </button>
            <button
              onClick={() =>
                downloadQRCode({
                  tableName: table.name,
                  url: `${location.origin}/store/${storeId}/table/${table.id}`,
                })
              }
              className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded shadow-sm transition"
            >
              QR発行
            </button>
            <button
              onClick={() => handleDeleteTable(table.id)}
              disabled={table.status !== 'open'}
              className={`text-sm px-3 py-1 rounded shadow-sm transition ${
                table.status !== 'open'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              削除
            </button>

          </>
        )}
      </div>
    </li>
  );
}