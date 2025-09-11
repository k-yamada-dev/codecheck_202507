import * as admin from 'firebase-admin';

console.log('[Firebase Admin] Module loaded.');

if (!admin.apps.length) {
  try {
    console.log('[Firebase Admin] Initializing...');
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
      console.error(
        '[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_JSON is not set.'
      );
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON is not set in environment variables.'
      );
    }

    // 環境変数の内容を（デバッグ目的で）ログに出力
    console.log(
      '[Firebase Admin] Raw FIREBASE_SERVICE_ACCOUNT_JSON:',
      serviceAccountJson
    );

    // パースを試みる
    console.log('[Firebase Admin] Parsing service account JSON...');
    const serviceAccount = JSON.parse(serviceAccountJson);
    console.log('[Firebase Admin] Service account JSON parsed successfully.');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[Firebase Admin] Initialization successful.');
  } catch (error) {
    // エラーオブジェクト全体を出力して詳細を確認
    console.error('[Firebase Admin] SDK initialization error:', error);
  }
} else {
  console.log('[Firebase Admin] SDK already initialized.');
}

export const firebaseAdmin = admin;
