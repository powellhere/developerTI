# DeveloperTI

一个复古游戏机风格的项目计划书锐评 MVP。

用户可以上传一个或多个项目计划书，选择一位大牛视角，系统会从多个商业维度生成可行性评分、从「夯」到「拉」的排行，以及 developer 人格画像分享卡片。

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
- 
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

## 当前限制

- 规则型评分不能替代真实 market research、financial modelling 或 due diligence。
- PDF / DOCX 在 MVP 中按浏览器可读取文本尝试处理，TXT / MD 效果更稳定。
- 当前没有用户登录、数据库、历史记录或真实 AI 生成。
- persona 是 style-inspired simulation，不代表相关人物本人观点。

## License

Private MVP. Add a license before using it as an open-source project.
