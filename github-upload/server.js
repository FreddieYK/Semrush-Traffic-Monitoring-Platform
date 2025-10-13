const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 全局变量存储数据
let globalTrafficData = [];
let globalCompetitorData = [];

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, `${timestamp}-${originalName}`);
  }
});

const upload = multer({ storage });

// 计算环比变化
const calculateMoMChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous);
};

// 解析值，处理特殊值
const parseValue = (value) => {
  if (value === null || value === undefined || value === '' || value === 'n/a' || value === 'NaN' || isNaN(value)) {
    return 0;
  }
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// 加载流量数据的函数
const loadTrafficData = () => {
  try {
    const excelPath = path.join(__dirname, '网站流量数据.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.log('流量数据文件不存在，跳过加载');
      return [];
    }

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // 处理数据
    const processedData = jsonData.map((row, index) => {
      // 处理特殊值，确保转换为数值
      const currentMonthVisits = parseValue(row['九月访问量']);
      const previousMonthVisits = parseValue(row['八月访问量']);
      const momChange = calculateMoMChange(currentMonthVisits, previousMonthVisits);

      return {
        id: index + 1,
        公司: row['公司'] || '',
        域名: row['域名'] || '',
        上月访问量: previousMonthVisits,
        当月访问量: currentMonthVisits,
        访问量环比变化: momChange,
        购买转化率: parseValue(row['购买转化率']),
        平均访问时长: parseValue(row['平均访问时长'])
      };
    });

    console.log(`成功加载 ${processedData.length} 条流量数据`);
    return processedData;
  } catch (error) {
    console.error('加载流量数据时出错:', error);
    return [];
  }
};

// 加载竞争对手数据的函数
const loadCompetitorData = () => {
  try {
    const excelPath = path.join(__dirname, '流量前一百竞争对手匹配.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.log('竞争对手数据文件不存在，跳过加载');
      return [];
    }

    const workbook = XLSX.readFile(excelPath);
    
    // 读取Sheet1数据
    const sheet1Name = workbook.SheetNames[0];
    const sheet1Data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet1Name]);
    
    // 读取Sheet2数据
    const sheet2Name = workbook.SheetNames[1];
    const sheet2Data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet2Name]);
    
    // 创建投资机构映射（大小写不敏感）
    const investmentMapping = {};
    sheet2Data.forEach(row => {
      const companyName = (row['公司'] || '').toLowerCase().trim();
      const investment = row['投资机构'] || '';
      if (companyName && investment) {
        investmentMapping[companyName] = investment;
      }
    });

    // 读取流量数据，获取公司名称列表
    const trafficFilePath = path.join(__dirname, '网站流量数据.xlsx');
    let trafficCompanyNames = new Set();
    
    if (fs.existsSync(trafficFilePath)) {
      const trafficWorkbook = XLSX.readFile(trafficFilePath);
      const trafficSheetName = trafficWorkbook.SheetNames[0];
      const trafficWorksheet = trafficWorkbook.Sheets[trafficSheetName];
      const trafficData = XLSX.utils.sheet_to_json(trafficWorksheet);
      
      trafficData.forEach(row => {
        const companyName = (row['公司'] || '').toLowerCase().trim();
        if (companyName) {
          trafficCompanyNames.add(companyName);
        }
      });
    }

    // 处理Sheet1数据
    const processedData = sheet1Data.map(row => {
      const company = row['公司'] || '';
      const competitors = row['竞争对手'] || '';
      const competitorsList = competitors.split(',').map(c => c.trim()).filter(c => c);
      
      // 检查每个竞争对手是否有投资机构信息
      const competitorInvestmentInfo = {};
      const matchedCompetitors = [];
      
      competitorsList.forEach(competitor => {
        const competitorLower = competitor.toLowerCase().trim();
        if (investmentMapping[competitorLower]) {
          competitorInvestmentInfo[competitor] = investmentMapping[competitorLower];
        }
        
        // 检查是否在流量数据中
        if (trafficCompanyNames.has(competitorLower)) {
          matchedCompetitors.push(competitor);
        }
      });

      return {
        公司: company,
        竞争对手: competitors,
        投资机构: investmentMapping[(company || '').toLowerCase().trim()] || '',
        有投资机构: !!investmentMapping[(company || '').toLowerCase().trim()],
        竞争对手有流量数据: matchedCompetitors.length > 0,
        匹配的竞争对手: matchedCompetitors,
        竞争对手投资机构信息: competitorInvestmentInfo
      };
    });

    console.log(`成功加载 ${processedData.length} 条竞争对手数据`);
    return processedData;
  } catch (error) {
    console.error('加载竞争对手数据时出错:', error);
    return [];
  }
};

