const investors = [
  { id: "paul_graham", name: "Paul Graham", domain: "产品 / 用户 / MVP", tag: "先找真实需求" },
  { id: "zhang_yiming", name: "张一鸣", domain: "产品 / 反馈 / 系统", tag: "看反馈闭环" },
  { id: "karpathy", name: "Karpathy", domain: "工程 / Demo / 调试", tag: "先跑通流程" },
  { id: "kris_jenner", name: "Kris Jenner", domain: "品牌 / IP / 传播控制", tag: "Momager mode" },
  { id: "mrbeast", name: "MrBeast", domain: "钩子 / 留存 / 传播", tag: "三秒抓住人" },
  { id: "trump", name: "特朗普", domain: "包装 / 展示 / 注意力", tag: "主张要够强" },
  { id: "jobs", name: "乔布斯", domain: "聚焦 / 审美 / 体验", tag: "删到足够锋利" },
  { id: "musk", name: "马斯克", domain: "制造 / 压缩 / 发布", tag: "删需求，快发布" }
];

const investorGrid = document.querySelector("#investorGrid");
const investorTemplate = document.querySelector("#investorTemplate");
const planFile = document.querySelector("#planFile");
const planText = document.querySelector("#planText");
const analyzeBtn = document.querySelector("#analyzeBtn");
const report = document.querySelector("#report");
const shareCard = document.querySelector("#shareCard");
const statusLine = document.querySelector("#status");
const loadingPanel = document.querySelector("#loadingPanel");
const loadingText = document.querySelector("#loadingText");
const downloadCardBtn = document.querySelector("#downloadCardBtn");
const projectStack = document.querySelector("#projectStack");
const resultDeck = document.querySelector(".result-deck");
const toleranceInput = document.querySelector("#tolerance");
const toleranceValue = document.querySelector("#toleranceValue");

const investorSoundFiles = {
  paul_graham: "paul.mp3",
  zhang_yiming: "张一鸣.mp3",
  karpathy: "卡帕西.mp3",
  kris_jenner: "kris jenner.mp3",
  mrbeast: "mrbeast.mp3",
  trump: "trump.mp3",
  jobs: "jobs.mp3",
  musk: "elonmusk.mp3"
};

const investorSoundCache = new Map();
let soundUnlocked = false;

let selectedInvestor = "paul_graham";
let latestShareCard = null;
let uploadedProjects = [];
let printTimer = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(text) {
  statusLine.textContent = text;
}

function setLoading(isLoading, text = "正在解析项目...") {
  loadingPanel.classList.toggle("hidden", !isLoading);
  loadingPanel.setAttribute("aria-hidden", String(!isLoading));
  loadingText.textContent = text;
}

function getUserProfile() {
  return { tolerance: Number(toleranceInput.value) };
}

function toleranceLabel(value) {
  const score = Number(value);
  if (score <= 20) return "地狱模式";
  if (score <= 45) return "严格模式";
  if (score >= 80) return "温柔模式";
  if (score >= 60) return "鼓励模式";
  return "标准模式";
}

function updateToleranceLabel() {
  toleranceValue.textContent = toleranceLabel(toleranceInput.value);
  toleranceInput.style.setProperty("--tolerance", `${toleranceInput.value}%`);
}

function renderProjectStack() {
  if (!uploadedProjects.length) {
    projectStack.innerHTML = "";
    return;
  }
  projectStack.innerHTML = uploadedProjects
    .map(
      (project, index) => `
        <div class="project-chip">
          <span>${index + 1}</span>
          <strong>${escapeHtml(project.name)}</strong>
          <small>${project.text.length} 字</small>
        </div>
      `
    )
    .join("");
}

function getInvestorSoundSrc(investorId) {
  const fileName = investorSoundFiles[investorId];
  if (!fileName) return "";
  const basePath = window.location.protocol === "file:" ? "../sound effect/" : "/sound-effect/";
  return `${basePath}${encodeURIComponent(fileName)}`;
}

function getInvestorAudio(investorId) {
  const src = getInvestorSoundSrc(investorId);
  if (!src) return null;

  let audio = investorSoundCache.get(investorId);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = 0.52;
    investorSoundCache.set(investorId, audio);
  }

  return audio;
}

