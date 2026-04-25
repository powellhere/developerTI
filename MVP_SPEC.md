# 产品导师风格 MVP Critique 与迭代建议 Spec

## 1. 产品定位

本项目的最小 MVP 定位为：

> 面向 vibe coding 用户、hackathon 参赛者和产品开发者，用户输入一个产品创意，或上传已有 MVP 描述文档 / 项目材料，选择一位 style-inspired 产品分析导师，系统对当前产品或 idea 进行 critique，指出主要问题，并给出下一轮迭代建议。

产品重点不是商业可行性评估，也不是给创作者贴人格标签，而是用产品导师视角帮助用户看清当前 idea 或 MVP 文档的问题、取舍和下一步迭代路径。

核心体验应当足够直接：

1. 输入一句产品创意，或粘贴/上传已有 MVP 描述文档、项目材料。
2. 选择一位产品分析导师风格。
3. 填写项目场景、开发阶段、目标平台和时间约束。
4. 生成产品 critique 与迭代建议。
5. 获得一张可分享的项目诊断卡片。

## 2. 目标用户

### 2.1 核心用户

- vibe coding 新手：已有 idea，但不知道当前方案最大问题在哪里。
- hackathon 参赛者：需要快速判断 demo scope、展示逻辑和下一轮修改重点。
- 产品开发者：需要 review 当前产品定义，并明确 first playable version 的缺陷和改进方向。
- 创作者型开发者：希望判断互动创意是否足够可体验、可分享，并获得迭代建议。

### 2.2 用户痛点

- idea 或 MVP 文档已经有了，但不知道最大问题在哪里、下一版该改什么。
- prompt 写得发散，AI 编程工具生成的代码容易偏离目标。
- 产品说明、demo script、feature priority 和实现约束之间不一致，缺少外部 critique。
- 展示前很难判断评委或用户是否能在 30 秒内理解项目价值。

## 3. MVP 核心功能

### 3.1 输入模块

用户需要提供以下信息：

- 项目输入：
  - 一句话 idea
  - 粘贴 MVP 描述文档或项目说明
  - 上传 PDF / DOCX / TXT / MD
- 产品分析导师风格：
  - Paul Graham
  - 张一鸣
  - Karpathy
  - Ilya Sutskever
  - MrBeast
  - 特朗普
  - 乔布斯
  - 马斯克
- 用户/项目上下文：
  - 用户身份：student / founder / employee / creator / indie_developer
  - 项目阶段：idea / prototype / launched
  - 项目目的：hackathon / product_demo / startup_validation / coursework / social_media
  - 目标平台：web / mobile_web / douyin_interactive_space / desktop / other
  - 开发时间：3_hours / 1_day / 2_days / 1_week
  - 技术信心：low / medium / high

输入数据结构：

```json
{
  "mentor": "karpathy",
  "projectInput": {
    "type": "mvp_brief",
    "content": "一个帮助黑客松参赛者 review MVP 文档并给出迭代建议的工具"
  },
  "projectContext": {
    "identity": "student",
    "stage": "idea",
    "goal": "hackathon",
    "targetPlatform": "douyin_interactive_space",
    "buildTime": "2_days",
    "technicalConfidence": "medium"
  }
}
```

### 3.2 产品分析导师模块

MVP 阶段保留大牛 persona，但角色语义改为“产品分析导师”，不是投资人、评委或真实本人。

每个导师 config 包含：

1. product analysis weights
2. critique style
3. preferred product questions
4. default scope-cut logic

文案必须使用 style-inspired 表达：

- Paul Graham-inspired Product Mentor
- 张一鸣-inspired Product Mentor
- Karpathy-inspired Engineering Mentor

禁止表达：

- “某某本人认为”
- “某某给你投资建议”
- “系统代表真实人物判断”

### 3.3 MVP Readiness 评分模块

评分维度固定为 6 个：

| 维度 | 说明 |
| --- | --- |
| Interaction Clarity | 用户是否一眼知道如何使用或怎么玩 |
| MVP Scope | 第一版范围是否足够小，是否能按时间约束完成 |
| Demo Feasibility | 是否能做出可展示、可体验的 demo |
| User Value | 用户体验后是否获得明确价值 |
| Visual Hook | 是否具备吸引点击和停留的视觉表达 |
| Share Potential | 是否具备被转发、讨论或二次体验的动机 |

总分映射为项目状态，而不是人格标签：

| 分数 | 状态 | 含义 |
| --- | --- | --- |
| 90-100 | Ready to Ship | 当前方案范围清晰，可以进入开发或展示 |
| 75-89 | Demo Ready | 适合做 demo，但仍需收窄部分功能 |
| 60-74 | Needs Focus | 方向成立，但 scope 和交互还需要压缩 |
| 40-59 | Too Broad | 想法过散，暂时不适合直接开发 |
| 0-39 | Not Yet Defined | 缺少关键产品定义，需要重新描述问题和用户 |

