import { prisma, TransactionClient } from '@acme/db';
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
  // グローバルにメールでユーザーを検索（既存ユーザーがいれば流用）
  let user = await prisma.user.findFirst({
    where: {
      email,
      isDeleted: false,
    },
  });

  if (!user) {
    // 招待スタブを作成（externalId は空文字で招待状態を表す既存仕様を維持）
    user = await prisma.user.create({
      data: {
        provider: 'firebase',
        externalId: '',
        name,
        email,
        tenantId, // keep tenantId for backward compatibility; will be nullable in schema
      },
    });
  } else {
    // 既存ユーザーがいる場合はプロフィールを同期（必要ならば上書き）
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        email,
      },
    });
  }

  // user_roles に同一レコードが無ければ作成（重複は @@unique で防止）
  const existingRole = await prisma.userRole.findFirst({
    where: {
      userId: user.id,
      tenantId,
      role,
      isDeleted: false,
    },
  });

  if (!existingRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        tenantId,
        role,
      },
    });
  }

  // パスワードリセットメール送信（招待メール兼用）
  await sendPasswordResetMail(email);

  return user;
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
  prisma: TransactionClient;
  tenantId: string;
  email: string;
  name: string;
  externalId: string;
  provider: string;
  roles: RoleType[];
}) {
  // global に既存ユーザーを検索（externalId を優先、なければ email）
  const exists = await tx.user.findFirst({
    where: {
      OR: [
        { externalId: externalId, isDeleted: false },
        { email: email, isDeleted: false },
      ],
    },
  });

  if (exists) {
    // 既存ユーザーが見つかった場合は userRoles を追加して返却（重複は UNIQUE 制約で防ぐ）
    const toCreate = roles.map((role) => ({
      userId: exists.id,
      tenantId,
      role,
    }));

    for (const ur of toCreate) {
      const found = await tx.userRole.findFirst({
        where: {
          userId: ur.userId,
          tenantId: ur.tenantId,
          role: ur.role,
        },
      });
      if (!found) {
        await tx.userRole.create({
          data: {
            userId: ur.userId,
            tenantId: ur.tenantId,
            role: ur.role,
          },
        });
      }
    }

    // ユーザー情報を最新化
    await tx.user.update({
      where: { id: exists.id },
      data: {
        name: name || exists.name,
        email,
        provider,
        externalId,
      },
    });

    const updatedUser = await tx.user.findUnique({
      where: { id: exists.id },
      include: { userRoles: true },
    });

    return updatedUser!;
  }

  // 新規ユーザー作成（externalId を持つ新規）
  const user = await tx.user.create({
    data: {
      tenantId,
      provider,
      externalId,
      name,
      email,
      userRoles: {
        create: roles.map((role) => ({
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
  prisma: TransactionClient;
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
    throw new AppError(
      ErrorCode.VALIDATION,
      'このメールアドレスは既に登録されています',
      409
    );
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
      throw new AppError(
        ErrorCode.UNKNOWN,
        '認証プロバイダーでのユーザー作成に失敗しました'
      );
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
    throw new Error(
      `Failed to send password reset mail: ${res.status} ${JSON.stringify(err)}`
    );
  }
  return await res.json();
}
