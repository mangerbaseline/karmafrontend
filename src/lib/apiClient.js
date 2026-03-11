export class ApiError extends Error {
  constructor(message, { status, requestId, errors, raw } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
    this.errors = errors;
    this.raw = raw;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function requestJson(url, { method = "GET", headers = {}, body, timeoutMs = 12000, signal } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  const mergedSignal = signal
    ? new AbortSignalAny([signal, ctrl.signal])
    : ctrl.signal;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
      signal: mergedSignal,
    });

    const requestId = res.headers.get("x-request-id") || res.headers.get("x-correlation-id") || null;
    const text = await res.text();

    const parse = () => {
      try { return text ? JSON.parse(text) : null; } catch { return null; }
    };

    const data = parse();

    if (!res.ok) {
      const msg = data?.message || data?.error || text || res.statusText || "Request failed";
      const errors = data?.errors || null;
      throw new ApiError(msg, { status: res.status, requestId, errors, raw: data ?? text });
    }

    return { data: data ?? null, status: res.status, requestId };
  } finally {
    clearTimeout(timer);
  }
}

// Minimal AbortSignal "any" polyfill for browsers that don't support AbortSignal.any
class AbortSignalAny {
  constructor(signals) {
    const ctrl = new AbortController();
    for (const s of signals) {
      if (!s) continue;
      if (s.aborted) {
        ctrl.abort();
        break;
      }
      s.addEventListener("abort", () => ctrl.abort(), { once: true });
    }
    return ctrl.signal;
  }
}

export async function requestJsonWithRetry(url, opts = {}) {
  const retryOn = new Set([429, 503]);
  const maxRetries = opts.maxRetries ?? 2;
  let attempt = 0;
  while (true) {
    try {
      return await requestJson(url, opts);
    } catch (e) {
      attempt += 1;
      if (!(e instanceof ApiError) || !retryOn.has(e.status) || attempt > maxRetries) throw e;
      const backoff = 300 * attempt;
      await sleep(backoff);
    }
  }
}
