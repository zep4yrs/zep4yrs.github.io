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

/** 一条工程取舍：选了什么、为什么、代价在哪。详情页面向开发者的主轴。 */
export interface Decision {
  choice: Localized
  why: Localized
  cost: Localized
}

/** 站外那篇面向大众的介绍：本页只指路，不重复它的内容 */
export interface Reading {
  label: Localized
  url: string
  note: Localized
}

export interface Section {
  id: string
  label: Localized
  title: Localized
  body?: Localized[]
  bullets?: Localized[]
  /** 取舍条目：详情页的第一节 */
  decisions?: Decision[]
  /** 已知限制与非目标。与 bullets 分开，因为它读起来不是「能力」 */
  limits?: Localized[]
  facts?: Fact[]
  gallery?: Media[]
  note?: Localized
  reading?: Reading
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
  /** SPDX 许可标识，如 GPL-3.0。页首标题栏据此著录 */
  license?: string
  /** 仓库语言占比（GitHub 统计）。同样进页首标题栏 */
  stack?: Localized
  cover: WorkCover
  logo?: string
  links: WorkLink[]
  restricted?: boolean
  /** 还没成形、只能报「敬请期待」的作品：图版位置改立一块字版，不摆任何素材 */
  comingSoon?: boolean
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
    license: 'GPL-3.0',
    stack: z('Go · TypeScript', 'Go · TypeScript'),
    cover: { type: 'image', src: '/media/sitelens/workbench.webp' },
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
        title: z('单二进制的验证器', 'A verifier in one binary'),
        body: [
          z(
            'SiteLens 面向需要「结论站得住」的红队与安全评估场景。它不做猜测式扫描，而是把每条判定落到能独立验证的证据上：重放请求、响应快照、命中信号，以及一条可直接粘贴进终端的 curl 复现命令。',
            'SiteLens targets red-team and assessment work where a verdict has to survive review. It does not guess: every finding lands on evidence that stands on its own — the replayed request, the response snapshot, the matched signal, and a curl command you can paste into a terminal.',
          ),
          z(
            '引擎、指纹、情报、报告与前端全部打进一个可执行文件，零外部运行时依赖；正式交付形态是桌面安装包，另有 CLI、Web 控制台与白盒审计三个入口，共用同一套编排器与历史库。',
            'Engine, fingerprints, intelligence, reporting and the front end all ship inside one executable with no external runtime dependency. The delivered form is a desktop installer; CLI, web console and white-box audit are three further entries sharing one orchestrator and history store.',
          ),
        ],
      },
      {
        id: 'decisions',
        label: z('取舍', 'Trade-offs'),
        title: z('六个决定，和它们的代价', 'Six decisions and what they cost'),
        decisions: [
          {
            choice: z('单二进制、零外部依赖', 'One binary, zero external dependencies'),
            why: z(
              '引擎、指纹、情报、报告与内嵌前端打进同一个可执行文件，下载即跑，不需要另外部署数据服务或运行时。',
              'Engine, fingerprints, intelligence, reporting and the embedded front end go into one executable that runs on download — no separate data service or runtime to stand up.',
            ),
            cost: z(
              '数据资产随二进制分发，安装包体积偏大；升级要重下整包，无法只更新指纹或情报。',
              'Data assets ship inside the binary, so installers are large; upgrading means re-downloading the whole package rather than refreshing fingerprints or intelligence alone.',
            ),
          },
          {
            choice: z('二次确认重放，而不是一击即报', 'Confirm by replay, not report-on-first-hit'),
            why: z(
              '每条发现都做二次确认，并附重放请求、响应快照与 curl 命令，把复核成本从「人工再打一遍」降到「粘一条命令」。',
              'Every finding is re-confirmed and carries the replayed request, response snapshot and curl command, cutting review from "probe it again by hand" to "paste one command".',
            ),
            cost: z(
              '扫描更慢、请求更多；只能单次观察、无法重放确认的问题会被漏掉。',
              'Scans run slower and send more requests; issues that can only be observed once and cannot be replayed are missed.',
            ),
          },
          {
            choice: z('模板漏斗统一准入', 'One funnel gates every template'),
            why: z(
              'Nuclei path、raw 请求与 afrog 三套前端统一转换，不能诚实映射成内部形态的模板整条拒收，再用靶场实弹校准。',
              'Three front ends — Nuclei path, raw requests and afrog — convert into one internal shape; templates that cannot be mapped honestly are rejected whole, then calibrated on live ranges.',
            ),
            cost: z(
              '可用模板规模小于直接堆库；转换器与校准流程要长期维护。',
              'The usable template pool is smaller than simply stacking libraries, and the converters plus calibration flow need ongoing upkeep.',
            ),
          },
          {
            choice: z('数据资产运行期热替换', 'Hot-swappable data assets'),
            why: z(
              '指纹库与情报库支持运行期替换：进行中的扫描持旧快照、新扫描取新数据，单次扫描全程用同一份快照，结果因此自洽。',
              'The fingerprint and intelligence stores swap at runtime: in-flight scans keep the old snapshot while new scans pick up new data, and one scan uses a single snapshot end to end so its results stay self-consistent.',
            ),
            cost: z(
              '内存里可能同时存在多份数据快照。',
              'Several data snapshots can coexist in memory.',
            ),
          },
          {
            choice: z('主动能力默认关闭且带硬上限', 'Active probing off by default, hard-capped'),
            why: z(
              '默认不发包，只有显式开启才启用主动验证，并设置硬上限；合规责任由使用者承担。',
              'Nothing is sent by default; active verification only runs when explicitly enabled and is hard-capped, with compliance responsibility left to the operator.',
            ),
            cost: z(
              '开箱即用的覆盖有限，要显式开启才能发挥完整能力。',
              'Out-of-the-box coverage is limited; full capability requires switching it on deliberately.',
            ),
          },
          {
            choice: z('5.0 的机器学习只作先验', '5.0 machine learning stays advisory'),
            why: z(
              '仓库内带 ONNX 推理资产，输出风险评分与排序，写进结果 JSON 的 predictions 字段，帮人决定先看哪里。',
              'The repository carries ONNX inference assets that produce risk scores and ranking, written to the predictions field of the result JSON to help a human decide where to look first.',
            ),
            cost: z(
              '预测不改变任何扫描判定；模型资产缺失就静默跳过，损坏则本进程禁用预测。',
              'Predictions change no scan verdict; missing model assets are skipped silently, and corrupt ones disable prediction for that process.',
            ),
          },
        ],
      },
      {
        id: 'limits',
        label: z('边界', 'Limits'),
        title: z('它明确不做的事', 'What it deliberately does not do'),
        limits: [
          z(
            '主动验证能力默认关闭，只有显式开启才发包，且带硬上限。',
            'Active verification is off by default, sends only when explicitly enabled, and is hard-capped.',
          ),
          z(
            '*.gov.cn 政府站点在代码层面强制拒绝扫描，该保护无法通过配置关闭。',
            'Government sites under *.gov.cn are refused at the code level; the protection cannot be turned off by configuration.',
          ),
          z(
            '监听非 localhost 时必须配 API Token，否则进程直接退出——这是硬校验，不是可选项。',
            'Binding beyond localhost requires an API token; without it the process exits. This is a hard check, not an option.',
          ),
          z(
            'target.allow_private 默认关闭，扫描私网与本机需要显式开启（授权靶场）。',
            'target.allow_private defaults to off; scanning private networks or localhost requires enabling it explicitly for an authorised range.',
          ),
          z(
            '靶场零误报门禁只代表固定靶场的口径，不构成对真实互联网环境误报率的承诺。',
            'The zero-false-positive gate is scoped to fixed test ranges and is not a promise about false-positive rates on the open internet.',
          ),
        ],
      },
      {
        id: 'readings',
        label: z('读数', 'Readings'),
        title: z('可核验的数字', 'Numbers you can check'),
        facts: [
          { label: z('许可', 'License'), value: z('GPL-3.0', 'GPL-3.0') },
          { label: z('语言', 'Language'), value: z('Go · TypeScript', 'Go · TypeScript') },
          { label: z('版本', 'Version'), value: z('v5.0.0 · 2026-09-29', 'v5.0.0 · 2026-09-29') },
          { label: z('交付', 'Delivery'), value: z('单二进制 · 零外部依赖', 'Single binary · zero external deps') },
          { label: z('单元测试', 'Unit tests'), value: z('22 个包 · 62 个测试文件', '22 packages · 62 test files') },
          { label: z('指纹库', 'Fingerprints'), value: z('13,727 条（精编 372）', '13,727 (372 curated)') },
          { label: z('模板', 'Templates'), value: z('117,889 条可运行', '117,889 runnable') },
          { label: z('情报', 'Intelligence'), value: z('40,580 条', '40,580 entries') },
          { label: z('CI', 'CI'), value: z('阻断级 -race 门禁 · govulncheck 零发现', 'Blocking -race gate · govulncheck clean') },
        ],
      },
      {
        id: 'evolution',
        label: z('演进', 'Evolution'),
        title: z('从发现到推理', 'From discovery to reasoning'),
        body: [
          z(
            '版本线按能力代际推进：1.0 发现器看攻击面，2.0 验证器证明漏洞存在，3.0 利用器证明漏洞可被影响，4.0 攻击链把结果连成证据链，5.0 引入机器学习风险评分。仓库里的路线图把这条线画到 11.0。',
            'The version line advances by capability generation: 1.0 discovery to see the attack surface, 2.0 verification to prove a flaw exists, 3.0 exploit validation to prove it can be affected, 4.0 attack chain to link results into an evidence chain, and 5.0 machine-learning risk scoring. The repository roadmap draws it out to 11.0.',
          ),
        ],
        gallery: [
          {
            src: '/media/sitelens/release-3.0.0.webp',
            alt: z('SiteLens 3.0.0 利用器版本宣发图', 'SiteLens 3.0.0 exploit-validator release plate'),
            caption: z('3.0.0 · 利用器', '3.0.0 · Exploit validator'),
            kind: 'banner',
          },
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
            alt: z('SiteLens 产品远景路线图', 'SiteLens product roadmap'),
            caption: z('路线图', 'Roadmap'),
            kind: 'banner',
          },
          {
            src: '/media/sitelens/workbench.webp',
            alt: z(
              'SiteLens 扫描工作台：左侧扫描设置，右侧本次记录的指纹识别结果',
              'SiteLens scan workbench: scan settings on the left, fingerprint results for the current record on the right',
            ),
            caption: z('扫描工作台', 'Scan workbench'),
            kind: 'screenshot',
          },
        ],
        note: z(
          '界面截图由作者提供，取自实际运行的桌面端；其余为仓库 assets/ 目录中的真实素材。',
          'The interface screenshot was provided by the author and taken from the running desktop app; the rest are real assets from the repository’s assets/ directory.',
        ),
      },
      {
        id: 'reading',
        label: z('大众版', 'Plain version'),
        title: z('不想看工程细节，先读这篇', 'Skip the engineering, start here'),
        reading: {
          label: z(
            'SiteLens 站点透视：从实训作业到全流程 Web 扫描器',
            'SiteLens: from a course project to a full web scanner',
          ),
          url: 'https://blog.feng-qiao.top/posts/sitelens-introduction.html',
          note: z(
            '博客那篇讲它怎么从课程实训作业起步、一路走到 4.0，写给不写代码的读者。',
            'The blog post covers how it grew out of a course project up to 4.0, written for readers who do not write code.',
          ),
        },
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
    license: 'GPL-3.0-only',
    stack: z('Rust · Vue · TypeScript', 'Rust · Vue · TypeScript'),
    cover: { type: 'image', src: '/media/lannook/transfer.webp' },
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
            'LanNook 面向可信邻近设备：同一个局域网里，电脑与手机浏览器直接互传文件。手机侧不装任何应用，打开浏览器就能收发；电脑侧是原生桌面程序，支持选择与拖放。',
            'LanNook targets trusted nearby devices: on the same local network, a computer and a phone browser transfer files directly. The phone side installs nothing — open a browser and you can send and receive; the computer side is a native desktop app with file picking and drag-and-drop.',
          ),
          z(
            '桌面壳是 Tauri 2，后端为 Rust，界面为 Vue；传输记录、设备与授权落在本地 SQLite，不出本机。',
            'The desktop shell is Tauri 2, the backend is Rust and the interface is Vue; transfer records, devices and authorisations live in a local SQLite database and never leave the machine.',
          ),
        ],
      },
      {
        id: 'decisions',
        label: z('取舍', 'Trade-offs'),
        title: z('六个决定，和它们的代价', 'Six decisions and what they cost'),
        decisions: [
          {
            choice: z('局域网直连，不经公共云盘', 'Direct on the LAN, no public cloud in between'),
            why: z(
              '文件本来就在手机或身边的电脑上，只是要送到同一间屋子里的另一台设备；官方发行版不会把文件上传到公共云盘。',
              'The file is already on the phone or the nearby computer — it just needs to reach another device in the same room. The official distribution never uploads files to a public cloud.',
            ),
            cost: z(
              '两端必须处于同一可信局域网；离开这个网段就用不了。',
              'Both ends must sit on the same trusted LAN; outside that segment it does not work.',
            ),
          },
          {
            choice: z('只做可信局域网，不做公网中继', 'Trusted LAN only, no public relay'),
            why: z(
              '当前版本面向可信局域网，不提供公共中继或跨公网传输模式，也就不必承担中继的带宽与滥用责任。',
              'The current version targets trusted LANs and offers no public relay or cross-internet mode, so it carries no relay bandwidth or abuse liability.',
            ),
            cost: z(
              '跨网段、跨公网是明确的非目标，需要那些场景只能换工具。',
              'Cross-segment and cross-internet use are explicit non-goals; those cases need a different tool.',
            ),
          },
          {
            choice: z('移动端连接不做加密', 'No encryption on the mobile link'),
            why: z(
              '移动端走局域网 HTTP/WebSocket 直连，换取手机端零安装、扫码即用。',
              'The mobile side connects over plain LAN HTTP/WebSocket, buying zero-install, scan-and-go use on the phone.',
            ),
            cost: z(
              '同网段内可被嗅探；README 把安全边界单列，并要求先读再传。',
              'It can be sniffed from within the same segment; the README separates out a security-boundary section and asks you to read it before transferring.',
            ),
          },
          {
            choice: z('512 KiB 分块上传', '512 KiB upload chunks'),
            why: z(
              '源码注释写得很直白：分块要足够频繁，才能让局域网传输遥测保持响应，同时不制造过多的 HTTP 开销。',
              'The source comment is blunt: chunks must be frequent enough to keep LAN transfer telemetry responsive without creating excessive HTTP overhead.',
            ),
            cost: z(
              '大文件的请求次数多，元数据开销随体积增长。',
              'Large files mean many requests, and metadata overhead grows with size.',
            ),
          },
          {
            choice: z('一次性授权绑定服务生命周期', 'One-time approval tied to the service lifetime'),
            why: z(
              '源码注释说明：一次性授权属于一次桌面服务生命周期；崩溃或强制退出后清理陈旧批准，但保留用户显式信任的设备。',
              'A source comment states it plainly: a one-time approval belongs to one desktop service lifetime. Stale approvals from a crash or forced shutdown are cleared while explicitly trusted devices are preserved.',
            ),
            cost: z(
              '桌面服务一停，一次性授权即失效，需要重新配对。',
              'Once the desktop service stops, a one-time approval lapses and you pair again.',
            ),
          },
          {
            choice: z('mDNS 记录不含配对凭证', 'Pairing credentials kept out of mDNS'),
            why: z(
              '源码注释写明理由：mDNS 记录对局域网内每一台设备都可见，配对凭证因此刻意排除在广播之外。',
              'The source comment gives the reason: mDNS records are visible to every device on the local network, so pairing credentials are deliberately excluded from the advertisement.',
            ),
            cost: z(
              '配对必须另走 6 位 PIN 或二维码，多一步。',
              'Pairing therefore needs a 6-digit PIN or a QR code — one extra step.',
            ),
          },
        ],
      },
      {
        id: 'limits',
        label: z('边界', 'Limits'),
        title: z('它明确不做的事', 'What it deliberately does not do'),
        limits: [
          z(
            '面向可信局域网，不提供公共中继或跨公网传输模式。',
            'Built for trusted LANs; there is no public relay or cross-internet mode.',
          ),
          z(
            '移动端连接使用局域网 HTTP/WebSocket，目前没有 TLS 或端到端加密。',
            'The mobile link uses LAN HTTP/WebSocket and currently has no TLS or end-to-end encryption.',
          ),
          z(
            '授权默认时长 authorization_expiry_hours = 0，即一次访问直到服务停止；-1 才表示永久信任。',
            'The default approval window is authorization_expiry_hours = 0 — one access until the service stops; -1 means trust permanently.',
          ),
          z(
            '6 位 PIN 一次性、5 分钟过期，连续输错按 IP 锁定。',
            'The 6-digit PIN is single-use with a five-minute expiry, and repeated failures lock out per IP.',
          ),
        ],
      },
      {
        id: 'readings',
        label: z('读数', 'Readings'),
        title: z('可核验的数字', 'Numbers you can check'),
        facts: [
          { label: z('许可', 'License'), value: z('GPL-3.0-only', 'GPL-3.0-only') },
          { label: z('语言', 'Language'), value: z('Rust · Vue · TypeScript', 'Rust · Vue · TypeScript') },
          { label: z('版本', 'Version'), value: z('v26.4.0 · 2026-08-22', 'v26.4.0 · 2026-08-22') },
          { label: z('分块', 'Chunk size'), value: z('512 KiB（524,288 B）', '512 KiB (524,288 B)') },
          { label: z('下载缓冲', 'Stream buffer'), value: z('64 KB', '64 KB') },
          { label: z('Rust 源文件', 'Rust files'), value: z('15 个', '15 files') },
          { label: z('CI 任务', 'CI jobs'), value: z('7 个 · fmt / clippy / audit / test', '7 · fmt / clippy / audit / test') },
          { label: z('桌面壳', 'Shell'), value: z('Tauri 2 · axum · rusqlite', 'Tauri 2 · axum · rusqlite') },
        ],
      },
      {
        id: 'evolution',
        label: z('演进', 'Evolution'),
        title: z('从 LYNQO 到 LanNook', 'From LYNQO to LanNook'),
        body: [
          z(
            '项目早期名为 LYNQO，后更名为 LanNook。更名不只是换标题：应用数据目录与数据库文件名随之迁移（lynqo.db → lannook.db），迁移发生在 SQLite 与日志落盘之前；旧的应用标识为更新器兼容而保留。v26.1.7 及更早的安装包仍沿用旧文件名。',
            'The project was first called LYNQO and later renamed LanNook. The rename was not just a title change: the app data directory and database file migrated with it (lynqo.db → lannook.db), before SQLite or the log appender touched any file, while the old application identifier stayed for updater compatibility. Installs up to v26.1.7 keep the old file names.',
          ),
          z(
            '版本线从 v26.1.4 走到 v26.4.0，仓库保留了版本化的发布说明。',
            'The version line runs from v26.1.4 to v26.4.0, and the repository keeps versioned release notes.',
          ),
        ],
        gallery: [
          {
            src: '/media/lannook/transfer.webp',
            alt: z(
              'LanNook 桌面端发送文件页：左侧导航，右侧附近设备与最近传输',
              'LanNook desktop send page: navigation on the left, nearby devices and recent transfers on the right',
            ),
            caption: z('发送文件', 'Send files'),
            kind: 'screenshot',
          },
        ],
        note: z(
          '界面截图由作者提供，取自实际运行的桌面端；仓库内不包含界面素材。',
          'The interface screenshot was provided by the author and taken from the running desktop app; the repository does not contain interface material.',
        ),
      },
      {
        id: 'reading',
        label: z('大众版', 'Plain version'),
        title: z('不想看工程细节，先读这篇', 'Skip the engineering, start here'),
        reading: {
          label: z(
            'LanNook：在局域网里，把手机和电脑真正连起来',
            'LanNook: actually connecting phone and computer on a LAN',
          ),
          url: 'https://blog.feng-qiao.top/posts/lannook-introduction.html',
          note: z(
            '博客那篇讲它解决什么场景、怎么用，写给不写代码的读者。',
            'The blog post explains the scenario it solves and how to use it, written for readers who do not write code.',
          ),
        },
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
    license: 'MIT',
    stack: z('Rust · TypeScript', 'Rust · TypeScript'),
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
          z(
            '当前是 0.2.0 Preview：安装包尚未签名，磁盘扫描走安全目录遍历，速度不等同于基于 MFT 的成熟磁盘分析器。',
            'It is currently at 0.2.0 Preview: installers are unsigned, and disk scanning uses safe directory traversal, so speed does not match mature MFT-based analysers.',
          ),
        ],
      },
      {
        id: 'decisions',
        label: z('取舍', 'Trade-offs'),
        title: z('五个决定，和它们的代价', 'Five decisions and what they cost'),
        decisions: [
          {
            choice: z('用安全目录遍历，而不是 MFT', 'Safe directory traversal instead of MFT'),
            why: z(
              '目录遍历不依赖 NTFS 主文件表，路径处理更保守，也不给扫描器额外权限；扫描侧因此可以先求稳。',
              'Directory traversal does not depend on the NTFS master file table, keeps path handling conservative and asks no extra privileges of the scanner — so the scanning side can prioritise being safe first.',
            ),
            cost: z(
              'README 直接写明：百万级文件时速度可能明显慢于基于 MFT 的分析器。',
              'The README states it plainly: at millions of files, speed can be markedly slower than MFT-based analysers.',
            ),
          },
          {
            choice: z('迁移用 NTFS 目录联接', 'Migration by NTFS directory junction'),
            why: z(
              '原路径保留为联接，旧程序的路径仍然指向原处，迁移对使用方透明。',
              'The original path stays as a junction so old programs still resolve to it — the move is transparent to whatever uses the path.',
            ),
            cost: z(
              '原路径所在卷必须支持 NTFS 目录联接，目标必须是本机目录；网络共享不受支持。',
              'The source volume must support NTFS junctions and the target must be a local directory; network shares are not supported.',
            ),
          },
          {
            choice: z('每个改动都配事务日志与回滚', 'A transaction log and rollback for every change'),
            why: z(
              '迁移与清理前先检查受保护路径、重解析点、目标目录、剩余空间、相关进程；过程写入事务日志，回滚前再核对联接目标与事务记录是否一致。',
              'Before a move or cleanup it checks protected paths, reparse points, the target directory, free space and related processes; the run writes a transaction log, and before rollback it re-verifies the junction target against that record.',
            ),
            cost: z(
              '流程更长、每一步都要落日志；跨卷复制后还要再核对文件数、目录数与总字节。',
              'The flow is longer and every step is logged; after a cross-volume copy it re-checks file count, directory count and total bytes.',
            ),
          },
          {
            choice: z('失败自动回滚，而不是留在半途', 'Auto-rollback on failure, not a half-done state'),
            why: z(
              '源码里，创建目录联接失败会尝试把目录搬回原位；宁可退回起点，也不留一个既没迁成又没迁完的目录。',
              'In the source, a failed junction creation tries to move the directory back: better to return to the starting point than leave a directory half-migrated.',
            ),
            cost: z(
              '回滚本身也可能失败，所以 README 提醒这些检查能减少误操作，但不能代替备份。',
              'Rollback can itself fail, which is why the README warns that these checks reduce mistakes but do not replace backups.',
            ),
          },
          {
            choice: z('TidyPilot 先本地规则，AI 可选', 'TidyPilot: local rules first, AI optional'),
            why: z(
              '默认用本地规则加 5 组内置提示词就能工作；想接外部 AI 才去配置 OpenAI 兼容接口，并自行阅读服务商的数据处理政策。',
              'By default it works from local rules plus five built-in prompt sets; only if you want external AI do you configure an OpenAI-compatible endpoint and read that provider’s data policy.',
            ),
            cost: z(
              'API Key 目前明文保存，尚未接入 Windows Credential Manager。',
              'The API key is currently stored in plain text and is not yet wired to the Windows Credential Manager.',
            ),
          },
        ],
      },
      {
        id: 'limits',
        label: z('边界', 'Limits'),
        title: z('它明确不做的事', 'What it deliberately does not do'),
        limits: [
          z(
            '0.2.0 仍是 Preview：安装包未签名，也没有自动更新。',
            '0.2.0 is still Preview: installers are unsigned and there is no auto-update.',
          ),
          z(
            '目录扫描尚未使用 NTFS MFT，百万级文件时速度可能明显慢。',
            'Directory scanning does not yet use NTFS MFT, so millions of files can be markedly slow.',
          ),
          z(
            '网络共享不受支持；原路径所在卷必须支持 NTFS 目录联接，目标必须是本机目录。',
            'Network shares are unsupported; the source volume must support NTFS junctions and the target must be a local directory.',
          ),
          z(
            '文件夹迁移只允许当前用户目录下的具体子文件夹，兼容性白名单与文件系统组合仍需扩大与实测。',
            'Folder migration is limited to specific subfolders under the current user’s directory, and the compatibility whitelist and filesystem matrix still need widening and real testing.',
          ),
          z(
            '英文文案尚未完整；数据库、虚拟机、同步盘、开发环境与仍在写入的目录，迁移前应先退出相关程序并自行留存备份。',
            'English copy is incomplete; for databases, virtual machines, sync folders, development environments and directories still being written, quit the related programs and keep your own backup before migrating.',
          ),
        ],
      },
      {
        id: 'readings',
        label: z('读数', 'Readings'),
        title: z('可核验的数字', 'Numbers you can check'),
        facts: [
          { label: z('许可', 'License'), value: z('MIT', 'MIT') },
          { label: z('语言', 'Language'), value: z('Rust 44.0% · TypeScript 34.5% · CSS 19.8%', 'Rust 44.0% · TypeScript 34.5% · CSS 19.8%') },
          { label: z('版本', 'Version'), value: z('v0.2.0 Preview · 2026-07-26', 'v0.2.0 Preview · 2026-07-26') },
          { label: z('业务 crate', 'Business crates'), value: z('5 个', '5') },
          { label: z('CI 任务', 'CI jobs'), value: z('3 个 · Rust checks / frontend / doc links', '3 · Rust checks / frontend / doc links') },
          { label: z('冒烟流程', 'Smoke flow'), value: z('扫描 · 计划 · 执行 · 回滚', 'scan · plan · execute · rollback') },
          { label: z('桌面壳', 'Shell'), value: z('Tauri 2 · React 18 · Vite', 'Tauri 2 · React 18 · Vite') },
        ],
      },
      {
        id: 'evolution',
        label: z('演进', 'Evolution'),
        title: z('0.2.0 把过程摆到台面上', '0.2.0 puts the process on the table'),
        body: [
          z(
            '0.1.0 到 0.2.0 的主要变化是把文件夹分析与应用迁移拆开，并把检查、迁移、回滚三件事摆到界面上，让每一步都可看到、可回溯。',
            'The main change from 0.1.0 to 0.2.0 was splitting folder analysis from application migration and putting the check, the move and the rollback on the interface, so each step can be seen and traced.',
          ),
          z(
            '版本线目前只有 v0.1.0 与 v0.2.0，后者以 Preview 预发布，正式公开发布的条件写在仓库的发布清单里。',
            'The version line so far holds only v0.1.0 and v0.2.0, the latter shipped as a prerelease; the conditions for a proper public release live in the repository’s release checklist.',
          ),
        ],
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
      {
        id: 'reading',
        label: z('大众版', 'Plain version'),
        title: z('不想看工程细节，先读这篇', 'Skip the engineering, start here'),
        reading: {
          label: z(
            'BlueTidy 0.2.0：先看清空间，再安全处理',
            'BlueTidy 0.2.0: see the space first, then act safely',
          ),
          url: 'https://blog.feng-qiao.top/posts/bluetidy-0.2.0.html',
          note: z(
            '博客那篇讲 0.2.0 把文件夹分析和应用迁移拆开的思路，写给不写代码的读者。',
            'The blog post explains why 0.2.0 split folder analysis from application migration, written for readers who do not write code.',
          ),
        },
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
    license: 'GPL-3.0-or-later',
    stack: z('Rust · TypeScript', 'Rust · TypeScript'),
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
        id: 'decisions',
        label: z('取舍', 'Trade-offs'),
        title: z('六个决定，和它们的代价', 'Six decisions and what they cost'),
        decisions: [
          {
            choice: z('继承上游安全底座，一字未动', 'Inherit the upstream safety floor untouched'),
            why: z(
              '上游已经打好底子：NTFS MFT 秒扫、scaffold 红线测试、undo 台账、默认回收站。这部分按 README 的说法「一字未动全部继承」。',
              'Upstream had already laid the floor: NTFS MFT fast scans, scaffold redline tests, the undo ledger and trash-by-default. The README says this part was inherited "untouched, all of it".',
            ),
            cost: z(
              '改动要顺着上游的分层与接口走，不能按自己的喜好重排。',
              'Changes have to follow upstream’s layering and interfaces rather than being rearranged to taste.',
            ),
          },
          {
            choice: z('安全兜底下沉到 Rust 执行层', 'Push the safety net down into the Rust executor'),
            why: z(
              '界面层的保护区清单挡不住脚本与定时巡查；执行层对每条计划复跑保护区检查，命中就整单 fail-closed 拒绝。',
              'A protection list in the interface cannot stop scripts or scheduled patrols; the executor re-runs the protected-zone check on every plan and fails the whole batch closed on a hit.',
            ),
            cost: z(
              '每条计划多一次校验；清单层与执行层要同步维护，两边不一致就是漏洞。',
              'Every plan gets an extra check, and the list layer and executor must be kept in sync — a mismatch between them is a hole.',
            ),
          },
          {
            choice: z('AI 从问答升级为五桶分诊', 'AI moves from Q&A to five-bucket triage'),
            why: z(
              '拖文件夹问答只能一问一答；分诊把整盘扫描结果一次分桶，先给出处置优先级，再让人细问。',
              'Dragging in a folder only answers one question at a time; triage buckets a whole scan at once, giving a handling priority before anyone drills in.',
            ),
            cost: z(
              '只提交目录元数据、不读取文件内容，判断依据因此有限。',
              'Only directory metadata is submitted and file contents are never read, so the basis for judgement is limited.',
            ),
          },
          {
            choice: z('清理脚本从 2 个扩到 36 个', 'Cleanup scripts grow from 2 to 36'),
            why: z(
              '把「什么可以清」从代码搬进脚本中心的 TOML 定义，规则可读、可 lint、可单独审阅。',
              'It moves "what is safe to clear" out of code and into TOML definitions in the script center, so rules can be read, linted and reviewed on their own.',
            ),
            cost: z(
              '每个脚本要配正向与红线两份断言，CI 必跑，没过的合不进来。',
              'Each script needs both a positive and a redline assertion, both run in CI, and anything failing does not merge.',
            ),
          },
          {
            choice: z('自定义版本号规则', 'A custom version scheme'),
            why: z(
              '版本按 YY.breaking+1.feature+1.patch+1 编排，年份打头，读一眼就知道代际与变更量级。',
              'Versions follow YY.breaking+1.feature+1.patch+1: the year leads, so one glance tells you the generation and the scale of change.',
            ),
            cost: z(
              '与 SemVer 生态不同，外部工具链需要额外解释才能正确排序。',
              'It differs from the SemVer ecosystem, so external tooling needs extra explanation to order it correctly.',
            ),
          },
          {
            choice: z('API Key 改用 Windows DPAPI 加密', 'API keys move to Windows DPAPI'),
            why: z(
              '上游把密钥明文存在 localStorage；本发行版改为 Windows DPAPI 加密，密钥不再以明文落盘。',
              'Upstream kept keys in plain localStorage; this distribution moves to Windows DPAPI so keys no longer land on disk in the clear.',
            ),
            cost: z(
              '加密绑定 Windows 平台，跨平台要另做一层实现。',
              'The encryption is tied to Windows, so a cross-platform build needs another layer.',
            ),
          },
        ],
      },
      {
        id: 'limits',
        label: z('边界', 'Limits'),
        title: z('它明确不做的事', 'What it deliberately does not do'),
        limits: [
          z(
            '非目标用户：服务器运维（他们用 du、ncdu）、企业 IT、数据中心容量规划。',
            'Non-target users: server operations (they use du, ncdu), enterprise IT and data-centre capacity planning.',
          ),
          z(
            '不做数据恢复、不做注册表清理，也不自动决定删什么。',
            'No data recovery, no registry cleaning, and it never decides what to delete on its own.',
          ),
          z(
            '定位明确不是 CCleaner、WizTree、Duplicate Cleaner、4DDiG 或 ai-disk-cleanup。',
            'Explicitly not CCleaner, WizTree, Duplicate Cleaner, 4DDiG or ai-disk-cleanup.',
          ),
          z(
            'macOS 签名证书与跨平台安装包矩阵尚未完成，当前发行仍以 Windows 为主。',
            'The macOS signing certificate and the cross-platform installer matrix are unfinished; the current distribution is still Windows-first.',
          ),
        ],
      },
      {
        id: 'readings',
        label: z('读数', 'Readings'),
        title: z('可核验的数字', 'Numbers you can check'),
        facts: [
          { label: z('许可', 'License'), value: z('GPL-3.0-or-later（上游 MIT）', 'GPL-3.0-or-later (upstream MIT)') },
          { label: z('语言', 'Language'), value: z('Rust 53.7% · TypeScript 34.9% · CSS 10.5%', 'Rust 53.7% · TypeScript 34.9% · CSS 10.5%') },
          { label: z('版本', 'Version'), value: z('v26.1.4.0 · 2026-09-28', 'v26.1.4.0 · 2026-09-28') },
          { label: z('工作区', 'Workspace'), value: z('8 个 crate', '8 crates') },
          { label: z('清理脚本', 'Cleanup scripts'), value: z('36 个内置', '36 built in') },
          { label: z('CI 任务', 'CI jobs'), value: z('4 个 · lint / test / scaffold-lint / frontend', '4 · lint / test / scaffold-lint / frontend') },
          { label: z('发布档', 'Release profile'), value: z('opt-level 3 · lto thin · strip', 'opt-level 3 · lto thin · strip') },
        ],
      },
      {
        id: 'evolution',
        label: z('演进', 'Evolution'),
        title: z('从 Diskwise 到重构发行', 'From Diskwise to a refactored distribution'),
        body: [
          z(
            '项目经历过 Diskwise 早期原型、Pinkbin 与这次重构发行三个阶段；仓库 docs/archive/ 保留了早期原型阶段的交接记录，所以界面上还能看到那一时期的空状态图。',
            'The project passed through three phases — the early Diskwise prototype, Pinkbin, and this refactored distribution. The repository keeps that early phase’s handoff record under docs/archive/, which is why an empty-state shot from that era still appears in the gallery.',
          ),
          z(
            '版本线从 v0.1.1 / v0.1.2 走到 v26.1.2、v26.1.4.0。README 路线图里，v26.1.4.0 的 USN Journal 实时监控与「建议迁移」目录一键搬盘已完成，跨平台安装包矩阵与 macOS 签名证书仍未勾上。',
            'The version line runs from v0.1.1 / v0.1.2 to v26.1.2 and v26.1.4.0. On the README roadmap, v26.1.4.0’s USN Journal live monitoring and one-click relocation of "recommended to move" directories are done, while the cross-platform installer matrix and macOS signing certificate remain unchecked.',
          ),
        ],
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
      {
        id: 'reading',
        label: z('大众版', 'Plain version'),
        title: z('不想看工程细节，先读这篇', 'Skip the engineering, start here'),
        reading: {
          label: z(
            'DiskSift v26.1.4.0：给磁盘清理装上实时监控和迁移引擎',
            'DiskSift v26.1.4.0: live monitoring and a migration engine for disk cleanup',
          ),
          url: 'https://blog.feng-qiao.top/posts/disksift-v26.1.4.0.html',
          note: z(
            '博客那篇按版本讲这次做了什么，写给不写代码的读者。',
            'The blog post walks through what this release changed, written for readers who do not write code.',
          ),
        },
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
    license: 'MIT',
    stack: z('TypeScript', 'TypeScript'),
    cover: { type: 'image', src: '/media/ctfhub/toolbox.webp' },
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
            'CTFHub 面向参加 CTF 与做安全练习的人：把平时散落在各个站点、脚本和本地程序里的能力收拢到一处，按方向归类，打开浏览器就能用。它不追求深度利用能力，追求的是「需要某个转换时，这里一定有一个」。',
            'CTFHub targets people playing CTFs and practising security: capabilities normally scattered across sites, scripts and local programs are gathered in one place, sorted by direction and ready in the browser. It does not chase deep exploitation power — it chases "when you need a transform, there is one here".',
          ),
          z(
            '仓库名仍是 ctf-qiankun；项目原名「CTF 乾坤袋」，现已更名为 CTFHub。',
            'The repository is still named ctf-qiankun; the project was originally called "CTF 乾坤袋" and has been renamed CTFHub.',
          ),
        ],
      },
      {
        id: 'decisions',
        label: z('取舍', 'Trade-offs'),
        title: z('五个决定，和它们的代价', 'Five decisions and what they cost'),
        decisions: [
          {
            choice: z('纯前端，输入不出浏览器', 'Client-only, input never leaves the browser'),
            why: z(
              '开源版不提供服务端 API，也不主动把工具输入、文件或密钥发往任何服务器——安全类工具最怕的就是「我粘的这串东西被谁看见了」。',
              'The open-source build ships no server API and never sends tool input, files or keys anywhere. For a security tool the worst failure is "who saw the string I just pasted".',
            ),
            cost: z(
              '没有服务端算力可用，重计算和大文件处理受限；也没有账号，收藏与最近使用只存在本地。',
              'No server-side compute is available, so heavy computation and large files are constrained; with no accounts, favourites and recents live only on the device.',
            ),
          },
          {
            choice: z('注册表 + 动态加载，而不是逐页手写', 'A registry with dynamic loading, not hand-wired pages'),
            why: z(
              '工具集中在 client/src/tools/ 下，registry.ts 用 import.meta.glob 按目录动态找到每个 ToolComponent.tsx，元信息由 meta-manifest.ts 统一描述。新增一件工具只需放入目录并登记。',
              'Tools live under client/src/tools/; registry.ts locates each ToolComponent.tsx by directory through import.meta.glob, and meta-manifest.ts describes the metadata. Adding a tool means dropping in a directory and registering it.',
            ),
            cost: z(
              'meta-manifest.ts 是自动生成文件，改动后要重跑生成脚本；注册表是全局单点，命名或分类写错会在构建期暴露。',
              'meta-manifest.ts is generated, so changes require re-running the generator; the registry is a single global point where a wrong name or category surfaces at build time.',
            ),
          },
          {
            choice: z('优先浏览器原生能力', 'Prefer native browser capability first'),
            why: z(
              'README 把「优先使用浏览器原生能力或已有依赖」写成新增工具的第一条规则：能用 Web API 就不引第三方库，能复用已有依赖就不再加一份。',
              'The README makes "prefer native browser capability or existing dependencies" the first rule for new tools: use a Web API rather than pull a library, reuse a dependency rather than add another.',
            ),
            cost: z(
              '部分算法没有原生实现，只能用 JS 重写，性能与精度受限于浏览器；也意味着某些能力干脆不做。',
              'Some algorithms have no native implementation and must be rewritten in JS, bounded by browser performance and precision; some capabilities are simply left out.',
            ),
          },
          {
            choice: z('给输入、文件与正则设硬上限', 'Hard caps on input, file size and regex'),
            why: z(
              'README 明确要求限制输入大小、文件大小与正则复杂度——一个跑在别人浏览器里的工具，不能被一段恶意正则拖死。',
              'The README explicitly requires limiting input size, file size and regex complexity: a tool running in someone else’s browser must not be hung by a hostile regex.',
            ),
            cost: z(
              '超限输入直接拒绝，工具在边界外不可用；上限取保守值，正常但偏大的输入也会被挡。',
              'Oversized input is rejected outright, so tools are unavailable past the boundary; the caps are conservative, so some legitimate but large inputs are blocked too.',
            ),
          },
          {
            choice: z('开源版只留客户端工具', 'The open-source build keeps only client tools'),
            why: z(
              'changelog 记录了这一刀：移除登录、邀请码、积分、管理后台与服务端 API，只保留客户端工具，让仓库边界清晰、可纯静态托管。',
              'The changelog records the cut: login, invite codes, credits, the admin back office and the server API were removed, leaving only client tools so the repository has a clean boundary and hosts statically.',
            ),
            cost: z(
              '没有账号、云端同步或付费能力；这些能力若要回来，只能作为独立服务重新引入。',
              'No accounts, cloud sync or paid capability; bringing any of those back would mean reintroducing them as a separate service.',
            ),
          },
        ],
      },
      {
        id: 'limits',
        label: z('边界', 'Limits'),
        title: z('它明确不做的事', 'What it deliberately does not do'),
        limits: [
          z(
            '开源版不含登录、邀请码、积分、管理后台、数据库或付费服务。',
            'The open-source build has no login, invite codes, credits, admin back office, database or paid service.',
          ),
          z(
            '不提供服务端 API，也不会主动把工具输入发送到项目服务器。',
            'It ships no server API and does not send tool input to the project’s servers.',
          ),
          z(
            '浏览器扩展、第三方脚本或部署者自行接入的服务可能改变上述边界，使用前需自行检查网络请求。',
            'Browser extensions, third-party scripts or services wired in by a deployer can change that boundary; check the network requests yourself before trusting it.',
          ),
          z(
            '输入大小、文件大小与正则复杂度都有上限，超限直接拒绝。',
            'Input size, file size and regex complexity are all capped, and oversized input is rejected outright.',
          ),
          z(
            '项目面向已获授权的学习、比赛与安全测试，不承担未授权使用的责任。',
            'The project is for authorised learning, competitions and security testing and takes no responsibility for unauthorised use.',
          ),
        ],
      },
      {
        id: 'readings',
        label: z('读数', 'Readings'),
        title: z('可核验的数字', 'Numbers you can check'),
        facts: [
          { label: z('许可', 'License'), value: z('MIT', 'MIT') },
          { label: z('语言', 'Language'), value: z('TypeScript 98.4%', 'TypeScript 98.4%') },
          { label: z('工具', 'Tools'), value: z('437 件目录 · 16 分类', '437 tool dirs · 16 categories') },
          { label: z('测试', 'Tests'), value: z('server/**/*.spec.ts · test/unit', 'server/**/*.spec.ts · test/unit') },
          { label: z('运行时', 'Runtime'), value: z('Node ≥ 22.12 · npm ≥ 10', 'Node ≥ 22.12 · npm ≥ 10') },
          { label: z('CI', 'CI'), value: z('deploy-pages：build + deploy', 'deploy-pages: build + deploy') },
        ],
      },
      {
        id: 'gallery',
        label: z('界面', 'Interface'),
        title: z('实际界面', 'The actual interface'),
        gallery: [
          {
            src: '/media/ctfhub/toolbox.webp',
            alt: z(
              'CTFHub 工具页：左侧分类导航，右侧工具卡片网格',
              'CTFHub tool page: category navigation on the left, tool cards on the right',
            ),
            caption: z('工具目录与操作链', 'Catalogue and operation chain'),
            kind: 'screenshot',
          },
        ],
        note: z(
          '界面截图由作者提供，取自实际运行的站点。',
          'The interface screenshot was provided by the author and taken from the running site.',
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
    license: 'GPL-3.0-only',
    stack: z('TypeScript · Svelte', 'TypeScript · Svelte'),
    cover: { type: 'image', src: '/media/structvis/home.webp' },
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
            '87 个知识点、100 个页面、22 类渲染器；所有学习数据只保存在浏览器本地存储中：零账号、零上传，可随时导出备份。',
            '87 topics, 100 pages and 22 renderers, with all learning data kept in browser local storage: no account, no upload, exportable as a backup at any time.',
          ),
        ],
      },
      {
        id: 'decisions',
        label: z('取舍', 'Trade-offs'),
        title: z('五个决定，和它们的代价', 'Five decisions and what they cost'),
        decisions: [
          {
            choice: z('单源内容体系，数字全部派生', 'One content source, every number derived'),
            why: z(
              'topics.ts 是课题的唯一数据源，目录页、侧栏、搜索、技能图谱与报告章节全部从它派生；README 不手写估算值，lint 里的 check-docs 会把「文档数字与源码不一致」直接判红。',
              'topics.ts is the single source for topics: the catalogue, sidebar, search, skill graph and report chapters all derive from it. The README carries no hand-written estimates, and a check-docs step inside lint fails the build the moment a documented number drifts from the source.',
            ),
            cost: z(
              '改动内容或测试规模必须同步徽章与文档，否则门禁不过；内容的自由度被单源结构收窄。',
              'Touching content or test counts means updating badges and docs in step, or the gate fails; the single-source structure narrows how freely content can be arranged.',
            ),
          },
          {
            choice: z('引擎纯逻辑，渲染器插件化', 'Pure engines, pluggable renderers'),
            why: z(
              '引擎只产出步骤快照，anime.js 时间线负责播放，22 类 Canvas 渲染器按 engine.renderType 分发——算法逻辑与画面表现解耦，新增一种结构类型不用改播放器。',
              'Engines emit step snapshots only, an anime.js timeline owns playback, and 22 Canvas renderers dispatch by engine.renderType — algorithm logic is decoupled from presentation, so a new structure type needs no change to the player.',
            ),
            cost: z(
              '每种结构都要单独维护一个渲染器，插件面越大，视觉一致性与回归成本越高。',
              'Every structure needs its own renderer; the wider the plugin surface, the higher the cost of visual consistency and regression.',
            ),
          },
          {
            choice: z('SQL 浏览器内真实执行，而不是预录动画', 'SQL runs for real in the browser, not as canned animation'),
            why: z(
              'SQL 剧本站把 seed.sql 装进 sql.js 内存库，帧序列逐帧真实执行；数据不出浏览器，结果是真的算出来的，不是画出来的。',
              'The SQL script station loads seed.sql into an in-memory sql.js database and executes the frame sequence for real; data never leaves the browser, and results are computed rather than drawn.',
            ),
            cost: z(
              '要随包带上 WASM，内存库规模受浏览器限制；未启用 sql.js 时只能退化成静态演示帧兜底。',
              'WASM ships with the bundle, the in-memory database is bounded by browser memory, and when sql.js is unavailable the station falls back to static demo frames.',
            ),
          },
          {
            choice: z('纯静态 + 本地存储', 'Static output and local storage only'),
            why: z(
              '构建走 adapter-static 输出纯静态站点，学习进度只写 localStorage——可托管在任意静态空间，也意味着没有服务端能看到你的学习数据。',
              'The build uses adapter-static to emit a purely static site, and progress is written only to localStorage: it can be hosted anywhere static, and no server can see your learning data.',
            ),
            cost: z(
              '没有账号与云端同步，换设备要靠导出 / 导入；进度存储还需版本信封迁移，避免旧数据把新版本写坏。',
              'No accounts and no cloud sync, so moving devices means export and import; the progress store also needs version-envelope migration so old data cannot corrupt a new build.',
            ),
          },
          {
            choice: z('把可访问性写进基线', 'Accessibility as a baseline, not a bonus'),
            why: z(
              '亮暗双主题以 AA 对比度为基线，prefers-reduced-motion 全量降级——逐帧动画和 3D 悬浮这类效果，必须有一条「不动也能用」的路径。',
              'Light and dark themes are held to an AA contrast baseline, and prefers-reduced-motion degrades everything — frame animation and 3D hover effects must each have a path that still works when motion is off.',
            ),
            cost: z(
              '每一套可视化都要在两套主题下检查，还要维护一条降级路径，视觉与动效的改动成本翻倍。',
              'Every visualisation must be checked in both themes and carry a degraded path, doubling the cost of any visual or motion change.',
            ),
          },
        ],
      },
      {
        id: 'limits',
        label: z('边界', 'Limits'),
        title: z('它明确不做的事', 'What it deliberately does not do'),
        limits: [
          z(
            '不是算法 Demo 集，也不是题库刷题平台——它是围绕教材章节的过程型学习环境。',
            'It is not a gallery of algorithm demos nor a drill-question platform; it is a process-oriented learning environment built around textbook chapters.',
          ),
          z(
            '全部学习数据只存 localStorage，零账号零上传；换设备需要手动导出与导入。',
            'All learning data lives only in localStorage with no account and no upload; moving devices requires a manual export and import.',
          ),
          z(
            'SQL 在浏览器内存库中执行，数据规模受浏览器内存限制；未启用 sql.js 时退化为静态演示帧。',
            'SQL executes against an in-browser memory database bounded by browser memory, and degrades to static demo frames when sql.js is unavailable.',
          ),
          z(
            '纯静态部署，没有服务端能力；讲授语音依赖浏览器的 Web Speech API。',
            'Deployment is purely static with no server-side capability, and narration depends on the browser’s Web Speech API.',
          ),
        ],
      },
      {
        id: 'readings',
        label: z('读数', 'Readings'),
        title: z('可核验的数字', 'Numbers you can check'),
        facts: [
          { label: z('许可', 'License'), value: z('GPL-3.0-only', 'GPL-3.0-only') },
          { label: z('语言', 'Language'), value: z('TypeScript 62.7% · Svelte 34.9%', 'TypeScript 62.7% · Svelte 34.9%') },
          { label: z('知识点', 'Topics'), value: z('87（数据结构 49 · MySQL 24 · SQL 实验台 14）', '87 (data structures 49 · MySQL 24 · SQL lab 14)') },
          { label: z('渲染器', 'Renderers'), value: z('22 类 Canvas', '22 Canvas renderers') },
          { label: z('测试', 'Tests'), value: z('491 单元 · 71 端到端', '491 unit · 71 end-to-end') },
          { label: z('门禁', 'Gate'), value: z('lint（含数字校验）→ check → test → test:e2e', 'lint (with number checks) → check → test → test:e2e') },
          { label: z('部署', 'Deploy'), value: z('adapter-static → docs/ · CI 自动部署', 'adapter-static → docs/ · CI deploys') },
          { label: z('发布', 'Releases'), value: z('无 GitHub Release · 标签 visual-v3 / visual-pre-v3 / v1.0.0', 'No GitHub Release · tags visual-v3 / visual-pre-v3 / v1.0.0') },
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
            src: '/media/structvis/home.webp',
            alt: z(
              'StructVis 学习平台首页：继续学习、每日一题与掌握度统计',
              'StructVis learning home: continue-learning card, daily question and mastery statistics',
            ),
            caption: z('平台首页', 'Platform home'),
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
          '首页截图由作者提供，取自实际运行的学习平台；其余为仓库中的端到端测试视觉基线截图，同样属于真实运行界面。',
          'The home screenshot was provided by the author and taken from the running platform; the rest are visual-baseline screenshots from the repository’s end-to-end tests — also real running interfaces.',
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
    cover: { type: 'image', src: '/media/cryptovis/wip.webp' },
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
      {
        id: 'gallery',
        label: z('界面', 'Interface'),
        title: z('当前对外呈现', 'What is shown for now'),
        gallery: [
          {
            src: '/media/cryptovis/wip.webp',
            alt: z(
              'CryptoVis 当前的占位页面：项目开发中，敬请期待',
              'CryptoVis’s current placeholder page: under development',
            ),
            caption: z('开发中占位页', 'Work-in-progress placeholder'),
            kind: 'screenshot',
          },
        ],
        note: z(
          '截图由作者提供，是项目当前的占位页面，不代表已实现的界面。',
          'The screenshot was provided by the author and shows the project’s current placeholder page — it is not a finished interface.',
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
    cover: { type: 'image', src: '/media/alertzero/campus.webp' },
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
          '界面素材说明：该作品尚未有成品界面，下面的图来自 3D 校园原型。',
          'Material note: this work has no finished interface yet; the image below comes from the 3D campus prototype.',
        ),
      },
      {
        id: 'gallery',
        label: z('界面', 'Interface'),
        title: z('原型的实物', 'What the prototype looks like'),
        gallery: [
          {
            src: '/media/alertzero/campus.webp',
            alt: z(
              '零号告警 3D 校园原型：雨夜校门，画面上带小地图与任务提示',
              'Alert Zero 3D campus prototype: the gate on a rainy night, with minimap and quest prompt',
            ),
            caption: z('3D 校园原型 · 雨夜校门', '3D campus prototype · the gate at night'),
            kind: 'screenshot',
          },
        ],
        note: z(
          '截图由作者提供，取自仓库中的 3D 校园原型，属于原型阶段的可运行界面，不代表成品形态。',
          'The screenshot was provided by the author and taken from the repository’s 3D campus prototype — a runnable prototype interface, not a finished build.',
        ),
      },
    ],
  },

  /* ---------------------------------------------------------------- 09 */
  {
    slug: 'binsight',
    no: '09',
    title: z('BinSight', 'BinSight'),
    subtitle: z('开发中 · 敬请期待', 'In development · coming soon'),
    description: z('全自动二进制逆向求解器', 'Fully automated binary reverse-engineering solver'),
    year: null,
    status: 'experimental',
    category: 'security',
    accent: '#4a5578',
    version: null,
    cover: { type: 'monogram', glyph: 'B' },
    logo: '/media/binsight/mark.webp',
    links: [],
    restricted: true,
    comingSoon: true,
    seo: {
      title: z('BinSight — 开发中 · 枫桥 zep4yrs', 'BinSight — In development · Fengqiao zep4yrs'),
      description: z(
        'BinSight 是枫桥开发中的作品。按展示边界，此处仅公开项目名称与仓库原始短描述。',
        'BinSight is a work in development by Fengqiao. Within the disclosure boundary, only the project name and the repository’s original short description are shown.',
      ),
    },
    sections: [],
  },

  /* ---------------------------------------------------------------- 10 */
  {
    slug: 'lodestar',
    no: '10',
    title: z('Lodestar', 'Lodestar'),
    subtitle: z('开发中 · 敬请期待', 'In development · coming soon'),
    description: z('极限单兵自动化渗透机', 'A single-operator automated penetration machine'),
    year: null,
    status: 'experimental',
    category: 'security',
    accent: '#8a52d0',
    version: null,
    cover: { type: 'monogram', glyph: 'L' },
    logo: '/media/lodestar/mark.webp',
    links: [],
    restricted: true,
    comingSoon: true,
    seo: {
      title: z('Lodestar — 开发中 · 枫桥 zep4yrs', 'Lodestar — In development · Fengqiao zep4yrs'),
      description: z(
        'Lodestar 是枫桥开发中的作品。按展示边界，此处仅公开项目名称与仓库原始短描述。',
        'Lodestar is a work in development by Fengqiao. Within the disclosure boundary, only the project name and the repository’s original short description are shown.',
      ),
    },
    sections: [],
  },
]

/* ==========================================================================
   分野：按方向把作品归成几类，首屏页脚带据此报数
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

export const getWork = (slug: string): Work | undefined => works.find((w) => w.slug === slug)

export const getNeighbours = (slug: string): { prev?: Work; next?: Work } => {
  const i = works.findIndex((w) => w.slug === slug)
  if (i < 0) return {}
  return {
    prev: i > 0 ? works[i - 1] : undefined,
    next: i < works.length - 1 ? works[i + 1] : undefined,
  }
}