### 3.4 产品 Critique 与迭代建议模块

导师输出用于 review 当前产品定义、发现问题和指导下一轮迭代，不用于商业尽调。

产品 critique 应输出：

- Current Product One-liner
- Overall Diagnosis
- Target User Diagnosis
- Problem Diagnosis
- Core Flow Critique
- First Playable Assessment
- Must-have Feature Review
- Scope Cut Suggestions
- Demo Script Feedback
- Visual Hook Feedback
- Iteration Notes
- Next Iteration Plan

### 3.5 项目诊断卡片模块

诊断卡片用于游园会、社交传播或项目介绍，不承载完整 critique。

卡片应输出：

- 项目名
- 产品导师风格
- 诊断状态
- 一句话定位
- 核心问题
- 下一步迭代建议

卡片不输出用户人格画像，不使用人格分类，不把创作者个人特质标签化。

## 4. 文档解析 Spec

系统需要从输入材料中提取以下结构化字段：

```json
{
  "projectName": "",
  "targetUsers": "",
  "problem": "",
  "solution": "",
  "coreInteraction": "",
  "targetPlatform": "",
  "mustHaveFeatures": [],
  "niceToHaveFeatures": [],
  "currentStage": "",
  "availableResources": "",
  "demoConstraints": "",
  "risks": []
}
```

如果某些字段无法提取，则写入 `missingFields`：

```json
{
  "missingFields": ["targetUsers", "coreInteraction", "demoConstraints"]
}
```

缺失字段应影响对应评分，并在 critique 中转化为待补充问题和下一轮修改建议。

## 5. 产品导师权重体系

### 5.1 Paul Graham-inspired Product Mentor

关注用户真实需求、问题强度和最小可验证版本。

```json
{
  "interactionClarity": 0.18,
  "mvpScope": 0.20,
  "demoFeasibility": 0.15,
  "userValue": 0.27,
  "visualHook": 0.08,
  "sharePotential": 0.12
}
```

语言风格：

- 简短、直接
- 追问用户是否真的需要
- 强调先做最小版本
- 避免空泛愿景

### 5.2 张一鸣-inspired Product Mentor

关注底层变量、长期价值、用户反馈系统和产品迭代机制。

```json
{
  "interactionClarity": 0.18,
  "mvpScope": 0.16,
  "demoFeasibility": 0.16,
  "userValue": 0.22,
  "visualHook": 0.10,
  "sharePotential": 0.18
}
```

语言风格：

- 冷静、系统、概率化
- 强调 context、反馈闭环和可迭代性
- 区分短期 demo 与长期产品方向

### 5.3 Karpathy-inspired Engineering Mentor

关注工程可实现性、first playable version、调试路径和技术复杂度。

```json
{
  "interactionClarity": 0.16,
  "mvpScope": 0.22,
  "demoFeasibility": 0.28,
  "userValue": 0.12,
  "visualHook": 0.08,
  "sharePotential": 0.14
}
```

语言风格：

- 工程化、口语化
- 强调先跑通最小 workflow
- 明确哪些功能应当删除
- 关注 failure mode 和 debugging

### 5.4 Ilya Sutskever-inspired Research Mentor

关注问题重要性、概念纯度、系统边界和风险判断。

```json
{
  "interactionClarity": 0.14,
  "mvpScope": 0.16,
  "demoFeasibility": 0.16,
  "userValue": 0.24,
  "visualHook": 0.10,
  "sharePotential": 0.20
}
```

语言风格：

- 克制、审慎
- 强调重要性不等于可实现性
- 会指出边界条件和不确定性

### 5.5 MrBeast-inspired Growth Mentor

关注一句话 hook、观看/体验留存、社交传播和复玩动机。

```json
{
  "interactionClarity": 0.18,
  "mvpScope": 0.12,
  "demoFeasibility": 0.12,
  "userValue": 0.12,
  "visualHook": 0.22,
  "sharePotential": 0.24
}
```

语言风格：

- 强 hook、强对比
- 关注 3 秒理解和 30 秒留存
- 要求结果可以被截图、转发或二次体验

### 5.6 Trump-inspired Packaging Mentor

关注项目包装、展示气势、强对比表达和现场说服力。

```json
{
  "interactionClarity": 0.18,
  "mvpScope": 0.12,
  "demoFeasibility": 0.16,
  "userValue": 0.14,
  "visualHook": 0.20,
  "sharePotential": 0.20
}
```

语言风格：

- 高判断感
- 强调展示、注意力和一句话卖点
- 可以夸张表达，但不能虚构事实或承诺结果

