import type { Localized } from '../i18n/dict'

export type WorkStatus = 'public' | 'private' | 'experimental'
export type WorkCategory = 'security' | 'desktop' | 'education' | 'web' | 'game'
export type LinkKind = 'github' | 'gitee' | 'cnb'

export interface WorkLink {
  kind: LinkKind
  url: string
}

export interface Media {
  src: string
  alt: Localized
  caption: Localized
  kind: 'screenshot' | 'banner' | 'logo'
}

export interface Fact {
  label: Localized
  value: Localized
}

export interface Section {
  id: string
  label: Localized
  title: Localized
  body?: Localized[]
  bullets?: Localized[]
  facts?: Fact[]
  gallery?: Media[]
  note?: Localized
  /** 上游归属区块（仅 DiskSift 使用） */
  upstream?: {
    name: string
    url: string
    license: string
    note: Localized
  }
}

export interface WorkCover {
  type: 'image' | 'emblem' | 'monogram'
  src?: string
  glyph?: string
}

export interface Work {
  slug: string
  no: string
  title: Localized
  repoName?: string
  subtitle: Localized
  description: Localized
  year: string | null
  status: WorkStatus
  category: WorkCategory
  accent: string
  version: Localized | null
  cover: WorkCover
  logo?: string
  links: WorkLink[]
  restricted?: boolean
  sections: Section[]
  seo: { title: Localized; description: Localized }
}

const z = (zh: string, en: string): Localized => ({ zh, en })

const GH = (repo: string): WorkLink => ({ kind: 'github', url: `https://github.com/zep4yrs/${repo}` })
const GITEE = (repo: string): WorkLink => ({
  kind: 'gitee',
  url: `https://gitee.com/Map1eBr1dge/${repo}`,
})
const CNB = (repo: string): WorkLink => ({ kind: 'cnb', url: `https://cnb.cool/feng-qiao/${repo}` })

/* ==========================================================================
   十件作品 — 全部内容来自对真实云端仓库的调查
   ========================================================================== */

