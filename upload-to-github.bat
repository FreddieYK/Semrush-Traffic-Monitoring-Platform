@echo off
echo 正在上传项目到GitHub...

echo 添加所有文件到Git...
git add .

echo 提交更改...
git commit -m "Update: 北美基金流量监控平台 - 完整功能版本"

echo 推送到GitHub...
git push origin main

echo 上传完成！
echo 请访问: https://github.com/FreddieYK/Semrush-Traffic-Monitoring-Platform
pause
