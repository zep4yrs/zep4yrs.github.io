import type { Localized } from '../i18n/dict'

const z = (zh: string, en: string): Localized => ({ zh, en })

/**
 * 取用入口：一件作品怎么交到人手里。
 * 只登记已经核实存在的入口——在线体验是真能打开的网址，安装是真有发布包的仓库。
 * 没核实到的一律不写，宁可这件作品不在这一节里出现。
 */
export interface AccessRoute {
  slug: string
  url: string
  /** 入口落在哪台主机上，著录行右端要显示它 */
  host: string
  /** 交付形态 */
  form: Localized
}

/** 在线体验：浏览器里直接打开就能用，不装东西 */
export const demos: AccessRoute[] = [
  {
    slug: 'structvis',
    url: 'https://work.feng-qiao.top/struct/',
    host: 'work.feng-qiao.top',
    form: z('浏览器直接打开', 'Runs in the browser'),
  },
  {
    slug: 'ctfhub',
    url: 'https://zep4yrs.github.io/ctf-qiankun/',
    host: 'zep4yrs.github.io',
    form: z('浏览器直接打开', 'Runs in the browser'),
  },
]

/** 安装：下载发布包后装到本机运行 */
export const installs: AccessRoute[] = [
  {
    slug: 'sitelens',
    url: 'https://github.com/zep4yrs/sitelens/releases/latest',
    host: 'github.com',
    form: z('Windows 安装包 · 命令行', 'Windows installer · CLI'),
  },
  {
    slug: 'lannook',
    url: 'https://github.com/zep4yrs/lannook/releases/latest',
    host: 'github.com',
    form: z('Windows 安装包 · 手机浏览器接入', 'Windows installer · phone client'),
  },
  {
    slug: 'bluetidy',
    url: 'https://github.com/zep4yrs/BlueTidy/releases/latest',
    host: 'github.com',
    form: z('安装包 · 免安装包', 'Installer · portable zip'),
  },
  {
    slug: 'disksift',
    url: 'https://github.com/zep4yrs/DiskSift/releases/latest',
    host: 'github.com',
    form: z('Windows 安装包', 'Windows installer'),
  },
]