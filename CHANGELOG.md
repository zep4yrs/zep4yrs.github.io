# 更新日志

## 2026-09-09

### 八个项目详情页全部推倒重做（每页独立人格，对齐 oiloil.org 一产品一格调）
- **脱离旧架构**：8 个项目页不再加载 mimo.css / project.css / mimo.js，改用全新的 `proj-base.css` + `proj-base.js` 轻底座（纸底画布、顶栏、移动端菜单、页脚、滚动显现），每页独立 `<style>` 发挥个性
- **bluetidy**:「磁盘验收报告单」——活体磁盘矩形图（扫描光 + hover 路径）、快照对比演示条、STEP 报告行
- **lannook**:「双端对话」——设备卡 + 文件包飞行动画、聊天气泡式场景叙事、WHY 四联、六条版本历史
- **ctf-qiankun**:「黑客终端」——全站唯一暗色终端窗（链式解码逐行演示）、450+ 工具键盘网格、$ 命令行 CTA
- **autopen**:「作战室」——九智能体作战板（RUNNING 状态闪烁）、事件总线日志、人工审批红图章、审计日志样例表
- **alertzero**:「警报游戏页」——脉冲警报条、五大方向关卡选择网格（进度条）、四步事件处置流程、NPC 虚拟校园
- **cryptovis**:「密文实验室」——可输入的实时 XOR 密文变换演示（明文/密文双栏 + ⊕）、AES 十轮 chips、公式美学
- **structvis**:「活画布」——真实可玩的 BST 插入步进演示（SVG 树动画 + 步进注释）、教材章节网格、新 slogan「看见每一步跳动」
- **stellar**:「摘星卡片盒」——5 秒判定交互演示（评分滚动 + 五维度量条）、策展卡片墙、本地归档四联
- 共享底座 `proj-base.css/js`：IO 滚动显现含 1.4s 兜底（后台标签不秃）

## 2026-09-08

### 同步上游仓库动态（struct / lannook）
- **StructVis**：收录 2026-09 画布质感升级（柱体圆角、玻璃感微渐变、底板微光）与首页广告卡 16:10 优化、广告关闭降级为会话级；hero 描述启用新 slogan「看见数据结构与数据库的每一步跳动」；changelog 补 v1.0.x 条目；projects/demos 卡片文案与版本（v0.0.1 · 新 → v1.0.0 · 正式版）同步；OG 图重生成
- **LanNook**：版本 v26.2.2 → **v26.4.0**（08-22 发布），全站同步（首页跑马灯/卡片/详情页 VERSION）；changelog 补 v26.4.0（Silk vNext 基础、分平台 chrome 与顶部导航、anime.js 编排、35 项启发式审计修复）与 v26.3.0（RustSec 清零）条目
- **bulletin**：新增 3 条公告（StructVis 画布升级 09.08、LanNook v26.4.0 08.22、v26.3.0 08.14）
- 重建 pagefind 索引（21 页 / 2386 词）

### DeepSeek 桌宠项目下线
- 项目方向调整，DeepSeek 桌宠从全站下线：管线甘特行、首页产品矩阵（Stellar 顺位补为 N°08）、生态商业列表、projects 矩阵（Stellar 顺位补为 N°08）、about 方向描述与统计、stellar 页相关推荐（改指 LanNook）全部移除
- 计数同步：九个→八个项目，商业 4→3，桌面 4→3，PROJECTS 9→8 active
- 删除 `deepseek-pet.html`、`assets/og/og-deepseek-pet.png`、`assets/svg/logo-deepseek-pet.svg`；project.css 移除 theme-deepseek-pet 变量
- feed.xml / bulletin 历史公告保留（历史事实不改写）

### 清理
- 删除无入链的旧试验页 `3d-rings.html`（同心环全屏 demo，已被首页 3D hero 取代）与 `logos.html`（旧 logo 展示页，自包含样式）

### OG 分享图全套重做（17 张）
- **assets/og/og-*.png**: 全部 17 张分享图按新设计重新生成（1200×630，真实页面渲染帧），替换旧设计图

