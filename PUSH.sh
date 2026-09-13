#!/bin/bash
# 一键推送到 GitHub。用法：在「终端 Terminal」里粘贴这一行然后回车
#
#   bash ~/Desktop/NMDP-Tabling-Pop-Up/PUSH.sh
#
set -e
cd "$(dirname "$0")"

REPO="https://github.com/EvaLuglitched/NMDP-Tabling-Pop-Up.git"

echo "==> 目录：$(pwd)"

if [ ! -d .git ]; then
  echo "==> 初始化 git 仓库"
  git init -q -b main
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO"
else
  git remote add origin "$REPO"
fi

echo "==> 拉取 GitHub 上的现有历史（不会覆盖你桌面上的文件）"
git fetch origin main

# 把 HEAD 指到线上最新提交，但完全不动工作区的文件。
# 这样接下来的提交是线上历史的正常延续，不需要 force push。
git reset --soft origin/main

echo "==> 本次将要提交的改动："
git add -A
git status --short

echo
git commit -q -m "fix: make the campaign site actually work on Vercel

- vercel.json 不再吞掉 /api 子路径，pledge 按钮不再报 Connection error
- 数据从 /tmp JSON 文件改为 Postgres，跨实例与冷启动持久保存
- pledge 名单 / 导出 / 清空接口加上 ADMIN_TOKEN 鉴权
- vite 改为动态导入，不再进 serverless 包
- 统计轮询仅在打开 dashboard 时进行，避免耗尽 Vercel 调用额度" || echo "(没有需要提交的改动)"

echo "==> 推送到 GitHub"
git push origin main

echo
echo "============================================"
echo " 推送成功！Vercel 会在 1-2 分钟内自动重新部署。"
echo
echo " 接下来还要在 Vercel 后台配置两个环境变量："
echo "   DATABASE_URL   —— 数据库连接串"
echo "   ADMIN_TOKEN    —— 你自己定的管理员密码"
echo " 配置完记得 Redeploy 一次，然后打开："
echo "   https://你的域名/api/health"
echo " 看到 \"storage\": \"postgres\" 就说明数据真的存下来了。"
echo "============================================"
