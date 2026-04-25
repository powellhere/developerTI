const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4173;
const PUBLIC_DIR = path.join(__dirname, "public");
const SOUND_DIR = path.join(__dirname, "sound effect");

const dimensions = [
  "logicalCoherence",
  "mvpScope",
  "demoFeasibility",
  "userPain",
  "vibeIdentity",
  "shareReuse"
];

const dimensionLabels = {
  logicalCoherence: "逻辑自洽度",
  mvpScope: "MVP 范围控制",
  demoFeasibility: "Demo 可跑通性",
  userPain: "用户痛点强度",
  vibeIdentity: "Vibe 体验辨识度",
  shareReuse: "传播与复用性"
};

const signals = {
  logicalCoherence: ["promise", "assumption", "constraint", "must-have", "cut", "承诺", "假设", "约束", "边界", "逻辑", "矛盾", "必须", "不做", "裁剪"],
  mvpScope: ["mvp", "scope", "core loop", "first playable", "最小", "范围", "核心", "第一版", "必需", "砍掉", "收窄", "scope cut"],
  demoFeasibility: ["demo", "prototype", "ship", "build", "debug", "roadmap", "演示", "原型", "可展示", "可实现", "开发", "调试", "里程碑", "跑通"],
  userPain: ["user", "problem", "pain", "job", "value", "用户", "目标用户", "问题", "痛点", "价值", "场景", "需求", "first user"],
  vibeIdentity: ["vibe", "experience", "hook", "interaction", "screen", "玩法", "体验", "记忆点", "情绪", "反差", "风格", "视觉", "钩子", "结果页"],
  shareReuse: ["share", "viral", "community", "social", "retention", "传播", "分享", "转发", "社交", "复用", "截图", "榜单", "卡片", "对比", "复玩"]
};

