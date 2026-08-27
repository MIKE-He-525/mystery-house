'use client';

import Link from 'next/link';
import { useState } from 'react';
import { classifyBatch, ClassifiedComment } from '../lib/classifier';

export default function Home() {
  const [activeDemo, setActiveDemo] = useState<'xiaohongshu' | 'instagram'>('xiaohongshu');

  const demoData = {
    xiaohongshu: `小米: 这款颜色真好看！多少钱呀？
李华: 有链接吗？想买
张三: 求尺码表，我平时穿M码
营销号A: 加v信 免费教你日入500 看主页
王芳: 太好看了！❤️
陈小美: 包邮吗？什么材质的？`,
    instagram: `fashionlover: Omg this is so cute! How much?
styleaddict: Where can I buy this?
spambot123: DM me for free money making tips! Check my bio
jenny_kim: Love it! 😍
shopaholic: What sizes do you have?`,
  };

  const results = classifyBatch(demoData[activeDemo]);
  const purchaseComments = results.filter((r) => r.category === 'purchase');
  const spamComments = results.filter((r) => r.category === 'spam');
  const otherComments = results.filter((r) => r.category === 'other');

  return (
    <div>
      <div className="hero">
        <div className="container">
          <h1>Mystery House 评论台</h1>
          <p>把小红书或 Instagram 的评论贴进来，立刻分开购买意向、广告导流，和该回的问题</p>
          <Link href="/app">
            <button className="cta-button">打开工作台</button>
          </Link>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <h2 className="section-title">为什么需要 Mystery House？</h2>
          <div className="features">
            <div className="feature-card">
              <h3>💰 不漏商机</h3>
              <p>自动识别"多少钱""求链接""有货吗"等购买意向评论，不错过每一个潜在客户。</p>
            </div>
            <div className="feature-card">
              <h3>🛡️ 清理垃圾</h3>
              <p>立刻标记"加微信""check my bio""日入500"等导流广告和垃圾评论，保持评论区干净。</p>
            </div>
            <div className="feature-card">
              <h3>⚡ 节省时间</h3>
              <p>
                不用每天早上一条条翻评论区。贴进来，点分类，看结果。每天省下30分钟，专注经营。
              </p>
            </div>
            <div className="feature-card">
              <h3>✍️ 回复建议</h3>
              <p>
                每条需要回复的评论都附带建议回复话术，可以直接复制或修改使用，提升回复效率。
              </p>
            </div>
          </div>

          <div className="demo-section">
            <h3 style={{ textAlign: 'center', marginBottom: 24, fontSize: 28 }}>
              试试效果（真实分类演示）
            </h3>
            <div className="demo-tabs">
              <button
                className={`demo-tab ${activeDemo === 'xiaohongshu' ? 'active' : ''}`}
                onClick={() => setActiveDemo('xiaohongshu')}
              >
                小红书风格
              </button>
              <button
                className={`demo-tab ${activeDemo === 'instagram' ? 'active' : ''}`}
                onClick={() => setActiveDemo('instagram')}
              >
                Instagram 风格
              </button>
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
                      <div className="suggested-reply">💡 {comment.suggestedReply}</div>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section pricing-section">
        <div className="container">
          <h2 className="section-title">收费方案</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="plan-name">免费版</div>
              <div className="plan-price">¥0</div>
              <div className="plan-period">永久免费</div>
              <ul className="plan-features">
                <li>✓ 每天 1 次分类</li>
                <li>✓ 每批最多 80 条评论</li>
                <li>✓ 基础分类功能</li>
                <li>✓ 导出带 Mystery House 标记</li>
              </ul>
              <Link href="/app">
                <button className="cta-button">开始使用</button>
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="plan-name">Pro 版</div>
              <div className="plan-price">起¥68</div>
              <div className="plan-period">每月（约 $12）</div>
              <ul className="plan-features">
                <li>✓ 无限次分类</li>
                <li>✓ 无评论数量限制</li>
                <li>✓ 历史记录保存</li>
                <li>✓ 自定义回复语气</li>
                <li>✓ 导出无水印</li>
                <li>✓ AI 增强分类（可选）</li>
              </ul>
              <Link href="/app">
                <button className="cta-button">升级 Pro</button>
              </Link>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: 30, color: '#666' }}>
            * 需要配置 Stripe 支付才能完成真实交易
          </p>
        </div>
      </div>

      <div className="section" style={{ background: 'white' }}>
        <div className="container">
          <h2 className="section-title">诚实说明</h2>
          <div style={{ maxWidth: 700, margin: '0 auto', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 16 }}>
              <strong>Mystery House 不是万能的：</strong>
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 20 }}>
              <li>❌ 不自动发评论或回复（那是垃圾行为，违反平台规则）</li>
              <li>❌ 不接小红书官方 API（小红书目前没有公开评论 API）</li>
              <li>❌ 不教你怎么绕过平台审核（我们遵守规则）</li>
              <li>✅ 需要你手动复制粘贴评论进来</li>
              <li>✅ 建议的回复需要你人工审核后再发</li>
            </ul>
            <p>
              这是一个帮你<strong>省时间、不漏商机、清理垃圾</strong>的工具，不是自动化营销机器人。
            </p>
          </div>
        </div>
      </div>

      <div className="footer">
        <div className="container">
          <p>&copy; 2026 Mystery House. MIT License.</p>
          <p style={{ marginTop: 12, opacity: 0.8 }}>
            一个诚实的工具，帮小店主处理评论区，不玩虚的。
          </p>
        </div>
      </div>
    </div>
  );
}
