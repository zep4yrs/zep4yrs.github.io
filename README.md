# 四时工坊 · 官网

四时工坊（Four Seasons Workshop）的官方网站 —— 独立软件工作室，桌面开发、安全工程、教学可视化、游戏化学习。九个项目，四季不歇。

线上地址：**[work.feng-qiao.top](https://work.feng-qiao.top)**（GitHub Pages，仓库 `zep4yrs.github.io`）

## 站点结构

| 页面 | 说明 |
|---|---|
| `index.html` | 首页：巨型标题 + 3D 四季同心环（Three.js）+ 项目矩阵 + 生态 + 关于 |
| `projects.html` | 项目清单（可筛选） |
| `capabilities.html` | 六个技术方向 |
| `pipeline.html` | 项目管线甘特图 |
| `bulletin.html` | 工坊动态公告（RSS: `feed.xml`） |
| `about.html` | 关于工坊 + 历程时间线 |
| `contact.html` | 联系渠道 |
| `demos.html` | 在线体验入口汇总 |
| `<项目名>.html` ×8 | 项目详情页（bluetidy / lannook / ctf-qiankun / autopen / alertzero / cryptovis / structvis / stellar） |
| `404.html` | 404「图纸找不到这张图」 |
| `logo-lab.html` | 内部工具：logo 比稿页（不进导航） |

## 样式系统

```
assets/css/
├── siji.css        # 首页设计系统「稿纸画布」：暖纸方格底 + 墨色巨字 + 荧光笔导航
├── siji-subs.css   # 子页重主题层：加载在 mimo.css 之后，把旧壳层重新映射到稿纸画布
├── mimo.css        # 旧共享壳层（notice/nav/hero 骨架/卡片结构），被 siji-subs 重主题
├── project.css     # 项目详情页结构（每页 theme-* 变量定义项目主题色 --proj）
├── search.css      # pagefind 搜索浮层
└── fonts.css       # 本地子集字体（Noto Serif SC / Sarasa Mono SC）
```

- 设计令牌集中在 `siji.css` 与 `siji-subs.css` 的 `:root`：纸色 `#FAF6EC`、墨色 `#1A1A1A`、金色点睛 `#F5C445`
- 项目主题色在 `project.css` 顶部：每页 `body.theme-*` 定义 `--proj` / `--proj-bg`
- 页面 logo：`assets/svg/logo-zep4yrs.svg`（四季同心环 2D 印记），favicon/PWA 共用

## 行为脚本

```
assets/js/
├── siji.js     # 首页：惯性平滑滚动、滚动显现、荧光笔锚点跟踪、轻视差
├── mimo.js     # 子页共享：导航、滚动监听、自定义动效
└── search.js   # pagefind 搜索初始化
```

## 本地预览

```bash
python -m http.server 8932
# 打开 http://127.0.0.1:8932
```

无构建步骤，纯静态。Service Worker（`sw.js`）做离线缓存，改动样式后记得更新 `CACHE` 版本号。

## 新增一个项目页

1. 复制任一 `bluetidy.html`，改 `<title>` / OG / canonical / 正文
2. 在 `project.css` 顶部加一行 `body.theme-<名称> { --proj: <主题色>; --proj-bg: rgba(...0.06); }`
3. 在 `projects.html` 的矩阵和 `index.html` 的产品列表里加卡片
4. 需要分享图就放一张 1200×630 到 `assets/og/og-<名称>.png`

## 更新日志

见 [CHANGELOG.md](CHANGELOG.md)。
