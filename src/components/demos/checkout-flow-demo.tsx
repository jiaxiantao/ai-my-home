"use client";

import { useReducer } from "react";

import {
  checkoutReducer,
  checkoutSteps,
  type CheckoutStepId,
} from "@/lib/checkout-flow-machine";

const initialState = {
  step: "cart" as CheckoutStepId,
  errors: [] as string[],
  history: ["cart"] as CheckoutStepId[],
};

export function CheckoutFlowDemo() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const current = checkoutSteps.find((item) => item.id === state.step);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="grid gap-3">
        {checkoutSteps.map((step, index) => {
          const isActive = step.id === state.step;
          const isPast =
            checkoutSteps.findIndex((item) => item.id === state.step) > index;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  isActive
                    ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                    : isPast
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                      : "border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                {index + 1}
              </div>
              <article
                className={`flex-1 rounded-2xl border p-4 ${
                  isActive
                    ? "border-cyan-300/30 bg-cyan-300/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="font-semibold text-white">{step.label}</p>
                <p className="mt-1 text-sm text-slate-400">{step.action}</p>
              </article>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">
          useReducer 状态机
        </p>
        <p className="mt-3 text-sm text-slate-300">
          当前：<span className="font-mono text-cyan-100">{state.step}</span>
        </p>
        {current ? (
          <p className="mt-2 text-sm text-slate-400">动作：{current.action}</p>
        ) : null}

        {state.errors.length ? (
          <ul className="mt-4 space-y-2 text-sm text-rose-200">
            {state.errors.map((error) => (
              <li key={error}>· {error}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "BACK" })}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300"
          >
            上一步
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "NEXT" })}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            下一步
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300"
          >
            重置
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs text-slate-500">history</p>
          <p className="mt-2 font-mono text-xs leading-6 text-slate-400">
            {state.history.join(" → ")}
          </p>
        </div>
      </div>
    </div>
  );
}
