import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ChevronUp,
  ChevronDown,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Users
} from 'lucide-react';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const fileInputRef = useRef(null);
  
  // 竞争对手匹配相关状态
  const [competitorData, setCompetitorData] = useState([]);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('traffic');
  const [showTrafficModal, setShowTrafficModal] = useState(false);
  const [selectedTrafficCompany, setSelectedTrafficCompany] = useState(null); // 'traffic' 或 'competitor'

  // 页面加载时自动获取数据
  useEffect(() => {
    // 总是尝试从服务器加载最新数据
    loadInitialData();
    loadCompetitorData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? process.env.REACT_APP_API_URL || 'https://your-railway-app.railway.app'
        : '/api';
      const response = await fetch(`${apiUrl}/load-excel`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        localStorage.setItem('trafficData', JSON.stringify(result.data));
      }
    } catch (error) {
      console.error('加载初始数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载竞争对手匹配数据
  const loadCompetitorData = async () => {
    try {
      console.log('开始加载竞争对手数据...');
      setCompetitorLoading(true);
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? process.env.REACT_APP_API_URL || 'https://your-railway-app.railway.app'
        : '/api';
      const response = await fetch(`${apiUrl}/competitor-matching`);
      console.log('API响应状态:', response.status);
      const result = await response.json();
      console.log('API响应结果:', result);
      if (result.success) {
        console.log('竞争对手数据加载成功，数据量:', result.data.length);
        setCompetitorData(result.data);
        localStorage.setItem('competitorData', JSON.stringify(result.data));
      } else {
        console.error('API返回失败:', result.message);
      }
    } catch (error) {
      console.error('加载竞争对手数据失败:', error);
    } finally {
      setCompetitorLoading(false);
    }
  };

  // 计算环比变化
  const calculateMoMChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous);
  };

  // 处理文件上传
  const handleFileUpload = (file) => {
    if (!file) return;
    
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // 处理数据，计算环比变化
        const processedData = jsonData.map((row, index) => {
          const currentMonthVisits = row['九月访问量'] || row['当月访问量'] || 0;
          const previousMonthVisits = row['八月访问量'] || row['上月访问量'] || 0;
          const momChange = calculateMoMChange(currentMonthVisits, previousMonthVisits);
          
          return {
            id: index + 1,
            公司: row['公司'] || '',
            域名: row['域名'] || '',
            上月访问量: previousMonthVisits,
            当月访问量: currentMonthVisits,
            访问量环比变化: momChange,
            购买转化率: row['购买转化率'] || row['购买转换率'] || 0,
            每次访问页面数: row['每次访问页面数'] || 0,
            平均访问时长: row['平均访问时长'] || ''
          };
        });
        
        setData(processedData);
        localStorage.setItem('trafficData', JSON.stringify(processedData));
      } catch (error) {
        console.error('文件解析失败:', error);
        alert('文件解析失败，请检查文件格式');
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsBinaryString(file);
  };

  // 拖拽上传处理
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // 排序功能
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // 处理特殊值，转换为数值进行比较
      if (aVal === null || aVal === undefined || aVal === 'n/a' || isNaN(aVal)) {
        aVal = 0;
      }
      if (bVal === null || bVal === undefined || bVal === 'n/a' || isNaN(bVal)) {
        bVal = 0;
      }
      
      // 确保都是数值类型进行比较
      const aNum = typeof aVal === 'number' ? aVal : parseFloat(aVal) || 0;
      const bNum = typeof bVal === 'number' ? bVal : parseFloat(bVal) || 0;
      
      if (sortConfig.direction === 'asc') {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    });
  }, [data, sortConfig]);


  // 分页计算
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // 分页处理
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 重置到第一页当数据变化时
  useEffect(() => {
    setCurrentPage(1);
  }, [data, sortConfig]);

  // 处理投资机构标记点击
  const handleInvestmentClick = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setShowModal(false);
    setSelectedCompany(null);
  };

  // 处理流量公司点击
  const handleTrafficCompanyClick = async (companyName) => {
    try {
      // 从流量数据中查找该公司
      const trafficCompany = data.find(company => 
        company.公司 && company.公司.toLowerCase().trim() === companyName.toLowerCase().trim()
      );
      
      if (trafficCompany) {
        // 从竞争对手数据中查找该公司的投资机构信息
        let investmentInfo = null;
        let hasInvestment = false;
        
        // 查找该公司的投资机构信息
        const searchKey = companyName.toLowerCase().trim();
        console.log('搜索键:', searchKey);
        
        for (const comp of competitorData) {
          if (comp.竞争对手投资机构信息) {
            console.log('检查公司:', comp.公司, '投资机构信息键:', Object.keys(comp.竞争对手投资机构信息));
            if (comp.竞争对手投资机构信息[searchKey]) {
              investmentInfo = comp.竞争对手投资机构信息[searchKey];
              hasInvestment = true;
              console.log('找到投资机构信息:', investmentInfo);
              break;
            }
          }
        }
        
        // 合并流量数据和投资机构信息
        const companyWithInvestment = {
          ...trafficCompany,
          投资机构: investmentInfo,
          有投资机构: hasInvestment
        };
        
        setSelectedTrafficCompany(companyWithInvestment);
        setShowTrafficModal(true);
      } else {
        console.log('未找到该公司的流量数据:', companyName);
      }
    } catch (error) {
      console.error('查找流量数据失败:', error);
    }
  };

  // 关闭流量弹窗
  const closeTrafficModal = () => {
    setShowTrafficModal(false);
    setSelectedTrafficCompany(null);
  };

  // 格式化数字
  const formatNumber = (num) => {
    if (num === null || num === undefined || num === 'n/a' || isNaN(num)) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // 格式化百分比
  const formatPercentage = (num) => {
    if (num === null || num === undefined || num === 'n/a' || isNaN(num)) return '0.00%';
    return (num * 100).toFixed(2) + '%';
  };

  // 格式化访问时长
  const formatDuration = (duration) => {
    if (duration === null || duration === undefined || duration === 'n/a' || duration === '') return '0';
    return duration;
  };


  // 渲染排序图标
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="sort-icon" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="sort-icon active" /> : 
      <ChevronDown className="sort-icon active" />;
  };

  // 渲染变化指示器
  const renderChangeIndicator = (change) => {
    // 处理特殊值
    if (change === null || change === undefined || change === 'n/a' || isNaN(change)) {
      change = 0;
    }
    
    const className = change > 0 ? 'change-positive' : change < 0 ? 'change-negative' : 'change-neutral';
    const icon = change > 0 ? '↑' : change < 0 ? '↓' : '';
    
    return (
      <span className={`change-indicator ${className}`}>
        {icon}
        {(change * 100).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="container">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {/* 页面标题 */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)'
            }}>
              <BarChart3 size={24} color="white" />
            </div>
            <div>
              <h1 className="card-title" style={{ marginBottom: '0.25rem' }}>
                北美基金流量监控系统
              </h1>
              <p className="card-subtitle" style={{ margin: 0 }}>
                简约优雅的网站流量数据分析与监控平台
              </p>
            </div>
          </div>
          
          {/* 标签页切换 */}
          <div className="tab-container">
            <button 
              className={`tab-button ${activeTab === 'traffic' ? 'active' : ''}`}
              onClick={() => setActiveTab('traffic')}
            >
              <BarChart3 size={18} />
              流量数据
            </button>
            <button
              className={`tab-button ${activeTab === 'competitor' ? 'active' : ''}`}
              onClick={() => {
                console.log('点击竞争对手匹配标签页');
                console.log('当前competitorData长度:', competitorData.length);
                setActiveTab('competitor');
                if (competitorData.length === 0) {
                  console.log('开始加载竞争对手数据...');
                  loadCompetitorData();
                } else {
                  console.log('竞争对手数据已存在，跳过加载');
                }
              }}
            >
              <Users size={18} />
              竞争对手匹配
            </button>
          </div>
        </div>
      </div>

      {/* 流量数据表格 */}
      {activeTab === 'traffic' && data.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">流量数据详情</h2>
            <p className="card-subtitle">点击列标题进行排序</p>
          </div>
          <div className="card-content" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <div 
                        className="table-header-sortable"
                        onClick={() => handleSort('公司')}
                      >
                        公司
                        {renderSortIcon('公司')}
                      </div>
                    </th>
                    <th>
                      <div 
                        className="table-header-sortable"
                        onClick={() => handleSort('上月访问量')}
                      >
                        上月访问量
                        {renderSortIcon('上月访问量')}
                      </div>
                    </th>
                    <th>
                      <div 
                        className="table-header-sortable"
                        onClick={() => handleSort('当月访问量')}
                      >
                        当月访问量
                        {renderSortIcon('当月访问量')}
                      </div>
                    </th>
                    <th>
                      <div 
                        className="table-header-sortable"
                        onClick={() => handleSort('访问量环比变化')}
                      >
                        访问量环比变化
                        {renderSortIcon('访问量环比变化')}
                      </div>
                    </th>
                    <th>
                      <div 
                        className="table-header-sortable"
                        onClick={() => handleSort('购买转化率')}
                      >
                        购买转化率
                        {renderSortIcon('购买转化率')}
                      </div>
                    </th>
                    <th>平均访问时长</th>
                    <th>域名</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 500 }}>{row.公司}</td>
                      <td>{formatNumber(row.上月访问量)}</td>
                      <td>{formatNumber(row.当月访问量)}</td>
                      <td>{renderChangeIndicator(row.访问量环比变化)}</td>
                      <td>{formatPercentage(row.购买转化率)}</td>
                      <td>
                        <Clock size={14} style={{ marginRight: '0.25rem', display: 'inline', opacity: 0.6 }} />
                        {formatDuration(row.平均访问时长)}
                      </td>
                      <td>
                        <a 
                          href={`https://${row.域名}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="domain-link"
                        >
                          {row.域名}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 分页组件 */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                显示第 {startIndex + 1} - {Math.min(endIndex, data.length)} 条，共 {data.length} 条数据
              </div>
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  上一页
                </button>
                
                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // 只显示当前页附近的页码
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 3 || 
                      page === currentPage + 3
                    ) {
                      return <span key={page} className="pagination-ellipsis">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  下一页
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 竞争对手匹配表格 */}
      {activeTab === 'competitor' && (
        <div>
          {competitorLoading ? (
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-content" style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>正在加载竞争对手数据...</p>
              </div>
            </div>
          ) : competitorData.length > 0 ? (
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-header">
                <h2 className="card-title">当月流量前一百公司竞争对手匹配</h2>
                <p className="card-subtitle">点击投资机构标记查看详细信息</p>
              </div>
              <div className="card-content" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="table">
                    <thead>
                  <tr>
                    <th>排名</th>
                    <th>公司名称</th>
                    <th>竞争对手</th>
                    <th>投资机构</th>
                  </tr>
                    </thead>
                    <tbody>
                      {competitorData.map((row) => (
                        <tr key={row.id}>
                          <td style={{ fontWeight: 500 }}>{row.id}</td>
                          <td style={{ fontWeight: 500 }}>{row.公司}</td>
                          <td>
                            {row.竞争对手.split(',').map((competitor, index) => {
                              const trimmedCompetitor = competitor.trim();
                              const competitorKey = trimmedCompetitor.toLowerCase().trim();
                              const isMatch = row.匹配的竞争对手 && 
                                row.匹配的竞争对手.includes(competitorKey);
                              
                              return (
                                <span key={index}>
                                  {isMatch ? (
                                    <span 
                                      className="competitor-highlight clickable"
                                      onClick={() => handleTrafficCompanyClick(trimmedCompetitor)}
                                      style={{ cursor: 'pointer' }}
                                      title="点击查看流量数据"
                                    >
                                      {trimmedCompetitor}
                                    </span>
                                  ) : (
                                    trimmedCompetitor
                                  )}
                                  {index < row.竞争对手.split(',').length - 1 && ', '}
                                </span>
                              );
                            })}
                          </td>
                          <td>
                            {row.有投资机构 ? (
                              <button
                                className="investment-badge"
                                onClick={() => handleInvestmentClick(row)}
                              >
                                <Building2 size={14} />
                                查看投资机构
                              </button>
                            ) : (
                              <span className="no-investment">暂无</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-content" style={{ textAlign: 'center', padding: '3rem' }}>
                <BarChart3 size={64} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>暂无竞争对手数据</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  无法加载竞争对手匹配数据，请检查网络连接或联系管理员
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 无数据状态 */}
      {activeTab === 'traffic' && data.length === 0 && !loading && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-content" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <BarChart3 size={64} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>暂无数据</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              上传Excel文件开始分析您的网站流量数据
            </p>
          </div>
        </div>
      )}

      {/* 数据管理区域 - 仅在流量数据标签页显示 */}
      {activeTab === 'traffic' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-content">
            <div className="button-group">
              <button 
                className="button button-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                上传Excel文件
              </button>
              <button 
                className="button"
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(data);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, '流量数据');
                  XLSX.writeFile(wb, `流量数据_${new Date().toISOString().split('T')[0]}.xlsx`);
                }}
              >
                <Download size={18} />
                导出数据
              </button>
            </div>

            {/* 文件上传区域 */}
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="upload-icon" />
              <div className="upload-text">拖拽Excel文件到此处或点击上传</div>
              <div className="upload-hint">支持 .xlsx、.xls 格式文件</div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              accept=".xlsx,.xls"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
          </div>
        </div>
      )}

      {/* 投资机构弹窗 */}
      {showModal && selectedCompany && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Building2 size={20} />
                {selectedCompany.公司} - 投资机构信息
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="investment-info">
                <div className="info-item">
                  <span className="info-label">公司名称：</span>
                  <span className="info-value">{selectedCompany.公司}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">投资机构：</span>
                  <span className="info-value investment-name">{selectedCompany.投资机构}</span>
                </div>
                {selectedCompany.竞争对手 && (
                  <div className="info-item">
                    <span className="info-label">竞争对手：</span>
                    <span className="info-value">{selectedCompany.竞争对手}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-primary" onClick={closeModal}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 流量数据弹窗 */}
      {showTrafficModal && selectedTrafficCompany && (
        <div className="modal-overlay" onClick={closeTrafficModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3 className="modal-title">
                <TrendingUp size={20} />
                {selectedTrafficCompany.公司} - 流量数据详情
              </h3>
              <button className="modal-close" onClick={closeTrafficModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="traffic-info">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">公司名称：</span>
                    <span className="info-value">{selectedTrafficCompany.公司}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">域名：</span>
                    <span className="info-value domain-link">{selectedTrafficCompany.域名}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">当月访问量：</span>
                    <span className="info-value highlight-number">
                      {formatNumber(selectedTrafficCompany.当月访问量)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">上月访问量：</span>
                    <span className="info-value">
                      {formatNumber(selectedTrafficCompany.上月访问量)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">环比变化：</span>
                    <span className="info-value">
                      {renderChangeIndicator(selectedTrafficCompany.访问量环比变化)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">购买转化率：</span>
                    <span className="info-value">
                      {formatPercentage(selectedTrafficCompany.购买转化率)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">平均访问时长：</span>
                    <span className="info-value">
                      {formatDuration(selectedTrafficCompany.平均访问时长)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">投资机构：</span>
                    <span className="info-value">
                      {selectedTrafficCompany.有投资机构 ? (
                        <span className="investment-name">
                          {selectedTrafficCompany.投资机构}
                        </span>
                      ) : (
                        <span className="no-investment">暂无投资机构信息</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button button-primary" onClick={closeTrafficModal}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;