// 加载初始Excel数据的路由
app.get('/api/load-excel', (req, res) => {
  res.json({ success: true, data: globalTrafficData });
});

// 上传Excel文件的路由
app.post('/api/upload-excel', upload.single('excel'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // 处理数据，自动计算环比变化
    const processedData = jsonData.map((row, index) => {
      // 尝试识别当月和上月数据列
      const keys = Object.keys(row);
      
      // 查找访问量相关的列
      const visitColumns = keys.filter(key => 
        key.includes('访问量') && !key.includes('环比') && !key.includes('变化')
      );
      
      let currentMonthVisits = 0;
      let previousMonthVisits = 0;
      
      if (visitColumns.length >= 2) {
        // 假设最后一列是当月，倒数第二列是上月
        currentMonthVisits = parseValue(row[visitColumns[visitColumns.length - 1]]);
        previousMonthVisits = parseValue(row[visitColumns[visitColumns.length - 2]]);
      } else if (visitColumns.length === 1) {
        currentMonthVisits = parseValue(row[visitColumns[0]]);
      }

      const momChange = calculateMoMChange(currentMonthVisits, previousMonthVisits);

      return {
        id: index + 1,
        公司: row['公司'] || row['Company'] || '',
        域名: row['域名'] || row['Domain'] || '',
        上月访问量: previousMonthVisits,
        当月访问量: currentMonthVisits,
        访问量环比变化: momChange,
        购买转化率: parseValue(row['购买转化率'] || row['购买转换率'] || row['Conversion Rate']),
        平均访问时长: parseValue(row['平均访问时长'] || row['Average Duration'])
      };
    });

    // 清理上传的文件
    fs.unlinkSync(req.file.path);

    res.json({ success: true, data: processedData });
  } catch (error) {
    console.error('处理上传文件失败:', error);
    
    // 清理可能存在的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: '文件处理失败', 
      error: error.message 
    });
  }
});

// 获取统计信息的路由
app.post('/api/stats', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || data.length === 0) {
      return res.json({ 
        success: true, 
        stats: { total: 0, avgChange: 0, avgConversion: 0, totalVisits: 0 } 
      });
    }

    const totalVisits = data.reduce((sum, item) => sum + (item.当月访问量 || 0), 0);
    const avgChange = data.reduce((sum, item) => sum + (item.访问量环比变化 || 0), 0) / data.length;
    const avgConversion = data.reduce((sum, item) => sum + (item.购买转化率 || 0), 0) / data.length;

    const stats = {
      total: data.length,
      avgChange,
      avgConversion,
      totalVisits
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('计算统计信息失败:', error);
    res.status(500).json({ success: false, message: '统计信息计算失败', error: error.message });
  }
});

// 加载竞争对手匹配数据的路由
app.get('/api/competitor-matching', (req, res) => {
  res.json({ success: true, data: globalCompetitorData });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 启动时自动加载数据
const initializeData = async () => {
  console.log('正在初始化数据...');
  
  // 加载流量数据
  globalTrafficData = loadTrafficData();
  
  // 加载竞争对手数据
  globalCompetitorData = loadCompetitorData();
  
  console.log('数据初始化完成！');
  console.log(`流量数据: ${globalTrafficData.length} 条`);
  console.log(`竞争对手数据: ${globalCompetitorData.length} 条`);
};

// 启动服务器
app.listen(PORT, async () => {
  console.log(`后端服务运行在端口 ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}`);
  
  // 初始化数据
  await initializeData();
});

module.exports = app;