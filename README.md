# おさるのジョージ キャラクター検索アプリ

おさるのジョージに登場するキャラクター名で検索すると、そのキャラクターが出てくるエピソード一覧を表示するWebアプリ。

## 主な機能

- **リアルタイム検索**: キャラクター名を入力すると即座に絞り込み
- **ひらがな・カタカナ対応**: 「じょーじ」でも「ジョージ」でもヒット
- **人気キャラタグ**: ワンタップで主要キャラを検索
- **検索履歴**: 最近の検索をローカルに保存・再利用
- **サジェスト**: 入力中にキャラクター候補を表示
- **ダークモード**: ライト/ダーク切り替え対応

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks** (`useMemo`, `useTransition`, `useCallback`)

## ディレクトリ構成

```
├── app/              # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/       # UIコンポーネント
│   ├── AnimeSearch.tsx    # メインクライアントコンポーネント
│   ├── Header.tsx
│   ├── SearchBar.tsx
│   ├── CharacterTags.tsx
│   ├── RecentSearches.tsx
│   ├── EpisodeCard.tsx
│   ├── NoResults.tsx
│   ├── LoadingSpinner.tsx
│   └── ThemeProvider.tsx
├── data/
│   └── anime-data.json   # エピソードデータ
├── lib/
│   ├── search.ts          # 検索ロジック（ひらがな/カタカナ正規化）
│   └── history.ts         # 検索履歴（localStorage）
└── types/
    └── index.ts
```

## データ構造

`data/anime-data.json` に以下の形式でエピソードを追加できます。

```json
{
  "id": "s10e01a",
  "season": 10,
  "episode": "S10 第1話A",
  "title": "ポップコーン店番",
  "date": "2019-04-01",
  "thumbnail": "",
  "description": "エピソードのあらすじ",
  "characters": ["ジョージ", "黄色い帽子のおじさん", "ポッパーさん"]
}
```

## ローカル開発

```bash
npm install
npm run dev
```

## Vercelデプロイ

```bash
# Vercel CLIでデプロイ
npm i -g vercel
vercel

# または GitHub連携でプッシュするだけ自動デプロイ
git push origin main
```

## 将来の拡張ポイント

- **複数シーズン対応**: データJSONにシーズン1〜のエピソードを追加
- **シーズンフィルター**: シーズン別に絞り込み
- **お気に入り**: localStorage でお気に入りエピソード保存
- **Firebase/Supabase連携**: データをクラウドDBに移行
- **YouTube埋め込み**: エピソードカードに動画リンク追加
- **画像サムネイル**: `thumbnail` フィールドに画像パスを設定
- **管理画面**: エピソードCRUD操作
- **AIおすすめ機能**: 視聴履歴から次のエピソードを提案
