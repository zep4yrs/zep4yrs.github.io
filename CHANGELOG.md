# 更新日志

## 2026-09-08

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