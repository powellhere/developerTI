const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4173;
const PUBLIC_DIR = path.join(__dirname, "public");

const investors = {
  trump: {
    name: "Donald Trump",
    thesis: "品牌势能、媒体注意力、交易杠杆",
    lens: "会先问这个项目能不能被一句强势口号卖出去，其次才看执行细节。",
    weights: { market: 1.2, defensibility: 0.8, finance: 1, execution: 1, mvp: 1 }
  },
  musk: {
    name: "Elon Musk",
    thesis: "技术第一性原理、极限效率、垂直整合",
    lens: "会拆掉所有假设，追问技术瓶颈、10x 改进和最快原型路径。",
    weights: { market: 1, defensibility: 1.25, finance: 0.8, execution: 1.15, mvp: 1.2 }
  },
  buffett: {
    name: "Warren Buffett",
    thesis: "现金流、护城河、长期可理解性",
    lens: "会避开叙事泡沫，集中看 unit economics、客户粘性和长期利润质量。",
    weights: { market: 1.05, defensibility: 1.3, finance: 1.25, execution: 0.9, mvp: 0.85 }
  },
  cuban: {
    name: "Mark Cuban",
    thesis: "销售速度、运营执行、明确客户痛点",
    lens: "会快速判断你是否真的懂客户，以及本周能不能卖出第一个版本。",
    weights: { market: 1.15, defensibility: 0.9, finance: 1, execution: 1.25, mvp: 1.15 }
  },
  wood: {
    name: "Cathie Wood",
    thesis: "disruptive innovation、规模曲线、未来市场",
    lens: "会偏好大趋势和指数级增长，但会追问采用曲线是否被证据支持。",
    weights: { market: 1.25, defensibility: 1.05, finance: 0.85, execution: 0.95, mvp: 1.05 }
  },
  thiel: {
    name: "Peter Thiel",
    thesis: "垄断、秘密、从 0 到 1",
    lens: "会问你知道什么别人不知道，以及为什么这个市场最后只会剩少数赢家。",
    weights: { market: 0.95, defensibility: 1.45, finance: 0.9, execution: 1, mvp: 0.95 }
  },
  son: {
    name: "Masayoshi Son",
    thesis: "超大 TAM、平台化、资本加速",
    lens: "会寻找能被资本迅速放大的网络效应，但也会惩罚含糊的规模假设。",
    weights: { market: 1.45, defensibility: 1.05, finance: 0.8, execution: 0.9, mvp: 0.95 }
  },
  dalio: {
    name: "Ray Dalio",
    thesis: "系统性风险、因果链、压力测试",
    lens: "会把计划当作一套经济机器，检查变量、反馈环和下行情境。",
    weights: { market: 1, defensibility: 1, finance: 1.2, execution: 1.1, mvp: 0.9 }
  },
  chamath: {
    name: "Chamath Palihapitiya",
    thesis: "叙事资本、用户增长、市场窗口",
    lens: "会看故事能否吸引资本和用户，但会挑战留存与真实价值创造。",
    weights: { market: 1.25, defensibility: 0.9, finance: 0.9, execution: 1.05, mvp: 1.15 }
  }
};