function unlockInvestorSounds() {
  soundUnlocked = true;
  Object.keys(investorSoundFiles).forEach((investorId) => {
    const audio = getInvestorAudio(investorId);
    if (audio) audio.load();
  });
}

function playInvestorSound(investorId) {
  const audio = getInvestorAudio(investorId);
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
  audio.play().catch(() => {
    soundUnlocked = false;
    setStatus("浏览器拦截了 hover 音效：先点击一次导师卡片，之后悬停就会发声。");
  });
}

function splitTextProjects(text) {
  const chunks = text
    .split(/\n\s*---PROJECT---\s*\n/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length <= 1) {
    return text.trim() ? [{ name: "Pasted Project", text: text.trim() }] : [];
  }

  return chunks.map((chunk, index) => ({
    name: `Pasted Project ${index + 1}`,
    text: chunk
  }));
}

function collectProjects() {
  if (uploadedProjects.length) return uploadedProjects;
  return splitTextProjects(planText.value);
}

function renderInvestors() {
  investorGrid.innerHTML = "";
  investors.forEach((investor) => {
    const node = investorTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.investor = investor.id;
    node.dataset.avatar = investor.id;
    node.setAttribute("aria-pressed", String(investor.id === selectedInvestor));
    node.querySelector(".investor-name").textContent = investor.name;
    node.querySelector(".investor-domain").textContent = investor.domain;
    node.querySelector(".investor-tag").textContent = investor.tag;
    node.addEventListener("click", () => {
      unlockInvestorSounds();
      selectedInvestor = investor.id;
      document.querySelectorAll(".investor-card").forEach((card) => {
        card.setAttribute("aria-pressed", String(card.dataset.investor === selectedInvestor));
      });
      setStatus(`已选择：${investor.name}`);
      playInvestorSound(investor.id);
    });
    node.addEventListener("pointerenter", () => {
      if (soundUnlocked) playInvestorSound(investor.id);
    });
    node.addEventListener("focus", () => {
      if (soundUnlocked) playInvestorSound(investor.id);
    });
    investorGrid.appendChild(node);
  });
}

function scoreColor(score) {
  if (score >= 88) return "var(--rank-hot)";
  if (score >= 76) return "var(--rank-good)";
  if (score >= 62) return "var(--rank-mid)";
  if (score >= 45) return "var(--rank-low)";
  return "var(--rank-bad)";
}

const dimensionMeta = {
  logicalCoherence: {
    title: "逻辑自洽度",
    focus: "产品承诺、目标用户、功能实现和不做事项是否互相咬合。",
    high: "逻辑链条较完整，文档不是只堆功能。",
    low: "承诺、用户和实现之间仍有断点。",
    action: "补一段产品承诺与 must-have / cut list 的对应关系。"
  },
  mvpScope: {
    title: "MVP 范围控制",
    focus: "第一版是否足够小，是否能在时间约束内完成。",
    high: "范围有收敛，适合先做 first playable。",
    low: "功能集合偏大，容易变成半成品平台。",
    action: "删除 nice-to-have，只保留一个 core loop 和一个结果页。"
  },
  demoFeasibility: {
    title: "Demo 可跑通性",
    focus: "是否能做出可展示、可体验、可复现的 demo。",
    high: "demo 路径比较可控，适合进入实现。",
    low: "工程路径和展示脚本仍有断点。",
    action: "先写 30-60 秒 demo script，再倒推必须跑通的功能。"
  },
  userPain: {
    title: "用户痛点强度",
    focus: "是否有具体 first user、具体场景和具体痛点。",
    high: "痛点描述有对象、有场景、有立即收益。",
    low: "目标用户和收益还偏泛，需要压到具体场景。",
    action: "定义一个 first user，并写清楚他为什么现在就需要这个结果。"
  },
  vibeIdentity: {
    title: "Vibe 体验辨识度",
    focus: "项目是否有明确情绪钩子、体验性格和结果记忆点。",
    high: "体验辨识度较强，用户容易记住。",
    low: "项目看起来像普通工具，情绪价值不够明显。",
    action: "强化一个可感知的结果状态或情绪化反馈。"
  },
  shareReuse: {
    title: "传播与复用性",
    focus: "是否有被转发、截图、复用或二次体验的动机。",
    high: "具备传播入口，可以围绕结果卡继续强化。",
    low: "缺少用户主动分享或复用的理由。",
    action: "给结果增加可比较、可晒、可复玩的机制。"
  }
};

