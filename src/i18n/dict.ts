export type Lang = 'zh' | 'en'

export const isLang = (v: unknown): v is Lang => v === 'zh' || v === 'en'

export interface Localized {
  zh: string
  en: string
}

/** 界面文案字典 — 中英各自自然撰写，非逐字直译 */
const ui = {
  zh: {
    switchLabel: '切换语言',
    brand: '枫桥',
    brandMark: 'zep4yrs',
    tagline: '保持热爱，奔赴山海。',
    siteTitle: 'Work · 枫桥 zep4yrs',
    siteSub: '个人数字作品档案',
    homeDescription:
      '枫桥（zep4yrs）的个人数字作品档案：收录 SiteLens、LanNook、BlueTidy、DiskSift、CTFHub、StructVis 等十件真实作品，按各自的公开边界呈现产品形态、界面与演进路径。保持热爱，奔赴山海。',
    skip: '跳到主要内容',

    navArchive: '作品档案',
    navAccess: '取用',
    navAbout: '关于',
    navMenu: '菜单',
    navClose: '收起',

    heroKicker: '作品档案',
    heroIndex: '共收录',
    heroUnit: '件作品',
    heroScroll: '向下浏览档案',
    heroRedraw: '重绘字标',

    playerLabel: '站内播放器',
    playerPlay: '播放',
    playerPause: '暂停',
    playerVolume: '音量',
    playerProgress: '播放进度',
    playerExpand: '展开播放器',
    playerCollapse: '收起播放器',
    playerNoTrack: '暂无曲目',
    playerHintShort: '未起播',
    playerIdleTitle: '站内曲目',
    playerIdleArtist: '枫桥 · 待收录',
    playerMissing: '音源未就绪 · 曲目稍后补上',
    playerNext: '下一首',

    archiveNum: '01',
    archiveTitle: '作品档案',
    archiveSub: '十件 · 逐件翻阅',
    archiveNoteLabel: '架构摘要 · GitDiagram',
    archiveFallbackLabel: '作品摘要',
    archiveOpen: '查看作品',
    archiveRestricted: '信息受限',

    accessNum: '02',
    accessTitle: '取用',
    accessSub: '在线体验与安装',
    accessDemo: '在线体验',
    accessDemoNote: '不装东西，打开就能用',
    accessInstall: '安装',
    accessInstallNote: '下载发布包，装到本机',
    accessOpen: '立即打开',
    accessDownload: '下载最新版',
    accessPending: '件仍在开发中，暂不提供取用入口',
    accessPendingCta: '见作品档案',

    aboutNum: '03',
    aboutTitle: '关于',
    aboutSub: '档案主人',
    aboutP1: '嗨，我是枫桥。ID 是 zep4yrs，大二在读。',
    aboutP2:
      '这个网站其实拖了挺久才做的。不是没想法，是一直觉得「等做得再好一点再搞吧」。后来想想，再等下去可能永远不会开始，干脆先弄出来算了。',
    aboutP3:
      '我想以一个开发者的视角，慢慢挤进大众的视野。不是那种一夜爆红或者追着热点跑的路子，就是按自己的节奏来，把一些真实的想法做成能用的东西。',
    aboutP4:
      '笔记和踩坑我写在博客那边了，这里主要放项目，还有一些脑子里转了挺久但还没做出来的东西。有些可能做到一半就卡住了，有些可能最后做出来也就自己用。但至少都是我真的在弄的。',
    aboutP5:
      '风口追不上，赶工期做出来的东西自己也不信。所以就想慢一点，做小一点，做完一点。我现在水平也一般，平时还要上课，时间不算多。但想早点把东西拿出来，听听真实的声音，总比一直憋着强。',
    aboutP6:
      '如果你路过，看到哪个项目觉得有点意思，或者你也在做类似的事，欢迎聊聊。就这样。',
    aboutPortraitAlt: '枫桥（zep4yrs）的插画肖像',
    aboutCopied: '已复制',
    contactWechat: '微信',
    aboutContactLabel: '联系方式',

    fieldNo: '编号',
    fieldYear: '年份',
    fieldStatus: '状态',
    fieldLicense: '许可',
    fieldStack: '语言',
    fieldVersion: '版本',
    fieldCategory: '分类',
    fieldLinks: '链接',
    fieldUpstream: '上游',

    statusPublic: '公开',
    statusPrivate: '私有',
    statusExperimental: '实验开发中',

    comingSoon: '敬请期待',
    comingSoonSub: '开发中',

    catSecurity: '安全工程',
    catDesktop: '桌面工具',
    catEducation: '教学可视化',
    catWeb: '在线工具',
    catGame: '游戏化学习',

    detailBack: '返回档案',
    detailPrev: '上一件',
    detailNext: '下一件',
    detailIndex: '作品索引',
    detailOnThisPage: '本页目录',
    decisionWhy: '为什么',
    decisionCost: '代价',
    readingLabel: '大众版',
    detailNotFoundTitle: '图纸上没有这一页',
    detailNotFoundBody: '这件作品不在当前档案中，或链接已经失效。',
    detailNotFoundCta: '回到档案首页',
    detailNoMedia: '该作品未提供可公开的界面素材，此处仅以档案图版呈现。',
    detailRestrictedTitle: '展示范围受限',
    detailRestrictedBody:
      '这件作品仍在开发中。按照作者的展示边界，此处仅公开项目名称与仓库原始短描述，不提供链接、截图或任何未经授权的信息。',

    footerNoteLabel: '档案说明',
    footerNote: '本档案由枫桥独立维护。源码托管于 GitHub、Gitee 与 CNB。',
    footerContactLabel: '联系方式',
    footerContactHint: '点按复制',
    footerRights: '保留所有权利',
    footerBuilt: 'React · Vite · TypeScript · 原生 CSS',
    notFoundTitle: '图纸上找不到这一页',
    notFoundBody: '这个地址不在档案里。回到首页重新翻一遍图版柜。',
    notFoundCta: '回到档案首页',
    loading: '正在取阅档案',
  },
  en: {
    switchLabel: 'Switch language',
    brand: 'Fengqiao',
    brandMark: 'zep4yrs',
    tagline: 'Keep the fire, run to the mountains and seas.',
    siteTitle: 'Work · Fengqiao zep4yrs',
    siteSub: 'A personal archive of works',
    homeDescription:
      'The personal archive of Fengqiao (zep4yrs): ten real works — SiteLens, LanNook, BlueTidy, DiskSift, CTFHub, StructVis and more — each shown within its own disclosure boundary, through product shape, interface and the route it took to get here.',
    skip: 'Skip to main content',

    navArchive: 'The Archive',
    navAccess: 'Access',
    navAbout: 'About',
    navMenu: 'Menu',
    navClose: 'Close',

    heroKicker: 'Works Archive',
    heroIndex: 'Holding',
    heroUnit: 'works',
    heroScroll: 'Scroll the archive',
    heroRedraw: 'Redraw the wordmark',

    playerLabel: 'Site player',
    playerPlay: 'Play',
    playerPause: 'Pause',
    playerVolume: 'Volume',
    playerProgress: 'Playback position',
    playerExpand: 'Expand player',
    playerCollapse: 'Collapse player',
    playerNoTrack: 'No track',
    playerHintShort: 'idle',
    playerIdleTitle: 'Site playlist',
    playerIdleArtist: 'Fengqiao · pending',
    playerMissing: 'No audio source yet · the playlist is coming',
    playerNext: 'Next track',

    archiveNum: '01',
    archiveTitle: 'The Archive',
    archiveSub: 'Ten works · one at a time',
    archiveNoteLabel: 'Architecture note · GitDiagram',
    archiveFallbackLabel: 'Work note',
    archiveOpen: 'View the work',
    archiveRestricted: 'Limited record',

    accessNum: '02',
    accessTitle: 'Access',
    accessSub: 'Try online or install',
    accessDemo: 'Try online',
    accessDemoNote: 'No install — open and use',
    accessInstall: 'Install',
    accessInstallNote: 'Download a release, run it locally',
    accessOpen: 'Open now',
    accessDownload: 'Download latest',
    accessPending: 'works are still in development, with no entry yet',
    accessPendingCta: 'See the archive',

    aboutNum: '03',
    aboutTitle: 'About',
    aboutSub: 'The keeper of this archive',
    aboutP1: 'Hi, I’m Fengqiao — zep4yrs online, a second-year undergraduate.',
    aboutP2:
      'This site took me a long time to finally build. Not for lack of ideas: I kept telling myself I’d do it once it got a little better. Then it occurred to me that waiting meant never starting, so I just went ahead and made it.',
    aboutP3:
      'I want to edge into a wider audience slowly, as a developer. Not the overnight-hit route, not chasing whatever is trending — just my own pace, turning a few honest ideas into things that actually work.',
    aboutP4:
      'Notes and the mistakes I run into live over on my blog. Here I keep the projects, plus a few things that have been turning over in my head for a while without shipping yet. Some stalled halfway; some may end up used by nobody but me. At least they’re all things I’m genuinely working on.',
    aboutP5:
      'I can’t keep up with the hype cycles, and anything rushed out under deadline is something I wouldn’t believe in myself. So: slower, smaller, finished. I’m still fairly average at this, I have classes to attend, and there isn’t much time. But getting things out early and hearing real responses beats holding everything in.',
    aboutP6:
      'If you happen to pass by and something here catches your eye — or you’re working on similar things — I’d love to talk. That’s it.',
    aboutPortraitAlt: 'An illustrated portrait of Fengqiao (zep4yrs)',
    aboutCopied: 'Copied',
    contactWechat: 'WeChat',
    aboutContactLabel: 'Contact',

    fieldNo: 'No.',
    fieldYear: 'Year',
    fieldStatus: 'Status',
    fieldLicense: 'License',
    fieldStack: 'Language',
    fieldVersion: 'Version',
    fieldCategory: 'Category',
    fieldLinks: 'Links',
    fieldUpstream: 'Upstream',

    statusPublic: 'Public',
    statusPrivate: 'Private',
    statusExperimental: 'In development',

    comingSoon: 'Coming soon',
    comingSoonSub: 'In development',

    catSecurity: 'Security',
    catDesktop: 'Desktop tools',
    catEducation: 'Learning visuals',
    catWeb: 'Web tools',
    catGame: 'Game learning',

    detailBack: 'Back to archive',
    detailPrev: 'Previous',
    detailNext: 'Next',
    detailIndex: 'Works index',
    detailOnThisPage: 'On this page',
    decisionWhy: 'Why',
    decisionCost: 'Cost',
    readingLabel: 'Plain-language version',
    detailNotFoundTitle: 'This plate is not on the drawing',
    detailNotFoundBody: 'That work is not in this archive, or the link no longer resolves.',
    detailNotFoundCta: 'Back to the archive',
    detailNoMedia:
      'No publishable interface material exists for this work; it is presented as an archive plate only.',
    detailRestrictedTitle: 'Limited record',
    detailRestrictedBody:
      'This work is still in development. Within the author’s disclosure boundary, only the project name and the repository’s original short description are shown — no links, no screenshots, no undisclosed detail.',

    footerNoteLabel: 'About this archive',
    footerNote: 'This archive is maintained independently by Fengqiao. Source is hosted on GitHub, Gitee and CNB.',
    footerContactLabel: 'Contact',
    footerContactHint: 'Click to copy',
    footerRights: 'All rights reserved',
    footerBuilt: 'React · Vite · TypeScript · Native CSS',
    notFoundTitle: 'This plate is not on the drawing',
    notFoundBody: 'That address is not in the archive. Head back and leaf through the cabinet again.',
    notFoundCta: 'Back to the archive',
    loading: 'Retrieving from the archive',
  },
} as const

export type UIKey = keyof (typeof ui)['zh']

export const dict = ui