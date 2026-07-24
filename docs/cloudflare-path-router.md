# Cloudflare 路径路由：www.jiaxiantao.xyz → 多个 GitHub Pages 项目

目标：

| 访问 | 实际内容 |
|------|----------|
| `https://www.jiaxiantao.xyz/` | `jiaxiantao.github.io/ai-my-home/` |
| `https://www.jiaxiantao.xyz/ai-my-home/` | 同上 |
| `https://www.jiaxiantao.xyz/cos-design/` | `jiaxiantao.github.io/cos-design/` |
| `https://www.jiaxiantao.xyz/home-agent/` | `jiaxiantao.github.io/home-agent/` |
| … | 见 Worker 内 `PROJECT_PREFIXES` |

Worker 源码：[`cloudflare/site-path-router.worker.js`](../cloudflare/site-path-router.worker.js)

## 1. 仓库侧（已配置）

- 本站静态构建仍使用 `basePath=/ai-my-home`
- 规范站址：`https://www.jiaxiantao.xyz/ai-my-home`

## 2. GitHub Pages

**建议去掉**本仓库 Pages 里的 Custom domain（`www.jiaxiantao.xyz`）。

原因：多项目路径分流应由 Cloudflare Worker 做前端入口；GitHub 只保留：

- `https://jiaxiantao.github.io/ai-my-home/`
- `https://jiaxiantao.github.io/cos-design/`
- …

操作：仓库 → Settings → Pages → Custom domain → **Remove**。

## 3. Cloudflare DNS

`www` 记录：

| Type | Name | Content | Proxy |
|------|------|---------|--------|
| CNAME | `www` | `jiaxiantao.github.io` | **橙色云 Proxied**（必须） |

橙云表示流量进 Cloudflare，Worker 才能接管。

## 4. 创建并绑定 Worker

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Create Worker**
2. 清空默认代码，粘贴 `cloudflare/site-path-router.worker.js` 全文 → **Deploy**
3. Worker → **Settings** → **Domains & Routes** → **Add route**
   - Route: `www.jiaxiantao.xyz/*`
   - Zone: `jiaxiantao.xyz`
4. （可选）根域名也要：再加 `jiaxiantao.xyz/*`，并给 `@` 配好橙云记录

## 5. SSL

SSL/TLS → Overview → **Full**（源站 github.io 为 HTTPS）。

## 6. 验证

```bash
curl -sI https://www.jiaxiantao.xyz/ | head
curl -sI https://www.jiaxiantao.xyz/ai-my-home/ | head
curl -sI https://www.jiaxiantao.xyz/cos-design/ | head
```

响应头可看到 `x-proxied-by: jiaxiantao-xyz-router`。

浏览器打开：

- https://www.jiaxiantao.xyz/
- https://www.jiaxiantao.xyz/ai-my-home/
- https://www.jiaxiantao.xyz/cos-design/

## 7. 增加新项目

编辑 Worker 里 `PROJECT_PREFIXES`，增加例如 `"/new-repo"`，对应 GitHub Pages 路径 `/new-repo`，重新 Deploy。

## 说明

- 这不是阿里云「备案 CDN」，而是 Cloudflare 边缘反代；国内访问通常比直连 `github.io` 好，但不保证所有网络都稳。
- 各子项目仍需自己在 GitHub 开启 Pages；Worker 只负责按路径转发。