export const works: Work[] = [
  /* ---------------------------------------------------------------- 01 */
  {
    slug: 'sitelens',
    no: '01',
    title: z('SiteLens', 'SiteLens'),
    subtitle: z('站点安全观察、验证与证据记录', 'Site security observation, verification, evidence'),
    description: z(
      '把每条警报变成可复核的验证结论。输入一个网址，得到可复现的证据链，而不是一堆猜测。',
      'Every alert becomes a verifiable conclusion. Give it a URL and you get a reproducible evidence chain — not a pile of guesses.',
    ),
    year: '2026',
    status: 'public',
    category: 'security',
    accent: '#2b5fd6',
    version: z('v5.0.0', 'v5.0.0'),
    cover: { type: 'image', src: '/media/sitelens/banner.webp' },
    logo: '/media/sitelens/logo.webp',
    links: [GH('sitelens'), GITEE('sitelens'), CNB('sitelens')],
    seo: {
      title: z(
        'SiteLens — 验证型 Web 站点安全评估平台 · 枫桥 zep4yrs',
        'SiteLens — Verification-first web security assessment · Fengqiao zep4yrs',
      ),
      description: z(
        'SiteLens 是枫桥开发的验证型 Web 站点安全评估平台：372 条精编指纹规则、11024 条漏洞情报、117,889 条可运行模板、DAST 主动探测与可复现证据链。5.0 引入机器学习风险评分。',
        'SiteLens is a verification-first web security assessment platform by Fengqiao: 372 curated fingerprint rules, 11024 vulnerability intel entries, 117,889 runnable templates, DAST probing and a reproducible evidence chain. 5.0 adds machine-learning risk scoring.',
      ),
    },
    sections: [
      {
        id: 'overview',
        label: z('概览', 'Overview'),
        title: z('一套红队核心工具', 'A red-team core tool'),
        body: [
          z(
            'SiteLens 是一套红队核心工具，也是一台验证型 Web 站点安全评估平台。它不做「可能有问题」的猜测式扫描，而是把每一次判定落到可复核的证据上：重放请求、响应快照、命中信号，以及一条可以直接粘贴进终端的 curl 复现命令。',
            'SiteLens is a red-team core tool and a verification-first web security assessment platform. It does not fire off "possibly vulnerable" guesses — every verdict lands on reviewable evidence: the replayed request, the response snapshot, the matched signal, and a curl command you can paste straight into a terminal.',
          ),
          z(
            '仓库以 Go 单二进制分发，零外部运行时依赖；同时提供 CLI、桌面壳与终端 TUI 三种使用方式。',
            'It ships as a single Go binary with no external runtime dependency, and offers three ways in: a CLI, a desktop shell, and a terminal TUI.',
          ),
        ],
        facts: [
          { label: z('许可', 'License'), value: z('GPL-3.0', 'GPL-3.0') },
          { label: z('语言', 'Language'), value: z('Go · TypeScript', 'Go · TypeScript') },
          { label: z('仓库', 'Repository'), value: z('sitelens', 'sitelens') },
        ],
      },
      {
        id: 'why',
        label: z('为什么', 'Why'),
        title: z('扫描器给结论，SiteLens 给证据', 'Scanners give verdicts; SiteLens gives evidence'),
        body: [
          z(
            '自动化扫描最贵的成本不是跑一次，而是跑完之后还要人工逐条复核。SiteLens 把「可复核」当作第一设计目标：证据链在扫描过程中同步生成，而不是事后补记。',
            'The expensive part of automated scanning is not the run — it is the manual re-checking afterwards. SiteLens treats reviewability as its first design goal: the evidence chain is produced during the scan rather than reconstructed later.',
          ),
        ],
      },
      {
        id: 'capabilities',
        label: z('核心能力', 'Capabilities'),
        title: z('从指纹到攻击链', 'From fingerprint to attack chain'),
        bullets: [
          z(
            '七种扫描模式：quick / standard / deep / full / assets / stealth / apocalypse——从分钟级的核心验证集，到全模块加大量模板的完整流水线，也可只做资产测绘或以隐匿姿态穿过 WAF。',
            'Seven scan modes — quick / standard / deep / full / assets / stealth / apocalypse: from a minute-scale core verification set to a full-module pipeline with a large template pool, or asset mapping alone, or a stealth posture that works through a WAF.',
          ),
          z(
            '流水线阶段：指纹识别 → 安全头评分 → 专项 check → Nuclei 模板子集 → 被动检测 → DAST 参数探测 → 子域 / 目录 / 端口 / WebShell 枚举。',
            'Pipeline stages: fingerprinting → security-header scoring → dedicated checks → a Nuclei template subset → passive detection → DAST parameter probing → subdomain / directory / port / WebShell enumeration.',
          ),
          z(
            '证据链：重放请求、响应快照、命中信号与 curl 一键复现，让每一条结论都能被独立验证。',
            'Evidence chain: replayed request, response snapshot, matched signal and one-click curl reproduction, so every conclusion can be verified independently.',
          ),
          z(
            '白盒源码审计：由 tree-sitter 驱动，在拿到源码时把黑盒结论与代码位置对上。',
            'White-box source audit: driven by tree-sitter, mapping black-box conclusions back to code locations when source is available.',
          ),
          z(
            '攻击链关联：由证据驱动建链，把分散的发现串成一条可读的利用路径。',
            'Attack-chain correlation: evidence-driven chaining that turns scattered findings into one readable exploitation path.',
          ),
        ],
      },
      {
        id: 'ml',
        label: z('5.0 · 机器学习', '5.0 · Machine learning'),
        title: z('风险评分由机器学习承担', 'Risk scoring handled by machine learning'),
        body: [
          z(
            '5.0 的方向是机器学习，而不是大语言模型产品。仓库内包含独立的 ML 工程目录与 ONNX 模型资产，配置项 ml.predict 控制总闸、ml.assets_dir 指定模型资产目录，用来对扫描结果做风险评分与排序。',
            'The direction of 5.0 is machine learning, not an LLM product. The repository carries a separate ML engineering directory and ONNX model assets; the ml.predict flag is the master switch and ml.assets_dir points at the model assets, used to score and rank scan results.',
          ),
        ],
        note: z(
          '此处的「机器学习」指仓库内可验证的 ONNX 推理资产与评分链路。',
          'Here "machine learning" refers to the ONNX inference assets and scoring pipeline that are verifiable inside the repository.',
        ),
      },
      {
        id: 'interfaces',
        label: z('使用方式', 'Interfaces'),
        title: z('CLI、桌面与终端', 'CLI, desktop and terminal'),
        bullets: [
          z(
            'CLI：sitelens scan <url> 直接扫描，sitelens serve 启动服务。',
            'CLI: sitelens scan <url> to scan directly, sitelens serve to start the service.',
          ),
          z(
            '桌面版：Electron 外壳 + Go 引擎，带自动更新。',
            'Desktop: an Electron shell around the Go engine, with auto-update.',
          ),
          z(
            'TUI：基于 Ink 与 React 19 的终端界面，适合在服务器上直接操作。',
            'TUI: a terminal interface built on Ink and React 19, meant for working directly on a server.',
          ),
        ],
      },
      {
        id: 'architecture',
        label: z('架构', 'Architecture'),
        title: z('单二进制内的 38 个包', '38 packages inside one binary'),
        body: [
          z(
            '进程入口在 cmd/sitelens/，internal/ 下按职责拆分为 38 个包，涵盖引擎、目标与 httpx、爬虫、情报、模板漏斗、模块、DAST、白盒审计、机器学习、存储与服务端。浏览器能力通过 Chromium / chromedp 驱动。',
            'The entry point lives in cmd/sitelens/, and internal/ splits into 38 packages by responsibility: engine, target & httpx, crawler, intelligence, template funnel, modules, DAST, white-box audit, machine learning, storage and server. Browser capability is driven through Chromium / chromedp.',
          ),
          z(
            '仓库内共有 104 个 Go 测试文件，分布在 34 个包中，并在 CI 中设置了阻断级的竞态检测门禁。',
            'The repository carries 104 Go test files across 34 packages, with a blocking race-detection gate in CI.',
          ),
        ],
      },
      {
        id: 'evolution',
        label: z('演进', 'Evolution'),
        title: z('从漏洞验证到攻击链，再到风险评分', 'From verification, to attack chains, to risk scoring'),
        body: [
          z(
            '1.0 做发现（指纹、资产、情报关联与 DAST），3.0 加入利用级无害验证，4.0 把结果连成攻击链并做黑白盒验证，5.0.0 引入机器学习风险评分。仓库内的版本横幅与路线图保留了这条演进轨迹。',
            '1.0 covered discovery (fingerprints, assets, intelligence correlation and DAST), 3.0 added non-destructive exploit-level verification, 4.0 chained findings into attack paths with black-box/white-box verification, and 5.0.0 brought machine-learning risk scoring. The version banners and roadmap kept in the repository record that trajectory.',
          ),
        ],
        gallery: [
          {
            src: '/media/sitelens/banner-4.0-attackchain.webp',
            alt: z('SiteLens 4.0 攻击链版本横幅', 'SiteLens 4.0 attack-chain banner'),
            caption: z('4.0 · 攻击链', '4.0 · Attack chain'),
            kind: 'banner',
          },
          {
            src: '/media/sitelens/banner-3.0-exploit.webp',
            alt: z('SiteLens 3.0 漏洞验证版本横幅', 'SiteLens 3.0 exploit-verification banner'),
            caption: z('3.0 · 漏洞验证', '3.0 · Exploit verification'),
            kind: 'banner',
          },
          {
            src: '/media/sitelens/roadmap.webp',
            alt: z('SiteLens 路线图', 'SiteLens roadmap'),
            caption: z('路线图', 'Roadmap'),
            kind: 'banner',
          },
          {
            src: '/media/sitelens/release-3.0.0.webp',
            alt: z('SiteLens 3.0.0 发布图', 'SiteLens 3.0.0 release plate'),
            caption: z('3.0.0 发布', '3.0.0 release'),
            kind: 'banner',
          },
        ],
        note: z(
          '以上均为仓库 assets/ 目录中的真实素材。',
          'All images above are real assets from the repository’s assets/ directory.',
        ),
      },
    ],
  },

  /* ---------------------------------------------------------------- 02 */
  {
    slug: 'lannook',
    no: '02',
    title: z('LanNook', 'LanNook'),
    subtitle: z('可信局域网内用电脑和手机浏览器双向传文件', 'Two-way file transfer between PC and phone browsers on a trusted LAN'),
    description: z(
      '同一局域网里，用手机浏览器和电脑互传文件——不用装 App，扫码配对即可。',
      'Move files between a phone browser and your computer on the same LAN — no app to install, just pair and send.',
    ),
    year: '2026',
    status: 'public',
    category: 'desktop',
    accent: '#2470cf',
    version: z('v26.4.0', 'v26.4.0'),
    cover: { type: 'emblem', src: '/media/lannook/app-icon.webp' },
    logo: '/media/lannook/app-icon.webp',
    links: [GH('lannook'), GITEE('lannook'), CNB('lannook')],
    seo: {
      title: z('LanNook — 可信局域网双向传文件 · 枫桥 zep4yrs', 'LanNook — Two-way transfer on a trusted LAN · Fengqiao zep4yrs'),
      description: z(
        'LanNook 是枫桥开发的开源、本地优先的局域网文件传输工具：电脑与手机浏览器双向互传，mDNS 发现、PIN 配对、分块续传与 SHA-256 校验，基于 Rust 与 Tauri 2。',
        'LanNook is an open-source, local-first LAN file transfer tool by Fengqiao: two-way transfer between a computer and phone browsers, mDNS discovery, PIN pairing, chunked resume and SHA-256 verification, built on Rust and Tauri 2.',
      ),
    },
    sections: [
      {
        id: 'overview',
        label: z('概览', 'Overview'),
        title: z('可信邻近设备之间的传输', 'Transfer between trusted nearby devices'),
        body: [
          z(
            'LanNook 面向可信邻近设备：在同一个局域网里，电脑与手机浏览器可以直接互传文件。手机侧不需要安装任何应用，打开浏览器就能收发；电脑侧是原生桌面程序，支持选择与拖放。',
            'LanNook targets trusted nearby devices: on the same local network, a computer and a phone browser transfer files directly. The phone side installs nothing — open a browser and you can send and receive; the computer side is a native desktop app with file picking and drag-and-drop.',
          ),
          z(
            '项目早期名为 LYNQO，后更名为 LanNook。仓库保留了版本化的发布说明。',
            'The project was originally named LYNQO and later renamed to LanNook. The repository keeps versioned release notes.',
          ),
        ],
        facts: [
          { label: z('许可', 'License'), value: z('GPL-3.0-only', 'GPL-3.0-only') },
          { label: z('语言', 'Language'), value: z('Rust · TypeScript', 'Rust · TypeScript') },
          { label: z('仓库', 'Repository'), value: z('lannook', 'lannook') },
        ],
      },
      {
        id: 'features',
        label: z('核心功能', 'Features'),
        title: z('配对、传输、可追溯', 'Pair, transfer, trace'),
        bullets: [
          z(
            '设备发现：基于 mDNS 自动发现同网段设备，并提供连接诊断。',
            'Discovery: mDNS finds devices on the same segment automatically, with built-in connection diagnostics.',
          ),
          z(
            '配对：6 位 PIN 码，一次性使用、5 分钟有效，连续输错会锁定。',
            'Pairing: a 6-digit PIN, single-use and valid for five minutes, with lockout after repeated wrong entries.',
          ),
          z(
            '传输：512 KiB 分块上传，自动重试，支持断点续传与跨会话续传，完成后做 SHA-256 校验。',
            'Transfer: 512 KiB chunked uploads, automatic retry, resume within and across sessions, and SHA-256 verification on completion.',
          ),
          z(
            '传输中心：等待 / 进行中 / 已完成 / 暂停任务集中管理，可按文件名或设备搜索，支持批量重试与批量删除记录。',
            'Transfer center: waiting, in-progress, completed and paused jobs in one place, searchable by file name or device, with batch retry and batch record cleanup.',
          ),
          z(
            '访问控制：下载限速，设备授权时长可选本次 / 1 小时 / 24 小时 / 7 天，并可自动撤销。',
            'Access control: download rate limiting, device authorisation windows of this session / 1 hour / 24 hours / 7 days, and automatic revocation.',
          ),
          z(
            '本地存储：设备、授权与传输记录写入本地 SQLite；另提供系统托盘、开机自启与更新检查。',
            'Local storage: devices, authorisations and transfer records go into a local SQLite database, alongside a system tray, launch-at-login and update checks.',
          ),
        ],
      },
      {
        id: 'tech',
        label: z('技术实现', 'Implementation'),
        title: z('Tauri 2 + Rust + Vue', 'Tauri 2 + Rust + Vue'),
        body: [
          z(
            '桌面壳使用 Tauri 2，后端为 Rust：axum 提供 HTTP 服务、tokio 负责异步运行时、rusqlite 落库、mdns-sd 做发现、sha2 做校验、qrcode 生成配对码。前端为 Vue 3.5 + TypeScript + Vite 6 + Pinia，界面动效使用 anime.js。',
            'The desktop shell is Tauri 2 with a Rust backend: axum serves HTTP, tokio drives the async runtime, rusqlite persists state, mdns-sd handles discovery, sha2 verifies payloads and qrcode renders pairing codes. The front end is Vue 3.5 + TypeScript + Vite 6 + Pinia, with anime.js for interface motion.',
          ),
          z(
            '构建目标覆盖 Windows、macOS 与 Linux，Windows 安装器内置中英文语言支持。',
            'Build targets cover Windows, macOS and Linux; the Windows installer ships with both Chinese and English.',
          ),
        ],
        facts: [
          { label: z('桌面壳', 'Shell'), value: z('Tauri 2', 'Tauri 2') },
          { label: z('后端', 'Backend'), value: z('Rust · axum · rusqlite', 'Rust · axum · rusqlite') },
          { label: z('前端', 'Frontend'), value: z('Vue 3.5 · Pinia', 'Vue 3.5 · Pinia') },
        ],
      },
      {
        id: 'media',
        label: z('素材说明', 'Material note'),
        title: z('关于界面素材', 'On interface material'),
        note: z(
          '仓库内没有提供产品运行界面截图，因此本页不放置任何界面图。上方图版使用仓库中的真实应用图标。',
          'The repository does not contain product UI screenshots, so no interface imagery is shown here. The plate above uses the real application icon from the repository.',
        ),
      },
    ],
  },

  /* ---------------------------------------------------------------- 03 */
  {
    slug: 'bluetidy',
    no: '03',
    title: z('BlueTidy', 'BlueTidy'),
    subtitle: z('Windows 磁盘分析与软件资产整理', 'Windows disk analysis and software asset tidying'),
    description: z(
      '先看清空间，再安全处理。文件夹模式看清占用，应用模式治理软件资产，每一步都能回滚。',
      'See the space first, then act safely. Folder mode shows what occupies the disk; app mode governs software assets — every step reversible.',
    ),
    year: '2026',
    status: 'public',
    category: 'desktop',
    accent: '#1a72b4',
    version: z('v0.2.0 Preview', 'v0.2.0 Preview'),
    cover: { type: 'image', src: '/media/bluetidy/application-mode.webp' },
    logo: '/media/bluetidy/logo.webp',
    links: [GH('BlueTidy'), GITEE('BlueTidy'), CNB('BlueTidy')],
    seo: {
      title: z('BlueTidy — Windows 磁盘分析与软件资产整理 · 枫桥 zep4yrs', 'BlueTidy — Windows disk analysis and software asset tidying · Fengqiao zep4yrs'),
      description: z(
        'BlueTidy 是枫桥开发的 Windows 磁盘空间分析、软件资产治理与可回滚迁移工具，v0.2.0 Preview，基于 Rust 与 Tauri 2，提供占用矩形图、软件资产库、迁移预检与事务回滚。',
        'BlueTidy is a Windows disk-space analysis, software-asset governance and reversible migration tool by Fengqiao, at v0.2.0 Preview, built on Rust and Tauri 2 with occupancy treemaps, a software asset library, migration pre-checks and transactional rollback.',
      ),
    },
    sections: [
      {
        id: 'overview',
        label: z('概览', 'Overview'),
        title: z('两种模式，一条安全底线', 'Two modes, one safety floor'),
        body: [
          z(
            'BlueTidy 面向 Windows，把「磁盘空间去哪了」和「装了哪些软件」这两件事放在同一个界面里处理。文件夹模式负责看清占用，应用模式负责治理软件资产；所有会改动磁盘的操作都带预检与回滚。',
            'BlueTidy is built for Windows and handles two questions in one interface: where did the disk space go, and what is actually installed. Folder mode shows occupancy; app mode governs software assets. Anything that touches the disk comes with a pre-check and a rollback path.',
          ),
        ],
        facts: [
          { label: z('许可', 'License'), value: z('MIT', 'MIT') },
          { label: z('语言', 'Language'), value: z('Rust · TypeScript', 'Rust · TypeScript') },
          { label: z('仓库', 'Repository'), value: z('BlueTidy', 'BlueTidy') },
        ],
      },
      {
        id: 'folder-mode',
        label: z('文件夹模式', 'Folder mode'),
        title: z('先看清占用', 'See the occupancy first'),
        bullets: [
          z(
            '按占用排序的目录树、矩形图（treemap）与排行榜三种视图联动。',
            'An occupancy-sorted directory tree, a treemap and a ranking view, all linked.',
          ),
          z('支持按名称搜索、导出 CSV，以及两次扫描快照之间的对比。', 'Search by name, export to CSV, and compare two scan snapshots.'),
        ],
      },
      {
        id: 'app-mode',
        label: z('应用模式', 'App mode'),
        title: z('再安全处理', 'Then act safely'),
        bullets: [
          z(
            '软件资产库：汇总已安装软件，附带安装证据，识别 Steam、Epic、Xbox 与 Microsoft Store（MSIX）等来源。',
            'Software asset library: aggregates installed software with install evidence, recognising sources such as Steam, Epic, Xbox and Microsoft Store (MSIX).',
          ),
          z(
            '迁移预检、瘦身清理与事务回滚：迁移使用 Windows 目录联接，过程写入事务日志，并提供回滚校验。',
            'Migration pre-check, slimming cleanup and transactional rollback: migration uses Windows directory junctions, records a transaction log and verifies the rollback.',
          ),
          z(
            '安全边界：Windows、System32、SysWOW64、Drivers、WindowsApps 等路径受到保护；同时检查符号链接与重解析点，跨卷复制后会再次核对。',
            'Safety boundary: paths such as Windows, System32, SysWOW64, Drivers and WindowsApps are protected; symbolic links and reparse points are checked, and cross-volume copies are verified afterwards.',
          ),
          z(
            'TidyPilot：本地规则搭配 5 组内置提示词，也可选择接入 OpenAI 兼容接口。',
            'TidyPilot: local rules with five built-in prompt sets, optionally wired to an OpenAI-compatible endpoint.',
          ),
        ],
      },
      {
        id: 'tech',
        label: z('技术实现', 'Implementation'),
        title: z('Rust 核心 + React 界面', 'Rust core + React interface'),
        body: [
          z(
            '应用由 Tauri 2 承载，Rust 侧按职责拆成 asset-model、collector、migrator、advisor 与 smoke 五个 crate；前端为 React 18 + Vite + TypeScript。',
            'The app runs on Tauri 2; the Rust side is split into five crates by responsibility — asset-model, collector, migrator, advisor and smoke — with a React 18 + Vite + TypeScript front end.',
          ),
        ],
        facts: [
          { label: z('桌面壳', 'Shell'), value: z('Tauri 2', 'Tauri 2') },
          { label: z('核心 crate', 'Core crates'), value: z('asset-model · collector · migrator · advisor · smoke', 'asset-model · collector · migrator · advisor · smoke') },
          { label: z('前端', 'Frontend'), value: z('React 18 · Vite', 'React 18 · Vite') },
        ],
      },
      {
        id: 'gallery',
        label: z('界面', 'Interface'),
        title: z('实际界面', 'The actual interface'),
        gallery: [
          {
            src: '/media/bluetidy/application-mode.webp',
            alt: z('BlueTidy 应用模式首页', 'BlueTidy application-mode home'),
            caption: z('应用模式首页', 'Application mode'),
            kind: 'screenshot',
          },
          {
            src: '/media/bluetidy/logo.webp',
            alt: z('BlueTidy 标识', 'BlueTidy mark'),
            caption: z('标识', 'Mark'),
            kind: 'logo',
          },
        ],
        note: z(
          '截图来自仓库 docs/assets/screenshots/。',
          'Screenshot taken from the repository’s docs/assets/screenshots/.',
        ),
      },
    ],
  },

  /* ---------------------------------------------------------------- 04 */
  {
    slug: 'disksift',
    no: '04',
    title: z('DiskSift', 'DiskSift'),
    subtitle: z('基于 Pinkbin 的重构发行版', 'A refactored distribution built on Pinkbin'),
    description: z(
      '筛出你盘里能清的。秒扫整盘、AI 分诊上色、红线双层兜底——它是 Pinkbin（MIT）的重构发行版。',
      'Sift the cleanable out of your drive. Whole-disk scans in seconds, AI triage colouring, a two-layer redline — a refactored distribution of Pinkbin (MIT).',
    ),
    year: '2026',
    status: 'public',
    category: 'desktop',
    accent: '#3a52e0',
    version: z('v26.1.4', 'v26.1.4'),
    cover: { type: 'image', src: '/media/disksift/hero.webp' },
    logo: '/media/disksift/logo.webp',
    links: [GH('DiskSift'), CNB('DiskSift')],
    seo: {
      title: z('DiskSift — 基于 Pinkbin 的 Windows 磁盘清理重构发行版 · 枫桥 zep4yrs', 'DiskSift — A refactored Windows disk-cleanup distribution of Pinkbin · Fengqiao zep4yrs'),
      description: z(
        'DiskSift 是枫桥基于 Pinkbin（MIT）重构发行的 Windows 磁盘分析工具：NTFS MFT 秒扫、矩形图与树联动、AI 分诊、脚本中心、撤销中心与 NEVER_TOUCH 红线，GPL-3.0-or-later。',
        'DiskSift is a Windows disk-analysis tool refactored and distributed by Fengqiao on top of Pinkbin (MIT): NTFS MFT fast scans, linked treemap and tree, AI triage, a script center, an undo center and the NEVER_TOUCH redline, under GPL-3.0-or-later.',
      ),
    },
    sections: [
      {
        id: 'upstream',
        label: z('上游归属', 'Upstream'),
        title: z('它站在 Pinkbin 的肩膀上', 'Standing on Pinkbin’s shoulders'),
        upstream: {
          name: 'Pinkbin',
          url: 'https://github.com/cccyd2003-qwq/pinkbin',
          license: 'MIT',
          note: z(
            'DiskSift 是 Pinkbin（MIT）的重构发行版。安全架构与最初实现继承自上游；本发行版包含并修改了源自 Pinkbin 的代码，上游版权与 MIT 许可声明在仓库 LICENSE 中原文保留。DiskSift 自身以 GPL-3.0-or-later 分发。',
            'DiskSift is a refactored distribution of Pinkbin (MIT). The safety architecture and the original implementation come from upstream; this distribution contains and modifies code originating from Pinkbin, and the upstream copyright and MIT licence notice are preserved verbatim in the repository LICENSE. DiskSift itself is distributed under GPL-3.0-or-later.',
          ),
        },
        body: [
          z(
            '这一点必须说清楚：DiskSift 不是从零原创的项目，而是一次有明确上游归属的重构发行。它保留上游的安全设计原则，并在此基础上重做工作台与交互。',
            'This needs to be said plainly: DiskSift is not an original project built from scratch — it is a refactored distribution with explicit upstream attribution. It keeps the upstream safety principles and rebuilds the workbench and interaction on top.',
          ),
        ],
        facts: [
          { label: z('上游', 'Upstream'), value: z('Pinkbin · MIT', 'Pinkbin · MIT') },
          { label: z('本发行版许可', 'This distribution'), value: z('GPL-3.0-or-later', 'GPL-3.0-or-later') },
        ],
      },
      {
        id: 'overview',
        label: z('概览', 'Overview'),
        title: z('先分诊，再动手', 'Triage first, act second'),
        body: [
          z(
            'DiskSift 把磁盘清理拆成三步：秒扫整盘看清占用，AI 分诊给目录上色，最后才由人决定清哪些。它同时提供一套现代 IDE 式工作台与浏览器式多标签，方便在多处之间来回对照。',
            'DiskSift splits disk cleanup into three steps: scan the whole drive in seconds to see occupancy, let AI triage colour the directories, and only then let a human decide what to clear. It pairs that with a modern IDE-style workbench and browser-style tabs for moving between places.',
          ),
        ],
      },
      {
        id: 'features',
        label: z('核心功能', 'Features'),
        title: z('从秒扫到撤销', 'From fast scan to undo'),
        bullets: [
          z(
            'NTFS MFT 秒扫：直接读取 NTFS 主文件表，整盘出图以秒计。',
            'NTFS MFT fast scan: reads the NTFS master file table directly, so a whole drive maps out in seconds.',
          ),
          z(
            '矩形图与树双向同步：点击矩形定位目录，选中目录高亮矩形，配合面包屑下钻与占用圆环。',
            'Linked treemap and tree: click a rectangle to locate the directory, select a directory to highlight its rectangle, with breadcrumb drilling and an occupancy ring.',
          ),
          z(
            'AI 分诊：输出五桶分诊报告，支持批量分诊与拖入文件夹细问；只提交目录元数据，不读取文件内容。',
            'AI triage: a five-bucket triage report, batch triage and drag-in-a-folder follow-ups; only directory metadata is submitted, never file contents.',
          ),
          z(
            '脚本中心：内置 36 个清理脚本定义，规则化描述「什么可以清」。',
            'Script center: 36 built-in cleanup script definitions that describe, as rules, what is safe to clear.',
          ),
          z(
            '定时自动巡查：通过 Windows 计划任务无头运行，只处理被判定为安全的桶。',
            'Scheduled patrol: runs headless via Windows Task Scheduler and only touches the bucket judged safe.',
          ),
          z(
            '撤销中心：操作写入 undo.jsonl，按天分组，可回溯撤销。',
            'Undo center: operations are written to undo.jsonl, grouped by day and reversible.',
          ),
          z(
            '红线保护：NEVER_TOUCH 保护区，Rust 执行层 fail-closed，界面与执行层双层兜底。',
            'Redline protection: a NEVER_TOUCH zone with a fail-closed Rust executor — a two-layer guard shared by the interface and the execution layer.',
          ),
        ],
      },
      {
        id: 'tech',
        label: z('技术实现', 'Implementation'),
        title: z('八个 Rust crate', 'Eight Rust crates'),
        body: [
          z(
            '工作区按职责拆成 scanner、scaffold、executor、advisor、scaffold-lint、steam-inspector、excludes 与 monitor 八个 crate；桌面端为 Tauri 2 + React 18，矩形图使用 d3-hierarchy，扫描侧使用 ntfs 与 jwalk。',
            'The workspace splits into eight crates by responsibility: scanner, scaffold, executor, advisor, scaffold-lint, steam-inspector, excludes and monitor. The desktop app is Tauri 2 + React 18, the treemap uses d3-hierarchy, and scanning leans on the ntfs and jwalk crates.',
          ),
          z(
            '版本号采用自定义规则 YY.breaking+1.feature+1.patch+1，因此当前版本读作 26.1.4。',
            'Versioning follows a custom scheme — YY.breaking+1.feature+1.patch+1 — which is why the current version reads 26.1.4.',
          ),
        ],
        facts: [
          { label: z('桌面壳', 'Shell'), value: z('Tauri 2', 'Tauri 2') },
          { label: z('核心 crate', 'Core crates'), value: z('scanner · scaffold · executor · advisor · monitor …', 'scanner · scaffold · executor · advisor · monitor …') },
          { label: z('前端', 'Frontend'), value: z('React 18 · d3-hierarchy', 'React 18 · d3-hierarchy') },
        ],
      },
      {
        id: 'gallery',
        label: z('界面', 'Interface'),
        title: z('实际界面', 'The actual interface'),
        gallery: [
          {
            src: '/media/disksift/hero.webp',
            alt: z('DiskSift 主工作台', 'DiskSift main workbench'),
            caption: z('主工作台', 'Workbench'),
            kind: 'screenshot',
          },
          {
            src: '/media/disksift/triage.webp',
            alt: z('DiskSift AI 分诊', 'DiskSift AI triage'),
            caption: z('AI 分诊', 'AI triage'),
            kind: 'screenshot',
          },
          {
            src: '/media/disksift/dark.webp',
            alt: z('DiskSift 暗色主题', 'DiskSift dark theme'),
            caption: z('暗色主题', 'Dark theme'),
            kind: 'screenshot',
          },
          {
            src: '/media/disksift/empty.webp',
            alt: z('DiskSift 早期原型（Diskwise 时期）的空状态', 'DiskSift early-prototype empty state from the Diskwise era'),
            caption: z('早期原型 · 空状态', 'Early prototype · Empty'),
            kind: 'screenshot',
          },
        ],
        note: z(
          '截图来自仓库 docs/screenshots/。其中空状态一图是更早的原型（项目当时名为 Diskwise），仓库 docs/archive/ 中保留了那一阶段的交接记录。',
          'Screenshots come from the repository’s docs/screenshots/. The empty-state shot is from an earlier prototype, when the project was still named Diskwise — the repository keeps that phase’s handoff record under docs/archive/.',
        ),
      },
    ],
  },

  /* ---------------------------------------------------------------- 05 */
  {
    slug: 'ctfhub',
    no: '05',
    title: z('CTFHub', 'CTFHub'),
    repoName: 'ctf-qiankun',
    subtitle: z('CTF 在线工具聚合站', 'An aggregation site for CTF tooling'),
    description: z(
      '把 CTF 场景里散落各处的工具收拢到一处，打开浏览器就能直接用。',
      'Gathering CTF tooling from all over into one place you can use straight from the browser.',
    ),
    year: '2026',
    status: 'public',
    category: 'web',
    accent: '#5540e0',
    version: z('v2.2.5', 'v2.2.5'),
    cover: { type: 'emblem', src: '/media/ctfhub/mark.svg' },
    logo: '/media/ctfhub/mark.svg',
    links: [GH('ctf-qiankun'), GITEE('ctf-qiankun'), CNB('ctf-qiankun')],
    seo: {
      title: z('CTFHub — CTF 在线工具聚合站 · 枫桥 zep4yrs', 'CTFHub — An aggregation site for CTF tooling · Fengqiao zep4yrs'),
      description: z(
        'CTFHub 是枫桥开发的 CTF 在线工具聚合站：16 个分类、430 余件在线工具，覆盖编码转换、密码学、Web、取证、隐写、逆向与杂项，支持拼音搜索与多步骤操作链。',
        'CTFHub is an aggregation site for CTF tooling by Fengqiao: 16 categories and 430+ online tools spanning encoding, cryptography, web, forensics, steganography, reverse engineering and misc, with pinyin search and multi-step operation chains.',
      ),
    },
    sections: [
      {
        id: 'overview',
        label: z('概览', 'Overview'),
        title: z('聚合，而不是再写一个工具箱', 'Aggregate, not another toolbox'),
        body: [
          z(
            'CTFHub 的核心方向是聚合、整理并提供 CTF 场景下可以直接在线使用的工具：把平时散落在各个站点、脚本和本地程序里的能力收拢到一处，按方向归类，需要的时候打开就能用。',
            'The core direction of CTFHub is to aggregate, organise and provide CTF tools that can be used online right away — gathering capabilities normally scattered across sites, scripts and local programs into one place, sorted by direction and ready when needed.',
          ),
          z(
            '项目原名「CTF 乾坤袋」，现已正式更名为 CTFHub。仓库名仍为 ctf-qiankun。',
            'The project was originally called "CTF 乾坤袋" and has been formally renamed to CTFHub. The repository name remains ctf-qiankun.',
          ),
        ],
        facts: [
          { label: z('许可', 'License'), value: z('MIT', 'MIT') },
          { label: z('语言', 'Language'), value: z('TypeScript', 'TypeScript') },
          { label: z('仓库', 'Repository'), value: z('ctf-qiankun', 'ctf-qiankun') },
        ],
      },
      {
        id: 'catalog',
        label: z('工具目录', 'Catalogue'),
        title: z('16 个分类，430 余件工具', '16 categories, 430+ tools'),
        body: [
          z(
            '仓库中 client/src/tools/ 目录下实际存在 16 个分类、437 个工具目录。分类与数量以仓库为准：',
            'The client/src/tools/ directory in the repository holds 16 categories and 437 tool directories. Categories and counts follow the repository:',
          ),
        ],
        bullets: [
          z('编码与文本转换 47 · 文本处理与开发辅助 40', 'Encoding & text conversion 47 · Text processing & dev aids 40'),
          z('古典密码 37 · 哈希与密码学辅助 43 · 现代密码学 22', 'Classical ciphers 37 · Hashing & crypto aids 43 · Modern cryptography 22'),
          z('Web 与网络数据 40 · Web 安全 22', 'Web & network data 40 · Web security 22'),
          z('文件与二进制分析 43 · 图片音频与隐写 44', 'File & binary analysis 43 · Image, audio & steganography 44'),
          z('PWN 与逆向 20 · 取证 20 · OSINT 10 · 隐写分析 8', 'PWN & reverse 20 · Forensics 20 · OSINT 10 · Steganalysis 8'),
          z('Misc 工具 7 · 通用安全工具 6 · Misc 与深奥语言 28', 'Misc tools 7 · General security 6 · Misc & esoteric languages 28'),
        ],
        note: z(
          '以上分类与数量来自仓库目录结构，不包含尚未实现的规划项。',
          'Categories and counts come from the repository’s directory structure and exclude anything not yet implemented.',
        ),
      },
      {
        id: 'interaction',
        label: z('使用方式', 'How it works'),
        title: z('找得到、串得起', 'Findable and chainable'),
        bullets: [
          z(
            '工具搜索：为每个工具建立拼音索引，支持全拼与首字母检索。',
            'Tool search: a pinyin index per tool supports both full-spelling and initial-letter lookup.',
          ),
          z(
            '分类浏览、收藏与最近使用：按方向归类，常用工具随手可取。',
            'Category browsing, favourites and recents: sorted by direction, so frequently used tools stay within reach.',
          ),
          z(
            '智能编解码与多步骤操作链：把一步接一步的转换串成一条链，避免反复复制粘贴。',
            'Smart codec and multi-step operation chains: string step-by-step transforms into one chain instead of copy-paste round trips.',
          ),
          z(
            '内置说明与工具手册：每个工具都带使用说明，降低查找与试错成本。',
            'Built-in help and a tool manual: every tool carries usage notes, cutting down on searching and trial and error.',
          ),
        ],
      },
      {
        id: 'tech',
        label: z('技术实现', 'Implementation'),
        title: z('注册表驱动的工具站', 'A registry-driven tool site'),
        body: [
          z(
            '工具由 client/src/tools/registry.ts 统一注册，通过 import.meta.glob 动态加载组件，配合 meta-manifest.ts 描述元信息。新增一个工具只需要放入目录并登记，不需要改动页面结构。',
            'Tools are registered centrally in client/src/tools/registry.ts and loaded dynamically through import.meta.glob, with meta-manifest.ts describing metadata. Adding a tool means dropping in a directory and registering it — no page restructuring.',
          ),
          z(
            '前端使用 React 19 + Vite 7 + TypeScript + Tailwind 4 + Zustand，配合 Radix UI 与 Headless UI 组件生态；代码高亮使用 shiki，图表使用 echarts 与 recharts，动效使用 framer-motion 与 GSAP。构建产物为纯静态资源，可交由任意静态托管。',
            'The front end uses React 19 + Vite 7 + TypeScript + Tailwind 4 + Zustand with the Radix UI and Headless UI ecosystems; shiki handles code highlighting, echarts and recharts cover charts, and framer-motion and GSAP handle motion. The build output is static and can be served by any static host.',
          ),
        ],
        facts: [
          { label: z('框架', 'Framework'), value: z('React 19 · Vite 7', 'React 19 · Vite 7') },
          { label: z('状态', 'State'), value: z('Zustand', 'Zustand') },
          { label: z('样式', 'Styling'), value: z('Tailwind 4', 'Tailwind 4') },
        ],
      },
      {
        id: 'media',
        label: z('素材说明', 'Material note'),
        title: z('关于界面素材', 'On interface material'),
        note: z(
          '仓库内没有提供产品运行界面截图，因此本页不放置任何界面图。上方图版使用仓库中的真实标识。',
          'The repository does not contain product UI screenshots, so no interface imagery is shown here. The plate above uses the real mark from the repository.',
        ),
      },
    ],
  },

  /* ---------------------------------------------------------------- 06 */
  {
    slug: 'structvis',
    no: '06',
    title: z('StructVis', 'StructVis'),
    repoName: 'struct',
    subtitle: z('数据结构与数据库可视化', 'Visualising data structures and databases'),
    description: z(
      '看见数据结构与数据库的每一步跳动。把「看懂 → 做对 → 记住」做成一条闭环。',
      'See every step of a data structure and a database move. "Understand, get it right, remember" closed into one loop.',
    ),
    year: '2026',
    status: 'public',
    category: 'education',
    accent: '#4640dc',
    version: z('v2.0.0', 'v2.0.0'),
    cover: { type: 'image', src: '/media/structvis/quick-sort.webp' },
    logo: '/media/structvis/mark.svg',
    links: [GH('struct'), GITEE('struct'), CNB('struct')],
    seo: {
      title: z('StructVis — 数据结构与数据库可视化 · 枫桥 zep4yrs', 'StructVis — Visualising data structures and databases · Fengqiao zep4yrs'),
      description: z(
        'StructVis 是枫桥开发的交互式可视化学习工具：87 个知识点、22 类 Canvas 渲染器、SQL 本地真实执行，覆盖数据结构与 MySQL 双课程。仓库名为 struct。',
        'StructVis is an interactive visual learning tool by Fengqiao: 87 topics, 22 Canvas renderers and real local SQL execution across data-structures and MySQL courses. The repository is named struct.',
      ),
    },
    sections: [
      {
        id: 'overview',
        label: z('概览', 'Overview'),
        title: z('过程型学习环境', 'A process-oriented learning environment'),
        body: [
          z(
            'StructVis 面向自学者，围绕教材章节设计，覆盖《数据结构》与 MySQL 数据库两门课程。它既不是算法 Demo 集，也不是题库刷题平台，而是把「看懂 → 做对 → 记住」做成一条完整闭环。',
            'StructVis is built for self-learners and organised around textbook chapters, covering both data structures and MySQL. It is neither a gallery of algorithm demos nor a drill-question platform — it closes "understand, get it right, remember" into one loop.',
          ),
          z(
            '所有学习数据只保存在浏览器本地存储中：零账号、零上传，可随时导出备份。',
            'All learning data stays in browser local storage: no account, no upload, exportable as a backup at any time.',
          ),
        ],
        facts: [
          { label: z('许可', 'License'), value: z('GPL-3.0-only', 'GPL-3.0-only') },
          { label: z('语言', 'Language'), value: z('TypeScript · Svelte', 'TypeScript · Svelte') },
          { label: z('仓库', 'Repository'), value: z('struct', 'struct') },
        ],
      },
      {
        id: 'curriculum',
        label: z('课程全景', 'Curriculum'),
        title: z('87 个知识点 · 22 类渲染器', '87 topics · 22 renderers'),
        body: [
          z(
            '课题数量以源码中的 topics.ts 为唯一数据源，目录页、侧栏、搜索与图谱都从它派生。课程分为三块：数据结构 49 个课题、MySQL 课程 24 个课题、SQL 实验台 14 个主题。',
            'Topic counts derive from a single source of truth, topics.ts, from which the catalogue, sidebar, search and skill graph are all generated. The curriculum splits into three parts: 49 data-structure topics, 24 MySQL topics and 14 SQL-lab themes.',
          ),
        ],
        bullets: [
          z(
            '数据结构：排序 ×10 · 树 ×7 · 图 ×14 · 线性结构 ×9 · 查找 ×4 · 动态规划 ×6 · 回溯。',
            'Data structures: sorting ×10 · trees ×7 · graphs ×14 · linear structures ×9 · searching ×4 · dynamic programming ×6 · backtracking.',
          ),
          z(
            'MySQL 课程：查询 / 窗口函数 / 执行计划 / 建表 / 更新 / 视图 / 触发器 / 存储过程 / E-R / 范式 / 事务 / 锁 / 复制 / 架构。',
            'MySQL: queries / window functions / execution plans / DDL / updates / views / triggers / stored procedures / E-R / normal forms / transactions / locks / replication / architecture.',
          ),
          z(
            'SQL 实验台：集合运算 / CASE / 函数 / HAVING / 分页 / JOIN 家族 / 视图更新 / 索引失效 / EXPLAIN / 约束 / 回表 / 锁甘特图 / 可串行化 / SQL 工作台 8 关卡。',
            'SQL lab: set operations / CASE / functions / HAVING / pagination / the JOIN family / view updates / index invalidation / EXPLAIN / constraints / index lookups / lock Gantt charts / serialisability / the 8-stage SQL workbench.',
          ),
        ],
      },
      {
        id: 'features',
        label: z('核心功能', 'Features'),
        title: z('逐帧播放，亲手执行', 'Step through, then run it yourself'),
        bullets: [
          z(
            '逐帧可视化：每个执行过程可以逐帧播放、任意回退，动画与伪代码双向同步高亮。',
            'Frame-by-frame visualisation: every execution can be stepped and rewound freely, with animation and pseudocode highlighting each other both ways.',
          ),
          z(
            'SQL 剧本站：19 个主题逐帧真实执行，使用 sql.js 内存库，数据不出浏览器。',
            'SQL script station: 19 themes execute for real, frame by frame, against an in-memory sql.js database — the data never leaves the browser.',
          ),
          z(
            'SQL 工作台：8 个关卡，亲手写 SQL，真实执行后由判分器判定并回写掌握度。',
            'SQL workbench: 8 stages where you write SQL yourself; it runs for real, gets graded automatically and writes mastery back.',
          ),
          z(
            '练习闭环：选择 / 填空 / 拖指针 / 补代码四类题型，配合章节自测与每日一题。',
            'Practice loop: four question types — multiple choice, fill-in, drag-the-pointer and complete-the-code — plus chapter self-tests and a daily question.',
          ),
          z(
            '记忆闭环：错题自动进错题本，按 1 / 3 / 7 / 14 / 30 天阶梯做间隔复习并到期提醒。',
            'Memory loop: wrong answers enter a mistake book and return on a 1 / 3 / 7 / 14 / 30-day spaced-repetition ladder with due reminders.',
          ),
          z(
            '延伸工具：竞速实验室（30 个排序引擎同屏）、技能图谱、学习报告（雷达 / 热力图 / 分享图）、讲授投影模式与全局搜索。',
            'Extensions: a racing lab (30 sorting engines side by side), a skill graph, learning reports (radar, heatmap, shareable image), a lecture projection mode and global search.',
          ),
        ],
      },
      {
        id: 'tech',
        label: z('技术实现', 'Implementation'),
        title: z('引擎 → 关键帧 → 渲染器', 'Engine → keyframes → renderer'),
        body: [
          z(
            '项目使用 Svelte 5（runes）+ SvelteKit + Tailwind v4，动画由 anime.js v4 驱动，3D 场景使用 three.js，SQL 执行依赖 sql.js，语音朗读使用 Web Speech API，构建通过 adapter-static 输出纯静态站点。',
            'The project uses Svelte 5 (runes) + SvelteKit + Tailwind v4, with anime.js v4 driving animation, three.js for 3D scenes, sql.js for SQL execution and the Web Speech API for narration; adapter-static produces a purely static site.',
          ),
          z(
            '三条核心管线支撑整套内容：引擎是纯逻辑并产出步骤快照，anime.js 时间线驱动播放，22 类 Canvas 渲染器按 renderType 插件化分发；SQL 剧本站把 seed 装载进内存库后逐帧真实执行；topics.ts 作为单源内容体系，由 CI 校验防止文档与源码漂移。',
            'Three pipelines carry the content: engines are pure logic producing step snapshots, an anime.js timeline drives playback, and 22 Canvas renderers dispatch by renderType as plugins; the SQL script station seeds an in-memory database and executes frame by frame; and topics.ts acts as a single content source, with CI checks preventing drift between docs and code.',
          ),
        ],
        facts: [
          { label: z('框架', 'Framework'), value: z('Svelte 5 · SvelteKit', 'Svelte 5 · SvelteKit') },
          { label: z('动画 / 3D', 'Motion / 3D'), value: z('anime.js v4 · three.js', 'anime.js v4 · three.js') },
          { label: z('质量', 'Quality'), value: z('491 单元测试 · 71 端到端测试', '491 unit · 71 end-to-end tests') },
        ],
      },
      {
        id: 'gallery',
        label: z('界面', 'Interface'),
        title: z('实际界面', 'The actual interface'),
        gallery: [
          {
            src: '/media/structvis/quick-sort.webp',
            alt: z('StructVis 快速排序播放器', 'StructVis quicksort player'),
            caption: z('快速排序播放器', 'Quicksort player'),
            kind: 'screenshot',
          },
          {
            src: '/media/structvis/graph-traversal.webp',
            alt: z('StructVis 图的遍历播放器', 'StructVis graph traversal player'),
            caption: z('图的遍历', 'Graph traversal'),
            kind: 'screenshot',
          },
          {
            src: '/media/structvis/binary-tree.webp',
            alt: z('StructVis 二叉树遍历播放器', 'StructVis binary tree traversal player'),
            caption: z('二叉树遍历', 'Binary tree traversal'),
            kind: 'screenshot',
          },
          {
            src: '/media/structvis/splash.webp',
            alt: z('StructVis 启动图', 'StructVis splash plate'),
            caption: z('启动图', 'Splash'),
            kind: 'banner',
          },
        ],
        note: z(
          '前三张为仓库中的端到端测试视觉基线截图，属于真实运行界面。',
          'The first three are visual-baseline screenshots from the repository’s end-to-end tests — real running interfaces.',
        ),
      },
    ],
  },

  /* ---------------------------------------------------------------- 07 */
  {
    slug: 'cryptovis',
    no: '07',
    title: z('CryptoVis', 'CryptoVis'),
    subtitle: z('密码学可视化', 'Cryptography, made visible'),
    description: z(
      '把密码学里抽象的过程变成看得见的步骤。当前处于实验开发阶段。',
      'Turning the abstract steps of cryptography into something you can see. Currently in experimental development.',
    ),
    year: '2026',
    status: 'experimental',
    category: 'education',
    accent: '#6340dc',
    version: null,
    cover: { type: 'emblem', src: '/media/cryptovis/mark.svg' },
    logo: '/media/cryptovis/mark.svg',
    links: [],
    seo: {
      title: z('CryptoVis — 密码学可视化（实验开发中）· 枫桥 zep4yrs', 'CryptoVis — Cryptography visualisation (in development) · Fengqiao zep4yrs'),
      description: z(
        'CryptoVis 是枫桥正在实验开发中的密码学可视化项目，方向是以可视化方式呈现密码学算法的执行过程。当前不提供外部链接。',
        'CryptoVis is an experimental cryptography-visualisation project by Fengqiao, exploring ways to show how cryptographic algorithms execute. No external links are provided at this stage.',
      ),
    },
    sections: [
      {
        id: 'status',
        label: z('状态', 'Status'),
        title: z('实验开发中', 'In experimental development'),
        body: [
          z(
            'CryptoVis 目前处于实验开发阶段，还不是正式发布的产品。这一轮不提供外部链接，也不对外描述已完成的界面、功能清单或开发进度。',
            'CryptoVis is currently in experimental development and is not a released product. No external links are provided at this stage, and no finished interface, feature list or progress claim is made here.',
          ),
        ],
        facts: [
          { label: z('定位', 'Positioning'), value: z('密码学可视化', 'Cryptography visualisation') },
          { label: z('状态', 'Status'), value: z('实验开发中', 'In development') },
          { label: z('链接', 'Links'), value: z('本轮不提供', 'None this round') },
        ],
      },
      {
        id: 'direction',
        label: z('方向', 'Direction'),
        title: z('把过程画出来', 'Draw the process'),
        body: [
          z(
            '它的方向只有一句话：以可视化方式呈现密码学算法的执行过程，让抽象的概念变成可以一步步看下去的东西。除此之外的具体设计仍在变动中。',
            'Its direction fits in one line: present the execution of cryptographic algorithms visually, so abstract concepts become something you can follow step by step. Everything beyond that is still moving.',
          ),
        ],
        note: z(
          '以上仅为方向说明，不代表已实现的功能或进度。',
          'This states a direction only — it is not a claim about implemented features or progress.',
        ),
      },
    ],
  },

  /* ---------------------------------------------------------------- 08 */
  {
    slug: 'alertzero',
    no: '08',
    title: z('零号告警', 'Alert Zero'),
    repoName: 'ZeroSignal',
    subtitle: z('网络安全学习游戏', 'A cybersecurity learning game'),
    description: z(
      '以校园网络安全事件为题的学习游戏。玩家以安全中心负责老师的视角处理一起起事件。',
      'A learning game built around campus security incidents, played from the perspective of the security centre’s lead teacher.',
    ),
    year: '2026',
    status: 'experimental',
    category: 'game',
    accent: '#7238d4',
    version: z('V0.1 技术原型', 'V0.1 technical prototype'),
    cover: { type: 'monogram', glyph: '零' },
    logo: '/media/alertzero/mark.webp',
    links: [],
    seo: {
      title: z('零号告警 — 网络安全学习游戏（实验开发中）· 枫桥 zep4yrs', 'Alert Zero — A cybersecurity learning game (in development) · Fengqiao zep4yrs'),
      description: z(
        '零号告警是枫桥正在实验开发中的网络安全学习游戏：以校园网络安全事件为题材，玩家以安全中心负责老师的视角处理事件。当前完成 V0.1 技术原型。',
        'Alert Zero is an experimental cybersecurity learning game by Fengqiao, set around campus security incidents and played as the security centre’s lead teacher. A V0.1 technical prototype is complete.',
      ),
    },
    sections: [
      {
        id: 'overview',
        label: z('概览', 'Overview'),
        title: z('从值班室开始的一夜', 'A night that starts in the duty room'),
        body: [
          z(
            '零号告警是一款网络安全学习游戏，题材是校园网络安全事件。玩家扮演学校网络安全中心的负责老师，在一夜之间处理接连出现的告警。',
            'Alert Zero is a cybersecurity learning game about campus security incidents. You play the lead teacher of a university security centre, working through alerts that arrive one after another over a single night.',
          ),
          z(
            '项目目前处于实验开发阶段，由策划文档、世界观与剧情设计、代码原型和 HTML 原型共同组成。',
            'The project is in experimental development and currently consists of design documents, worldbuilding and story design, a code prototype and HTML prototypes.',
          ),
        ],
        facts: [
          { label: z('仓库', 'Repository'), value: z('ZeroSignal', 'ZeroSignal') },
          { label: z('状态', 'Status'), value: z('实验开发中', 'In development') },
          { label: z('链接', 'Links'), value: z('本轮不提供', 'None this round') },
        ],
      },
      {
        id: 'world',
        label: z('世界观', 'World'),
        title: z('岚川理工大学', 'Lanchuan University of Technology'),
        body: [
          z(
            '故事发生在岚川理工大学的秋天。三周前的一次安全演练收尾没有闭环，留下了调试桥接组件、旧服务令牌和一份未完成的资产清单——第一章《回声里的缺口》就从这里开始。',
            'The story takes place at Lanchuan University of Technology in autumn. A security drill three weeks earlier was never properly closed out, leaving behind a debug bridge, an old service token and an unfinished asset inventory — which is where Chapter 1, "The Gap in the Echo", begins.',
          ),
        ],
      },
      {
        id: 'prototype',
        label: z('技术原型', 'Prototype'),
        title: z('V0.1 原型已完成的部分', 'What the V0.1 prototype actually covers'),
        body: [
          z(
            '仓库中的 V0.1 完成报告记录了技术原型已经落地的模块：Core 运行时负责案件生命周期、事件总线与时间线容器；VirtualWorld 提供虚拟文件系统、路径规范化与文件哈希；Terminal 包含词法 / 语法解析器、命令执行引擎、命令注册表、沙箱安全策略与资源计量器；Tasks 实现了取证主线任务原型。',
            'The V0.1 completion report in the repository records which modules the prototype actually delivered: a Core runtime handling case lifecycle, an event bus and timeline containers; VirtualWorld providing a virtual file system, path normalisation and file hashing; a Terminal with a lexer/parser, command execution engine, command registry, sandbox policy and resource metering; and Tasks implementing a forensics main-line prototype.',
          ),
          z(
            '终端侧已实现的命令包括 pwd、ls、cd、cat、mkdir、touch、rm、tree 与 stat；报告显示安全测试套件的 12 个用例全部通过。',
            'Commands implemented on the terminal side include pwd, ls, cd, cat, mkdir, touch, rm, tree and stat; the report shows all 12 cases in the safety test suite passing.',
          ),
        ],
        bullets: [
          z('Core 运行时：案件生命周期、事件总线、时间线容器', 'Core runtime: case lifecycle, event bus, timeline containers'),
          z('VirtualWorld：虚拟文件系统、路径规范化、文件哈希', 'VirtualWorld: virtual file system, path normalisation, file hashing'),
          z('Terminal：解析器、命令执行引擎、命令注册表、沙箱策略、资源计量', 'Terminal: parser, execution engine, command registry, sandbox policy, resource metering'),
          z('Tasks：取证主线任务原型', 'Tasks: forensics main-line prototype'),
        ],
        note: z(
          '以上是已完成的原型范围。仓库中另有 V0.2–V0.5 的后续方向，属于计划，尚未实现。',
          'The above is the completed prototype scope. The repository also lists V0.2–V0.5 directions, which are plans and not yet implemented.',
        ),
      },
      {
        id: 'docs',
        label: z('文档与原型', 'Documents & prototypes'),
        title: z('设计与原型的实物', 'The physical artefacts'),
        bullets: [
          z(
            '设计文档：世界观设定与冲突清单、冻结规格（校园组织与权限矩阵、接口签名设计）、Godot 4 模块技术方案、开发任务清单。',
            'Design documents: worldbuilding and conflict lists, frozen specs (campus organisation and permission matrix, interface signatures), a Godot 4 module technical plan and a development task list.',
          ),
          z(
            '剧情：第一章《回声里的缺口》互动剧情脚本，以及章节正文。',
            'Story: the interactive script for Chapter 1, "The Gap in the Echo", plus chapter prose.',
          ),
          z(
            'HTML 原型：3D 校园原型、安全中心值班终端 Web 原型、值班室雨夜场景三个可运行原型。',
            'HTML prototypes: three runnable prototypes — a 3D campus, a security-centre duty terminal and a rainy-night duty room.',
          ),
        ],
      },
      {
        id: 'tech',
        label: z('技术实现', 'Implementation'),
        title: z('Godot 4 Mono + C#', 'Godot 4 Mono + C#'),
        body: [
          z(
            '游戏工程使用 Godot 4 Mono 与 C#，仓库中的 project.godot 标记为 Godot 4.7 与 C#；README 记录的技术栈为 Godot 4.7.1 Mono、C# 11 与 .NET 8.0。',
            'The game project uses Godot 4 Mono with C#; project.godot in the repository marks Godot 4.7 and C#, and the README records Godot 4.7.1 Mono, C# 11 and .NET 8.0.',
          ),
        ],
        facts: [
          { label: z('引擎', 'Engine'), value: z('Godot 4 Mono', 'Godot 4 Mono') },
          { label: z('语言', 'Language'), value: z('C# 11', 'C# 11') },
          { label: z('运行时', 'Runtime'), value: z('.NET 8.0', '.NET 8.0') },
        ],
        note: z(
          '界面素材说明：该作品暂无已公开的成品界面截图，本页不放置任何界面图。',
          'Material note: this work has no published finished-interface screenshots, so no interface imagery is shown here.',
        ),
      },
    ],
  },

  /* ---------------------------------------------------------------- 09 */
  {
    slug: 'binsight',
    no: '09',
    title: z('BinSight', 'BinSight'),
    subtitle: z('私有作品', 'A private work'),
    description: z('全自动二进制逆向求解器', 'Fully automated binary reverse-engineering solver'),
    year: null,
    status: 'private',
    category: 'security',
    accent: '#4a5578',
    version: null,
    cover: { type: 'monogram', glyph: 'B' },
    logo: '/media/binsight/mark.webp',
    links: [],
    restricted: true,
    seo: {
      title: z('BinSight — 私有作品 · 枫桥 zep4yrs', 'BinSight — A private work · Fengqiao zep4yrs'),
      description: z(
        'BinSight 是枫桥的私有作品。按展示边界，此处仅公开项目名称与仓库原始短描述。',
        'BinSight is a private work by Fengqiao. Within the disclosure boundary, only the project name and the repository’s original short description are shown.',
      ),
    },
    sections: [],
  },

  /* ---------------------------------------------------------------- 10 */
  {
    slug: 'lodestar',
    no: '10',
    title: z('Lodestar', 'Lodestar'),
    subtitle: z('私有作品', 'A private work'),
    description: z('极限单兵自动化渗透机', 'A single-operator automated penetration machine'),
    year: null,
    status: 'private',
    category: 'security',
    accent: '#8a52d0',
    version: null,
    cover: { type: 'monogram', glyph: 'L' },
    logo: '/media/lodestar/mark.webp',
    links: [],
    restricted: true,
    seo: {
      title: z('Lodestar — 私有作品 · 枫桥 zep4yrs', 'Lodestar — A private work · Fengqiao zep4yrs'),
      description: z(
        'Lodestar 是枫桥的私有作品。按展示边界，此处仅公开项目名称与仓库原始短描述。',
        'Lodestar is a private work by Fengqiao. Within the disclosure boundary, only the project name and the repository’s original short description are shown.',
      ),
    },
    sections: [],
  },
]

