#!/usr/bin/env bash
set -euo pipefail

# Defaults (can be overridden by env)
# If PUBSUB_EMULATOR_HOST is not set, try the docker-compose service host first (pubsub:8085),
# then localhost:8085. This lets the script be run directly without exporting env vars.
if [ -n "${PUBSUB_EMULATOR_HOST:-}" ]; then
  HOST=${PUBSUB_EMULATOR_HOST}
else
  # prefer the docker-compose service host (works when running from host with compose)
  if curl -s --max-time 1 "http://pubsub:8085/" >/dev/null 2>&1; then
    HOST="pubsub:8085"
  elif curl -s --max-time 1 "http://localhost:8085/" >/dev/null 2>&1; then
    HOST="localhost:8085"
  else
    # fallback to pubsub:8085 (matches docker-compose service name)
    HOST="pubsub:8085"
  fi
fi
PROJECT=${PUBSUB_PROJECT_ID:-local-dev}
TOPIC=${PUBSUB_TOPIC_JOBS:-jobs}
SUBSCRIPTION=${PUBSUB_SUBSCRIPTION_NAME:-jobs-sub}
RETRIES=${PUBSUB_INIT_RETRIES:-30}
SLEEP_SEC=${PUBSUB_INIT_SLEEP:-1}

echo "Initializing Pub/Sub emulator at ${HOST} (project=${PROJECT})"

# Wait until the emulator HTTP endpoint responds
for i in $(seq 1 "${RETRIES}"); do
  if curl -s "http://${HOST}/" >/dev/null 2>&1; then
    echo "Pub/Sub emulator is reachable"
    break
  fi
  echo "Waiting for Pub/Sub emulator... (${i}/${RETRIES})"
  sleep "${SLEEP_SEC}"
done

# Create topic (idempotent via emulator HTTP API)
echo "Creating topic: ${TOPIC}"
curl -s -X PUT -H 'Content-Type: application/json' "http://${HOST}/v1/projects/${PROJECT}/topics/${TOPIC}" -d "{}" || true

# Create subscription (idempotent via emulator HTTP API)
echo "Creating subscription: ${SUBSCRIPTION} -> ${TOPIC}"
curl -s -X PUT -H 'Content-Type: application/json' \
  -d "{\"topic\":\"projects/${PROJECT}/topics/${TOPIC}\",\"ackDeadlineSeconds\":600}" \
  "http://${HOST}/v1/projects/${PROJECT}/subscriptions/${SUBSCRIPTION}" || true

echo "Pub/Sub emulator initialization complete."
