import type { Metadata } from "next";

import { AdminAuthPanel } from "@/components/admin-auth-panel";

export const metadata: Metadata = {
  title: "Admin Login | XJ / Frontend Systems",
  description: "管理员登录与 Token 鉴权入口",
};

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-8 lg:py-14">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          管理员登录
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          未登录时按游客访问，仅可浏览。登录后会下发 Token，允许调用数据库写入接口。
        </p>
      </section>
      <AdminAuthPanel />
    </main>
  );
}
