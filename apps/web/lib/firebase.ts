import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
const isBuild = process.env.npm_lifecycle_event === 'build';

let firebaseConfig;

if (!firebaseConfigString) {
  if (isBuild) {
    // ビルド時はダミーデータを使用
    firebaseConfig = {
      apiKey: 'dummy',
      authDomain: 'dummy.firebaseapp.com',
      projectId: 'dummy',
      storageBucket: 'dummy.appspot.com',
      messagingSenderId: 'dummy',
      appId: 'dummy',
    };
  } else {
    // 実行時はエラー
    throw new Error(
      'NEXT_PUBLIC_FIREBASE_CONFIG is not set in environment variables.'
    );
  }
} else {
  firebaseConfig = JSON.parse(firebaseConfigString);
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth, firebaseConfig };
