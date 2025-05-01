import QRCode from 'qrcode';

export default async function downloadQRCode({
  tableName,
  url,
}: {
  tableName: string;
  url: string;
}) {
  // canvas作成
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, {
    width: 256,
    errorCorrectionLevel: 'H',
  });

  // 画像データ（PNG）として取得
  const dataUrl = canvas.toDataURL('image/png');

  // ダウンロードリンク作成してクリック
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${tableName}_qr.png`;
  link.click();
}
