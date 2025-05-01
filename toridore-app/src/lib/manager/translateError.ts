export function translateAuthError(message: string): string {
  // console.log('[Supabase Error]', message);

  const exactMatches: Record<string, string> = {
    // ログイン系
    'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません。',
    'missing email or phone': 'メールアドレスとパスワードを入力してください。',
    'Email not confirmed': 'メールアドレスが確認されていません。確認メールをご確認ください。',
    'User not found': '該当するユーザーが見つかりません。',
    'Email signups are disabled': '現在、メールでの登録は無効になっています。',

    // 登録系
    'User already registered': 'すでにこのメールアドレスは登録されています。',
    'Unable to validate email address: invalid format': 'メールアドレスの形式が正しくありません。',
    'Signup requires a valid password': 'パスワードを入力してください。',
    'Password should be at least 6 characters.': 'パスワードは6文字以上で入力してください。',
  };

  const fuzzyMatches: { test: RegExp; message: string }[] = [
    {
      test: /^Password should be at least \d+ characters/,
      message: 'パスワードが短すぎます。指定された文字数以上で入力してください。',
    },
    {
      test: /email address.*invalid format/,
      message: 'メールアドレスの形式が正しくありません。',
    },
    {
      test: /already registered/,
      message: 'このメールアドレスはすでに登録されています。',
    },
  ];

  if (message in exactMatches) {
    return exactMatches[message];
  }

  for (const { test, message: msg } of fuzzyMatches) {
    if (test.test(message)) {
      return msg;
    }
  }

  return '処理に失敗しました。もう一度お試しください。';
}
