const investors = [
  { id: "paul_graham", name: "Paul Graham", domain: "创业 / 写作 / 产品", tag: "Make what people want" },
  { id: "zhang_yiming", name: "张一鸣", domain: "产品 / 组织 / 全球化", tag: "Context over control" },
  { id: "karpathy", name: "Karpathy", domain: "AI / 工程 / 教育", tag: "Build to understand" },
  { id: "ilya", name: "Ilya Sutskever", domain: "AI / 安全 / 研究品味", tag: "Taste for truth" },
  { id: "mrbeast", name: "MrBeast", domain: "内容 / 增长 / 传播", tag: "Retention wins" },
  { id: "trump", name: "特朗普", domain: "谈判 / 权力 / 传播", tag: "Deal and attention" },
  { id: "jobs", name: "乔布斯", domain: "产品 / 设计 / 战略", tag: "Focus means no" },
  { id: "musk", name: "马斯克", domain: "工程 / 成本 / 第一性原理", tag: "Delete, simplify, ship" }
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

const profileInputs = {
  identity: document.querySelector("#identity"),
  stage: document.querySelector("#stage"),
  goal: document.querySelector("#goal"),
  riskPreference: document.querySelector("#riskPreference")
};

let selectedInvestor = "paul_graham";
let latestShareCard = null;
let uploadedProjects = [];

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

function setLoading(isLoading, text = "PARSING PLAN...") {
  loadingPanel.classList.toggle("hidden", !isLoading);
  loadingPanel.setAttribute("aria-hidden", String(!isLoading));
  loadingText.textContent = text;
}

function getUserProfile() {
  return Object.fromEntries(
    Object.entries(profileInputs).map(([key, input]) => [key, input.value])
  );
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
          <small>${project.text.length} chars</small>
        </div>
      `
    )
    .join("");
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
      selectedInvestor = investor.id;
      document.querySelectorAll(".investor-card").forEach((card) => {
        card.setAttribute("aria-pressed", String(card.dataset.investor === selectedInvestor));
      });
      setStatus(`SELECTED: ${investor.name}`);
    });
    investorGrid.appendChild(node);
  });
}

function scoreColor(score) {
  if (score >= 90) return "var(--rank-hot)";
  if (score >= 75) return "var(--rank-good)";
  if (score >= 60) return "var(--rank-mid)";
  if (score >= 40) return "var(--rank-low)";
  return "var(--rank-bad)";
}

function renderDimensionRows(dimensionScores) {
  return dimensionScores
    .map(
      (item) => `
        <div class="dimension-row">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <p>${escapeHtml(item.comment)}</p>
          </div>
          <div class="score-meter" style="--score:${item.score}; --score-color:${scoreColor(item.score)}">
            <span>${item.score}</span>
            <i></i>
          </div>
        </div>
      `
    )
    .join("");
}

function renderRanking(ranking) {
  if (!ranking || ranking.length <= 1) return "";
  return `
    <section class="ranking-board">
      <h3>Project Ranking</h3>
      ${ranking
        .map(
          (item, index) => `
            <div class="rank-row">
              <span class="rank-index">#${index + 1}</span>
              <div>
                <strong>${escapeHtml(item.projectName)}</strong>
                <p>${escapeHtml(item.oneLineVerdict)}</p>
              </div>
              <span class="rank-grade" style="--badge-color:${scoreColor(item.overallScore)}">${escapeHtml(item.rating)} ${item.overallScore}</span>
            </div>
          `
        )
        .join("")}
    </section>
  `;
}

function renderReport(payload) {
  const { report: reportData, shareCard: card, ranking } = payload;
  latestShareCard = card;

  report.classList.remove("empty");
  report.innerHTML = `
    <header class="report-header">
      <div>
        <p class="terminal-label">BUSINESS FEASIBILITY REPORT</p>
        <h2>${escapeHtml(reportData.projectName)}</h2>
      </div>
      <div class="grade-badge" style="--badge-color:${scoreColor(reportData.overallScore)}">
        <span>${escapeHtml(reportData.rating)}</span>
        <strong>${reportData.overallScore}</strong>
      </div>
    </header>

    <section class="verdict-box">
      <h3>${escapeHtml(reportData.personaName)} verdict</h3>
      <p>${escapeHtml(reportData.oneLineVerdict)}</p>
      <p>${escapeHtml(reportData.styleComment)}</p>
    </section>

    ${renderRanking(ranking)}

    <section class="dimension-list">
      <h3>Six-Dimension Score</h3>
      ${renderDimensionRows(reportData.dimensionScores)}
    </section>

    <section class="two-column-report">
      <div>
        <h3>Key Risks</h3>
        <ul>${reportData.keyRisks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      <div>
        <h3>Next Actions</h3>
        <ol>${reportData.nextActions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
      </div>
    </section>

    <p class="disclaimer">该结果是 style-inspired simulation，不代表相关人物本人观点，也不是 investment advice。</p>
  `;

  shareCard.classList.remove("hidden");
  shareCard.innerHTML = `
    <p class="terminal-label">SHARE CARD</p>
    <h3>${escapeHtml(card.projectName)}</h3>
    <div class="share-rating">${escapeHtml(card.rating)} <span>${card.score}/100</span></div>
    <p class="creator-type">${escapeHtml(card.creatorType)}</p>
    <p class="tagline">${escapeHtml(card.tagline)}</p>
    <div class="trait-grid">
      <span>TOP: ${escapeHtml(card.topTrait)}</span>
      <span>BUG: ${escapeHtml(card.weakness)}</span>
    </div>
  `;
  downloadCardBtn.classList.remove("hidden");
}

function renderError(message) {
  report.classList.remove("empty");
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
    setStatus("ERROR: PLAN TOO SHORT");
    renderError("每个项目计划书都需要至少 120 个字符。多项目请上传多个文件，或在文本框中用 ---PROJECT--- 分隔。");
    return;
  }

  setStatus("RUNNING...");
  setLoading(true, "SIMULATING INVESTOR BRAIN...");
  analyzeBtn.disabled = true;
  shareCard.classList.add("hidden");
  downloadCardBtn.classList.add("hidden");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        investor: selectedInvestor,
        projects,
        userProfile: getUserProfile()
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Analysis failed.");
    renderReport(payload);
    setStatus("REPORT READY");
  } catch (error) {
    setStatus("ERROR");
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
  ctx.fillText("INVESTOR CONSOLE RESULT", 160, 205);

  ctx.fillStyle = "#fff8d6";
  ctx.font = "72px monospace";
  wrapCanvasText(ctx, card.projectName, 160, 330, 760, 86);

  ctx.fillStyle = "#ffcc33";
  ctx.font = "156px monospace";
  ctx.fillText(card.rating, 160, 595);

  ctx.fillStyle = "#ffffff";
  ctx.font = "54px monospace";
  ctx.fillText(`${card.score}/100`, 650, 585);

  ctx.fillStyle = "#66d9ff";
  ctx.font = "62px monospace";
  wrapCanvasText(ctx, card.creatorType, 160, 730, 760, 72);

  ctx.fillStyle = "#ffffff";
  ctx.font = "42px monospace";
  wrapCanvasText(ctx, card.tagline, 160, 880, 760, 58);

  ctx.fillStyle = "#ff5f7a";
  ctx.font = "36px monospace";
  wrapCanvasText(ctx, `TOP TRAIT: ${card.topTrait}`, 160, 1080, 760, 48);
  wrapCanvasText(ctx, `WEAKNESS: ${card.weakness}`, 160, 1145, 760, 48);

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

analyzeBtn.addEventListener("click", analyze);
downloadCardBtn.addEventListener("click", downloadCard);
renderInvestors();