const investors = {
  paul_graham: {
    name: "Paul Graham 风格产品导师",
    thesis: "Make something people want, then cut the MVP until it can be tested.",
    style: "简短、直接，追问用户是否真的需要，反对空泛愿景。",
    weights: { logicalCoherence: 0.27, mvpScope: 0.22, demoFeasibility: 0.16, userPain: 0.23, vibeIdentity: 0.05, shareReuse: 0.07 },
    bias: { userPain: 6, mvpScope: 4, logicalCoherence: 4 },
    opener: "The question is not whether this sounds interesting. The question is whether a real user would use the smallest version.",
    scoreTuning: { userPain: 8, mvpScope: 5, logicalCoherence: 5, vibeIdentity: -8, shareReuse: -7, demoFeasibility: -3 },
    voice: {
      verdict: "这东西先别急着包装。先问一个很朴素的问题：有没有一个真实用户现在就想用最小版本？",
      scope: "把大愿景先放一边。做一个小到尴尬、但真的能验证需求的版本。",
      risk: "如果你说不清第一个用户是谁，这个项目就还只是一个想法。"
    }
  },
  zhang_yiming: {
    name: "张一鸣风格产品导师",
    thesis: "看底层变量、反馈闭环和可迭代性，而不是表面热闹。",
    style: "冷静、系统、概率化，区分短期 demo 与长期产品方向。",
    weights: { logicalCoherence: 0.26, mvpScope: 0.18, demoFeasibility: 0.16, userPain: 0.17, vibeIdentity: 0.08, shareReuse: 0.15 },
    bias: { userPain: 4, shareReuse: 5, logicalCoherence: 4 },
    opener: "先把表层概念拿掉，看用户场景、反馈链路和迭代机制是否成立。",
    scoreTuning: { userPain: 5, shareReuse: 6, demoFeasibility: -4, mvpScope: 2, logicalCoherence: 5 },
    voice: {
      verdict: "不要只看这个功能热不热，要看它能不能形成稳定反馈。用户每次使用后，系统有没有变得更好？",
      scope: "短期 demo 可以轻，但反馈链路不能断。先把输入、反馈、迭代这三个变量闭上。",
      risk: "如果只有一次性体验，没有持续反馈，这个产品的长期价值会比较弱。"
    }
  },
  karpathy: {
    name: "Karpathy 风格工程导师",
    thesis: "Build the first playable workflow, then inspect where it breaks.",
    style: "工程化、口语化，强调最小 workflow、failure mode 和 debugging。",
    weights: { logicalCoherence: 0.18, mvpScope: 0.22, demoFeasibility: 0.3, userPain: 0.12, vibeIdentity: 0.06, shareReuse: 0.12 },
    bias: { demoFeasibility: 7, mvpScope: 5, logicalCoherence: 3 },
    opener: "imo, this becomes real only when the smallest workflow runs end to end.",
    scoreTuning: { demoFeasibility: 10, mvpScope: 7, logicalCoherence: 4, vibeIdentity: -8, userPain: -5, shareReuse: -3 },
    voice: {
      verdict: "imo，先别讨论完整产品。把最小 workflow 跑通，然后看哪里坏掉。",
      scope: "删除所有暂时不影响 end-to-end demo 的功能。能跑起来，比看起来完整更重要。",
      risk: "最大的风险不是想法不好，而是 debug surface 太大，最后 demo 现场跑不起来。"
    }
  },
  kris_jenner: {
    name: "Kris Jenner 风格品牌导师",
    thesis: "Package the product as an IP, control the story, then turn attention into distribution.",
    style: "momager 式强控制，先看品牌资产、视觉叙事、合作渠道和注意力转化。",
    weights: { logicalCoherence: 0.2, mvpScope: 0.12, demoFeasibility: 0.1, userPain: 0.15, vibeIdentity: 0.24, shareReuse: 0.19 },
    bias: { vibeIdentity: 8, shareReuse: 7, logicalCoherence: 4, userPain: 3 },
    opener: "Darling，产品不是只要能用，它还要能被记住、被谈论、被包装成一个可以增长的 brand moment.",
    scoreTuning: { vibeIdentity: 11, shareReuse: 9, logicalCoherence: 4, userPain: 3, demoFeasibility: -5, mvpScope: -2 },
    voice: {
      verdict: "亲爱的，我先看这个东西能不能变成一个 brand moment。用户会不会截图？会不会讲给别人听？有没有一个可以被你牢牢控制的叙事入口？",
      scope: "第一版不要摊太大。保留一个清楚的 IP 钩子、一个可截图结果、一个能被反复传播的故事线。",
      risk: "如果你不能控制名字、视觉和用户转述方式，注意力来了也会从你手里漏掉。"
    }
  },
  mrbeast: {
    name: "MrBeast 风格增长导师",
    thesis: "The hook must land in three seconds and the result must be shareable.",
    style: "强 hook、强对比，关注 3 秒理解、30 秒留存和截图传播。",
    weights: { logicalCoherence: 0.14, mvpScope: 0.1, demoFeasibility: 0.12, userPain: 0.12, vibeIdentity: 0.26, shareReuse: 0.26 },
    bias: { vibeIdentity: 8, shareReuse: 8, logicalCoherence: 2 },
    opener: "If people cannot understand the hook in one sentence, the demo will die.",
    scoreTuning: { vibeIdentity: 12, shareReuse: 12, logicalCoherence: 2, demoFeasibility: -8, mvpScope: -7, userPain: -4 },
    voice: {
      verdict: "三秒钟讲不清，基本就输了。用户为什么要截图？为什么要发给朋友？这个要先回答。",
      scope: "别堆功能，堆反差。一个强结果卡片，比五个平庸功能更值钱。",
      risk: "如果结果不值得晒，传播就不会自然发生。"
    }
  },
  trump: {
    name: "特朗普风格包装导师",
    thesis: "The demo needs a strong claim, visible contrast, and stage presence.",
    style: "高判断感，强调展示气势、注意力和一句话卖点。",
    weights: { logicalCoherence: 0.16, mvpScope: 0.12, demoFeasibility: 0.14, userPain: 0.13, vibeIdentity: 0.23, shareReuse: 0.22 },
    bias: { vibeIdentity: 7, shareReuse: 6, logicalCoherence: 3 },
    opener: "This either looks strong on stage or it gets ignored. The packaging matters.",
    scoreTuning: { vibeIdentity: 10, shareReuse: 9, logicalCoherence: 3, userPain: -5, mvpScope: -5 },
    voice: {
      verdict: "这个项目要么一上台就显得很强，要么没人记得。包装不是表面功夫，是注意力入口。",
      scope: "卖点要大、对比要强、结果要能被一句话讲出去。",
      risk: "如果现场听众不知道为什么这东西厉害，你的功能再多也没用。"
    }
  },
  jobs: {
    name: "乔布斯风格产品导师",
    thesis: "Focus, taste, and a single sharp product definition.",
    style: "聚焦、审美导向，强调一句话定义和删除复杂度。",
    weights: { logicalCoherence: 0.26, mvpScope: 0.22, demoFeasibility: 0.12, userPain: 0.14, vibeIdentity: 0.2, shareReuse: 0.06 },
    bias: { logicalCoherence: 7, mvpScope: 5, vibeIdentity: 5 },
    opener: "The product needs one sharp reason to exist. If it has five reasons, it has none.",
    scoreTuning: { logicalCoherence: 10, mvpScope: 7, vibeIdentity: 5, shareReuse: -10, demoFeasibility: -5 },
    voice: {
      verdict: "产品需要一个锋利的存在理由。如果你给它五个理由，通常说明一个都不够强。",
      scope: "删掉解释不清的东西。用户不该学习你的复杂性，产品应该替用户承担复杂性。",
      risk: "体验不聚焦时，用户会感觉你在展示功能，而不是交付一个作品。"
    }
  },
  musk: {
    name: "马斯克风格构建导师",
    thesis: "Delete assumptions, compress scope, and ship the fastest real version.",
    style: "第一性原理，质疑默认需求，强调删除、压缩和快速 ship。",
    weights: { logicalCoherence: 0.2, mvpScope: 0.22, demoFeasibility: 0.26, userPain: 0.12, vibeIdentity: 0.06, shareReuse: 0.14 },
    bias: { demoFeasibility: 6, mvpScope: 6, shareReuse: 4 },
    opener: "Wrong question. The first question is what requirement can be deleted.",
    scoreTuning: { demoFeasibility: 9, mvpScope: 8, shareReuse: 4, logicalCoherence: 3, userPain: -4, vibeIdentity: -3 },
    voice: {
      verdict: "先别问还能加什么。先问哪些需求可以删掉，哪些假设可以直接打穿。",
      scope: "第一性原理看，第一版只需要证明最难的那个假设。其他都可以晚点。",
      risk: "如果工程路径不够短，速度会杀死这个 demo。"
    }
  }
};

