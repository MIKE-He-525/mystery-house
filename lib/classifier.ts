export interface Comment {
  username?: string;
  text: string;
  likeCount?: number;
}

export type Category = 'purchase' | 'spam' | 'other';

export interface ClassifiedComment {
  original: Comment;
  category: Category;
  tags: string[];
  reason: string;
  suggestedReply?: string;
}

interface Rule {
  patterns: RegExp[];
  category: Category;
  tag: string;
  reason: string;
}

const PURCHASE_RULES: Rule[] = [
  {
    patterns: [
      /多少钱|怎么卖|价格|包邮|优惠|折扣/i,
      /how\s*much|price|cost|shipping/i,
    ],
    category: 'purchase',
    tag: '询价',
    reason: '包含价格相关询问',
  },
  {
    patterns: [
      /码|尺码|颜色|材质|有货|链接|同款|型号/i,
      /size|color|material|in\s*stock|link|where\s*to\s*buy/i,
    ],
    category: 'purchase',
    tag: '产品问题',
    reason: '询问产品细节',
  },
  {
    patterns: [
      /想买|下单|求链接|怎么买|购买/i,
      /want\s*to\s*buy|order|purchase/i,
    ],
    category: 'purchase',
    tag: '购买意向',
    reason: '明确表达购买意向',
  },
];

const SPAM_RULES: Rule[] = [
  {
    patterns: [
      /微信|加v[信x]?|v信|vx|威信|薇信|🆅|扣[12]|私我|主页看|看主页|首页|个人简介/i,
      /check\s*my\s*(bio|profile)|dm\s*me|message\s*me/i,
      /telegram|whatsapp|line/i,
    ],
    category: 'spam',
    tag: '站外引流',
    reason: '试图引导至其他平台（违反社区规则）',
  },
  {
    patterns: [
      /免费资料|日入|月入|兼职|副业|躺赚|0成本|快速致富/i,
      /make\s*money|earn\s*\$|free\s*stuff|giveaway/i,
    ],
    category: 'spam',
    tag: '营销广告',
    reason: '包含营销/诈骗话术',
  },
  {
    patterns: [/^(first|1st|沙发|前排|抢|占楼)[!！。.]*$/i],
    category: 'spam',
    tag: '灌水',
    reason: '无意义抢楼',
  },
];

const THANKS_PATTERNS = [
  /^(谢谢|感谢|太好了|真棒|爱了|喜欢|好看|厉害|赞|分享|👍|❤️|😍|🔥|\s)+[!！。.]*$/,
  /^(thanks?|thank\s*you|love\s*it|nice|great|awesome)[!.]*$/i,
];

export function classifyComment(comment: Comment): ClassifiedComment {
  const text = comment.text.trim();

  if (!text) {
    return {
      original: comment,
      category: 'other',
      tags: ['空评论'],
      reason: '评论内容为空',
    };
  }

  for (const rule of SPAM_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        return {
          original: comment,
          category: rule.category,
          tags: [rule.tag],
          reason: rule.reason,
          suggestedReply: '建议：删除或不回复',
        };
      }
    }
  }

  for (const rule of PURCHASE_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        const reply = generatePurchaseReply(rule.tag, text);
        return {
          original: comment,
          category: rule.category,
          tags: [rule.tag],
          reason: rule.reason,
          suggestedReply: reply,
        };
      }
    }
  }

  for (const pattern of THANKS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        original: comment,
        category: 'other',
        tags: ['感谢/点赞'],
        reason: '用户表达感谢或喜欢',
        suggestedReply: '可选回复：谢谢支持！❤️',
      };
    }
  }

  return {
    original: comment,
    category: 'other',
    tags: ['其他'],
    reason: '普通评论或闲聊',
  };
}

function generatePurchaseReply(tag: string, text: string): string {
  if (tag === '询价') {
    return '价格请私信了解，或点击主页链接查看详情～';
  } else if (tag === '产品问题') {
    if (/码|尺码|size/i.test(text)) {
      return '尺码详情请看主页链接的商品说明，有详细尺码表哦～';
    } else if (/颜色|color/i.test(text)) {
      return '目前有多个颜色可选，具体请看主页链接～';
    } else if (/链接|link/i.test(text)) {
      return '链接在主页置顶哦～';
    }
    return '详细信息请点击主页链接查看，或私信咨询～';
  } else if (tag === '购买意向') {
    return '感谢支持！购买链接在主页置顶，或私信我帮你下单～';
  }
  return '感谢关注！有任何问题都可以私信～';
}

export function parseComments(input: string): Comment[] {
  const lines = input.split('\n').filter((line) => line.trim());
  const comments: Comment[] = [];

  for (const line of lines) {
    const tsvMatch = line.match(/^([^\t]+)\t([^\t]+)(\t(\d+))?$/);
    if (tsvMatch) {
      comments.push({
        username: tsvMatch[1].trim(),
        text: tsvMatch[2].trim(),
        likeCount: tsvMatch[4] ? parseInt(tsvMatch[4]) : undefined,
      });
      continue;
    }

    const colonMatch = line.match(/^([^:：]+)[：:]\s*(.+)$/);
    if (colonMatch) {
      comments.push({
        username: colonMatch[1].trim(),
        text: colonMatch[2].trim(),
      });
      continue;
    }

    comments.push({
      text: line.trim(),
    });
  }

  return comments;
}

export function classifyBatch(input: string): ClassifiedComment[] {
  const comments = parseComments(input);
  return comments.map(classifyComment);
}
