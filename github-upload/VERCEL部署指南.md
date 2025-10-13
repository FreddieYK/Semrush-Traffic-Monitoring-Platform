# Vercel前端部署详细指南

## 前提条件
- ✅ Railway后端已成功部署
- ✅ 已获取Railway API链接
- ✅ 项目代码已上传到GitHub

## 第一步：获取Railway API链接

1. **登录Railway控制台**
   - 访问 [railway.app](https://railway.app)
   - 登录你的账户

2. **找到你的项目**
   - 在项目列表中找到 "Semrush-Traffic-Monitoring-Platform"
   - 点击进入项目详情

3. **获取API链接**
   - 在项目页面，你会看到类似这样的信息：
     ```
     🌐 https://your-app-name.railway.app
     ```
   - 或者点击 "Settings" → "Domains" 查看完整URL

4. **测试API**
   - 访问 `https://your-app-name.railway.app/api/load-excel`
   - 如果返回JSON数据，说明后端正常工作

## 第二步：Vercel部署方法

### 方法1：通过Vercel CLI（推荐）

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **在项目目录中部署**
   ```bash
   vercel
   ```

4. **设置环境变量**
   - 在Vercel控制台中，进入项目设置
   - 添加环境变量：
     - `REACT_APP_API_URL` = `https://your-railway-app.railway.app`

### 方法2：通过GitHub集成

1. **连接GitHub仓库**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择你的GitHub仓库

2. **配置项目设置**
   - Framework Preset: `Vite`
   - Root Directory: `./` (根目录)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **设置环境变量**
   - 在项目设置中添加：
     - `REACT_APP_API_URL` = `https://your-railway-app.railway.app`

## 第三步：环境变量配置

### 在Vercel控制台设置环境变量：

1. **进入项目设置**
   - 在Vercel控制台中选择你的项目
   - 点击 "Settings" 标签

2. **添加环境变量**
   - 点击 "Environment Variables"
   - 添加以下变量：
     ```
     REACT_APP_API_URL = https://your-railway-app.railway.app
     ```

3. **重新部署**
   - 环境变量添加后，需要重新部署项目
   - 点击 "Deployments" → "Redeploy"

## 第四步：验证部署

### 1. 检查构建状态
- 在Vercel控制台查看部署日志
- 确保构建成功，没有错误

### 2. 测试前端应用
- 访问Vercel提供的域名
- 测试数据加载功能
- 检查控制台是否有API调用错误

### 3. 测试API连接
- 打开浏览器开发者工具
- 查看Network标签页
- 确认API请求指向正确的Railway URL

## 常见问题解决

### 1. 构建失败
**问题**：Vite构建失败
**解决**：
- 检查 `package.json` 中的构建脚本
- 确保所有依赖都已安装
- 检查 `vite.config.js` 配置

### 2. API连接失败
**问题**：前端无法连接到Railway后端
**解决**：
- 检查环境变量是否正确设置
- 确认Railway API链接有效
- 检查CORS配置

### 3. 环境变量不生效
**问题**：环境变量在Vercel中不生效
**解决**：
- 确保变量名以 `REACT_APP_` 开头
- 重新部署项目
- 检查变量值是否正确

## 完整检查清单

- [ ] Railway后端部署成功
- [ ] 获取Railway API链接
- [ ] 测试Railway API可用性
- [ ] 创建Vercel账户
- [ ] 连接GitHub仓库
- [ ] 配置项目设置
- [ ] 设置环境变量
- [ ] 部署到Vercel
- [ ] 测试前端应用
- [ ] 验证API连接
- [ ] 检查CORS配置

## 部署后的URL结构

- **前端**：`https://your-vercel-app.vercel.app`
- **后端API**：`https://your-railway-app.railway.app/api/`

## 注意事项

1. **环境变量**：确保在Vercel中正确设置 `REACT_APP_API_URL`
2. **CORS**：Railway后端需要允许Vercel域名的跨域请求
3. **HTTPS**：生产环境必须使用HTTPS
4. **缓存**：如果遇到缓存问题，可以清除浏览器缓存或强制刷新

完成这些步骤后，你的前端应用就能成功连接到Railway后端了！
