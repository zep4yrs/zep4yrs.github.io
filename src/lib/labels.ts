import type { UIKey } from '../i18n/dict'
import type { LinkKind, WorkCategory, WorkStatus } from '../data/works'

const STATUS: Record<WorkStatus, UIKey> = {
  public: 'statusPublic',
  private: 'statusPrivate',
  experimental: 'statusExperimental',
}

const CATEGORY: Record<WorkCategory, UIKey> = {
  security: 'catSecurity',
  desktop: 'catDesktop',
  education: 'catEducation',
  web: 'catWeb',
  game: 'catGame',
}

export const statusKey = (s: WorkStatus): UIKey => STATUS[s]
export const categoryKey = (c: WorkCategory): UIKey => CATEGORY[c]

/** 平台专名保持原文，不随语言变化 */
export const LINK_LABEL: Record<LinkKind, string> = {
  github: 'GitHub',
  gitee: 'Gitee',
  cnb: 'CNB',
}