const signals = {
  market: ["market", "tam", "sam", "som", "市场", "用户", "客户", "痛点", "需求", "赛道", "增长", "规模"],
  defensibility: ["moat", "ip", "patent", "data", "network effect", "护城河", "专利", "数据", "壁垒", "网络效应", "算法"],
  finance: ["revenue", "gross margin", "ltv", "cac", "pricing", "现金流", "收入", "毛利", "成本", "定价", "回本"],
  execution: ["team", "roadmap", "go-to-market", "sales", "团队", "路线图", "渠道", "销售", "运营", "里程碑"],
  mvp: ["mvp", "prototype", "pilot", "experiment", "原型", "试点", "验证", "实验", "访谈", "demo"]
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
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
      if (body.length > 1_500_000) {
        reject(new Error("Plan text is too large for this MVP."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function scoreDimension(text, dimension, weight) {
  const lower = text.toLowerCase();
  const hits = signals[dimension].reduce((count, keyword) => {
    return count + (lower.includes(keyword.toLowerCase()) ? 1 : 0);
  }, 0);
  const densityBonus = Math.min(20, Math.floor(text.length / 1400));
  return Math.max(18, Math.min(95, Math.round((28 + hits * 11 + densityBonus) * weight)));
}

function sentenceForScore(label, score) {
  if (score >= 78) return `${label} 已经有较清晰证据，但仍需要用真实客户数据验证。`;
  if (score >= 55) return `${label} 有基本轮廓，不过关键假设仍偏叙述化。`;
  return `${label} 证据不足，当前更像 idea statement，而不是可投资计划。`;
}

function buildMvpLogic(text) {
  const hasCustomer = /客户|用户|interview|访谈|pain|痛点/i.test(text);
  const hasRevenue = /收入|定价|pricing|revenue|付费|订单/i.test(text);
  const hasTech = /算法|模型|平台|api|app|软件|hardware|ai|数据/i.test(text);

  const firstUser = hasCustomer ? "锁定一个最窄 customer segment，访谈 10-15 个高痛点用户。" : "先定义一个最窄 customer segment，不要从泛市场开始。";
  const proof = hasRevenue ? "用 landing page + 预售/付费意向收集验证 willingness to pay。" : "用 concierge MVP 手动交付一次核心价值，再测试是否有人愿意付费。";
  const build = hasTech ? "只开发一个核心 workflow：上传输入、生成结果、人工校验、导出结论。" : "先不用完整产品，使用表单、人工服务和结果模板完成闭环。";

  return [
    firstUser,
    proof,
    build,
    "设置 2 周 validation sprint：目标是 5 个有效试用、2 个付费或明确采购承诺。",
    "若转化低于目标，优先改 ICP 和价值主张，而不是加功能。"
  ];
}

function analyzePlan(planText, investorKey) {
  const investor = investors[investorKey] || investors.musk;
  const text = (planText || "").trim();
  const dimensions = Object.fromEntries(
    Object.keys(signals).map((dimension) => [
      dimension,
      scoreDimension(text, dimension, investor.weights[dimension] || 1)
    ])
  );
  const overall = Math.round(
    dimensions.market * 0.24 +
      dimensions.defensibility * 0.24 +
      dimensions.finance * 0.2 +
      dimensions.execution * 0.17 +
      dimensions.mvp * 0.15
  );

  const weak = Object.entries(dimensions)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([key]) => key);

  const dimensionLabels = {
    market: "Market",
    defensibility: "Defensibility",
    finance: "Unit economics",
    execution: "Execution",
    mvp: "MVP validation"
  };

  return {
    investor: investor.name,
    thesis: investor.thesis,
    lens: investor.lens,
    overall,
    verdict:
      overall >= 76
        ? "可进入强验证阶段，但不应直接扩张。"
        : overall >= 55
          ? "具备早期探索价值，但投资材料还不足以支撑严肃尽调。"
          : "当前不适合融资，应该先回到 problem-solution fit。", 
    scores: dimensions,
    critique: Object.entries(dimensions).map(([key, score]) => ({
      title: dimensionLabels[key],
      score,
      comment: sentenceForScore(dimensionLabels[key], score)
    })),
    redFlags: weak.map((key) => {
      if (key === "market") return "目标市场和 early adopter 描述不够尖锐，TAM 叙事可能掩盖真实购买人。";
      if (key === "defensibility") return "护城河证据弱，竞争者复制成本和数据优势需要更具体。";
      if (key === "finance") return "商业模型缺少 CAC、毛利、回本周期或定价验证，无法判断 unit economics。";
      if (key === "execution") return "执行路径缺少 milestone、owner 和 go-to-market 细节。";
      return "MVP 假设没有转化为可测实验，容易变成长期开发而非快速验证。";
    }),
    mvpLogic: buildMvpLogic(text),
    nextQuestions: [
      "谁是最愿意立刻试用或付费的 20 个具体客户？",
      "他们现在用什么替代方案，替代成本是多少？",
      "两周内能验证的 single riskiest assumption 是什么？"
    ]
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
      const text = String(payload.planText || "");
      const investorKey = String(payload.investor || "musk");

      if (text.trim().length < 120) {
        sendJson(res, 400, { error: "计划书内容太短。请上传或粘贴至少 120 个字符。" });
        return;
      }

      sendJson(res, 200, analyzePlan(text, investorKey));
    } catch (error) {
      sendJson(res, 500, { error: error.message || "Analysis failed." });
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
  console.log(`Win95 Investor MVP running at http://localhost:${PORT}`);
});
