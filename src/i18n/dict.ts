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
    brandRole: '独立开发者 · 安全工程 / 桌面工具 / 教学可视化',
    tagline: '保持热爱，奔赴山海。',
    siteTitle: 'Work · 枫桥 zep4yrs',
    siteSub: '个人数字作品档案',
    homeDescription:
      '枫桥（zep4yrs）的个人数字作品档案：收录 SiteLens、LanNook、BlueTidy、DiskSift、CTFHub、StructVis 等十件真实作品，按各自的公开边界呈现产品形态、界面与演进路径。保持热爱，奔赴山海。',
    skip: '跳到主要内容',

    navArchive: '作品档案',
    navLines: '脉络',
    navAbout: '关于',
    navContact: '联系',
    navMenu: '菜单',
    navClose: '收起',

    heroKicker: '作品档案',
    heroIndex: '共收录',
    heroUnit: '件作品',
    heroScroll: '向下浏览档案',

    archiveNum: '01',
    archiveTitle: '作品档案',
    archiveSub: '图版柜 · 十件',
    archiveHint: '选择一件作品，在图版柜中查看它',
    archiveIndexLabel: '档案索引',
    archivePlateLabel: '当前图版',
    archiveDataLabel: '图版著录',
    archiveOpen: '查看作品',
    archiveRestricted: '信息受限',
    archiveKeyboard: '↑ ↓ 切换 · Enter 打开',

    linesNum: '02',
    linesTitle: '作品脉络',
    linesSub: '关系与分野',
    linesNote: '同一片工作台上，五条脉络彼此呼应。连线表示真实的技术与主题关联。',

    aboutNum: '03',
    aboutTitle: '关于',
    aboutSub: '档案主人',
    aboutP1:
      '枫桥，英文标识 zep4yrs。独立开发者，长期在做安全工程、桌面工具与教学可视化这几件事。',
    aboutP2:
      '这个档案收录了十件作品。GitHub、Gitee 与 CNB 记录实现的过程，这里记录作品最终的样子——产品形态、视觉结果，以及它们各自走到今天的路径。',
    aboutP3:
      '每一件作品都按它真实的公开边界呈现：公开的写全，实验中的如实标注，私有的只留下名字与仓库的原始描述。',
    aboutNameLabel: '标识',
    aboutFieldLabel: '方向',
    aboutCountLabel: '收录',
    contactNum: '04',
    contactTitle: '联系',
    contactSub: '源码与分发',

    fieldYear: '年份',
    fieldStatus: '状态',
    fieldVersion: '版本',
    fieldCategory: '脉络',
    fieldLinks: '链接',
    fieldUpstream: '上游',

    statusPublic: '公开',
    statusPrivate: '私有',
    statusExperimental: '实验开发中',

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
    detailNotFoundTitle: '图纸上没有这一页',
    detailNotFoundBody: '这件作品不在当前档案中，或链接已经失效。',
    detailNotFoundCta: '回到档案首页',
    detailNoMedia: '该作品未提供可公开的界面素材，此处仅以档案图版呈现。',
    detailRestrictedTitle: '展示范围受限',
    detailRestrictedBody:
      '这是一件私有作品。按照作者的展示边界，此处仅公开项目名称与仓库原始短描述，不提供链接、截图或任何未经授权的信息。',

    footerNote: '本档案由枫桥独立维护。源码托管于 GitHub、Gitee 与 CNB。',
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
    brandRole: 'Independent developer · Security engineering / Desktop tools / Learning visuals',
    tagline: 'Keep the fire, run to the mountains and seas.',
    siteTitle: 'Work · Fengqiao zep4yrs',
    siteSub: 'A personal archive of works',
    homeDescription:
      'The personal archive of Fengqiao (zep4yrs): ten real works — SiteLens, LanNook, BlueTidy, DiskSift, CTFHub, StructVis and more — each shown within its own disclosure boundary, through product shape, interface and the route it took to get here.',
    skip: 'Skip to main content',

    navArchive: 'Archive',
    navLines: 'Threads',
    navAbout: 'About',
    navContact: 'Contact',
    navMenu: 'Menu',
    navClose: 'Close',

    heroKicker: 'Works Archive',
    heroIndex: 'Holding',
    heroUnit: 'works',
    heroScroll: 'Scroll the archive',

    archiveNum: '01',
    archiveTitle: 'The Archive',
    archiveSub: 'Plate cabinet · Ten',
    archiveHint: 'Pick a work to bring its plate forward',
    archiveIndexLabel: 'Index',
    archivePlateLabel: 'Plate',
    archiveDataLabel: 'Record',
    archiveOpen: 'Open the case',
    archiveRestricted: 'Limited record',
    archiveKeyboard: '↑ ↓ to browse · Enter to open',

    linesNum: '02',
    linesTitle: 'Threads',
    linesSub: 'How the work connects',
    linesNote:
      'Five threads share one workbench. Lines mark real technical and thematic links between works.',

    aboutNum: '03',
    aboutTitle: 'About',
    aboutSub: 'The keeper of this archive',
    aboutP1:
      'Fengqiao, known online as zep4yrs. An independent developer working mainly on security engineering, desktop tools and learning visuals.',
    aboutP2:
      'This archive holds ten works. GitHub, Gitee and CNB record how they were built; this is where the finished shape lives — the product, the visuals, and the route each one took to get here.',
    aboutP3:
      'Every work is shown within its real disclosure boundary: public ones in full, experimental ones labelled as such, private ones kept to a name and the repository’s own description.',
    aboutNameLabel: 'Mark',
    aboutFieldLabel: 'Focus',
    aboutCountLabel: 'Holding',
    contactNum: '04',
    contactTitle: 'Contact',
    contactSub: 'Source & distribution',

    fieldYear: 'Year',
    fieldStatus: 'Status',
    fieldVersion: 'Version',
    fieldCategory: 'Thread',
    fieldLinks: 'Links',
    fieldUpstream: 'Upstream',

    statusPublic: 'Public',
    statusPrivate: 'Private',
    statusExperimental: 'In development',

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
    detailNotFoundTitle: 'This plate is not on the drawing',
    detailNotFoundBody: 'That work is not in this archive, or the link no longer resolves.',
    detailNotFoundCta: 'Back to the archive',
    detailNoMedia:
      'No publishable interface material exists for this work; it is presented as an archive plate only.',
    detailRestrictedTitle: 'Limited record',
    detailRestrictedBody:
      'This is a private work. Within the author’s disclosure boundary, only the project name and the repository’s original short description are shown — no links, no screenshots, no undisclosed detail.',

    footerNote: 'This archive is maintained independently by Fengqiao. Source is hosted on GitHub, Gitee and CNB.',
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