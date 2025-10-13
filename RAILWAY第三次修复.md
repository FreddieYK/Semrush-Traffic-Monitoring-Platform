# Railway第三次修复 - 解决rollup模块错误

## 问题描述
Railway部署失败，错误信息：
```
MODULE_NOT_FOUND: Cannot find module '/app/node_modules/rollup/dist/native.js'
```

## 根本原因
Railway尝试构建整个项目（包括前端），但前端依赖中的rollup模块在Node.js 18.x环境下存在兼容性问题。

## 解决方案

### 方案1：使用简化的package.json（推荐）
1. 在Railway项目设置中，将根目录的`package.json`替换为`package-railway.json`
2. 或者直接重命名：`package-railway.json` → `package.json`

### 方案2：使用backend目录
1. 将`backend/`目录作为Railway的根目录
2. 该目录只包含后端必需的文件

### 方案3：修改railway.json配置
使用以下配置：
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cp package-railway.json package.json && npm install --production"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/load-excel",
    "healthcheckTimeout": 300
  }
}
```

## 推荐步骤
1. 将`package-railway.json`重命名为`package.json`（备份原文件）
2. 提交到GitHub
3. 重新部署Railway

## 验证
部署成功后，访问：`https://your-app.railway.app/api/load-excel`
应该返回JSON数据而不是错误。
