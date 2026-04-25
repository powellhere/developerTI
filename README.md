# DeveloperTI

一个复古 1980s handheld game poster 风格的项目计划书锐评 MVP。

用户可以上传一个或多个项目计划书，选择一位 style-inspired 大牛视角，系统会从多个商业维度生成可行性评分、从「夯」到「拉完了」的排行，以及 developer 人格画像分享卡片。

> 这是一个娱乐化、传播导向的商业分析 MVP，不代表任何真实人物观点，也不是 investment advice。

## 核心功能

- 多项目上传：支持一次上传多个计划书文件。
- 文本分隔输入：也可以在文本框中用 `---PROJECT---` 分隔多个项目。
- 大牛锐评 persona：
  - Paul Graham
  - 张一鸣
  - Karpathy
  - Ilya Sutskever
  - MrBeast
  - 特朗普
  - 乔布斯
  - 马斯克
- 六维度商业分析：
  - Market Size
  - Pain Point
  - Business Model
  - Competitive Advantage
  - Execution Feasibility
  - Virality / Narrative
- 从「夯」到「拉完了」的项目排行：
  - 夯
  - 顶级
  - 人上人
  - npc
  - 拉完了
- developer 人格画像分享卡片。
- PNG 分享卡片下载。

## 视觉方向

当前前端采用复古游戏海报风：

- warm cream paper background
- thick imperfect brown ink outlines
- muted teal cartoon handheld console
- hand-printed typography
- vintage screen-print grain
- pixel investor avatars

主要视觉资源在：

```text
public/assets/investor-avatars.png
```

## 项目结构

```text
.
├── MVP_SPEC.md
├── README.md
├── package.json
├── server.js
└── public/
    ├── app.js
    ├── index.html
    ├── styles.css
    └── assets/
        └── investor-avatars.png
```

## 如何运行

需要 Node.js 18 或以上版本。

```bash
npm install
npm start
```

默认地址：

```text
http://localhost:4173
```

如果需要换端口：

```bash
PORT=3000 npm start
```

## 如何使用

1. 打开页面。
2. 上传一个或多个项目计划书，或直接粘贴项目文本。
3. 如需粘贴多个项目，用 `---PROJECT---` 分隔。
4. 选择一个大牛 persona。
5. 填写用户画像、项目阶段、目的和风险偏好。
6. 点击 `RUN ANALYSIS`。
7. 查看：
   - 最高分项目详细报告
   - 多项目 Project Ranking
   - 六维度评分
   - Key Risks
   - Next Actions
   - developer 人格画像分享卡片

## 分析逻辑

当前版本是规则型 MVP，不调用外部 LLM。

后端会根据项目文本中的关键词、文本结构、用户画像和 persona 权重进行启发式评分。每个 persona 有不同的关注重点，例如：

- Paul Graham 偏向 pain point、用户真实需求和创业本质。
- 张一鸣偏向长期 context、底层变量和执行系统。
- Karpathy 偏向工程实现、原型验证和技术可解释性。
- Ilya 偏向研究品味、技术壁垒和重要性判断。
- MrBeast 偏向传播钩子、留存和内容飞轮。
- 特朗普偏向 deal、attention、leverage 和商业包装。
- 乔布斯偏向产品聚焦、审美和端到端体验。
- 马斯克偏向 first principles、工程约束和快速制造。

最终分数会映射为：

| 分数 | 等级 |
| --- | --- |
| 90-100 | 夯 |
| 75-89 | 顶级 |
| 60-74 | 人上人 |
| 40-59 | npc |
| 0-39 | 拉完了 |

## API

### `POST /api/analyze`

请求示例：

```json
{
  "investor": "paul_graham",
  "userProfile": {
    "identity": "student",
    "stage": "idea",
    "goal": "competition",
    "riskPreference": "balanced"
  },
  "projects": [
    {
      "name": "AI Study Buddy",
      "text": "..."
    }
  ]
}
```

响应包含：

- `report`：最高分项目的详细报告
- `reports`：所有项目报告
- `ranking`：多项目排行
- `shareCard`：分享卡片数据

## 当前限制

- 规则型评分不能替代真实 market research、financial modelling 或 due diligence。
- PDF / DOCX 在 MVP 中按浏览器可读取文本尝试处理，TXT / MD 效果更稳定。
- 当前没有用户登录、数据库、历史记录或真实 AI 生成。
- persona 是 style-inspired simulation，不代表相关人物本人观点。

## License

Private MVP. Add a license before using it as an open-source project.
