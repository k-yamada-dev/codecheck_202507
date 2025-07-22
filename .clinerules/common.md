# ============================================
# .clinerules — プロジェクト共通開発ルール
# ============================================

# ---- パッケージマネージャー -----------------------------------------------
# - 依存パッケージのインストール・追加・更新はすべて pnpm を使用する
# - npm / yarn / bun など他の PM は一切使用しない
# - スクリプト例:
#     依存インストール   : pnpm install
#     パッケージ追加     : pnpm add <pkg>
#     開発用パッケージ   : pnpm add -D <pkg>
- Use `pnpm` as the only package manager.
- Do not use `npm`, `yarn`, or `bun`.

# ---- フレームワーク ---------------------------------------------------------
# - Next.js（app router）で開発する
# - Typescript を標準とする
# - src ディレクトリ配下に機能別フォルダを切る（features/ or modules/ など）
- The framework is **Next.js** (App Router) with **TypeScript**.

# ---- UI ライブラリ ----------------------------------------------------------
# - UI コンポーネント生成には shadcn を利用する
#   ※ 古いタスクで自動提案される `shadcn-ui@latest` は誤りなので使用禁止
# - 必要に応じて tailwindcss, lucide-react, framer-motion を活用する
- Use `shadcn@latest` (NOT `shadcn-ui@latest`).

# ---- コーディング規約 -------------------------------------------------------
- Follow ESLint (next/core-web-vitals recommended rules).
- Use Prettier for formatting (80 col, singleQuote, semi: true).
- Use absolute imports with the `@/` alias pointing to `src/`.
- **Naming**
  - Use **camelCase** for all identifiers in frontend and backend code (functions, variables, API parameters, class names).
  - For JSON keys received from external systems (e.g., DB records, OIDC token claims), **keep the casing/style that matches each platform’s best practices**; do not rewrite unless strictly necessary.



# ---- Git / CI --------------------------------------------------------------
- Commit メッセージは Conventional Commits に従う。
- main へ直接 push しない。Pull Request 経由でレビュー必須。
- CI では `pnpm install --frozen-lockfile && pnpm build` を実行する。


# ---- VS Code ターミナル運用 -----------------------------------------------
- Do not spawn multiple integrated terminals unnecessarily.
- Reuse an existing terminal pane whenever possible.
- Default working directory should be the project root.

# ---- 動作確認・タスク完了時の振る舞い --------------------------------------
- Do **NOT** run server‑startup commands (e.g., `pnpm dev`, `next dev`) automatically during testing.


# ---- 参照ドキュメント -------------------------------------------------------
- 要件は要件定義書を参照：doc/[透かしクラウド]要件定義書.docx
- UIデザインのガイドライン：doc/Uiux Guidelines.pdf
- 電子透かし埋め込み画面の詳細：doc/Upload Watermark Embed Screen Spec.pdf
- ログ画面の詳細：doc/Logs Screen & Data Design.pdf
- API実装の方針：doc/API設計方針.pdf
- ユーザ情報の管理方針：doc/User Management Design.pdf
- 設計メモ:doc/acuagraphy_online_design.md
- 管理コンソールの方針:doc/admin_console_design.md


# ---- 出力方針 --------------------------------------------------------------
- Do not paste full source files in chat unless explicitly requested.
- Provide concise summaries and indicate the file paths that were modified.
- If code snippets are necessary, limit them to the minimal relevant section.


# ---- 実行フローの確認 ------------------------------------------------------
- After you propose a plan and it is accepted, always cross‑check each subsequent action against the original plan.
- If an action is NOT explicitly listed in the accepted plan, pause and ask the user for confirmation before executing.

# ---- 影響範囲の分析と一貫性チェック ---------------------------------------
- Before making changes, search the entire repository (e.g. with ripgrep) and list all related files.
- When modifying or adding backend APIs, also update and verify:
  - API client code (fetch / axios / tRPC hooks, etc.)
  - Type definitions (Zod, TypeScript interfaces, Swagger schemas, etc.)
  - UI components or pages that call those APIs
- Present the list of affected files and the update plan to the user; wait for explicit approval before proceeding.
- Update and run related unit or e2e tests in the same PR.
- If any step is unclear, pause work and ask the user before continuing.

# ---- 自動検索ツール --------------------------------------------------------
- Use `ripgrep` (`rg`) or `grep -R` to find references before editing.
- Show the command output (file list) in chat for transparency.


# ---- PostgreSQL 命名規約 ---------------------------------------------------
- Use lowercase snake_case for all PostgreSQL identifiers (tables, columns, indexes, constraints, sequences, schemas).
- Do not use double‑quoted identifiers unless absolutely necessary.
- Table names: plural noun (users, invoice_items) OR singular — choose one style and stay consistent.
- Primary key constraint: pk_<table>; foreign key: fk_<table>__<ref_table>.
- Index names: idx_<table>__<columns>; unique index: ux_<table>__<columns>.
- Sequence names: <table>_<column>_seq.
- Avoid reserved words (user, order, etc.) in unquoted identifiers.
