# Cloudflare 路径路由：jiaxiantao.xyz → 多个 GitHub Pages 项目

**规范域名：裸域 `jiaxiantao.xyz`（不要用 www）。**  
`www.jiaxiantao.xyz` 会 **301** 到裸域，避免两套主机名各自缓存导致「加 www 样式就乱」。

目标：

| 访问 | 实际内容 |
|------|----------|
| `https://www.jiaxiantao.xyz/*` | **301 →** `https://jiaxiantao.xyz/*` |
| `https://jiaxiantao.xyz/` | **302 →** `/ai-my-home/`（必须，否则 basePath hydration 会丢样式） |
| `https://jiaxiantao.xyz/ai-my-home/` | `jiaxiantao.github.io/ai-my-home/` |
| `https://jiaxiantao.xyz/cos-design/` | `jiaxiantao.github.io/cos-design/` |
| `https://jiaxiantao.xyz/home-agent/` | `jiaxiantao.github.io/home-agent/` |
| `https://jiaxiantao.xyz/blogs/` | `jiaxiantao.github.io/blogs/` |
| … | 见 Worker 内 `PROJECT_PREFIXES` |

Worker 源码：[`cloudflare/site-path-router.worker.js`](../cloudflare/site-path-router.worker.js)

## 1. 仓库侧（已配置）

- 本站静态构建仍使用 `basePath=/ai-my-home`
- 规范站址：`https://jiaxiantao.xyz/ai-my-home`

## 2. GitHub Pages

**建议去掉**本仓库 Pages 里的 Custom domain（`www.jiaxiantao.xyz` / `jiaxiantao.xyz`）。

原因：多项目路径分流应由 Cloudflare Worker 做前端入口；GitHub 只保留：

- `https://jiaxiantao.github.io/ai-my-home/`
- `https://jiaxiantao.github.io/cos-design/`
- …

操作：仓库 → Settings → Pages → Custom domain → **Remove**。

## 3. Cloudflare DNS

| Type | Name | Content | Proxy |
|------|------|---------|--------|
| CNAME | `www` | `jiaxiantao.github.io` | **橙色云 Proxied**（必须） |
| CNAME 或 A/AAAA | `@` | 按 Cloudflare 提示指向 Pages/Worker 入口 | **橙色云 Proxied**（必须） |

橙云表示流量进 Cloudflare，Worker 才能接管。

## 4. 创建并绑定 Worker

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Create Worker**
2. 清空默认代码，粘贴 `cloudflare/site-path-router.worker.js` 全文 → **Deploy**
3. Worker → **Settings** → **Domains & Routes** → **Add route**
   - Route: `jiaxiantao.xyz/*`
   - Zone: `jiaxiantao.xyz`
   - 再加：`www.jiaxiantao.xyz/*`（用于 301 到裸域）

## 5. SSL

SSL/TLS → Overview → **Full**（源站 github.io 为 HTTPS）。

## 6. 验证

```bash
curl -sI https://www.jiaxiantao.xyz/ai-my-home/ | head   # 应 301 到裸域
curl -sI https://jiaxiantao.xyz/ | head                  # 应 302 到 /ai-my-home/
curl -sI https://jiaxiantao.xyz/ai-my-home/ | head
curl -sI https://jiaxiantao.xyz/cos-design/ | head
```

响应头可看到 `x-proxied-by: jiaxiantao-xyz-router`。

浏览器打开：

- https://www.jiaxiantao.xyz/ai-my-home/ （应跳到裸域）
- https://jiaxiantao.xyz/ai-my-home/
- https://jiaxiantao.xyz/cos-design/

## 7. 增加新项目

编辑 Worker 里 `PROJECT_PREFIXES`，增加例如 `"/new-repo"`，对应 GitHub Pages 路径 `/new-repo`，重新 Deploy。

## 8. 根路径资源（含旧 HTML 兼容）

Worker 会把站点根下的常见资源转发到默认站 `ai-my-home`：

- `/favicon.ico` → `/ai-my-home/favicon.ico`
- `/robots.txt` → `/ai-my-home/robots.txt`
- `/sitemap.xml` → `/ai-my-home/sitemap.xml`
- `/next-static/*`、`/_next/*`、`/resume/*`、`/models/*`、`/workers/*` → 加上 `/ai-my-home` 前缀

修改 Worker 后需在 Cloudflare 控制台重新粘贴部署，并建议：

1. Caching → Configuration → **Purge Everything**
2. 浏览器强制刷新（Cmd+Shift+R）

## 说明

- 这不是阿里云「备案 CDN」，而是 Cloudflare 边缘反代；国内访问通常比直连 `github.io` 好，但不保证所有网络都稳。
- 各子项目仍需自己在 GitHub 开启 Pages；Worker 只负责按路径转发。
- 本站 `metadataBase` 只用域名 origin；`basePath` 由 Next 自行拼接，避免 OG 图出现 `/ai-my-home/ai-my-home/...`。