function scoreBand(score) {
  if (score >= 80) return "强";
  if (score >= 62) return "可用";
  if (score >= 45) return "偏弱";
  return "缺失";
}

function renderDimensionRows(dimensionScores) {
  return dimensionScores
    .map((item) => {
      const meta = dimensionMeta[item.key] || {
        title: item.label,
        focus: "该维度用于判断当前 MVP 是否适合进入下一轮。",
        high: "该维度表现较好。",
        low: "该维度需要继续补充。",
        action: "补充更具体的证据和下一步动作。"
      };
      return `
        <div class="dimension-row">
          <div class="dimension-copy">
            <div class="dimension-title-line">
              <strong>${escapeHtml(meta.title)}</strong>
              <span>${escapeHtml(item.label)}</span>
            </div>
            <p>${escapeHtml(item.comment)}</p>
            <dl class="dimension-detail-grid">
              <div><dt>关注点</dt><dd>${escapeHtml(meta.focus)}</dd></div>
              <div><dt>当前判断</dt><dd>${escapeHtml(item.score >= 70 ? meta.high : meta.low)}</dd></div>
              <div><dt>下一步</dt><dd>${escapeHtml(meta.action)}</dd></div>
              <div><dt>权重</dt><dd>${Math.round((item.weight || 0) * 100)}%</dd></div>
            </dl>
          </div>
          <div class="score-meter" style="--score:${item.score}; --score-color:${scoreColor(item.score)}">
            <span>${item.score}</span>
            <em>${scoreBand(item.score)}</em>
            <i></i>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderRanking(ranking) {
  if (!ranking || ranking.length <= 1) return "";
  return `
    <section class="ranking-board">
      <h3>项目从夯到拉排行</h3>
      ${ranking
        .map(
          (item, index) => `
            <div class="rank-row">
              <span class="rank-index">#${index + 1}</span>
              <div>
                <strong>${escapeHtml(item.projectName)}</strong>
                <p>${escapeHtml(item.oneLineVerdict)}</p>
              </div>
              <span class="rank-grade" style="--badge-color:${scoreColor(item.overallScore)}">${escapeHtml(item.hypeRank)} ${item.overallScore}</span>
            </div>
          `
        )
        .join("")}
    </section>
  `;
}

function renderReport(payload) {
  const { report: reportData, shareCard: card, ranking } = payload;
  const critique = reportData.critique || {
    currentProductOneLiner: card.oneLiner || `${reportData.projectName} 是一个待诊断的 MVP 项目。`,
    overallDiagnosis: reportData.oneLineVerdict || "当前项目已经完成基础评分，但需要重启本地 server 获取完整 critique 字段。",
    topCritique: card.mainCritique || "当前最需要检查的是目标用户、核心交互和 demo 约束是否足够具体。",
    targetUserDiagnosis: "目标用户需要进一步压缩到一个 first user，而不是泛泛描述所有潜在用户。",
    problemDiagnosis: "问题需要写成具体场景中的困难，而不是功能愿景。",
    coreFlowCritique: "建议核心流程压缩为：输入项目 -> 选择导师 -> 生成诊断 -> 得到下一步清单。",
    firstPlayableAssessment: "第一版应优先跑通一个可演示闭环，不要追求完整平台。",
    scopeCutSuggestions: ["暂缓登录、历史记录、多轮问答和复杂看板，先保证 critique report 可用。"]
  };
  latestShareCard = card;
  const printDuration = Math.min(2.5, Math.max(1.8, 1.8 + JSON.stringify(payload).length / 9000));

  report.classList.remove("empty", "receipt-printing");
  report.style.setProperty("--print-duration", `${printDuration.toFixed(2)}s`);
  resultDeck.classList.remove("printer-active", "printer-printing");
  void resultDeck.offsetWidth;
  resultDeck.classList.add("printer-printing");
  window.clearTimeout(printTimer);
  printTimer = window.setTimeout(() => {
    resultDeck.classList.remove("printer-printing");
  }, Math.round(printDuration * 1000 + 520));
  void report.offsetWidth;
  report.classList.add("receipt-printing");
  report.innerHTML = `
    <div class="receipt-paper">
      <div class="receipt-meta">
        <span>DEVTI-PRINTER</span>
        <span>PRINTING REPORT...</span>
      </div>
      <header class="report-header">
        <div>
          <p class="terminal-label">MVP 锐评报告</p>
          <h2>${escapeHtml(reportData.projectName)}</h2>
        </div>
        <div class="grade-badge" style="--badge-color:${scoreColor(reportData.overallScore)}">
          <span>${escapeHtml(reportData.hypeRank)}</span>
          <strong>${reportData.overallScore}</strong>
        </div>
      </header>

      <section class="verdict-box">
        <h3>${escapeHtml(reportData.mentorName)} 锐评</h3>
        <p>${escapeHtml(reportData.oneLineVerdict)}</p>
        <p><strong>MVP 准备度:</strong> ${escapeHtml(reportData.status)}</p>
        <p>${escapeHtml(reportData.styleComment)}</p>
      </section>

      <section class="verdict-box">
        <h3>产品诊断</h3>
        <p><strong>一句话定位:</strong> ${escapeHtml(critique.currentProductOneLiner)}</p>
        <p><strong>整体判断:</strong> ${escapeHtml(critique.overallDiagnosis)}</p>
        <p><strong>核心问题:</strong> ${escapeHtml(critique.topCritique)}</p>
      </section>

      ${renderRanking(ranking)}

      <section class="dimension-list">
        <h3>六维度打分细节</h3>
        ${renderDimensionRows(reportData.dimensionScores)}
      </section>

      <section class="two-column-report">
        <div>
          <h3>核心锐评</h3>
          <ul>
            <li>${escapeHtml(critique.targetUserDiagnosis)}</li>
            <li>${escapeHtml(critique.problemDiagnosis)}</li>
            <li>${escapeHtml(critique.coreFlowCritique)}</li>
            <li>${escapeHtml(critique.firstPlayableAssessment)}</li>
          </ul>
        </div>
        <div>
          <h3>Scope 裁剪</h3>
          <ul>${critique.scopeCutSuggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </section>

      <section class="two-column-report">
        <div>
          <h3>产品风险</h3>
          <ul>${reportData.keyRisks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div>
          <h3>下一轮迭代计划</h3>
          <ol>${reportData.nextActions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
        </div>
      </section>

      <p class="disclaimer">该结果是 style-inspired product critique，不代表相关人物本人观点，也不是投资建议。</p>
    </div>
  `;

  shareCard.classList.remove("hidden");
  shareCard.innerHTML = `
    <p class="terminal-label">项目诊断卡片</p>
    <div class="share-art-placeholder">
      <span>美术占位符</span>
      <strong>${escapeHtml(card.hypeRank)}</strong>
      <small>${escapeHtml(card.assetPlaceholder)}</small>
    </div>
    <h3>${escapeHtml(card.projectName)}</h3>
    <div class="share-rating">${escapeHtml(card.hypeRank)} <span>${card.score}/100 · ${escapeHtml(card.status)}</span></div>
    <p class="creator-type">${escapeHtml(card.mentor)}</p>
    <p class="tagline">${escapeHtml(card.oneLiner)}</p>
    <div class="trait-grid">
      <span>核心问题：${escapeHtml(card.mainCritique)}</span>
      <span>下一步：${escapeHtml(card.nextStep)}</span>
      <span>最强项：${escapeHtml(card.topTrait)}</span>
      <span>待修正：${escapeHtml(card.weakness)}</span>
    </div>
  `;
  downloadCardBtn.classList.remove("hidden");
}

function renderError(message) {
  report.classList.remove("empty", "receipt-printing");
  resultDeck.classList.remove("printer-active", "printer-printing");
  report.innerHTML = `
    <section class="verdict-box error">
      <h2>分析失败</h2>
      <p>${escapeHtml(message)}</p>
    </section>
  `;
}

async function analyze() {
  const projects = collectProjects();
  if (!projects.length || projects.some((project) => project.text.trim().length < 120)) {
    setStatus("错误：内容太短");
    renderError("每个 idea / MVP brief 都需要至少 120 个字符。多项目请上传多个文件，或在文本框中用 ---PROJECT--- 分隔。");
    return;
  }

  setStatus("分析中...");
  setLoading(true, "热敏打印机预热中...");
  analyzeBtn.disabled = true;
  resultDeck.classList.remove("printer-printing");
  resultDeck.classList.add("printer-active");
  report.classList.remove("receipt-printing");
  shareCard.classList.add("hidden");
  downloadCardBtn.classList.add("hidden");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentor: selectedInvestor,
        projects,
        userProfile: getUserProfile()
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "分析失败。");
    renderReport(payload);
    setStatus("报告已生成");
  } catch (error) {
    setStatus("错误");
    renderError(error.message);
  } finally {
    setLoading(false);
    analyzeBtn.disabled = false;
  }
}

function drawPixelCard(card) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#101018";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2b3042";
  ctx.fillRect(50, 50, 980, 1250);
  ctx.fillStyle = "#d8e06f";
  ctx.fillRect(86, 86, 908, 1178);
  ctx.fillStyle = "#171a22";
  ctx.fillRect(112, 112, 856, 1126);

  ctx.fillStyle = "#7cff70";
  ctx.font = "48px monospace";
  ctx.fillText("MVP 锐评结果", 160, 205);

  ctx.fillStyle = "#fff8d6";
  ctx.font = "72px monospace";
  wrapCanvasText(ctx, card.projectName, 160, 330, 760, 86);

  ctx.fillStyle = "#ffcc33";
  ctx.font = "92px monospace";
  wrapCanvasText(ctx, card.hypeRank, 160, 570, 760, 96);

  ctx.fillStyle = "#ffffff";
  ctx.font = "54px monospace";
  ctx.fillText(`${card.score}/100`, 650, 585);

  ctx.fillStyle = "#66d9ff";
  ctx.font = "46px monospace";
  wrapCanvasText(ctx, `${card.status} / ${card.mentor}`, 160, 730, 760, 56);

  ctx.strokeStyle = "#66d9ff";
  ctx.lineWidth = 10;
  ctx.strokeRect(160, 790, 760, 140);
  ctx.fillStyle = "#66d9ff";
  ctx.font = "34px monospace";
  ctx.fillText(card.assetPlaceholder || "ART_PLACEHOLDER", 190, 870);

  ctx.fillStyle = "#ffffff";
  ctx.font = "42px monospace";
  wrapCanvasText(ctx, card.oneLiner, 160, 1010, 760, 58);

  ctx.fillStyle = "#ff5f7a";
  ctx.font = "36px monospace";
  wrapCanvasText(ctx, `核心问题：${card.mainCritique}`, 160, 1160, 760, 48);
  wrapCanvasText(ctx, `下一步：${card.nextStep}`, 160, 1240, 760, 48);

  return canvas;
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = String(text).split("");
  let line = "";
  let currentY = y;
  chars.forEach((char) => {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, x, currentY);
}

function downloadCard() {
  if (!latestShareCard) return;
  const canvas = drawPixelCard(latestShareCard);
  const link = document.createElement("a");
  const safeName = String(latestShareCard.projectName || "project").replace(/[^\w\u4e00-\u9fa5-]+/g, "-");
  link.download = `${safeName}-share-card.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

planFile.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  setStatus(`READING ${files.length} FILE(S)`);
  uploadedProjects = [];
  try {
    const loaded = await Promise.all(
      files.map(async (file) => ({
        name: file.name.replace(/\.[^.]+$/, ""),
        text: (await file.text()).replace(/\u0000/g, "").slice(0, 120000)
      }))
    );
    uploadedProjects = loaded.filter((project) => project.text.trim());
    planText.value = uploadedProjects.map((project) => `# ${project.name}\n${project.text}`).join("\n\n---PROJECT---\n\n");
    renderProjectStack();
    setStatus(`${uploadedProjects.length} PROJECT(S) LOADED`);
  } catch (error) {
    setStatus("FILE READ FAILED");
  }
});

planText.addEventListener("input", () => {
  uploadedProjects = [];
  renderProjectStack();
});

toleranceInput.addEventListener("input", updateToleranceLabel);
analyzeBtn.addEventListener("click", analyze);
downloadCardBtn.addEventListener("click", downloadCard);
renderInvestors();
updateToleranceLabel();
