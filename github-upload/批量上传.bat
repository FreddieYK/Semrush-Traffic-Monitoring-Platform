@echo off
echo ========================================
echo    北美基金流量监控平台 - GitHub上传
echo ========================================
echo.

echo 正在检查文件...
if not exist "package.json" (
    echo 错误：package.json 文件不存在
    pause
    exit /b 1
)

echo 文件检查完成！
echo.
echo 请按照以下步骤手动上传到GitHub：
echo.
echo 1. 访问：https://github.com/FreddieYK/Semrush-Traffic-Monitoring-Platform
echo 2. 点击 "Add file" → "Upload files"
echo 3. 将本文件夹中的所有文件拖拽到页面上
echo 4. 提交信息：Initial commit: 北美基金流量监控平台
echo 5. 点击 "Commit changes"
echo.
echo 注意：如果文件超过100个，请分批上传
echo.

pause