/* ==========================================================================
   脉络：作品之间的真实关联
   ========================================================================== */

export interface Thread {
  id: WorkCategory
  label: Localized
  works: string[]
}

export const threads: Thread[] = [
  { id: 'security', label: z('安全工程', 'Security'), works: ['sitelens', 'binsight', 'lodestar'] },
  { id: 'desktop', label: z('桌面工具', 'Desktop tools'), works: ['lannook', 'bluetidy', 'disksift'] },
  { id: 'education', label: z('教学可视化', 'Learning visuals'), works: ['structvis', 'cryptovis'] },
  { id: 'web', label: z('在线工具', 'Web tools'), works: ['ctfhub'] },
  { id: 'game', label: z('游戏化学习', 'Game learning'), works: ['alertzero'] },
]

/** 真实存在的技术与主题关联，用于绘制脉络连线 */
export interface ThreadEdge {
  from: string
  to: string
  reason: Localized
}

export const threadEdges: ThreadEdge[] = [
  {
    from: 'disksift',
    to: 'bluetidy',
    reason: z('同属 Windows 磁盘空间与清理方向', 'Both work on Windows disk space and cleanup'),
  },
  {
    from: 'ctfhub',
    to: 'structvis',
    reason: z('同属浏览器内可用的在线工具', 'Both are tools usable in the browser'),
  },
  {
    from: 'ctfhub',
    to: 'cryptovis',
    reason: z('同属教学向的工具形态', 'Both are teaching-oriented tools'),
  },
  {
    from: 'alertzero',
    to: 'sitelens',
    reason: z('安全学习与安全工具，同一片安全领域', 'Security learning and security tooling, one field'),
  },
  {
    from: 'lannook',
    to: 'bluetidy',
    reason: z('同为 Rust + Tauri 的桌面应用', 'Both are Rust + Tauri desktop apps'),
  },
]

export const getWork = (slug: string): Work | undefined => works.find((w) => w.slug === slug)

export const getNeighbours = (slug: string): { prev?: Work; next?: Work } => {
  const i = works.findIndex((w) => w.slug === slug)
  if (i < 0) return {}
  return {
    prev: i > 0 ? works[i - 1] : undefined,
    next: i < works.length - 1 ? works[i + 1] : undefined,
  }
}