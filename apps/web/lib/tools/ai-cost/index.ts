export interface ModelConfig {
  id: string;
  encoding: string;
  contextWindow: number;
  inputPer1M: number;
  outputPer1M: number;
}

export function calculateCost(params: {
  inputTokens: number;
  outputTokens: number;
  model: ModelConfig;
  requests: number;
}) {
  const { inputTokens, outputTokens, model, requests } = params;
  const perReq = {
    input: (inputTokens / 1_000_000) * model.inputPer1M,
    output: (outputTokens / 1_000_000) * model.outputPer1M,
    total:
      (inputTokens / 1_000_000) * model.inputPer1M +
      (outputTokens / 1_000_000) * model.outputPer1M,
  };
  return {
    perRequest: perReq,
    perDay: { ...perReq, total: perReq.total * requests },
    perMonth: { ...perReq, total: perReq.total * requests * 30 },
  };
}

/** Typical request: 1000 input + 250 output tokens (4:1 ratio) */
const DEFAULT_INPUT_TOKENS = 1000;
const DEFAULT_OUTPUT_TOKENS = 250;

export function calculateBudgetReverse(params: {
  model: ModelConfig;
  budgetPerMonth: number;
  inputTokensPerRequest?: number;
  outputTokensPerRequest?: number;
}) {
  const {
    model,
    budgetPerMonth,
    inputTokensPerRequest = DEFAULT_INPUT_TOKENS,
    outputTokensPerRequest = DEFAULT_OUTPUT_TOKENS,
  } = params;

  const costPerRequest =
    (inputTokensPerRequest / 1_000_000) * model.inputPer1M +
    (outputTokensPerRequest / 1_000_000) * model.outputPer1M;

  const requestsPerMonth =
    costPerRequest > 0 ? budgetPerMonth / costPerRequest : 0;

  return {
    inputTokensPerRequest,
    outputTokensPerRequest,
    costPerRequest,
    requestsPerMonth: Math.floor(requestsPerMonth),
    totalInputTokensPerMonth: Math.floor(
      requestsPerMonth * inputTokensPerRequest
    ),
    totalOutputTokensPerMonth: Math.floor(
      requestsPerMonth * outputTokensPerRequest
    ),
  };
}
