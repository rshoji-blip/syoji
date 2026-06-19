#!/bin/bash
# そよじ 起動スクリプト（Macでダブルクリックして使えます）

cd "$(dirname "$0")"

echo ""
echo "🌟 そよじ を準備中..."
echo ""

# Flaskをインストール（初回のみ）
pip3 install flask --quiet --break-system-packages 2>/dev/null || pip3 install flask --quiet 2>/dev/null

echo "✅ 準備完了！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ブラウザで開いてください："
echo "  http://localhost:5000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ブラウザを自動で開く（2秒後）
sleep 2 && open http://localhost:5000 &

python3 web_app.py
