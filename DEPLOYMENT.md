# 部署指南

## 项目已准备就绪！

您的项目已经配置好所有必要的文件，可以开始部署了。

## 1. 上传到GitHub

由于网络连接问题，请手动执行以下步骤：

### 方法一：使用GitHub Desktop
1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 登录您的GitHub账户
3. 选择 "Clone a repository from the Internet"
4. 输入仓库URL: `https://github.com/FreddieYK/Semrush-Traffic-Monitoring-Platform.git`
5. 选择本地路径并克隆
6. 将项目文件复制到克隆的文件夹中
7. 在GitHub Desktop中提交并推送更改

### 方法二：使用命令行
```bash
# 在项目目录中执行
git add .
git commit -m "Initial commit: 北美基金流量监控平台"
git push -u origin main
```

## 2. Railway 后端部署

### 步骤：
1. 访问 [Railway](https://railway.app/)
2. 使用GitHub账户登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择您的仓库 `FreddieYK/Semrush-Traffic-Monitoring-Platform`
5. 配置部署设置：
   - **Root Directory**: 留空（根目录）
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. 等待部署完成
7. 记录生成的域名（如：`https://your-app-name.railway.app`）

### 环境变量设置：
在Railway项目设置中添加：
- `NODE_ENV`: `production`
- `PORT`: Railway会自动设置

## 3. Vercel 前端部署

### 步骤：
1. 访问 [Vercel](https://vercel.com/)
2. 使用GitHub账户登录
3. 点击 "New Project" → "Import Git Repository"
4. 选择您的仓库
5. 配置构建设置：
   - **Framework Preset**: Vite
   - **Root Directory**: 留空
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. 添加环境变量：
   - `REACT_APP_API_URL`: 您的Railway后端URL（如：`https://your-app-name.railway.app`）
7. 点击 "Deploy"

## 4. 更新前端API地址

部署完成后，需要更新前端代码中的API地址：

1. 在Vercel项目设置中找到环境变量
2. 添加 `REACT_APP_API_URL` 并设置为您的Railway后端URL
3. 重新部署前端

## 5. 文件结构说明

```
├── src/                    # 前端源码
│   ├── App.jsx            # 主应用组件
│   ├── main.jsx           # 应用入口
│   └── index.css          # 样式文件
├── server.js              # 后端服务器
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
├── railway.json           # Railway部署配置
├── vercel.json            # Vercel部署配置
├── .gitignore             # Git忽略文件
└── README.md              # 项目说明
```

## 6. 部署后检查

### 后端检查：
- 访问 `https://your-railway-app.railway.app/api/load-excel`
- 应该返回JSON格式的流量数据

### 前端检查：
- 访问您的Vercel域名
- 检查数据加载是否正常
- 测试竞争对手匹配功能

## 7. 常见问题

### 问题1：前端无法连接后端
**解决方案**：检查 `REACT_APP_API_URL` 环境变量是否正确设置

### 问题2：Excel文件无法加载
**解决方案**：确保Excel文件已上传到Railway服务器

### 问题3：CORS错误
**解决方案**：后端已配置CORS，如果仍有问题，检查Railway的域名设置

## 8. 维护和更新

### 更新代码：
1. 在本地修改代码
2. 提交到GitHub
3. Railway和Vercel会自动重新部署

### 添加新功能：
1. 在本地开发
2. 测试通过后推送到GitHub
3. 部署平台会自动更新

## 9. 监控和日志

### Railway：
- 在Railway控制台查看后端日志
- 监控服务器性能和错误

### Vercel：
- 在Vercel控制台查看前端部署状态
- 查看访问统计和性能指标

## 10. 备份建议

- 定期备份Excel数据文件
- 将重要数据存储在GitHub仓库中
- 考虑使用数据库存储数据以提高可靠性

---

**部署完成后，您的流量监控平台就可以在全球范围内访问了！**
