import { useEffect } from 'react'

const SITE = 'https://work.feng-qiao.top'

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/** 按 hreflang 维护语言互链，中英各自指向自己那一版 */
function upsertHreflang(hreflang: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${hreflang}"]`,
  )
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'alternate')
    el.setAttribute('hreflang', hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export interface SeoInput {
  title: string
  description: string
  path: string
  lang: 'zh' | 'en'
  image?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown>
}

/** 随语言与路由更新 title / description / Open Graph / canonical / html lang */
export function useSeo({ title, description, path, lang, image, type = 'website', jsonLd }: SeoInput) {
  useEffect(() => {
    const url = `${SITE}${path}`
    document.title = title
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: lang === 'zh' ? 'Work · 枫桥 zep4yrs' : 'Work · Fengqiao zep4yrs',
    })
    upsertMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: lang === 'zh' ? 'zh_CN' : 'en_US',
    })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })
    if (image) {
      const abs = image.startsWith('http') ? image : `${SITE}${image}`
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: abs })
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: abs })
    }
    upsertLink('canonical', url)

    // 语言互链，便于搜索引擎理解双语结构
    const altPath = lang === 'zh' ? path.replace(/^\/zh/, '/en') : path.replace(/^\/en/, '/zh')
    upsertHreflang(lang === 'zh' ? 'zh-CN' : 'en', url)
    upsertHreflang(lang === 'zh' ? 'en' : 'zh-CN', `${SITE}${altPath}`)
    upsertHreflang('x-default', `${SITE}${altPath}`)

    let script = document.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld]')
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute('data-seo-jsonld', '')
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }
  }, [title, description, path, lang, image, type, jsonLd])
}