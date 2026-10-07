/* 旧站（四时工坊）曾注册过一个名为 zep4yrs-v1 的 Service Worker，拦截本站所有 GET
   请求，缓存清单里还存着旧站的 / 与 /index.html。新站不再使用 Service Worker，但访问者
   浏览器里那个旧的会一直赖着：音频的 Range 请求经它转发会报「未知错误」，页面也被拖着
   变慢，打开首页还可能拿到旧站页面。

   这个文件唯一的作用就是把它清掉 —— 清空所有缓存、注销自己、再让已打开的页面重载一次。
   浏览器在导航时会为同作用域的脚本做更新检查（这一过程不经过旧 SW 本身），拿到本文件
   后即可立即接管并自毁。本站不注册任何 Service Worker，所以它执行完就永久沉默，不会
   再被激活。 */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.clients.claim()
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) client.navigate(client.url)
    })(),
  )
})