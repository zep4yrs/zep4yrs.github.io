# 详情页改版 · 面向开发者的技术页

> 本文是这次改版的唯一规格来源。上下文被压缩后，先读这里，不要再向用户重复确认已经定下的决策。

## 0. 背景

- 大众向的介绍已经写在博客 <https://blog.feng-qiao.top>，详情页不再重复「这是什么、能干嘛、怎么装」。
- 详情页改为**技术页**：写工程取舍（选了什么 / 为什么 / 代价在哪）、已知边界与限制、可核验的读数。
- 与博客的分工：详情页负责工程判断与边界，博客负责科普与使用；详情页末尾统一指路到博客对应文章。

## 1. 范围

**本轮改写的 6 件**（有公开仓库）：

| slug | 仓库 | 页首许可 | 页首语言 |
| --- | --- | --- | --- |
| `sitelens` | `zep4yrs/sitelens` | GPL-3.0 | Go · TypeScript |
| `lannook` | `zep4yrs/lannook` | GPL-3.0-only | Rust · TypeScript |
| `bluetidy` | `zep4yrs/BlueTidy` | MIT | Rust · TypeScript |
| `disksift` | `zep4yrs/DiskSift` | GPL-3.0-or-later | Rust · TypeScript |
| `ctfhub` | `zep4yrs/ctf-qiankun` | MIT | TypeScript |
| `structvis` | `zep4yrs/struct` | GPL-3.0-only | TypeScript · Svelte |

**不改的 4 件**：`cryptovis`、`alertzero`（实验开发中）、`binsight`、`lodestar`（展示受限）。它们没有可公开的仓库证据，维持现状。

## 2. 内容主轴

正文由「概览 / 为什么 / 核心能力 / 架构」这套大众写法，重组为下面这条开发者轴：

```
01 概览      一段，交代它是什么、给谁用。不超过 2 段。
02 取舍      核心章节。每条 = 选了什么 / 为什么 / 代价。3–5 条。
03 边界      不做的事、已知限制、非目标。这是可信度的来源。
04 读数      可核验的数字：包数、测试数、语言占比、许可、版本、CI 门禁。
05 演进      版本轨迹，压缩保留（有真实版本横幅/路线图的才配图）。
06 大众版    一条 reading 卡片，指向博客对应文章。
```

规则：

- **取舍**是主轴，不是补充。每条必须能落到仓库里的证据（README 的设计段落、docs/、CHANGELOG、清单文件、CI 配置）。
- **代价**必须真写。写不出代价的条目不算取舍，删掉。
- **边界**与「能力」分开。它读起来不是优点，是约束。
- 不写「强大」「高效」「优雅」这类形容词；用数字和事实代替。
- 中文自然撰写，English 独立撰写，不逐字直译。

## 3. 数据模型（`src/data/works.ts`）

已扩展，保持：

```ts
interface Decision { choice: Localized; why: Localized; cost: Localized }
interface Reading  { label: Localized; url: string; note: Localized }

interface Section {
  // 原有
  id; label; title; body?; bullets?; facts?; gallery?; note?; upstream?
  // 新增
  decisions?: Decision[]   // 取舍条目
  limits?: Localized[]     // 已知限制与非目标
  reading?: Reading        // 站外大众版指路
}

interface Work {
  // 新增
  license?: string         // SPDX，进页首著录条
  stack?: Localized        // 仓库语言占比，进页首著录条
}
```

## 4. 页面结构（`src/pages/WorkDetail.tsx`）

1. 页首著录条新增两项：**许可**、**语言**（`license` / `stack`），排在「状态」之后。
2. 章节正文按 `upstream → decisions → limits → body → bullets → facts → gallery → note → reading` 顺序渲染。
   - `decisions` 渲染为取舍块：每条一张条目，`choice` 作小标题，`why` / `cost` 各一行，带 `WHY` / `COST` 等宽前缀。
   - `limits` 渲染为边界列表，与 `bullets` 视觉区分（不用强调色短横，改用「—」与更暗的墨色）。
   - `reading` 渲染为指路卡，带外链箭头（`.lk` + `.arw[data-dir=ne]`）。
