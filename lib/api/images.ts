/**
 * GCS署名付きURLをAPI経由で取得
 * @param path バケット内のオブジェクトパス
 * @returns 署名付きURL
 */
export async function fetchSignedUrl(path: string): Promise<string> {
  const res = await fetch(`/api/v1/images/signed-url?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('Failed to get signed url');
  const { url } = (await res.json()) as { url: string };
  return url;
}
