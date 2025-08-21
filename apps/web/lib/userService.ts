import type { Prisma } from '@prisma/client';
import { prisma } from '@acme/db';
import { USER_ROLE, type RoleType } from '@acme/contracts';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { AppError, ErrorCode } from '@/lib/errors/core';

void USER_ROLE;


export async function inviteUser({
  tenantId,
  email,
  name,
  role,
}: {
  tenantId: string;
  email: string;
  name: string;
  role: RoleType;
}) {
  // 既存ユーザー重複チェック
  const exists = await prisma.user.findFirst({
    where: {
      tenantId,
      email,
      isDeleted: false,
    },
  });
  if (exists) {
    throw new Error('既にこのメールアドレスは登録されています');
  }

  // 仮登録（externalId: null, provider: 'firebase'）
  const invitedUser = await prisma.user.create({
    data: {
      tenantId,
      provider: 'firebase',
      externalId: '',
      name,
      email,
    },
  });

  // ロール付与
  await prisma.userRole.create({
    data: {
      userId: invitedUser.id,
      tenantId,
      role,
    },
  });

  // パスワードリセットメール送信（招待メール兼用）
  await sendPasswordResetMail(email);

  return invitedUser;
}

export async function createUser({
  prisma: tx,
  tenantId,
  email,
  name,
  externalId,
  provider,
  roles,
}: {
  prisma: Prisma.TransactionClient;
  tenantId: string;
  email: string;
  name: string;
  externalId: string;
  provider: string;
  roles: RoleType[];
}) {
  // 既存ユーザー重複チェック
  const exists = await tx.user.findFirst({
    where: {
      tenantId,
      email,
      isDeleted: false,
    },
  });
  if (exists) {
    // AppError を使用して、より詳細なエラー情報を提供
    throw new AppError(ErrorCode.VALIDATION, '既にこのメールアドレスは登録されています', 409);
  }

  const user = await tx.user.create({
    data: {
      tenantId,
      provider,
      externalId,
      name,
      email,
      userRoles: {
        create: roles.map(role => ({
          tenantId: tenantId,
          role: role,
        })),
      },
    },
    include: {
      userRoles: true,
    },
  });

  return user;
}

export async function updateUser({
  userId,
  name,
  email,
}: {
  userId: string;
  name?: string;
  email?: string;
}) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(email && { email }),
    },
  });
}

export async function assignRole({
  userId,
  tenantId,
  role,
}: {
  userId: string;
  tenantId: string;
  role: RoleType;
}) {
  // 既存ロール削除（単一ロール運用の場合）
  await prisma.userRole.deleteMany({
    where: { userId, tenantId },
  });

  // 新ロール付与
  await prisma.userRole.create({
    data: {
      userId,
      tenantId,
      role,
    },
  });
}

type PasswordResetRequestBody = {
  requestType: 'PASSWORD_RESET';
  email: string;
  tenantId?: string;
};

/**
 * GIP(Firebase)ユーザー作成とDBへのユーザー登録をカプセル化した関数
 * @param prisma - Prisma Transaction Client
 * @param tenantId
 * @param email
 * @param name
 * @param roles
 * @returns 作成されたユーザー情報
 */
export async function createGipUserAndDbUser({
  prisma: tx,
  tenantId,
  email,
  name,
  roles,
}: {
  prisma: Prisma.TransactionClient;
  tenantId: string;
  email: string;
  name: string;
  roles: RoleType[];
}) {
  // 1. Firebase Authでユーザーを検索・作成
  let firebaseUser;
  try {
    firebaseUser = await firebaseAdmin.auth().getUserByEmail(email);
    // 既にGIPにユーザーが存在する場合、重複エラー
    throw new AppError(ErrorCode.VALIDATION, 'このメールアドレスは既に登録されています', 409);
  } catch (e) {
    if (e instanceof AppError) throw e; // AppErrorはそのままスロー

    const error = e as { code?: string };
    if (error.code === 'auth/user-not-found') {
      // GIPに見つからなければ新規作成
      firebaseUser = await firebaseAdmin.auth().createUser({
        email,
        emailVerified: false, // 初期状態は未認証
        displayName: name,
        disabled: false,
      });
    } else {
      // その他のFirebaseエラー
      console.error('Firebase user creation failed:', e);
      throw new AppError(ErrorCode.UNKNOWN, '認証プロバイダーでのユーザー作成に失敗しました');
    }
  }

  // 2. DBにユーザーを作成
  const dbUser = await createUser({
    prisma: tx,
    tenantId,
    email,
    name,
    externalId: firebaseUser.uid,
    provider: 'firebase',
    roles,
  });

  // 3. パスワードリセットメールを送信（招待を兼ねる）
  await sendPasswordResetMail(email);

  return dbUser;
}

// Firebase Auth パスワードリセットメール送信
export async function sendPasswordResetMail(email: string, tenantId?: string) {
  // firebaseConfigはapp/lib/firebase.tsからimport
  const { firebaseConfig } = await import('@/lib/firebase');
  const apiKey = firebaseConfig.apiKey;
  const projectId = firebaseConfig.projectId;
  if (!apiKey) throw new Error('firebaseConfig.apiKey is not set');

  const url = tenantId
    ? `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:sendOobCode?key=${apiKey}`
    : `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;

  const body: PasswordResetRequestBody = {
    requestType: 'PASSWORD_RESET',
    email,
  };
  if (tenantId) body.tenantId = tenantId;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to send password reset mail: ${res.status} ${JSON.stringify(err)}`);
  }
  return await res.json();
}