### 5.7 Jobs-inspired Product Mentor

关注产品聚焦、端到端体验、审美一致性和删除复杂度。

```json
{
  "interactionClarity": 0.24,
  "mvpScope": 0.20,
  "demoFeasibility": 0.14,
  "userValue": 0.16,
  "visualHook": 0.18,
  "sharePotential": 0.08
}
```

语言风格：

- 聚焦、审美导向
- 强调一句话定义
- 对多余功能保持低容忍度

### 5.8 Musk-inspired Build Mentor

关注 first principles、工程约束、快速制造和大胆 scope。

```json
{
  "interactionClarity": 0.14,
  "mvpScope": 0.18,
  "demoFeasibility": 0.24,
  "userValue": 0.14,
  "visualHook": 0.10,
  "sharePotential": 0.20
}
```

语言风格：

- 第一性原理
- 质疑默认需求
- 强调删除、压缩、快速 ship
- 容忍高野心，但要求明确工程路径

## 6. 项目上下文动态权重调整

在导师基础权重上，根据用户上下文做轻量调整。

### 6.1 根据用户身份调整

| 用户身份 | 调整逻辑 |
| --- | --- |
| student | 提高 Demo Feasibility 和 Visual Hook，降低长期复杂度要求 |
| founder | 提高 User Value 和 MVP Scope |
| employee | 提高 Demo Feasibility 和 Iteration Notes |
| creator | 提高 Visual Hook 和 Share Potential |
| indie_developer | 提高 MVP Scope 和 Demo Feasibility |

### 6.2 根据项目阶段调整

| 项目阶段 | 调整逻辑 |
| --- | --- |
| idea | 提高 Interaction Clarity 和 MVP Scope |
| prototype | 提高 Demo Feasibility 和 User Value |
| launched | 提高 User Value 和 Next Iteration Plan |

### 6.3 根据项目目的调整

| 项目目的 | 调整逻辑 |
| --- | --- |
| hackathon | 提高 Demo Feasibility、Visual Hook 和 Share Potential |
| product_demo | 提高 Interaction Clarity 和 Demo Script Feedback |
| startup_validation | 提高 User Value 和 Core Flow Critique |
| coursework | 提高结构完整度和论证清晰度 |
| social_media | 提高 Visual Hook 和 Share Potential |

### 6.4 根据开发时间调整

| 开发时间 | 调整逻辑 |
| --- | --- |
| 3_hours | 大幅提高 MVP Scope，要求强制删除非核心功能 |
| 1_day | 提高 Demo Feasibility，只保留单一 core loop |
| 2_days | 平衡 scope、视觉和展示完整度 |
| 1_week | 允许更完整的信息架构和 polish |

## 7. 评分输出 Spec

评分模块输出结构：

```json
{
  "overallScore": 82,
  "status": "Demo Ready",
  "dimensionScores": {
    "interactionClarity": 86,
    "mvpScope": 78,
    "demoFeasibility": 84,
    "userValue": 76,
    "visualHook": 88,
    "sharePotential": 80
  },
  "strongestPoint": "核心交互容易理解，适合现场演示",
  "weakestPoint": "must-have features 仍需继续压缩",
  "topCritique": "当前方案的核心问题不是功能少，而是结果页的价值承诺还不够明确。"
}
```

评分原则：

- 每个维度分数范围为 0-100。
- 总分通过动态权重加权计算。
- 如果项目缺失目标用户、核心交互或 demo 约束，应明显扣分。
- 分数必须与文字解释一致，避免高分但评价负面的矛盾。
- 评分对象是当前产品方案与 MVP readiness，不是创作者个人。

## 8. 产品 Critique 生成 Spec

导师输出固定为 10 个部分。

### 8.1 Current Product One-liner

复述系统理解到的当前产品定义，用于暴露定位是否清晰。

示例：

> Vibe MVP Console reviews a builder's idea or MVP brief and returns product critique plus a next-iteration plan.

### 8.2 Overall Diagnosis

用 2-3 句话指出当前方案的整体状态、最强点和最需要修正的问题。

### 8.3 Target User Diagnosis

指出目标用户是否过宽、是否存在 first user，以及用户场景是否具体。

### 8.4 Problem Diagnosis

判断问题是否真实、紧迫、可被当前 MVP 触达，并指出描述中的空泛部分。

### 8.5 Core Flow Critique

评估当前核心流程是否足够短、是否存在断点，并给出建议流程。

### 8.6 First Playable Assessment

判断当前 first playable version 是否真的可体验，并指出最小可展示版本还缺什么。

### 8.7 Must-have Feature Review

评估当前 must-have features 是否过多，并保留 3-5 个真正必要功能。