### 全站子页重主题（稿纸画布统一）
- **assets/css/siji-subs.css**（新增）: 子页重主题层，加载于 mimo.css/project.css 之后，不改 HTML 结构即把 16 个子页统一到稿纸画布设计系统——暖纸方格底、圆角白卡投影、荧光笔区块标题、胶囊按钮、金色进度条；固定亮色主题（禁用暗色模式）与系统光标；骨架屏机制停用（真实内容恒显）
- **16 个子页面**: head 接入 `siji-subs.css?v=3`（7 信息页 + 404 + 8 项目页；链接插到各页最后一个样式之后保证覆盖顺序）
- **各页专属内联样式重主题**: 能力页 cap-grid、管线页 gantt（金杆甘特）、项目页筛选器胶囊、about 时间线、demos 卡格、联系页卡片
- **index.html**: hero 标识恢复为 **3D 四季同心环**（Three.js + GSAP 常转 + 四季标注跟随），favicon 同步为同心环 2D 印记版；字体加回 Playfair Display 意大利体用于四季标注
- **sw.js**: 缓存清单补入 siji-subs.css
- **修复**: siji.js prepMascot 无 SVG 页面（3D hero）不触发 loaded 导致标题不显示的兜底
- **logo-lab.html**（新增，内部工具）: 6 方案 logo 比稿页（A 四时窗 / B 四字印 / C 枫桥拱 / D 亖四季条 / E 时轮彩 / F Z4 印）

## 2026-09-07

### 首页重构（对齐 oiloil.org 视觉语言）
- **index.html**: 整页重构为"稿纸画布"风格——米色方格纸背景、巨型无衬线标题、手绘吉祥物、白卡片产品矩阵、幽灵编号章节
- **assets/svg/logo-zep4yrs.svg**: 全新原创 logo「枫桥水车 · 晨光徽章」——暖石色实心石拱桥（枫桥，栏杆随拱起伏、纸色石缝与拱圈线）钉在原地不动；桥洞里原木水车被流水推着日夜转动（26s/圈，黄色车轴工心不移）；三层涟漪川流；桥洞红灯笼暖光摇曳；水面红枫浮水带倒影；晨阳与白云。取意「枫桥夜泊，江枫渔火」的日间暖色调。替换旧四象限圆环；favicon/PWA 图标随之更新
- **assets/css/siji.css**: 新设计系统（设计令牌、顶栏、hero、荧光笔标签、产品卡片、生态列表、大链接行、页脚、响应式、reduced-motion）
- **assets/js/siji.js**: 新交互系统——惯性平滑滚动（lerp + rAF/超时混合调度，键盘/触屏/捏合缩放保持原生）、吉祥物 SVG 描线入场、滚动显现（模糊+缩放+同帧错峰）、共享荧光笔滑动标签、卡片 3D 倾斜跟随 + logo 视差、hero 离场视差、幽灵编号漂移
- **sw.js**: 缓存版本 v1 → v3，纳入新资源
- 首页移除 Three.js / GSAP 依赖与卡片扇形（洗牌）交互；其余子页面暂保持原样式
- 资源引用带 `?v=` 版本参数，配合 SW stale-while-revalidate 更新

## 2026-08-06

### 内容修正
- **contact.html**: 删除邮箱转发描述和反馈表单（空壳无实际功能）
- **bluetidy.html**: 修正技术栈（Python/PySide6 → Rust/Tauri 2/React）、平台（跨平台 → 仅 Windows 10/11 x64）、版本（v1.2 → v0.2.0 Preview），删除 pip install 安装命令
- **ctf-qiankun.html**: 修正产品形态（浏览器扩展 → 纯前端 SPA）、技术栈（JavaScript/WebExtension → TypeScript/Vue/NestJS），删除 Chrome 商店安装描述
- **lannook.html**: 修正版本（v0.8 → v26.2.1）、传输协议（WebRTC/TLS → HTTP/WebSocket 明文），删除断点续传/P2P 直连/ cargo install 等不实描述
- **structvis.html**: 修正技术栈（JavaScript/Canvas/D3 → Svelte 5/SvelteKit/TypeScript），补充实际数据（18 引擎/23 页面/150 测试用例）
- **cryptovis.html**: 修正技术栈（JavaScript/Canvas/D3 → React 19/TypeScript/anime.js/KaTeX）、状态（活跃维护中 → 设计阶段·开发中），删除"开源"标签

### 批量修正
- 所有页面导航栏 CTF 乾坤袋描述：浏览器扩展工具 → CTF 工具箱（16 处）
- 所有页面 Pagefind 初始化脚本：移除无效的 `#__pf_dummy` 选择器（19 处）
- 公告页、RSS、首页预览中的 LanNook/CTF 乾坤袋版本和描述