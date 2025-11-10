# 部署前检查清单 ✅

在部署到 GitHub、Railway 和 Vercel 之前，请确认以下项目：

## 📦 代码准备

- [x] 所有代码更改已完成
- [x] `.gitignore` 已更新（排除 `node_modules/`, `dist/`, `uploads/`）
- [x] 环境变量示例文件（`env.example`）已更新
- [x] 前端代码使用环境变量而非硬编码 URL
- [x] 所有文件已保存

## 🔍 文件检查

确保以下文件存在且正确：
- [x] `server.js` - 后端服务器
- [x] `src/App.jsx` - 前端应用
- [x] `package.json` - 依赖配置
- [x] `railway.json` - Railway 配置
- [x] `vercel.json` - Vercel 配置
- [x] `vite.config.js` - Vite 配置
- [x] `网站流量数据.xlsx` - 数据文件（需要上传）
- [x] `流量前一百竞争对手匹配.xlsx` - 数据文件（需要上传）

## 🚀 部署步骤

### GitHub 上传
```bash
# 1. 检查状态
git status

# 2. 添加所有文件
git add .

# 3. 提交更改
git commit -m "更新：修复数据解析和显示问题"

# 4. 推送到 GitHub
git push origin main
```

### Railway 部署（后端）
1. [ ] 登录 Railway
2. [ ] 创建新项目或更新现有项目
3. [ ] 连接到 GitHub 仓库
4. [ ] 设置环境变量：
   - `PORT=3001`
   - `NODE_ENV=production`
5. [ ] 等待部署完成
6. [ ] 记录后端 URL（格式：`https://xxx.up.railway.app`）

### Vercel 部署（前端）
1. [ ] 登录 Vercel
2. [ ] 导入 GitHub 项目
3. [ ] 配置项目：
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. [ ] 设置环境变量：
   - `VITE_API_URL` = `https://your-railway-app.up.railway.app/api`
5. [ ] 部署

## ✅ 部署后验证

- [ ] Railway 后端服务正常运行
- [ ] Vercel 前端可以访问
- [ ] 前端可以成功调用后端 API
- [ ] 数据正确加载和显示
- [ ] "购买转化率" 显示正确
- [ ] "平均访问时长" 显示为可读格式

## 🔗 重要链接

- GitHub 仓库: https://github.com/FreddieYK/Semrush-Traffic-Monitoring-Platform
- Railway 控制台: https://railway.app/dashboard
- Vercel 控制台: https://vercel.com/dashboard

## 📝 注意事项

1. **Excel 文件**：确保 `网站流量数据.xlsx` 和 `流量前一百竞争对手匹配.xlsx` 已上传到 GitHub
2. **环境变量**：Railway 部署后，记得在 Vercel 中设置正确的 `VITE_API_URL`
3. **CORS**：后端已配置 CORS，允许跨域请求
4. **端口**：Railway 会自动分配端口，无需手动设置