Object.entries(investors).forEach(([key, investor]) => {
  investor.key = key;
});

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg"
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_500_000) {
        reject(new Error("Plan text is too large for this MVP."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function toleranceValue(userProfile = {}) {
  const raw = Number(userProfile.tolerance ?? 50);
  const normalized = raw <= 1 ? raw : raw / 100;
  return Math.max(0, Math.min(1, normalized));
}

function toleranceLabel(userProfile = {}) {
  const tolerance = toleranceValue(userProfile);
  if (tolerance <= 0.2) return "地狱模式";
  if (tolerance <= 0.45) return "严格模式";
  if (tolerance >= 0.8) return "温柔模式";
  if (tolerance >= 0.6) return "鼓励模式";
  return "标准模式";
}

function normalizeWeights(baseWeights, userProfile = {}) {
  const adjusted = { ...baseWeights };
  const tolerance = toleranceValue(userProfile);
  const strictness = 1 - tolerance;
  const warmth = tolerance;

  adjusted.logicalCoherence = (adjusted.logicalCoherence || 0) + strictness * 0.08 - warmth * 0.02;
  adjusted.mvpScope = (adjusted.mvpScope || 0) + strictness * 0.06 - warmth * 0.01;
  adjusted.demoFeasibility = (adjusted.demoFeasibility || 0) + strictness * 0.05;
  adjusted.userPain = (adjusted.userPain || 0) + warmth * 0.03;
  adjusted.vibeIdentity = (adjusted.vibeIdentity || 0) + warmth * 0.04 - strictness * 0.02;
  adjusted.shareReuse = (adjusted.shareReuse || 0) + warmth * 0.04 - strictness * 0.02;

  dimensions.forEach((dimension) => {
    adjusted[dimension] = Math.max(0.04, adjusted[dimension] || 0);
  });

  const total = dimensions.reduce((sum, dimension) => sum + adjusted[dimension], 0);
  return Object.fromEntries(dimensions.map((dimension) => [dimension, adjusted[dimension] / total]));
}

function countHits(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((count, keyword) => {
    const pattern = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = lower.match(new RegExp(pattern, "g"));
    return count + (matches ? matches.length : 0);
  }, 0);
}

function evidenceProfile(text) {
  return {
    targetUser: /目标用户|first user|target user|用户是|面向|受众|开发者|创作者|学生|创业者/i.test(text),
    specificPain: /痛点|问题|困难|卡点|成本|效率|浪费|不确定|没人反馈|自嗨/i.test(text),
    scenario: /场景|当.*时|使用时|上传|选择|点击|生成|输出|结果页|现场|demo/i.test(text),
    coreFlow: /流程|core loop|workflow|输入.*输出|上传.*生成|选择.*生成|brief.*report|第一步|第二步/i.test(text),
    demoConstraint: /demo|演示|60 秒|30 秒|3 小时|1 天|2 天|48 小时|一周|deadline|黑客松|约束/i.test(text),
    scopeCut: /scope cut|砍掉|删掉|不做|暂缓|v2|下一版|must-have|nice-to-have|只保留|第一版只/i.test(text),
    inputOutput: /输入|输出|样例|example|结果|报告|卡片|榜单|checklist|清单/i.test(text),
    treeOrPackage: /package\.json|dependencies|devDependencies|scripts|node_modules|src\/|components\/|pages\/|tree\s|├|└|README\.md|Manual\.md/i.test(text),
    vibe: /vibe|情绪|毒舌|仪式感|像素|复古|游戏机|反差|记忆点|好玩|上头|审判/i.test(text),
    share: /分享|传播|转发|截图|下载|卡片|榜单|排行|对比|复用|复玩|社交/i.test(text),
    boundary: /边界|不解决|不证明|只证明|假设|验证|逻辑|矛盾|承诺|实现|限制/i.test(text)
  };
}

function contradictionPenalty(text, dimension) {
  let penalty = 0;
  const claimsSimple = /极简|简单|轻量|最小|MVP|快速/i.test(text);
  const overScoped = /平台|生态|全流程|一站式|多端|登录|权限|历史记录|复杂看板|dashboard|数据中台|全自动|完整系统/i.test(text);
  const shortDeadline = /3 小时|三小时|1 天|一天|2 天|两天|48 小时|黑客松|hackathon/i.test(text);
  const complexTech = /多模型|multi-agent|agent|自动化 pipeline|pipeline|实时|权限|支付|爬虫|向量库|知识库|微服务/i.test(text);
  const everyone = /所有人|所有用户|所有开发者|所有创作者|所有企业|全行业|大众用户/i.test(text);

  if (claimsSimple && overScoped) penalty += dimension === "mvpScope" || dimension === "logicalCoherence" ? 14 : 6;
  if (shortDeadline && complexTech) penalty += dimension === "demoFeasibility" || dimension === "logicalCoherence" ? 12 : 5;
  if (everyone) penalty += dimension === "userPain" || dimension === "logicalCoherence" ? 10 : 3;
  if (/传播|viral|分享/i.test(text) && !/卡片|截图|榜单|排行|对比|下载/i.test(text)) {
    penalty += dimension === "shareReuse" ? 10 : 3;
  }

  return penalty;
}

function evidenceBonusForDimension(text, dimension) {
  const evidence = evidenceProfile(text);
  const table = {
    logicalCoherence: [
      ["targetUser", 6],
      ["coreFlow", 7],
      ["scopeCut", 7],
      ["demoConstraint", 4],
      ["boundary", 8]
    ],
    mvpScope: [
      ["scopeCut", 10],
      ["coreFlow", 6],
      ["demoConstraint", 5],
      ["boundary", 5],
      ["inputOutput", 4]
    ],
    demoFeasibility: [
      ["demoConstraint", 9],
      ["coreFlow", 7],
      ["inputOutput", 6],
      ["treeOrPackage", 5],
      ["scopeCut", 4]
    ],
    userPain: [
      ["targetUser", 8],
      ["specificPain", 9],
      ["scenario", 6],
      ["inputOutput", 3],
      ["boundary", 3]
    ],
    vibeIdentity: [
      ["vibe", 10],
      ["inputOutput", 5],
      ["share", 4],
      ["coreFlow", 4],
      ["scenario", 4]
    ],
    shareReuse: [
      ["share", 10],
      ["inputOutput", 5],
      ["vibe", 4],
      ["coreFlow", 3],
      ["treeOrPackage", 3]
    ]
  };

  return (table[dimension] || []).reduce((sum, [key, points]) => sum + (evidence[key] ? points : 0), 0);
}

function scoreDimension(text, dimension, investor) {
  const hits = countHits(text, signals[dimension]);
  const lengthBonus = Math.min(6, Math.floor(text.length / 2500));
  const structureBonus = /#+\s|目标|用户|问题|方案|流程|功能|demo|mvp|约束|风险|roadmap|milestone/i.test(text) ? 4 : 0;
  const personaBonus = investor.bias[dimension] || 0;
  const tuningBonus = investor.scoreTuning?.[dimension] || 0;
  const penalty = mentorPenalty(text, dimension, investor);
  const hitBonus = Math.min(16, Math.round(Math.sqrt(hits) * 5));
  const evidenceBonus = evidenceBonusForDimension(text, dimension);
  const contradiction = contradictionPenalty(text, dimension);
  return Math.max(12, Math.min(92, Math.round(24 + hitBonus + lengthBonus + structureBonus + evidenceBonus + personaBonus + tuningBonus - penalty - contradiction)));
}

function applyToleranceToDimension(score, dimension, userProfile = {}) {
  const tolerance = toleranceValue(userProfile);
  const hardDimensions = new Set(["logicalCoherence", "mvpScope", "demoFeasibility", "userPain"]);
  const softDimensions = new Set(["vibeIdentity", "shareReuse"]);
  let delta = Math.round((tolerance - 0.5) * 14);

  if (tolerance < 0.5 && hardDimensions.has(dimension)) {
    delta -= Math.round((0.5 - tolerance) * 14);
  }
  if (tolerance > 0.5 && softDimensions.has(dimension)) {
    delta += Math.round((tolerance - 0.5) * 4);
  }

  return Math.max(8, Math.min(96, score + delta));
}

function applyToleranceToOverall(score, userProfile = {}) {
  const tolerance = toleranceValue(userProfile);
  const delta = Math.round((tolerance - 0.5) * 18);
  const hellPenalty = tolerance <= 0.2 ? 8 : tolerance <= 0.35 ? 4 : 0;
  const gentleBonus = tolerance >= 0.8 ? 3 : 0;
  return Math.max(8, Math.min(96, score + delta - hellPenalty + gentleBonus));
}

function mentorPenalty(text, dimension, mentor) {
  const lower = text.toLowerCase();
  let penalty = 0;

  if (mentor === investors.karpathy || mentor === investors.musk) {
    if (dimension === "demoFeasibility" && !/demo|原型|prototype|可展示|调试|debug|ship|跑通/i.test(text)) penalty += 8;
    if (dimension === "mvpScope" && /平台|生态|全流程|一站式|复杂|全部|完整/i.test(text)) penalty += 6;
  }

  if (mentor === investors.paul_graham || mentor === investors.zhang_yiming) {
    if (dimension === "userPain" && !/目标用户|用户|痛点|问题|场景|first user|target user/i.test(text)) penalty += 8;
    if (dimension === "logicalCoherence" && !/流程|交互|输入|输出|点击|生成|core loop|假设|边界/i.test(text)) penalty += 5;
  }

  if (mentor === investors.mrbeast || mentor === investors.trump || mentor === investors.kris_jenner) {
    if (dimension === "vibeIdentity" && !/视觉|截图|卡片|海报|hook|钩子|反差|展示|vibe|情绪/i.test(text)) penalty += 8;
    if (dimension === "shareReuse" && !/分享|传播|转发|社交|榜单|晒|复玩|viral|复用/i.test(text)) penalty += 8;
  }

  if (mentor === investors.kris_jenner) {
    if (dimension === "vibeIdentity" && !/品牌|brand|ip|名字|人设|叙事|视觉|story|moment/i.test(text)) penalty += 6;
    if (dimension === "shareReuse" && !/渠道|合作|kol|社媒|instagram|tiktok|抖音|小红书|转述|传播/i.test(text)) penalty += 5;
    if (dimension === "logicalCoherence" && /随便|之后再说|不确定|看情况/i.test(text)) penalty += 4;
  }

  if (mentor === investors.jobs) {
    if (dimension === "logicalCoherence" && /以及|同时|还可以|另外|多种|复杂|全部/i.test(text)) penalty += 6;
    if (dimension === "mvpScope" && lower.length > 2500) penalty += 5;
  }

  return penalty;
}

function statusForScore(score) {
  if (score >= 88) return "可以开做";
  if (score >= 76) return "适合演示";
  if (score >= 62) return "需要聚焦";
  if (score >= 45) return "范围过散";
  return "定义不足";
}

function hypeRankForScore(score) {
  if (score >= 88) return "夯";
  if (score >= 76) return "顶级";
  if (score >= 62) return "人上人";
  if (score >= 45) return "NPC";
  return "拉完了";
}

function adjustOverallForMentor(baseScore, scores, mentor) {
  const values = dimensionMapFromScores(scores);
  let delta = 0;

  if (mentor === investors.paul_graham) {
    delta += values.userPain >= 72 ? 5 : -10;
    delta += values.vibeIdentity > values.userPain ? -4 : 0;
  }
  if (mentor === investors.zhang_yiming) {
    delta += values.shareReuse >= 68 && values.userPain >= 68 ? 5 : -6;
    delta += values.logicalCoherence >= 70 ? 3 : -5;
  }
  if (mentor === investors.karpathy) {
    delta += values.demoFeasibility >= 74 ? 7 : -12;
    delta += values.mvpScope >= 70 ? 4 : -8;
  }
  if (mentor === investors.kris_jenner) {
    delta += values.vibeIdentity >= 74 ? 7 : -10;
    delta += values.shareReuse >= 70 ? 6 : -9;
    delta += values.logicalCoherence >= 66 ? 3 : -5;
    delta += values.demoFeasibility < 50 ? -3 : 0;
  }
  if (mentor === investors.mrbeast) {
    delta += values.vibeIdentity >= 74 ? 7 : -11;
    delta += values.shareReuse >= 74 ? 8 : -13;
  }
  if (mentor === investors.trump) {
    delta += values.vibeIdentity >= 70 ? 6 : -9;
    delta += values.shareReuse >= 70 ? 5 : -8;
  }
  if (mentor === investors.jobs) {
    delta += values.logicalCoherence >= 74 ? 7 : -11;
    delta += values.mvpScope >= 70 ? 6 : -9;
    delta += values.shareReuse > values.logicalCoherence ? -4 : 0;
  }
  if (mentor === investors.musk) {
    delta += values.demoFeasibility >= 70 ? 7 : -12;
    delta += values.mvpScope >= 70 ? 7 : -10;
  }

  return Math.max(18, Math.min(96, Math.round(baseScore + delta)));
}

function applyEvidenceCaps(score, text) {
  const evidence = evidenceProfile(text);
  let capped = score;

  if (!evidence.targetUser) capped = Math.min(capped, 72);
  if (!evidence.coreFlow) capped = Math.min(capped, 68);
  if (!evidence.demoConstraint) capped = Math.min(capped, 70);
  if (!evidence.scopeCut && !evidence.boundary) capped = Math.min(capped, 78);
  if (!evidence.treeOrPackage) capped = Math.min(capped, 88);

  return Math.max(12, capped);
}

function commentForDimension(dimension, score, mentor) {
  const label = dimensionLabels[dimension];
  if (mentor === investors.karpathy && dimension === "demoFeasibility") {
    return score >= 70 ? "工程路径基本能跑，但要继续压缩 debug surface。" : "demo 路径不够硬，先做最小可跑 workflow。";
  }
  if (mentor === investors.mrbeast && dimension === "shareReuse") {
    return score >= 70 ? "结果有传播苗头，但还要更适合截图和二次传播。" : "这个结果还不够想让人发出去，传播飞轮起不来。";
  }
  if (mentor === investors.jobs && dimension === "logicalCoherence") {
    return score >= 70 ? "产品定义还算清楚，但还可以更锋利。" : "用户要理解太多东西，产品还不够像一个作品。";
  }
  if (mentor === investors.musk && dimension === "mvpScope") {
    return score >= 70 ? "范围还能接受，但继续删会更快。" : "范围太散，删掉默认需求后再看。";
  }
  if (mentor === investors.paul_graham && dimension === "userPain") {
    return score >= 70 ? "用户痛点有苗头，下一步要找真实用户验证。" : "还看不出谁会强烈想用这个最小版本。";
  }
  if (score >= 80) return `${label} 证据较强，已经接近可进入 first playable version。`;
  if (score >= 62) return `${label} 有基本轮廓，但还需要补更具体的证据。`;
  if (score >= 45) return `${label} 仍偏概念化，当前更像描述而不是证明。`;
  return `${label} 明显缺失，需要优先补充，否则不适合直接进入开发。`;
}

function extractProjectName(project, index) {
  const text = project.text || "";
  const heading = text.match(/^\s*#\s+(.+)$/m);
  if (heading) return heading[1].trim().slice(0, 80);
  const firstLine = text.split(/\n/).map((line) => line.trim()).find((line) => line.length > 4);
  return (project.name || firstLine || `Project ${index + 1}`).slice(0, 80);
}

function buildRisks(scores, mentor) {
  return [...scores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => {
      if (item.key === "logicalCoherence") return mentorRiskLine(mentor, "logicalCoherence", "逻辑风险：产品承诺、目标用户和功能实现还没有互相咬合。");
      if (item.key === "mvpScope") return mentorRiskLine(mentor, "mvpScope", "范围风险：第一版范围仍然偏大，需要继续删除非核心功能。");
      if (item.key === "demoFeasibility") return mentorRiskLine(mentor, "demoFeasibility", "演示风险：当前方案不一定能在时间约束内做成可展示 demo。");
      if (item.key === "userPain") return mentorRiskLine(mentor, "userPain", "痛点风险：用户场景和立即收益还不够具体。");
      if (item.key === "vibeIdentity") return mentorRiskLine(mentor, "vibeIdentity", "Vibe 风险：体验记忆点不足，用户第一眼不容易记住。");
      return mentorRiskLine(mentor, "shareReuse", "传播风险：缺少让用户截图、转发、复用或二次体验的动机。");
    });
}

function mentorRiskLine(mentor, key, fallback) {
  const lines = {
    paul_graham: {
      userPain: "PG 风险：还没有证明某个具体用户会主动要这个最小版本。",
      mvpScope: "PG 风险：范围越大，越容易逃避真实需求验证。",
      vibeIdentity: "PG 风险：体验包装可能掩盖了用户是否真的想用的问题。"
    },
    zhang_yiming: {
      shareReuse: "张一鸣风险：传播不是单次爆点，缺少持续反馈就很难迭代。",
      userPain: "张一鸣风险：用户场景和反馈频率还不够清楚，长期变量偏弱。",
      logicalCoherence: "张一鸣风险：链路不清楚会导致后续数据和反馈都不可解释。"
    },
    karpathy: {
      demoFeasibility: "Karpathy 风险：end-to-end workflow 没跑通前，所有产品判断都偏乐观。",
      mvpScope: "Karpathy 风险：debug surface 太大，demo 现场失败概率会上升。",
      logicalCoherence: "Karpathy 风险：核心假设不确定，工程实现会变成猜需求。"
    },
    kris_jenner: {
      vibeIdentity: "Kris 风险：这个项目还没有可被记住的 brand moment，用户看完不一定会转述。",
      shareReuse: "Kris 风险：没有明确分发渠道和可截图结果，注意力很难沉淀成增长。",
      logicalCoherence: "Kris 风险：名字、视觉、目标用户和商业叙事还没有被你控制在同一个故事里。",
      userPain: "Kris 风险：用户痛点还没被包装成一个让人立刻共情的公共叙事。"
    },
    mrbeast: {
      vibeIdentity: "MrBeast 风险：第一眼不够强，用户不会停下来。",
      shareReuse: "MrBeast 风险：结果不值得晒，就不会形成自传播。",
      logicalCoherence: "MrBeast 风险：三秒内看不懂，后面的价值没有机会被看到。"
    },
    trump: {
      vibeIdentity: "Trump 风险：舞台呈现不够有冲击力，观众不会记住。",
      shareReuse: "Trump 风险：一句话卖点不够大，传播时很容易被忽略。",
      userPain: "Trump 风险：价值主张不够强势，听起来不像一个必须尝试的东西。"
    },
    jobs: {
      logicalCoherence: "Jobs 风险：产品定义不够锋利，用户会觉得你在展示功能而不是作品。",
      mvpScope: "Jobs 风险：复杂度正在稀释产品的一句话定义。",
      vibeIdentity: "Jobs 风险：体验有元素，但还没有形成清晰的 taste。"
    },
    musk: {
      demoFeasibility: "Musk 风险：最难假设没有被直接验证，工程速度会被拖慢。",
      mvpScope: "Musk 风险：需求没有删到足够少，第一版会过重。",
      shareReuse: "Musk 风险：如果结果不能快速扩散，反馈速度也会变慢。"
    }
  };
  return lines[mentor.key]?.[key] || fallback;
}

function buildNextActions(scores, userProfile, mentor) {
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0]?.key;
  const actions = {
    logicalCoherence: "重写产品承诺：把目标用户、核心流程、功能实现和不做事项放在同一条逻辑链里。",
    mvpScope: "删除所有 nice-to-have，只保留一个 core loop 和一个结果页。",
    demoFeasibility: "写出 30-60 秒 demo script，并倒推必须跑通的最小 workflow。",
    userPain: "把目标用户缩到一个具体场景，说明他为什么现在就需要这个结果。",
    vibeIdentity: "先做一个有记忆点的结果页状态，让用户一眼知道这个产品的性格。",
    shareReuse: "设计一个用户愿意转发或复用的结果：状态、诊断、榜单、对比或复玩机制。"
  };

  const mentorSpecific = mentorNextAction(mentor, weakest);
  return [
    mentorSpecific || actions[weakest] || actions.mvpScope,
    mentorSecondAction(mentor),
    "下一版文档必须补齐目标用户、核心交互、demo 约束和必做功能。"
  ];
}

function mentorNextAction(mentor, weakest) {
  const plans = {
    paul_graham: "先找一个真实 first user，把他今天为什么会用这个最小版本写成 5 句话。",
    zhang_yiming: "画出输入、输出、反馈、下一次使用的闭环，检查每一步是否能产生可迭代信号。",
    karpathy: "写一个 60 秒 end-to-end demo script，然后只实现脚本里必须出现的路径。",
    kris_jenner: "把项目包装成一个可传播的 brand moment：名字、视觉、截图结果和转述话术必须统一。",
    mrbeast: "先做结果页截图：标题、分数、反差结论必须让人有转发冲动。",
    trump: "重写一句话卖点，让它在展示现场听起来更大、更直接、更有记忆点。",
    jobs: "删掉所有解释成本高的功能，只保留一个漂亮、清楚、不可误解的核心体验。",
    musk: "列出所有默认需求，删掉一半，再用最短工程路径验证最难假设。"
  };
  if (mentor === investors.karpathy && weakest === "demoFeasibility") return plans.karpathy;
  if (mentor === investors.mrbeast && weakest === "shareReuse") return plans.mrbeast;
  if (mentor === investors.jobs && weakest === "logicalCoherence") return plans.jobs;
  if (mentor === investors.paul_graham && weakest === "userPain") return plans.paul_graham;
  return plans[mentor.key];
}

function mentorSecondAction(mentor) {
  const actions = {
    paul_graham: "不要先扩功能，先验证是否有人强烈想要这个最小版本。",
    zhang_yiming: "把下一轮迭代建立在用户反馈上，而不是建立在团队主观偏好上。",
    karpathy: "把所有不影响 workflow 跑通的东西延后，先降低 debug surface。",
    kris_jenner: "先锁定你能控制的叙事资产，再谈扩展渠道和合作对象。",
    mrbeast: "用 3 秒 hook 和 30 秒留存检查结果页，不要只看功能完整度。",
    trump: "把 demo 当成舞台表演设计，先保证观众能记住主张。",
    jobs: "用删除来提高 taste，保留的每个元素都必须服务于一句话定义。",
    musk: "压缩路径、缩短反馈周期，用速度暴露真实问题。"
  };
  return actions[mentor.key] || "先验证最危险的产品假设，再决定是否扩功能。";
}

function buildProductCritique(projectName, text, scores, userProfile, strongest, weakest, mentor) {
  const missingFields = inferProductMissingFields(text);
  const featureHints = extractFeatureHints(text);
  const mustHaveFeatures = featureHints.length
    ? featureHints.slice(0, 5)
    : ["输入项目描述", "选择产品导师", "生成 critique report", "输出 next iteration checklist"];
  const deferredFeatures = [
    "用户登录和历史记录",
    "复杂数据看板",
    "多轮深度问答",
    "自动市场检索"
  ];

  return {
    currentProductOneLiner: `${projectName} 用产品导师视角审阅 idea 或 MVP brief，并输出锐评与下一轮迭代计划。`,
    overallDiagnosis: mentorLine(mentor, "verdict", `当前方案的最强点是 ${strongest.label}，但 ${weakest.label} 仍然拖慢 MVP readiness。`),
    targetUserDiagnosis: mentorTargetUserLine(mentor, missingFields),
    problemDiagnosis: mentorProblemLine(mentor, missingFields),
    coreFlowCritique: mentorCoreFlowLine(mentor, missingFields),
    firstPlayableAssessment: mentorLine(mentor, "scope", `在 ${toleranceLabel(userProfile)} 下，第一版只应该证明一个核心闭环，而不是完整平台。`),
    mustHaveFeatures,
    scopeCutSuggestions: deferredFeatures.map((item) => `${item}：放到 V2，不应阻塞第一版可演示闭环。`),
    demoScriptFeedback: "30-60 秒 demo 应从一个混乱 idea 开始，现场生成 critique，再展示 3 条下一轮迭代建议。不要先讲架构。",
    visualHookFeedback: "结果页需要一个可截图的诊断状态和项目卡片。视觉 hook 应服务于理解，而不是装饰。",
    iterationNotes: [
      "补齐 target user、core interaction 和 demo constraints。",
      "把 must-have features 压到 3-5 个。",
      "用一个真实项目 brief 测试报告是否能指导下一版修改。"
    ],
    topCritique: mentorTopCritique(mentor, weakest),
    missingFields
  };
}

function mentorLine(mentor, key, fallback) {
  return mentor.voice?.[key] || fallback;
}

function mentorTargetUserLine(mentor, missingFields) {
  if (missingFields.includes("targetUsers")) {
    return mentorLine(mentor, "risk", "目标用户仍然模糊。请把泛用户压缩成一个具体 first user。");
  }
  if (mentor === investors.paul_graham) return "目标用户有轮廓，但还要更具体：谁今天就会用最小版本？不要说一群人，说一个人。";
  if (mentor === investors.zhang_yiming) return "目标用户描述可用，下一步要补使用场景、触发频率和反馈闭环。";
  if (mentor === investors.mrbeast) return "用户有了，但要问：他们为什么愿意把结果发出去？这个动机还要更强。";
  if (mentor === investors.jobs) return "目标用户不能只是画像，要和产品的一句话定义咬合。";
  return "目标用户已有基本描述，下一步需要补充具体使用场景和触发时刻。";
}

function mentorProblemLine(mentor, missingFields) {
  if (missingFields.includes("problem")) {
    return mentor === investors.karpathy
      ? "问题没写清楚，工程上就会变成乱建功能。先定义 failure case。"
      : "问题描述不足。当前更像功能设想，而不是一个用户正在经历的具体困难。";
  }
  if (mentor === investors.kris_jenner) return "问题可以成立，但还没有被包装成一个用户愿意公开谈论的故事。把痛点翻译成可传播的叙事。";
  if (mentor === investors.trump) return "问题可以成立，但舞台表达还不够狠。用户听完要立刻知道为什么这是个 big problem。";
  if (mentor === investors.musk) return "问题成立。现在删掉包装，找出最硬的那个假设，然后直接验证。";
  return "问题方向成立，但需要说明用户为什么现在需要这个工具，以及不用它会付出什么代价。";
}

function mentorCoreFlowLine(mentor, missingFields) {
  if (missingFields.includes("coreInteraction")) {
    return mentor === investors.jobs
      ? "核心交互没被设计成作品。建议只保留输入、判断、结果三个动作。"
      : "核心交互没有被清楚写出来。建议流程压缩为：输入 brief -> 选择导师 -> 生成 critique -> 得到下一步 checklist。";
  }
  if (mentor === investors.karpathy) return "核心流程可以保留，但要先做 end-to-end，哪怕里面很多步骤是假的或手动的。";
  if (mentor === investors.mrbeast) return "核心流程可用，但要更快进入结果。用户等太久，留存会掉。";
  if (mentor === investors.zhang_yiming) return "核心流程成立，关键是每次输出后能不能形成下一次迭代反馈。";
  if (mentor === investors.kris_jenner) return "核心流程可以保留，但每一步都要服务于可截图结果和可控叙事。亲爱的，用户不是只来完成任务，他们也在判断这东西值不值得晒。";
  return "核心流程可以保留，但每一步都要服务于一个结果：让用户知道下一版该改什么。";
}

function mentorTopCritique(mentor, weakest) {
  if (mentor === investors.paul_graham) return `别优化表面。先把「${weakest.label}」补实，否则你验证的不是需求，只是表达能力。`;
  if (mentor === investors.karpathy) return `当前最危险的是「${weakest.label}」。它不具体，demo 的 debug surface 就会失控。`;
  if (mentor === investors.mrbeast) return `最大问题是「${weakest.label}」。用户不想截图、不想转发，就没有增长飞轮。`;
  if (mentor === investors.jobs) return `「${weakest.label}」让产品变钝了。删掉噪音，留下一个清楚、漂亮、可理解的体验。`;
  if (mentor === investors.musk) return `「${weakest.label}」还不够硬。删需求，压路径，用最快方式验证最难假设。`;
  if (mentor === investors.trump) return `「${weakest.label}」不够有气势。现场观众看不懂，就不会买账。`;
  if (mentor === investors.kris_jenner) return `「${weakest.label}」会拖慢这个项目的 brand momentum。先把名字、结果页、分享理由和渠道话术统一起来。`;
  return `当前核心问题不是分数高低，而是「${weakest.label}」需要更具体，否则用户无法把报告转化为下一步行动。`;
}

function mentorVerdictLine(mentor, hypeRank, projectName, status, strongest, weakest) {
  if (mentor === investors.paul_graham) {
    return `${hypeRank}：${projectName} 现在是 ${status}。我只关心一件事：${strongest.label} 有苗头，但 ${weakest.label} 没补实前，不要假装已经验证了需求。`;
  }
  if (mentor === investors.zhang_yiming) {
    return `${hypeRank}：${projectName} 现在是 ${status}。强项在 ${strongest.label}，短板在 ${weakest.label}；关键不是一次性好看，而是能不能形成反馈闭环。`;
  }
  if (mentor === investors.karpathy) {
    return `${hypeRank}：${projectName} 现在是 ${status}。${strongest.label} 还行，但 ${weakest.label} 会扩大 debug surface；先把最小 workflow 跑通。`;
  }
  if (mentor === investors.kris_jenner) {
    return `${hypeRank}：${projectName} 现在是 ${status}。${strongest.label} 有可包装的潜力，但 ${weakest.label} 会影响它成为一个可传播的 brand moment。`;
  }
  if (mentor === investors.mrbeast) {
    return `${hypeRank}：${projectName} 现在是 ${status}。${strongest.label} 能撑住一部分注意力，但 ${weakest.label} 不够强，用户未必愿意截图传播。`;
  }
  if (mentor === investors.trump) {
    return `${hypeRank}：${projectName} 现在是 ${status}。${strongest.label} 可以拿来包装，但 ${weakest.label} 不够硬，现场听众可能记不住。`;
  }
  if (mentor === investors.jobs) {
    return `${hypeRank}：${projectName} 现在是 ${status}。${strongest.label} 有可取之处，但 ${weakest.label} 让产品不够锋利，先删到一句话能讲清。`;
  }
  if (mentor === investors.musk) {
    return `${hypeRank}：${projectName} 现在是 ${status}。${strongest.label} 不是问题，真正要打穿的是 ${weakest.label}；删需求，压路径，快速 ship。`;
  }
  return `${hypeRank}：${projectName} 当前是 ${status}，最强点是 ${strongest.label}，最需要修正的是 ${weakest.label}。`;
}

function inferProductMissingFields(text) {
  const checks = {
    targetUsers: /target|user|customer|用户|目标用户|客户|受众|参赛者|开发者|创作者/i,
    problem: /problem|pain|问题|痛点|困难|卡点|成本|效率|需求/i,
    solution: /solution|product|方案|产品|解决|工具|功能|服务/i,
    coreInteraction: /flow|interaction|click|upload|select|generate|流程|交互|点击|上传|选择|生成|输入|输出/i,
    demoConstraints: /demo|deadline|hours|day|week|hackathon|演示|时间|小时|天|周|黑客松|约束/i
  };

  return Object.entries(checks)
    .filter(([, pattern]) => !pattern.test(text))
    .map(([field]) => field);
}

function extractFeatureHints(text) {
  const featureKeywords = [
    ["上传", "上传输入"],
    ["选择", "导师选择"],
    ["生成", "锐评生成"],
    ["报告", "锐评报告"],
    ["卡片", "诊断卡片"],
    ["分享", "分享流程"],
    ["榜单", "项目榜单"],
    ["导出", "结果导出"],
    ["dashboard", "验证面板"],
    ["checklist", "迭代清单"]
  ];
  const lower = text.toLowerCase();
  return featureKeywords
    .filter(([keyword]) => lower.includes(keyword.toLowerCase()))
    .map(([, label]) => label);
}

function dimensionMapFromScores(dimensionScores) {
  return Object.fromEntries(dimensionScores.map((item) => [item.key, item.score]));
}

function analyzeSingleProject(project, index, investor, userProfile) {
  const text = String(project.text || "").trim();
  const weights = normalizeWeights(investor.weights, userProfile);
  const dimensionScores = dimensions.map((dimension) => {
    const rawScore = scoreDimension(text, dimension, investor);
    const score = applyToleranceToDimension(rawScore, dimension, userProfile);
    return {
      key: dimension,
      label: dimensionLabels[dimension],
      score,
      weight: Number(weights[dimension].toFixed(3)),
      comment: commentForDimension(dimension, score, investor)
    };
  });

  const baseOverallScore = Math.round(
    dimensionScores.reduce((sum, item) => sum + item.score * weights[item.key], 0)
  );
  const adjustedScore = adjustOverallForMentor(baseOverallScore, dimensionScores, investor);
  const toleranceAdjustedScore = applyToleranceToOverall(adjustedScore, userProfile);
  const overallScore = applyEvidenceCaps(toleranceAdjustedScore, text);
  const status = statusForScore(overallScore);
  const hypeRank = hypeRankForScore(overallScore);
  const projectName = extractProjectName(project, index);
  const strongest = [...dimensionScores].sort((a, b) => b.score - a.score)[0];
  const weakest = [...dimensionScores].sort((a, b) => a.score - b.score)[0];
  const critique = buildProductCritique(projectName, text, dimensionScores, userProfile, strongest, weakest, investor);

  return {
    projectName,
    mentorName: investor.name,
    mentorThesis: investor.thesis,
    overallScore,
    status,
    hypeRank,
    oneLineVerdict: mentorVerdictLine(investor, hypeRank, projectName, status, strongest, weakest),
    styleComment: mentorLine(investor, "verdict", investor.opener),
    dimensionScores,
    keyRisks: buildRisks(dimensionScores, investor),
    nextActions: buildNextActions(dimensionScores, userProfile, investor),
    strongestPoint: strongest.label,
    weakestPoint: weakest.label,
    critique
  };
}

function buildShareCard(report, investor) {
  return {
    projectName: report.projectName,
    mentor: investor.name,
    status: report.status,
    hypeRank: report.hypeRank,
    score: report.overallScore,
    oneLiner: report.critique.currentProductOneLiner,
    mainCritique: report.critique.topCritique,
    nextStep: report.nextActions[0],
    assetPlaceholder: "PROJECT_DIAGNOSIS_CARD_SLOT",
    topTrait: report.strongestPoint,
    weakness: report.weakestPoint
  };
}

function normalizeProjects(payload) {
  if (Array.isArray(payload.projects) && payload.projects.length) {
    return payload.projects.map((project, index) => ({
      name: String(project.name || `Project ${index + 1}`),
      text: String(project.text || "")
    }));
  }

  const text = String(payload.planText || "");
  return text
    .split(/\n\s*---PROJECT---\s*\n/i)
    .map((chunk, index) => ({ name: `Project ${index + 1}`, text: chunk.trim() }))
    .filter((project) => project.text);
}

function analyzeProjects(payload) {
  const investor = investors[payload.mentor || payload.investor] || investors.paul_graham;
  const userProfile = payload.userProfile || {};
  const projects = normalizeProjects(payload);

  if (!projects.length) {
    const error = new Error("请至少上传或粘贴一个项目计划书。");
    error.status = 400;
    throw error;
  }

  const tooShort = projects.find((project) => project.text.trim().length < 120);
  if (tooShort) {
    const error = new Error(`项目「${tooShort.name}」内容太短，请至少提供 120 个字符的 idea 或 MVP brief。`);
    error.status = 400;
    throw error;
  }

  const reports = projects.map((project, index) => analyzeSingleProject(project, index, investor, userProfile));
  const ranking = [...reports]
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((report, index) => ({
      rank: index + 1,
      projectName: report.projectName,
      overallScore: report.overallScore,
      status: report.status,
      hypeRank: report.hypeRank,
      oneLineVerdict: report.oneLineVerdict,
      strongestPoint: report.strongestPoint,
      weakestPoint: report.weakestPoint
    }));
  const topReport = reports.find((report) => report.projectName === ranking[0].projectName) || reports[0];

  return {
    mentor: investor.name,
    projectCount: reports.length,
    report: topReport,
    reports,
    ranking,
    shareCard: buildShareCard(topReport, investor)
  };
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const safePath = path.normalize(urlPath === "/" ? "/index.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
}

function serveSoundEffect(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const requestedFile = urlPath.replace(/^\/sound-effect\//, "");
  const safePath = path.normalize(requestedFile).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(SOUND_DIR, safePath);

  if (!filePath.startsWith(SOUND_DIR + path.sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=3600"
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && req.url === "/api/analyze") {
    try {
      const body = await getRequestBody(req);
      const payload = JSON.parse(body || "{}");
      sendJson(res, 200, analyzeProjects(payload));
    } catch (error) {
      sendJson(res, error.status || 500, { error: error.message || "Analysis failed." });
    }
    return;
  }

  if (req.method === "GET") {
    if (req.url.split("?")[0].startsWith("/sound-effect/")) {
      serveSoundEffect(req, res);
      return;
    }
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Investor Console MVP running at http://localhost:${PORT}`);
});
