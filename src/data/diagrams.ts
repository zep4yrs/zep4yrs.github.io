import type { Localized } from '../i18n/dict'

/** GitDiagram 从仓库文件树、README 与抽样源码生成的架构概览。
 *  仅公开仓库有这一项；未收录的作品在档案里回落到作品自身的描述。 */
export const diagrams: Record<string, Localized> = {
  sitelens: {
    zh: 'SiteLens 是一台漏洞验证与攻击面扫描产品，以 CLI 与内嵌 Web 控制台（并带桌面外壳）交付。核心流程是：校验目标、抓取并指纹识别 Web 内容、执行验证与枚举阶段、关联漏洞情报，最终返回有证据支撑的结论。README 记录了完整的扫描阶段；抽样源码确认了编排逻辑与可热插拔的单次扫描数据快照，但没有暴露每一个阶段调用，因此连线只呈现有据可查的编排，不臆测内部接线。',
    en: 'SiteLens is a vulnerability verification and attack-surface scanning product, delivered through CLI and an embedded web console (with a desktop shell). Its central workflow validates a target, gathers and fingerprints web content, runs verification and enumeration stages, correlates vulnerability intelligence, and returns evidence-backed findings. The README documents the full scan stages; sampled engine source confirms orchestration and hot-swappable per-scan data snapshots, but does not expose every stage call. Edges therefore show documented orchestration without guessing internal wiring.',
  },
  bluetidy: {
    zh: 'BlueTidy 是一款 Windows 桌面工具，用来理解磁盘占用并安全地治理软件资产。用户从仪表盘出发，扫描软件或某个文件夹，查看体积与风险证据，然后可选地预演清理或迁移，并保留回滚记录。文件夹工作流还支持带缓存的目录树浏览、CSV 导出与快照比对。README 记录了这些产品能力；后端内部仅以只读方式索引，因此指向内部的连线只限于已记录的关系，而不是推断出的调用链。',
    en: 'BlueTidy is a Windows desktop tool for understanding disk usage and safely governing software assets. Users start from the dashboard, scan software or a folder, review size and risk evidence, then optionally preflight cleanup or migration and retain a rollback record. The folder workflow also supports cached tree exploration, CSV export, and snapshot comparison. The README documents these product capabilities; backend internals are only indexed as read, so links into those internals are limited to documented relationships rather than inferred call chains.',
  },
  disksift: {
    zh: 'DiskSift 是一款基于 Tauri 的桌面磁盘占用浏览器与安全优先的清理工具。主流程是：扫描卷、浏览容量地图与目录树、给目录分类，然后清理或迁移选中的数据并复核撤销记录。README 还记录了 AI 建议、脚本管理、Steam 检查、排除规则与定时安全巡检。抽样源码确认了扫描、建议、Steam 检查、监控与迁移的行为；若干 Rust 命令与未抽样的子系统，只按 README 已记录的部分呈现。',
    en: 'DiskSift is a Tauri desktop disk-usage explorer and safety-focused cleanup tool. The main workflow is scan a volume, explore its size map/tree, classify directories, then clean or migrate selected data and review undo records. The README also documents AI advice, script management, Steam inspection, exclusions, and scheduled safe-only patrols. Sampled source confirms scanner, advisor, Steam inspection, monitoring, and migration behavior; wiring for several Rust commands and unsampled subsystems is represented only where the README documents it.',
  },
  structvis: {
    zh: 'StructVis 是一套跑在浏览器里的学习环境，用来学数据结构、算法与 MySQL 概念。学习者浏览课程目录、打开一节课，逐步操作交互式可视化；SQL 课程还能在本地执行脚本或学习者自己写的查询。练习、进度追踪、复习与报告延伸了这条学习回路。README 记录了播放器流水线与主要能力；抽样源码片段展示了引擎行为，但没有覆盖每条路由与集成调用，因此不确定的连线一律省略。',
    en: 'StructVis is a browser-based learning environment for data structures, algorithms, and MySQL concepts. Learners browse the course catalog, open a lesson, and step through an interactive visualization; SQL lessons can also execute scripts or learner-written queries locally. Practice, progress tracking, review, and reporting extend that learning loop. The README documents the player pipeline and major capabilities; the sampled source excerpts show engine behavior, but not every route or integration call, so uncertain wiring is omitted.',
  },
  lannook: {
    zh: 'LanNook 是一款以桌面端为主机、面向局域网的传文件产品，手机端用浏览器接入。主流程是：桌面端启动局域网服务，给出二维码 / 地址或配对 PIN；手机连上后可能需要桌面端确认；任意一方发起传文件；主机负责传输与本地留存；两端都能看到实时状态与传输历史。图里还包含设备发现、断点续传、诊断、设置与桌面原生控制。后端细节只做了部分抽样，因此有些已记录的关系并未经过源码级验证。',
    en: 'LanNook is a desktop-hosted, local-network file-transfer product with a browser-based mobile client. The main workflow is: the desktop starts its LAN service and shares a QR/address or pairing PIN; a phone connects and may require desktop approval; either side sends files; the host handles transfer and local persistence; both clients see live status and transfer history. The graph includes device discovery, resumable transfer, diagnostics, settings, and native desktop controls. Backend details are only partly sampled, so some documented links are shown without source-level verification.',
  },
  ctfhub: {
    zh: 'CTF 乾坤袋是一个纯浏览器端的 CTF 与安全分析工具箱；README 说明输入默认在本地处理，也没有描述任何服务端 API。主流程是：按分类或搜索浏览、选定工具、喂入文本或文件、执行一次操作、查看结果。源码索引确认了工作台页面的组成与侧栏搜索；README 记录了智能编解码、操作链、工具手册与各大工具族。部分运行时接线未抽样，因此这些连线被省略或标注为未验证。',
    en: 'CTF 乾坤袋 is a browser-side CTF and security-analysis toolbox; the README says inputs are processed locally by default and describes no server API. The main flow is category/search browsing, choosing a tool, supplying text or files, executing an operation, and viewing results. The source index confirms the workbench page composition and sidebar search; README capabilities preserve smart codec, operation chains, tool manuals, and broad tool families. Some runtime wiring is unsampled, so those links are omitted or marked unverified.',
  },
}
