#!/usr/bin/env bash
set -euo pipefail

# 再現手順スクリプト（プロジェクトルートで実行）
# 事前条件:
# - docker-compose で pubsub/worker/postgres が起動していること
# - このリポジトリのルートで実行すること

echo "1) worker のログを別ターミナルでフォローしてください:"
echo "   docker-compose logs -f worker"
echo

echo "---- 非 UUID の jobId で publish（バリデーションが働く） ----"
DATA=$(printf '{"jobId":"test-123","tenantId":"tenant-1"}' | base64 -w0)
echo "{\"messages\":[{\"data\":\"$DATA\"}]}" | curl -s -X POST -H 'Content-Type: application/json' -d @- http://localhost:8085/v1/projects/local-dev/topics/jobs:publish
echo "Published test-123 -> worker should log 'Invalid jobId format received: test-123'"
echo

echo "---- DB から最新の実ジョブ UUID を取得 ----"
UUID=$(docker exec -i acuagraphy-online_postgres psql -U postgres -d acuas_dev -At -c "SELECT id FROM jobs ORDER BY created_at DESC LIMIT 1;")
echo "Found UUID: ${UUID}"
echo

if [ -n "${UUID}" ]; then
  echo "---- 取得した UUID を使って publish（worker が処理するはず） ----"
  DATA=$(printf '{"jobId":"%s","tenantId":"tenant-1"}' "${UUID}" | base64 -w0)
  echo "{\"messages\":[{\"data\":\"$DATA\"}]}" | curl -s -X POST -H 'Content-Type: application/json' -d @- http://localhost:8085/v1/projects/local-dev/topics/jobs:publish
  echo "Published ${UUID} -> worker should process and update DB"
  echo

  echo "---- DB を確認（該当 UUID のステータス確認） ----"
  docker exec -i acuagraphy-online_postgres psql -U postgres -d acuas_dev -c "SELECT id,status,started_at,finished_at,duration_ms,result FROM jobs WHERE id='${UUID}';"
else
  echo "No UUID found in DB. 先に UI でジョブを作成してください。"
fi

echo
echo "補足:"
echo "- API 側の publish ログ（\"Message <id> published.\") は、api をホストで pnpm dev で起動している場合はそのターミナルの出力を確認してください。"
echo "- Pub/Sub エミュレータ上の topic/sub 確認:"
echo "    curl -s http://localhost:8085/v1/projects/local-dev/topics/jobs"
echo "    curl -s http://localhost:8085/v1/projects/local-dev/subscriptions/jobs-sub"
