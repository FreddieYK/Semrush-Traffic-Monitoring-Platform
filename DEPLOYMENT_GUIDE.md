# 部署指南

本指南将帮助您将项目部署到 GitHub、Railway（后端）和 Vercel（前端）。

## 📋 前置要求

1. GitHub 账户
2. Railway 账户（用于后端部署）
3. Vercel 账户（用于前端部署）
4. Git 已安装并配置

## 🚀 部署步骤

### 第一步：上传代码到 GitHub

1. **初始化 Git 仓库（如果还没有）**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 更新流量监控平台"
   ```

2. **连接到 GitHub 仓库**
   ```bash
   git remote add origin https://github.com/FreddieYK/Semrush-Traffic-Monitoring-Platform.git
   git branch -M main
   git push -u origin main
   ```

   如果仓库已存在，使用：
   ```bash
   git remote set-url origin https://github.com/FreddieYK/Semrush-Traffic-Monitoring-Platform.git
   git push -u origin main
   ```

### 第二步：部署后端到 Railway

1. **登录 Railway**
   - 访问 [Railway](https://railway.app)
   - 使用 GitHub 账户登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择您的仓库：`FreddieYK/Semrush-Traffic-Monitoring-Platform`

3. **配置项目**
   - Railway 会自动检测到 `railway.json` 配置文件
   - 确保根目录设置为项目根目录
   - 确保 `server.js` 在根目录

4. **设置环境变量**
   - 在 Railway 项目设置中添加环境变量：
     - `PORT` = `3001`（Railway 会自动提供，但可以显式设置）
     - `NODE_ENV` = `production`

5. **部署**
   - Railway 会自动开始构建和部署
   - 等待部署完成，记下生成的域名（如：`xxx.railway.app`）

6. **获取后端 URL**
   - 部署完成后，Railway 会提供一个公共 URL
   - 格式类似：`https://your-app-name.up.railway.app`
   - **重要**：记下这个 URL，下一步会用到

### 第三步：部署前端到 Vercel

1. **登录 Vercel**
   - 访问 [Vercel](https://vercel.com)
   - 使用 GitHub 账户登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择您的仓库：`FreddieYK/Semrush-Traffic-Monitoring-Platform`

3. **配置项目**
   - **Framework Preset**: Vite
   - **Root Directory**: `./`（项目根目录）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **设置环境变量**
   - 在 "Environment Variables" 中添加：
     - `VITE_API_URL` = `https://your-railway-app.up.railway.app/api`
     - 将 `your-railway-app` 替换为您的实际 Railway 应用名称

5. **部署**
   - 点击 "Deploy"
   - Vercel 会自动构建和部署前端

### 第四步：更新前端环境变量（如果需要）

如果部署后需要更改后端 API 地址：

1. 在 Vercel 项目设置中
2. 进入 "Environment Variables"
3. 更新 `VITE_API_URL` 的值
4. 重新部署

## 📝 重要文件说明

- `server.js` - 后端服务器（Railway 部署）
- `src/App.jsx` - 前端应用（Vercel 部署）
- `railway.json` - Railway 部署配置
- `vercel.json` - Vercel 部署配置
- `package.json` - 项目依赖配置
- `.gitignore` - Git 忽略文件配置

## 🔧 故障排除

### Railway 部署问题

1. **构建失败**
   - 检查 `package.json` 中的依赖是否正确
   - 确保 `server.js` 在根目录
   - 查看 Railway 构建日志

2. **API 无法访问**
   - 检查 Railway 项目是否正在运行
   - 确认环境变量设置正确
   - 检查 `server.js` 中的端口配置

### Vercel 部署问题

1. **构建失败**
   - 检查 `vite.config.js` 配置
   - 确保所有依赖都已安装
   - 查看 Vercel 构建日志

2. **API 请求失败**
   - 检查 `VITE_API_URL` 环境变量是否正确设置
   - 确认后端 URL 包含 `/api` 路径
   - 检查 CORS 配置（已在 `server.js` 中配置）

## 🔄 更新部署

当您更新代码后：

1. **提交到 GitHub**
   ```bash
   git add .
   git commit -m "更新描述"
   git push
   ```

2. **自动部署**
   - Railway 和 Vercel 都会自动检测 GitHub 推送
   - 自动触发新的部署

## 📞 支持

如有问题，请检查：
- Railway 部署日志
- Vercel 部署日志
- 浏览器控制台错误信息
- 服务器控制台输出

