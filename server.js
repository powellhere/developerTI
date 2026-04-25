const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4173;
const PUBLIC_DIR = path.join(__dirname, "public");

const dimensions = [
  "interactionClarity",
  "mvpScope",
  "demoFeasibility",
  "userValue",
  "visualHook",
  "sharePotential"
];

const dimensionLabels = {
  interactionClarity: "交互清晰度",
  mvpScope: "MVP 范围",
  demoFeasibility: "Demo 可实现性",
  userValue: "用户价值",
  visualHook: "视觉钩子",
  sharePotential: "传播潜力"
};

const signals = {
  interactionClarity: ["flow", "interaction", "click", "play", "use", "screen", "流程", "交互", "点击", "体验", "使用", "玩法", "页面", "入口"],
  mvpScope: ["mvp", "scope", "must-have", "core loop", "first playable", "最小", "范围", "核心", "第一版", "必需", "砍掉", "收窄"],
  demoFeasibility: ["demo", "prototype", "ship", "build", "debug", "roadmap", "演示", "原型", "可展示", "可实现", "开发", "调试", "里程碑"],
  userValue: ["user", "problem", "pain", "job", "value", "用户", "目标用户", "问题", "痛点", "价值", "场景", "需求"],
  visualHook: ["visual", "hook", "poster", "card", "animation", "视觉", "钩子", "截图", "卡片", "海报", "动画", "吸引"],
  sharePotential: ["share", "viral", "community", "social", "retention", "传播", "分享", "转发", "社交", "复玩", "留存", "讨论"]
};

