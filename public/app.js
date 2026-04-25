const investors = [
  { id: "trump", name: "Donald Trump", style: "brand / leverage / media" },
  { id: "musk", name: "Elon Musk", style: "first principles / tech" },
  { id: "buffett", name: "Warren Buffett", style: "moat / cash flow" },
  { id: "cuban", name: "Mark Cuban", style: "sales / operations" },
  { id: "wood", name: "Cathie Wood", style: "disruptive innovation" },
  { id: "thiel", name: "Peter Thiel", style: "monopoly / secret" },
  { id: "son", name: "Masayoshi Son", style: "TAM / platform scale" },
  { id: "dalio", name: "Ray Dalio", style: "risk / systems" },
  { id: "chamath", name: "Chamath", style: "narrative / growth" }
];

const investorGrid = document.querySelector("#investorGrid");
const investorTemplate = document.querySelector("#investorTemplate");
const planFile = document.querySelector("#planFile");
const planText = document.querySelector("#planText");
const analyzeBtn = document.querySelector("#analyzeBtn");
const report = document.querySelector("#report");
const statusLine = document.querySelector("#status");

let selectedInvestor = "musk";

function setStatus(text) {
  statusLine.textContent = `STATUS: ${text}`;
}

function renderInvestors() {
  investors.forEach((investor) => {
    const node = investorTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.investor = investor.id;
    node.dataset.avatar = investor.id;
    node.setAttribute("aria-pressed", investor.id === selectedInvestor ? "true" : "false");
    node.querySelector(".investor-name").textContent = investor.name;
    node.querySelector(".investor-style").textContent = investor.style;
    node.addEventListener("click", () => {
      selectedInvestor = investor.id;
      document.querySelectorAll(".investor-card").forEach((card) => {
        card.setAttribute("aria-pressed", card.dataset.investor === selectedInvestor ? "true" : "false");
      });
      setStatus(`INVESTOR_SELECTED_${investor.id.toUpperCase()}`);
    });
    investorGrid.appendChild(node);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scoreClass(score) {
  if (score >= 78) return "#008000";
  if (score >= 55) return "#8a6d00";
  return "#b00020";
}

function renderReport(data) {
  const critique = data.critique
    .map(
      (item) => `
        <div class="score-box" style="border-top: 5px solid ${scoreClass(item.score)}">
          <span>${escapeHtml(item.title)}</span>
          <strong>${item.score}</strong>
        </div>
      `
    )
    .join("");

  report.classList.remove("empty");
  report.innerHTML = `
    <h2>${escapeHtml(data.investor)} 风格批判报告</h2>
    <p><strong>投资 thesis:</strong> ${escapeHtml(data.thesis)}</p>
    <p><strong>分析视角:</strong> ${escapeHtml(data.lens)}</p>
    <p><strong>Overall feasibility:</strong> ${data.overall}/100 - ${escapeHtml(data.verdict)}</p>

    <div class="score-strip">${critique}</div>

    <div class="report-section">
      <h3>Critical Analysis</h3>
      <ul>
        ${data.critique.map((item) => `<li><strong>${escapeHtml(item.title)}:</strong> ${escapeHtml(item.comment)}</li>`).join("")}
      </ul>
    </div>

    <div class="report-section">
      <h3>Red Flags</h3>
      <ul>${data.redFlags.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>

    <div class="report-section">
      <h3>Minimum MVP Logic</h3>
      <ol>${data.mvpLogic.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </div>

    <div class="report-section">
      <h3>Investor Due Diligence Questions</h3>
      <ul>${data.nextQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
  `;
}

async function analyze() {
  const text = planText.value.trim();
  if (text.length < 120) {
    setStatus("ERROR_PLAN_TOO_SHORT");
    report.classList.remove("empty");
    report.innerHTML = "<h2>输入不足</h2><p>请上传或粘贴至少 120 个字符的项目计划书。MVP 需要足够文本才能判断 market、finance、execution 等维度。</p>";
    return;
  }

  setStatus("ANALYZING");
  analyzeBtn.disabled = true;

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ investor: selectedInvestor, planText: text })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Analysis failed.");
    renderReport(payload);
    setStatus("REPORT_READY");
  } catch (error) {
    setStatus("ERROR_ANALYSIS_FAILED");
    report.classList.remove("empty");
    report.innerHTML = `<h2>分析失败</h2><p>${escapeHtml(error.message)}</p>`;
  } finally {
    analyzeBtn.disabled = false;
  }
}

planFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  setStatus(`READING_${file.name.toUpperCase().slice(0, 24)}`);
  try {
    const text = await file.text();
    planText.value = text.replace(/\u0000/g, "").slice(0, 120000);
    setStatus("FILE_LOADED");
  } catch (error) {
    setStatus("ERROR_FILE_READ_FAILED");
  }
});

analyzeBtn.addEventListener("click", analyze);
renderInvestors();
