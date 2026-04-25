# 名人投资人风格商业可行性分析 MVP Spec

## 1. 产品定位

本项目的最小 MVP 定位为：

> 用户上传项目计划书，选择一个“名人投资人偏好模型”，系统基于用户画像、项目目的和计划书内容，生成一份娱乐化、可传播的商业可行性报告，并附带一张创作人格分享卡片。

产品重点不是严肃的真实投资决策，而是一个具有传播性的 AI 商业分析工具。

核心体验应当足够直接：

1. 上传项目计划书。
2. 选择投资人风格。
3. 填写用户画像和项目目的。
4. 生成商业可行性报告。
5. 获得可分享的人格卡片。

## 2. MVP 核心功能

### 2.1 上传与输入模块

用户需要提供以下信息：

- 项目计划书文件：支持 PDF / DOCX / TXT。
- 投资人风格选择：
  - Trump-style Deal Maker
  - Musk-style Moonshot Builder
- 用户自身画像：
  - 身份：student / founder / employee / creator / small_business_owner
  - 项目阶段：idea / prototype / launched
  - 项目目的：fundraising / coursework / competition / startup_validation / social_media
  - 风险偏好：conservative / balanced / aggressive

输入数据结构：

```json
{
  "file": "business_plan.pdf",
  "investorPersona": "musk",
  "userProfile": {
    "identity": "student",
    "stage": "idea",
    "goal": "competition",
    "riskPreference": "aggressive"
  }
}
```

### 2.2 投资人偏好模型模块

MVP 阶段不需要构建复杂 agent，只需要定义两个 persona config：

1. investment preference weights
2. language tone profile

注意：产品文案应避免声称系统代表真实名人本人进行判断。建议使用“style-inspired”表达，例如：

- Trump-style Deal Maker
- Musk-style Moonshot Builder

### 2.3 商业可行性评分模块

评分维度固定为 6 个：

| 维度 | 说明 |
| --- | --- |
| Market Size | 市场是否足够大 |
| Pain Point | 问题是否真实且强烈 |
| Business Model | 收入模式是否清晰 |
| Competitive Advantage | 差异化是否成立 |
| Execution Feasibility | 当前资源是否足以推进 |
| Virality / Narrative | 是否具备传播性和故事感 |

总分映射为中文传播等级：

| 分数 | 等级 |
| --- | --- |
| 90-100 | 夯 |
| 75-89 | 顶级 |
| 60-74 | 人上人 |
| 40-59 | npc |
| 0-39 | 拉完了 |

### 2.4 报告与分享卡片模块

报告用于分析，分享卡片用于传播。

报告应输出：

- 最终评级
- 总分
- 投资人风格点评
- 六维度评分
- 关键风险
- 下一步建议

分享卡片应输出：

- 项目名
- 投资人风格
- 总评级
- 创作人格画像
- 一句传播文案
- 项目最强特质
- 项目最大短板

## 3. 文档解析 Spec

系统需要从上传的计划书中提取以下结构化字段：

```json
{
  "projectName": "",
  "industry": "",
  "targetUsers": "",
  "problem": "",
  "solution": "",
  "businessModel": "",
  "competitors": "",
  "currentStage": "",
  "resources": "",
  "risks": ""
}
```

如果某些字段无法从计划书中提取，则写入 `missingFields`：

```json
{
  "missingFields": ["businessModel", "competitors"]
}
```

MVP 阶段不做复杂多轮问答。缺失信息直接在报告中指出，并作为商业可行性评分的一部分。

## 4. 投资人权重体系

### 4.1 Trump-style Deal Maker

该 persona 更关注交易价值、现金回报、市场声量和可包装性。

```json
{
  "marketSize": 0.20,
  "painPoint": 0.15,
  "businessModel": 0.25,
  "competitiveAdvantage": 0.15,
  "executionFeasibility": 0.15,
  "viralityNarrative": 0.10
}
```

语言风格：