### 8.8 Scope Cut Suggestions

列出第一版必须删除或延后的功能，并说明删除理由。

### 8.9 Demo Script Feedback

批评当前 demo script 的理解成本、节奏和记忆点，并给出 30-60 秒修订版。

### 8.10 Next Iteration Plan

输出下一轮迭代计划，包括：

- 需要立即修改的 3 个点
- 可以暂缓的功能
- 推荐的实现顺序
- 可能的 failure mode

## 9. 项目诊断卡片 Spec

诊断卡片用于传播和现场介绍，不承载完整 critique。

输出结构：

```json
{
  "projectName": "Vibe MVP Console",
  "mentor": "Karpathy-inspired Engineering Mentor",
  "status": "Demo Ready",
  "score": 82,
  "oneLiner": "把已有 idea 或 MVP 文档变成可执行的产品 critique。",
  "mainCritique": "当前核心交互清楚，但结果页的价值承诺需要从生成文档改成迭代诊断。",
  "nextStep": "重写结果页为 critique report，并提供 next iteration checklist。"
}
```

卡片视觉结构：

- 顶部：项目名
- 中间：诊断状态和分数
- 次级信息：产品导师风格
- 主体：one-liner、main critique 和 next iteration
- 底部：next step

禁止内容：

- 创作者人格画像
- 人格类型命名
- 对个人能力、性格或身份的标签化判断
- 真实人物背书式表达

## 10. 推荐技术架构

### 10.1 前端

建议使用：

- 原生 HTML/CSS/JS 或 React
- 一个输入页
- 一个结果页/结果区域
- 一个诊断卡片组件

MVP 页面：

1. `/`：输入与导师选择页面
2. `/result/:id`：产品 critique 结果页
3. `/share/:id`：项目诊断卡片页

### 10.2 后端

后端职责：

- 文件上传
- 文件内容解析
- 结构化抽取项目字段
- 生成 MVP readiness 评分与产品 critique
- 生成迭代建议和诊断卡片
- 存储结果

文件解析建议：

- PDF: `pdf-parse`
- DOCX: `mammoth`
- TXT / MD: 原文读取

AI 调用建议拆成 3 步：

1. extract structured product data
2. score MVP readiness
3. generate product critique and project diagnostic card

### 10.3 数据库

MVP 可使用 SQLite。上线后可迁移至 Supabase / Postgres。

核心表：

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  project_name TEXT,
  uploaded_text TEXT,
  mentor_style TEXT,
  project_context_json TEXT,
  extracted_json TEXT,
  product_critique_json TEXT,
  diagnostic_card_json TEXT,
  created_at TEXT
);
```

## 11. API Spec

### 11.1 创建产品 Critique 任务

`POST /api/projects/critique`

请求：

```json
{
  "mentor": "karpathy",
  "projectContext": {
    "identity": "student",
    "stage": "idea",
    "goal": "hackathon",
    "targetPlatform": "douyin_interactive_space",
    "buildTime": "2_days",
    "technicalConfidence": "medium"
  },
  "projectText": "一个帮助黑客松参赛者 review MVP 文档并给出迭代建议的工具"
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

### 11.2 获取产品 Critique

`GET /api/projects/:id`

响应：

```json
{
  "id": "proj_123",
  "extracted": {},
  "productCritique": {},
  "diagnosticCard": {}
}
```

## 12. 非目标范围

MVP 第一版先不做：

- 用户登录
- 团队协作
- 长期项目管理
- 真实投资建议
- 商业尽调
- 复杂财务建模
- 对创作者进行人格分类
- 对个人能力、性格或潜力做判断
- 声称真实名人参与或背书

## 13. 成功验证指标

MVP 的核心验证问题：

> vibe coding 用户是否能通过本工具更快发现当前 idea 或 MVP 文档的问题，并明确下一轮迭代动作？

建议关注以下指标：

- idea / MVP brief 输入完成率
- 产品 critique 生成成功率
- 用户复制 next iteration checklist / implementation notes 的比例
- 诊断卡片下载率
- 用户是否愿意用不同产品导师风格二次生成
- 用户是否认为输出能直接指导下一轮迭代

## 14. 优先级

### P0

- 输入产品 idea 或上传 MVP 描述文档 / 项目材料
- 选择产品分析导师风格
- 填写项目上下文
- 生成结构化产品 critique 与迭代建议
- 生成项目诊断卡片

### P1

- 支持下载诊断卡片
- 支持复制 next iteration checklist
- 支持复制 AI coding prompt
- 缺失字段提示
- 多导师风格切换

### P2

- 多项目对比
- 用户历史记录
- 生成 A3 海报文案
- 生成互动空间提交 checklist
- 根据目标平台输出更细的 implementation template
