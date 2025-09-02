# Implementation Plan

[Overview]
ジョブ作成からPub/Sub発行、workerの受信処理、DB更新が正しく連携していることを検証するための手順書。

本ドキュメントは現行リポジトリの構成（Web 側の publishJob、worker のサブスクライブ処理、jobsRepo、docker-compose による Pub/Sub エミュレータ）を前提に、画面から作成した JOB レコードがどのようにパイプラインを流れるかを追跡し、どのログ・どのクエリを確認すれば pub/sub と worker の処理が動いたことを確実に判断できるかをまとめる。コード変更は基本的に不要で、検証手順（コマンド群）と確認ポイントを明確化することで再現性ある検証を実現する。

[Types]  
タイプ定義の追加変更は不要。既存の型を参照して検証を行う。

- 主に利用する既存型（リポジトリ参照）
  - packages/contracts/src/schemas/jobs.ts
    - CreateJobRequest / JobResponse / JobListItem / GetJobsQuery など（Zod スキーマ）
  - packages/db/src/repos/jobs.ts
    - CreateJobData（tenantId,userId,userName,type,srcImagePath,imageUrl,thumbnailPath?,params,...）
    - UpdateJobResultData（status, startedAt?, finishedAt?, durationMs?, result?, errorCode?, errorMessage?）
    - jobsRepo (create, findById, updateResult, findMany, delete)
  - Pub/Sub メッセージ型（暗黙）
    - { jobId: string; tenantId: string } — apps/web/lib/pubsub.ts が publish する JSON ペイロード

検証では上記型に準拠したメッセージ／DB レコードを前提とするため、型定義の変更は行わない。

[Files]
実際の動作確認に関係するファイル一覧と目的。

- 新規作成
  - implementation_plan.md（ルート） — 本ドキュメント（このファイル）
- 参照（変更しない）
  - apps/web/lib/pubsub.ts — publishJob(message: {jobId, tenantId})：Pub/Sub トピックへ publishMessage する（console.log に "Message <id> published." を出力）
  - apps/worker/src/index.ts — handleMessage(message: Message)、main()：サブスクライブ、受信ログ、jobsRepo.updateResult 呼び出し、ack/nack ロジック
  - packages/db/src/repos/jobs.ts — jobsRepo：DB 作成・更新ロジック（updateResult を使って status を更新）
  - packages/contracts/src/schemas/jobs.ts — API の入力/出力スキーマ（createJob エンドポイント）
  - docker-compose.yml — pubsub, api, worker, db の設定、環境変数（PUBSUB_EMULATOR_HOST, PUBSUB_PROJECT_ID, PUBSUB_TOPIC_JOBS 等）
  - scripts/init_pubsub_emulator.sh — エミュレータ用トピック/サブス作成スクリプト
- 設定変更: なし（必要時は env の再確認のみ）

[Functions]
検証に関係する関数名と確認する変更点（基本は参照のみ）。

- 既存の主要関数（変更しない）
  - publishJob(message: { jobId: string; tenantId: string }) — apps/web/lib/pubsub.ts
    - 内部で PubSub.topic(process.env.PUBSUB_TOPIC_JOBS).publishMessage({ json: message }) を呼ぶ
    - 成功時に console.log(`Message ${messageId} published.`)
  - handleMessage(message: Message) — apps/worker/src/index.ts
    - 受信時に console.log で "Received message <id>:" と message.data 等を出力
    - jobsRepo.updateResult(jobId, { status: JOB_STATUS.RUNNING, startedAt }) → 実処理 → updateResult(... DONE or ERROR ...)
    - 成功時: message.ack(), 失敗時: message.nack()
  - jobsRepo.updateResult(id: string, data: UpdateJobResultData) — packages/db/src/repos/jobs.ts
    - Prisma を使って Job レコードを更新
- 検証用に新規関数を追加する必要はない。必要なら短い確認スクリプト（curl / psql）を用いる。

[Classes]
クラスの追加・修正は不要。既存ライブラリ（@google-cloud/pubsub, Prisma）をそのまま利用する。

- 変更対象なし

[Dependencies]
既存パッケージのまま検証を行う。新規パッケージ追加は不要。

- 参照ライブラリ
  - @google-cloud/pubsub（apps/web, apps/worker）
  - prisma / @prisma/client（packages/db）
- 変更なし

[Testing]
手動／コマンドベースで検証する。自動テストは今回は作成しないが、必要なら後でスクリプト化可能。

- 検証の目的（受け取る出力）
  1. Web API がジョブ作成時に jobs テーブルへレコードを作成する
  2. 同 API が publishJob を呼び Pub/Sub にメッセージを発行している（"Message <id> published." ログ）
  3. Pub/Sub エミュレータにメッセージが存在する（pull で確認可能）
  4. worker が subscription からメッセージを受信し、handleMessage のログを出力している
  5. worker が jobsRepo.updateResult を通じて Job レコードを RUNNING → DONE/ERROR と更新している
