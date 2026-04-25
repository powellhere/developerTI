const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4173;
const PUBLIC_DIR = path.join(__dirname, "public");

const dimensions = [
  "marketSize",
  "painPoint",
  "businessModel",
  "competitiveAdvantage",
  "executionFeasibility",
  "viralityNarrative"
];

const dimensionLabels = {
  marketSize: "Market Size",
  painPoint: "Pain Point",
  businessModel: "Business Model",
  competitiveAdvantage: "Competitive Advantage",
  executionFeasibility: "Execution Feasibility",
  viralityNarrative: "Virality / Narrative"
};

const signals = {
  marketSize: ["market", "tam", "sam", "som", "segment", "市场", "赛道", "用户", "客户", "规模", "增长", "需求"],
  painPoint: ["pain", "problem", "urgent", "痛点", "问题", "需求", "效率", "成本", "麻烦", "刚需", "替代方案"],
  businessModel: ["revenue", "pricing", "gross margin", "ltv", "cac", "subscription", "收入", "定价", "付费", "毛利", "成本", "现金流", "商业模式"],
  competitiveAdvantage: ["moat", "data", "network effect", "patent", "brand", "ip", "护城河", "壁垒", "数据", "算法", "专利", "品牌", "网络效应"],
  executionFeasibility: ["team", "roadmap", "milestone", "operation", "sales", "团队", "路线图", "里程碑", "渠道", "销售", "运营", "资源"],
  viralityNarrative: ["viral", "story", "community", "share", "creator", "传播", "故事", "社群", "内容", "分享", "裂变", "叙事"]
};

const investors = {
  paul_graham: {
    name: "Paul Graham",
    thesis: "Make something people want, then learn faster than the market.",
    style: "短句、直接、偏创业本质，会优先追问用户是否真的想要。",
    weights: { marketSize: 0.16, painPoint: 0.25, businessModel: 0.14, competitiveAdvantage: 0.13, executionFeasibility: 0.16, viralityNarrative: 0.16 },
    bias: { painPoint: 8, executionFeasibility: 4, viralityNarrative: 3 },
    opener: "The question is not whether this sounds like a startup. The question is whether anyone badly wants it."
  },
  zhang_yiming: {
    name: "张一鸣",
    thesis: "从底层变量和长期 context 判断，而不是被表层热闹牵引。",
    style: "冷静、系统、概率化，强调同理心、延迟满足和先小验证。",
    weights: { marketSize: 0.18, painPoint: 0.2, businessModel: 0.14, competitiveAdvantage: 0.17, executionFeasibility: 0.19, viralityNarrative: 0.12 },
    bias: { painPoint: 5, competitiveAdvantage: 5, executionFeasibility: 6 },
    opener: "先把表层概念拿掉，看底层问题是否真实、长期、可验证。"
  },
  karpathy: {
    name: "Karpathy",
    thesis: "Build to understand; reliability matters after the demo works.",
    style: "工程化、口语化，会区分探索原型和可部署系统。",
    weights: { marketSize: 0.13, painPoint: 0.16, businessModel: 0.1, competitiveAdvantage: 0.18, executionFeasibility: 0.25, viralityNarrative: 0.18 },
    bias: { competitiveAdvantage: 5, executionFeasibility: 8, viralityNarrative: 3 },
    opener: "imo, this is promising only if you can build the smallest version and inspect where it breaks."
  },
  ilya: {
    name: "Ilya Sutskever",
    thesis: "Research taste, compression, safety, and depth over noisy speed.",
    style: "克制、审慎、重视研究品味和能力边界，不轻易给绝对判断。",
    weights: { marketSize: 0.13, painPoint: 0.14, businessModel: 0.09, competitiveAdvantage: 0.25, executionFeasibility: 0.18, viralityNarrative: 0.21 },
    bias: { competitiveAdvantage: 8, executionFeasibility: 3, viralityNarrative: 4 },
    opener: "It may be important. But importance is not the same as being ready."
  },
  mrbeast: {
    name: "MrBeast",
    thesis: "Simple concept, extreme execution, strong hook, measurable retention.",
    style: "强传播导向，关注一句话吸引力、视觉反差、复投飞轮。",
    weights: { marketSize: 0.14, painPoint: 0.13, businessModel: 0.14, competitiveAdvantage: 0.11, executionFeasibility: 0.15, viralityNarrative: 0.33 },
    bias: { viralityNarrative: 12, marketSize: 3 },
    opener: "If people cannot understand why this is exciting in one sentence, the idea is not ready."
  },
  trump: {
    name: "特朗普",
    thesis: "Deal, leverage, attention, winner narrative.",
    style: "高判断感、强对比、交易视角，关注注意力和谈判筹码。",
    weights: { marketSize: 0.22, painPoint: 0.13, businessModel: 0.22, competitiveAdvantage: 0.14, executionFeasibility: 0.12, viralityNarrative: 0.17 },
    bias: { marketSize: 6, businessModel: 6, viralityNarrative: 6 },
    opener: "This either looks like a strong deal or it does not. Right now the leverage is the whole game."
  },
  jobs: {
    name: "乔布斯",
    thesis: "Focus, taste, end-to-end product clarity.",
    style: "产品审美极强，二元判断明显，重视一句话定义和端到端体验。",
    weights: { marketSize: 0.14, painPoint: 0.18, businessModel: 0.1, competitiveAdvantage: 0.2, executionFeasibility: 0.16, viralityNarrative: 0.22 },
    bias: { painPoint: 4, competitiveAdvantage: 7, viralityNarrative: 6 },
    opener: "The product needs one sharp reason to exist. If it has five reasons, it has none."
  },
  musk: {
    name: "马斯克",
    thesis: "First principles, asymptotic limits, delete and ship.",
    style: "工程化、挑衅、速度优先，会质疑需求并要求快速制造。",
    weights: { marketSize: 0.22, painPoint: 0.13, businessModel: 0.09, competitiveAdvantage: 0.22, executionFeasibility: 0.2, viralityNarrative: 0.14 },
    bias: { marketSize: 6, competitiveAdvantage: 8, executionFeasibility: 6 },
    opener: "Wrong question. The first question is: what assumption can we delete?"
  }
};

