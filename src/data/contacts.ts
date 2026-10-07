/** 去向：能开页面的走链接，开不了的（QQ / 微信）点按把号码交到剪贴板 */
export type Contact = { icon: string; label: string; value?: string; url?: string }

export const CONTACTS: Contact[] = [
  { icon: 'github', label: 'GitHub', value: 'zep4yrs', url: 'https://github.com/zep4yrs' },
  { icon: 'gitee', label: 'Gitee', value: 'Map1eBr1dge', url: 'https://gitee.com/Map1eBr1dge' },
  { icon: 'cnb', label: 'CNB', value: 'feng-qiao', url: 'https://cnb.cool/feng-qiao' },
  { icon: 'mail', label: 'Email', value: 'fengqiao@agent.qq.com', url: 'mailto:fengqiao@agent.qq.com' },
  { icon: 'qq', label: 'QQ', value: '3909729954' },
  { icon: 'wechat', label: 'WeChat', value: 'AlwmaofsHdeep' },
]