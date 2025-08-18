import { PubSub, Message } from '@google-cloud/pubsub';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subName = 'jobs-sub';
const concurrency = process.env.WORKER_CONCURRENCY
  ? parseInt(process.env.WORKER_CONCURRENCY, 10)
  : 1;

async function handleMessage(message: Message) {
  console.log(`Received message ${message.id}:`);
  console.log(`\tData: ${message.data}`);
  console.log(`\tAttributes: ${JSON.stringify(message.attributes)}`);

  let jobId: string;
  try {
    const data = JSON.parse(Buffer.from(message.data).toString());
    jobId = data.jobId;
    if (!jobId) {
      throw new Error('jobId not found in message');
    }
  } catch (error: any) {
    console.error(`Error parsing message data: ${error.message}`);
    // メッセージ形式が不正な場合はackして再処理させない
    message.ack();
    return;
  }

  const startedAt = new Date();
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'RUNNING', startedAt },
    });

    // --- ここで実際の透かし埋め込み処理を実行 ---
    // 例: const result = await embedWatermark(job.imageUrl, job.params);
    console.log(`Processing job ${jobId}...`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機で処理をシミュレート
    const result = { success: true, path: 'path/to/result.jpg' };
    // --- 処理完了 ---

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'DONE',
        result,
        finishedAt,
        durationMs,
      },
    });

    console.log(`Job ${jobId} completed successfully.`);
    message.ack();
  } catch (error: any) {
    console.error(`Error processing job ${jobId}:`, error);
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'ERROR',
        errorCode: 'WORKER_ERROR',
        errorMessage: error.message || String(error),
        finishedAt: new Date(),
      },
    });
    // エラーが発生した場合、nack()で再試行させるか、ack()で諦めるかは要件による
    // 今回はnack()でリトライさせる
    message.nack();
  }
}

async function main() {
  const pubsub = new PubSub({
    projectId: process.env.PUBSUB_PROJECT_ID,
    ...(process.env.PUBSUB_EMULATOR_HOST && {
      apiEndpoint: process.env.PUBSUB_EMULATOR_HOST,
    }),
  });

  const subscription = pubsub.subscription(subName, {
    flowControl: {
      maxMessages: concurrency,
    },
  });

  console.log(`Listening for messages on ${subName}...`);
  subscription.on('message', handleMessage);
  subscription.on('error', err => {
    console.error('Subscription error:', err);
  });
}

main().catch(e => {
  console.error('Worker failed to start:', e);
  process.exit(1);
});
