# カード参照機能 仕様書

## 1. 概要

PC側でカードを配布し、Supabase に保存する。  
スマホ側は room_id と player_id を指定してカード番号を参照する。  
再配布時は同じ room_id のレコードが上書きされ、スマホ側は更新操作で最新を取得する。

---

## 2. データベース仕様（Supabase）

### テーブル名

ito_room

### カラム

- room_id (text)  
  部屋番号（ゲーム識別用）

- player_id (int)  
  プレイヤー番号（1〜人数）

- card_number (int)  
  配られたカード番号

### 主キー

PRIMARY KEY (room_id, player_id)

### 備考

- テーブルは1つでよい
- カラムは3つでよい
- RLSはOFF
- 認証不要（公開キーで読み書き）

---

## 3. PC側：カード配布処理

### 3.1 カード番号生成（重複なし）

```ts
function generateCards(count: number) {
  const numbers = [...Array(100).keys()].map((n) => n + 1);
  const shuffled = numbers.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```
