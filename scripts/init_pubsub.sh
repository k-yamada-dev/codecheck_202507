#!/usr/bin/env bash
set -euo pipefail
HOST=${PUBSUB_EMULATOR_HOST:-localhost:8085}
PROJECT=${PUBSUB_PROJECT_ID:-local-dev}

# PUBSUB_TOPIC_JOBSが設定されていない場合は 'jobs' をデフォルト値とする
TOPIC=${PUBSUB_TOPIC_JOBS:-jobs}

echo "Creating Pub/Sub topic: $TOPIC on host $HOST for project $PROJECT"

# トピックの作成（存在しない場合のみ）
gcloud pubsub topics create "$TOPIC" \
  --project="$PROJECT" --quiet || echo "Topic $TOPIC already exists."

# サブスクリプションの作成（存在しない場合のみ）
gcloud pubsub subscriptions create jobs-sub \
  --topic="$TOPIC" --ack-deadline=600 \
  --project="$PROJECT" --quiet || echo "Subscription jobs-sub already exists."

echo "Pub/Sub setup complete."
