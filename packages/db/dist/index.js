export * from './client';
export * from './repos/jobs';
// ここに “共通サービス関数” を集約していく
// 例）export async function findLogById(id: string) { return prisma.log.findUnique({ where: { id } }); }