- 直接
- 高判断感
- 强调 deal、money、winning、market attention
- 允许轻微夸张，但不能输出虚假事实

### 4.2 Musk-style Moonshot Builder

该 persona 更关注技术野心、市场想象力、叙事潜力和非线性增长。

```json
{
  "marketSize": 0.25,
  "painPoint": 0.15,
  "businessModel": 0.10,
  "competitiveAdvantage": 0.20,
  "executionFeasibility": 0.10,
  "viralityNarrative": 0.20
}
```

语言风格：

- 偏未来主义
- 强调 scale、innovation、mission、technical edge
- 容忍早期不确定性
- 但必须指出执行和商业化风险

## 5. 用户画像动态权重调整

在 persona 基础权重上，根据用户画像做轻量调整。

### 5.1 根据身份调整

| 用户身份 | 调整逻辑 |
| --- | --- |
| student | 降低 Execution Feasibility 权重，提高 Virality / Narrative |
| founder | 提高 Business Model 和 Execution Feasibility |
| employee | 提高 Execution Feasibility 和风险识别 |
| creator | 提高 Virality / Narrative 和 Pain Point |
| small_business_owner | 提高 Business Model 和现金流可行性 |

### 5.2 根据项目阶段调整

| 项目阶段 | 调整逻辑 |
| --- | --- |
| idea | 降低执行要求，提高叙事和痛点验证 |
| prototype | 平衡产品可行性和市场验证 |
| launched | 提高商业模式、增长数据和执行能力权重 |

### 5.3 根据项目目的调整

| 项目目的 | 调整逻辑 |
| --- | --- |
| fundraising | 提高 Market Size 和 Competitive Advantage |
| coursework | 提高结构完整度和论证清晰度 |
| competition | 提高 Virality / Narrative 和创新性 |
| startup_validation | 提高 Pain Point 和 Business Model |
| social_media | 提高 Virality / Narrative |

### 5.4 根据风险偏好调整

| 风险偏好 | 调整逻辑 |
| --- | --- |
| conservative | 提高 Execution Feasibility 和 Business Model |
| balanced | 保持基础权重 |
| aggressive | 提高 Market Size、Competitive Advantage 和 Virality / Narrative |

## 6. 评分输出 Spec

评分模块输出结构：

```json
{
  "overallScore": 78,
  "rating": "顶级",
  "dimensionScores": {
    "marketSize": 82,
    "painPoint": 74,
    "businessModel": 66,
    "competitiveAdvantage": 71,
    "executionFeasibility": 62,
    "viralityNarrative": 88
  },
  "strongestPoint": "项目叙事和传播潜力较强",
  "weakestPoint": "商业模式还不够具体"
}
```

评分原则：

- 每个维度分数范围为 0-100。
- 总分通过动态权重加权计算。
- 如果计划书缺失某个关键字段，对相关维度进行扣分。
- 分数必须与文字解释一致，避免出现高分但评价负面的矛盾。

## 7. 报告生成 Spec

报告固定为 6 个部分。

### 7.1 一句话判定

用一句话总结项目状态。

示例：

> 这个项目不是完美生意，但有明显传播潜力，适合先做低成本验证。

### 7.2 最终等级

包含：

- 评级：顶级
- 分数：78/100
- 简短解释：为什么是这个等级

### 7.3 投资人风格点评

根据用户选择的 persona 输出风格化点评。

要求：

- 可以模仿投资偏好和语言气质。
- 不要声称这是名人本人的真实判断。
- 不要给出真实投资承诺。

### 7.4 六维度评分表

每个维度包含：

- 分数
- 2-3 句解释
- 该维度的主要风险或机会

### 7.5 关键风险

至少输出 3 类风险：

- Market Risk
- Execution Risk
- Business Model Risk

### 7.6 下一步建议

输出 3 条具体行动建议。

示例：

1. 用 landing page 测试目标用户是否愿意留下邮箱。
2. 明确第一个付费场景，而不是泛泛描述收入模式。
3. 找 5 个目标用户做访谈，验证 pain point 的强度。

