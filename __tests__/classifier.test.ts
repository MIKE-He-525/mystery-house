import { classifyComment, parseComments, classifyBatch } from '../lib/classifier';

describe('Comment Classifier', () => {
  describe('Purchase Intent - 询价', () => {
    test('should detect price inquiries in Chinese', () => {
      const result = classifyComment({ text: '多少钱？' });
      expect(result.category).toBe('purchase');
      expect(result.tags).toContain('询价');
    });

    test('should detect price inquiries in English', () => {
      const result = classifyComment({ text: 'How much does this cost?' });
      expect(result.category).toBe('purchase');
      expect(result.tags).toContain('询价');
    });

    test('should detect shipping questions', () => {
      const result = classifyComment({ text: '包邮吗？' });
      expect(result.category).toBe('purchase');
      expect(result.tags).toContain('询价');
    });
  });

  describe('Purchase Intent - 产品问题', () => {
    test('should detect size questions', () => {
      const result = classifyComment({ text: '有M码吗？' });
      expect(result.category).toBe('purchase');
      expect(result.tags).toContain('产品问题');
      expect(result.suggestedReply).toContain('尺码');
    });

    test('should detect color questions', () => {
      const result = classifyComment({ text: '什么颜色可选？' });
      expect(result.category).toBe('purchase');
      expect(result.tags).toContain('产品问题');
    });

    test('should detect link requests', () => {
      const result = classifyComment({ text: '求链接' });
      expect(result.category).toBe('purchase');
      expect(result.tags).toContain('产品问题');
    });

    test('should detect English size questions', () => {
      const result = classifyComment({ text: 'What sizes are available?' });
      expect(result.category).toBe('purchase');
      expect(result.tags).toContain('产品问题');
    });
  });

  describe('Purchase Intent - 购买意向', () => {
    test('should detect buying intent in Chinese', () => {
      const result = classifyComment({ text: '想买！' });
      expect(result.category).toBe('purchase');
      expect(result.tags).toContain('购买意向');
    });

    test('should detect order intent', () => {
      const result = classifyComment({ text: '怎么下单？' });
      expect(result.category).toBe('purchase');
      expect(result.tags).toContain('购买意向');
    });
  });

  describe('Spam - 站外引流', () => {
    test('should detect WeChat variants', () => {
      const variations = ['加微信', '加vx', '加v信', '威信看主页', '薇信'];
      variations.forEach((text) => {
        const result = classifyComment({ text });
        expect(result.category).toBe('spam');
        expect(result.tags).toContain('站外引流');
        expect(result.reason).toContain('违反社区规则');
      });
    });

    test('should detect Instagram spam', () => {
      const result = classifyComment({ text: 'check my bio' });
      expect(result.category).toBe('spam');
      expect(result.tags).toContain('站外引流');
    });

    test('should detect DM requests', () => {
      const result = classifyComment({ text: 'DM me for details' });
      expect(result.category).toBe('spam');
      expect(result.tags).toContain('站外引流');
    });

    test('should detect Telegram/WhatsApp', () => {
      const result = classifyComment({ text: '加telegram详聊' });
      expect(result.category).toBe('spam');
      expect(result.tags).toContain('站外引流');
    });
  });

  describe('Spam - 营销广告', () => {
    test('should detect get-rich-quick schemes', () => {
      const result = classifyComment({ text: '免费资料 日入500' });
      expect(result.category).toBe('spam');
      expect(result.tags).toContain('营销广告');
    });

    test('should detect giveaway spam', () => {
      const result = classifyComment({ text: 'Free giveaway! Click here!' });
      expect(result.category).toBe('spam');
      expect(result.tags).toContain('营销广告');
    });

    test('should detect reply codes', () => {
      const result = classifyComment({ text: '扣1领取' });
      expect(result.category).toBe('spam');
      expect(result.tags).toContain('站外引流');
    });
  });

  describe('Spam - 灌水', () => {
    test('should detect "first" comments', () => {
      const result = classifyComment({ text: 'first!' });
      expect(result.category).toBe('spam');
      expect(result.tags).toContain('灌水');
    });

    test('should detect Chinese first comments', () => {
      const result = classifyComment({ text: '沙发' });
      expect(result.category).toBe('spam');
      expect(result.tags).toContain('灌水');
    });
  });

  describe('Other - Thanks', () => {
    test('should detect thanks in Chinese', () => {
      const result = classifyComment({ text: '谢谢分享！' });
      expect(result.category).toBe('other');
      expect(result.tags).toContain('感谢/点赞');
    });

    test('should detect thanks in English', () => {
      const result = classifyComment({ text: 'Thanks!' });
      expect(result.category).toBe('other');
      expect(result.tags).toContain('感谢/点赞');
    });

    test('should detect emoji-only thanks', () => {
      const result = classifyComment({ text: '❤️😍' });
      expect(result.category).toBe('other');
      expect(result.tags).toContain('感谢/点赞');
    });
  });

  describe('Other - Generic', () => {
    test('should classify random comments as other', () => {
      const result = classifyComment({ text: '今天天气不错' });
      expect(result.category).toBe('other');
      expect(result.tags).toContain('其他');
    });

    test('should handle empty comments', () => {
      const result = classifyComment({ text: '' });
      expect(result.category).toBe('other');
      expect(result.tags).toContain('空评论');
    });
  });

  describe('Parse Comments', () => {
    test('should parse colon-separated format', () => {
      const input = '小明: 多少钱？\n小红: 谢谢！';
      const comments = parseComments(input);
      expect(comments).toHaveLength(2);
      expect(comments[0].username).toBe('小明');
      expect(comments[0].text).toBe('多少钱？');
    });

    test('should parse TSV format', () => {
      const input = '小明\t多少钱？\t5\n小红\t谢谢！\t10';
      const comments = parseComments(input);
      expect(comments).toHaveLength(2);
      expect(comments[0].username).toBe('小明');
      expect(comments[0].text).toBe('多少钱？');
      expect(comments[0].likeCount).toBe(5);
    });

    test('should parse plain text', () => {
      const input = '多少钱？\n谢谢！';
      const comments = parseComments(input);
      expect(comments).toHaveLength(2);
      expect(comments[0].text).toBe('多少钱？');
      expect(comments[0].username).toBeUndefined();
    });
  });

  describe('Batch Classification', () => {
    test('should classify multiple comments', () => {
      const input = `多少钱？
加微信
谢谢！`;
      const results = classifyBatch(input);
      expect(results).toHaveLength(3);
      expect(results[0].category).toBe('purchase');
      expect(results[1].category).toBe('spam');
      expect(results[2].category).toBe('other');
    });
  });

  describe('Suggested Replies', () => {
    test('should provide purchase reply', () => {
      const result = classifyComment({ text: '多少钱？' });
      expect(result.suggestedReply).toBeTruthy();
      expect(result.suggestedReply).toContain('价格');
    });

    test('should suggest deletion for spam', () => {
      const result = classifyComment({ text: '加微信' });
      expect(result.suggestedReply).toContain('删除');
    });
  });
});
