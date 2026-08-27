'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { classifyBatch, ClassifiedComment } from '../../lib/classifier';

export default function WorkspacePage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ClassifiedComment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedJobs, setSavedJobs] = useState<
    Array<{ id: string; timestamp: number; total: number }>
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem('mystery-house-jobs');
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved jobs:', e);
      }
    }
  }, []);

  const handleClassify = () => {
    if (!input.trim()) {
      alert('请输入评论内容');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const classified = classifyBatch(input);
      setResults(classified);
      setIsProcessing(false);

      const jobId = Date.now().toString();
      const newJob = {
        id: jobId,
        timestamp: Date.now(),
        total: classified.length,
      };

      const updatedJobs = [newJob, ...savedJobs].slice(0, 10);
      setSavedJobs(updatedJobs);
      localStorage.setItem('mystery-house-jobs', JSON.stringify(updatedJobs));
      localStorage.setItem(`mystery-house-job-${jobId}`, JSON.stringify(classified));
    }, 500);
  };

  const handleLoadSample = async (type: 'xiaohongshu' | 'instagram' | 'tsv') => {
    try {
      const fileName =
        type === 'xiaohongshu'
          ? 'sample-xiaohongshu.txt'
          : type === 'instagram'
            ? 'sample-instagram.txt'
            : 'sample-mixed-tsv.txt';
      const response = await fetch(`/data/${fileName}`);
      const text = await response.text();
      setInput(text);
    } catch (error) {
      console.error('Failed to load sample:', error);
    }
  };

  const handleClear = () => {
    setInput('');
    setResults([]);
  };

  const handleExportCSV = () => {
    const purchaseComments = results.filter((r) => r.category === 'purchase');
    if (purchaseComments.length === 0) {
      alert('没有需要回复的评论可导出');
      return;
    }

    const csv = [
      '用户名,评论内容,分类标签,原因,建议回复',
      ...purchaseComments.map((r) =>
        [
          r.original.username || '',
          `"${r.original.text.replace(/"/g, '""')}"`,
          r.tags.join(';'),
          `"${r.reason}"`,
          `"${r.suggestedReply || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mystery-house-要回复-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const purchaseComments = results.filter((r) => r.category === 'purchase');
  const spamComments = results.filter((r) => r.category === 'spam');
  const otherComments = results.filter((r) => r.category === 'other');

  return (
    <div className="workspace">
      <div className="workspace-header">
        <h1 className="workspace-title">Mystery House 工作台</h1>
        <Link href="/" className="back-link">
          ← 返回首页
        </Link>
      </div>

      <div className="workspace-content">
        <div className="input-panel">
          <h2 style={{ marginBottom: 16, fontSize: 20 }}>
            📝 粘贴评论
            <span style={{ fontSize: 14, color: '#666', marginLeft: 12, fontWeight: 'normal' }}>
              支持格式：纯文本 / 用户名: 内容 / TSV (用户名\t内容\t点赞数)
            </span>
          </h2>
          <textarea
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="把评论粘贴到这里，每行一条评论...&#10;&#10;例如：&#10;小明: 多少钱？&#10;小红: 加微信看主页&#10;小花: 谢谢分享！"
          />

          <div className="button-group">
            <button className="primary-button" onClick={handleClassify} disabled={isProcessing}>
              {isProcessing ? '分类中...' : '🔍 开始分类'}
            </button>
            <button className="secondary-button" onClick={handleClear}>
              清空
            </button>
            <button className="secondary-button" onClick={() => handleLoadSample('xiaohongshu')}>
              加载小红书示例
            </button>
            <button className="secondary-button" onClick={() => handleLoadSample('instagram')}>
              加载 Instagram 示例
            </button>
          </div>

          {savedJobs.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, color: '#666' }}>
                📚 历史记录（本地存储）
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {savedJobs.slice(0, 5).map((job) => (
                  <button
                    key={job.id}
                    className="secondary-button"
                    style={{ textAlign: 'left', padding: '8px 16px', fontSize: 14 }}
                    onClick={() => {
                      const saved = localStorage.getItem(`mystery-house-job-${job.id}`);
                      if (saved) {
                        setResults(JSON.parse(saved));
                      }
                    }}
                  >
                    {new Date(job.timestamp).toLocaleString('zh-CN')} - {job.total} 条评论
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {results.length > 0 ? (
          <div className="results-panel">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 24 }}>📊 分类结果</h2>
              <button className="primary-button" onClick={handleExportCSV}>
                导出「要回复」CSV
              </button>
            </div>

            <div className="stats">
              <div className="stat-card">
                <div className="stat-number">{results.length}</div>
                <div className="stat-label">总评论</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#667eea' }}>
                  {purchaseComments.length}
                </div>
                <div className="stat-label">要回复</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#ef4444' }}>
                  {spamComments.length}
                </div>
                <div className="stat-label">广告/导流</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#64748b' }}>
                  {otherComments.length}
                </div>
                <div className="stat-label">其他</div>
              </div>
            </div>

            <div className="results-grid">
              <div className="result-column">
                <h4>🎯 要回复 ({purchaseComments.length})</h4>
                {purchaseComments.map((comment, idx) => (
                  <div key={idx} className="comment-card">
                    <div className="comment-text">
                      {comment.original.username && (
                        <strong>{comment.original.username}: </strong>
                      )}
                      {comment.original.text}
                    </div>
                    <div className="comment-meta">
                      <span className="tag">{comment.tags.join(', ')}</span>
                      <span style={{ fontSize: 12, color: '#666' }}>{comment.reason}</span>
                    </div>
                    {comment.suggestedReply && (
                      <div className="suggested-reply">
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>💡 建议回复：</div>
                        {comment.suggestedReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="result-column">
                <h4 style={{ color: '#ef4444' }}>🚫 广告/导流 ({spamComments.length})</h4>
                {spamComments.map((comment, idx) => (
                  <div key={idx} className="comment-card spam">
                    <div className="comment-text">
                      {comment.original.username && (
                        <strong>{comment.original.username}: </strong>
                      )}
                      {comment.original.text}
                    </div>
                    <div className="comment-meta">
                      <span className="tag" style={{ background: '#fee2e2', color: '#ef4444' }}>
                        {comment.tags.join(', ')}
                      </span>
                      <span style={{ fontSize: 12, color: '#666' }}>{comment.reason}</span>
                    </div>
                    {comment.suggestedReply && (
                      <div className="suggested-reply" style={{ background: '#fef2f2' }}>
                        💡 {comment.suggestedReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="result-column">
                <h4 style={{ color: '#64748b' }}>💬 其他 ({otherComments.length})</h4>
                {otherComments.map((comment, idx) => (
                  <div key={idx} className="comment-card other">
                    <div className="comment-text">
                      {comment.original.username && (
                        <strong>{comment.original.username}: </strong>
                      )}
                      {comment.original.text}
                    </div>
                    <div className="comment-meta">
                      <span className="tag" style={{ background: '#f1f5f9', color: '#64748b' }}>
                        {comment.tags.join(', ')}
                      </span>
                      {comment.reason && (
                        <span style={{ fontSize: 12, color: '#666' }}>{comment.reason}</span>
                      )}
                    </div>
                    {comment.suggestedReply && (
                      <div className="suggested-reply" style={{ background: '#f8fafc' }}>
                        💡 {comment.suggestedReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="results-panel">
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>还没有分类结果</h3>
              <p>粘贴评论后点击「开始分类」，或加载示例数据试试</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 40, padding: 20, background: 'white', borderRadius: 12 }}>
        <h3 style={{ marginBottom: 16 }}>🔍 分类规则说明</h3>
        <div style={{ display: 'grid', gap: 16, fontSize: 14, lineHeight: 1.6 }}>
          <div>
            <strong>🎯 要回复（购买意向/产品问题）：</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>询价：多少钱、价格、包邮、优惠、how much、price</li>
              <li>产品问题：尺码、颜色、材质、有货、链接、size、color、in stock</li>
              <li>购买意向：想买、下单、求链接、怎么买、want to buy</li>
            </ul>
          </div>
          <div>
            <strong>🚫 广告/导流（建议删除或不回复）：</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                站外引流：微信、v信、vx、威信、薇信、扣1、私我、主页看、check my bio、dm me、telegram
              </li>
              <li>营销广告：免费资料、日入、月入、兼职、躺赚、giveaway</li>
              <li>灌水：first、沙发、前排、抢楼</li>
            </ul>
          </div>
          <div>
            <strong>💬 其他：</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>感谢/点赞：谢谢、感谢、太好了、真棒、thanks、love it、❤️</li>
              <li>普通评论：不属于以上分类的其他评论</li>
            </ul>
          </div>
        </div>
        <p style={{ marginTop: 16, color: '#666', fontSize: 14 }}>
          ⚠️ 本工具使用确定性规则分类，无需 AI
          密钥即可工作。分类准确率取决于规则覆盖，建议人工审核后再操作。
        </p>
      </div>
    </div>
  );
}
