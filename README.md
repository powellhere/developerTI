# DeveloperTI

一个复古街机游戏机风格的 MVP 项目锐评网页。

用户可以输入或上传一个 / 多个项目 idea、MVP brief 或计划书，选择不同产品导师 persona，系统会输出项目可行性锐评、六维度评分、从「夯」到「拉完了」的榜单，以及 developer 人格画像分享卡片。

> 这是一个娱乐化、传播导向的产品分析 MVP。导师 persona 是 style-inspired simulation，不代表任何真实人物本人观点，也不构成 investment advice。

## Quick Start

### 1. 克隆项目

```bash
git clone https://github.com/powellhere/developerTI.git
cd developerTI
```

如果你已经有本地项目，只需要进入项目目录：

```bash
cd developerTI
```

### 2. 确认 Node.js 版本

项目需要 Node.js 18 或以上版本。

```bash
node -v
```

如果版本低于 18，先升级 Node.js。推荐使用 `nvm`：

```bash
nvm install 18
nvm use 18
```

### 3. 安装依赖

当前项目没有额外第三方依赖，但仍建议执行一次 `npm install`，方便本地环境生成标准 npm 项目状态。

```bash
npm install
```

### 4. 启动本地网页服务

```bash
npm run dev
```

或：

```bash
npm start
```

启动成功后，终端会显示类似：

```text
DeveloperTI running at http://localhost:4173
```

### 5. 打开网页

在浏览器访问：

```text
http://localhost:4173
```

不要直接双击打开 `public/index.html`。页面虽然能显示，但分析接口依赖本地 Node server，直接用 `file://` 打开可能无法正常生成报告。

### 6. 更换端口

如果 `4173` 端口被占用，可以指定其他端口：

```bash
PORT=3000 npm run dev
```

然后打开：

```text
http://localhost:3000
```

Windows PowerShell 可以这样写：

```powershell
$env:PORT=3000; npm run dev
```

## 使用流程

1. 打开本地网页。
2. 上传一个或多个 MVP 文档，或直接粘贴项目文本。
3. 如需一次分析多个项目，用 `---PROJECT---` 分隔。
4. 选择一个产品导师 persona。
5. 调整「导师容忍度」滑块：
   - 左侧是地狱模式，评分会明显更严格。
   - 右侧是温柔模式，评分会更宽松。
6. 点击「开始生成锐评」。
7. 查看热敏纸打印效果生成的报告。
8. 查看项目排行、六维度评分、核心锐评、范围裁剪建议和 developer 人格画像分享卡片。

## 当前导师 Persona

- Paul Graham：真实需求、MVP 收窄、用户是否真的想要。
- 张一鸣：反馈闭环、底层变量、可迭代系统。
- Karpathy：first playable、工程可跑通、debug surface。
- Kris Jenner：品牌 IP、传播叙事、注意力控制。
- MrBeast：三秒 hook、截图传播、结果反差。
- 特朗普：强主张、舞台感、注意力包装。
- 乔布斯：聚焦、审美、一句话产品定义。
- 马斯克：第一性原理、删除需求、快速 ship。

## 当前评分标准

系统使用六个维度做规则型评分，并根据所选导师 persona 和容忍度滑块调整权重。

- 逻辑自洽度：产品承诺、目标用户、功能实现和不做事项是否互相咬合。
- MVP 范围控制：第一版是否足够小，能否先跑通 core loop。
- Demo 可跑通性：是否能做出可展示、可体验、可复现的 demo。
- 用户痛点强度：是否有具体 first user、具体场景和明确痛点。
- Vibe 体验辨识度：是否有情绪钩子、体验性格和结果记忆点。
- 传播与复用性：是否值得截图、转发、对比、复玩或二次使用。

评分最终会映射到从「夯」到「拉完了」的主玩法等级：

- 夯
- 顶级
- 人上人
- NPC
- 拉完了

## 项目结构

```text
.
├── public/
│   ├── index.html          # 前端页面结构
│   ├── styles.css          # 复古街机 / 像素视觉样式
│   ├── app.js              # 前端交互、上传、报告渲染、分享卡片
│   └── assets/             # 投资人头像与静态资源
├── material/               # 评级视觉素材
├── server.js               # 本地 Node HTTP server + 规则型分析接口
├── package.json            # npm scripts
├── MVP_SPEC.md             # MVP spec
├── IMPLEMENTATION_PRD.md   # 实现 PRD
└── 商业人格三角_自动判定算法规则文档.md
```

## 开发命令

启动开发服务：

```bash
npm run dev
```

启动生产同款本地服务：

```bash
npm start
```

检查 JS 语法：

```bash
node --check public/app.js
node --check server.js
```

## 常见问题

### 页面能打开，但点击生成报告失败

确认你是通过本地 server 打开的：

```text
http://localhost:4173
```

不要使用：

```text
file:///.../public/index.html
```

### 端口被占用

换一个端口启动：

```bash
PORT=3000 npm run dev
```

### 上传 PDF / DOCX 读取不稳定

当前 MVP 对 PDF / DOCX 只做浏览器可读取文本的尝试。最稳定的输入方式是：

- 直接粘贴文本
- 上传 `.txt`
- 上传 `.md`

### 为什么不同导师会给出不同结果

每个导师有独立的：

- 权重体系
- score tuning
- 语言风格模板
- 关注维度偏好

同一份项目文档在不同导师下会得到不同侧重点和不同分数。

## 当前限制

- 当前没有用户登录、数据库或历史记录。
- 当前分析逻辑主要是规则型 scoring，不等同于真实 market research、financial modelling 或 due diligence。
- 分享卡片中的美术资源仍可继续替换为正式素材。
- 导师 persona 是风格化模拟，不代表相关人物本人观点。

## License

Private MVP. Add a license before using it as an open-source project.