const profileAdjustments = {
  identity: {
    student: { executionFeasibility: -0.03, viralityNarrative: 0.03 },
    founder: { businessModel: 0.03, executionFeasibility: 0.03, viralityNarrative: -0.02 },
    employee: { executionFeasibility: 0.04, marketSize: -0.01 },
    creator: { viralityNarrative: 0.05, painPoint: 0.02, businessModel: -0.02 },
    small_business_owner: { businessModel: 0.05, executionFeasibility: 0.02, viralityNarrative: -0.02 }
  },
  stage: {
    idea: { painPoint: 0.03, viralityNarrative: 0.03, executionFeasibility: -0.04 },
    prototype: { executionFeasibility: 0.02, painPoint: 0.02 },
    launched: { businessModel: 0.05, executionFeasibility: 0.04, viralityNarrative: -0.03 }
  },
  goal: {
    fundraising: { marketSize: 0.05, competitiveAdvantage: 0.04, businessModel: 0.02 },
    coursework: { executionFeasibility: 0.03, painPoint: 0.02 },
    competition: { viralityNarrative: 0.05, competitiveAdvantage: 0.02 },
    startup_validation: { painPoint: 0.05, businessModel: 0.03 },
    social_media: { viralityNarrative: 0.08, businessModel: -0.02 }
  },
  riskPreference: {
    conservative: { executionFeasibility: 0.05, businessModel: 0.04, marketSize: -0.02 },
    balanced: {},
    aggressive: { marketSize: 0.04, competitiveAdvantage: 0.03, viralityNarrative: 0.04, executionFeasibility: -0.02 }
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
  const structureBonus = /#+\s|目标|问题|方案|商业模式|竞品|风险|roadmap|milestone/i.test(text) ? 6 : 0;
  const personaBonus = investor.bias[dimension] || 0;
  return Math.max(18, Math.min(96, Math.round(34 + hits * 7 + lengthBonus + structureBonus + personaBonus)));
}

function ratingForScore(score) {
  if (score >= 90) return "夯";
  if (score >= 75) return "顶级";
  if (score >= 60) return "人上人";
  if (score >= 40) return "npc";
  return "拉完了";
}

function commentForDimension(dimension, score) {
  const label = dimensionLabels[dimension];
  if (score >= 80) return `${label} 证据较强，已经能支撑下一轮 validation。`;
  if (score >= 60) return `${label} 有基本轮廓，但还需要更具体的数据或实验。`;
  if (score >= 40) return `${label} 偏概念化，当前证据不足以支撑强判断。`;
  return `${label} 明显缺失，需要优先补充，否则会拖低整体评级。`;
}

function extractProjectName(project, index) {
  const text = project.text || "";
  const heading = text.match(/^\s*#\s+(.+)$/m);
  if (heading) return heading[1].trim().slice(0, 80);
  const firstLine = text.split(/\n/).map((line) => line.trim()).find((line) => line.length > 4);
  return (project.name || firstLine || `Project ${index + 1}`).slice(0, 80);
}

function buildRisks(scores) {
  return [...scores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => {
      if (item.key === "marketSize") return "Market Risk: 目标市场、early adopter 或购买人定义不够尖锐。";
      if (item.key === "painPoint") return "Pain Point Risk: 用户痛点强度还没有被访谈、预售或使用数据证明。";
      if (item.key === "businessModel") return "Business Model Risk: 定价、毛利、CAC 或回本周期仍然模糊。";
      if (item.key === "competitiveAdvantage") return "Moat Risk: 差异化容易被复制，需要更明确的数据、品牌、技术或渠道壁垒。";
      if (item.key === "executionFeasibility") return "Execution Risk: milestone、团队分工、资源约束和 go-to-market 路径需要细化。";
      return "Narrative Risk: 传播钩子不够清晰，用户不一定愿意主动分享。";
    });
}

function buildNextActions(scores, userProfile) {
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0]?.key;
  const actions = {
    marketSize: "把目标用户缩到一个最窄 ICP，列出 20 个可触达对象。",
    painPoint: "做 10 次 problem interview，验证用户是否已经在为该问题付出时间或金钱。",
    businessModel: "设计一个最小付费测试：预售、订金、waitlist 或手动服务报价。",
    competitiveAdvantage: "写出 3 个竞品无法快速复制的资产，并说明形成路径。",
    executionFeasibility: "拆成 2 周 validation sprint，只保留一个核心 workflow。",
    viralityNarrative: "用一句话重写项目钩子，并测试 5 个标题/卡片版本。"
  };

  return [
    actions[weakest] || actions.painPoint,
    userProfile.goal === "fundraising"
      ? "补充融资视角材料：TAM、traction、unit economics 和 use of funds。"
      : "先验证 single riskiest assumption，再决定是否扩功能。",
    "生成下一版计划书时，把缺失字段写成可测试假设，而不是愿景描述。"
  ];
}

function creatorType(report) {
  const top = [...report.dimensionScores].sort((a, b) => b.score - a.score)[0]?.key;
  if (top === "viralityNarrative") return "Narrative Founder";
  if (top === "businessModel") return "Cashflow Realist";
  if (top === "competitiveAdvantage") return "Moat Builder";
  if (top === "executionFeasibility") return "Sprint Operator";
  if (top === "marketSize") return "Moonshot Builder";
  return "Problem Hunter";
}

function analyzeSingleProject(project, index, investor, userProfile) {
  const text = String(project.text || "").trim();
  const weights = normalizeWeights(investor.weights, userProfile);
  const dimensionScores = dimensions.map((dimension) => ({
    key: dimension,
    label: dimensionLabels[dimension],
    score: scoreDimension(text, dimension, investor),
    weight: Number(weights[dimension].toFixed(3)),
    comment: commentForDimension(dimension, scoreDimension(text, dimension, investor))
  }));

  const overallScore = Math.round(
    dimensionScores.reduce((sum, item) => sum + item.score * weights[item.key], 0)
  );
  const rating = ratingForScore(overallScore);
  const projectName = extractProjectName(project, index);
  const strongest = [...dimensionScores].sort((a, b) => b.score - a.score)[0];
  const weakest = [...dimensionScores].sort((a, b) => a.score - b.score)[0];

  return {
    projectName,
    personaName: investor.name,
    personaThesis: investor.thesis,
    overallScore,
    rating,
    oneLineVerdict: `${rating}：${projectName} 的最强点是 ${strongest.label}，最弱点是 ${weakest.label}。`,
    styleComment: `${investor.opener} ${investor.style}`,
    dimensionScores,
    keyRisks: buildRisks(dimensionScores),
    nextActions: buildNextActions(dimensionScores, userProfile),
    strongestPoint: strongest.label,
    weakestPoint: weakest.label
  };
}

function buildShareCard(report, investor) {
  return {
    projectName: report.projectName,
    investorPersona: investor.name,
    rating: report.rating,
    score: report.overallScore,
    creatorType: creatorType(report),
    tagline: `${report.rating}项目：${report.strongestPoint}能打，${report.weakestPoint}需要补课。`,
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
  const investor = investors[payload.investor] || investors.paul_graham;
  const userProfile = payload.userProfile || {};
  const projects = normalizeProjects(payload);

  if (!projects.length) {
    const error = new Error("请至少上传或粘贴一个项目计划书。");
    error.status = 400;
    throw error;
  }

  const tooShort = projects.find((project) => project.text.trim().length < 120);
  if (tooShort) {
    const error = new Error(`项目「${tooShort.name}」内容太短，请至少提供 120 个字符。`);
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
      rating: report.rating,
      oneLineVerdict: report.oneLineVerdict,
      strongestPoint: report.strongestPoint,
      weakestPoint: report.weakestPoint
    }));
  const topReport = reports.find((report) => report.projectName === ranking[0].projectName) || reports[0];

  return {
    investor: investor.name,
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