3. 目录（`.detail-toc`）沿用，章节数变多不影响。

## 5. 制图纸背景（中度：共享纸 + 制图家具）

**不推倒全站的方格纸**（`--tile` 那套，见 `layout.css` 的 `main::before`）。详情页在它之上加制图家具，让这一页读起来像一张制图纸，但和首页仍是同一张纸。

五件家具：

1. **标尺带** — 版面左右两侧各一道纵向刻度，贴在内容列之外。
   - 细刻每 `calc(var(--tile) * 2)`，长刻每 `calc(var(--tile) * 10)`；用 `repeating-linear-gradient` 绘制，不占 DOM。
   - 只在宽屏（≥ 1180px）出现；窄屏收掉，避免和内容抢宽度。
2. **剖切标记** — 每个 `.dsec-head` 的引导虚线两端加短竖档，右端挂一枚等宽编号（`A—A` / `B—B` 形式），与章节序号并存。
3. **套准角标** — 强化已有的 `.corner`（`plate-corners`）为图纸式套准角标（角上十字 + 直角），仅用 `--line-strong` 与 `--accent-line`。
4. **分区重线** — 章节分隔线（`.dsec` 的 `border-top`）升级为制图分区线：主线 + 两端刻度，区分于普通的发丝线。
5. **图框** — 详情页正文外一道细图框，四角带角标；右下角一枚标题栏，用现有著录语汇著录「图号 / 许可 / 语言 / 版本」。

配色只用现有令牌：`--line`、`--line-soft`、`--line-strong`、`--accent-line`、`--accent`、`--ink-16/28`。禁止引入新的深色底。

## 6. 交互原语（沿用，不新增）

全站只有五种，详情页也只用这五种：

- `.lk` 著录链接（等宽字 + 发丝下划线 + 随字箭头）
- `.tlink` 题名链接（整条标题可点）
- `.rowlink` 行内键
- `.ctl` 方印控件
- `.arw` 箭头（位移统一取 `--arw`）

## 7. 事实边界（硬约束）

- 取舍、边界、读数**全部来自真实仓库**，不得虚构功能、架构、版本、性能、开发经历。
- 数不清的数字宁可写区间或省略，不写「大约」「数十个」这种含糊表述。
- 找不到某类证据（如仓库没有设计文档），就少写一条取舍，不编。
- 上游归属（DiskSift → Pinkbin）必须在正文里明确，不淡化。

## 8. 进度清单

- [x] 调研 6 个仓库的真实工程证据
- [x] 重写 6 件作品的详情内容
- [x] `WorkDetail.tsx` 渲染 `decisions` / `limits` / `reading` 与页首 `license` / `stack`
- [x] 制图纸背景与新版块样式（`detail.css`）
- [x] 文案补进 `dict.ts`
- [x] 构建与类型检查通过

## 9. 落地记录与两处口径说明

**博客对应文章**：只有 4 件有大众版文章，已挂 `reading`：

| slug | 博客文章 |
| --- | --- |
| `sitelens` | SiteLens 站点透视：从实训作业到全流程 Web 扫描器 |
| `lannook` | LanNook：在局域网里，把手机和电脑真正连起来 |
| `bluetidy` | BlueTidy 0.2.0：先看清空间，再安全处理 |
| `disksift` | DiskSift v26.1.4.0：给磁盘清理装上实时监控和迁移引擎 |

`ctfhub` 与 `structvis` 博客没有对应文章，**不挂 `reading`**，不编造站外链接。

**两处口径**（都已按真实仓库落定，后续勿改回）：

1. **StructVis 渲染器数**：README 与 CI 的 check-docs 口径为 **22 类**（源码派生，门禁校验），`visualization/` 目录下另有 21 个渲染器子目录 + `CanvasHost.svelte` 等。对外统一取 **22 类**。
2. **StructVis 版本**：`package.json` 为 `2.0.0`，故页首 `version` 取 `v2.0.0`；仓库**没有 GitHub Release**，标签为 `visual-v3` / `visual-pre-v3` / `v1.0.0`。读数区单列一行「发布 · 无 GitHub Release」据实著录。