- 実行するコマンド一覧（プロジェクトルートで実行）
  - コンテナ起動 / 確認（必要に応じて）
    - docker-compose up -d
    - docker ps
  - Pub/Sub トピック・サブス存在確認（emulator）
    - curl -s -X GET http://localhost:8085/v1/projects/local-dev/topics/jobs | jq .
    - curl -s -X GET http://localhost:8085/v1/projects/local-dev/subscriptions/jobs-sub | jq .
  - Pub/Sub サブスから pull（emulator）は手動確認用
    - curl -s -X POST -H 'Content-Type: application/json' -d '{"maxMessages":10}' http://localhost:8085/v1/projects/local-dev/subscriptions/jobs-sub:pull | jq .
    - ACK（必要な場合）: curl -s -X POST -H 'Content-Type: application/json' -d '{"ackIds":["<ACK_ID>"]}' http://localhost:8085/v1/projects/local-dev/subscriptions/jobs-sub:acknowledge
  - コンテナログ確認（リアルタイム）
    - docker-compose logs -f worker
    - docker-compose logs -f api
    - docker-compose logs -f pubsub
  - DB 直接照会（Postgres コンテナ名: acuagraphy-online_postgres）
    - docker exec -it acuagraphy-online_postgres psql -U postgres -d acuas_dev -c 'SELECT id,status,"startedAt","finishedAt","durationMs",result,"errorCode","errorMessage" FROM "Job" ORDER BY "createdAt" DESC LIMIT 10;'
- 期待ログと確認ポイント
  - API 側: apps/web/lib/pubsub.ts の console.log → "Message <id> published."
  - worker 側: apps/worker/src/index.ts の console.log → "Received message <message.id>:", "\tData: ...", "Processing job <jobId>...", "Job <jobId> completed successfully."
  - DB 側: Job.status の遷移（PENDING → RUNNING → DONE）と startedAt/finishedAt/durationMs/result の確認
- トラブルシュート手順（代表例）
  - API で publish ログが出ない
    - API コンテナの環境変数（PUBSUB_TOPIC_JOBS, PUBSUB_EMULATOR_HOST）が正しいか確認
    - publishJob の呼び出し経路（createJob エンドポイント）で try/catch により例外が握り潰されていないか確認
  - publish ログは出るが Pub/Sub へ到達していない
    - emulator のエンドポイント（http://pubsub:8085 とローカルの http://localhost:8085）との接続設定を確認
    - scripts/init_pubsub_emulator.sh を使ってトピック・サブスを再作成
  - worker がメッセージを受信しない
    - worker の環境変数（PUBSUB_EMULATOR_HOST, PUBSUB_PROJECT_ID, PUBSUB_TOPIC_JOBS, WORKER_CONCURRENCY）が正しいか確認
    - サブス名（apps/worker/src/index.ts の subName = 'jobs-sub'）とエミュレータ上のサブス名が一致しているか
  - DB 更新エラー
    - worker ログのエラー出力、Prisma のスタックを確認し、DATABASE_URL が正しいか、マイグレーションが適用済みかを確認

[Implementation Order]
検証は「観察→切り分け→再観察」の順で進める。以下は実行順（番号順に実施）。

1. （前提）コンテナが起動していることを確認する
   - docker-compose ps / docker ps で api, worker, pubsub, db が起動確認
2. Pub/Sub トピック・サブスの存在を確認する
   - curl -s http://localhost:8085/v1/projects/local-dev/topics/jobs
   - curl -s http://localhost:8085/v1/projects/local-dev/subscriptions/jobs-sub
   - 必要なら scripts/init_pubsub_emulator.sh を実行して再作成
3. UI でジョブを作成する（既に作成済みなら次へ）
   - Web UI でジョブ作成（createJob エンドポイント経由）
4. API コンテナログで publish 発行ログを探す
   - docker-compose logs -f api
   - ログに "Message <id> published." が出ていることを確認
5. Pub/Sub エミュレータへメッセージが到達しているか確認（任意）
   - curl -s -X POST -H 'Content-Type: application/json' -d '{"maxMessages":10}' http://localhost:8085/v1/projects/local-dev/subscriptions/jobs-sub:pull | jq .
   - 返却 data の中に jobId を含む JSON があれば到達確認
6. worker のコンテナログを監視し、受信／処理ログを確認
   - docker-compose logs -f worker
   - "Received message", "Processing job <jobId>" 等が出ることを確認
7. DB に対する更新を確認する
   - docker exec -it acuagraphy-online_postgres psql -U postgres -d acuas_dev -c 'SELECT id,status,"startedAt","finishedAt","durationMs",result,"errorCode","errorMessage" FROM "Job" ORDER BY "createdAt" DESC LIMIT 10;'
   - 該当 job の status が RUNNING→DONE/ERROR に遷移していることを確認
8. 問題があれば上記トラブルシュート手順に従い切り分ける。修正は最小限に留めて再検証する。

（このドキュメントは手順書であり、実際の確認コマンドやログ出力をここに記録していくことで検証履歴を残すことを推奨します。）