## 8. 分享卡片 Spec

分享卡片用于社交传播，不承载完整报告。

输出结构：

```json
{
  "projectName": "AI Study Buddy",
  "investorPersona": "Musk-style Moonshot Builder",
  "rating": "顶级",
  "score": 78,
  "creatorType": "Moonshot Builder",
  "tagline": "高叙事、高风险，但值得一试。",
  "topTrait": "Narrative Power",
  "weakness": "Revenue Clarity"
}
```

### 8.1 创作人格画像

MVP 可先定义 5 种人格：

| 人格 | 含义 |
| --- | --- |
| Moonshot Builder | 高野心、高叙事、偏未来主义 |
| Deal Hunter | 关注交易、现金流和商业包装 |
| Narrative Founder | 擅长讲故事，传播潜力强 |
| Cashflow Realist | 关注现实收入和执行确定性 |
| Chaos Operator | 想法强烈但结构和落地性不足 |

### 8.2 卡片视觉结构

卡片包含：

- 顶部：项目名
- 中间：大号等级，例如“顶级”
- 次级信息：创作人格画像
- 底部：一句点评
- 可选：二维码 / 分享链接

## 9. 推荐技术架构

### 9.1 前端

建议使用：

- Next.js / React
- 一个上传页
- 一个结果页
- 一个分享卡片组件

MVP 页面：

1. `/`：上传与输入页面
2. `/result/:id`：报告结果页
3. `/share/:id`：分享卡片页

### 9.2 后端

后端职责：

- 文件上传
- 文件内容解析
- 调用 AI 做结构化抽取
- 调用 AI 做评分和报告生成
- 存储报告结果

文件解析建议：

- PDF: `pdf-parse`
- DOCX: `mammoth`
- TXT: 原文读取

AI 调用建议拆成 3 步：

1. extract structured project data
2. score commercial feasibility
3. generate report and share card

### 9.3 数据库

MVP 可使用 SQLite。上线后可迁移至 Supabase / Postgres。

核心表：

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  project_name TEXT,
  uploaded_text TEXT,
  investor_persona TEXT,
  user_profile_json TEXT,
  extracted_json TEXT,
  report_json TEXT,
  share_card_json TEXT,
  created_at TEXT
);
```

## 10. API Spec

### 10.1 创建分析任务

`POST /api/projects/analyze`

请求：

```json
{
  "investorPersona": "musk",
  "userProfile": {
    "identity": "student",
    "stage": "idea",
    "goal": "competition",
    "riskPreference": "aggressive"
  },
  "fileText": "..."
}
```

响应：

```json
{
  "projectId": "proj_123",
  "status": "completed",
  "resultUrl": "/result/proj_123",
  "shareUrl": "/share/proj_123"
}
```

### 10.2 获取报告

`GET /api/projects/:id`

响应：

```json
{
  "id": "proj_123",
  "extracted": {},
  "report": {},
  "shareCard": {}
}
```

## 11. 非目标范围

MVP 第一版先不做：

- 用户登录
- 多投资人对比
- 历史报告管理
- 真实融资建议
- 复杂财务建模
- 自动市场数据检索
- 长期项目追踪
- 付费系统
- 团队协作

## 12. 成功验证指标

MVP 的核心验证问题：

> 用户是否愿意上传自己的项目，并把生成的“投资人风格报告 + 人格卡片”分享出去？

建议关注以下指标：

- 上传完成率
- 报告生成成功率
- 分享卡片下载率
- 分享链接点击率
- 用户是否愿意二次生成不同投资人风格

## 13. 优先级

### P0

- 上传项目计划书
- 选择投资人风格
- 填写用户画像
- 生成结构化商业可行性报告
- 生成分享卡片

### P1

- 支持下载分享卡片
- 支持复制分享链接
- 报告页面优化
- 缺失字段提示

### P2

- 多投资人对比
- 用户历史记录
- 更细的人格画像系统
- 市场数据检索增强
