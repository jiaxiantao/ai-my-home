export type CheckoutStepId = "cart" | "shipping" | "payment" | "done";

export type CheckoutEvent =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET" };

export type CheckoutContext = {
  step: CheckoutStepId;
  errors: string[];
  history: CheckoutStepId[];
};

const stepOrder: CheckoutStepId[] = ["cart", "shipping", "payment", "done"];

export function checkoutReducer(
  state: CheckoutContext,
  event: CheckoutEvent,
): CheckoutContext {
  if (event.type === "RESET") {
    return { step: "cart", errors: [], history: ["cart"] };
  }

  if (event.type === "BACK") {
    const index = stepOrder.indexOf(state.step);

    if (index <= 0) {
      return state;
    }

    const step = stepOrder[index - 1];
    return {
      ...state,
      step,
      errors: [],
      history: [...state.history, step],
    };
  }

  const errors = validateStep(state.step);

  if (errors.length) {
    return { ...state, errors };
  }

  const index = stepOrder.indexOf(state.step);

  if (index >= stepOrder.length - 1) {
    return state;
  }

  const step = stepOrder[index + 1];

  return {
    step,
    errors: [],
    history: [...state.history, step],
  };
}

function validateStep(step: CheckoutStepId) {
  if (step === "cart") {
    return [];
  }

  if (step === "shipping") {
    return [];
  }

  if (step === "payment") {
    return [];
  }

  return [];
}

export const checkoutSteps: Array<{
  id: CheckoutStepId;
  label: string;
  action: string;
}> = [
  { id: "cart", label: "购物车", action: "校验 SKU / 库存" },
  { id: "shipping", label: "配送", action: "地址 + 运费规则" },
  { id: "payment", label: "支付", action: "创建预下单 + 风控" },
  { id: "done", label: "完成", action: "落库订单 + 推送" },
];
