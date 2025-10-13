# Vercel部署修复说明

## 问题描述
Vercel前端部署失败，出现以下错误：
1. **Node.js 18.x 版本已停止支持**
2. **vercel.json 配置中的 `builds` 字段已过时**

## 修复内容

### 1. 更新Node.js版本
- 在 `package.json` 中添加了 `engines` 字段，指定Node.js版本为 `>=20.0.0`
- 创建了 `.nvmrc` 文件，指定Node.js版本为 `20.18.0`

### 2. 更新vercel.json配置
- 移除了过时的 `builds` 字段
- 使用新的配置格式：
  ```json
  {
    "version": 2,
    "name": "traffic-monitor-frontend",
    "framework": "vite",
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/index.html"
      }
    ]
  }
  ```

## 部署步骤

### 1. 上传修复后的文件
将以下文件上传到GitHub：
- `package.json` (已更新)
- `vercel.json` (已更新)
- `.nvmrc` (新文件)

### 2. 重新部署
- 在Vercel控制台中，点击 "Redeploy" 或 "Deploy"
- 或者推送代码到GitHub，Vercel会自动重新部署

### 3. 验证部署
- 检查构建日志，确保没有错误
- 访问部署的URL，测试应用功能

## 注意事项

1. **Node.js版本**：现在使用Node.js 20.x版本，这是Vercel当前支持的版本
2. **配置格式**：使用了Vercel推荐的新配置格式，避免了过时字段的警告
3. **环境变量**：确保在Vercel中正确设置了 `REACT_APP_API_URL` 环境变量

## 预期结果

修复后，Vercel部署应该能够成功完成，不再出现Node.js版本和配置格式的错误。
