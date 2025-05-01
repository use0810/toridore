'use client';

import storeSupabase from './storeSupabase';
import { User } from '@supabase/supabase-js';

/**
 * 現在のログインユーザーを取得する。
 * getSession() で取得できない場合は getUser() でフォールバック。
 */
const getCurrentUser = async (): Promise<User | null> => {
  console.log('🧩 getCurrentUser: 認証されたユーザー取得開始');

  try {
    const { data, error } = await storeSupabase.auth.getUser();

    if (error) {
      console.error('❌ getUser エラー:', error.message);
      return null;
    }

    if (data.user) {
      console.log('✅ ユーザー取得成功:', data.user);
      return data.user;
    }

    console.warn('⚠️ ユーザーは取得できませんでした');
    return null;
  } catch (err) {
    console.error('💥 getCurrentUser 例外:', err);
    return null;
  }
};

export default getCurrentUser;

/**
 * Retry付きの getCurrentUser（復元ラグに対応）
 */
export const getCurrentUserWithRetry = async (
  retries = 3,
  delay = 300
): Promise<User | null> => {
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (let i = 0; i < retries; i++) {
    const user = await getCurrentUser();
    if (user) {
      console.log(`✅ [Retry Success] ${i + 1}回目でユーザー取得に成功`);
      return user;
    }

    console.warn(`⏳ [Retry] ${i + 1}/${retries}回目失敗 → ${delay}ms 待機`);
    await wait(delay);
  }

  console.warn('🚫 [Retry] ユーザー取得失敗（最大試行回数に達しました）');
  return null;
};