const investors = {
  paul_graham: {
    name: "Paul Graham 风格产品导师",
    thesis: "Make something people want, then cut the MVP until it can be tested.",
    style: "简短、直接，追问用户是否真的需要，反对空泛愿景。",
    weights: { interactionClarity: 0.18, mvpScope: 0.2, demoFeasibility: 0.15, userValue: 0.27, visualHook: 0.08, sharePotential: 0.12 },
    bias: { userValue: 8, mvpScope: 5, interactionClarity: 3 },
    opener: "The question is not whether this sounds interesting. The question is whether a real user would use the smallest version.",
    scoreTuning: { userValue: 12, mvpScope: 7, visualHook: -10, sharePotential: -8, demoFeasibility: -3 },
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
    weights: { interactionClarity: 0.18, mvpScope: 0.16, demoFeasibility: 0.16, userValue: 0.22, visualHook: 0.1, sharePotential: 0.18 },
    bias: { userValue: 5, sharePotential: 5, interactionClarity: 4 },
    opener: "先把表层概念拿掉，看用户场景、反馈链路和迭代机制是否成立。",
    scoreTuning: { userValue: 8, sharePotential: 7, demoFeasibility: -4, mvpScope: 2, interactionClarity: 4 },
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
    weights: { interactionClarity: 0.16, mvpScope: 0.22, demoFeasibility: 0.28, userValue: 0.12, visualHook: 0.08, sharePotential: 0.14 },
    bias: { demoFeasibility: 8, mvpScope: 6, interactionClarity: 3 },
    opener: "imo, this becomes real only when the smallest workflow runs end to end.",
    scoreTuning: { demoFeasibility: 14, mvpScope: 10, interactionClarity: 4, visualHook: -10, userValue: -6, sharePotential: -3 },
    voice: {
      verdict: "imo，先别讨论完整产品。把最小 workflow 跑通，然后看哪里坏掉。",
      scope: "删除所有暂时不影响 end-to-end demo 的功能。能跑起来，比看起来完整更重要。",
      risk: "最大的风险不是想法不好，而是 debug surface 太大，最后 demo 现场跑不起来。"
    }
  },
  ilya: {
    name: "Ilya Sutskever 风格研究导师",
    thesis: "Importance is not readiness; define the boundary before building.",
    style: "克制、审慎，强调问题重要性、概念纯度和系统边界。",
    weights: { interactionClarity: 0.14, mvpScope: 0.16, demoFeasibility: 0.16, userValue: 0.24, visualHook: 0.1, sharePotential: 0.2 },
    bias: { userValue: 7, mvpScope: 3, sharePotential: 4 },
    opener: "It may be important. But importance is not the same as a clear first playable version.",
    scoreTuning: { userValue: 10, sharePotential: 5, interactionClarity: -5, demoFeasibility: -7, visualHook: -4 },
    voice: {
      verdict: "这个方向可能重要。但重要性不等于清晰性，也不等于可演示性。",
      scope: "你需要先定义边界：这个系统第一版到底证明什么，不证明什么。",
      risk: "如果概念边界不清楚，用户会看到一个很大的命题，但不知道自己能体验什么。"
    }
  },
  mrbeast: {
    name: "MrBeast 风格增长导师",
    thesis: "The hook must land in three seconds and the result must be shareable.",
    style: "强 hook、强对比，关注 3 秒理解、30 秒留存和截图传播。",
    weights: { interactionClarity: 0.18, mvpScope: 0.12, demoFeasibility: 0.12, userValue: 0.12, visualHook: 0.22, sharePotential: 0.24 },
    bias: { visualHook: 9, sharePotential: 9, interactionClarity: 3 },
    opener: "If people cannot understand the hook in one sentence, the demo will die.",
    scoreTuning: { visualHook: 16, sharePotential: 16, interactionClarity: 5, demoFeasibility: -10, mvpScope: -8, userValue: -5 },
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
    weights: { interactionClarity: 0.18, mvpScope: 0.12, demoFeasibility: 0.16, userValue: 0.14, visualHook: 0.2, sharePotential: 0.2 },
    bias: { visualHook: 7, sharePotential: 6, interactionClarity: 4 },
    opener: "This either looks strong on stage or it gets ignored. The packaging matters.",
    scoreTuning: { visualHook: 14, sharePotential: 12, interactionClarity: 5, userValue: -6, mvpScope: -5 },
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
    weights: { interactionClarity: 0.24, mvpScope: 0.2, demoFeasibility: 0.14, userValue: 0.16, visualHook: 0.18, sharePotential: 0.08 },
    bias: { interactionClarity: 8, mvpScope: 6, visualHook: 5 },
    opener: "The product needs one sharp reason to exist. If it has five reasons, it has none.",
    scoreTuning: { interactionClarity: 15, mvpScope: 10, visualHook: 7, sharePotential: -12, demoFeasibility: -5 },
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
    weights: { interactionClarity: 0.14, mvpScope: 0.18, demoFeasibility: 0.24, userValue: 0.14, visualHook: 0.1, sharePotential: 0.2 },
    bias: { demoFeasibility: 7, mvpScope: 6, sharePotential: 5 },
    opener: "Wrong question. The first question is what requirement can be deleted.",
    scoreTuning: { demoFeasibility: 13, mvpScope: 11, sharePotential: 7, interactionClarity: -6, userValue: -4, visualHook: -3 },
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

const profileAdjustments = {
  identity: {
    student: { demoFeasibility: 0.03, visualHook: 0.03, userValue: -0.01 },
    founder: { userValue: 0.04, mvpScope: 0.03, visualHook: -0.01 },
    employee: { demoFeasibility: 0.04, mvpScope: 0.02 },
    creator: { visualHook: 0.05, sharePotential: 0.05, demoFeasibility: -0.01 },
    indie_developer: { mvpScope: 0.04, demoFeasibility: 0.04, sharePotential: -0.01 }
  },
  stage: {
    idea: { interactionClarity: 0.05, mvpScope: 0.04, demoFeasibility: -0.02 },
    prototype: { demoFeasibility: 0.03, userValue: 0.03 },
    launched: { userValue: 0.05, mvpScope: 0.02, visualHook: -0.01 }
  },
  goal: {
    hackathon: { demoFeasibility: 0.05, visualHook: 0.04, sharePotential: 0.04 },
    product_demo: { interactionClarity: 0.05, demoFeasibility: 0.03 },
    startup_validation: { userValue: 0.06, interactionClarity: 0.02 },
    coursework: { interactionClarity: 0.03, userValue: 0.02 },
    social_media: { visualHook: 0.07, sharePotential: 0.07, userValue: -0.02 }
  },
  buildTime: {
    "3_hours": { mvpScope: 0.08, demoFeasibility: 0.04, visualHook: -0.02 },
    "1_day": { demoFeasibility: 0.05, mvpScope: 0.04 },
    "2_days": { demoFeasibility: 0.02, visualHook: 0.02 },
    "1_week": { interactionClarity: 0.02, visualHook: 0.02, sharePotential: 0.02 }
  },
  technicalConfidence: {
    low: { mvpScope: 0.06, demoFeasibility: -0.03 },
    medium: {},
    high: { demoFeasibility: 0.03, sharePotential: 0.02 }
  }
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
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

function normalizeWeights(baseWeights, userProfile = {}) {
  const adjusted = { ...baseWeights };

  Object.entries(profileAdjustments).forEach(([group, options]) => {
    const selected = userProfile[group];
    const rules = options[selected] || {};
    Object.entries(rules).forEach(([dimension, delta]) => {
      adjusted[dimension] = Math.max(0.05, (adjusted[dimension] || 0) + delta);
    });
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

function scoreDimension(text, dimension, investor) {
  const hits = countHits(text, signals[dimension]);
  const lengthBonus = Math.min(14, Math.floor(text.length / 1800));
  const structureBonus = /#+\s|目标|用户|问题|方案|流程|功能|demo|mvp|约束|风险|roadmap|milestone/i.test(text) ? 6 : 0;
  const personaBonus = investor.bias[dimension] || 0;
  const tuningBonus = investor.scoreTuning?.[dimension] || 0;
  const penalty = mentorPenalty(text, dimension, investor);
  const hitBonus = Math.min(30, Math.round(Math.sqrt(hits) * 10));
  return Math.max(18, Math.min(96, Math.round(32 + hitBonus + lengthBonus + structureBonus + personaBonus + tuningBonus - penalty)));
}

function mentorPenalty(text, dimension, mentor) {
  const lower = text.toLowerCase();
  let penalty = 0;

  if (mentor === investors.karpathy || mentor === investors.musk) {
    if (dimension === "demoFeasibility" && !/demo|原型|prototype|可展示|调试|debug|ship|跑通/i.test(text)) penalty += 8;
    if (dimension === "mvpScope" && /平台|生态|全流程|一站式|复杂|全部|完整/i.test(text)) penalty += 6;
  }

  if (mentor === investors.paul_graham || mentor === investors.zhang_yiming || mentor === investors.ilya) {
    if (dimension === "userValue" && !/目标用户|用户|痛点|问题|场景|first user|target user/i.test(text)) penalty += 8;
    if (dimension === "interactionClarity" && !/流程|交互|输入|输出|点击|生成|core loop/i.test(text)) penalty += 4;
  }

  if (mentor === investors.mrbeast || mentor === investors.trump) {
    if (dimension === "visualHook" && !/视觉|截图|卡片|海报|hook|钩子|反差|展示/i.test(text)) penalty += 8;
    if (dimension === "sharePotential" && !/分享|传播|转发|社交|榜单|晒|复玩|viral/i.test(text)) penalty += 8;
  }

  if (mentor === investors.jobs) {
    if (dimension === "interactionClarity" && /以及|同时|还可以|另外|多种|复杂|全部/i.test(text)) penalty += 6;
    if (dimension === "mvpScope" && lower.length > 2500) penalty += 5;
  }

  return penalty;
}

function statusForScore(score) {
  if (score >= 90) return "可以开做";
  if (score >= 75) return "适合演示";
  if (score >= 60) return "需要聚焦";
  if (score >= 40) return "范围过散";
  return "定义不足";
}

function hypeRankForScore(score) {
  if (score >= 90) return "夯";
  if (score >= 75) return "顶级";
  if (score >= 60) return "人上人";
  if (score >= 40) return "NPC";
  return "拉完了";
}

function adjustOverallForMentor(baseScore, scores, mentor) {
  const values = dimensionMapFromScores(scores);
  let delta = 0;

  if (mentor === investors.paul_graham) {
    delta += values.userValue >= 75 ? 7 : -12;
    delta += values.visualHook > values.userValue ? -4 : 0;
  }
  if (mentor === investors.zhang_yiming) {
    delta += values.sharePotential >= 70 && values.userValue >= 70 ? 6 : -6;
    delta += values.interactionClarity >= 70 ? 3 : -3;
  }
  if (mentor === investors.karpathy) {
    delta += values.demoFeasibility >= 75 ? 8 : -14;
    delta += values.mvpScope >= 70 ? 5 : -8;
  }
  if (mentor === investors.ilya) {
    delta += values.userValue >= 75 && values.mvpScope >= 65 ? 5 : -9;
    delta += values.demoFeasibility < 55 ? -5 : 0;
  }
  if (mentor === investors.mrbeast) {
    delta += values.visualHook >= 75 ? 8 : -12;
    delta += values.sharePotential >= 75 ? 9 : -14;
  }
  if (mentor === investors.trump) {
    delta += values.visualHook >= 70 ? 7 : -9;
    delta += values.sharePotential >= 70 ? 6 : -8;
  }
  if (mentor === investors.jobs) {
    delta += values.interactionClarity >= 75 ? 8 : -12;
    delta += values.mvpScope >= 70 ? 6 : -9;
    delta += values.sharePotential > values.interactionClarity ? -4 : 0;
  }
  if (mentor === investors.musk) {
    delta += values.demoFeasibility >= 70 ? 7 : -12;
    delta += values.mvpScope >= 70 ? 7 : -10;
  }

  return Math.max(18, Math.min(96, Math.round(baseScore + delta)));
}

function commentForDimension(dimension, score, mentor) {
  const label = dimensionLabels[dimension];
  if (mentor === investors.karpathy && dimension === "demoFeasibility") {
    return score >= 70 ? "工程路径基本能跑，但要继续压缩 debug surface。" : "demo 路径不够硬，先做最小可跑 workflow。";
  }
  if (mentor === investors.mrbeast && dimension === "sharePotential") {
    return score >= 70 ? "结果有传播苗头，但还要更适合截图和二次传播。" : "这个结果还不够想让人发出去，传播飞轮起不来。";
  }
  if (mentor === investors.jobs && dimension === "interactionClarity") {
    return score >= 70 ? "体验主线还算清楚，但还可以更锋利。" : "用户要理解太多东西，产品还不够像一个作品。";
  }
  if (mentor === investors.musk && dimension === "mvpScope") {
    return score >= 70 ? "范围还能接受，但继续删会更快。" : "范围太散，删掉默认需求后再看。";
  }
  if (mentor === investors.paul_graham && dimension === "userValue") {
    return score >= 70 ? "用户价值有苗头，下一步要找真实用户验证。" : "还看不出谁会强烈想用这个最小版本。";
  }
  if (score >= 80) return `${label} 已经比较清楚，能支撑 first playable version。`;
  if (score >= 60) return `${label} 有基本轮廓，但还需要压缩 scope 或补足 demo 证据。`;
  if (score >= 40) return `${label} 仍偏概念化，用户可能无法在 30 秒内理解。`;
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
      if (item.key === "interactionClarity") return mentorRiskLine(mentor, "interactionClarity", "交互风险：用户进入页面后可能不知道第一步该做什么。");
      if (item.key === "mvpScope") return mentorRiskLine(mentor, "mvpScope", "范围风险：第一版范围仍然偏大，需要继续删除非核心功能。");
      if (item.key === "demoFeasibility") return mentorRiskLine(mentor, "demoFeasibility", "演示风险：当前方案不一定能在时间约束内做成可展示 demo。");
      if (item.key === "userValue") return mentorRiskLine(mentor, "userValue", "价值风险：用户体验后的明确收益还不够具体。");
      if (item.key === "visualHook") return mentorRiskLine(mentor, "visualHook", "视觉风险：视觉记忆点不足，现场或社媒第一眼不够抓人。");
      return mentorRiskLine(mentor, "sharePotential", "传播风险：缺少让用户截图、转发或二次体验的动机。");
    });
}

function mentorRiskLine(mentor, key, fallback) {
  const lines = {
    paul_graham: {
      userValue: "PG 风险：还没有证明某个具体用户会主动要这个最小版本。",
      mvpScope: "PG 风险：范围越大，越容易逃避真实需求验证。",
      visualHook: "PG 风险：视觉包装可能掩盖了用户是否真的想用的问题。"
    },
    zhang_yiming: {
      sharePotential: "张一鸣风险：传播不是单次爆点，缺少持续反馈就很难迭代。",
      userValue: "张一鸣风险：用户场景和反馈频率还不够清楚，长期变量偏弱。",
      interactionClarity: "张一鸣风险：链路不清楚会导致后续数据和反馈都不可解释。"
    },
    karpathy: {
      demoFeasibility: "Karpathy 风险：end-to-end workflow 没跑通前，所有产品判断都偏乐观。",
      mvpScope: "Karpathy 风险：debug surface 太大，demo 现场失败概率会上升。",
      interactionClarity: "Karpathy 风险：核心路径不确定，工程实现会变成猜需求。"
    },
    ilya: {
      userValue: "Ilya 风险：问题可能重要，但第一版证明的命题还不够纯。",
      mvpScope: "Ilya 风险：边界不清会让系统看起来宏大，但无法被验证。",
      demoFeasibility: "Ilya 风险：可演示性不足时，重要性无法转化为可信证据。"
    },
    mrbeast: {
      visualHook: "MrBeast 风险：第一眼不够强，用户不会停下来。",
      sharePotential: "MrBeast 风险：结果不值得晒，就不会形成自传播。",
      interactionClarity: "MrBeast 风险：三秒内看不懂，后面的价值没有机会被看到。"
    },
    trump: {
      visualHook: "Trump 风险：舞台呈现不够有冲击力，观众不会记住。",
      sharePotential: "Trump 风险：一句话卖点不够大，传播时很容易被忽略。",
      userValue: "Trump 风险：价值主张不够强势，听起来不像一个必须尝试的东西。"
    },
    jobs: {
      interactionClarity: "Jobs 风险：体验不够锋利，用户会觉得你在展示功能而不是作品。",
      mvpScope: "Jobs 风险：复杂度正在稀释产品的一句话定义。",
      visualHook: "Jobs 风险：视觉有元素，但还没有形成清晰的 taste。"
    },
    musk: {
      demoFeasibility: "Musk 风险：最难假设没有被直接验证，工程速度会被拖慢。",
      mvpScope: "Musk 风险：需求没有删到足够少，第一版会过重。",
      sharePotential: "Musk 风险：如果结果不能快速扩散，反馈速度也会变慢。"
    }
  };
  return lines[mentor.key]?.[key] || fallback;
}

function buildNextActions(scores, userProfile, mentor) {
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0]?.key;
  const actions = {
    interactionClarity: "重写 first screen：用户 3 秒内必须知道输入什么、点击什么、会得到什么。",
    mvpScope: "删除所有 nice-to-have，只保留一个 core loop 和一个结果页。",
    demoFeasibility: "写出 30-60 秒 demo script，并倒推必须跑通的最小 workflow。",
    userValue: "把目标用户缩到一个具体场景，说明体验后立即得到的价值。",
    visualHook: "先做一个可截图的结果卡片或可视化状态，作为 demo 的记忆点。",
    sharePotential: "设计一个用户愿意转发的结果：状态、诊断、榜单或可复玩机制。"
  };

  const mentorSpecific = mentorNextAction(mentor, weakest);
  return [
    mentorSpecific || actions[weakest] || actions.mvpScope,
    userProfile.goal === "hackathon"
      ? "优先保证现场 demo 可跑通，不要为完整产品架构牺牲展示稳定性。"
      : mentorSecondAction(mentor),
    "下一版文档必须补齐目标用户、核心交互、demo 约束和必做功能。"
  ];
}

function mentorNextAction(mentor, weakest) {
  const plans = {
    paul_graham: "先找一个真实 first user，把他今天为什么会用这个最小版本写成 5 句话。",
    zhang_yiming: "画出输入、输出、反馈、下一次使用的闭环，检查每一步是否能产生可迭代信号。",
    karpathy: "写一个 60 秒 end-to-end demo script，然后只实现脚本里必须出现的路径。",
    ilya: "把第一版要证明的命题写清楚：证明什么、不证明什么、边界在哪里。",
    mrbeast: "先做结果页截图：标题、分数、反差结论必须让人有转发冲动。",
    trump: "重写一句话卖点，让它在展示现场听起来更大、更直接、更有记忆点。",
    jobs: "删掉所有解释成本高的功能，只保留一个漂亮、清楚、不可误解的核心体验。",
    musk: "列出所有默认需求，删掉一半，再用最短工程路径验证最难假设。"
  };
  if (mentor === investors.karpathy && weakest === "demoFeasibility") return plans.karpathy;
  if (mentor === investors.mrbeast && weakest === "sharePotential") return plans.mrbeast;
  if (mentor === investors.jobs && weakest === "interactionClarity") return plans.jobs;
  if (mentor === investors.paul_graham && weakest === "userValue") return plans.paul_graham;
  return plans[mentor.key];
}

function mentorSecondAction(mentor) {
  const actions = {
    paul_graham: "不要先扩功能，先验证是否有人强烈想要这个最小版本。",
    zhang_yiming: "把下一轮迭代建立在用户反馈上，而不是建立在团队主观偏好上。",
    karpathy: "把所有不影响 workflow 跑通的东西延后，先降低 debug surface。",
    ilya: "先提高问题定义的纯度，再决定是否扩大系统能力。",
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
    firstPlayableAssessment: mentorLine(mentor, "scope", `在 ${formatBuildTime(userProfile.buildTime || "2_days")} 的时间约束下，第一版只应该证明一个核心闭环，而不是完整平台。`),
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
  if (mentor === investors.ilya) return "问题方向可能重要，但你还需要说明边界：它解决什么，不解决什么。";
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
  return "核心流程可以保留，但每一步都要服务于一个结果：让用户知道下一版该改什么。";
}

function mentorTopCritique(mentor, weakest) {
  if (mentor === investors.paul_graham) return `别优化表面。先把「${weakest.label}」补实，否则你验证的不是需求，只是表达能力。`;
  if (mentor === investors.karpathy) return `当前最危险的是「${weakest.label}」。它不具体，demo 的 debug surface 就会失控。`;
  if (mentor === investors.mrbeast) return `最大问题是「${weakest.label}」。用户不想截图、不想转发，就没有增长飞轮。`;
  if (mentor === investors.jobs) return `「${weakest.label}」让产品变钝了。删掉噪音，留下一个清楚、漂亮、可理解的体验。`;
  if (mentor === investors.musk) return `「${weakest.label}」还不够硬。删需求，压路径，用最快方式验证最难假设。`;
  if (mentor === investors.trump) return `「${weakest.label}」不够有气势。现场观众看不懂，就不会买账。`;
  if (mentor === investors.ilya) return `「${weakest.label}」的不确定性最高。先定义边界，再谈扩展。`;
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
  if (mentor === investors.ilya) {
    return `${hypeRank}：${projectName} 现在是 ${status}。${strongest.label} 说明方向有价值，但 ${weakest.label} 暴露了边界还不够清楚。`;
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

function formatBuildTime(value) {
  const labels = {
    "3_hours": "3 小时",
    "1_day": "1 天",
    "2_days": "2 天",
    "1_week": "1 周"
  };
  return labels[value] || value;
}

const creatorTypeMap = {
  "B-HS": "缝合怪",
  "B-HL": "饼王",
  "B-CS": "表哥",
  "B-CL": "基建狂魔",
  "H-HS": "快钱游侠",
  "H-HL": "时间刺客",
  "H-CS": "黄牛",
  "H-CL": "老阴逼",
  "S-HS": "操盘手",
  "S-HL": "邪教头子",
  "S-CS": "品牌法医",
  "S-CL": "重新定义大师",
  "X-HX": "混沌运营者"
};

const creatorClanMap = {
  B: "造局者",
  H: "捕猎者",
  S: "叙事者",
  X: "彩蛋人格"
};

const spiritAnimalMap = {
  "B-HS": "壁虎",
  "B-HL": "孔雀",
  "B-CS": "蚂蚁",
  "B-CL": "蜘蛛",
  "H-HS": "鲨鱼",
  "H-HL": "猫头鹰",
  "H-CS": "狐狸",
  "H-CL": "蟒蛇",
  "S-HS": "章鱼",
  "S-HL": "狮王",
  "S-CS": "孔雀",
  "S-CL": "鹦鹉",
  "X-HX": "未知生物"
};

const nemesisMap = {
  "B-HS": "表哥",
  "B-HL": "黄牛",
  "B-CS": "缝合怪",
  "B-CL": "快钱游侠",
  "H-HS": "基建狂魔",
  "H-HL": "黄牛",
  "H-CS": "饼王",
  "H-CL": "快钱游侠",
  "S-HS": "品牌法医",
  "S-HL": "黄牛",
  "S-CS": "操盘手",
  "S-CL": "表哥",
  "X-HX": "秩序本身"
};

const goldenPairMap = {
  "B-HS": "基建狂魔",
  "B-HL": "表哥",
  "B-CS": "饼王",
  "B-CL": "邪教头子",
  "H-HS": "操盘手",
  "H-HL": "老阴逼",
  "H-CS": "品牌法医",
  "H-CL": "时间刺客",
  "S-HS": "快钱游侠",
  "S-HL": "基建狂魔",
  "S-CS": "黄牛",
  "S-CL": "饼王",
  "X-HX": "任何靠谱队友"
};

function countSignalHits(text, words) {
  return words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
}

function inferMissingFields(text) {
  const checks = {
    problem: /problem|pain|痛点|问题|需求|麻烦|成本|效率/i,
    solution: /solution|product|方案|产品|解决|功能|服务/i,
    targetUsers: /target|user|customer|用户|客户|人群|ICP|受众/i,
    businessModel: /business model|revenue|pricing|收入|定价|付费|商业模式|现金流/i,
    competitors: /competitor|alternative|moat|竞品|竞争|替代|护城河|壁垒/i
  };

  return Object.entries(checks)
    .filter(([, pattern]) => !pattern.test(text))
    .map(([field]) => field);
}

function dimensionMapFromScores(dimensionScores) {
  return Object.fromEntries(dimensionScores.map((item) => [item.key, item.score]));
}

function weightedSum(values, weights) {
  return Object.entries(weights).reduce((sum, [key, weight]) => sum + values[key] * weight, 0);
}

function resolveAnchorTie(sortedScores, userProfile, values) {
  const first = sortedScores[0][0];
  const second = sortedScores[1][0];
  const pair = new Set([first, second]);

  if (pair.has("B") && pair.has("S")) {
    if (["competition", "social_media"].includes(userProfile.goal)) return "S";
    if (userProfile.identity === "creator") return "S";
    if (["founder", "employee"].includes(userProfile.identity)) return "B";
    return first;
  }

  if (pair.has("B") && pair.has("H")) {
    if (userProfile.stage === "launched") return "H";
    if (userProfile.stage === "idea") return "B";
    if (values.businessModel > values.painPoint) return "H";
    return first;
  }

  if (pair.has("H") && pair.has("S")) {
    if (userProfile.identity === "creator") return "S";
    if (values.businessModel > 80) return "H";
    return "S";
  }

  return first;
}

function determineCreatorProfile(dimensionScores, userProfile = {}, text = "") {
  const values = dimensionMapFromScores(dimensionScores);
  const profile = {
    identity: userProfile.identity || "student",
    stage: userProfile.stage || "idea",
    goal: userProfile.goal || "competition",
    riskPreference: userProfile.riskPreference || "balanced"
  };
  const missingFields = inferMissingFields(text);

  if (dimensionScores.every((item) => item.score < 40)) {
    return {
      creatorCode: "X-HX",
      creatorType: creatorTypeMap["X-HX"],
      creatorClan: creatorClanMap.X,
      spiritAnimal: spiritAnimalMap["X-HX"],
      nemesis: nemesisMap["X-HX"],
      goldenPair: goldenPairMap["X-HX"],
      isEasterEgg: true,
      missingFields,
      scores: { B: 0, H: 0, S: 0, Hot: 0, Cold: 0, Short: 0, Long: 0 }
    };
  }

  const bWeights = {
    painPoint: 0.3,
    competitiveAdvantage: 0.3,
    executionFeasibility: 0.25,
    marketSize: 0.1,
    viralityNarrative: 0.05
  };
  const hWeights = {
    businessModel: 0.35,
    marketSize: 0.3,
    executionFeasibility: 0.2,
    competitiveAdvantage: 0.1,
    viralityNarrative: 0.05
  };
  const sWeights = {
    viralityNarrative: 0.4,
    marketSize: 0.25,
    painPoint: 0.2,
    businessModel: 0.1,
    executionFeasibility: 0.05
  };

  if (missingFields.includes("competitors")) {
    bWeights.competitiveAdvantage = 0;
    bWeights.marketSize += 0.15;
  }
  if (missingFields.includes("businessModel")) {
    hWeights.businessModel = 0;
    hWeights.executionFeasibility += 0.15;
  }
  if (missingFields.includes("problem")) {
    bWeights.painPoint = 0;
  }
  if (missingFields.includes("targetUsers")) {
    sWeights.viralityNarrative = Math.max(0, sWeights.viralityNarrative - 0.1);
  }

  let bScore = weightedSum(values, bWeights);
  let hScore = weightedSum(values, hWeights);
  let sScore = weightedSum(values, sWeights);

  if (missingFields.includes("solution")) bScore -= 10;
  if (missingFields.includes("businessModel")) hScore = Math.min(hScore, 60);

  const anchorScores = { B: bScore, H: hScore, S: sScore };
  const sortedScores = Object.entries(anchorScores).sort((a, b) => b[1] - a[1]);
  let anchor = sortedScores[0][0];
  if (sortedScores[0][1] - sortedScores[1][1] < 5) {
    anchor = resolveAnchorTie(sortedScores, profile, values);
  }

  let hot = 0;
  let cold = 0;
  if (profile.riskPreference === "aggressive") {
    hot += 25;
    cold += 5;
  } else if (profile.riskPreference === "conservative") {
    hot += 5;
    cold += 25;
  } else {
    hot += 15;
    cold += 15;
  }

  if (values.viralityNarrative > 85) hot += 10;
  if (values.painPoint > 80 && values.businessModel < 55) hot += 12;
  if (values.marketSize > 85 && values.executionFeasibility < 60) hot += 8;
  if (profile.identity === "student" && profile.goal === "competition") hot += 10;
  if (values.executionFeasibility > 80 && values.businessModel > 70) cold += 12;
  if (values.competitiveAdvantage > 80 && values.marketSize < 70) cold += 8;
  if (profile.identity === "employee" && profile.goal === "startup_validation") cold += 10;
  if (profile.riskPreference === "conservative" && profile.stage === "launched") cold += 8;

  hot += Math.min(countSignalHits(text, ["风口", "快速", "爆发", "情绪", "信仰", "改变", "颠覆", "梦想", "热血", "all in"]) * 3, 15);
  cold += Math.min(countSignalHits(text, ["数据", "验证", "模型", "ROI", "精益", "对照组", "假设检验", "SOP", "流程", "理性"]) * 3, 15);

  let temp;
  if (hot > cold + 5) temp = "H";
  else if (cold > hot + 5) temp = "C";
  else if (profile.stage === "idea") temp = "H";
  else if (profile.stage === "launched") temp = "C";
  else temp = ["competition", "social_media"].includes(profile.goal) ? "H" : "C";

  let short = 0;
  let long = 0;
  const stageMap = {
    idea: [20, 5],
    prototype: [12, 12],
    launched: [5, 20]
  };
  const goalMap = {
    fundraising: [5, 20],
    startup_validation: [8, 15],
    competition: [18, 7],
    coursework: [15, 8],
    social_media: [22, 3]
  };
  const stageBase = stageMap[profile.stage] || stageMap.idea;
  const goalBase = goalMap[profile.goal] || goalMap.competition;
  short += stageBase[0] + goalBase[0];
  long += stageBase[1] + goalBase[1];

  if (values.businessModel > 75 && values.executionFeasibility > 70) short += 10;
  if (anchor === "H" && values.businessModel > 70) short += 8;
  if (["student", "small_business_owner"].includes(profile.identity)) short += 8;
  if (values.marketSize > 85 && values.businessModel < 60) long += 12;
  if (anchor === "B" && values.competitiveAdvantage > 75) long += 10;
  if (profile.identity === "founder" && profile.goal === "fundraising") long += 10;
  if (anchor === "S" && values.viralityNarrative > 80) long += 8;

  short += Math.min(countSignalHits(text, ["快速", "短期", "MVP", "验证", "试错", "跑通", "回本", "现金流", "风口期", "窗口期"]) * 3, 15);
  long += Math.min(countSignalHits(text, ["长期", "终局", "护城河", "壁垒", "复利", "五年", "十年", "基础设施", "生态", "平台化"]) * 3, 15);

  let lens;
  if (short > long + 5) lens = "S";
  else if (long > short + 5) lens = "L";
  else if (profile.riskPreference === "aggressive") lens = "L";
  else if (profile.riskPreference === "conservative") lens = "S";
  else lens = anchor === "B" ? "L" : "S";

  let creatorCode = `${anchor}-${temp}${lens}`;
  if (dimensionScores.every((item) => item.score > 80)) {
    creatorCode = values.competitiveAdvantage > values.viralityNarrative ? "B-CL" : "S-CL";
  }
  if (missingFields.length >= 3) {
    creatorCode = missingFields.includes("businessModel") ? "B-HS" : "H-HS";
  }

  return {
    creatorCode,
    creatorType: creatorTypeMap[creatorCode] || "未知人格",
    creatorClan: creatorClanMap[creatorCode[0]] || "未知族群",
    spiritAnimal: spiritAnimalMap[creatorCode] || "未知生物",
    nemesis: nemesisMap[creatorCode] || "未知天敌",
    goldenPair: goldenPairMap[creatorCode] || "未知搭档",
    isEasterEgg: false,
    missingFields,
    scores: {
      B: Math.round(bScore),
      H: Math.round(hScore),
      S: Math.round(sScore),
      Hot: hot,
      Cold: cold,
      Short: short,
      Long: long
    }
  };
}

function analyzeSingleProject(project, index, investor, userProfile) {
  const text = String(project.text || "").trim();
  const weights = normalizeWeights(investor.weights, userProfile);
  const dimensionScores = dimensions.map((dimension) => {
    const score = scoreDimension(text, dimension, investor);
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
  const overallScore = adjustOverallForMentor(baseOverallScore, dimensionScores, investor);
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
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Investor Console MVP running at http://localhost:${PORT}`);
});
