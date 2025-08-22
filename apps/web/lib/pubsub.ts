import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub({
  // projectIdとapiEndpointは環境変数から読み込む
  // docker-compose.ymlで設定した値が使われる
  projectId: process.env.PUBSUB_PROJECT_ID,
  ...(process.env.PUBSUB_EMULATOR_HOST && {
    apiEndpoint: process.env.PUBSUB_EMULATOR_HOST,
  }),
});

/**
 * 指定されたトピックにジョブメッセージを発行します。
 * @param message 発行するメッセージ。jobIdとtenantIdを含む必要があります。
 */
export async function publishJob(message: { jobId: string; tenantId: string }) {
  if (!process.env.PUBSUB_TOPIC_JOBS) {
    throw new Error('PUBSUB_TOPIC_JOBS is not defined in environment variables.');
  }

  const topic = pubsub.topic(process.env.PUBSUB_TOPIC_JOBS);

  try {
    const messageId = await topic.publishMessage({ json: message });
    console.log(`Message ${messageId} published.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Received error while publishing: ${error.message}`);
    } else {
      console.error('Received error while publishing.');
    }
    throw error;
  }
}
