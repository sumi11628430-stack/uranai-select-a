# 占いの館（uranai-select-a）

星空をイメージした占いサイトです。GitHub Pages で公開しています。

## ページ構成

| ファイル | 内容 |
|----------|------|
| `index.html` | トップ（入口）。星空の背景から「入口」をクリックして入場 |
| `select.html` | 占いの選択ページ。「あなたの誕生石は？」を設置 |
| `birthstone.html` | 誕生石占い（準備中） |
| `assets/style.css` | 共通デザイン |
| `assets/starfield.js` | 背景の星空アニメーション |
| `assets/nav.js` | ページのフェード切り替え |

## 背景を本物の動画にしたいとき

1. 動画ファイル（例 `entrance.mp4`）を `assets/` に置く
2. 各HTML内のコメント `<!-- ▼ 本物の動画にしたいとき -->` の `<video>` を有効化する

## ローカルで確認する

このフォルダで簡易サーバーを起動してブラウザで開きます。

```powershell
python -m http.server 8000
# → ブラウザで http://localhost:8000 を開く
```
