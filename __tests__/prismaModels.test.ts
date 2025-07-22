import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Prisma Models', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Log model CRUD operations', async () => {
    // 事前にusersテーブルへテスト用レコードを登録
    // 既存レコードがあれば削除
    await prisma.user.deleteMany({
      where: {
        id: '00000000-0000-0000-0000-000000000003',
        tenant_id: '00000000-0000-0000-0000-000000000004',
      },
    });

    await prisma.user.create({
      data: {
        id: '00000000-0000-0000-0000-000000000003',
        tenant_id: '00000000-0000-0000-0000-000000000004',
        provider: 'test-provider',
        external_id: 'test-external-id',
        name: 'test-user',
        email: 'test@example.com',
        roles: [],
        identity_sub: 'test-identity-sub',
        is_deleted: false,
        role: 'uploader',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // jobsテーブルへテスト用レコードを登録
    await prisma.job.create({
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        tenant_id: '00000000-0000-0000-0000-000000000004',
        user_id: '00000000-0000-0000-0000-000000000003',
        user_name: 'test-user',
        type: 'EMBED',
        status: 'DONE',
        started_at: new Date(),
        src_image_path: 'dummy.png',
        params: {},
        result: {},
        created_at: new Date(),
        image_url: 'dummy.png',
      },
    });

    const log = await prisma.log.create({
      data: {
        job_id: '00000000-0000-0000-0000-000000000001',
        action: 'test-action',
        user_id: '00000000-0000-0000-0000-000000000003',
      },
    });

    expect(log).toHaveProperty('id');
    expect(log.job_id).toBe('00000000-0000-0000-0000-000000000001');

    const fetchedLog = await prisma.log.findUnique({
      where: { id: log.id },
    });

    expect(fetchedLog).not.toBeNull();
    expect(fetchedLog?.action).toBe('test-action');

    await prisma.log.delete({ where: { id: log.id } });
    await prisma.job.delete({ where: { id: '00000000-0000-0000-0000-000000000001' } });
    await prisma.user.delete({ where: { id: '00000000-0000-0000-0000-000000000003' } });
    const deletedLog = await prisma.log.findUnique({ where: { id: log.id } });
    expect(deletedLog).toBeNull();
  });

  test('BillingUsage model CRUD operations', async () => {
    const billingUsage = await prisma.billing_usage.create({
      data: {
        tenant_id: '00000000-0000-0000-0000-000000000004',
        month: '2025-07',
        uploads: 10,
        api_calls: 100,
        storage_gb: 5.5,
        amount: 50.0,
      },
    });

    expect(billingUsage).toHaveProperty('id');
    expect(billingUsage.tenant_id).toBe('00000000-0000-0000-0000-000000000004');

    const fetchedBillingUsage = await prisma.billing_usage.findUnique({
      where: { id: billingUsage.id },
    });

    expect(fetchedBillingUsage).not.toBeNull();
    expect(fetchedBillingUsage?.amount).toBe(50.0);

    await prisma.billing_usage.delete({ where: { id: billingUsage.id } });
    const deletedBillingUsage = await prisma.billing_usage.findUnique({
      where: { id: billingUsage.id },
    });
    expect(deletedBillingUsage).toBeNull();
  });
});
