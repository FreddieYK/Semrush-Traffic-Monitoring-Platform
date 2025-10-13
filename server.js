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

// 加载初始Excel数据的路由
app.get('/api/load-excel', (req, res) => {
  try {
    res.json({ success: true, data: globalTrafficData });
  } catch (error) {
    console.error('加载Excel文件失败:', error);
    res.status(500).json({ success: false, message: '加载数据失败', error: error.message });
  }
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
  try {
    const excelPath = path.join(__dirname, '流量前一百竞争对手匹配.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      return res.json({ success: false, message: '竞争对手匹配文件不存在' });
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
      if (row['公司'] && row['投资机构']) {
        const companyKey = row['公司'].toString().toLowerCase().trim();
        investmentMapping[companyKey] = row['投资机构'];
      }
    });

    // 读取流量数据文件，获取771家公司名
    const trafficDataPath = path.join(__dirname, '网站流量数据.xlsx');
    let trafficCompanyNames = new Set();
    
    if (fs.existsSync(trafficDataPath)) {
      try {
        const trafficWorkbook = XLSX.readFile(trafficDataPath);
        const trafficSheetName = trafficWorkbook.SheetNames[0];
        const trafficData = XLSX.utils.sheet_to_json(trafficWorkbook.Sheets[trafficSheetName]);
        
        // 提取所有公司名（大小写不敏感）
        trafficData.forEach(row => {
          if (row['公司']) {
            trafficCompanyNames.add(row['公司'].toString().toLowerCase().trim());
          }
        });
      } catch (error) {
        console.error('读取流量数据文件失败:', error);
      }
    }

    // 处理Sheet1数据，标记匹配的公司
    const processedData = sheet1Data.map((row, index) => {
      const companyName = row['公司'] || '';
      const competitorName = row['竞争对手'] || '';
      const companyKey = companyName.toString().toLowerCase().trim();
      const hasInvestment = investmentMapping[companyKey] ? true : false;
      
      // 检查竞争对手名是否在流量数据中（大小写不敏感）
      const competitors = competitorName.split(',').map(c => c.trim());
      let hasTrafficData = false;
      const matchedCompetitors = [];
      const competitorInvestmentInfo = {}; // 存储竞争对手的投资机构信息
      
      for (const competitor of competitors) {
        if (competitor) {
          const competitorKey = competitor.toLowerCase().trim();
          if (trafficCompanyNames.has(competitorKey)) {
            hasTrafficData = true;
            matchedCompetitors.push(competitorKey);
            
            // 查找该竞争对手的投资机构信息
            const competitorInvestment = investmentMapping[competitorKey];
            if (competitorInvestment) {
              competitorInvestmentInfo[competitorKey] = competitorInvestment;
            }
          }
        }
      }
      
      return {
        id: index + 1,
        公司: companyName,
        竞争对手: competitorName,
        投资机构: investmentMapping[companyKey] || null,
        有投资机构: hasInvestment,
        竞争对手有流量数据: hasTrafficData,
        匹配的竞争对手: matchedCompetitors,
        竞争对手投资机构信息: competitorInvestmentInfo, // 新增：竞争对手的投资机构信息
        ...row // 包含其他所有列
      };
    });

    res.json({ success: true, data: globalCompetitorData });
  } catch (error) {
    console.error('加载竞争对手匹配数据失败:', error);
    res.status(500).json({ success: false, message: '加载数据失败', error: error.message });
  }
});

// 全局变量存储数据
let globalTrafficData = [];
let globalCompetitorData = [];

// 加载流量数据函数
const loadTrafficData = () => {
  try {
    console.log('正在加载流量数据...');
    const excelPath = path.join(__dirname, '网站流量数据.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.log('流量数据Excel文件不存在');
      return [];
    }

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const processedData = jsonData.map((row, index) => {
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

    console.log(`流量数据加载完成: ${processedData.length} 条`);
    return processedData;
  } catch (error) {
    console.error('加载流量数据失败:', error);
    return [];
  }
};

// 加载竞争对手数据函数
const loadCompetitorData = () => {
  try {
    console.log('正在加载竞争对手数据...');
    const excelPath = path.join(__dirname, '流量前一百竞争对手匹配.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.log('竞争对手数据Excel文件不存在');
      return [];
    }

    const workbook = XLSX.readFile(excelPath);
    const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
    const sheet2 = workbook.Sheets[workbook.SheetNames[1]];
    
    const sheet1Data = XLSX.utils.sheet_to_json(sheet1);
    const sheet2Data = XLSX.utils.sheet_to_json(sheet2);

    // 创建投资机构映射
    const investmentMapping = {};
    sheet2Data.forEach(row => {
      const companyName = (row['公司'] || '').toLowerCase().trim();
      if (companyName) {
        investmentMapping[companyName] = row['投资机构'] || '';
      }
    });

    // 加载流量数据用于匹配
    const trafficData = loadTrafficData();
    const trafficCompanyNames = new Set(
      trafficData.map(row => (row.公司 || '').toLowerCase().trim()).filter(name => name)
    );

    const processedData = sheet1Data.map((row, index) => {
      const companyName = (row['公司'] || '').toLowerCase().trim();
      const hasInvestment = investmentMapping[companyName] ? true : false;
      
      // 检查竞争对手是否有流量数据
      const competitors = (row['竞争对手'] || '').split(',').map(comp => comp.trim());
      const matchedCompetitors = competitors.filter(comp => 
        trafficCompanyNames.has(comp.toLowerCase().trim())
      );
      
      // 创建竞争对手投资机构信息映射
      const competitorInvestmentInfo = {};
      competitors.forEach(comp => {
        const compLower = comp.toLowerCase().trim();
        if (investmentMapping[compLower]) {
          competitorInvestmentInfo[comp] = investmentMapping[compLower];
        }
      });

      return {
        id: index + 1,
        公司: row['公司'] || '',
        竞争对手: row['竞争对手'] || '',
        投资机构: investmentMapping[companyName] || '',
        有投资机构: hasInvestment,
        竞争对手有流量数据: matchedCompetitors.length > 0,
        匹配的竞争对手: matchedCompetitors,
        竞争对手投资机构信息: competitorInvestmentInfo
      };
    });

    console.log(`竞争对手数据加载完成: ${processedData.length} 条`);
    return processedData;
  } catch (error) {
    console.error('加载竞争对手数据失败:', error);
    return [];
  }
};

// 初始化数据
const initializeData = async () => {
  console.log('正在初始化数据...');
  globalTrafficData = loadTrafficData();
  globalCompetitorData = loadCompetitorData();
  console.log('数据初始化完成！');
  console.log(`流量数据: ${globalTrafficData.length} 条`);
  console.log(`竞争对手数据: ${globalCompetitorData.length} 条`);
};

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

app.listen(PORT, async () => {
  console.log(`后端服务运行在端口 ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}`);
  await initializeData();
});

module.exports = app;