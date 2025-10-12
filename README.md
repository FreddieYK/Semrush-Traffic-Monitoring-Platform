# 北美基金Profilo流量监控平台

一个基于React和Express.js的网站流量监控平台，支持数据上传、分析和竞争对手匹配功能。

## 功能特性

- 📊 **流量数据监控**: 实时显示网站访问量、转化率等关键指标
- 🔄 **环比分析**: 自动计算月度访问量变化趋势
- 🏢 **竞争对手匹配**: 智能匹配竞争对手并显示投资机构信息
- 📈 **数据可视化**: 直观的图表和表格展示
- 📁 **Excel导入导出**: 支持Excel文件的数据导入和导出
- 🎨 **现代化UI**: 响应式设计，支持深色主题

## 技术栈

### 前端
- React 18
- Vite
- Lucide React (图标)
- CSS3 (自定义样式)

### 后端
- Node.js
- Express.js
- Multer (文件上传)
- CORS (跨域支持)
- XLSX (Excel文件处理)

## 本地开发

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
# 启动后端服务 (端口 3001)
npm run server

# 启动前端服务 (端口 3000)
npm run dev
```

访问 http://localhost:3000 查看应用

## 部署

### Railway (后端部署)
1. 连接GitHub仓库到Railway
2. 设置环境变量
3. 自动部署

### Vercel (前端部署)
1. 连接GitHub仓库到Vercel
2. 设置构建命令: `npm run build`
3. 设置输出目录: `dist`
4. 配置环境变量

## 项目结构

```
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # 应用入口
│   └── index.css        # 全局样式
├── server.js            # 后端服务器
├── package.json         # 项目配置
├── vite.config.js       # Vite配置
└── README.md           # 项目说明
```

## API接口

- `GET /api/load-excel` - 加载Excel数据
- `POST /api/upload-excel` - 上传Excel文件
- `GET /api/competitor-matching` - 获取竞争对手匹配数据

## 许可证

MIT License
