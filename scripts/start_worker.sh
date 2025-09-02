#!/usr/bin/env bash
set -euo pipefail

# start_worker.sh
# Usage:
#   bash scripts/start_worker.sh        # start/recreate worker and show recent logs
#   bash scripts/start_worker.sh quiet  # start/recreate worker without tailing logs
#
# Purpose:
# - Rebuild & recreate the worker container (force-recreate) so it uses the current
#   Dockerfile changes (curl installed, init script wired into command).
# - Avoid the need to run a separate `docker-compose rm -f worker` manually.
# - Show recent worker logs to confirm initialization.
#
# Notes:
# - This script assumes docker / docker-compose are available and the Docker daemon is running.
# - If the Docker daemon isn't running, the script will print an error and exit.
# - Running this repeatedly is safe: the worker image is rebuilt and the container recreated.

QUIET=${1:-""}

echo "Checking Docker daemon..."
if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon is not reachable. Start Rancher Desktop / Docker and try again." >&2
  exit 1
fi

echo "Recreating worker container (build + force recreate)..."
docker-compose up -d --no-deps --build --force-recreate worker

if [ "$QUIET" = "quiet" ]; then
  echo "Worker started (quiet). Use 'docker-compose logs -f worker' to follow logs."
  exit 0
fi

echo "Waiting a few seconds for the worker to initialize..."
sleep 2

echo "Showing recent worker logs (last 200 lines):"
docker-compose logs --no-color worker | tail -n 200
